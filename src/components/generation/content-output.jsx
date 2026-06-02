"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Download, RefreshCw, Bookmark, BookmarkCheck, Lightbulb, X, Timer, Presentation,
} from "lucide-react";
import CopyButton from "./copy-button";
import { DisclaimerStrip } from "./safety-banner";
import { getLanguage } from "@/lib/languages";
import { ENRICH_OPEN, ENRICH_CLOSE, stripEnrichMarkers } from "@/lib/generator";

const DURATIONS = [5, 10, 20];

function scriptText(s) {
  return s.sections.map((x) => `[${x.label}]\n${stripEnrichMarkers(x.text)}`).join("\n\n");
}

// Render a string that may contain [[E]]…[[/E]] enrichment markers, splitting
// it into plain spans + highlighted (amber) spans. Markers are never visible
// to the user — only the highlight style is.
function HighlightedText({ text, className = "" }) {
  if (typeof text !== "string" || !text.includes(ENRICH_OPEN)) {
    return <span className={className}>{text}</span>;
  }
  const parts = [];
  let cursor = 0;
  while (cursor < text.length) {
    const open = text.indexOf(ENRICH_OPEN, cursor);
    if (open === -1) { parts.push({ kind: "plain", text: text.slice(cursor) }); break; }
    if (open > cursor) parts.push({ kind: "plain", text: text.slice(cursor, open) });
    const close = text.indexOf(ENRICH_CLOSE, open + ENRICH_OPEN.length);
    if (close === -1) {
      // Unbalanced — render rest as plain (after stripping the orphan open)
      parts.push({ kind: "plain", text: text.slice(open + ENRICH_OPEN.length) });
      break;
    }
    parts.push({ kind: "enrich", text: text.slice(open + ENRICH_OPEN.length, close) });
    cursor = close + ENRICH_CLOSE.length;
  }
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.kind === "enrich"
          ? (
            <mark
              key={i}
              title="Enrichment lens output"
              className="rounded-sm bg-[rgb(var(--highlight-bg))] px-1 py-0.5 text-[rgb(var(--highlight-text))] ring-1 ring-amber-400/30"
            >
              {p.text}
            </mark>
          )
          : <span key={i}>{p.text}</span>
      )}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────
// `tab` is now controlled externally (from the center panel format bar).
export default function ContentOutput({ content, onRegenerate, onSave, saved, busy, tab = "reel" }) {
  const [duration,     setDuration]     = useState(10);
  const [teleprompter, setTeleprompter] = useState(false);

  // Is the current tab a script format (for Teleprompter button)
  // Written formats and Q&A don't use the teleprompter
  const isScript = ["reel", "youtube", "podcast", "webinar", "stage", "ted"].includes(tab);

  const tabText = useMemo(() => {
    const clean = stripEnrichMarkers;
    switch (tab) {
      case "reel":       return scriptText(content.reelScript);
      case "youtube":    return scriptText(content.youtubeScript);
      case "podcast":    return scriptText(content.podcastScript);
      case "webinar":    return scriptText(content.webinarOutline);
      case "stage":      return scriptText(content.stageTalk[duration]);
      case "ted":        return scriptText(content.tedTalk[duration]);
      case "hooks":      return content.hooks.map((h, i) => `Hook ${i + 1}: ${clean(h)}`).join("\n\n");
      case "carousel":   return content.carousel.slides.map((s) => `Slide ${s.n} — ${clean(s.title)}\n${clean(s.body)}`).join("\n\n");
      case "caption":    return clean(content.caption);
      case "cta":        return clean(content.cta);
      case "thumbnails": return content.thumbnailTitles.map(clean).join("\n");
      case "hashtags":   return content.hashtags.join(" ");
      // ── Written offline formats ──────────────────────────────────────
      case "newsletter":  return content.newsletter  ? scriptText(content.newsletter)  : "";
      case "leadmagnet":  return content.leadMagnet  ? scriptText(content.leadMagnet)  : "";
      case "deepblog":    return content.deepBlog    ? scriptText(content.deepBlog)    : "";
      case "ebook":       return content.ebookChapter? scriptText(content.ebookChapter): "";
      // ── Q&A ─────────────────────────────────────────────────────────
      case "qa": return (content.qa || [])
        .map((pair, i) => `Q${i + 1}: ${pair.q}\n\nA: ${pair.a}`)
        .join("\n\n---\n\n");
      default:           return "";
    }
  }, [tab, duration, content]);

  function currentScript() {
    switch (tab) {
      case "reel":    return content.reelScript;
      case "youtube": return content.youtubeScript;
      case "podcast": return content.podcastScript;
      case "webinar": return content.webinarOutline;
      case "stage":   return content.stageTalk[duration];
      case "ted":     return content.tedTalk[duration];
      default:        return content.reelScript;
    }
  }

  function exportTxt() {
    const lang = getLanguage(content.meta.language).name;
    const header = `Magic Script — ${content.meta.topic}\nLanguage: ${lang} · Format: ${tab}\nVerdict: ${content.meta.verdictWord} · Confidence: ${content.research.confidence}%\n${"=".repeat(48)}\n\n`;
    const blob = new Blob([header + tabText + "\n\n" + content.disclaimer], { type: "text/plain;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `magicscript-${content.meta.topic.replace(/\W+/g, "-").toLowerCase()}-${tab}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]">

      {/* ── Duration selector (stage / ted / workshop only) ──────────── */}
      <AnimatePresence>
        {(tab === "stage" || tab === "ted") && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-[rgb(var(--border))]"
          >
            <div className="flex items-center gap-2 px-4 py-2.5">
              <Timer size={13} className="text-faint" />
              <span className="text-xs font-semibold text-faint">Duration:</span>
              <div className="flex gap-1.5">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                      duration === d
                        ? "bg-cyan/15 text-cyan ring-1 ring-cyan/30"
                        : "text-soft hover:bg-[rgb(var(--bg-soft))]"
                    }`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
              <span className="ml-1 rounded-full bg-[rgb(var(--bg-soft))] px-2 py-0.5 text-[10px] text-faint">
                {tab === "ted" ? "TED-style cues included" : "Stage-ready format"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Action bar ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgb(var(--border))] px-4 py-2.5">
        <span className="text-[11px] text-faint">
          {getLanguage(content.meta.language).flag}{" "}
          {getLanguage(content.meta.language).name} output
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {isScript && (
            <button
              onClick={() => setTeleprompter(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-2.5 py-1.5 text-xs font-semibold text-soft transition hover:border-cyan/45"
            >
              <Presentation size={13} /> Teleprompter
            </button>
          )}
          <CopyButton text={tabText} />
          <button
            onClick={exportTxt}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-2.5 py-1.5 text-xs font-semibold text-soft transition hover:border-cyan/45"
          >
            <Download size={13} /> Export
          </button>
          <button
            onClick={onSave}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
              saved
                ? "border-cyan/45 bg-cyan/10 text-cyan"
                : "border-[rgb(var(--border))] bg-[rgb(var(--panel))] text-soft hover:border-cyan/45"
            }`}
          >
            {saved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
            {saved ? "Saved" : "Save"}
          </button>
          <button
            onClick={onRegenerate}
            disabled={busy}
            className="btn btn-primary px-2.5 py-1.5 text-xs disabled:opacity-60"
          >
            <RefreshCw size={13} className={busy ? "animate-spin" : ""} /> Regenerate
          </button>
        </div>
      </div>

      {/* ── Content area ─────────────────────────────────────────────────── */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab + (["stage","ted"].includes(tab) ? `-${duration}` : "")}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "reel"       && <Script script={content.reelScript} />}
            {tab === "youtube"    && <Script script={content.youtubeScript} />}
            {tab === "podcast"    && <Script script={content.podcastScript} />}
            {tab === "webinar"    && <Script script={content.webinarOutline} />}
            {tab === "stage"      && <Script script={content.stageTalk[duration]} isTed={false} />}
            {tab === "ted"        && <Script script={content.tedTalk[duration]} isTed />}
            {tab === "hooks"      && <Hooks hooks={content.hooks} />}
            {tab === "carousel"   && <Carousel carousel={content.carousel} />}
            {tab === "caption"    && <Plain text={content.caption} />}
            {tab === "cta"        && <Plain text={content.cta} />}
            {tab === "thumbnails" && <ThumbList items={content.thumbnailTitles} />}
            {tab === "hashtags"   && <Hashtags tags={content.hashtags} />}
            {/* ── Q&A tab ─────────────────────────────────────────────── */}
            {tab === "qa"         && <QAGrid pairs={content.qa || []} />}
            {/* ── Written offline formats ─────────────────────────────── */}
            {tab === "newsletter" && content.newsletter   && <WrittenFormat script={content.newsletter}   />}
            {tab === "leadmagnet" && content.leadMagnet   && <WrittenFormat script={content.leadMagnet}   />}
            {tab === "deepblog"   && content.deepBlog     && <WrittenFormat script={content.deepBlog}     />}
            {tab === "ebook"      && content.ebookChapter && <WrittenFormat script={content.ebookChapter} isLong />}
          </motion.div>
        </AnimatePresence>

        {content.proTip && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-electric/25 bg-electric/6 p-2.5">
            <Lightbulb size={14} className="mt-0.5 shrink-0 text-cyan" />
            <p className="text-[11px] leading-relaxed text-soft">
              <span className="font-semibold text-cyan">Creator pro-tip · </span>
              {content.proTip}
            </p>
          </div>
        )}
        <div className="mt-3">
          <DisclaimerStrip text={content.disclaimer} />
        </div>
      </div>

      {teleprompter && (
        <Teleprompter
          title={content.meta.topic}
          script={currentScript()}
          onClose={() => setTeleprompter(false)}
        />
      )}
    </div>
  );
}

// ── Script view (used for all script-based formats) ───────────────────────
function Script({ script, isTed }) {
  const tedSectionColor = (label) =>
    label.includes("CLOSE") || label.includes("HOOK") ? "text-purple-400" : "text-cyan";

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-xs text-faint">
        <span className="chip px-2 py-0.5 text-cyan">⏱ {script.duration}</span>
        <span className="chip px-2 py-0.5 text-soft">{script.format}</span>
        {isTed && (
          <span className="chip px-2 py-0.5 text-purple-400">🎤 TED cues</span>
        )}
      </div>
      <div className="space-y-2">
        {script.sections.map((s, i) => (
          <div
            key={i}
            className={`group rounded-xl border bg-[rgb(var(--bg-soft))] p-3.5 ${
              isTed ? "border-purple-500/20" : "border-[rgb(var(--border))]"
            }`}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-[0.14em] ${isTed ? tedSectionColor(s.label) : "text-strong"}`}>
                {s.label}
              </span>
              <CopyButton text={stripEnrichMarkers(s.text)} compact />
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed">
              <HighlightedText text={s.text} />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Hooks view ─────────────────────────────────────────────────────────────
function Hooks({ hooks }) {
  return (
    <div className="space-y-2.5">
      {hooks.map((h, i) => (
        <div
          key={i}
          className="group flex items-start gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-3.5"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-cyan to-electric font-display text-xs font-bold text-navy-900">
            {i + 1}
          </span>
          <p className="flex-1 text-sm leading-relaxed">
            <HighlightedText text={h} />
          </p>
          <CopyButton text={stripEnrichMarkers(h)} compact />
        </div>
      ))}
    </div>
  );
}

// ── Carousel view ──────────────────────────────────────────────────────────
function Carousel({ carousel }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {carousel.slides.map((s) => (
        <div
          key={s.n}
          className="relative flex aspect-[4/5] flex-col rounded-xl border border-[rgb(var(--border))] bg-gradient-to-br from-[rgb(var(--bg-soft))] to-[rgb(var(--panel))] p-4"
        >
          <div className="flex items-center justify-between">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-cyan/15 font-display text-[11px] font-bold text-cyan">
              {s.n}
            </span>
            <CopyButton text={`${s.title}\n${s.body}`} compact />
          </div>
          <h4 className="mt-3 font-display text-sm font-bold leading-snug">{s.title}</h4>
          <p className="mt-1.5 flex-1 text-xs leading-relaxed text-soft">{s.body}</p>
          <div className="mt-2 h-1 w-10 rounded-full bg-gradient-to-r from-cyan to-electric" />
        </div>
      ))}
    </div>
  );
}

// ── Plain text view ────────────────────────────────────────────────────────
function Plain({ text }) {
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-4">
      <p className="whitespace-pre-line text-sm leading-relaxed">
        <HighlightedText text={text} />
      </p>
    </div>
  );
}

// ── Thumbnail list ─────────────────────────────────────────────────────────
function ThumbList({ items }) {
  return (
    <div className="space-y-2">
      {items.map((t, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-3"
        >
          <span className="text-xs font-bold text-faint">{i + 1}</span>
          <p className="flex-1 font-display text-sm font-bold uppercase tracking-tight">{t}</p>
          <CopyButton text={t} compact />
        </div>
      ))}
    </div>
  );
}

// ── Hashtags ───────────────────────────────────────────────────────────────
function Hashtags({ tags }) {
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-4">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span
            key={t}
            className="rounded-lg border border-cyan/25 bg-cyan/8 px-2.5 py-1 text-xs font-semibold text-cyan"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-3 flex justify-end">
        <CopyButton text={tags.join(" ")} label="Copy all" />
      </div>
    </div>
  );
}

// ── Q&A Grid (10 fact-checked pairs) ─────────────────────────────────────
// Orange Q badge · Green A badge · scrollable container
function QAGrid({ pairs }) {
  if (!pairs || pairs.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-faint">
        Q&amp;A data not available for this topic yet.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-0.5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#007AFF]">
            Fact-Checked Asset
          </span>
          <h3 className="mt-0.5 font-display text-sm font-bold">
            Community &amp; Algorithmic Q&amp;A Database
          </h3>
        </div>
        <span className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-2.5 py-0.5 text-[10px] font-semibold text-faint">
          {pairs.length} pairs verified
        </span>
      </div>

      {/* Scrollable card stack */}
      <div className="max-h-[560px] space-y-2 overflow-y-auto pr-0.5 scrollbar-thin">
        {pairs.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-3.5"
          >
            {/* Question row */}
            <div className="flex items-start gap-2.5">
              <span
                className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold"
                style={{
                  color: "#FF9500",
                  backgroundColor: "rgba(255,149,0,0.10)",
                  border: "1px solid rgba(255,149,0,0.20)",
                }}
              >
                Q
              </span>
              <p className="text-xs font-semibold leading-snug text-[rgb(var(--text))]">
                {item.q}
              </p>
              <CopyButton text={`Q: ${item.q}\n\nA: ${item.a}`} compact />
            </div>

            {/* Answer row */}
            <div className="mt-2.5 flex items-start gap-2.5 border-t border-[rgb(var(--border))] pt-2.5">
              <span
                className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold"
                style={{
                  color: "#34C759",
                  backgroundColor: "rgba(52,199,89,0.10)",
                  border: "1px solid rgba(52,199,89,0.20)",
                }}
              >
                A
              </span>
              <p className="text-xs leading-relaxed text-soft">
                {item.a}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk copy */}
      <div className="flex justify-end pt-1">
        <CopyButton
          text={pairs.map((p, i) => `Q${i + 1}: ${p.q}\n\nA: ${p.a}`).join("\n\n---\n\n")}
          label="Copy all 10 Q&As"
        />
      </div>
    </div>
  );
}

// ── Written offline format renderer ───────────────────────────────────────
// Uses the same Script component but adds a word-count range banner and,
// for long formats, a collapsible section per paragraph.
function WrittenFormat({ script, isLong = false }) {
  return (
    <div className="space-y-2">
      {/* Format banner */}
      <div className="flex items-center gap-2.5 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-3 py-2">
        <span className="text-xs font-bold text-[rgb(var(--text))]">{script.format}</span>
        <span className="ml-auto rounded-full bg-[rgb(var(--panel))] px-2.5 py-0.5 text-[10px] font-semibold text-faint">
          {script.duration}
        </span>
        {isLong && (
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[9px] font-bold text-amber-400">
            LONG FORM
          </span>
        )}
      </div>
      {/* Sections */}
      <div className="space-y-2">
        {script.sections.map((s, i) => (
          <div
            key={i}
            className="group rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-3.5"
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-strong">
                {s.label}
              </span>
              <CopyButton text={s.text} compact />
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-soft">
              {s.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Teleprompter overlay ───────────────────────────────────────────────────
function Teleprompter({ title, script, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-navy-950/95 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <div>
          <span className="font-display text-sm font-bold text-white">
            Teleprompter · {title}
          </span>
          <span className="ml-3 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">
            {script.format} · {script.duration}
          </span>
        </div>
        <button
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-white/70 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-10">
        <div className="mx-auto max-w-2xl space-y-8">
          {script.sections.map((s, i) => (
            <div key={i}>
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-cyan">
                {s.label}
              </div>
              <p className="mt-2 whitespace-pre-line text-2xl font-medium leading-relaxed text-white sm:text-3xl">
                {stripEnrichMarkers(s.text)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
