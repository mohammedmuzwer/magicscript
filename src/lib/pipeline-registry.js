// Pipeline Agent Registry
// Agents are categorised by stage: "input" | "process" | "enrichment" | "output"
// Used by the Pipeline Builder UI and execution engine.

export const INPUT_AGENTS = [
  {
    id:          "topic_intelligence",
    name:        "Trend Sense",
    stage:       "input",
    icon:        "📈",
    credits:     3,
    estimatedMs: 1000,
    description: "Auto-generates trending health topics with heat, verdict and search-delta signals. Pick one to send to Stage 2.",
  },
  {
    id:          "viral_intelligence",
    name:        "Viral Sense",
    stage:       "input",
    icon:        "🔥",
    credits:     5,
    estimatedMs: 2500,
    description: "Searches YouTube Shorts/Long-form for top health content, extracts hooks and patterns",
  },
  {
    id:          "manual_input",
    name:        "Manual Topic",
    stage:       "input",
    icon:        "✍️",
    credits:     2,
    estimatedMs: 200,
    description: "Pass the topic directly to the process stage with no AI preprocessing",
  },
];

export const PROCESS_AGENTS = [
  {
    id:          "research_agent",
    name:        "Clinical Evidence",
    stage:       "process",
    icon:        "🔍",
    credits:     6,
    estimatedMs: 2200,
    color:       "indigo",
    description: "Step 1 · Searches PubMed, NIH & WHO databases. Pulls peer-reviewed papers, RCTs and meta-analyses — outputs a raw citation list with study data.",
  },
  {
    id:          "medical_validation",
    name:        "Fact-Checker",
    stage:       "process",
    icon:        "🩺",
    credits:     4,
    estimatedMs: 1800,
    color:       "indigo",
    description: "Step 2 · Reads the retrieved studies and scores every health claim: ✅ Strongly Supported · ⚠️ Limited Evidence · ❌ No Evidence. Adds citation badges.",
  },
  {
    id:          "safety",
    name:        "Safety Guard",
    stage:       "process",
    icon:        "🛡️",
    credits:     3,
    estimatedMs: 900,
    color:       "red",
    description: "Scans for dangerous 'cure' claims, adds disclaimers, outputs risk score",
  },
  {
    id:          "context_enrichment",
    name:        "Brand Context",
    stage:       "process",
    icon:        "✨",
    credits:     2,
    estimatedMs: 1600,
    color:       "purple",
    description: "Adds storytelling layers: cinema analogies, philosophy, psychology, spirituality",
  },
  {
    id:          "format_intelligence",
    name:        "Platform Optimizer",
    stage:       "process",
    icon:        "📐",
    credits:     2,
    estimatedMs: 900,
    color:       "purple",
    description: "Adapts pacing, adds speaking cues, optimises content length per platform",
  },
  {
    id:          "multilingual",
    name:        "Localization Engine",
    stage:       "process",
    icon:        "🌍",
    credits:     4,
    estimatedMs: 2400,
    color:       "teal",
    description: "Native-voice output in Tamil, Tanglish, Hindi, Malayalam, Telugu, Kannada",
  },
  {
    id:          "review",
    name:        "Final Polish",
    stage:       "process",
    icon:        "⭐",
    credits:     2,
    estimatedMs: 1400,
    color:       "amber",
    description: "Hallucination detection, citation check, quality scoring, compliance report",
  },
];

// ── Stage 3: Med Verify (subset of PROCESS_AGENTS) ───────────────────────────
export const MED_VERIFY_AGENTS = PROCESS_AGENTS.filter((a) =>
  ["research_agent", "medical_validation", "safety"].includes(a.id)
);

// ── Stage 4: Context Packaging (subset of PROCESS_AGENTS) ────────────────────
export const CONTEXT_AGENTS = PROCESS_AGENTS.filter((a) =>
  ["context_enrichment", "format_intelligence", "multilingual", "review"].includes(a.id)
);

// ── Audience Intelligence (Stage 2) ─────────────────────────────────────────
export const AUDIENCE_AGENTS = [
  {
    id:          "audience_intel",
    name:        "Audience Research",
    stage:       "audience",
    icon:        "🎯",
    credits:     4,
    estimatedMs: 1500,
    description: "Analyses audience pain points, emotional triggers and search intent to personalise every stage of the content pipeline.",
  },
];

// ── Enrichment Modules (Stage 4) ─────────────────────────────────────────────
// Free — change content TONE and STYLE without altering scientific facts.
export const ENRICHMENT_MODULES = [
  {
    id:          "enrichment_entertainment",
    name:        "Pop Culture",
    stage:       "enrichment",
    icon:        "🎬",
    credits:     4,
    estimatedMs: 400,
    description: "Pop culture hooks, relatable analogies, and storytelling flair that makes science fun",
  },
  {
    id:          "enrichment_cinema",
    name:        "Cinematic Framing",
    stage:       "enrichment",
    icon:        "🎞️",
    credits:     4,
    estimatedMs: 400,
    description: "Movie metaphors, dramatic narrative arcs, and cinematic storytelling techniques",
  },
  {
    id:          "enrichment_philosophy",
    name:        "Philosophical",
    stage:       "enrichment",
    icon:        "🏛️",
    credits:     4,
    estimatedMs: 400,
    description: "Big questions, ethical angles, and timeless wisdom woven into health insights",
  },
  {
    id:          "enrichment_psychology",
    name:        "Behavioral Psy",
    stage:       "enrichment",
    icon:        "🧠",
    credits:     4,
    estimatedMs: 400,
    description: "Behavioral insights, cognitive bias angles, and motivation science for lasting change",
  },
  {
    id:          "enrichment_productivity",
    name:        "Performance",
    stage:       "enrichment",
    icon:        "⚡",
    credits:     4,
    estimatedMs: 400,
    description: "Action-first framing, efficient systems, and habit stacking for peak performance",
  },
  {
    id:          "enrichment_spiritual",
    name:        "Mindfulness",
    stage:       "enrichment",
    icon:        "🌿",
    credits:     4,
    estimatedMs: 400,
    description: "Mind-body connection, holistic perspective, and inner wellness consciousness",
  },
  {
    id:          "enrichment_books",
    name:        "Literary",
    stage:       "enrichment",
    icon:        "📚",
    credits:     4,
    estimatedMs: 400,
    description: "Real book references — key author findings and quotes woven into every section",
  },
];

// ── Online output formats ─────────────────────────────────────────────────
export const OUTPUT_FORMATS_ONLINE = [
  {
    id: "instagram_reel", name: "Instagram Reel", stage: "output", icon: "🎞️",
    credits: 2, estimatedMs: 1800,
    description: "60-second viral reel script with hook, evidence beat, and CTA",
  },
  {
    id: "youtube_script", name: "YouTube Script", stage: "output", icon: "▶️",
    credits: 3, estimatedMs: 2500,
    description: "Full long-form script with timestamps, chapters, and description",
  },
  {
    id: "podcast_script", name: "Podcast Script", stage: "output", icon: "🎙️",
    credits: 3, estimatedMs: 2200,
    description: "Conversational audio-first script with host notes and segment structure",
  },
  {
    id: "webinar_script", name: "Webinar Script", stage: "output", icon: "📡",
    credits: 3, estimatedMs: 2400,
    description: "Slide-by-slide webinar flow with Q&A prompts and audience hooks",
  },
  {
    id: "twitter_thread", name: "Twitter Thread", stage: "output", icon: "🐦",
    credits: 1, estimatedMs: 1000,
    description: "Viral thread with hook tweet, evidence tweets, and CTA",
  },
  {
    id: "linkedin_post", name: "LinkedIn Post", stage: "output", icon: "💼",
    credits: 2, estimatedMs: 1200,
    description: "Professional health insight post with storytelling arc",
  },
];

// ── Offline output formats ────────────────────────────────────────────────
export const OUTPUT_FORMATS_OFFLINE = [
  {
    id: "blog_article", name: "Blog Article", stage: "output", icon: "📝",
    credits: 2, estimatedMs: 2000,
    description: "SEO-optimized long-form article with headings, citations, and meta description",
  },
  {
    id: "stage_speech", name: "Stage Speech", stage: "output", icon: "🎤",
    credits: 3, estimatedMs: 2300,
    description: "Live speaking script with pause cues, crowd interaction, and applause moments",
  },
  {
    id: "ted_talk", name: "TED Talk", stage: "output", icon: "💡",
    credits: 3, estimatedMs: 2500,
    description: "18-minute narrative arc with idea worth spreading and memorable closer",
  },
  {
    id: "workshop_guide", name: "Workshop Guide", stage: "output", icon: "📋",
    credits: 2, estimatedMs: 1800,
    description: "Facilitator guide with activities, discussion prompts, and handout copy",
  },
];

// ── Keep flat list for backward-compat with other consumers ───────────────
export const OUTPUT_FORMATS = [...OUTPUT_FORMATS_ONLINE, ...OUTPUT_FORMATS_OFFLINE];

// ── Online content features (added on top of any online format) ───────────
export const ONLINE_FEATURES = [
  { id: "hooks",      name: "Hooks",      icon: "⚡", description: "3 attention-grabbing opening hooks tailored to the platform algorithm" },
  { id: "carousel",   name: "Carousel",   icon: "🖼️", description: "Slide-by-slide carousel copy with title, body, and CTA per card" },
  { id: "caption",    name: "Caption",    icon: "≡",  description: "Platform-optimized caption with emojis, line breaks, and keyword density" },
  { id: "cta",        name: "CTA",        icon: "📣", description: "3 call-to-action variations (soft, medium, hard) for comments and saves" },
  { id: "thumbnails", name: "Thumbnails", icon: "🖼", description: "Thumbnail text options, contrast tips, and face-expression guidance" },
  { id: "hashtags",   name: "Hashtags",   icon: "#",  description: "Trending + niche hashtag set (5 big, 10 medium, 5 micro)" },
];

// ── Lookup helpers ──────────────────────────────────────────────────────────

const ALL_AGENTS = [...INPUT_AGENTS, ...AUDIENCE_AGENTS, ...PROCESS_AGENTS, ...ENRICHMENT_MODULES, ...OUTPUT_FORMATS];
const AGENT_MAP  = Object.fromEntries(ALL_AGENTS.map((a) => [a.id, a]));

export function getPipelineAgent(id) {
  return AGENT_MAP[id] || null;
}

export function calcPipelineCredits(inputAgent, audienceAgents = [], processAgents = [], contextAgents = [], enrichmentModules = [], outputFormats = []) {
  const inp = getPipelineAgent(inputAgent)?.credits || 0;
  const aud = audienceAgents.reduce((s, id)  => s + (getPipelineAgent(id)?.credits || 0), 0);
  const pro = processAgents.reduce((s, id)   => s + (getPipelineAgent(id)?.credits || 0), 0);
  const ctx = contextAgents.reduce((s, id)   => s + (getPipelineAgent(id)?.credits || 0), 0);
  // Enrichment modules are always 0 credits
  const out = outputFormats.reduce((s, id)   => s + (getPipelineAgent(id)?.credits || 0), 0);
  return inp + aud + pro + ctx + out;
}

export function calcPipelineMs(inputAgent, audienceAgents = [], processAgents = [], contextAgents = [], enrichmentModules = [], outputFormats = []) {
  const inp = getPipelineAgent(inputAgent)?.estimatedMs || 0;
  const aud = audienceAgents.reduce((s, id)  => s + (getPipelineAgent(id)?.estimatedMs || 0), 0);
  const pro = processAgents.reduce((s, id)   => s + (getPipelineAgent(id)?.estimatedMs || 0), 0);
  const ctx = contextAgents.reduce((s, id)   => s + (getPipelineAgent(id)?.estimatedMs || 0), 0);
  const enr = enrichmentModules.reduce((s, id) => s + (getPipelineAgent(id)?.estimatedMs || 0), 0);
  const out = outputFormats.reduce((s, id)   => s + (getPipelineAgent(id)?.estimatedMs || 0), 0);
  return Math.round((inp + aud + pro + ctx + enr + out) / 1000);
}
