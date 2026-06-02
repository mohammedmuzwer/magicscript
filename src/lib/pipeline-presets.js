// Six preset pipelines following the INPUT → PROCESS → OUTPUT structure.
// These are the presets shown in workspace detail (Screen 2).

import { calcPipelineCredits } from "@/lib/pipeline-registry";

export const PIPELINE_PRESETS = [
  {
    id:            "instagram_reel",
    name:          "Instagram Reel",
    emoji:         "🎞️",
    description:   "60-sec viral reel",
    inputAgent:    "viral_intelligence",
    processAgents: ["safety"],
    outputFormats: ["instagram_reel"],
    credits:       7,
    color:         "from-pink-500/15 to-rose-500/8 border-pink-500/25 hover:border-pink-500/50",
    dot:           "bg-pink-400",
  },
  {
    id:            "youtube_long",
    name:          "YouTube Long Form",
    emoji:         "▶️",
    description:   "Full script + timestamps",
    inputAgent:    "topic_intelligence",
    processAgents: ["research_agent", "medical_validation", "context_enrichment"],
    outputFormats: ["youtube_script"],
    credits:       12,
    color:         "from-red-500/15 to-orange-500/8 border-red-500/25 hover:border-red-500/50",
    dot:           "bg-red-400",
  },
  {
    id:            "podcast",
    name:          "Podcast Episode",
    emoji:         "🎙️",
    description:   "Audio-first storytelling",
    inputAgent:    "topic_intelligence",
    processAgents: ["research_agent", "context_enrichment", "format_intelligence"],
    outputFormats: ["podcast_script"],
    credits:       12,
    color:         "from-purple-500/15 to-indigo-500/8 border-purple-500/25 hover:border-purple-500/50",
    dot:           "bg-purple-400",
  },
  {
    id:            "quick_draft",
    name:          "Quick Draft",
    emoji:         "⚡",
    description:   "No research — just compose",
    inputAgent:    "manual_input",
    processAgents: [],
    outputFormats: ["instagram_reel"],
    credits:       2,
    color:         "from-cyan/15 to-electric/8 border-cyan/25 hover:border-cyan/50",
    dot:           "bg-cyan",
  },
  {
    id:            "scientific_deep_dive",
    name:          "Scientific Deep Dive",
    emoji:         "🔬",
    description:   "Maximum evidence quality",
    inputAgent:    "topic_intelligence",
    processAgents: ["research_agent", "medical_validation", "safety", "review"],
    outputFormats: ["blog_article", "youtube_script"],
    credits:       15,
    color:         "from-indigo-500/15 to-purple-500/8 border-indigo-500/25 hover:border-indigo-500/50",
    dot:           "bg-indigo-400",
  },
  {
    id:            "full_pipeline",
    name:          "Full Pipeline",
    emoji:         "🚀",
    description:   "Every agent, max quality",
    inputAgent:    "viral_intelligence",
    processAgents: ["research_agent", "medical_validation", "safety", "context_enrichment", "format_intelligence", "review"],
    outputFormats: ["instagram_reel", "blog_article", "twitter_thread"],
    credits:       24,
    color:         "from-amber-500/15 to-orange-500/8 border-amber-500/25 hover:border-amber-500/50",
    dot:           "bg-amber-400",
  },
];

export const PRESET_LIST = PIPELINE_PRESETS;
export const PRESET_MAP  = Object.fromEntries(PIPELINE_PRESETS.map((p) => [p.id, p]));

export function getPreset(id) {
  return PRESET_MAP[id] || null;
}

// Returns ALL agent IDs in execution order (input → process → output)
export function getPresetAgentOrder(preset) {
  if (!preset) return [];
  return [preset.inputAgent, ...preset.processAgents, ...preset.outputFormats];
}
