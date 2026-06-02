"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, Zap, AlertTriangle, Loader2,
  AlertCircle, CheckCircle2,
} from "lucide-react";
import { FACT_CHECK_COLORS, SECTION_ARC } from "@/lib/podcast/stages";
import ModelToggle from "@/components/podcast/ModelToggle";
import { getModelPref } from "@/lib/podcast/model-preference";
import { getModelMeta } from "@/lib/podcast/model-labels";

// ─── Red decision options ─────────────────────────────────────────────────────
const RED_OPTIONS = [
  {
    id:       "DROP",
    label:    "Drop",
    icon:     "❌",
    color:    { active: "border-rose-500/50 bg-rose-500/12 text-rose-300", dot: "#f43f5e" },
    desc:     "Remove entirely — cannot be answered credibly",
  },
  {
    id:       "REFRAME_AS_MYTH",
    label:    "Convert to Myth",
    icon:     "🔥",
    color:    { active: "border-amber-500/50 bg-amber-500/12 text-amber-300", dot: "#f59e0b" },
    desc:     "Reframe as honest myth-busting content",
  },
  {
    id:       "HONEST_UNCERTAINTY",
    label:    "Honest Uncertainty",
    icon:     "❓",
    color:    { active: "border-blue-500/50 bg-blue-500/12 text-blue-300", dot: "#3b82f6" },
    desc:     "'We don't know yet' — answer openly",
  },
  {
    id:       "KEEP_WITH_DISCLOSURE",
    label:    "Keep + Disclose",
    icon:     "⚠️",
    color:    { active: "border-yellow-500/50 bg-yellow-500/12 text-yellow-300", dot: "#eab308" },
    desc:     "Keep with explicit no-source disclosure",
  },
  {
    id:       "REPLACE",
    label:    "Replace",
    icon:     "🔄",
    color:    { active: "border-violet-500/50 bg-violet-500/12 text-violet-300", dot: "#8b5cf6" },
    desc:     "Substitute a related answerable question",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const GRADE_HEX = {
  GREEN:  "#22c55e",
  YELLOW: "#f59e0b",
  BLUE:   "#3b82f6",
  RED:    "#ef4444",
};

function GradeChip({ grade }) {
  const c = FACT_CHECK_COLORS[grade];
  if (!c) return null;
  return (
    <span className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.hex }}>
      {grade}
    </span>
  );
}

// ─── Red Decision Card ────────────────────────────────────────────────────────
function RedDecisionCard({ decision, userDecision, onDecide }) {
  const chosen = userDecision ?? decision.decision;
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-3">
      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-soft leading-snug">{decision.question_text}</p>
        <p className="text-[11px] text-faint italic">{decision.claim}</p>
      </div>
      {decision.rationale && (
        <p className="text-[11px] text-faint border-l-2 border-red-500/30 pl-3 leading-relaxed">
          {decision.rationale}
        </p>
      )}
      {/* 5 option buttons */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {RED_OPTIONS.map((opt) => {
          const active = chosen === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onDecide(opt.id)}
              className={`rounded-lg border px-2 py-1.5 text-left text-[10px] font-semibold transition flex items-start gap-1.5 ${
                active
                  ? opt.color.active
                  : "border-[rgb(var(--border))] text-faint hover:text-soft"
              }`}
            >
              <span className="mt-0.5">{opt.icon}</span>
              <div>
                <div>{opt.label}</div>
                <div className="font-normal opacity-70 mt-0.5 leading-tight">{opt.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
      {decision.replacement_question && chosen === "REPLACE" && (
        <div className="rounded-lg bg-violet-500/8 border border-violet-500/20 px-3 py-2 text-[11px] text-violet-300">
          <span className="font-bold">Suggested replacement: </span>
          {decision.replacement_question}
        </div>
      )}
    </div>
  );
}

// ─── Arc Section Card ─────────────────────────────────────────────────────────
function ArcSection({ section, idx }) {
  const arcDef = SECTION_ARC.find((s) => s.id === section.section);
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.04 }}
      className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] overflow-hidden"
    >
      {/* Section header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))]/50">
        <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${section.fixed ? "bg-cyan" : "bg-faint"}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold">{section.section_label || arcDef?.label}</span>
            {section.fixed && (
              <span className="text-[9px] border border-[rgb(var(--border))] px-1.5 py-0.5 rounded text-faint">
                Fixed
              </span>
            )}
            {section.demo_trigger && (
              <span className="flex items-center gap-1 text-[9px] border border-violet-500/30 bg-violet-500/8 px-1.5 py-0.5 rounded text-violet-400">
                <Zap size={9} /> Demo
              </span>
            )}
          </div>
          {arcDef?.desc && (
            <p className="text-[10px] text-faint mt-0.5 truncate">{arcDef.desc}</p>
          )}
        </div>
        <span className="shrink-0 text-[10px] text-faint">{section.questions?.length ?? 0}q</span>
      </div>

      {/* Question list */}
      <div className="px-4 py-3 space-y-2">
        {section.questions?.map((q) => (
          <div key={q.id} className="flex items-start gap-2 text-xs">
            <span
              className="shrink-0 rounded-full mt-1.5"
              style={{
                width: 6, height: 6, minWidth: 6,
                background: GRADE_HEX[q.grade] ?? "#6b7280",
              }}
            />
            <div className="flex-1 min-w-0">
              <span className="text-soft leading-snug">{q.text}</span>
              {q.note && (
                <p className="text-[10px] text-faint mt-0.5 leading-snug">{q.note}</p>
              )}
            </div>
            <GradeChip grade={q.grade} />
          </div>
        ))}

        {/* Demo trigger note */}
        {section.demo_trigger && section.demo_note && (
          <div className="flex items-start gap-2 mt-2 rounded-lg bg-violet-500/8 border border-violet-500/20 px-3 py-2.5 text-[11px]">
            <Zap size={12} className="shrink-0 mt-0.5 text-violet-400" />
            <span className="text-violet-300 leading-relaxed">{section.demo_note}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Overlap Resolution Row ───────────────────────────────────────────────────
function OverlapRow({ overlap }) {
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3 space-y-1.5">
      <p className="text-[11px] text-faint leading-relaxed">{overlap.overlap_description}</p>
      <div className="flex items-start gap-2">
        <CheckCircle2 size={11} className="shrink-0 mt-0.5 text-emerald-400" />
        <p className="text-[11px] text-soft leading-relaxed">{overlap.resolution}</p>
      </div>
      {overlap.kept_in_arc && (
        <p className="text-[10px] font-mono text-faint/60">{overlap.kept_in_arc}</p>
      )}
    </div>
  );
}

// ─── Loading steps ────────────────────────────────────────────────────────────
const LOADING_STEPS = [
  "Processing RED claim decisions from Stage 4",
  "Applying Stage 2 sequencing signals",
  "Arranging questions into 7-section fixed arc",
  "Placing BLUE clinical claim in Solution section",
  "Setting 2 demo triggers (Science + Solution)",
  "Resolving Stage 3 overlap flags",
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Stage5({ data, onComplete, demoMode }) {
  const stage3 = data?.[3];   // { foundation, audience, myth, team, all_questions, overlaps }
  const stage4 = data?.[4];   // { claims, myth_ledger, indian_context, confidence_dashboard, ... }
  const lock   = data?.[2];   // Stage 2 Topic Lock

  const [loading, setLoading]             = useState(false);
  const [result, setResult]               = useState(null);
  const [error, setError]                 = useState(null);
  const [userDecisions, setUserDecisions] = useState({});
  const [modelPref, setModelPref]         = useState(() =>
    typeof window !== "undefined" ? getModelPref(5) : "gemini"
  );

  // ── Generate sequence ──────────────────────────────────────────────────────
  async function handleSequence() {
    setLoading(true);
    setError(null);
    try {
      const geminiKey    = (demoMode || typeof localStorage === "undefined") ? null : localStorage.getItem("V_KEY_GOOGLE");
      const anthropicKey = (demoMode || typeof localStorage === "undefined") ? null : localStorage.getItem("V_KEY_CLAUDE");

      const headers = { "Content-Type": "application/json" };
      if (geminiKey)    headers["x-client-gemini-key"]    = geminiKey;
      if (anthropicKey) headers["x-client-anthropic-key"] = anthropicKey;
      headers["x-preferred-model"] = modelPref;

      const res = await fetch("/api/pipeline/stage5-sequencing", {
        method: "POST",
        headers,
        body: JSON.stringify({
          locked_topic: lock?.locked_topic,
          category:     lock?.category,
          stage3_data:  stage3 ?? null,
          stage4_data:  stage4 ?? null,
          signals:      lock?.signals?.stage5 ?? null,
        }),
      });

      if (!res.ok) throw new Error(`Sequencing API returned ${res.status}`);
      const d = await res.json();

      if (d.mode === "error" || d.error) {
        throw new Error(d.error ?? "Gemini API error — check your API key or quota.");
      }

      // Seed user decisions from AI decisions
      const init = {};
      d.red_decisions?.forEach((rd) => { init[rd.claim_id] = rd.decision; });
      setUserDecisions(init);
      setResult(d);
    } catch (e) {
      setError(e.message || "Sequencing failed — check your API key or try demo mode");
    } finally {
      setLoading(false);
    }
  }

  // ── Approve ────────────────────────────────────────────────────────────────
  function handleApprove() {
    const finalDecisions = result.red_decisions?.map((rd) => ({
      ...rd,
      decision: userDecisions[rd.claim_id] ?? rd.decision,
    })) ?? [];

    onComplete({
      red_decisions:       finalDecisions,
      arc:                 result.arc,
      overlap_resolutions: result.overlap_resolutions,
      total_questions:     result.total_questions,
      arc_summary:         result.arc_summary,
    });
  }

  // ── Derived state ──────────────────────────────────────────────────────────
  const redDecisions = result?.red_decisions ?? [];
  const allDecisionsMade =
    redDecisions.length === 0 ||
    redDecisions.every((rd) => !!userDecisions[rd.claim_id]);

  const cd = stage4?.confidence_dashboard;

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold mb-1">Question Lock &amp; Sequencing</h2>
        <p className="text-sm text-faint">
          Part A: decide what to do with RED-graded claims from Stage 4. Part B: arrange all approvable questions into the fixed 7-section arc.
        </p>
      </div>

      {/* ── Not yet run ──────────────────────────────────────────────────── */}
      {!result && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 text-center space-y-4">

          {/* Stage 4 summary tiles */}
          {cd && (
            <div className="flex justify-center gap-4">
              {["green", "yellow", "blue", "red"].map((g) => {
                const GRADE = g.toUpperCase();
                const c     = FACT_CHECK_COLORS[GRADE];
                const count = cd[g] ?? 0;
                return (
                  <div key={g} className="text-center">
                    <div className="text-xl font-black leading-none" style={{ color: c.hex }}>{count}</div>
                    <div className="text-[9px] font-bold" style={{ color: c.hex }}>{GRADE}</div>
                  </div>
                );
              })}
            </div>
          )}

          {lock?.locked_topic && (
            <p className="text-sm font-semibold">{lock.locked_topic}</p>
          )}

          <div className="text-4xl">📋</div>
          <div>
            <p className="text-sm font-semibold mb-1">Generate Question Sequence</p>
            <p className="text-xs text-faint max-w-sm mx-auto">
              The system will resolve RED claims, arrange questions into the 7-section arc,
              place Blue clinical claims in Solution, and set 2 demo triggers.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/8 px-4 py-2.5 text-xs text-red-300 text-left">
              <AlertCircle size={13} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <ModelToggle stageNum={5} onChange={setModelPref} disabled={loading} />
          <button onClick={handleSequence}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-bold text-white transition hover:brightness-110 mx-auto">
            <ChevronRight size={14} /> Generate Sequence
          </button>
        </motion.div>
      )}

      {/* ── Loading ──────────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 text-center space-y-4">
          <Loader2 size={22} className="animate-spin text-orange-400 mx-auto" />
          <p className="text-sm font-semibold">Generating Question Sequence…</p>
          <div className="space-y-2 text-left max-w-sm mx-auto">
            {LOADING_STEPS.map((step) => (
              <div key={step} className="flex items-start gap-2 text-xs text-faint">
                <Loader2 size={11} className="animate-spin text-orange-400 shrink-0 mt-0.5" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

            {/* Data source badge — confirms whether this came from live LLM or demo */}
            <div className="flex justify-end -mb-2">
              {result.mode === "demo" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Demo data (mock — no API call made)
                </span>
              ) : (() => {
                const meta = getModelMeta(result.mode);
                return (
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${meta.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                    Live · {meta.label}
                    {meta.version && <span className="font-normal opacity-60 text-[9px]">{meta.version}</span>}
                  </span>
                );
              })()}
            </div>

            {/* Part A — Red Decisions */}
            {redDecisions.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-faint mb-1">
                  Part A — RED Claim Decisions ({redDecisions.length})
                </p>
                <p className="text-[11px] text-faint mb-3">
                  The system has recommended an action for each RED claim. You can override any decision before approving.
                </p>
                <div className="space-y-3">
                  {redDecisions.map((rd) => (
                    <RedDecisionCard
                      key={rd.claim_id}
                      decision={rd}
                      userDecision={userDecisions[rd.claim_id]}
                      onDecide={(action) =>
                        setUserDecisions((prev) => ({ ...prev, [rd.claim_id]: action }))
                      }
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Part B — 7-Section Arc */}
            {result.arc?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-faint">
                    Part B — 7-Section Arc
                  </p>
                  {result.total_questions && (
                    <span className="text-[10px] text-faint">{result.total_questions} questions</span>
                  )}
                </div>
                {result.arc_summary && (
                  <p className="text-[11px] text-faint mb-3 leading-relaxed border-l-2 border-[rgb(var(--border))] pl-3">
                    {result.arc_summary}
                  </p>
                )}
                <div className="space-y-2">
                  {result.arc.map((section, idx) => (
                    <ArcSection key={section.section} section={section} idx={idx} />
                  ))}
                </div>
              </div>
            )}

            {/* Overlap Resolutions */}
            {result.overlap_resolutions?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-faint mb-3">
                  Overlap Resolutions ({result.overlap_resolutions.length})
                </p>
                <div className="space-y-2">
                  {result.overlap_resolutions.map((overlap, i) => (
                    <OverlapRow key={i} overlap={overlap} />
                  ))}
                </div>
              </div>
            )}

            {/* Approve gate */}
            <div className="rounded-xl border border-cyan/30 bg-[rgb(var(--bg-soft))] p-4 space-y-3">
              {!allDecisionsMade && (
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/8 px-3 py-2 text-[11px] text-amber-300">
                  <AlertTriangle size={11} className="shrink-0" />
                  Complete all RED claim decisions before approving.
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-cyan">Approve question flow</p>
                  <p className="text-[11px] text-faint mt-0.5">
                    Locks the section arc. Stage 6 writes Dr. Prabhakar's spoken answers for each question.
                  </p>
                </div>
                <button
                  disabled={!allDecisionsMade}
                  onClick={handleApprove}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-cyan px-5 py-2.5 text-sm font-bold text-navy-950 transition hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Approve &amp; Continue <ChevronRight size={14} />
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
