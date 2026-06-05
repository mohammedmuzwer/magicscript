"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Copy, Check, BookmarkPlus } from "lucide-react";
import LocalizeButton from "./LocalizeButton";

// ── Evidence score → human label ─────────────────────────────────────────────
function evidenceLabel(score) {
  if (score == null) return null;
  if (score >= 70) return { text: "Strong Evidence",   cls: "bg-emerald-500/10 text-emerald-400" };
  if (score >= 40) return { text: "Moderate Evidence", cls: "bg-amber-500/10 text-amber-400"     };
  if (score >= 10) return { text: "Limited Evidence",  cls: "bg-rose-500/10 text-rose-400"       };
  return               { text: "Weak Evidence",        cls: "bg-rose-500/15 text-rose-500"       };
}

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

// ── Script content (inside expanded accordion) ────────────────────────────────
function ScriptBody({ scriptText, onSave }) {
  const [copied,  setCopied]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [display, setDisplay] = useState(scriptText);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 space-y-3">
      {/* Script text — compact height with scroll */}
      <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-700 dark:text-soft max-h-[260px] overflow-y-auto rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-3">
        {display || "Script not generated yet."}
      </pre>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2">
        <LocalizeButton script={scriptText} onLocalized={(loc) => setDisplay(loc ?? scriptText)} />

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-lg border border-[rgb(var(--border))] px-2.5 py-1.5 text-xs font-medium text-soft transition hover:border-[#2563eb]/40 hover:text-[#2563eb]"
        >
          {copied ? <Check size={12} className="text-[#2563eb]" /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>

        <button
          onClick={() => { setSaved(true); onSave?.({ style: "education", script: display }); }}
          disabled={saved}
          className="flex items-center gap-1 rounded-lg border border-[rgb(var(--border))] px-2.5 py-1.5 text-xs font-medium text-soft transition hover:border-[#2563eb]/40 hover:text-[#2563eb] disabled:opacity-50"
        >
          <BookmarkPlus size={12} className={saved ? "text-[#2563eb]" : ""} />
          {saved ? "Saved!" : "Save"}
        </button>

        <button
          onClick={() => {
            const blob = new Blob([display], { type: "text/plain" });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement("a");
            a.href     = url;
            a.download = "magicscript-education.txt";
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="ml-auto flex items-center gap-1 text-xs text-faint transition hover:text-[#2563eb]"
        >
          📤 Export
        </button>
      </div>
    </div>
  );
}

// ── Main accordion card ───────────────────────────────────────────────────────
export default function BatchReelCard({ reel, index, defaultOpen = false, onSave }) {
  const [open, setOpen] = useState(defaultOpen);

  // ── Blocked state ────────────────────────────────────────────────────────
  if (reel.blocked) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
        <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-rose-500/20 text-[10px] font-bold text-rose-400 ring-1 ring-rose-500/30">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-rose-300">{reel.topic}</p>
          <p className="text-[11px] text-rose-400/70">⛔ Evidence too low — skipped in batch</p>
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
          <p className="text-[11px] text-amber-400/70">⚠️ Generation failed — try regenerating</p>
        </div>
      </div>
    );
  }

  if (!reel.scripts) return null;

  const evScore = reel.medCheck?.evidence_score;
  const evLabel = evidenceLabel(evScore);
  const scriptText = extractText(reel.scripts?.education ?? reel.scripts?.cinematic ?? "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="overflow-hidden rounded-xl border border-slate-200 dark:border-[rgb(var(--border))] bg-[rgb(var(--panel))] shadow-sm dark:shadow-none"
    >
      {/* ── Accordion header ─────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[rgb(var(--bg-soft))]"
      >
        {/* Number badge */}
        <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#2563eb]/15 text-[11px] font-bold text-[#2563eb] ring-1 ring-[#2563eb]/30">
          {index + 1}
        </div>

        {/* Topic */}
        <p className="flex-1 truncate text-sm font-semibold text-slate-800 dark:text-soft">{reel.topic}</p>

        {/* Evidence badge — the score explained */}
        <div className="flex shrink-0 items-center gap-2">
          {evLabel && (
            <span className={`hidden rounded-full px-2 py-0.5 text-[10px] font-bold sm:inline ${evLabel.cls}`}>
              🔬 {evLabel.text}
              {evScore != null && <span className="ml-1 opacity-70">({evScore}/100)</span>}
            </span>
          )}
          <span className="rounded-full border border-[#2563eb]/20 bg-[#2563eb]/8 px-2 py-0.5 text-[10px] font-semibold text-[#2563eb]">
            📋 Education
          </span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} className="text-faint" />
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
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-[rgb(var(--border))]">
              <ScriptBody scriptText={scriptText} onSave={onSave} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
