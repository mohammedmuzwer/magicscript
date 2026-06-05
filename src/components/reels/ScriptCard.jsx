"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, BookmarkPlus, Check } from "lucide-react";
import LocalizeButton from "./LocalizeButton";
import EngagementScore from "./EngagementScore";

const STYLE_META = {
  cinematic: {
    badge: "🎬 Cinematic Story Script",
    tone: "Emotionally Driven",
    format: "Director's View",
    border: "border-l-violet-500",
    // light: purple-50 tint card + purple-200 border | dark: panel bg + dark border
    card: "bg-purple-50/50 dark:bg-[rgb(var(--panel))] border border-purple-200 dark:border-[rgb(var(--border))]",
    // light: saturated purple header strip | dark: very faint violet tint
    accentBg: "bg-purple-100/70 dark:bg-violet-500/5",
    // light: deep purple text | dark: bright violet
    headerColor: "text-purple-900 dark:text-violet-400",
    // light: muted purple subtext | dark: faint
    subtextColor: "text-purple-600/80 dark:text-faint",
  },
  education: {
    badge: "📋 Punchy Education Script",
    tone: "Confident & Authoritative",
    format: "Single-Column Punchy",
    border: "border-l-[#2563eb]",
    card: "bg-blue-50/50 dark:bg-[rgb(var(--panel))] border border-[#2563eb]/20 dark:border-[rgb(var(--border))]",
    accentBg: "bg-blue-100/70 dark:bg-[#2563eb]/5",
    headerColor: "text-[#2563eb] dark:text-[#60a5fa]",
    subtextColor: "text-[#2563eb] dark:text-faint",
  },
  rebel: {
    badge: "🔥 Rebel Reach Script",
    tone: "Bold & Provocative",
    format: "Conversational Challenge",
    border: "border-l-orange-500",
    card: "bg-orange-50/50 dark:bg-[rgb(var(--panel))] border border-orange-200 dark:border-[rgb(var(--border))]",
    accentBg: "bg-orange-100/70 dark:bg-orange-500/5",
    headerColor: "text-orange-900 dark:text-orange-400",
    subtextColor: "text-orange-600/80 dark:text-faint",
  },
};

export default function ScriptCard({
  style,
  scriptText,
  delay = 0,
  contentTypeId,
  evidenceScore,
  bucketId,
  language,
  onSave,
}) {
  const [copied, setCopied]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [displayText, setDisplay] = useState(scriptText);

  const meta = STYLE_META[style] ?? STYLE_META.education;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    setSaved(true);
    onSave?.({ style, script: displayText });
  };

  const handleLocalized = (localized) => {
    if (localized) setDisplay(localized);
    else setDisplay(scriptText);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`flex flex-col rounded-xl border-l-4 ${meta.border} ${meta.card} overflow-hidden shadow-sm dark:shadow-none`}
    >
      {/* Header */}
      <div className={`px-4 py-3 ${meta.accentBg} border-b border-[rgb(var(--border))]`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-bold ${meta.headerColor}`}>{meta.badge}</span>
        </div>
        <p className={`mt-0.5 text-[11px] ${meta.subtextColor}`}>
          Tone: {meta.tone} · Format: {meta.format}
        </p>
      </div>

      {/* Script body — compact fixed height */}
      <div className="p-4">
        <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-700 dark:text-soft max-h-[280px] overflow-y-auto">
          {displayText}
        </pre>
      </div>

      {/* Engagement score */}
      <div className="border-t border-[rgb(var(--border))] px-4 py-2.5">
        <EngagementScore
          contentTypeId={contentTypeId}
          scriptStyle={style}
          evidenceScore={evidenceScore}
          bucketId={bucketId}
          language={language}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-[rgb(var(--border))] px-4 py-3">
        <LocalizeButton script={scriptText} onLocalized={handleLocalized} />

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-lg border border-[rgb(var(--border))] px-2.5 py-1.5 text-xs font-medium text-soft transition hover:border-[#2563eb]/40 hover:text-[#2563eb]"
        >
          {copied ? <Check size={12} className="text-[#2563eb]" /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>

        <button
          onClick={handleSave}
          disabled={saved}
          className="flex items-center gap-1 rounded-lg border border-[rgb(var(--border))] px-2.5 py-1.5 text-xs font-medium text-soft transition hover:border-[#2563eb]/40 hover:text-[#2563eb] disabled:opacity-50"
        >
          <BookmarkPlus size={12} className={saved ? "text-[#2563eb]" : ""} />
          {saved ? "Saved!" : "Save"}
        </button>

        <button
          onClick={() => {
            const blob = new Blob([displayText], { type: "text/plain" });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement("a");
            a.href     = url;
            a.download = `magicscript-reel-${style}.txt`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="ml-auto flex items-center gap-1 text-xs text-faint transition hover:text-[#2563eb]"
        >
          📤 Export
        </button>
      </div>
    </motion.div>
  );
}
