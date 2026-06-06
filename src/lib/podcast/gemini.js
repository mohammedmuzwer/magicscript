/**
 * Google Gemini API helper for the Doctor Farmer MagicScript Pipeline.
 * All stages → gemini-2.5-flash  (fast, reliable, free-tier compatible)
 *
 * gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash are deprecated as of 2026.
 * gemini-2.5-pro uses mandatory thinking mode (very slow, not suitable for pipeline).
 * gemini-2.5-flash with thinkingBudget:0 is the fastest reliable choice.
 */

export const GEMINI_MODELS = {
  pro:   "gemini-2.5-flash",
  flash: "gemini-2.5-flash",
};

/**
 * Call Google Gemini and return parsed JSON.
 *
 * Gemini 2.5 returns parts that may include thought-parts (thought: true) mixed
 * with the actual output text. We filter to the first non-thought text part.
 * Thinking is disabled via thinkingBudget: 0 for maximum speed.
 *
 * Auto-retries on 503 (overloaded) and 429 (rate limited) with exponential backoff.
 */
export async function callGemini(apiKey, model, systemPrompt, userPrompt, temperature = 0.7, maxTokens = 8192, thinkingBudget = 0, isJson = true) {
  const combined = systemPrompt + "\n\n" + userPrompt;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = JSON.stringify({
    contents: [{ parts: [{ text: combined }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      // JSON mode: force structured output. Plain-text mode: let model write prose freely.
      responseMimeType: isJson ? "application/json" : "text/plain",
      // thinkingBudget: 0 = disabled (fast pipeline). Pass > 0 for deeper reasoning stages.
      thinkingConfig: { thinkingBudget },
    },
  });

  // ── Retry loop: up to 4 attempts with exponential backoff ──────────────────
  const MAX_RETRIES = 2; // Reduced from 4 — fail fast, don't hang for 21s on JSON errors
  const RETRYABLE_CODES = new Set([429, 500, 503]);
  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      // Wait 3s · 6s · 12s between retries
      await new Promise((r) => setTimeout(r, 3000 * Math.pow(2, attempt - 1)));
    }

    let res, data;
    try {
      res  = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
      data = await res.json();
    } catch (networkErr) {
      lastError = new Error(`Network error: ${networkErr.message}`);
      continue; // retry on network failure
    }

    // Check for API-level errors
    if (data.error) {
      const code    = data.error.code ?? res.status;
      const message = data.error.message ?? JSON.stringify(data.error);

      if (RETRYABLE_CODES.has(code)) {
        lastError = new Error(`Gemini error: ${message}`);
        continue; // retry on overload / rate-limit
      }
      // Non-retryable error (bad key, invalid request, etc.) — throw immediately
      throw new Error(`Gemini error: ${message}`);
    }

    // ── Parse response ────────────────────────────────────────────────────────
    // With responseMimeType:"application/json" the output is always a single
    // clean JSON part. Filter out thought-parts just in case thinking leaks through.
    const parts      = data.candidates?.[0]?.content?.parts ?? [];
    const outputPart = parts.find((p) => !p.thought && typeof p.text === "string") ?? parts[0];
    let   text       = outputPart?.text ?? "";

    const finishReason = data.candidates?.[0]?.finishReason ?? "unknown";
    if (!text) {
      lastError = new Error(
        `Gemini returned empty response (finishReason: ${finishReason}). ` +
        `The prompt may have been blocked or the model returned no output.`
      );
      if (finishReason === "RECITATION" || finishReason === "SAFETY") throw lastError;
      continue;
    }
    // Log when model hits token limit — this causes truncated JSON
    if (finishReason === "MAX_TOKENS") {
      console.warn(`[gemini] Response truncated at maxTokens limit — increase maxTokens. Length: ${text.length} chars`);
    }

    // ── Plain-text mode: return raw prose directly ────────────────────────────
    // Used for script generation (isJson: false) — no parsing needed.
    if (!isJson) {
      return text.trim();
    }

    // ── Aggressive JSON cleaning ──────────────────────────────────────────────
    // Even with responseMimeType:"application/json" the model occasionally wraps
    // output in ```json ... ``` or adds an intro sentence before the JSON.
    // This 3-step cleaner handles every known failure mode.

    // Step 1 — strip markdown fences (```json...``` or ```...```)
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
    }
    text = text.trim();

    // Step 2 — slice from first { to last } to discard any preamble/postscript
    const first = text.indexOf("{");
    const last  = text.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      text = text.substring(first, last + 1);
    }

    if (!text) {
      lastError = new Error("Gemini returned empty text after aggressive cleaning.");
      continue;
    }

    // Step 3 — safe parse with full error context logged
    try {
      return JSON.parse(text); // ✓ success
    } catch (parseError) {
      console.error("[gemini] JSON parse failed. Raw excerpt:", text.slice(0, 300));
      lastError = new Error(`JSON parse error: ${parseError.message}`);
      continue; // retry — model may have truncated mid-output
    }
  }

  // All retries exhausted
  throw lastError ?? new Error("Gemini API failed after maximum retries.");
}
