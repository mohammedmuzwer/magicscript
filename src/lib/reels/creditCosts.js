// Reels module credit cost constants

export const REELS_CREDITS = {
  LOAD_TRENDING: 0,       // Always from cache
  REFRESH_TRENDING: 2,    // Live API call
  ONE_WORD_EXPAND: 1,     // LLM word expansion
  MED_QUICK_CHECK: 3,     // PubMed + safety scan
  GENERATE_SCRIPTS: 4,    // 3 simultaneous LLM calls (Cinematic + Education + Rebel)
  LOCALIZE_SCRIPT: 1,     // Per card, per language
  REGEN_SINGLE: 2,        // Re-generate one script
  FULL_REGEN: 8,          // Full run from Stage 3 (med check + generate)
};

// Total cost for a full fresh run (Stage 1 expansion + med check + generate)
export const FULL_RUN_COST = REELS_CREDITS.ONE_WORD_EXPAND + REELS_CREDITS.MED_QUICK_CHECK + REELS_CREDITS.GENERATE_SCRIPTS; // 8cr

// Low credit warning threshold
export const LOW_CREDIT_THRESHOLD = 20;
