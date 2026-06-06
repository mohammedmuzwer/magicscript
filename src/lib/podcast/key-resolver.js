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
 * Priority:
 *   1. Browser-supplied x-client-anthropic-key (user's own key)
 *   2. Server-side ANTHROPIC_API_KEY env var (fallback — always available on Vercel)
 *
 * This means the app works even when the user hasn't added a Claude key in
 * their browser's API Keys page — the Vercel env var acts as the safety net.
 */
export function resolveAnthropicKey(req) {
  const clientKey = req.headers.get("x-client-anthropic-key");
  if (clientKey) return clientKey;
  // Fall back to server env var so the app never returns null just because
  // the user hasn't stored a key in localStorage on this device.
  return process.env.ANTHROPIC_API_KEY || null;
}

/**
 * Resolves the Gemini key: client header → server GOOGLE_AI_KEY env var.
 */
export function resolveGeminiKey(req) {
  const clientKey = req.headers.get("x-client-gemini-key");
  if (clientKey) return clientKey;
  return process.env.GOOGLE_AI_KEY || null;
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
