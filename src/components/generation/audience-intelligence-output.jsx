"use client";

import { useState } from "react";
import {
  ArrowRight, BookOpen, Target, Loader2, Users, HeartCrack,
  AlertCircle, Heart, ThumbsDown, UserCircle, Search, ChevronLeft,
} from "lucide-react";

// ── Tab definitions (original 3 + 5 new psychological categories) ─────────
const TABS = [
  { id: "summary",       icon: BookOpen,     label: "300w Summary"  },
  { id: "topics",        icon: Target,       label: "5 Viral Topics" },
  { id: "problems",      icon: HeartCrack,   label: "Problems"      },
  { id: "myths",         icon: AlertCircle,  label: "Myths"         },
  { id: "desires",       icon: Heart,        label: "Desires"       },
  { id: "objections",    icon: ThumbsDown,   label: "Objections"    },
  { id: "avatars",       icon: UserCircle,   label: "Avatars"       },
  { id: "searchIntent",  icon: Search,       label: "Search Intent" },
];

// ── Colour maps ───────────────────────────────────────────────────────────
const EMOTION_COLOR = {
  Frustration:  { hex: "#FF9500", bg: "rgba(255,149,0,0.10)" },
  Fear:         { hex: "#FF3B30", bg: "rgba(255,59,48,0.10)" },
  Shame:        { hex: "#FFCC00", bg: "rgba(255,204,0,0.10)" },
  Helplessness: { hex: "#8E8E93", bg: "rgba(142,142,147,0.10)" },
  Anxiety:      { hex: "#007AFF", bg: "rgba(0,122,255,0.10)" },
  Exhaustion:   { hex: "#AF52DE", bg: "rgba(175,82,222,0.10)" },
};
const FALLBACK_COLOR = { hex: "#636366", bg: "rgba(99,99,102,0.10)" };

const INTENT_COLOR = {
  informational:  { text: "text-sky-700 dark:text-sky-300",     bg: "bg-sky-500/10 border-sky-400/30"     },
  transactional:  { text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-500/10 border-emerald-400/30" },
  navigational:   { text: "text-violet-700 dark:text-violet-300",   bg: "bg-violet-500/10 border-violet-400/30"  },
  commercial:     { text: "text-amber-700 dark:text-amber-300",  bg: "bg-amber-500/10 border-amber-400/30"  },
};
const STAGE_COLOR = {
  awareness:     "text-faint bg-[rgb(var(--bg-soft))]",
  consideration: "text-cyan bg-cyan/10",
  decision:      "text-emerald-700 bg-emerald-500/10 dark:text-emerald-300",
};

// ── Tabs that always allow "Send to Stage 3" (no selection required) ─────
const ALWAYS_SEND_TABS = new Set(["summary", "objections", "avatars", "searchIntent"]);

export default function AudienceIntelligenceOutput({
  isLoading,
  agentData,
  inputTopic,
  onSendToStage3,
  onBack,
}) {
  const [activeTab,        setActiveTab]        = useState("topics");
  const [selectedTopics,   setSelectedTopics]   = useState([]);
  const [selectedProblems, setSelectedProblems] = useState([]);
  const [selectedMyths,    setSelectedMyths]    = useState([]);
  const [selectedDesires,  setSelectedDesires]  = useState([]);

  // ── Data extraction ───────────────────────────────────────────────────
  const topics      = agentData?.payloadList || [];
  const summary     = agentData?.summary     || "";
  const problems    = agentData?.problems    || [];
  const myths       = agentData?.myths       || [];
  const desires     = agentData?.desires     || [];
  const objections  = agentData?.objections  || [];
  const avatars     = agentData?.avatars     || [];
  const searchIntent = agentData?.searchIntent || [];
  const confidence  = agentData?.metrics?.confidence ?? 90;

  const toggleTopic   = (label) =>
    setSelectedTopics((p)   => p.includes(label) ? p.filter((x) => x !== label) : [...p, label]);
  const toggleProblem = (idx)   =>
    setSelectedProblems((p) => p.includes(idx)   ? p.filter((x) => x !== idx)   : [...p, idx]);
  const toggleMyth    = (idx)   =>
    setSelectedMyths((p)    => p.includes(idx)   ? p.filter((x) => x !== idx)   : [...p, idx]);
  const toggleDesire  = (idx)   =>
    setSelectedDesires((p)  => p.includes(idx)   ? p.filter((x) => x !== idx)   : [...p, idx]);

  // ── Can send / send label ─────────────────────────────────────────────
  const canSend =
    ALWAYS_SEND_TABS.has(activeTab) ? true :
    activeTab === "topics"          ? selectedTopics.length > 0 :
    activeTab === "problems"        ? selectedProblems.length > 0 :
    activeTab === "myths"           ? selectedMyths.length > 0 :
    activeTab === "desires"         ? selectedDesires.length > 0 :
    false;

  const sendLabel =
    activeTab === "topics" && selectedTopics.length > 0
      ? `Send ${selectedTopics.length} Selected Angle${selectedTopics.length !== 1 ? "s" : ""} → Stage 3`
    : activeTab === "problems" && selectedProblems.length > 0
      ? `Use Problem Intelligence · Send to Stage 3`
    : activeTab === "myths" && selectedMyths.length > 0
      ? `Use ${selectedMyths.length} Myth${selectedMyths.length !== 1 ? "s" : ""} → Send to Stage 3`
    : activeTab === "desires" && selectedDesires.length > 0
      ? `Use ${selectedDesires.length} Desire${selectedDesires.length !== 1 ? "s" : ""} → Send to Stage 3`
    : activeTab === "objections"
      ? "Use Objection Handling → Send to Stage 3"
    : activeTab === "avatars"
      ? "Use Audience Avatars → Send to Stage 3"
    : activeTab === "searchIntent"
      ? "Use Search Intent → Send to Stage 3"
    : "Use Summary → Send to Stage 3 (Process)";

  function handleSend() {
    if (activeTab === "topics")    return onSendToStage3(selectedTopics);
    if (activeTab === "problems") {
      const labels = selectedProblems.map((i) => problems[i]?.emotion).filter(Boolean);
      return onSendToStage3(labels);
    }
    if (activeTab === "myths") {
      const labels = selectedMyths.map((i) => myths[i]?.myth).filter(Boolean);
      return onSendToStage3(labels);
    }
    if (activeTab === "desires") {
      const labels = selectedDesires.map((i) => desires[i]?.desire).filter(Boolean);
      return onSendToStage3(labels);
    }
    // All other tabs: informational — pass empty array, topic stays as-is
    onSendToStage3([]);
  }

  // ── Empty state helper ────────────────────────────────────────────────
  function EmptyState({ msg }) {
    return (
      <p className="py-8 text-center text-xs text-faint">{msg}</p>
    );
  }

  return (
    <div className="w-full space-y-4 p-4 sm:p-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-[10px] font-semibold text-faint transition hover:text-soft"
              >
                <ChevronLeft size={12} /> Stage 1
              </button>
            )}
            {onBack && <span className="text-[rgb(var(--border))]">·</span>}
            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
              Stage 2 · Active Output
            </span>
            {!isLoading && (
              <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-1.5 py-0.5 text-[9px] font-bold text-violet-700 dark:text-violet-300">
                {confidence}% confidence
              </span>
            )}
          </div>
          <h2 className="mt-0.5 font-display text-base font-bold">Audience Intelligence Matrix</h2>
          <p className="text-xs text-faint">
            Analysing audience signals for:{" "}
            <span className="font-semibold text-soft">"{inputTopic}"</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-2.5 py-1.5">
          <Users size={13} className="text-violet-400" />
          <span className="text-[10px] font-semibold text-violet-400">Audience Intel</span>
        </div>
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]">

        {/* ── Scrollable tab bar (8 tabs) ── */}
        <div className="border-b border-[rgb(var(--border))] px-3 py-2.5">
          <div className="overflow-x-auto scrollbar-none">
            <div className="flex gap-1 rounded-lg bg-[rgb(var(--bg-soft))] p-1 w-max">
              {TABS.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  disabled={isLoading}
                  className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-semibold transition ${
                    activeTab === id
                      ? "bg-violet-500/20 text-violet-700 ring-1 ring-violet-500/30 dark:text-violet-300"
                      : "text-faint hover:text-soft"
                  } ${isLoading ? "cursor-not-allowed opacity-40" : ""}`}
                >
                  <Icon size={11} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14">
              <div className="relative">
                <Loader2 size={28} className="animate-spin text-violet-400" />
                <div className="absolute inset-0 animate-ping rounded-full bg-violet-400/10" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-soft">Analysing audience signals…</p>
                <p className="mt-0.5 text-xs text-faint">
                  Mapping pain points, search intent &amp; emotional triggers
                </p>
              </div>
            </div>

          ) : activeTab === "summary" ? (
            /* ── Tab 1: 300w Summary ── */
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                Audience Pain-Point Summary
              </p>
              <div className="max-h-56 overflow-y-auto rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 text-xs leading-relaxed text-soft scrollbar-thin">
                {summary || "No summary available."}
              </div>
            </div>

          ) : activeTab === "topics" ? (
            /* ── Tab 2: 5 Viral Topics ── */
            <div className="space-y-1.5">
              <p className="pl-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-faint">
                Select angles to push down the pipeline:
              </p>
              {topics.length === 0 ? (
                <EmptyState msg="No topics generated — try again or switch to Summary view." />
              ) : (
                topics.map((t, i) => {
                  const checked = selectedTopics.includes(t.label);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleTopic(t.label)}
                      className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                        checked
                          ? "border-violet-500/50 bg-violet-500/8"
                          : "border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] hover:border-violet-500/30"
                      }`}
                    >
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                        checked ? "border-violet-400 bg-violet-500" : "border-[rgb(var(--border))]"
                      }`}>
                        {checked && (
                          <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span className={`shrink-0 text-[9px] font-bold tabular-nums ${checked ? "text-violet-400" : "text-faint"}`}>
                        0{i + 1}
                      </span>
                      <span className={`min-w-0 flex-1 truncate text-xs font-semibold transition ${
                        checked ? "text-violet-200" : "text-[rgb(var(--text))]"
                      }`}>
                        {t.label}
                      </span>
                      <span className="hidden shrink-0 max-w-[320px] truncate text-[11px] text-faint md:block">
                        {t.details}
                      </span>
                    </button>
                  );
                })
              )}
              {selectedTopics.length > 0 && (
                <p className="pl-1 pt-1 text-[10px] font-semibold text-violet-400">
                  {selectedTopics.length} angle{selectedTopics.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>

          ) : activeTab === "problems" ? (
            /* ── Tab 3: Problems / Emotional Pain ── */
            <div className="space-y-1.5">
              <p className="pl-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-faint">
                Select the core audience pain points to address in your script:
              </p>
              {problems.length === 0 ? (
                <EmptyState msg="No problem data — switch to Summary or Topics view." />
              ) : (
                problems.map((p, i) => {
                  const checked = selectedProblems.includes(i);
                  const col = EMOTION_COLOR[p.emotion] || FALLBACK_COLOR;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleProblem(i)}
                      className={`group flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                        checked
                          ? "border-[#34C759] bg-[#34C759]/[0.03]"
                          : "border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] hover:border-[rgb(var(--border))]"
                      }`}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span
                          className="shrink-0 rounded-md px-2 py-0.5 text-[9px] font-bold"
                          style={{ color: col.hex, backgroundColor: col.bg, border: `1px solid ${col.hex}30` }}
                        >
                          {(p.emotion || "").toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1 truncate">
                          <span className="text-xs font-medium text-[rgb(var(--text))]">"{p.statement}"</span>
                          {p.trigger && (
                            <span className="ml-2 hidden text-[11px] text-faint md:inline">— {p.trigger}</span>
                          )}
                        </div>
                      </div>
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                        checked ? "border-[#34C759] bg-[#34C759]" : "border-[rgb(var(--border))]"
                      }`}>
                        {checked && (
                          <svg className="h-2.5 w-2.5 text-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                    </button>
                  );
                })
              )}
              {selectedProblems.length > 0 && (
                <p className="pl-1 pt-1 text-[10px] font-semibold text-[#34C759]">
                  {selectedProblems.length} pain point{selectedProblems.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>

          ) : activeTab === "myths" ? (
            /* ── Tab 4: Myths ── */
            <div className="space-y-2">
              <p className="pl-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-faint">
                Select myth-busting angles to use as script hooks:
              </p>
              {myths.length === 0 ? (
                <EmptyState msg="No myth data available — regenerate with an LLM key configured." />
              ) : (
                myths.map((m, i) => {
                  const checked = selectedMyths.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleMyth(i)}
                      className={`w-full overflow-hidden rounded-xl border text-left transition-all ${
                        checked
                          ? "border-rose-500/50 bg-rose-500/8 ring-1 ring-rose-500/20"
                          : "border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] hover:border-rose-500/30"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 border-b border-[rgb(var(--border))]/60 bg-rose-500/5 px-3 py-2">
                        <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                          checked ? "border-rose-400 bg-rose-500" : "border-[rgb(var(--border))]"
                        }`}>
                          {checked && (
                            <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span className="mt-0.5 shrink-0 rounded bg-rose-500/15 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 dark:text-rose-300">
                          MYTH
                        </span>
                        <p className="text-xs font-semibold leading-snug text-rose-800 dark:text-rose-200">{m.myth}</p>
                      </div>
                      <div className="flex items-start gap-2.5 px-3 py-2">
                        <span className="mt-0.5 shrink-0 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                          REALITY
                        </span>
                        <p className="text-xs leading-snug text-soft">{m.reality}</p>
                      </div>
                    </button>
                  );
                })
              )}
              {selectedMyths.length > 0 && (
                <p className="pl-1 pt-1 text-[10px] font-semibold text-rose-400">
                  {selectedMyths.length} myth{selectedMyths.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>

          ) : activeTab === "desires" ? (
            /* ── Tab 5: Desires ── */
            <div className="space-y-2">
              <p className="pl-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-faint">
                Select audience desires to use as content angles:
              </p>
              {desires.length === 0 ? (
                <EmptyState msg="No desire data available — regenerate with an LLM key configured." />
              ) : (
                desires.map((d, i) => {
                  const checked = selectedDesires.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDesire(i)}
                      className={`w-full rounded-xl border p-3 text-left transition-all ${
                        checked
                          ? "border-pink-500/50 bg-pink-500/8 ring-1 ring-pink-500/20"
                          : "border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] hover:border-pink-500/30"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                          checked ? "border-pink-400 bg-pink-500" : "border-[rgb(var(--border))]"
                        }`}>
                          {checked && (
                            <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <Heart size={13} className="mt-0.5 shrink-0 text-pink-400" />
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className={`text-xs font-semibold leading-snug ${checked ? "text-pink-800 dark:text-pink-200" : "text-[rgb(var(--text))]"}`}>{d.desire}</p>
                          <p className="text-[11px] leading-relaxed text-faint">
                            <span className="font-semibold text-pink-600 dark:text-pink-400/80">Why: </span>{d.deeperWhy}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
              {selectedDesires.length > 0 && (
                <p className="pl-1 pt-1 text-[10px] font-semibold text-pink-400">
                  {selectedDesires.length} desire{selectedDesires.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>

          ) : activeTab === "objections" ? (
            /* ── Tab 6: Objections ── */
            <div className="space-y-2">
              <p className="pl-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-faint">
                Resistance your audience has — and how to reframe it in your script:
              </p>
              {objections.length === 0 ? (
                <EmptyState msg="No objection data available — regenerate with an LLM key configured." />
              ) : (
                objections.map((o, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))]"
                  >
                    <div className="flex items-start gap-2.5 border-b border-[rgb(var(--border))]/60 bg-amber-500/5 px-3 py-2">
                      <ThumbsDown size={12} className="mt-0.5 shrink-0 text-amber-400" />
                      <p className="text-xs font-semibold italic leading-snug text-amber-900 dark:text-amber-200">"{o.objection}"</p>
                    </div>
                    <div className="flex items-start gap-2.5 px-3 py-2">
                      <span className="mt-0.5 shrink-0 rounded bg-cyan/15 px-1.5 py-0.5 text-[9px] font-bold text-cyan">
                        REFRAME
                      </span>
                      <p className="text-xs leading-snug text-soft">{o.reframe}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

          ) : activeTab === "avatars" ? (
            /* ── Tab 7: Audience Avatars ── */
            <div className="space-y-2">
              <p className="pl-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-faint">
                Persona profiles representing your core audience segments:
              </p>
              {avatars.length === 0 ? (
                <EmptyState msg="No avatar data available — regenerate with an LLM key configured." />
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {avatars.map((a, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-3"
                    >
                      <div className="flex items-center gap-2.5 pb-2 border-b border-[rgb(var(--border))]/60">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet-500/15 text-sm font-bold text-violet-700 dark:text-violet-300">
                          {(a.name || "?")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold leading-tight">{a.name}</p>
                          <p className="text-[10px] text-faint">{a.age} · {a.occupation}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-[11px] leading-relaxed text-soft">
                        <span className="font-semibold text-violet-400">Pain: </span>{a.pain}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          ) : (
            /* ── Tab 8: Search Intent ── */
            <div className="space-y-1.5">
              <p className="pl-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-faint">
                Actual queries this audience types — optimise your title and hook against these:
              </p>
              {searchIntent.length === 0 ? (
                <EmptyState msg="No search intent data available — regenerate with an LLM key configured." />
              ) : (
                searchIntent.map((s, i) => {
                  const ic = INTENT_COLOR[s.intent?.toLowerCase()] || INTENT_COLOR.informational;
                  const sc = STAGE_COLOR[s.stage?.toLowerCase()] || STAGE_COLOR.awareness;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-3 py-2.5"
                    >
                      <Search size={12} className="shrink-0 text-faint" />
                      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[rgb(var(--text))]">
                        {s.query}
                      </span>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold capitalize ${ic.text} ${ic.bg}`}>
                        {s.intent}
                      </span>
                      <span className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold capitalize sm:inline ${sc}`}>
                        {s.stage}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* ── Action gateway ── */}
        {!isLoading && (
          <div className="space-y-2 border-t border-[rgb(var(--border))] p-4">
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              className={`btn w-full py-2.5 text-sm ${canSend ? "btn-primary" : "cursor-not-allowed opacity-40"}`}
            >
              <ArrowRight size={15} />
              {sendLabel}
            </button>
            {!canSend && (
              <p className="text-center text-[10px] text-faint">
                {activeTab === "topics"   ? "Select at least one topic angle above to continue"
                : activeTab === "myths"   ? "Select at least one myth above to continue"
                : activeTab === "desires" ? "Select at least one desire above to continue"
                : "Select at least one pain point above to continue"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
