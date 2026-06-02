// Preset workflow templates — transformer-style auto-wiring.
// Each preset auto-connects the right agents for the target format.

const GAP_X  = 250;
const NODE_Y  = 200;

function makeNodes(types) {
  return types.map((type, i) => ({
    id:             `preset_${type}_${i}`,
    type:           "agentNode",
    position:       { x: 80 + i * GAP_X, y: NODE_Y },
    sourcePosition: "right",
    targetPosition: "left",
    data:           { agentType: type, status: "idle", config: {}, result: null },
  }));
}

function makeEdges(nodes) {
  return nodes.slice(0, -1).map((n, i) => ({
    id:     `e_${n.id}_${nodes[i + 1].id}`,
    source: n.id,
    target: nodes[i + 1].id,
    type:   "smoothstep",
    animated: false,
    style:  { stroke: "rgba(91,140,255,0.5)", strokeWidth: 2 },
  }));
}

export const WORKFLOW_PRESETS = {
  // ── 1. Instagram Reel ──────────────────────────────────────────────────────
  instagram_reel: {
    id:          "instagram_reel",
    name:        "Instagram Reel",
    emoji:       "🎞️",
    description: "60-second viral reel: topic → viral hooks → safety → compose → multilingual",
    credits:     11,
    color:       "pink",
    agentTypes:  ["topic_intelligence", "viral_intelligence", "safety", "composition", "multi_platform", "multilingual"],
  },

  // ── 2. YouTube Long Form ───────────────────────────────────────────────────
  youtube_long: {
    id:          "youtube_long",
    name:        "YouTube Long Form",
    emoji:       "▶️",
    description: "10–30 min script with timestamps: research → validate → enrich → compose → review",
    credits:     14,
    color:       "red",
    agentTypes:  ["topic_intelligence", "research_agent", "medical_validation", "safety", "context_enrichment", "format_intelligence", "composition", "multi_platform", "review"],
  },

  // ── 3. Podcast Episode ─────────────────────────────────────────────────────
  podcast: {
    id:          "podcast",
    name:        "Podcast Episode",
    emoji:       "🎙️",
    description: "Audio-first storytelling: research → enrich with philosophy/psychology → format → compose",
    credits:     12,
    color:       "purple",
    agentTypes:  ["topic_intelligence", "research_agent", "context_enrichment", "format_intelligence", "composition", "multi_platform"],
  },

  // ── 4. Stage Speech ────────────────────────────────────────────────────────
  stage_speech: {
    id:          "stage_speech",
    name:        "Stage Speech",
    emoji:       "🎤",
    description: "Live speaking: validate → enrich with cinema/philosophy → speaking cues → compose → review",
    credits:     13,
    color:       "orange",
    agentTypes:  ["topic_intelligence", "research_agent", "medical_validation", "safety", "context_enrichment", "format_intelligence", "composition", "review"],
  },

  // ── 5. Tamil Creator Pack ──────────────────────────────────────────────────
  tamil_creator: {
    id:          "tamil_creator",
    name:        "Tamil Creator Pack",
    emoji:       "🔥",
    description: "High-energy Tanglish/Tamil/Hindi content: viral analysis → safety → compose → multilingual",
    credits:     10,
    color:       "orange",
    agentTypes:  ["topic_intelligence", "viral_intelligence", "safety", "composition", "multilingual"],
  },

  // ── 6. Full Pipeline ───────────────────────────────────────────────────────
  full_pipeline: {
    id:          "full_pipeline",
    name:        "Full Pipeline",
    emoji:       "⚡",
    description: "All 12 agents — maximum quality output across every platform and language",
    credits:     24,
    color:       "purple",
    agentTypes:  [
      "topic_intelligence", "viral_intelligence", "research_agent",
      "medical_validation", "safety", "context_enrichment",
      "format_intelligence", "composition", "multi_platform",
      "multilingual", "review",
    ],
  },
};

export const PRESET_LIST = Object.values(WORKFLOW_PRESETS);

export function loadPreset(presetId) {
  const preset = WORKFLOW_PRESETS[presetId];
  if (!preset) return null;
  const nodes = makeNodes(preset.agentTypes);
  const edges = makeEdges(nodes);
  return { nodes, edges, preset };
}
