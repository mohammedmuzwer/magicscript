"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Loader2, Film, AlertCircle, Globe } from "lucide-react";
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

const CATEGORY_COLORS = {
  "Myth-Buster (Disproven)": "#22c55e",
  "Myth-Buster (Unsettled)": "#f59e0b",
  "Science":                 "#06b6d4",
  "Demo":                    "#8b5cf6",
  "Practical":               "#f97316",
  "Superfood":               "#ec4899",
  "Problem-Solution":        "#818cf8",
};

// ── ReelCard ──────────────────────────────────────────────────────────────────

function ReelCard({ reel, index }) {
  const [open, setOpen] = useState(false);
  const catColor   = CATEGORY_COLORS[reel.category] || "#94a3b8";
  const gradeColor = FACT_CHECK_COLORS[reel.grade]?.hex || "#94a3b8";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] overflow-hidden"
    >
      <button onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-4 text-left hover:bg-[rgb(var(--bg-soft))] transition">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-[rgb(var(--border))] text-xs font-bold text-faint">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold leading-snug mb-1">{reel.title}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ background: catColor + "18", border: `1px solid ${catColor}40`, color: catColor }}>
              {reel.category}
            </span>
            <span className="h-2 w-2 rounded-full" style={{ background: gradeColor }} />
            <span className="text-[10px] text-faint">{reel.grade}</span>
          </div>
        </div>
        <Film size={14} className="shrink-0 text-faint mt-0.5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="border-t border-[rgb(var(--border))] p-4 space-y-4">

              {/* Reel script */}
              <div>
                <p className="text-[10px] font-bold uppercase text-faint mb-2">Reel Script</p>
                <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-4 py-3 text-xs text-soft leading-relaxed">
                  {reel.script}
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-start gap-2">
                <p className="text-[10px] font-bold text-faint shrink-0 mt-0.5">CTA:</p>
                <p className="text-[11px] text-soft">{reel.cta}</p>
              </div>

              {/* Editing ideas */}
              <div>
                <p className="text-[10px] font-bold uppercase text-faint mb-1">Editing Ideas</p>
                <div className="rounded-lg bg-[rgb(var(--bg-soft))] border border-[rgb(var(--border))] px-3 py-2 text-[11px] text-faint leading-relaxed">
                  {reel.editingIdeas}
                </div>
              </div>

              {/* Source block */}
              {(reel.sources?.length ?? 0) > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase text-faint mb-1">Source Block</p>
                  <div className="rounded-lg border px-3 py-2 space-y-1"
                    style={{
                      borderColor: FACT_CHECK_COLORS[reel.grade]?.border || "#334155",
                      background:  FACT_CHECK_COLORS[reel.grade]?.bg    || "#0f172a",
                    }}>
                    {reel.sources.map((s, i) => (
                      <p key={i} className="text-[10px] font-mono leading-relaxed"
                        style={{ color: FACT_CHECK_COLORS[reel.grade]?.hex || "#94a3b8" }}>
                        {s}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Stage9({ data, onComplete, demoMode }) {
  const [loading,    setLoading]    = useState(false);
  // Auto-resume from saved data when viewing from history (zero-API flow)
  const [reels,      setReels]      = useState(() => data?.[9]?.reels ?? null);
  const [activeMode, setActiveMode] = useState(null);
  const [error,      setError]      = useState(null);
  const [modelPref,  setModelPref]  = useState(() =>
    typeof window !== "undefined" ? getModelPref(9) : "claude"
  );

  const stage8 = data?.[8];
  const stage7 = data?.[7];
  const lock   = data?.[2];

  const locked_topic     = lock?.topic?.title ?? lock?.topic ?? "Health Topic";
  const script_blocks    = stage8?.script?.scriptBlocks ?? stage8?.scriptBlocks ?? [];
  const lead_magnet_title = stage7?.segments?.leadMagnet?.chosen ?? stage7?.leadMagnet?.chosen ?? null;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const { geminiKey, anthropicKey } = getApiKeys(demoMode);
      const res = await fetch("/api/pipeline/stage9-reels", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          ...(geminiKey    && { "x-client-gemini-key":    geminiKey }),
          ...(anthropicKey && { "x-client-anthropic-key": anthropicKey }),
          "x-preferred-model": modelPref,
        },
        body: JSON.stringify({ locked_topic, script_blocks, lead_magnet_title }),
      });
      const json = await res.json();
      if (json.mode === "error" || json.error) {
        throw new Error(json.error ?? "Gemini API error — check your API key or quota.");
      }
      // Route returns { reels: [...], mode }
      setReels(json.reels ?? []);
      setActiveMode(json.mode ?? null);
    } catch (e) {
      setError(e.message || "Failed to generate reels sheet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-1">Recommended Reels Sheet</h2>
        <p className="text-sm text-faint">
          Inspiration brief for the editing team — 8-12 reel opportunities with category tags, CTAs, editing ideas, and source blocks.
          Every reel carries an honest source block. No fake links. The script is copied as-is from Stage 8.
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
      {!reels && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 text-center">
          <div className="text-4xl mb-3">🎞️</div>
          <p className="text-sm font-semibold mb-1">Generate Reels Sheet</p>
          <p className="text-xs text-faint mb-4">
            Scans the final script and identifies the strongest reel opportunities. Each comes with source block and editing ideas.
            {script_blocks.length > 0 && (
              <span className="block mt-1 text-cyan">Using {script_blocks.length} script blocks from Stage 8.</span>
            )}
          </p>
          <ModelToggle stageNum={9} onChange={setModelPref} disabled={loading} />
          <button onClick={handleGenerate}
            className="flex items-center gap-2 rounded-xl bg-cyan px-6 py-2.5 text-sm font-bold text-navy-950 transition hover:brightness-110 mx-auto">
            <Film size={14} /> Generate Reels Sheet
          </button>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 text-center">
          <Loader2 size={20} className="animate-spin text-cyan mx-auto mb-3" />
          <p className="text-sm font-semibold">Scanning script for reel opportunities…</p>
          <p className="text-xs text-faint mt-1">Tagging categories · Attaching source blocks · Generating editing ideas</p>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {reels && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

            {/* Mode badge */}
            {activeMode && activeMode !== "demo" && (() => {
              const meta = getModelMeta(activeMode);
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

            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{reels.length} reel opportunities identified</p>
              <p className="text-[11px] text-faint">Click to expand each reel</p>
            </div>

            <div className="space-y-3">
              {reels.map((reel, i) => (
                <ReelCard key={reel.id ?? i} reel={reel} index={i} />
              ))}
            </div>

            {/* Rewrite button */}
            <button
              onClick={() => { setReels(null); setError(null); }}
              className="text-[11px] text-faint hover:text-soft transition underline underline-offset-2"
            >
              Regenerate reels
            </button>

            {/* Gate */}
            <div className="rounded-xl border border-cyan/30 bg-[rgb(var(--bg-soft))] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-cyan">Approve Reels Sheet</p>
                  <p className="text-[11px] text-faint mt-0.5">Stage 10 will convert the full script &amp; reels to Tanglish.</p>
                </div>
                <button onClick={() => onComplete({ reels })}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-cyan px-5 py-2.5 text-sm font-bold text-navy-950 transition hover:brightness-110">
                  Approve &amp; Translate <Globe size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
