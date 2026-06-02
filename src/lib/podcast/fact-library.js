/**
 * Verified Fact Library — Doctor Farmer MagicScript Pipeline
 *
 * Persists to localStorage so the pipeline never re-researches the same
 * medical claim twice. Facts older than FACT_TTL_DAYS are treated as stale
 * and force a live Gemini re-search.
 *
 * Schema per fact:
 *   id            — unique string
 *   topicTags     — string[] — 2–4 extracted keywords (multi-tag for overlap queries)
 *   claimText     — the exact factual claim text
 *   grade         — "GREEN" | "YELLOW"  (RED/BLUE are never stored)
 *   sourceText    — citation / journal / PMID string
 *   evidenceLevel — "Grade A — RCT" etc. from Stage 4
 *   scriptRule    — YELLOW script rule (may be null for GREEN)
 *   dateVerified  — ISO timestamp string
 */

const STORAGE_KEY   = "DR_FARMER_FACT_LIBRARY_v1";
const FACT_TTL_DAYS = 365;

// ── Stop words that add no retrieval value ────────────────────────────────────
const STOP_WORDS = new Set([
  "and", "or", "the", "a", "an", "of", "for", "in", "on", "with",
  "your", "how", "why", "what", "when", "where", "who", "which",
  "is", "are", "was", "were", "be", "been", "being",
  "to", "its", "it", "this", "that", "these", "those",
  "key", "guide", "understanding", "managing", "reversal",
  "about", "from", "into", "through", "during", "before",
  "type", "diabetes", "diabetic",  // too broad to be useful tags
]);

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY: Extract 2–4 meaningful topic keywords for multi-tag storage/lookup
// ─────────────────────────────────────────────────────────────────────────────
export function extractTopicTags(topicString) {
  if (!topicString || typeof topicString !== "string") return [];
  return topicString
    .split(/[\s,&'":!?()[\]]+/)            // split on whitespace and punctuation
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
    .slice(0, 4)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1)); // Capitalize first letter
}

// ─────────────────────────────────────────────────────────────────────────────
// RAW READ / WRITE — localStorage
// ─────────────────────────────────────────────────────────────────────────────
function getFactLibrary() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveFactLibrary(lib) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lib));
  } catch (e) {
    // localStorage quota exceeded — trim oldest 20% and retry
    const trimmed = lib.slice(Math.floor(lib.length * 0.2));
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed)); } catch {}
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVE — called after Stage 4 completes successfully
// Saves GREEN and YELLOW claims only. Skips duplicates by claimText.
// ─────────────────────────────────────────────────────────────────────────────
export function saveToFactLibrary(claims, topicString) {
  if (typeof window === "undefined" || !Array.isArray(claims)) return 0;

  const tags = extractTopicTags(topicString);
  if (!tags.length) return 0;

  const lib        = getFactLibrary();
  const existingTexts = new Set(lib.map((f) => f.claimText?.toLowerCase()));
  let   saved      = 0;

  for (const claim of claims) {
    // Only persist evidence-backed grades
    if (claim.grade !== "GREEN" && claim.grade !== "YELLOW") continue;
    if (!claim.claim) continue;

    const key = claim.claim.toLowerCase().trim();
    if (existingTexts.has(key)) continue; // already stored

    lib.push({
      id:            (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`),
      topicTags:     tags,
      claimText:     claim.claim,
      grade:         claim.grade,
      sourceText:    claim.citation ?? claim.source ?? "",
      evidenceLevel: claim.evidence_level ?? null,
      scriptRule:    claim.script_rule ?? null,
      dateVerified:  new Date().toISOString(),
    });
    existingTexts.add(key);
    saved++;
  }

  if (saved > 0) saveFactLibrary(lib);
  return saved;
}

// ─────────────────────────────────────────────────────────────────────────────
// RETRIEVE — called before Stage 4 to pre-fill verified facts
// Returns non-stale facts matching ANY tag of the current topic.
// ─────────────────────────────────────────────────────────────────────────────
export function getPreVerifiedFacts(topicString) {
  if (typeof window === "undefined") return [];

  const tags   = extractTopicTags(topicString);
  if (!tags.length) return [];

  const lib    = getFactLibrary();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - FACT_TTL_DAYS);
  const tagSet = new Set(tags);

  return lib.filter((fact) => {
    // Reject stale facts
    if (!fact.dateVerified || new Date(fact.dateVerified) < cutoff) return false;
    // Include if any stored tag matches any current topic tag
    return fact.topicTags?.some((t) => tagSet.has(t)) ?? false;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// STATS — returns counts for the UI indicator
// ─────────────────────────────────────────────────────────────────────────────
export function getFactLibraryStats() {
  if (typeof window === "undefined") return { total: 0, green: 0, yellow: 0, stale: 0 };
  const lib    = getFactLibrary();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - FACT_TTL_DAYS);

  return {
    total:  lib.length,
    green:  lib.filter((f) => f.grade === "GREEN").length,
    yellow: lib.filter((f) => f.grade === "YELLOW").length,
    stale:  lib.filter((f) => new Date(f.dateVerified) < cutoff).length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CLEAR — for testing / reset
// ─────────────────────────────────────────────────────────────────────────────
export function clearFactLibrary() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
