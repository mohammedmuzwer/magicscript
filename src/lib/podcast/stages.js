// Podcast pipeline — 10 stage definitions

export const PODCAST_STAGES = [
  {
    id: 1,
    key: "topic-discovery",
    label: "Topic Discovery",
    shortLabel: "Topic",
    desc: "Generate podcast topic ideas from keyword or viral reference",
    icon: "🔍",
    color: "#22d3ee",
  },
  {
    id: 2,
    key: "topic-lock",
    label: "Topic Lock",
    shortLabel: "Lock",
    desc: "Confirm one topic and angle before any content is written",
    icon: "🔒",
    color: "#818cf8",
  },
  {
    id: 3,
    key: "question-discovery",
    label: "Question Discovery",
    shortLabel: "Questions",
    desc: "Gather audience questions + designed myth-busting questions",
    icon: "❓",
    color: "#f59e0b",
  },
  {
    id: 4,
    key: "research",
    label: "Research",
    shortLabel: "Research",
    desc: "Verify every claim against the trusted source whitelist",
    icon: "🔬",
    color: "#10b981",
    authorityFirewall: true,
  },
  {
    id: 5,
    key: "question-lock",
    label: "Question Lock & Sequencing",
    shortLabel: "Q-Lock",
    desc: "Arrange answerable questions into the section arc",
    icon: "📋",
    color: "#f97316",
  },
  {
    id: 6,
    key: "answer-writer",
    label: "Answer Writer",
    shortLabel: "Answers",
    desc: "Write Dr. Prabhakar's spoken answers from verified material only",
    icon: "✍️",
    color: "#ec4899",
  },
  {
    id: 7,
    key: "segments",
    label: "Segments & Engagement",
    shortLabel: "Segments",
    desc: "Design the show — segments, demos, CTAs, lead magnet, Superfood",
    icon: "🎬",
    color: "#8b5cf6",
  },
  {
    id: 8,
    key: "script-assembly",
    label: "Script Assembly",
    shortLabel: "Script",
    desc: "Stitch everything into a two-column production script + run sheet",
    icon: "📜",
    color: "#06b6d4",
  },
  {
    id: 9,
    key: "reels-sheet",
    label: "Recommended Reels",
    shortLabel: "Reels",
    desc: "10-12 reel opportunities with tags, CTAs and editing ideas",
    icon: "🎞️",
    color: "#f43f5e",
  },
  {
    id: 10,
    key: "translation",
    label: "Translation / Localisation",
    shortLabel: "Tanglish",
    desc: "Convert all deliverables to Tanglish by the fixed rulebook",
    icon: "🌐",
    color: "#84cc16",
  },
];

// Fact-check colour codes
export const FACT_CHECK_COLORS = {
  GREEN:  { label: "Green",  hex: "#22c55e", bg: "#22c55e18", border: "#22c55e40", meaning: "Whitelisted source directly supports the claim" },
  YELLOW: { label: "Yellow", hex: "#f59e0b", bg: "#f59e0b18", border: "#f59e0b40", meaning: "Source exists but partial, small, or mixed" },
  RED:    { label: "Red",    hex: "#ef4444", bg: "#ef444418", border: "#ef444440", meaning: "No credible source found or source contradicts the claim" },
  BLUE:   { label: "Blue",   hex: "#3b82f6", bg: "#3b82f618", border: "#3b82f640", meaning: "From Dr. Prabhakar's clinical experience — not a published paper" },
};

// Trusted source whitelist
export const TRUSTED_SOURCES = [
  { id: "pubmed", label: "PubMed",  desc: "Peer-reviewed biomedical and life-sciences research" },
  { id: "icmr",   label: "ICMR",   desc: "Indian Council of Medical Research — Indian guidelines" },
  { id: "nin",    label: "NIN",    desc: "National Institute of Nutrition — Indian dietary standards" },
  { id: "who",    label: "WHO",    desc: "World Health Organization — Global health guidelines" },
];

// Section arc (Stage 5)
export const SECTION_ARC = [
  { id: "opening",   label: "Opening",         fixed: true,  desc: "Warm up, hook the viewer, set up why this topic matters now" },
  { id: "discovery", label: "Discovery",        fixed: true,  desc: "Frame the problem — why it matters, what is at stake" },
  { id: "science",   label: "Science",          fixed: false, desc: "Explain what is actually happening in the body" },
  { id: "myth",      label: "Myth-Busting",     fixed: false, desc: "Correct what the audience wrongly believes" },
  { id: "solution",  label: "Solution",         fixed: false, desc: "The method — what to do, Dr. Prabhakar's approach" },
  { id: "practical", label: "Practical Use Case", fixed: false, desc: "Real, daily application — make it usable" },
  { id: "rapidfire", label: "Rapid Fire",       fixed: true,  desc: "Fast, fun, memorable close" },
];

// Myth types (Stage 5+)
export const MYTH_TYPES = [
  { id: "disproven",         label: "Myth — Disproven",            color: "#22c55e", desc: "Research provides evidence that the belief is false" },
  { id: "unsettled",         label: "Myth — Unsettled",            color: "#f59e0b", desc: "No strong evidence either way — must never be presented as false" },
  { id: "unsettled-clinical",label: "Myth — Unsettled + Clinical", color: "#3b82f6", desc: "No evidence, but Dr. Prabhakar has a clinical verdict" },
];
