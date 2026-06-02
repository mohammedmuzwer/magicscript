"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, ArrowRight, Wand2, Workflow,
  Play, Zap, ChevronRight,
} from "lucide-react";
import { SUGGESTED_TOPICS } from "@/lib/mock-data";

// Preset cards shown below the search bar — clicking one goes to
// the Workflow Builder with the topic + preset pre-loaded.
const QUICK_PRESETS = [
  {
    id:    "instagram_reel",
    emoji: "🎞️",
    name:  "Instagram Reel",
    desc:  "60-sec viral script",
    agents: ["Topic", "Viral", "Safety", "Compose", "Distribute", "Multilingual"],
    credits: 11,
    color: "from-pink-500/15 to-rose-500/8 border-pink-500/25 hover:border-pink-500/50",
    dot:   "bg-pink-400",
  },
  {
    id:    "youtube_long",
    emoji: "▶️",
    name:  "YouTube Long Form",
    desc:  "Full script + timestamps",
    agents: ["Topic", "Research", "Validate", "Safety", "Enrich", "Format", "Compose", "Review"],
    credits: 14,
    color: "from-red-500/15 to-orange-500/8 border-red-500/25 hover:border-red-500/50",
    dot:   "bg-red-400",
  },
  {
    id:    "podcast",
    emoji: "🎙️",
    name:  "Podcast Episode",
    desc:  "Audio-first storytelling",
    agents: ["Topic", "Research", "Enrich", "Format", "Compose", "Distribute"],
    credits: 12,
    color: "from-purple-500/15 to-indigo-500/8 border-purple-500/25 hover:border-purple-500/50",
    dot:   "bg-purple-400",
  },
  {
    id:    "stage_speech",
    emoji: "🎤",
    name:  "Stage Speech",
    desc:  "Live speaking with cues",
    agents: ["Topic", "Research", "Validate", "Safety", "Enrich", "Format", "Compose", "Review"],
    credits: 13,
    color: "from-amber-500/15 to-yellow-500/8 border-amber-500/25 hover:border-amber-500/50",
    dot:   "bg-amber-400",
  },
  {
    id:    "tamil_creator",
    emoji: "🔥",
    name:  "Tamil Creator Pack",
    desc:  "Tanglish · Tamil · Hindi",
    agents: ["Topic", "Viral", "Safety", "Compose", "Multilingual"],
    credits: 10,
    color: "from-orange-500/15 to-red-500/8 border-orange-500/25 hover:border-orange-500/50",
    dot:   "bg-orange-400",
  },
  {
    id:    "full_pipeline",
    emoji: "⚡",
    name:  "Full Pipeline",
    desc:  "All 12 agents — max quality",
    agents: ["All 11 agents"],
    credits: 24,
    color: "from-cyan/15 to-electric/8 border-cyan/25 hover:border-cyan/50",
    dot:   "bg-cyan",
  },
];

export default function AISearch() {
  const router = useRouter();
  const [value,     setValue]     = useState("");
  const [focused,   setFocused]   = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const idx  = useRef(0);
  const char = useRef(0);
  const dir  = useRef(1);

  // Typewriter placeholder animation
  useEffect(() => {
    if (focused || value) return;
    const tick = setInterval(() => {
      const word = SUGGESTED_TOPICS[idx.current % SUGGESTED_TOPICS.length];
      char.current += dir.current;
      setPlaceholder(word.slice(0, char.current));
      if (char.current >= word.length) dir.current = -1;
      if (char.current <= 0) { dir.current = 1; idx.current += 1; }
    }, 65);
    return () => clearInterval(tick);
  }, [focused, value]);

  // Go to workflow builder with topic + preset
  function goWorkflow(presetId, topic) {
    const t = (topic ?? value).trim();
    if (!t) { document.getElementById("main-topic-input")?.focus(); return; }
    router.push(
      `/dashboard/workflow-builder?topic=${encodeURIComponent(t)}&preset=${presetId}&autorun=1`
    );
  }

  // Legacy quick-generate (keeps old studio working)
  function goGenerate(topic) {
    const t = (topic ?? value).trim();
    if (!t) return;
    router.push(`/dashboard/generate?topic=${encodeURIComponent(t)}`);
  }

  const hasValue = value.trim().length > 0;

  return (
    <div className="relative space-y-5">
      {/* Glow */}
      <div className="pointer-events-none absolute -inset-x-10 -top-8 h-40 bg-hero-glow opacity-60" />

      {/* Heading */}
      <div className="relative text-center">
        <span className="chip mx-auto w-fit px-3 py-1 text-xs font-semibold text-cyan">
          <Workflow size={13} /> AI Agent Workspace
        </span>
        <h2 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Enter your topic — pick a pipeline
        </h2>
        <p className="mt-2 text-sm text-soft">
          Type a health topic below, then choose which agent pipeline to run it through.
        </p>
      </div>

      {/* Search bar */}
      <div
        className={`relative mx-auto max-w-2xl rounded-2xl border bg-[rgb(var(--panel))] p-2 transition-all ${
          focused ? "border-cyan/55 shadow-glow" : "border-[rgb(var(--border))]"
        }`}
      >
        <div className="flex items-center gap-2">
          <Search size={19} className="ml-2.5 shrink-0 text-faint" />
          <input
            id="main-topic-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => { if (e.key === "Enter" && hasValue) goWorkflow("instagram_reel"); }}
            placeholder={
              focused || value
                ? "e.g. sleep and diabetes, ashwagandha, does turmeric cure cancer…"
                : placeholder || "Enter a health topic…"
            }
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-faint"
          />
          {!focused && !value && (
            <span className="hidden h-4 w-px animate-blink bg-cyan sm:block" />
          )}
          {hasValue && (
            <button
              onClick={() => goWorkflow("instagram_reel")}
              className="btn btn-primary shrink-0 gap-1.5 px-4 py-2.5 text-sm"
            >
              <Workflow size={15} />
              <span className="hidden sm:inline">Choose Pipeline</span>
              <ArrowRight size={15} className="sm:hidden" />
            </button>
          )}
        </div>
      </div>

      {/* Suggested topics */}
      <div className="mx-auto flex max-w-2xl flex-wrap justify-center gap-2">
        {SUGGESTED_TOPICS.slice(0, 5).map((s) => (
          <button
            key={s}
            onClick={() => setValue(s)}
            className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-1.5 text-xs text-soft transition hover:border-cyan/45 hover:text-cyan"
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Pipeline cards ─────────────────────────────────────────────────── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <Workflow size={15} className="text-electric" />
            Choose a Pipeline
            {hasValue && (
              <span className="rounded-full bg-cyan/15 px-2 py-0.5 text-[10px] font-bold text-cyan">
                topic ready ✓
              </span>
            )}
          </h3>
          {!hasValue && (
            <p className="text-[11px] text-faint">Type a topic first, then click a pipeline</p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => goWorkflow(preset.id)}
              disabled={!hasValue}
              className={`
                group relative flex flex-col items-start rounded-xl border bg-gradient-to-br
                p-4 text-left transition-all duration-200
                ${hasValue
                  ? `cursor-pointer hover:scale-[1.02] hover:shadow-lg ${preset.color}`
                  : "cursor-not-allowed border-[rgb(var(--border))] opacity-45"}
              `}
            >
              {/* Header */}
              <div className="flex w-full items-start justify-between">
                <span className="text-xl">{preset.emoji}</span>
                <div className="flex items-center gap-1 rounded-full bg-[rgb(var(--bg-soft))] px-2 py-0.5 text-[10px] font-bold">
                  <Zap size={9} className="text-cyan" />
                  <span className="text-cyan">{preset.credits}</span>
                  <span className="text-faint">cr</span>
                </div>
              </div>

              {/* Name + desc */}
              <p className="mt-2 font-display text-sm font-bold">{preset.name}</p>
              <p className="text-[11px] text-faint">{preset.desc}</p>

              {/* Agent chain */}
              <div className="mt-3 flex flex-wrap gap-1">
                {preset.agents.map((a, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-1.5 py-0.5 text-[9px] font-semibold text-faint"
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${preset.dot}`} />
                    {a}
                  </span>
                ))}
              </div>

              {/* Run arrow */}
              {hasValue && (
                <div className="mt-3 flex w-full items-center justify-end gap-1 text-[11px] font-bold opacity-0 transition-opacity group-hover:opacity-100" style={{ color: "rgb(var(--text))" }}>
                  Run with "{value.length > 20 ? value.slice(0, 20) + "…" : value}"
                  <ChevronRight size={13} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Legacy quick-generate link */}
      <div className="text-center">
        <button
          onClick={() => goGenerate()}
          disabled={!hasValue}
          className="text-xs text-faint underline-offset-2 hover:text-soft hover:underline disabled:pointer-events-none disabled:opacity-30 transition"
        >
          Skip agents — use Quick Generate (old mode)
        </button>
      </div>
    </div>
  );
}
