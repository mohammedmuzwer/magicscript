/**
 * Gemini → Claude auto-fallback helper.
 *
 * Every pipeline stage uses this instead of calling callGemini directly:
 *  - Tries Gemini first
 *  - If Gemini throws an "overloaded" / 503 / 429 / quota / high-demand error
 *    AND an Anthropic key is available, silently retries the same prompt on Claude
 *  - Returns the raw result + a `fallback_from` flag so the UI can surface a notice
 *
 * If Claude isn't available (no key), the original Gemini error is surfaced.
 */

import { callGemini, GEMINI_MODELS } from "@/lib/podcast/gemini";
import { callClaude } from "@/lib/podcast/claude";

/**
 * Detects whether a thrown error matches Google's "model is overloaded" pattern.
 * Errors that match qualify for auto-fallback to Claude.
 */
export function isGeminiOverload(err) {
  const m = (err?.message || "").toLowerCase();
  return (
    m.includes("high demand") ||
    m.includes("overloaded")  ||
    m.includes("503")         ||
    m.includes("429")         ||
    m.includes("rate limit")  ||
    m.includes("quota")       ||
    m.includes("unavailable")
  );
}

/**
 * Call Gemini, with automatic fallback to Claude on overload.
 *
 * @param {object} opts
 * @param {string} opts.geminiKey       - Browser-supplied Gemini API key (may be empty)
 * @param {string} opts.anthropicKey    - Anthropic API key (browser or server) (may be empty)
 * @param {string} opts.system          - System prompt
 * @param {string} opts.user            - User prompt
 * @param {number} [opts.temperature=0.7]
 * @param {number} [opts.maxTokens=8192]
 * @param {number} [opts.thinkingBudget=0]
 * @param {boolean} [opts.claudeIsJson=true]  - Whether Claude should parse JSON output
 * @param {number}  [opts.claudeMaxTokens=8192]
 *
 * @returns {Promise<{ parsed: any, source: "gemini"|"claude", fallback_from?: string, fallback_reason?: string }>}
 */
export async function callGeminiWithFallback({
  geminiKey,
  anthropicKey,
  system,
  user,
  temperature   = 0.7,
  maxTokens     = 8192,
  thinkingBudget = 0,
  claudeIsJson  = true,
  claudeMaxTokens = 8192,
}) {
  // ── Primary path: Gemini ─────────────────────────────────────────────────
  if (geminiKey) {
    try {
      const parsed = await callGemini(
        geminiKey,
        GEMINI_MODELS.pro,
        system,
        user,
        temperature,
        maxTokens,
        thinkingBudget,
      );
      return { parsed, source: "gemini" };
    } catch (gErr) {
      if (isGeminiOverload(gErr) && anthropicKey) {
        console.warn("[fallback] Gemini overloaded — switching to Claude:", gErr.message);
        const parsed = await callClaude(anthropicKey, system, user, claudeIsJson, claudeMaxTokens);
        return {
          parsed,
          source: "claude",
          fallback_from: "gemini-overloaded",
          fallback_reason: gErr.message,
        };
      }
      throw gErr;
    }
  }

  // ── Anthropic-only path (no Gemini key) ─────────────────────────────────
  if (anthropicKey) {
    const parsed = await callClaude(anthropicKey, system, user, claudeIsJson, claudeMaxTokens);
    return { parsed, source: "claude" };
  }

  throw new Error("No API key configured.");
}
