/**
 * Reels LLM helper — single entry point used by every /api/reels/* route.
 *
 * Replaces the deprecated `claude-haiku-20240307` and `claude-3-5-sonnet-20241022`
 * raw fetches that were causing slow/failed reel generations. Uses the same
 * callClaude / callGemini helpers as the Podcast pipeline, so reels gets:
 *   - Current Claude Sonnet 4.6 (no dead-model timeouts)
 *   - Gemini 2.5 Flash support
 *   - x-preferred-model header honoured
 *   - Auto-fallback Gemini → Claude on overload
 *
 * Returns: { parsed, source: "gemini" | "anthropic" | "demo", fallback_from? }
 */

import { callGemini, GEMINI_MODELS } from "@/lib/podcast/gemini";
import { callClaude } from "@/lib/podcast/claude";
import { resolveAnthropicKey } from "@/lib/podcast/key-resolver";
import { isGeminiOverload } from "@/lib/podcast/fallback";

export async function reelsLlmCall(req, {
  system,
  user,
  temperature = 0.4,
  maxTokens   = 1200,
  isJson      = true,
}) {
  const geminiKey    = req.headers.get("x-client-gemini-key");
  const anthropicKey = resolveAnthropicKey(req);
  // Default to Claude for reels because hook/script writing benefits from
  // Claude's voice — but always respect the user's per-stage preference.
  const preferred    = req.headers.get("x-preferred-model") ?? "claude";

  // ── Demo mode: no keys provided ────────────────────────────────────────
  if (!geminiKey && !anthropicKey) {
    return { parsed: null, source: "demo" };
  }

  const tryGemini = async () => {
    const parsed = await callGemini(
      geminiKey,
      GEMINI_MODELS.flash,
      system,
      user,
      temperature,
      maxTokens,
      0,      // thinkingBudget — disabled for speed
      isJson, // pass through so plain-text scripts aren't force-parsed as JSON
    );
    return { parsed, source: "gemini" };
  };

  const tryClaude = async () => {
    const parsed = await callClaude(
      anthropicKey,
      system,
      user,
      isJson,
      maxTokens,
    );
    return { parsed, source: "anthropic" };
  };

  // ── Gemini preferred ───────────────────────────────────────────────────
  if (preferred === "gemini" && geminiKey) {
    try {
      return await tryGemini();
    } catch (e) {
      if (isGeminiOverload(e) && anthropicKey) {
        console.warn("[reels] Gemini overloaded — falling back to Claude:", e.message);
        const claudeRes = await tryClaude();
        return { ...claudeRes, fallback_from: "gemini-overloaded", fallback_reason: e.message };
      }
      // If Gemini failed for some other reason but Claude is available, still try
      if (anthropicKey) {
        try { return await tryClaude(); } catch {/* fall through */}
      }
      throw e;
    }
  }

  // ── Claude preferred (default for reels) ──────────────────────────────
  if (anthropicKey) {
    try {
      return await tryClaude();
    } catch (e) {
      // If Claude fails and Gemini is available, try it as a backup
      if (geminiKey) {
        try { return await tryGemini(); } catch {/* fall through */}
      }
      throw e;
    }
  }

  // Last resort: try Gemini if available
  if (geminiKey) return await tryGemini();

  return { parsed: null, source: "demo" };
}
