/**
 * PubMed / NCBI E-utilities — Shared Library
 *
 * Used across all features: Studio, Reels, YouTube, Podcast.
 * Server-side only (never import directly in "use client" components).
 * Call via the /api/pubmed route from the client.
 *
 * Docs: https://www.ncbi.nlm.nih.gov/books/NBK25501/
 * Key:  https://www.ncbi.nlm.nih.gov/account/ → API Key Management
 */

const BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

// ── 0. QUERY CLEANER ──────────────────────────────────────────────────────────
// Converts a creator-style content title into a clean PubMed medical query.
//
// Examples:
//   "Lifestyle is the best way to lose weight for diabetics — what research shows"
//     → "lifestyle weight loss diabetes"
//   "Why your rice portions are destroying your insulin — the hidden truth"
//     → "rice portions insulin resistance"
//
// Import and use this in any API route before calling getEvidenceReport().
// Content bucket names that are brand labels, not medical terms — strip when leading a title
const BUCKET_PREFIXES = /^(gut\s+secrets?|lifestyle|women\s+health|weight\s+loss|gut\s+health|metabolic\s+disease|diabetes|kids\s+health|thyroid|pcod|stress|sleep)\s*[—–]?\s*/i;

// Map content bucket names → medical search equivalents for PubMed
const BUCKET_MAP = {
  "gut secrets":       "gut microbiome intestinal health",
  "gut health":        "gut microbiome",
  "women health":      "women health",
  "metabolic disease": "metabolic syndrome",
  "weight loss":       "weight loss obesity",
  "lifestyle":         "lifestyle intervention",
};

export function extractMedicalQuery(topic, keyword = null) {
  // 1. Split on em/en dash — take first segment (core claim only)
  let q = topic.split(/\s*[—–]\s*/)[0].trim();

  // 2. Strip the content keyword/bucket prefix from the title start
  //    e.g. "Gut secrets during Ramadan..." → "during Ramadan..."
  //    e.g. "Lifestyle — is intermittent fasting safe?" → "is intermittent fasting safe?"
  if (keyword) {
    const kwEscaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    q = q.replace(new RegExp(`^${kwEscaped}\\s*[—–]?\\s*`, "i"), "").trim();
  }
  q = q.replace(BUCKET_PREFIXES, "").trim();

  // 3. Strip leading creator filler words
  q = q.replace(/^(stop|why|how|the truth about|avoid|never|always|is it|can|should|does|did|will|are|was|what if|i tried|we tried)\s+/i, "").trim();

  // 4. Strip trailing "what the research/science says" phrases
  q = q.replace(/\s+(what|how|why)\s+(the\s+)?(research|science|studies?|experts?|data)\s+(actually\s+)?(says?|shows?|reveals?|proves?|suggests?|confirms?)$/i, "").trim();

  // 5. Remove content-creator adverbs/verbs/determiners not in paper titles
  const creatorAdverbs = /\b(actually|silently|secretly|really|slowly|rapidly|completely|totally|truly|finally|suddenly|always|never|already|just|now|today|literally)\b/gi;
  const actionVerbs    = /\b(destroying|harming|killing|ruining|fixing|causing|creating|making|skipping|hiding|missing|ignoring|blocking|worsening|attacking|boosting|spiking|crashing|shattering|reversing|outperforms?|proves?)\b/gi;
  const determiners    = /\b(your|my|our|their|its|this|that|these|those)\b/gi;
  q = q.replace(creatorAdverbs, " ").replace(actionVerbs, " ").replace(determiners, " ").trim();

  // 6. Remove cultural/festival/geography terms not in medical literature
  q = q.replace(/\b(Karthigai|Ekadasi|Navratri|Ramadan|Diwali|Tamil Nadu|Tamil|South Indian|Indian|India)\b/gi, " ").trim();

  // 7. Normalise audience qualifiers → medical terms
  q = q.replace(/\s+for\s+(diabetics?|pre-?diabetics?)/i, " diabetes").trim();
  q = q.replace(/\s+for\s+(PCOD|PCOS)\s*/i, " PCOS").trim();
  q = q.replace(/\s+(in India|in Tamil Nadu|for Indians?|for South Indians?)\s*$/i, "").trim();

  // 8. Remove trailing dash fragments
  q = q.replace(/\s*[-–—]\s*(here'?s?|the|a)\s+.+$/i, "").trim();

  // 9. Collapse multiple spaces
  q = q.replace(/\s+/g, " ").trim();

  // 10. Safety cap
  if (q.length > 80) q = q.substring(0, 80);

  // If extraction left too little, try a bucket-mapped fallback
  if (q.length < 4 && keyword) {
    const mapped = BUCKET_MAP[keyword.toLowerCase()];
    return mapped ?? keyword;
  }

  return q.length >= 4 ? q : topic.substring(0, 60);
}

function apiKey() {
  return process.env.NCBI_API_KEY ? `&api_key=${process.env.NCBI_API_KEY}` : "";
}

// ── 1. SEARCH ─────────────────────────────────────────────────────────────────
// Returns article IDs + summaries matching a query.
// @param query      e.g. "intermittent fasting diabetes India"
// @param maxResults max number of articles (default 10, max 200)
// @param minYear    only return articles from this year onwards (e.g. 2018)
export async function searchPubMed(query, { maxResults = 10, minYear = null } = {}) {
  const dateFilter = minYear
    ? `&mindate=${minYear}/01/01&maxdate=${new Date().getFullYear()}/12/31&datetype=pdat`
    : "";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000); // 8s hard cap per PubMed query

  try {
  // Step 1 — esearch: get matching PMIDs
  const searchRes = await fetch(
    `${BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json${dateFilter}${apiKey()}`,
    { next: { revalidate: 3600 }, signal: controller.signal }
  );
  if (!searchRes.ok) throw new Error(`PubMed esearch failed: ${searchRes.status}`);

  const searchData = await searchRes.json();
  const { idlist, count } = searchData.esearchresult;

  if (!idlist.length) return { articles: [], totalCount: 0 };

  // Step 2 — esummary: get article metadata for the found IDs
  const summaryRes = await fetch(
    `${BASE}/esummary.fcgi?db=pubmed&id=${idlist.join(",")}&retmode=json${apiKey()}`,
    { next: { revalidate: 3600 }, signal: controller.signal }
  );
  if (!summaryRes.ok) throw new Error(`PubMed esummary failed: ${summaryRes.status}`);

  const summaryData = await summaryRes.json();

  const articles = idlist
    .map((id) => summaryData.result[id])
    .filter(Boolean)
    .map((a) => ({
      pmid:        a.uid,
      title:       a.title?.replace(/\.$/, "") ?? "Untitled",
      authors:     (a.authors ?? []).slice(0, 3).map((au) => au.name),
      journal:     a.fulljournalname || a.source || "Unknown journal",
      year:        a.pubdate ? parseInt(a.pubdate.substring(0, 4), 10) : null,
      articleTypes: a.pubtype ?? [],
      abstract:    a.bookname ?? null,
      doi:         a.elocationid ?? null,
      url:         `https://pubmed.ncbi.nlm.nih.gov/${a.uid}/`,
    }));

  return { articles, totalCount: parseInt(count, 10) };
  } finally {
    clearTimeout(timer);
  }
}

// ── 2. FETCH ABSTRACT ─────────────────────────────────────────────────────────
// Fetches the full abstract text for a single PMID.
export async function fetchAbstract(pmid) {
  const res = await fetch(
    `${BASE}/efetch.fcgi?db=pubmed&id=${pmid}&rettype=abstract&retmode=text${apiKey()}`
  );
  if (!res.ok) return null;
  return await res.text();
}

// ── 3. EVIDENCE SCORER ────────────────────────────────────────────────────────
// Turns raw article results into a 0–100 evidence score.
// Used by Med Quick-Check, Reel topic scoring, Studio verification.
export function scoreEvidence(articles, totalCount) {
  if (!articles.length) {
    return { score: 0, level: "none", label: "No Published Evidence", articleCount: 0, totalCount: 0 };
  }

  // --- Volume component (0–25 pts) ---
  let volumeScore = 0;
  if      (totalCount >= 1000) volumeScore = 25;
  else if (totalCount >= 200)  volumeScore = 20;
  else if (totalCount >= 50)   volumeScore = 15;
  else if (totalCount >= 10)   volumeScore = 10;
  else if (totalCount >= 3)    volumeScore = 5;
  else                         volumeScore = 2;

  // --- Study quality component (0–50 pts) ---
  // Higher-tier study designs score higher
  const typeWeights = {
    "Meta-Analysis":                    50,
    "Systematic Review":                45,
    "Randomized Controlled Trial":      40,
    "Multicenter Study":                35,
    "Clinical Trial":                   30,
    "Controlled Clinical Trial":        30,
    "Review":                           20,
    "Comparative Study":                15,
    "Observational Study":              10,
    "Case Reports":                      5,
    "Editorial":                         2,
    "Letter":                            1,
  };

  let qualityScore = 0;
  for (const article of articles) {
    const best = Math.max(0, ...(article.articleTypes ?? []).map((t) => typeWeights[t] ?? 0));
    qualityScore = Math.max(qualityScore, best);
  }

  // --- Recency component (0–25 pts) ---
  const currentYear = new Date().getFullYear();
  const recentCount = articles.filter((a) => a.year && a.year >= currentYear - 5).length;
  const recencyScore = Math.round((recentCount / articles.length) * 25);

  const raw   = volumeScore + qualityScore + recencyScore;
  const score = Math.min(100, raw);

  const level =
    score >= 70 ? "strong"   :
    score >= 40 ? "moderate" :
    score >= 15 ? "limited"  : "none";

  const label =
    score >= 70 ? "Strong Evidence"   :
    score >= 40 ? "Moderate Evidence" :
    score >= 15 ? "Limited Evidence"  : "Insufficient Evidence";

  return { score, level, label, articleCount: articles.length, totalCount };
}

// ── 4. FULL EVIDENCE REPORT ───────────────────────────────────────────────────
// One-call function: search → score → return structured report.
// This is the main function used by all features.
//
// @param query     health topic / claim to check
// @param options   { maxResults, minYear, includeAbstracts }
// @returns         { query, evidence, topArticles, searchedAt }
export async function getEvidenceReport(query, options = {}) {
  const { maxResults = 10, minYear = 2015 } = options;

  const { articles, totalCount } = await searchPubMed(query, { maxResults, minYear });
  const evidence = scoreEvidence(articles, totalCount);

  return {
    query,
    evidence,
    topArticles:  articles.slice(0, 5),
    allArticles:  articles,
    searchedAt:   new Date().toISOString(),
    source:       "PubMed / NCBI E-utilities",
  };
}

// ── 5. TOPIC DEMAND SCORE (for Reel topic scoring) ───────────────────────────
// Returns a 0–100 "research density" score for a keyword.
// Used to make the Doctor Farmer Validation Engine scores real.
export async function getResearchDensityScore(keyword) {
  try {
    const { totalCount } = await searchPubMed(
      `${keyword}[Title/Abstract]`,
      { maxResults: 1, minYear: 2018 }
    );
    // Normalize: 500+ articles = 100, 0 = 0
    return Math.min(100, Math.round((totalCount / 500) * 100));
  } catch {
    return null; // graceful fallback
  }
}
