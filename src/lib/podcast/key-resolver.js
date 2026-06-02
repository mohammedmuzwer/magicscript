/**
 * Model-choice helpers for the API routes.
 *
 * The user can pick between three options in the ModelToggle:
 *   - "gemini"          → uses the user's browser-side Gemini key
 *   - "claude"          → uses the user's browser-side Claude key
 *   - "claude-internal" → uses the SERVER-side ANTHROPIC_API_KEY env var
 *                         (no user key needed — billed to the server operator)
 *
 * Routes use these helpers to read the right key without scattering the
 * `claude-internal` logic across every file.
 */

/**
 * Resolves which Anthropic API key to use for this request.
 * - If preferred=claude-internal, returns the server's ANTHROPIC_API_KEY (or null if unset)
 * - Otherwise, returns the browser-supplied x-client-anthropic-key header (or null)
 */
export function resolveAnthropicKey(req) {
  const preferred = req.headers.get("x-preferred-model");
  if (preferred === "claude-internal") {
    return process.env.ANTHROPIC_API_KEY || null;
  }
  return req.headers.get("x-client-anthropic-key") || null;
}

/**
 * Returns the normalised preferred-model string.
 * Collapses "claude-internal" → "claude" so existing routing logic works
 * unchanged — the only thing that differs is WHICH key is read (see above).
 */
export function normalizePreferred(req) {
  const raw = req.headers.get("x-preferred-model") ?? "gemini";
  if (raw === "claude-internal") return "claude";
  return raw;
}

/**
 * Returns the mode label that should appear in the response payload.
 * Routes using claude-internal get mode="anthropic-internal" so the UI can
 * show a distinct badge ("Claude Internal" vs "Claude").
 */
export function modeLabel(req, base = "anthropic") {
  const raw = req.headers.get("x-preferred-model");
  if (raw === "claude-internal" && base === "anthropic") return "anthropic-internal";
  return base;
}
