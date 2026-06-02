/**
 * Human-readable model labels for the Doctor Farmer Pipeline UI.
 * Used by stage components and the chat panel to show exactly
 * which model generated the output.
 */

export const MODEL_META = {
  gemini: {
    label:   "Gemini 2.5 Flash",
    version: "gemini-2.5-flash",
    badge:   "bg-cyan/10 text-cyan border-cyan/25",
    dot:     "bg-cyan",
  },
  anthropic: {
    label:   "Claude Sonnet 4.6",
    version: "claude-sonnet-4-6",
    badge:   "bg-violet-500/10 text-violet-400 border-violet-500/25",
    dot:     "bg-violet-400",
  },
  "anthropic-internal": {
    label:   "Claude Internal",
    version: "claude-sonnet-4-6 · server key",
    badge:   "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/25",
    dot:     "bg-fuchsia-400",
  },
  demo: {
    label:   "Demo Mode",
    version: null,
    badge:   "bg-amber-500/10 text-amber-400 border-amber-500/25",
    dot:     "bg-amber-400",
  },
};

/** Returns the META object for a given mode string, or a safe fallback. */
export function getModelMeta(mode) {
  return MODEL_META[mode] ?? {
    label:   mode ?? "Unknown",
    version: null,
    badge:   "bg-[rgb(var(--panel))] text-faint border-[rgb(var(--border))]",
    dot:     "bg-faint",
  };
}

/**
 * Infers the active model from localStorage keys (for the chat header,
 * where we know which key will be sent before the first reply arrives).
 * Priority: Claude → Gemini (Claude is primary for stages 1, 2, 6, 8, 9).
 */
export function inferActiveModel() {
  if (typeof window === "undefined") return null;
  if (localStorage.getItem("V_KEY_GOOGLE")) return "gemini";
  if (localStorage.getItem("V_KEY_CLAUDE")) return "anthropic";
  return null;
}
