"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, Loader2, Clock, BookOpen, Zap,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  BarChart3, Shield,
} from "lucide-react";
import { FACT_CHECK_COLORS } from "@/lib/podcast/stages";
import { getModelMeta } from "@/lib/podcast/model-labels";
import ModelToggle from "@/components/podcast/ModelToggle";
import { getModelPref } from "@/lib/podcast/model-preference";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getApiKeys(demoMode = false) {
  if (typeof window === "undefined" || demoMode) return { geminiKey: "", anthropicKey: "" };
  return {
    geminiKey:    localStorage.getItem("V_KEY_GOOGLE") || "",
    anthropicKey: localStorage.getItem("V_KEY_CLAUDE") || "",
  };
}

function GradeBadge({ grade }) {
  const c = FACT_CHECK_COLORS[grade] || FACT_CHECK_COLORS.GREEN;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide shrink-0"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.hex }}
    >
      {grade ?? "—"}
    </span>
  );
}

function StatusPill({ status, size = "sm" }) {
  const map = {
    on_track:     { label: "On Track",    cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    over:         { label: "Over",        cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    under:        { label: "Under",       cls: "bg-sky-500/15 text-sky-400 border-sky-500/30" },
    within_range: { label: "On Target",   cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  };
  const s = map[status] || map.on_track;
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ── AnswerBlock ───────────────────────────────────────────────────────────────

function AnswerBlock({ answer, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const c = FACT_CHECK_COLORS[answer.grade] || FACT_CHECK_COLORS.GREEN;

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: answer.demo_trigger ? "rgba(139,92,246,0.5)" : c.border }}
    >
      {/* Header row */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:brightness-105"
        style={{ background: answer.demo_trigger ? "rgba(139,92,246,0.07)" : c.bg }}
      >
        <div className="mt-1.5 h-2 w-2 rounded-full shrink-0" style={{ background: c.hex }} />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <GradeBadge grade={answer.grade} />
            {answer.demo_trigger && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 text-[9px] font-bold text-violet-400 uppercase">
                <Zap size={9} /> Demo Trigger
              </span>
            )}
            <span className="flex items-center gap-1 text-[10px] text-faint">
              <Clock size={10} /> {answer.est_sec}s
            </span>
          </div>
          <p className="text-xs font-semibold text-[rgb(var(--text))] leading-snug pr-2">
            {answer.question_id} — {answer.question_text}
          </p>
        </div>
        <span className="shrink-0 text-faint mt-1">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="overflow-hidden border-t"
            style={{ borderColor: answer.demo_trigger ? "rgba(139,92,246,0.3)" : c.border }}
          >
            <div className="p-4 space-y-4">
              {/* Interviewer */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400">
                  Interviewer
                </p>
                <p className="text-sm text-soft leading-relaxed italic">
                  "{answer.interviewer}"
                </p>
              </div>

              {/* Dr. Prabhakar */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  Dr. Prabhakar
                </p>
                <p className="text-sm text-[rgb(var(--text))] leading-relaxed whitespace-pre-line">
                  {answer.prabhakar}
                </p>
              </div>

              {/* Demo trigger editor note */}
              {answer.demo_trigger && answer.editor_note && (
                <div className="flex items-start gap-2 rounded-lg bg-violet-500/10 border border-violet-500/25 px-3 py-2.5">
                  <Zap size={12} className="shrink-0 mt-0.5 text-violet-400" />
                  <div>
                    <p className="text-[10px] font-bold text-violet-400 uppercase mb-0.5">Editor Note</p>
                    <p className="text-[11px] text-violet-200 leading-snug">{answer.editor_note}</p>
                  </div>
                </div>
              )}

              {/* Source annotation */}
              {answer.source_annotation && (
                <div className="flex items-start gap-2">
                  <BookOpen size={11} className="shrink-0 mt-0.5 text-faint" />
                  <p className="font-mono text-[10px] text-faint leading-relaxed">
                    {answer.source_annotation}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── SectionBlock ──────────────────────────────────────────────────────────────

const SECTION_ICONS = {
  opening:   "🎙️",
  discovery: "🔍",
  science:   "🔬",
  myth:      "⚡",
  solution:  "✅",
  practical: "📋",
  rapidfire: "🔥",
};

const SECTION_DESCS = {
  opening:   "Warm hook — assume zero knowledge, set stakes",
  discovery: "Frame the problem, audience self-identification",
  science:   "What actually happens in the body — ICMR anchors here",
  myth:      "Correct wrong beliefs — WhatsApp myths addressed",
  solution:  "The method — Dr. Prabhakar's clinical approach",
  practical: "Daily application — what the viewer does tomorrow",
  rapidfire: "Fast, fun, memorable close — verdicts only",
};

function SectionBlock({ section }) {
  const [collapsed, setCollapsed] = useState(false);
  const hasDemo = section.answers?.some((a) => a.demo_trigger);
  const icon = SECTION_ICONS[section.id] || "📌";
  const desc = SECTION_DESCS[section.id] || "";

  return (
    <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] overflow-hidden">
      {/* Section header */}
      <div className="flex items-start justify-between gap-3 px-5 py-4 bg-[rgb(var(--bg-soft))]">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-2xl shrink-0 leading-none mt-0.5">{icon}</span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <h3 className="text-sm font-bold text-[rgb(var(--text))]">{section.label}</h3>
              <StatusPill status={section.status} />
              {hasDemo && (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 text-[9px] font-bold text-violet-400 uppercase">
                  <Zap size={9} /> Demo
                </span>
              )}
            </div>
            <p className="text-[11px] text-faint">{desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-faint">
              {section.actual_min?.toFixed(1) ?? "—"} / {section.target_min} min
            </p>
            <p className="text-[9px] text-faint">{section.answers?.length ?? 0} questions</p>
          </div>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="text-faint hover:text-[rgb(var(--text))] transition-colors"
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {/* Section answers */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {section.answers?.map((answer) => (
                <AnswerBlock key={answer.question_id} answer={answer} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── RuntimeBar ────────────────────────────────────────────────────────────────

function RuntimeBar({ totalMin, status }) {
  const TARGET_MIN = 29;
  const TARGET_MAX = 32;
  const CAP = 45;
  const pct = Math.min((totalMin / CAP) * 100, 100);
  const minPct = (TARGET_MIN / CAP) * 100;
  const maxPct = (TARGET_MAX / CAP) * 100;

  const barColor =
    status === "within_range" ? "bg-emerald-400" :
    status === "over"         ? "bg-amber-400"   : "bg-sky-400";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-[rgb(var(--text))]">Total Runtime (answers only)</span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-[rgb(var(--text))]">{totalMin?.toFixed(1)} min</span>
          <StatusPill status={status} />
        </div>
      </div>
      <div className="relative h-3 rounded-full bg-[rgb(var(--bg-soft))] overflow-hidden">
        {/* Target zone */}
        <div
          className="absolute top-0 h-full bg-emerald-500/15 border-x border-emerald-500/30"
          style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
        />
        {/* Actual bar */}
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-faint">
        <span>0</span>
        <span className="text-emerald-400">Target {TARGET_MIN}–{TARGET_MAX} min</span>
        <span>{CAP} min</span>
      </div>
    </div>
  );
}

// ── PillarCheckPanel ──────────────────────────────────────────────────────────

function PillarCheckPanel({ pillarCheck }) {
  if (!pillarCheck || Object.keys(pillarCheck).length === 0) return null;
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Shield size={14} className="text-cyan" />
        <p className="text-xs font-bold text-[rgb(var(--text))]">Pillar Check — All 4 pillars covered</p>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {Object.entries(pillarCheck).map(([pillar, location]) => (
          <div key={pillar} className="flex items-start gap-2">
            <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-semibold text-[rgb(var(--text))]">{pillar}</p>
              <p className="text-[10px] text-faint">{location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Loading steps ─────────────────────────────────────────────────────────────

const LOADING_STEPS = [
  "Reading sequenced arc from Stage 5…",
  "Loading research brief and evidence grades…",
  "Applying evidence tone rules (GREEN/YELLOW/BLUE/RED)…",
  "Writing INTERVIEWER questions in Tamil Nadu voice…",
  "Writing Dr. Prabhakar's answers — no bullet points, flowing sentences…",
  "Checking ICMR integration and demo trigger notes…",
  "Running pillar check against all 4 Stage 2 pillars…",
  "Calculating runtime per section…",
];

function LoadingPanel({ styleMode }) {
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Loader2 size={20} className="animate-spin text-cyan shrink-0" />
        <div>
          <p className="text-sm font-semibold">
            {styleMode === "style_check" ? "Writing style check (7 representative answers)…" : "Writing full podcast script…"}
          </p>
          <p className="text-xs text-faint mt-0.5">
            {styleMode === "style_check"
              ? "One answer per section to verify voice and tone before full write."
              : "All answers for every question in the sequenced arc."}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {LOADING_STEPS.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.28 }}
            className="flex items-center gap-2 text-[11px] text-faint"
          >
            <div className="h-1 w-1 rounded-full bg-cyan shrink-0" />
            {step}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Stage6({ data, onComplete, demoMode }) {
  const [loading, setLoading]     = useState(false);
  const [script, setScript]       = useState(null);
  const [error, setError]         = useState(null);
  const [styleMode, setStyleMode] = useState("style_check"); // "style_check" | "full"
  const [modelPref, setModelPref] = useState(() =>
    typeof window !== "undefined" ? getModelPref(6) : "claude"
  );

  const stage5 = data?.[5];
  const stage4 = data?.[4];
  const lock   = data?.[2];

  const locked_topic = lock?.topic ?? "Health Topic";
  const isStyleCheck = script?.style_check === true;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const { geminiKey, anthropicKey } = getApiKeys(demoMode);
      const res = await fetch("/api/pipeline/stage6-answers", {
        method:  "POST",
        headers: {
          "Content-Type":          "application/json",
          ...(geminiKey    && { "x-client-gemini-key":    geminiKey }),
          ...(anthropicKey && { "x-client-anthropic-key": anthropicKey }),
          "x-preferred-model": modelPref,
        },
        body: JSON.stringify({
          locked_topic,
          angle:          lock?.angle?.frame    ?? null,
          pillars:        lock?.pillars         ?? [],
          arc:            stage5?.arc           ?? [],
          claims:         stage4?.claims        ?? [],
          blue_notes:     stage4?.blue_notes    ?? {},
          indian_context: stage4?.indian_context ?? [],
          primary_viewer: lock?.audience?.primary ?? null,
          style_mode:     styleMode,
          stage5_data:    stage5 ?? null,
          stage4_data:    stage4 ?? null,
          lock_data:      lock   ?? null,
        }),
      });
      const json = await res.json();
      if (json.mode === "error" || json.error) {
        throw new Error(json.error ?? "Gemini API error — check your API key or quota.");
      }
      setScript(json);
    } catch (e) {
      setError(e.message || "Failed to generate script");
    } finally {
      setLoading(false);
    }
  }

  function handleApprove() {
    if (!script) return;
    if (isStyleCheck) {
      // After style check approval, switch to full mode automatically
      setScript(null);
      setStyleMode("full");
      return;
    }
    onComplete({
      sections:          script.sections,
      total_runtime_min: script.total_runtime_min,
      pillar_check:      script.pillar_check,
      status:            script.status,
    });
  }

  // ── Pre-run screen ────────────────────────────────────────────────────────
  if (!script && !loading) {
    const arcSections = stage5?.arc ?? [];
    const totalQ = stage5?.total_questions ?? arcSections.reduce((s, sec) => s + (sec.questions?.length ?? 0), 0);
    const claimsCount = stage4?.claims?.length ?? 0;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-lg font-bold mb-1">Answer Writer</h2>
          <p className="text-sm text-faint">
            Writes the complete two-character podcast script — INTERVIEWER and Dr. Prabhakar — using only
            the Stage 4 verified research brief. No new facts are added. Every answer maps to a graded claim.
          </p>
        </div>

        {/* Stage 5 summary tiles */}
        {stage5 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3 text-center">
              <p className="text-2xl font-bold text-cyan">{totalQ}</p>
              <p className="text-[11px] text-faint mt-0.5">Questions in Arc</p>
            </div>
            <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3 text-center">
              <p className="text-2xl font-bold text-emerald-400">{claimsCount}</p>
              <p className="text-[11px] text-faint mt-0.5">Verified Claims</p>
            </div>
            <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3 text-center">
              <p className="text-2xl font-bold text-violet-400">2</p>
              <p className="text-[11px] text-faint mt-0.5">Demo Triggers</p>
            </div>
          </div>
        )}

        {/* Style mode toggle */}
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 space-y-3">
          <p className="text-xs font-bold text-[rgb(var(--text))]">Write Mode</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                id:    "style_check",
                label: "Style Check",
                desc:  "7 representative answers (one per section) — approve voice & tone before full write",
                icon:  "🎯",
              },
              {
                id:    "full",
                label: "Full Script",
                desc:  `All ${totalQ || "~24"} answers for every question — ready for production`,
                icon:  "📜",
              },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setStyleMode(m.id)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  styleMode === m.id
                    ? "border-cyan/50 bg-cyan/8"
                    : "border-[rgb(var(--border))] hover:border-[rgb(var(--border-hover))]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span>{m.icon}</span>
                  <span className="text-xs font-bold text-[rgb(var(--text))]">{m.label}</span>
                  {styleMode === m.id && <CheckCircle2 size={12} className="text-cyan ml-auto" />}
                </div>
                <p className="text-[10px] text-faint leading-snug">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-400" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        <ModelToggle stageNum={6} onChange={setModelPref} disabled={loading} />
        <button
          onClick={handleGenerate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan px-6 py-3 text-sm font-bold text-navy-950 transition hover:brightness-110"
        >
          {styleMode === "style_check" ? "Write Style Check (7 Answers)" : `Write Full Script (${totalQ || "All"} Answers)`}
          <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-lg font-bold mb-1">Answer Writer</h2>
          <p className="text-sm text-faint">Generating spoken script from Stage 4 verified research…</p>
        </div>
        <LoadingPanel styleMode={styleMode} />
      </div>
    );
  }

  // ── Script ready ──────────────────────────────────────────────────────────
  const sections = script?.sections ?? [];
  const totalMin = script?.total_runtime_min ?? 0;
  const runtimeStatus = script?.status ?? "within_range";
  const pillarCheck   = script?.pillar_check ?? {};

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold mb-1">
            {isStyleCheck ? "Style Check — 7 Representative Answers" : "Full Podcast Script"}
          </h2>
          <p className="text-sm text-faint">
            {isStyleCheck
              ? "Review one answer per section. Approve to unlock the full script write."
              : "Complete two-character dialogue. Every answer maps to a verified Stage 4 claim."}
          </p>
        </div>
        <button
          onClick={() => setScript(null)}
          className="shrink-0 rounded-lg border border-[rgb(var(--border))] px-3 py-1.5 text-[11px] text-faint hover:text-[rgb(var(--text))] transition-colors"
        >
          Rewrite
        </button>
      </div>

      {/* Model badge */}
      {script.mode && script.mode !== "demo" && (() => {
        const meta = getModelMeta(script.mode);
        return (
          <div className="flex justify-end">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${meta.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
              {meta.version && (
                <span className="font-normal opacity-60 text-[9px]">{meta.version}</span>
              )}
            </span>
          </div>
        );
      })()}

      {/* Runtime bar */}
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
        <RuntimeBar totalMin={totalMin} status={runtimeStatus} />
      </div>

      {/* Pillar check */}
      <PillarCheckPanel pillarCheck={pillarCheck} />

      {/* Style check banner */}
      {isStyleCheck && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3">
          <BarChart3 size={14} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-400">Style Check Mode</p>
            <p className="text-[11px] text-faint mt-0.5">
              Showing one answer per section. Approve this style check to proceed to the full script write.
            </p>
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <SectionBlock key={section.id} section={section} />
        ))}
      </div>

      {/* Approve gate */}
      <div className="rounded-xl border border-cyan/30 bg-[rgb(var(--bg-soft))] p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-cyan">
              {isStyleCheck ? "Approve Style — Write Full Script" : "Approve Script"}
            </p>
            <p className="text-[11px] text-faint mt-0.5">
              {isStyleCheck
                ? "Voice and tone confirmed. Proceed to write all answers."
                : "Locks the complete Q&A script. Stage 7 designs the full show around these answers."}
            </p>
          </div>
          <button
            onClick={handleApprove}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-cyan px-5 py-2.5 text-sm font-bold text-navy-950 transition hover:brightness-110"
          >
            {isStyleCheck ? "Approve Style →" : "Approve & Continue"}
            {!isStyleCheck && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
