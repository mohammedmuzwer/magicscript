"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Loader2, CheckCircle2, AlertCircle, Clock,
  Film, Languages, Sparkles, PartyPopper,
} from "lucide-react";
import { FACT_CHECK_COLORS } from "@/lib/podcast/stages";
import { getModelMeta } from "@/lib/podcast/model-labels";
import { savePodcastEpisode } from "@/lib/supabaseClient";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getApiKeys(demoMode = false) {
  if (typeof window === "undefined" || demoMode) return { geminiKey: "", anthropicKey: "" };
  return {
    geminiKey:    localStorage.getItem("V_KEY_GOOGLE") || "",
    anthropicKey: localStorage.getItem("V_KEY_CLAUDE") || "",
  };
}

// Reused from Stage 8
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
  if (!text) return null;
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
  "Loading Stage 8 production script…",
  "Loading Stage 9 reels sheet…",
  "Translating run sheet segments to Tanglish…",
  "Converting Dr. Prabhakar's dialogue — preserving warm tone…",
  "Keeping medical terms in English (HbA1c, insulin resistance…)…",
  "Translating INTERVIEWER lines to conversational Tanglish…",
  "Applying Tanglish register (Parunga / Theriyuma / Solren…)…",
  "Converting reel hooks — scroll-stopping Tanglish…",
  "Translating reel scripts block by block…",
  "Finalising translation notes and term preservation list…",
];

const CATEGORY_COLORS = {
  "Myth-Buster (Disproven)": "#22c55e",
  "Myth-Buster (Unsettled)": "#f59e0b",
  "Science":                 "#06b6d4",
  "Demo":                    "#8b5cf6",
  "Practical":               "#f97316",
  "Superfood":               "#ec4899",
  "Problem-Solution":        "#818cf8",
};

// ── Tanglish Reel Card ────────────────────────────────────────────────────────

function TanglishReelCard({ reel, index }) {
  const [open, setOpen] = useState(false);
  const catColor   = CATEGORY_COLORS[reel.category] || "#94a3b8";
  const gradeColor = FACT_CHECK_COLORS[reel.grade]?.hex || "#94a3b8";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
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
            {reel.grade && (
              <>
                <span className="h-2 w-2 rounded-full" style={{ background: gradeColor }} />
                <span className="text-[10px] text-faint">{reel.grade}</span>
              </>
            )}
          </div>
          {/* hook preview */}
          <p className="text-[11px] text-emerald-400 mt-1.5 italic leading-snug line-clamp-1">
            "{reel.hook}"
          </p>
        </div>
        <Globe size={14} className="shrink-0 text-emerald-400 mt-0.5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="border-t border-[rgb(var(--border))] p-4 space-y-4">

              {/* Hook */}
              <div>
                <p className="text-[10px] font-bold uppercase text-emerald-400 mb-1.5">Tanglish Hook</p>
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 text-sm font-semibold text-emerald-300 leading-relaxed italic">
                  "{reel.hook}"
                </div>
              </div>

              {/* Script */}
              <div>
                <p className="text-[10px] font-bold uppercase text-faint mb-1.5">Tanglish Reel Script</p>
                <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-4 py-3 text-xs text-soft leading-relaxed whitespace-pre-wrap">
                  {reel.script}
                </div>
              </div>

              {/* Editing idea — kept in English */}
              {reel.editing_idea && (
                <div>
                  <p className="text-[10px] font-bold uppercase text-faint mb-1">Editing Idea</p>
                  <div className="rounded-lg bg-[rgb(var(--bg-soft))] border border-[rgb(var(--border))] px-3 py-2 text-[11px] text-faint leading-relaxed">
                    {reel.editing_idea}
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

export default function Stage10({ data, onComplete, demoMode, episodeId = null }) {
  const [loading,    setLoading]    = useState(false);
  // Auto-resume from saved data when viewing from history (zero-API flow)
  const [result,     setResult]     = useState(() => data?.[10]?.tanglish ?? null);
  const [error,      setError]      = useState(null);
  const [tab,        setTab]        = useState("script"); // "script" | "runsheet" | "reels"
  const [saveState,  setSaveState]  = useState("idle");   // "idle" | "saving" | "saved" | "error"
  const [celebrated, setCelebrated] = useState(false);
  const [activeMode, setActiveMode] = useState(null);

  // Pull upstream data
  const stage8 = data?.[8];
  const stage9 = data?.[9];
  const lock   = data?.[2];

  const locked_topic = lock?.topic?.title ?? lock?.topic ?? "Health Topic";
  const stage8_data  = stage8?.script ?? stage8 ?? null;
  const stage9_data  = stage9?.reels  ?? stage9 ?? null;

  // ── Generate translation ──────────────────────────────────────────────────

  async function handleTranslate() {
    setLoading(true);
    setError(null);
    try {
      const { geminiKey } = getApiKeys(demoMode);
      const res = await fetch("/api/pipeline/stage10-translation", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          ...(geminiKey && { "x-client-gemini-key": geminiKey }),
        },
        body: JSON.stringify({ locked_topic, stage8_data, stage9_data }),
      });
      const json = await res.json();
      if (json.mode === "error" || json.error) {
        throw new Error(json.error ?? "Translation failed — check your Gemini API key.");
      }
      setResult(json);
      setActiveMode(json.mode ?? null);
    } catch (e) {
      setError(e.message || "Translation failed.");
    } finally {
      setLoading(false);
    }
  }

  // ── Finish & Save Project ─────────────────────────────────────────────────

  async function handleFinish() {
    setSaveState("saving");
    try {
      // Robust topic extraction — checks every place a real title could live.
      // Uses || (not ??) so empty strings fall through to the next fallback.
      const topic       =
            data?.[2]?.locked_topic
         || data?.[1]?.topic?.title
         || data?.[1]?.topic?.reframe?.title
         || data?.[1]?.keyword
         || "Untitled Episode";
      const finalScript = stage8_data;
      const showDesign  = data?.[7] ?? null;
      const allStageData = { ...data, 10: result };

      // Pass episodeId so this UPDATES the same row Stage 8 created.
      // One row per project — no duplicate.
      const saved = await savePodcastEpisode({ id: episodeId, topic, finalScript, showDesign, allStageData });

      if (saved?.id) {
        setSaveState("saved");
        setCelebrated(true);
        setTimeout(() => {
          onComplete({ tanglish: result, episode_id: saved.id });
        }, 3500);
      } else {
        // Supabase not configured (demo mode) — still celebrate
        setSaveState("saved");
        setCelebrated(true);
        setTimeout(() => {
          onComplete({ tanglish: result, episode_id: null });
        }, 3500);
      }
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 5000);
    }
  }

  // ── Celebration overlay ───────────────────────────────────────────────────

  if (celebrated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-transparent p-10 text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="text-6xl"
          >
            🎉
          </motion.div>
          <div>
            <h2 className="text-2xl font-black text-emerald-300 mb-2">Episode Complete!</h2>
            <p className="text-sm text-faint max-w-md mx-auto">
              Your full Tanglish podcast production pack is ready — script, run sheet, and reels sheet — all localised for Dr. Prabhakar's Tamil Nadu audience.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { emoji: "📜", label: "Production Script", sub: "Two-column Tanglish" },
              { emoji: "🎞️", label: "Reels Sheet",       sub: "Scroll-stopping hooks" },
              { emoji: "📋", label: "Run Sheet",         sub: "Tamil PA-ready" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="text-2xl mb-1">{item.emoji}</div>
                <p className="text-xs font-bold text-emerald-300">{item.label}</p>
                <p className="text-[10px] text-faint">{item.sub}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-400">
            <CheckCircle2 size={13} />
            {saveState === "saved" ? "Saved to library" : "Project complete"}
          </div>
          <p className="text-xs text-faint animate-pulse">Returning to pipeline…</p>
        </div>
      </motion.div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-bold">Translation / Localisation</h2>
          <Globe size={18} className="text-emerald-400" />
        </div>
        <p className="text-sm text-faint">
          Converts the full Stage 8 production script and Stage 9 reels sheet into Tanglish —
          the warm Tamil-English mix of Dr. Prabhakar's audience. Medical terms, production cues,
          and source links are preserved in English.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3">
          <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-400" />
          <div>
            <p className="text-xs font-bold text-red-400 mb-0.5">Translation error</p>
            <p className="text-xs text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Pre-run card */}
      {!result && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 text-center">
          <div className="text-4xl mb-3">🌐</div>
          <p className="text-sm font-semibold mb-1">Convert to Tanglish</p>
          <p className="text-xs text-faint mb-1">
            Gemini 2.5 Flash with 65K output tokens will translate the entire episode in one pass.
          </p>
          <p className="text-xs text-faint mb-5">
            {stage8_data?.scriptBlocks?.length
              ? <span className="text-cyan">{stage8_data.scriptBlocks.length} script blocks</span>
              : "Stage 8 script"}
            {" + "}
            {Array.isArray(stage9_data)
              ? <span className="text-violet-400">{stage9_data.length} reels</span>
              : "Stage 9 reels"}
            {" will be translated."}
          </p>

          {/* Gemini-only badge */}
          <div className="flex justify-center mb-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-[11px] font-semibold text-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
              Gemini 2.5 Flash — required for 65K output
            </span>
          </div>

          <button onClick={handleTranslate}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white transition hover:brightness-110 mx-auto">
            <Languages size={14} /> Translate to Tanglish
          </button>
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Loader2 size={20} className="animate-spin text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Translating to Tanglish…</p>
              <p className="text-xs text-faint mt-0.5">Full episode translation — this may take 30–90 seconds.</p>
            </div>
          </div>
          <div className="space-y-2">
            {LOADING_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.4 }}
                className="flex items-center gap-2 text-[11px] text-faint"
              >
                <div className="h-1 w-1 rounded-full bg-emerald-500 shrink-0" />
                {step}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

            {/* ── Top banner ──────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3">
              <Sparkles size={16} className="text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-300">Translation Complete — Please review Tanglish phrasing before final approval</p>
                <p className="text-[11px] text-amber-400/70 mt-0.5">
                  Read through the Tanglish output and confirm it sounds natural. Fix any stiff phrasing via the chat box before finishing.
                </p>
              </div>
            </div>

            {/* Mode badge */}
            {activeMode && activeMode !== "demo" && (() => {
              const meta = getModelMeta(activeMode);
              return (
                <div className="flex justify-end">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${meta.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                    {meta.version && <span className="font-normal opacity-60 text-[9px]">{meta.version}</span>}
                  </span>
                </div>
              );
            })()}

            {/* Translation notes summary */}
            {result.translation_notes && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <p className="text-xs font-bold text-emerald-300">Translation Summary</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="rounded-lg bg-[rgb(var(--bg-soft))] border border-[rgb(var(--border))] px-3 py-2">
                    <p className="text-faint mb-0.5">Blocks translated</p>
                    <p className="font-bold text-soft">{result.translation_notes.total_blocks_translated ?? "—"}</p>
                  </div>
                  <div className="rounded-lg bg-[rgb(var(--bg-soft))] border border-[rgb(var(--border))] px-3 py-2">
                    <p className="text-faint mb-0.5">Reels translated</p>
                    <p className="font-bold text-soft">{result.translation_notes.total_reels_translated ?? "—"}</p>
                  </div>
                </div>
                {result.translation_notes.tone_summary && (
                  <p className="text-[11px] text-emerald-300/80 italic">{result.translation_notes.tone_summary}</p>
                )}
                {(result.translation_notes.english_terms_preserved?.length ?? 0) > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase text-faint mb-1.5">English terms preserved</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.translation_notes.english_terms_preserved.map((term) => (
                        <span key={term} className="rounded-full border border-cyan/25 bg-cyan/8 px-2 py-0.5 text-[10px] font-mono text-cyan">
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stats row */}
            <div className="flex gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-3 flex-1">
                <Clock size={14} className="text-emerald-400" />
                <span className="text-xs font-semibold">Runtime:</span>
                <span className="text-xs font-bold text-emerald-400">
                  {result.tanglish_script?.totalRuntime ?? "—"}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-violet-500/25 bg-violet-500/5 px-4 py-3 flex-1">
                <Film size={14} className="text-violet-400" />
                <span className="text-xs font-semibold text-violet-300">Reels:</span>
                <span className="text-xs font-bold text-violet-300">
                  {result.tanglish_reels?.length ?? 0}
                </span>
              </div>
            </div>

            {/* ── Tabs ──────────────────────────────────────────────────────── */}
            <div className="flex gap-1 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-1">
              {[
                { id: "script",  label: "Tanglish Script" },
                { id: "runsheet",label: "Run Sheet" },
                { id: "reels",   label: `Tanglish Reels (${result.tanglish_reels?.length ?? 0})` },
              ].map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${tab === t.id ? "bg-[rgb(var(--bg))] text-emerald-400" : "text-faint hover:text-soft"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Script tab ──────────────────────────────────────────────── */}
            {tab === "script" && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 text-[10px] text-faint">
                  {Object.entries(CUE_TAG_COLOR).map(([tag, color]) => (
                    <span key={tag} className="font-bold" style={{ color }}>[{tag}]</span>
                  ))}
                </div>
                {(result.tanglish_script?.scriptBlocks ?? []).map((block, idx) => (
                  <motion.div key={block.id ?? idx}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.025 }}
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
                      <span className="ml-auto text-[10px] font-bold text-emerald-400">தமிழ்-English</span>
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-[rgb(var(--border))]">
                      <div className="p-4">
                        <p className="text-[10px] font-bold uppercase text-emerald-400 mb-2">TANGLISH SCRIPT</p>
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
                {(result.tanglish_script?.scriptBlocks?.length ?? 0) === 0 && (
                  <p className="text-xs text-faint text-center py-8">No script blocks in translation output.</p>
                )}
              </div>
            )}

            {/* ── Run sheet tab ────────────────────────────────────────────── */}
            {tab === "runsheet" && result.tanglish_script?.runSheet && (
              <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5 space-y-4">
                <p className="text-sm font-bold">Tanglish Run Sheet — {result.tanglish_script.totalRuntime}</p>
                <div>
                  <p className="text-[10px] font-bold uppercase text-faint mb-2">Segments</p>
                  {(result.tanglish_script.runSheet.segments ?? []).map((s, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-[rgb(var(--border))] last:border-0">
                      <span className="text-[10px] font-bold text-faint w-4">{i + 1}</span>
                      <span className="text-xs text-soft">{s}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-faint mb-2">Props Required</p>
                  {(result.tanglish_script.runSheet.props ?? []).map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-soft py-1">
                      <span className="text-amber-400">📦</span> {p}
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-emerald-500/8 border border-emerald-500/20 px-3 py-2 text-xs">
                  <span className="font-bold text-emerald-400">Total (incl. transitions): </span>
                  <span className="text-soft">{result.tanglish_script.runSheet.totalRuntime}</span>
                </div>
              </div>
            )}

            {/* ── Reels tab ────────────────────────────────────────────────── */}
            {tab === "reels" && (
              <div className="space-y-3">
                {(result.tanglish_reels ?? []).length === 0 ? (
                  <p className="text-xs text-faint text-center py-8">No reels in translation output.</p>
                ) : (
                  (result.tanglish_reels ?? []).map((reel, i) => (
                    <TanglishReelCard key={reel.id ?? i} reel={reel} index={i} />
                  ))
                )}
              </div>
            )}

            {/* Retranslate link */}
            <button
              onClick={() => { setResult(null); setError(null); setTab("script"); }}
              className="text-[11px] text-faint hover:text-soft transition underline underline-offset-2"
            >
              Retranslate
            </button>

            {/* ── Save state banner (error only) ──────────────────────────── */}
            {saveState === "error" && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/8 px-4 py-3">
                <AlertCircle size={14} className="text-red-400 shrink-0" />
                <p className="text-xs text-red-400">Could not save to Supabase — project still complete locally.</p>
              </div>
            )}

            {/* ── Finish & Save gate ───────────────────────────────────────── */}
            <div className="rounded-xl border border-emerald-500/30 bg-[rgb(var(--bg-soft))] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-emerald-300">Finish & Save Project</p>
                  <p className="text-[11px] text-faint mt-0.5">
                    Saves the complete episode (all 10 stages) to your library. This is the final step.
                  </p>
                </div>
                <button
                  onClick={handleFinish}
                  disabled={saveState === "saving"}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saveState === "saving" ? (
                    <><Loader2 size={14} className="animate-spin" /> Saving…</>
                  ) : (
                    <><PartyPopper size={14} /> Finish &amp; Save Project</>
                  )}
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
