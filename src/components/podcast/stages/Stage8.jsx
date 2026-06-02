"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, Loader2, Clock, FileText, Film, AlertCircle,
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

const CUE_TAG_COLOR = {
  DEMO:               "#8b5cf6",
  "B-ROLL":           "#06b6d4",
  PROP:               "#f59e0b",
  CTA:                "#22c55e",
  "SIGNATURE SEGMENT":"#f97316",
  GRAPHIC:            "#ec4899",
  "RAPID FIRE":       "#f43f5e",
};

function formatCueText(text) {
  const parts = text.split(/(\[[A-Z\s]+\])/g);
  return parts.map((part, i) => {
    const match = part.match(/\[([A-Z\s]+)\]/);
    if (match) {
      const tag   = match[1].trim();
      const color = CUE_TAG_COLOR[tag] || "#94a3b8";
      return <span key={i} className="font-bold" style={{ color }}>{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

const LOADING_STEPS = [
  "Reading approved Stage 6 Q&A dialogue…",
  "Loading Stage 7 show design (demos, CTAs, superfood)…",
  "Building cold open from the strongest hook…",
  "Inserting demo trigger blocks with production cues…",
  "Adding Superfood of the Day signature segment…",
  "Injecting CTA blocks at approved positions…",
  "Writing re-hook beat for minute 15 bridge…",
  "Assembling Rapid Fire close…",
  "Building one-page run sheet and props list…",
];

// ── Main component ────────────────────────────────────────────────────────────

export default function Stage8({ data, onComplete, demoMode }) {
  const [loading,   setLoading]   = useState(false);
  // Auto-resume from saved data when viewing from history (zero-API flow)
  const [script,    setScript]    = useState(() => data?.[8]?.script ?? null);
  const [error,     setError]     = useState(null);
  const [tab,       setTab]       = useState("script"); // "script" | "runsheet"
  const [modelPref, setModelPref] = useState(() =>
    typeof window !== "undefined" ? getModelPref(8) : "gemini"
  );

  const stage7 = data?.[7];
  const stage6 = data?.[6];
  const lock   = data?.[2];

  const locked_topic    = lock?.topic?.title ?? lock?.topic ?? "Health Topic";
  const stage6_sections = stage6?.sections ?? [];
  const stage7_data     = stage7?.segments ?? stage7 ?? null;

  async function handleAssemble() {
    setLoading(true);
    setError(null);
    try {
      const { geminiKey, anthropicKey } = getApiKeys(demoMode);
      const res = await fetch("/api/pipeline/stage8-assembly", {
        method:  "POST",
        headers: {
          "Content-Type":      "application/json",
          "x-preferred-model": modelPref,
          ...(geminiKey    && { "x-client-gemini-key":    geminiKey }),
          ...(anthropicKey && { "x-client-anthropic-key": anthropicKey }),
        },
        body: JSON.stringify({ locked_topic, stage6_sections, stage7_data }),
      });
      const json = await res.json();
      if (json.mode === "error" || json.error) {
        throw new Error(json.error ?? "Gemini API error — check your API key or quota.");
      }
      setScript(json);
    } catch (e) {
      setError(e.message || "Failed to assemble script.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-1">Script Assembly</h2>
        <p className="text-sm text-faint">
          Stitches every approved piece into one complete, shootable two-column production script.
          Stage 8 creates nothing new — it arranges approved material into final form.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3">
          <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-400" />
          <div>
            <p className="text-xs font-bold text-red-400 mb-0.5">Assembly error</p>
            <p className="text-xs text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Pre-run */}
      {!script && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 text-center">
          <div className="text-4xl mb-3">📜</div>
          <p className="text-sm font-semibold mb-1">Assemble the production script</p>
          <p className="text-xs text-faint mb-4">
            Two-column format: left = spoken words, right = camera/B-roll cues.
            {stage6_sections.length > 0 && (
              <span className="block mt-1 text-cyan">
                Using {stage6_sections.length} approved sections from Stage 6
                {stage7_data ? " + Stage 7 show design." : "."}
              </span>
            )}
          </p>
          <ModelToggle stageNum={8} onChange={setModelPref} disabled={loading} />
          <button onClick={handleAssemble}
            className="flex items-center gap-2 rounded-xl bg-cyan px-6 py-2.5 text-sm font-bold text-navy-950 transition hover:brightness-110 mx-auto">
            <FileText size={14} /> Assemble Script
          </button>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Loader2 size={20} className="animate-spin text-cyan shrink-0" />
            <div>
              <p className="text-sm font-semibold">Assembling production script…</p>
              <p className="text-xs text-faint mt-0.5">This may take 30–60 seconds — the full script is a large document.</p>
            </div>
          </div>
          <div className="space-y-2">
            {LOADING_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.35 }}
                className="flex items-center gap-2 text-[11px] text-faint"
              >
                <div className="h-1 w-1 rounded-full bg-cyan shrink-0" />
                {step}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {script && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

            {/* Runtime + reel count */}
            <div className="flex gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-3 flex-1">
                <Clock size={14} className="text-cyan" />
                <span className="text-xs font-semibold">Total runtime:</span>
                <span className="text-xs font-bold text-cyan">{script.totalRuntime ?? "—"}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-violet-500/25 bg-violet-500/5 px-4 py-3 flex-1">
                <Film size={14} className="text-violet-400" />
                <span className="text-xs font-semibold text-violet-300">Script blocks: </span>
                <span className="text-xs font-bold text-violet-300">{script.scriptBlocks?.length ?? 0}</span>
              </div>
            </div>

            {/* Mode badge */}
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

            {/* Tabs */}
            <div className="flex gap-1 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-1">
              {[{ id: "script", label: "Production Script" }, { id: "runsheet", label: "Run Sheet" }].map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${tab === t.id ? "bg-[rgb(var(--bg))] text-cyan" : "text-faint hover:text-soft"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Script tab */}
            {tab === "script" && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 text-[10px] text-faint">
                  {Object.entries(CUE_TAG_COLOR).map(([tag, color]) => (
                    <span key={tag} className="font-bold" style={{ color }}>[{tag}]</span>
                  ))}
                </div>
                {(script.scriptBlocks ?? []).map((block, idx) => (
                  <motion.div key={block.id ?? idx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="rounded-xl border border-[rgb(var(--border))] overflow-hidden">
                    <div className="bg-[rgb(var(--panel))] border-b border-[rgb(var(--border))] px-4 py-2 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-faint">{block.type}</span>
                      {block.grade && (
                        <span className="h-2 w-2 rounded-full"
                          style={{ background: FACT_CHECK_COLORS[block.grade]?.hex || "#94a3b8" }} />
                      )}
                      {block.citation && (
                        <span className="text-[10px] font-mono text-faint truncate max-w-[300px]">{block.citation}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-[rgb(var(--border))]">
                      <div className="p-4">
                        <p className="text-[10px] font-bold uppercase text-faint mb-2">SCRIPT</p>
                        <pre className="text-xs text-soft whitespace-pre-wrap leading-relaxed font-sans">{block.left}</pre>
                      </div>
                      <div className="p-4 bg-[rgb(var(--bg-soft))]">
                        <p className="text-[10px] font-bold uppercase text-faint mb-2">PRODUCTION CUES</p>
                        <pre className="text-xs whitespace-pre-wrap leading-relaxed font-sans">
                          {formatCueText(block.right ?? "")}
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Run sheet tab */}
            {tab === "runsheet" && script.runSheet && (
              <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5 space-y-4">
                <p className="text-sm font-bold">Episode Run Sheet — {script.totalRuntime}</p>
                <div>
                  <p className="text-[10px] font-bold uppercase text-faint mb-2">Segments</p>
                  {(script.runSheet.segments ?? []).map((s, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-[rgb(var(--border))] last:border-0">
                      <span className="text-[10px] font-bold text-faint w-4">{i + 1}</span>
                      <span className="text-xs text-soft">{s}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-faint mb-2">Props Required</p>
                  {(script.runSheet.props ?? []).map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-soft py-1">
                      <span className="text-amber-400">📦</span> {p}
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-cyan/8 border border-cyan/20 px-3 py-2 text-xs">
                  <span className="font-bold text-cyan">Total (incl. transitions): </span>
                  <span className="text-soft">{script.runSheet.totalRuntime}</span>
                </div>
              </div>
            )}

            {/* Rewrite button */}
            <button
              onClick={() => { setScript(null); setError(null); }}
              className="text-[11px] text-faint hover:text-soft transition underline underline-offset-2"
            >
              Reassemble script
            </button>

            {/* Gate */}
            <div className="rounded-xl border border-cyan/30 bg-[rgb(var(--bg-soft))] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-cyan">Approve production script</p>
                  <p className="text-[11px] text-faint mt-0.5">Final fact-check view. Stage 9 extracts reel opportunities from this script.</p>
                </div>
                <button onClick={() => onComplete({ script })}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-cyan px-5 py-2.5 text-sm font-bold text-navy-950 transition hover:brightness-110">
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
