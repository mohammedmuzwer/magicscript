// Long Content (YouTube) credit cost constants.
//
// A 10-minute, 7-stage video run costs far more real tokens than a 1-min reel,
// so the base is higher (8 cr/video vs 1.5 cr/reel). Credits track real money:
// 1 cr ≈ ₹1, and pricier models cost proportionally more.

import { MODEL_COST_MULTIPLIER, modelMultiplier } from "@/lib/reels/creditCosts";

export const YT_CREDITS = {
  REVERIFY: 5,   // Re-run medical verification across the video's chapter claims
};

// Re-export so the YouTube UI can import multipliers from one place.
export { MODEL_COST_MULTIPLIER, modelMultiplier };

/**
 * Real-money-aligned cost of a full Stage 1→7 long-content run, by batch & model.
 *   Base (Gemini): 8 cr per video.
 *   Claude = base × 1.5 (→ 12cr) · ChatGPT = base × 1.3 (→ 10.4cr)
 * Also used for "Re-Generate" (re-running the long-form script for the same topic).
 */
export function videoRunCost(videos = 1, model = "gemini") {
  const n = Math.max(1, Math.floor(Number(videos) || 1));
  const base = n * 8; // 8 cr/video
  return Math.round(base * modelMultiplier(model) * 10) / 10; // 1-decimal precision
}

/** Cost to re-run the medical verification, scaled by model. */
export function reverifyCost(model = "gemini") {
  return Math.round(YT_CREDITS.REVERIFY * modelMultiplier(model) * 10) / 10;
}

// Cost for a single-video fresh run (Gemini base)
export const FULL_VIDEO_COST = videoRunCost(1); // 8cr
