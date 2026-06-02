"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, Loader2, Zap, ShieldCheck, Mic2, AlertCircle,
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

const SEGMENT_TYPE_COLOR = { fixed: "#22d3ee", flexible: "#818cf8", signature: "#f59e0b" };

function GradeDot({ grade }) {
  const c = FACT_CHECK_COLORS[grade];
  if (!c) return null;
  return <span className="inline-block h-2 w-2 rounded-full shrink-0" style={{ background: c.hex }} />;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Stage7({ data, onComplete, demoMode }) {
  const [loading,   setLoading]   = useState(false);
  const [segments,  setSegments]  = useState(null);
  const [error,     setError]     = useState(null);
  const [modelPref, setModelPref] = useState(() =>
    typeof window !== "undefined" ? getModelPref(7) : "gemini"
  );

  const stage6 = data?.[6];
  const stage4 = data?.[4];
  const lock   = data?.[2];

  const locked_topic    = lock?.topic?.title ?? lock?.topic ?? "Health Topic";
  const angle           = lock?.angle?.frame ?? null;
  const pillars         = lock?.pillars ?? [];
  const primary_viewer  = lock?.audience?.primary ?? null;
  const indian_context  = stage4?.indian_context ?? [];
  const stage6_sections = stage6?.sections ?? [];
  const total_runtime   = stage6?.total_runtime_min ?? 30;

  async function handleDesign() {
    setLoading(true);
    setError(null);
    try {
      const { geminiKey, anthropicKey } = getApiKeys(demoMode);
      const res = await fetch("/api/pipeline/stage7-segments", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          ...(geminiKey    && { "x-client-gemini-key":    geminiKey }),
          ...(anthropicKey && { "x-client-anthropic-key": anthropicKey }),
          "x-preferred-model": modelPref,
        },
        body: JSON.stringify({
          locked_topic,
          angle,
          pillars,
          primary_viewer,
          stage6_sections,
          indian_context,
          total_runtime_min: total_runtime,
        }),
      });
      const json = await res.json();
      if (json.mode === "error" || json.error) {
        throw new Error(json.error ?? "Gemini API error — check your API key or quota.");
      }
      setSegments(json);
    } catch (e) {
      setError(e.message || "Failed to generate show design.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-1">Segments & Engagement</h2>
        <p className="text-sm text-faint">
          Turns the content into a show and a funnel. Demonstrations, signature segments, CTAs, and the lead magnet are designed here.
          The Superfood of the Day segment runs its own fact-check inside this stage.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3">
          <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-400" />
          <div>
            <p className="text-xs font-bold text-red-400 mb-0.5">Generation error</p>
            <p className="text-xs text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Pre-run */}
      {!segments && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 text-center">
          <div className="text-4xl mb-3">🎬</div>
          <p className="text-sm font-semibold mb-1">Design the episode</p>
          <p className="text-xs text-faint mb-4">
            Generates the segment map, demonstrations, Superfood (fact-checked), CTAs, and lead magnet.
            {stage6_sections.length > 0 && (
              <span className="block mt-1 text-cyan">Using your approved Stage 6 script ({stage6_sections.length} sections).</span>
            )}
          </p>
          <ModelToggle stageNum={7} onChange={setModelPref} disabled={loading} />
          <button onClick={handleDesign}
            className="flex items-center gap-2 rounded-xl bg-cyan px-6 py-2.5 text-sm font-bold text-navy-950 transition hover:brightness-110 mx-auto">
            <Zap size={14} /> Design Show
          </button>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 text-center">
          <Loader2 size={20} className="animate-spin text-cyan mx-auto mb-3" />
          <p className="text-sm font-semibold">Designing show…</p>
          <p className="text-xs text-faint mt-1">Segment map · Demonstrations · Superfood fact-check · CTA injection · Lead magnet</p>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {segments && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

            {/* Mode badge */}
            {segments.mode && segments.mode !== "demo" && (() => {
              const meta = getModelMeta(segments.mode);
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

            {/* Segment map */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-faint mb-3">Segment Map</p>
              <div className="space-y-2">
                {(segments.segmentMap ?? []).map((seg, idx) => (
                  <div key={seg.id ?? idx} className="flex items-center gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-3">
                    <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: SEGMENT_TYPE_COLOR[seg.type] ?? "#94a3b8" }} />
                    <span className="flex-1 text-xs font-semibold">{idx + 1}. {seg.label}</span>
                    <span className="text-[11px] text-faint">{seg.duration}</span>
                    {seg.type === "signature" && <Mic2 size={12} className="text-amber-400" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Demonstrations */}
            {(segments.demonstrations?.length ?? 0) > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-faint mb-3">Demonstrations</p>
                {segments.demonstrations.map((demo, i) => (
                  <div key={demo.id ?? i} className="rounded-xl border border-violet-500/25 bg-violet-500/6 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={13} className="text-violet-400" />
                      <span className="text-xs font-bold text-violet-300">
                        [DEMO] — {demo.type === "table-prop" ? "Table Prop" : "Animation / B-Roll"}
                      </span>
                    </div>
                    <p className="text-[11px] text-soft leading-relaxed mb-2">{demo.description}</p>
                    <div className="rounded-lg bg-[rgb(var(--panel))] border border-[rgb(var(--border))] px-3 py-2 text-[10px] text-faint">
                      <span className="font-bold">Props needed: </span>{demo.prop}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Superfood */}
            {segments.superfood && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-faint">Superfood of the Day</p>
                  <ShieldCheck size={12} className="text-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-semibold">Fact-checked</span>
                </div>
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-3">
                  <p className="text-sm font-bold text-amber-300">{segments.superfood.name}</p>
                  <div className="space-y-2">
                    {(segments.superfood.claims ?? []).map((claim, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px]">
                        <GradeDot grade={claim.grade} />
                        <div>
                          <span className="text-soft">{claim.claim}</span>
                          <span className="ml-2 font-mono text-[10px] text-faint">{claim.citation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-lg bg-emerald-500/8 border border-emerald-500/20 px-3 py-2">
                      <p className="font-bold text-emerald-300 mb-1">Who should take:</p>
                      <p className="text-faint leading-snug">{segments.superfood.whoShouldTake}</p>
                    </div>
                    <div className="rounded-lg bg-red-500/8 border border-red-500/20 px-3 py-2">
                      <p className="font-bold text-red-300 mb-1">Who should avoid:</p>
                      <p className="text-faint leading-snug">{segments.superfood.whoShouldAvoid}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CTAs */}
            {(segments.ctaPoints?.length ?? 0) > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-faint mb-3">CTA Injection Points</p>
                <div className="space-y-2">
                  {segments.ctaPoints.map((cta, i) => (
                    <div key={i} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3">
                      <p className="text-[10px] text-faint mb-1">
                        After: <span className="font-semibold">{(cta.position ?? "").replace(/-/g, " ")}</span>
                      </p>
                      <p className="text-xs text-soft">{cta.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lead magnet */}
            {segments.leadMagnet && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-faint mb-3">Lead Magnet</p>
                <div className="rounded-xl border border-cyan/25 bg-cyan/5 p-4">
                  <p className="text-xs font-bold text-cyan mb-1">Selected:</p>
                  <p className="text-xs text-soft">{segments.leadMagnet.chosen}</p>
                  {segments.leadMagnet.alternatives?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-[10px] text-faint">Alternatives:</p>
                      {segments.leadMagnet.alternatives.map((alt, i) => (
                        <p key={i} className="text-[11px] text-faint pl-2 border-l border-[rgb(var(--border))]">{alt}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Rewrite button */}
            <button
              onClick={() => { setSegments(null); setError(null); }}
              className="text-[11px] text-faint hover:text-soft transition underline underline-offset-2"
            >
              Redesign show
            </button>

            {/* Gate */}
            <div className="rounded-xl border border-cyan/30 bg-[rgb(var(--bg-soft))] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-cyan">Approve show design</p>
                  <p className="text-[11px] text-faint mt-0.5">Includes the Superfood fact-check. Stage 8 assembles the full production script.</p>
                </div>
                <button
                  onClick={() => onComplete({ segments })}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-cyan px-5 py-2.5 text-sm font-bold text-navy-950 transition hover:brightness-110"
                >
                  Approve & Continue <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
