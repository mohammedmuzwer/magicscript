// Reels module credit cost constants
//
// Credits are aligned with REAL Gemini-Flash money cost: 1 cr ≈ ₹1.
// A full Stage 1→5 run is priced by batch size (see reelRunCost):
//   1 reel → 1.5 cr   ·   3 reels → 3 cr   ·   5 reels → 5 cr

export const REELS_CREDITS = {
  LOAD_TRENDING: 0,       // Always from cache
  REFRESH_TRENDING: 2,    // Live API call
  ONE_WORD_EXPAND: 1,     // LLM word expansion
  MED_QUICK_CHECK: 3,     // PubMed + safety scan
  GENERATE_SCRIPTS: 4,    // 3 simultaneous LLM calls (Cinematic + Education + Rebel)
  LOCALIZE_SCRIPT: 1,     // Per card, per language
  REGEN_SINGLE: 2,        // Re-generate one script
  FULL_REGEN: 8,          // (legacy) Full run from Stage 3
  REVERIFY: 3,            // Re-run medical verification (Stage 3)
};

/**
 * Per-model cost multiplier — credits track real money, and Claude/GPT cost
 * more per token than Gemini Flash, so a run on a pricier model costs more.
 *   Gemini = base (1×) · ChatGPT = 1.3× · Claude = 1.5×
 */
export const MODEL_COST_MULTIPLIER = {
  gemini:  1,
  chatgpt: 1.3,
  claude:  1.5,
  demo:    1,   // demo simulates a Gemini-priced run
};

export function modelMultiplier(model) {
  return MODEL_COST_MULTIPLIER[(model || "gemini").toLowerCase()] ?? 1;
}

/**
 * Real-money-aligned cost of a full Stage 1→5 run, by batch size and model.
 *   Base (Gemini): 1 reel = 1.5 cr · 2 = 2 · 3 = 3 · 4 = 4 · 5 = 5  (min 1.5)
 *   Claude = base × 1.5 · ChatGPT = base × 1.3
 * Also used for "Re-Generate" (re-running script content for the same topics).
 */
export function reelRunCost(reels = 1, model = "gemini") {
  const n = Math.max(1, Math.floor(Number(reels) || 1));
  const base = Math.max(1.5, n);
  return Math.round(base * modelMultiplier(model) * 10) / 10; // 1-decimal precision
}

/** Cost to re-run medical verification, scaled by model. */
export function reverifyCost(model = "gemini") {
  return Math.round(REELS_CREDITS.REVERIFY * modelMultiplier(model) * 10) / 10;
}

// Total cost for a single-reel fresh run (Gemini base)
export const FULL_RUN_COST = reelRunCost(1); // 1.5cr

// Low credit warning threshold
export const LOW_CREDIT_THRESHOLD = 20;
