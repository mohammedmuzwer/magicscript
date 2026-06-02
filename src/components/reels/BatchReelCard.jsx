"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Copy, Check, BookmarkPlus, Loader2 } from "lucide-react";
import LocalizeButton from "./LocalizeButton";
import EngagementScore from "./EngagementScore";

// ── Script style config ───────────────────────────────────────────────────────
const STYLES = [
  {
    id:    "cinematic",
    icon:  "🎬",
    label: "Cinematic",
    desc:  "Story-driven · AUDIO / VISUAL beats · Emotional hook",
    color: "#818cf8",
    border: "border-l-violet-500",
    // light: purple pastel | dark: dark panel
    card: "bg-purple-50/50 dark:bg-[rgb(var(--panel))] border border-purple-200 dark:border-[rgb(var(--border))]",
    headerBg: "bg-purple-100/70 dark:bg-violet-500/5",
    headerText: "text-purple-900 dark:text-violet-400",
  },
  {
    id:    "education",
    icon:  "📋",
    label: "Education",
    desc:  "Straight-to-camera · Numbered points · Text overlays",
    color: "#22d3ee",
    border: "border-l-cyan-500",
    card: "bg-teal-50/50 dark:bg-[rgb(var(--panel))] border border-teal-200 dark:border-[rgb(var(--border))]",
    headerBg: "bg-teal-100/70 dark:bg-cyan-500/5",
    headerText: "text-teal-900 dark:text-cyan-400",
  },
  {
    id:    "rebel",
    icon:  "🔥",
    label: "Rebel Reach",
    desc:  "Bold & provocative · Challenges mainstream · Drives comments",
    color: "#f97316",
    border: "border-l-orange-500",
    card: "bg-orange-50/50 dark:bg-[rgb(var(--panel))] border border-orange-200 dark:border-[rgb(var(--border))]",
    headerBg: "bg-orange-100/70 dark:bg-orange-500/5",
    headerText: "text-orange-900 dark:text-orange-400",
  },
];

function extractText(val) {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (val.script)  return val.script;
  if (val.text)    return val.text;
  if (val.content) return val.content;
  if (val.timing || val.beat_name || val.audio || val.visual) {
    const lines = [];
    if (val.timing)    lines.push(`[${val.timing}]`);
    if (val.beat_name) lines.push(val.beat_name.toUpperCase());
    if (val.audio)     lines.push(`AUDIO: "${val.audio}"`);
    if (val.visual)    lines.push(`VISUAL: ${val.visual}`);
    if (val.subtitle)  lines.push(`SUBTITLE: [${val.subtitle}]`);
    return lines.join("\n");
  }
  try { return JSON.stringify(val, null, 2); } catch { return ""; }
}

// ── Single script viewer (inside expanded accordion) ─────────────────────────
function ScriptViewer({ scriptText, styleMeta, contentTypeId, evidenceScore, bucketId, onSave, style }) {
  const [copied,   setCopied]  = useState(false);
  const [saved,    setSaved]   = useState(false);
  const [display,  setDisplay] = useState(scriptText);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-xl border-l-4 ${styleMeta.border} ${styleMeta.card} overflow-hidden shadow-sm dark:shadow-none`}>
      {/* Script header */}
      <div className={`px-4 py-3 ${styleMeta.headerBg} border-b border-[rgb(var(--border))]`}>
        <p className={`text-xs font-bold ${styleMeta.headerText}`}>
          {styleMeta.icon} {styleMeta.label} — {styleMeta.desc}
        </p>
      </div>
      <div className="p-4">
        <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-700 dark:text-soft max-h-[480px] overflow-y-auto">
          {display || "Script not generated yet."}
        </pre>
      </div>

      {/* Engagement score */}
      <div className="border-t border-[rgb(var(--border))] px-4 py-2.5">
        <EngagementScore
          contentTypeId={contentTypeId}
          scriptStyle={style}
          evidenceScore={evidenceScore}
          bucketId={bucketId}
          language="english"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-[rgb(var(--border))] px-4 py-3">
        <LocalizeButton script={scriptText} onLocalized={(loc) => setDisplay(loc ?? scriptText)} />

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-lg border border-[rgb(var(--border))] px-2.5 py-1.5 text-xs font-medium text-soft transition hover:border-cyan/40 hover:text-cyan"
        >
          {copied ? <Check size={12} className="text-cyan" /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>

        <button
          onClick={() => { setSaved(true); onSave?.({ style, script: display }); }}
          disabled={saved}
          className="flex items-center gap-1 rounded-lg border border-[rgb(var(--border))] px-2.5 py-1.5 text-xs font-medium text-soft transition hover:border-cyan/40 hover:text-cyan disabled:opacity-50"
        >
          <BookmarkPlus size={12} className={saved ? "text-cyan" : ""} />
          {saved ? "Saved!" : "Save"}
        </button>

        <button
          onClick={() => {
            const blob = new Blob([display], { type: "text/plain" });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement("a");
            a.href     = url;
            a.download = `magicscript-${style}.txt`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="ml-auto flex items-center gap-1 text-xs text-faint transition hover:text-cyan"
        >
          📤 Export
        </button>
      </div>
    </div>
  );
}

// ── Main accordion card ───────────────────────────────────────────────────────
export default function BatchReelCard({ reel, index, defaultOpen = false, onSave }) {
  const [open,        setOpen]       = useState(defaultOpen);
  const [activeStyle, setActiveStyle] = useState("cinematic");

  // ── Blocked / Error states ───────────────────────────────────────────────
  if (reel.blocked) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
        <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-rose-500/20 text-[10px] font-bold text-rose-400 ring-1 ring-rose-500/30">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-rose-300">{reel.topic}</p>
          <p className="text-[11px] text-rose-400/70">⛔ Evidence score too low — skipped in batch</p>
        </div>
        {reel.medCheck && (
          <span className="shrink-0 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400">
            {reel.medCheck.evidence_score}/100
          </span>
        )}
      </div>
    );
  }

  if (reel.error) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-400 ring-1 ring-amber-500/30">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-amber-300">{reel.topic}</p>
          <p className="text-[11px] text-amber-400/70">⚠️ Generation failed — try regenerating individually</p>
        </div>
      </div>
    );
  }

  if (!reel.scripts) return null;

  const activeMeta = STYLES.find((s) => s.id === activeStyle) ?? STYLES[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="overflow-hidden rounded-xl border border-slate-200 dark:border-[rgb(var(--border))] bg-[rgb(var(--panel))] shadow-sm dark:shadow-none"
    >
      {/* ── Accordion header ─────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[rgb(var(--bg-soft))]"
      >
        {/* Reel number badge */}
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-500/15 text-[11px] font-bold text-violet-400 ring-1 ring-violet-500/30">
          {index + 1}
        </div>

        {/* Topic title */}
        <p className="flex-1 truncate text-sm font-bold text-slate-800 dark:text-soft">{reel.topic}</p>

        {/* Meta badges */}
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-full border border-[rgb(var(--border))] px-2 py-0.5 text-[10px] text-faint sm:inline">
            {reel.contentType}
          </span>
          {reel.medCheck && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              reel.medCheck.evidence_score >= 70
                ? "bg-emerald-500/10 text-emerald-400"
                : reel.medCheck.evidence_score >= 40
                ? "bg-amber-500/10 text-amber-400"
                : "bg-rose-500/10 text-rose-400"
            }`}>
              {reel.medCheck.evidence_score}/100
            </span>
          )}
          {/* 3 style dots — visual cue that 3 scripts are inside */}
          <div className="hidden items-center gap-0.5 sm:flex">
            {STYLES.map((s) => (
              <span key={s.id} className="h-1.5 w-1.5 rounded-full" style={{ background: s.color + "90" }} />
            ))}
          </div>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={15} className="text-faint" />
          </motion.div>
        </div>
      </button>

      {/* ── Accordion body ───────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-[rgb(var(--border))]">

              {/* ── Style tab bar ──────────────────────────────────────── */}
              <div className="flex items-stretch gap-0 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))]">
                {STYLES.map((s) => {
                  const isActive = activeStyle === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveStyle(s.id)}
                      className={`group flex flex-1 flex-col items-center gap-0.5 px-3 py-2.5 text-center transition-all ${
                        isActive
                          ? "bg-[rgb(var(--panel))] border-b-2"
                          : "hover:bg-[rgb(var(--panel))]/40"
                      }`}
                      style={isActive ? { borderBottomColor: s.color } : {}}
                    >
                      <span className="text-base leading-none">{s.icon}</span>
                      <span
                        className="text-[11px] font-bold leading-none"
                        style={isActive ? { color: s.color } : { color: "rgb(var(--text-faint))" }}
                      >
                        {s.label}
                      </span>
                      <span className="hidden text-[9px] leading-tight text-faint sm:block">
                        {s.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ── Script content ────────────────────────────────────── */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStyle}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="p-4"
                >
                  <ScriptViewer
                    style={activeStyle}
                    styleMeta={activeMeta}
                    scriptText={extractText(reel.scripts[activeStyle])}
                    contentTypeId={reel.contentType}
                    evidenceScore={reel.medCheck?.evidence_score ?? 75}
                    bucketId={null}
                    onSave={onSave}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
