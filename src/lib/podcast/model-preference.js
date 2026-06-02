/**
 * Per-stage model preference — persists to localStorage.
 * Lets the user manually toggle Gemini vs Claude on any stage
 * without touching code. Used for performance A/B testing.
 */

const STORAGE_KEY = "PIPELINE_MODEL_PREFS_v1";

// Default routing matches the current optimised pipeline
export const DEFAULT_MODEL_PREFS = {
  1:  "gemini",   // Topic Discovery    — data/scoring task
  2:  "gemini",   // Topic Lock         — structured JSON task
  3:  "gemini",   // Question Discovery — logic task
  4:  "gemini",   // Research           — evidence grading task
  5:  "gemini",   // Question Lock      — sequencing task
  6:  "claude",   // Answer Writer      — high-EQ voice writing
  7:  "gemini",   // Segments & Design  — structural task
  8:  "gemini",   // Script Assembly    — formatting task (needs 65K output)
  9:  "claude",   // Recommended Reels  — hook writing
  10: "gemini",   // Translation        — language task
};

export function getStoredPrefs() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

/** Get the active model preference for one stage. */
export function getModelPref(stageNum) {
  const stored = getStoredPrefs();
  let pref = stored[stageNum] ?? DEFAULT_MODEL_PREFS[stageNum] ?? "gemini";
  // "claude-internal" was removed — collapse any stale value back to "claude"
  if (pref === "claude-internal") pref = "claude";
  return pref;
}

/** Save a model preference for one stage. */
export function setModelPref(stageNum, model) {
  if (typeof window === "undefined") return;
  const stored = getStoredPrefs();
  stored[stageNum] = model;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

/** Reset all stages back to defaults. */
export function resetAllModelPrefs() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/** Returns true if any stage has been overridden from its default. */
export function hasCustomPrefs() {
  const stored = getStoredPrefs();
  return Object.keys(stored).some(
    (k) => stored[k] !== DEFAULT_MODEL_PREFS[k]
  );
}
