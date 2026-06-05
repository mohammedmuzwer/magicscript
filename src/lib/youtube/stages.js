// Long Content (YouTube 10-min) — 7-stage pipeline definitions.
// Each stage carries its own vibrant identity colour, used by the sidebar dots
// and stage headers. No cyan/teal — accent blue is #2563eb.

export const YT_STAGES = [
  { id: 1, label: "Topic Discovery",   color: "#2563eb" }, // Electric Blue
  { id: 2, label: "Topic Validation",  color: "#7c3aed" }, // Vivid Violet
  { id: 3, label: "YouTube Research",   color: "#f97316" }, // Vivid Orange
  { id: 4, label: "Content Structure",  color: "#16a34a" }, // Emerald Green
  { id: 5, label: "Med Quick-Check",    color: "#ef4444" }, // Crimson Red
  { id: 6, label: "Script Generation",  color: "#ec4899" }, // Hot Pink
  { id: 7, label: "Final Output",       color: "#d97706" }, // Vivid Amber
];

// YouTube brand red — used ONLY for YouTube-specific labels/sections.
export const YT_BRAND = "#ef4444";

// ── Stage 1: content style options ───────────────────────────────────────────
export const CONTENT_STYLES = [
  { id: "education", emoji: "🎓", label: "Education", desc: "How-to, explainer, tutorial" },
  { id: "story",     emoji: "📖", label: "Story",     desc: "Case study, patient journey, narrative" },
  { id: "myth",      emoji: "💥", label: "Myth Bust", desc: "Debunk, truth reveal, science check" },
  { id: "auto",      emoji: "🔀", label: "Auto Pick", desc: "AI chooses best style per topic" },
];

export const styleLabel = (id) =>
  ({ education: "Education", story: "Story", myth: "Myth Bust", auto: "Auto Pick" }[id] || "Education");

// ── Stage 3: hook intelligence ───────────────────────────────────────────────
export const HOOK_TYPES = [
  { id: "curiosity", emoji: "🎯", label: "Curiosity Hook", template: "What doctors never tell you about…", ctrLift: 34, face: "Concerned" },
  { id: "shock",     emoji: "😱", label: "Shock Hook",     template: "I tested X for 30 days and…",        ctrLift: 41, face: "Surprised" },
  { id: "question",  emoji: "❓", label: "Question Hook",  template: "Why does X happen even when you…",    ctrLift: 28, face: "Confident" },
];

// ── Stage 4: 10-minute chapter structure ─────────────────────────────────────
export const VIDEO_CHAPTERS = [
  { range: "0:00–0:45",  type: "HOOK",      desc: "Opening statement + pattern interrupt",        words: 95,  retention: "green" },
  { range: "0:45–1:30",  type: "INTRO",     desc: "Who this is for + what they'll learn",         words: 110, retention: "green" },
  { range: "1:30–3:30",  type: "CHAPTER 1", desc: "Core problem / context",                       words: 300, retention: "amber" },
  { range: "3:30–5:30",  type: "CHAPTER 2", desc: "The evidence / science",                       words: 320, retention: "green" },
  { range: "5:30–7:30",  type: "CHAPTER 3", desc: "The solution / protocol",                      words: 315, retention: "amber" },
  { range: "7:30–9:00",  type: "CASE STUDY",desc: "Real example or patient story",                words: 240, retention: "red" },
  { range: "9:00–10:00", type: "CTA",       desc: "Subscribe + next video + offer",               words: 150, retention: "green" },
];

// ── Stage 6: per-script generation pipeline rows ─────────────────────────────
export const YT_GEN_PIPELINE = [
  { icon: "🔍", label: "Topic Expansion",   cost: "1cr" },
  { icon: "👥", label: "Audience Profiling", cost: "FREE" },
  { icon: "📺", label: "YouTube Research",   cost: "2cr" },
  { icon: "🏗️", label: "Structure Build",    cost: "2cr" },
  { icon: "🩺", label: "Med Quick-Check",    cost: "3cr" },
  { icon: "✍️", label: "Script Generation",  cost: "3cr" },
  { icon: "✨", label: "Format & Polish",     cost: "1cr" },
];

export const YT_CREDITS_PER_SCRIPT = 12;

// retention indicator → tailwind-ish colour
export const RETENTION_COLOR = { green: "#16a34a", amber: "#f59e0b", red: "#ef4444" };
