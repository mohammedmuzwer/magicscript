// ── Reels Pipeline — 5 condensed stages ─────────────────────────────────────
// Mirrors the Podcast 10-stage pipeline pattern but tailored for short-form
// content (60s–90s reels). Each stage maps onto a phase in the existing flow
// so we don't have to refactor the underlying state machine.

export const REELS_STAGES = [
  {
    id: 1,
    key: "topic-discovery",
    label: "Topic Discovery",
    shortLabel: "Topic",
    desc: "Pick a content bucket, type a topic, or paste a viral reference link",
    icon: "🔍",
    color: "#22d3ee",
  },
  {
    id: 2,
    key: "topic-validate",
    label: "Topic Validation",
    shortLabel: "Validate",
    desc: "Doctor Farmer validated matrix — choose the highest-scoring angle",
    icon: "🎯",
    color: "#818cf8",
  },
  {
    id: 3,
    key: "med-check",
    label: "Med Quick-Check",
    shortLabel: "Verify",
    desc: "Verify medical claims against PubMed, ICMR, WHO before scripting",
    icon: "🛡️",
    color: "#10b981",
    authorityFirewall: true,
  },
  {
    id: 4,
    key: "script-gen",
    label: "Script Generation",
    shortLabel: "Generate",
    desc: "60-second hook + script with engagement scoring",
    icon: "✨",
    color: "#f59e0b",
  },
  {
    id: 5,
    key: "output",
    label: "Final Output",
    shortLabel: "Output",
    desc: "Polished script ready for shoot · Tanglish · export formats",
    icon: "📄",
    color: "#ec4899",
  },
];

// ── Default model per stage — same Gemini/Claude split as Podcast ───────────
export const REELS_DEFAULT_MODEL_PREFS = {
  1: "gemini",   // Topic Discovery — data/scoring task
  2: "gemini",   // Topic Validation — structured matrix
  3: "gemini",   // Med Quick-Check — evidence grading
  4: "claude",   // Script Generation — high-EQ hook + voice writing
  5: "gemini",   // Final Output / Localization — language task
};

const STORAGE_KEY = "REELS_MODEL_PREFS_v1";

export function getReelsStoredPrefs() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function getReelsModelPref(stageNum) {
  const stored = getReelsStoredPrefs();
  return stored[stageNum] ?? REELS_DEFAULT_MODEL_PREFS[stageNum] ?? "gemini";
}

export function setReelsModelPref(stageNum, model) {
  if (typeof window === "undefined") return;
  const stored = getReelsStoredPrefs();
  stored[stageNum] = model;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}
