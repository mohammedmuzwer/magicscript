// Agent Registry — 12 agents with full spec from Magic Script architecture.
// Icons stored as string keys; resolved in UI via ICON_MAP.

export const AGENT_CATEGORIES = {
  discovery:   { label: "Discovery",    color: "blue",   desc: "Find topics & analyse viral content" },
  research:    { label: "Research",     color: "indigo", desc: "Scientific evidence & validation" },
  safety:      { label: "Safety",       color: "red",    desc: "Medical safety & claim verification" },
  enrichment:  { label: "Enrichment",   color: "purple", desc: "Storytelling, format & structure" },
  output:      { label: "Output",       color: "teal",   desc: "Compose, distribute & translate" },
  review:      { label: "Review",       color: "amber",  desc: "Final quality & compliance check" },
};

export const CATEGORY_COLORS = {
  blue:   { bg: "bg-blue-500/12",   border: "border-blue-500/35",   text: "text-blue-400",   ring: "ring-blue-500/40",   dot: "#60a5fa" },
  indigo: { bg: "bg-indigo-500/12", border: "border-indigo-500/35", text: "text-indigo-400", ring: "ring-indigo-500/40", dot: "#818cf8" },
  red:    { bg: "bg-red-500/12",    border: "border-red-500/35",    text: "text-red-400",    ring: "ring-red-500/40",    dot: "#f87171" },
  purple: { bg: "bg-purple-500/12", border: "border-purple-500/35", text: "text-purple-400", ring: "ring-purple-500/40", dot: "#c084fc" },
  teal:   { bg: "bg-teal-400/12",   border: "border-teal-400/35",   text: "text-teal-400",   ring: "ring-teal-400/40",   dot: "#2dd4bf" },
  amber:  { bg: "bg-amber-500/12",  border: "border-amber-500/35",  text: "text-amber-400",  ring: "ring-amber-500/40",  dot: "#fbbf24" },
};

export const AGENT_REGISTRY = {

  // ── AGENT 1: Topic Intelligence ────────────────────────────────────────────
  topic_intelligence: {
    id: "topic_intelligence",
    agentNumber: 1,
    name: "Topic Intelligence",
    icon: "Lightbulb",
    category: "discovery",
    color: "blue",
    description: "Generates topic variations from trending health data or manual input. First-time users get general health trending topics.",
    credits: 1,
    estimatedMs: 1000,
    inputs: ["topic_text"],
    outputs: ["topic_variations", "trending_topics", "engagement_score"],
    compatibleWith: ["viral_intelligence", "research_agent", "safety"],
    config: {
      topic_source:      { type: "select", label: "Topic Source", options: ["manual", "trending_auto", "both"], default: "manual" },
      output_count:      { type: "number", label: "Topic Variations", default: 5, min: 1, max: 10 },
      include_questions: { type: "boolean", label: "Include Question Variants", default: true },
      niche:             { type: "select", label: "Health Niche", options: ["general", "nutrition", "fitness", "mental_health", "sleep", "supplements"], default: "general" },
    },
  },

  // ── AGENT 2: Viral Intelligence ────────────────────────────────────────────
  viral_intelligence: {
    id: "viral_intelligence",
    agentNumber: 2,
    name: "Viral Intelligence",
    icon: "TrendingUp",
    category: "discovery",
    color: "blue",
    description: "Searches YouTube (Shorts, Podcasts, Long-form) for top performing health videos. Extracts title, views, hooks, pacing, transcript and engagement signals. AI analyses why it performed.",
    credits: 3,
    estimatedMs: 2500,
    inputs: ["topic_variations", "topic_text"],
    outputs: ["top_videos", "viral_hooks", "emotional_triggers", "storytelling_structure", "retention_patterns"],
    compatibleWith: ["safety", "composition", "multilingual"],
    config: {
      platform:       { type: "select", label: "Platform", options: ["youtube_shorts", "youtube_longform", "youtube_podcast", "all_youtube"], default: "youtube_shorts" },
      results_count:  { type: "number", label: "Top Videos to Analyse", default: 10, min: 3, max: 20 },
      extract_transcript: { type: "boolean", label: "Extract Transcript", default: true },
      analyse_hooks:  { type: "boolean", label: "Analyse Hook Patterns", default: true },
    },
  },

  // ── AGENT 3: Evidence Retrieval ───────────────────────────────────────────
  research_agent: {
    id: "research_agent",
    agentNumber: 3,
    name: "Evidence Retrieval",
    icon: "Search",
    category: "research",
    color: "indigo",
    description: "Step 1 of verification — queries PubMed, NIH & WHO databases for your topic. Fetches peer-reviewed studies, RCTs and meta-analyses. Outputs a raw citation list with titles, authors, year, abstract and DOI.",
    credits: 3,
    estimatedMs: 2200,
    inputs: ["topic_text", "topic_variations"],
    outputs: ["studies", "study_summaries", "citations", "evidence_overview"],
    compatibleWith: ["medical_validation", "safety", "context_enrichment", "composition"],
    config: {
      max_studies:  { type: "number", label: "Max Studies", default: 8, min: 3, max: 20 },
      min_year:     { type: "number", label: "Published After", default: 2015, min: 2000, max: 2024 },
      study_types:  { type: "select", label: "Study Types", options: ["all", "rct_only", "meta_analysis", "reviews"], default: "all" },
      sources:      { type: "select", label: "Data Sources", options: ["pubmed", "pubmed+nih", "pubmed+nih+who"], default: "pubmed+nih" },
    },
  },

  // ── AGENT 4: Claim Validator ───────────────────────────────────────────────
  medical_validation: {
    id: "medical_validation",
    agentNumber: 4,
    name: "Claim Validator",
    icon: "Stethoscope",
    category: "research",
    color: "indigo",
    description: "Step 2 of verification — reads the retrieved studies and scores every health claim in your content: ✅ Strongly Supported · ⚠️ Limited Evidence · ❌ No Evidence. Attaches a citation badge to each claim.",
    credits: 2,
    estimatedMs: 1800,
    inputs: ["studies", "citations", "topic_text"],
    outputs: ["validated_claims", "confidence_scores", "citation_map", "unsupported_flags"],
    compatibleWith: ["safety", "context_enrichment", "composition", "review"],
    config: {
      strictness:       { type: "select", label: "Validation Strictness", options: ["lenient", "balanced", "strict"], default: "balanced" },
      flag_unsupported: { type: "boolean", label: "Flag Unsupported Claims", default: true },
      require_citation: { type: "boolean", label: "Require Citation Per Claim", default: true },
    },
  },

  // ── AGENT 5: Safety Guard ──────────────────────────────────────────────────
  safety: {
    id: "safety",
    agentNumber: 5,
    name: "Safety Guard",
    icon: "Shield",
    category: "safety",
    color: "red",
    description: "Scans for dangerous patterns: 'This cures…', 'Stop taking…', diagnosis language. Generates appropriate disclaimers. Outputs risk score (Low/Medium/High) and flags dangerous sentences.",
    credits: 1,
    estimatedMs: 900,
    inputs: ["validated_claims", "topic_text"],
    outputs: ["risk_score", "safe_claims", "disclaimer_text", "flagged_sentences"],
    compatibleWith: ["context_enrichment", "composition", "review"],
    config: {
      action_on_danger: { type: "select", label: "On Danger Detected", options: ["block", "rewrite", "flag_only"], default: "rewrite" },
      add_disclaimer:   { type: "boolean", label: "Auto-generate Disclaimer", default: true },
      risk_threshold:   { type: "select", label: "Risk Threshold", options: ["low", "medium", "high"], default: "medium" },
    },
  },

  // ── AGENT 7: Context Enrichment ─────────────────────────────────────────────
  context_enrichment: {
    id: "context_enrichment",
    agentNumber: 7,
    name: "Context Enrichment",
    icon: "Sparkles",
    category: "enrichment",
    color: "purple",
    description: "Adds storytelling layers based on selected modules: Entertainment (pop culture), Cinema (movie analogies), Philosophy (ancient wisdom), Psychology (behavioral science), Spiritual (mindfulness), Productivity (performance).",
    credits: 2,
    estimatedMs: 1600,
    inputs: ["safe_claims", "validated_claims", "evidence_overview"],
    outputs: ["enriched_sections", "module_references", "analogies", "storytelling_beats"],
    compatibleWith: ["format_intelligence", "composition", "review"],
    config: {
      modules:          { type: "select", label: "Enrichment Modules", options: ["entertainment", "cinema", "philosophy", "psychology", "spiritual", "productivity", "auto_select"], default: "auto_select" },
      intensity:        { type: "select", label: "Enrichment Intensity", options: ["light", "balanced", "heavy"], default: "balanced" },
      add_pop_culture:  { type: "boolean", label: "Pop Culture References", default: true },
    },
  },

  // ── AGENT 8: Format Intelligence ───────────────────────────────────────────
  format_intelligence: {
    id: "format_intelligence",
    agentNumber: 8,
    name: "Format Intelligence",
    icon: "Layout",
    category: "enrichment",
    color: "purple",
    description: "Adapts content for target platform. Adds speaking cues for offline formats (pauses, crowd interaction, applause moments). Optimises length, pacing and communication style per platform audience.",
    credits: 1,
    estimatedMs: 900,
    inputs: ["enriched_sections", "safe_claims"],
    outputs: ["formatted_script", "speaking_cues", "timing_map", "pacing_markers"],
    compatibleWith: ["composition", "multi_platform"],
    config: {
      primary_format: { type: "select", label: "Primary Format", options: ["reel", "youtube", "podcast", "webinar", "stage_speech", "linkedin"], default: "reel" },
      add_cues:       { type: "boolean", label: "Add Speaking Cues", default: true },
      content_length: { type: "select", label: "Length", options: ["short", "medium", "long"], default: "medium" },
    },
  },

  // ── AGENT 9: Content Composition ───────────────────────────────────────────
  composition: {
    id: "composition",
    agentNumber: 9,
    name: "Content Composition",
    icon: "FileText",
    category: "output",
    color: "teal",
    description: "Combines science, storytelling and emotional flow. Generates hooks (3 options), transitions and CTAs. Builds storytelling arc. Produces full script: intro → body → conclusion with platform pacing.",
    credits: 3,
    estimatedMs: 2200,
    inputs: ["formatted_script", "safe_claims", "enriched_sections", "viral_hooks"],
    outputs: ["hook_variants", "full_script", "cta_options", "narrative_arc"],
    compatibleWith: ["multi_platform", "multilingual", "review"],
    config: {
      hook_count:    { type: "number", label: "Hook Variants", default: 3, min: 1, max: 5 },
      cta_style:     { type: "select", label: "CTA Style", options: ["soft", "direct", "question", "challenge"], default: "soft" },
      arc_type:      { type: "select", label: "Narrative Arc", options: ["problem_solution", "myth_bust", "story_first", "data_first"], default: "problem_solution" },
    },
  },

  // ── AGENT 10: Multi-Platform Output ─────────────────────────────────────────
  multi_platform: {
    id: "multi_platform",
    agentNumber: 10,
    name: "Multi-Platform Output",
    icon: "Layers",
    category: "output",
    color: "teal",
    description: "Converts one generation into all selected formats simultaneously: Instagram Reel, YouTube (with timestamps), Podcast, Webinar, Stage Speech, Twitter/X Thread, LinkedIn Post, Carousel, Blog Article.",
    credits: 3,
    estimatedMs: 2000,
    inputs: ["full_script", "hook_variants", "cta_options"],
    outputs: ["reel_script", "youtube_script", "podcast_script", "webinar_structure", "stage_speech", "twitter_thread", "linkedin_post", "carousel_copy", "blog_article"],
    compatibleWith: ["multilingual", "review"],
    config: {
      formats: { type: "select", label: "Output Formats", options: ["social_only", "long_form_only", "all_formats", "custom"], default: "all_formats" },
      include_timestamps: { type: "boolean", label: "YouTube Timestamps", default: true },
      include_blog:       { type: "boolean", label: "Blog Article", default: true },
    },
  },

  // ── AGENT 11: Multilingual ─────────────────────────────────────────────────
  multilingual: {
    id: "multilingual",
    agentNumber: 11,
    name: "Multilingual",
    icon: "Globe",
    category: "output",
    color: "teal",
    description: "Translates and culturally adapts content to sound native — not literally translated. Matches creator culture, idioms and regional audience expectations. Supports all 7 languages independently per output.",
    credits: 3,
    estimatedMs: 2400,
    inputs: ["full_script", "reel_script", "cta_options"],
    outputs: ["language_variants", "cultural_notes"],
    compatibleWith: ["review"],
    config: {
      languages:    { type: "select", label: "Languages", options: ["tanglish", "tamil", "hindi", "malayalam", "telugu", "kannada", "all_regional"], default: "tanglish" },
      native_voice: { type: "boolean", label: "Native Creator Voice", default: true },
      emojis:       { type: "boolean", label: "Creator Emojis", default: true },
    },
  },

  // ── AGENT 12: Final Review ─────────────────────────────────────────────────
  review: {
    id: "review",
    agentNumber: 12,
    name: "Final Review",
    icon: "Star",
    category: "review",
    color: "amber",
    description: "Hallucination detection — every claim must have a sourced citation. Safety consistency check. Grammar, tone and formatting review. Flags 'Limited Evidence' sections for human approval. Returns safety compliance report.",
    credits: 2,
    estimatedMs: 1400,
    inputs: ["full_script", "citation_map", "risk_score", "language_variants"],
    outputs: ["approved_script", "flagged_sections", "final_citations", "compliance_report", "quality_score"],
    compatibleWith: [],
    config: {
      hallucination_check: { type: "boolean", label: "Hallucination Detection", default: true },
      flag_limited_evidence: { type: "boolean", label: "Flag Limited Evidence", default: true },
      min_quality_score:   { type: "number", label: "Min Quality Score", default: 80, min: 50, max: 100 },
    },
  },
};

export const AGENT_LIST = Object.values(AGENT_REGISTRY);

export const AGENTS_BY_CATEGORY = AGENT_LIST.reduce((acc, agent) => {
  if (!acc[agent.category]) acc[agent.category] = [];
  acc[agent.category].push(agent);
  return acc;
}, {});

export function getAgent(id) {
  return AGENT_REGISTRY[id] || null;
}
