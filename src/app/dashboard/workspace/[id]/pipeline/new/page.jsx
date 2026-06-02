"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, Zap, Clock, Play, Check, Search, Info, TrendingUp, Eye, ThumbsUp, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { INPUT_AGENTS, PROCESS_AGENTS, ENRICHMENT_MODULES, OUTPUT_FORMATS, calcPipelineCredits, calcPipelineMs } from "@/lib/pipeline-registry";

// ── Mock viral video data ─────────────────────────────────────────────────────
const MOCK_VIDEOS = [
  { id: "v1", title: "This Supplement Actually Works (Science Proof)", channel: "HealthScope", views: "2.4M", likes: "148K", engagement: "6.1%", viralScore: 94, duration: "12:34", hook: "\"They told you it doesn't work. The studies say otherwise.\"", thumbnail: "from-blue-500 to-purple-600" },
  { id: "v2", title: "I Tested This For 90 Days — Real Results", channel: "EvidenceFirst", views: "1.8M", likes: "112K", engagement: "5.9%", viralScore: 91, duration: "18:22", hook: "\"90 days. 12 blood markers. 1 honest verdict.\"", thumbnail: "from-emerald-500 to-teal-600" },
  { id: "v3", title: "Doctor Reacts: The #1 Trending Health Claim", channel: "MedFacts", views: "3.1M", likes: "201K", engagement: "7.3%", viralScore: 97, duration: "9:45", hook: "\"My patients keep asking about this. Let's settle it.\"", thumbnail: "from-rose-500 to-orange-500" },
  { id: "v4", title: "The Truth Nobody Is Saying About This Topic", channel: "ScienceDaily", views: "987K", likes: "67K", engagement: "4.8%", viralScore: 83, duration: "14:10", hook: "\"The study everyone ignores changes everything.\"", thumbnail: "from-violet-500 to-indigo-600" },
  { id: "v5", title: "Why You're Doing It Wrong (Backed by Research)", channel: "WellnessLab", views: "1.2M", likes: "89K", engagement: "5.4%", viralScore: 87, duration: "11:05", hook: "\"Most people get 80% of the benefit. Here's the other 20%.\"", thumbnail: "from-amber-500 to-yellow-500" },
  { id: "v6", title: "I Read 47 Studies So You Don't Have To", channel: "ResearchBro", views: "756K", likes: "52K", engagement: "4.2%", viralScore: 79, duration: "22:18", hook: "\"47 studies. One clear winner. And the rest were rubbish.\"", thumbnail: "from-cyan-500 to-blue-600" },
  { id: "v7", title: "This Changed My Mind Completely (Expert Opinion)", channel: "HealthUnfiltered", views: "2.0M", likes: "134K", engagement: "6.7%", viralScore: 92, duration: "16:30", hook: "\"I was wrong. Here's the evidence that convinced me.\"", thumbnail: "from-fuchsia-500 to-pink-600" },
  { id: "v8", title: "What Happens After 30 Days? The Honest Update", channel: "TrackMyHealth", views: "544K", likes: "38K", engagement: "3.9%", viralScore: 74, duration: "8:55", hook: "\"30-day experiment complete. The results surprised even me.\"", thumbnail: "from-lime-500 to-green-600" },
  { id: "v9", title: "Experts Disagree On This — Here's Both Sides", channel: "BalancedView", views: "1.5M", likes: "98K", engagement: "5.6%", viralScore: 88, duration: "20:04", hook: "\"Two leading researchers. Opposite conclusions. You decide.\"", thumbnail: "from-orange-500 to-red-600" },
  { id: "v10", title: "The Hidden Side Effect Nobody Mentions", channel: "DeepDive", views: "3.4M", likes: "218K", engagement: "7.9%", viralScore: 98, duration: "13:47", hook: "\"It's in the fine print of every study. Nobody talks about it.\"", thumbnail: "from-teal-500 to-cyan-600" },
];

const VIDEO_COUNT_OPTIONS = [2, 5, 10];

// ── Viral Intelligence Panel ──────────────────────────────────────────────────
function ViralPanel({ selectedVideos, onToggle, maxVideos, setMaxVideos }) {
  const [query, setQuery] = useState("");
  const filtered = query.trim()
    ? MOCK_VIDEOS.filter((v) => v.title.toLowerCase().includes(query.toLowerCase()) || v.channel.toLowerCase().includes(query.toLowerCase()))
    : MOCK_VIDEOS;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-4 py-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-rose-400" />
          <span className="text-xs font-bold text-rose-400">Viral Intelligence Search</span>
          <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-400">
            {selectedVideos.length}/{maxVideos} selected
          </span>
        </div>
        {/* Max video selector */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-faint">Analyse</span>
          {VIDEO_COUNT_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setMaxVideos(n)}
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition ${
                maxVideos === n ? "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30" : "text-faint hover:text-soft"
              }`}
            >
              {n}
            </button>
          ))}
          <span className="text-[10px] text-faint">videos</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 border-b border-[rgb(var(--border))] px-3 py-2">
        <Search size={13} className="text-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search viral videos…"
          className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-faint"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-faint hover:text-soft">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Video list */}
      <div className="max-h-[480px] space-y-2 overflow-y-auto p-3">
        {filtered.map((video) => {
          const isSelected = selectedVideos.includes(video.id);
          const isDisabled = !isSelected && selectedVideos.length >= maxVideos;
          return (
            <button
              key={video.id}
              onClick={() => !isDisabled && onToggle(video.id)}
              disabled={isDisabled}
              className={`flex w-full gap-3 rounded-xl border p-3 text-left transition ${
                isSelected
                  ? "border-rose-500/40 bg-rose-500/8 ring-1 ring-rose-500/20"
                  : isDisabled
                  ? "cursor-not-allowed border-[rgb(var(--border))] opacity-40"
                  : "border-[rgb(var(--border))] hover:border-rose-500/25 hover:bg-[rgb(var(--panel))]"
              }`}
            >
              {/* Thumbnail */}
              <div className={`relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${video.thumbnail}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-black/40">
                    <Play size={10} className="text-white" fill="white" />
                  </div>
                </div>
                <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-bold text-white">
                  {video.duration}
                </span>
                {/* Viral score */}
                <span className={`absolute top-1 left-1 rounded px-1 py-0.5 text-[9px] font-bold ${
                  video.viralScore >= 90 ? "bg-rose-500 text-white" :
                  video.viralScore >= 80 ? "bg-orange-500 text-white" :
                  "bg-gray-700 text-white"
                }`}>
                  🔥{video.viralScore}
                </span>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[12px] font-semibold leading-snug">{video.title}</p>
                <p className="mt-0.5 text-[10px] text-faint">{video.channel}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 text-[10px] text-faint"><Eye size={9} />{video.views}</span>
                  <span className="flex items-center gap-1 text-[10px] text-faint"><ThumbsUp size={9} />{video.likes}</span>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">{video.engagement} eng.</span>
                </div>
                <p className="mt-1.5 rounded bg-[rgb(var(--panel))] px-2 py-1 text-[10px] italic text-soft">
                  Hook: {video.hook}
                </p>
              </div>

              {/* Checkbox */}
              <div className={`mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-md border transition ${
                isSelected ? "border-rose-500 bg-rose-500" : "border-[rgb(var(--border))]"
              }`}>
                {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selection summary */}
      {selectedVideos.length > 0 && (
        <div className="border-t border-[rgb(var(--border))] bg-rose-500/5 px-4 py-2.5">
          <p className="text-[11px] font-semibold text-rose-400">
            {selectedVideos.length} video{selectedVideos.length !== 1 ? "s" : ""} selected — hooks & patterns will be extracted for your pipeline
          </p>
        </div>
      )}
    </div>
  );
}

// ── Agent selector card ───────────────────────────────────────────────────────
function AgentCard({ agent, selected, onToggle, disabled, variant = "checkbox", accentColor = "cyan" }) {
  const isActive = selected;
  const accent = {
    cyan:   { ring: "border-cyan/60 bg-cyan/8 ring-1 ring-cyan/25 shadow-glow-sm", check: "border-cyan bg-cyan", badge: "bg-cyan/20 text-cyan" },
    amber:  { ring: "border-amber-500/60 bg-amber-500/8 ring-1 ring-amber-500/25", check: "border-amber-500 bg-amber-500", badge: "bg-amber-500/20 text-amber-400" },
    rose:   { ring: "border-rose-500/60 bg-rose-500/8 ring-1 ring-rose-500/25", check: "border-rose-500 bg-rose-500", badge: "bg-rose-500/20 text-rose-400" },
  }[accentColor] || { ring: "border-cyan/60 bg-cyan/8 ring-1 ring-cyan/25 shadow-glow-sm", check: "border-cyan bg-cyan", badge: "bg-cyan/20 text-cyan" };

  return (
    <button
      onClick={() => !disabled && onToggle(agent.id)}
      disabled={disabled}
      className={`
        group flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-150
        ${isActive
          ? accent.ring
          : disabled
          ? "cursor-not-allowed border-[rgb(var(--border))] opacity-35"
          : "border-[rgb(var(--border))] bg-[rgb(var(--panel))] hover:border-cyan/35 hover:bg-[rgb(var(--bg-soft))]"}
      `}
    >
      <div className={`
        mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-${variant === "radio" ? "full" : "md"} border transition
        ${isActive ? accent.check : "border-[rgb(var(--border))]"}
      `}>
        {isActive && <Check size={10} className="text-navy-950 font-bold" strokeWidth={3} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{agent.icon}</span>
          <span className="text-sm font-semibold">{agent.name}</span>
          <span className={`ml-auto flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
            isActive ? accent.badge : "bg-[rgb(var(--bg-soft))] text-faint"
          }`}>
            {agent.credits === 0 ? (
              <><Sparkles size={8} /> FREE</>
            ) : (
              <><Zap size={8} /> {agent.credits}cr</>
            )}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-faint">{agent.description}</p>
      </div>
    </button>
  );
}

// ── Stage section wrapper ─────────────────────────────────────────────────────
function StageSection({ stageNum, label, subtitle, children, totalCredits, color }) {
  const colorMap = {
    input:      { dot: "bg-blue-500",   label: "text-blue-300" },
    process:    { dot: "bg-purple-500", label: "text-purple-300" },
    enrichment: { dot: "bg-amber-500",  label: "text-amber-300" },
    output:     { dot: "bg-teal-500",   label: "text-teal-300" },
  };
  const c = colorMap[color] || colorMap.process;
  return (
    <div className="overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]">
      <div className="flex items-start justify-between border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-5 py-4">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white ${c.dot}`}>
            {stageNum}
          </span>
          <div>
            <p className="font-display text-base font-bold">{label}</p>
            <p className="mt-0.5 text-xs text-faint">{subtitle}</p>
          </div>
        </div>
        {totalCredits > 0 ? (
          <span className="flex items-center gap-1 rounded-full bg-[rgb(var(--bg-soft))] px-2.5 py-1 text-xs font-bold">
            <Zap size={11} className="text-cyan" />
            <span className="text-cyan">{totalCredits}cr</span>
          </span>
        ) : color === "enrichment" ? (
          <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-400">
            <Sparkles size={11} /> FREE
          </span>
        ) : null}
      </div>
      <div className="space-y-2 p-4">{children}</div>
    </div>
  );
}

// ── Credit summary footer ─────────────────────────────────────────────────────
function CreditSummary({ inputAgent, processAgents, enrichmentModules, outputFormats, onRun, topic, isReady }) {
  const total   = calcPipelineCredits(inputAgent, [], processAgents, [], enrichmentModules, outputFormats);
  const estSecs = calcPipelineMs(inputAgent, [], processAgents, [], enrichmentModules, outputFormats);
  const agents  = [inputAgent, ...processAgents, ...enrichmentModules, ...outputFormats].filter(Boolean);

  return (
    <div className="sticky bottom-0 rounded-2xl border border-cyan/30 bg-[rgb(var(--panel))] shadow-2xl">
      <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-5 py-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5 font-bold">
            <Zap size={14} className="text-cyan" />
            <span className="text-cyan text-lg font-display">{total}</span>
            <span className="text-faint text-xs">credits</span>
          </span>
          <span className="flex items-center gap-1.5 text-faint text-xs">
            <Clock size={12} /> ~{estSecs}s
          </span>
          <span className="text-faint text-xs">{agents.length} agents</span>
          {enrichmentModules.length > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400">
              <Sparkles size={9} /> {enrichmentModules.length} enrichment
            </span>
          )}
        </div>
        <button
          onClick={onRun}
          disabled={!isReady}
          className="btn btn-primary gap-2 px-5 py-2.5 disabled:opacity-40"
        >
          <Play size={14} /> Run Pipeline
        </button>
      </div>
      {!topic.trim() && (
        <div className="flex items-center gap-2 px-5 py-2 text-xs text-amber-400">
          <Info size={12} /> Enter a health topic above to run
        </div>
      )}
      {topic.trim() && !isReady && (
        <div className="flex items-center gap-2 px-5 py-2 text-xs text-amber-400">
          <Info size={12} /> Select at least 1 input source and 1 output format
        </div>
      )}
    </div>
  );
}

// ── Main Pipeline Builder page ────────────────────────────────────────────────
function PipelineBuilderInner() {
  const { id: workspaceId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [topic,              setTopic]              = useState("");
  const [inputAgent,         setInputAgent]         = useState("topic_intelligence");
  const [processAgents,      setProcessAgents]      = useState([]);
  const [enrichmentModules,  setEnrichmentModules]  = useState([]);
  const [outputFormats,      setOutputFormats]      = useState([]);
  // Viral Intelligence state
  const [selectedVideos,     setSelectedVideos]     = useState([]);
  const [maxVideos,          setMaxVideos]          = useState(5);

  useEffect(() => {
    const t = searchParams.get("topic");
    if (t) setTopic(decodeURIComponent(t));
  }, [searchParams]);

  function toggleProcess(agentId) {
    setProcessAgents((prev) =>
      prev.includes(agentId) ? prev.filter((a) => a !== agentId) : [...prev, agentId]
    );
  }

  function toggleEnrichment(moduleId) {
    setEnrichmentModules((prev) =>
      prev.includes(moduleId) ? prev.filter((m) => m !== moduleId) : [...prev, moduleId]
    );
  }

  function toggleOutput(formatId) {
    setOutputFormats((prev) => {
      if (prev.includes(formatId)) return prev.filter((f) => f !== formatId);
      if (prev.length >= 3) return prev;
      return [...prev, formatId];
    });
  }

  function toggleVideo(videoId) {
    setSelectedVideos((prev) =>
      prev.includes(videoId) ? prev.filter((v) => v !== videoId) : [...prev, videoId]
    );
  }

  function handleRun() {
    if (!topic.trim() || !inputAgent || outputFormats.length === 0) return;
    // If viral intelligence selected, require at least 1 video
    if (inputAgent === "viral_intelligence" && selectedVideos.length === 0) return;
    const params = new URLSearchParams({
      topic:       encodeURIComponent(topic.trim()),
      input:       inputAgent,
      process:     processAgents.join(","),
      enrichment:  enrichmentModules.join(","),
      output:      outputFormats.join(","),
    });
    router.push(`/dashboard/workspace/${workspaceId}/workflow/new?${params.toString()}`);
  }

  const isReady = topic.trim().length > 0 && !!inputAgent && outputFormats.length > 0 &&
    (inputAgent !== "viral_intelligence" || selectedVideos.length > 0);

  const inputCredits      = INPUT_AGENTS.find((a) => a.id === inputAgent)?.credits || 0;
  const processCredits    = processAgents.reduce((s, id) => s + (PROCESS_AGENTS.find((a) => a.id === id)?.credits || 0), 0);
  const outputCredits     = outputFormats.reduce((s, id)  => s + (OUTPUT_FORMATS.find((a) => a.id === id)?.credits  || 0), 0);

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-5">
        <Link
          href={`/dashboard/workspace/${workspaceId}`}
          className="flex items-center gap-1.5 text-xs font-semibold text-faint transition hover:text-[rgb(var(--text))]"
        >
          <ChevronLeft size={14} /> Back to Workspace
        </Link>
        <div className="h-4 w-px bg-[rgb(var(--border))]" />
        <h1 className="font-display text-sm font-bold">Build Custom Pipeline</h1>
        <div className="flex-1" />
        <span className="hidden items-center gap-1.5 text-xs text-faint sm:flex">
          <Zap size={12} className="text-cyan" />
          <span className="font-bold text-cyan">
            {calcPipelineCredits(inputAgent, [], processAgents, [], enrichmentModules, outputFormats)}
          </span>
          credits
        </span>
      </header>

      <div className="mx-auto max-w-2xl space-y-6 px-5 py-6 pb-32">
        {/* Topic input */}
        <div className={`flex items-center gap-2 rounded-2xl border bg-[rgb(var(--panel))] p-3 transition-all ${
          topic.trim() ? "border-cyan/50 shadow-glow-sm" : "border-[rgb(var(--border))]"
        } focus-within:border-cyan/50`}>
          <Search size={17} className="ml-1.5 shrink-0 text-faint" />
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What health topic should this pipeline process?"
            className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none placeholder:text-faint"
          />
          {topic.trim() && (
            <span className="shrink-0 rounded-full bg-cyan/15 px-2.5 py-0.5 text-xs font-bold text-cyan">✓</span>
          )}
        </div>

        {/* Stage 1: INPUT */}
        <StageSection
          stageNum="1"
          label="Input Source"
          subtitle="How does the topic enter the pipeline? (Pick exactly 1)"
          color="input"
          totalCredits={inputCredits}
        >
          {INPUT_AGENTS.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              selected={inputAgent === agent.id}
              onToggle={(id) => { setInputAgent(id); if (id !== "viral_intelligence") setSelectedVideos([]); }}
              variant="radio"
            />
          ))}

          {/* Viral Intelligence expanded panel */}
          {inputAgent === "viral_intelligence" && (
            <ViralPanel
              selectedVideos={selectedVideos}
              onToggle={toggleVideo}
              maxVideos={maxVideos}
              setMaxVideos={(n) => { setMaxVideos(n); setSelectedVideos([]); }}
            />
          )}
        </StageSection>

        {/* Stage 2: PROCESS */}
        <StageSection
          stageNum="2"
          label="Processing Agents"
          subtitle="Add any combination of agents — they run in order (optional)"
          color="process"
          totalCredits={processCredits}
        >
          {PROCESS_AGENTS.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              selected={processAgents.includes(agent.id)}
              onToggle={toggleProcess}
              variant="checkbox"
            />
          ))}
        </StageSection>

        {/* Stage 3: ENRICHMENT */}
        <StageSection
          stageNum="3"
          label="Enrichment Layer"
          subtitle="Style your content's tone — free, optional, multi-select"
          color="enrichment"
          totalCredits={0}
        >
          <div className="mb-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-400/80">
            Enrichment modules change the <strong>tone and style</strong> of your content without altering the scientific facts. All modules are free.
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {ENRICHMENT_MODULES.map((module) => (
              <AgentCard
                key={module.id}
                agent={module}
                selected={enrichmentModules.includes(module.id)}
                onToggle={toggleEnrichment}
                variant="checkbox"
                accentColor="amber"
              />
            ))}
          </div>
        </StageSection>

        {/* Stage 4: OUTPUT */}
        <StageSection
          stageNum="4"
          label="Output Formats"
          subtitle={`Choose 1–3 delivery formats${outputFormats.length === 3 ? " (maximum reached)" : ""}`}
          color="output"
          totalCredits={outputCredits}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {OUTPUT_FORMATS.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                selected={outputFormats.includes(agent.id)}
                onToggle={toggleOutput}
                disabled={outputFormats.length >= 3 && !outputFormats.includes(agent.id)}
                variant="checkbox"
              />
            ))}
          </div>
        </StageSection>
      </div>

      {/* Sticky credit summary + run button */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-4 lg:left-[260px]">
        <div className="mx-auto max-w-2xl">
          <CreditSummary
            inputAgent={inputAgent}
            processAgents={processAgents}
            enrichmentModules={enrichmentModules}
            outputFormats={outputFormats}
            topic={topic}
            isReady={isReady}
            onRun={handleRun}
          />
        </div>
      </div>
    </div>
  );
}

export default function PipelineBuilderPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[rgb(var(--bg))]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan border-t-transparent" />
      </div>
    }>
      <PipelineBuilderInner />
    </Suspense>
  );
}
