"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, ArrowRight, Check, RotateCcw, ShoppingCart, X,
  Star, ChevronDown, ChevronUp,
} from "lucide-react";
import { generateMockStage2Topics } from "@/lib/reels/mockStage2Topics";

// ── All valid category ids ────────────────────────────────────────────────────
const ALL_CATEGORIES = ["myth", "problem", "faq", "contrarian", "clinical"];

// ── Category order used by the diversity algorithm ───────────────────────────
const CAT_ORDER = ["myth", "problem", "faq", "contrarian", "clinical"];

// ── Flatten all topics from the topicsData object, tagging _cat / _sub ────────
function flattenTopics(topicsData) {
  if (!topicsData) return [];
  return [
    ...(topicsData.myth?.false_myth ?? []).map(t => ({ ...t, _cat: "myth", _sub: "false_myth" })),
    ...(topicsData.myth?.true_myth  ?? []).map(t => ({ ...t, _cat: "myth", _sub: "true_myth"  })),
    ...(topicsData.problem    ?? []).map(t => ({ ...t, _cat: "problem"    })),
    ...(topicsData.faq        ?? []).map(t => ({ ...t, _cat: "faq"        })),
    ...(topicsData.contrarian ?? []).map(t => ({ ...t, _cat: "contrarian" })),
    ...(topicsData.clinical   ?? []).map(t => ({ ...t, _cat: "clinical"   })),
  ];
}

// ── Smart Batch algorithm — diverse top-N across all 5 categories ─────────────
// Strategy: round-robin across categories, picking best-available per round.
//   Round 0 → #1 from each cat (sorted by score within round) → up to 5 topics
//   Round 1 → #2 from each cat (sorted by score within round) → up to 5 more
//   …continues until batchSize reached or all topics exhausted.
// This means batchSize=3 gets the 3 highest-scoring category-winners (e.g. Myth+Clinical+Contrarian),
// batchSize=5 gets one from every category, batchSize=10 gets 2 per category.
// Topics that already failed PubMed (score=0, verified) should never enter Smart Batch
function isEvidenceSafe(t) {
  if (!t.pubmed_verified) return true; // unverified = give benefit of doubt
  return (t.pubmed_evidence_score ?? 100) >= 40; // verified but weak = exclude
}

function buildSmartBatch(topicsData, batchSize) {
  if (!topicsData || batchSize < 1) return [];

  // Group by category, sorted best-score first — exclude confirmed weak-evidence topics
  const byCat = {};
  CAT_ORDER.forEach(cat => {
    if (cat === "myth") {
      byCat[cat] = [
        ...(topicsData.myth?.false_myth ?? []).map(t => ({ ...t, _cat: "myth", _sub: "false_myth" })),
        ...(topicsData.myth?.true_myth  ?? []).map(t => ({ ...t, _cat: "myth", _sub: "true_myth"  })),
      ].filter(isEvidenceSafe).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    } else {
      byCat[cat] = (topicsData[cat] ?? [])
        .map(t => ({ ...t, _cat: cat }))
        .filter(isEvidenceSafe)
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    }
  });

  const picked = [];
  let round = 0;

  while (picked.length < batchSize) {
    // Collect the next-available topic from every category, sort by score within this round
    const roundCandidates = CAT_ORDER
      .map(cat => byCat[cat][round])
      .filter(Boolean)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    if (!roundCandidates.length) break; // all categories exhausted

    for (const t of roundCandidates) {
      if (picked.length >= batchSize) break;
      picked.push(t);
    }
    round++;
  }

  return picked;
}

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  {
    id: "myth",        label: "Myth",              icon: "⚡", color: "#f59e0b", hasToggle: true,
    tagline: "Debunks a false belief OR validates an overlooked truth — high alarm, family-share trigger",
  },
  {
    id: "problem",     label: "Problem + Fix",     icon: "🔍", color: "#2563eb", hasToggle: false,
    tagline: "Reveals a hidden health issue your audience has right now — AND shows the actionable fix",
    badge: "Problem + Solution",
  },
  {
    id: "faq",         label: "FAQ",               icon: "❓", color: "#22c55e", hasToggle: false,
    tagline: "Answers the exact question patients type into Google — with doctor authority and nuance",
  },
  {
    id: "contrarian",  label: "Contrarian",        icon: "🎯", color: "#f97316", hasToggle: false,
    tagline: "Challenges mainstream advice boldly — highest comment volume and algorithm push of all formats",
  },
  {
    id: "clinical",    label: "Clinical Deep Dive", icon: "🔬", color: "#8b5cf6", hasToggle: false,
    tagline: "Uses patient data, Indian research, Tamil Nadu specifics — zero competition from non-doctors",
  },
];

// ── Intent-to-Goal mapping (the 4-button filter row) ─────────────────────────
const GOAL_INTENTS = [
  { label: "Max Reach",        icon: "⚡", tab: "myth",       desc: "Myth-bust · alarm · family shares" },
  { label: "Problem Reveal",   icon: "🔍", tab: "problem",    desc: "Hidden danger · urgency · saves"   },
  { label: "Start Debate",     icon: "🎯", tab: "contrarian", desc: "Challenge mainstream · comments"   },
  { label: "Build Authority",  icon: "🔬", tab: "clinical",   desc: "Patient data · zero competition"   },
  { label: "Answer Patients",  icon: "❓", tab: "faq",        desc: "Google-aligned · discovery reach"  },
];

// How many topics to show collapsed per tab before "Show more"
const COLLAPSE_COUNT = 3;

// ── Score band ────────────────────────────────────────────────────────────────
function scoreBand(s) {
  if (s >= 70) return { label: "APPROVED", text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-300 dark:border-emerald-500/25" };
  if (s >= 50) return { label: "REFRAME",  text: "text-amber-700 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-500/10",     border: "border-amber-300 dark:border-amber-500/25"     };
  return              { label: "REJECTED", text: "text-rose-700 dark:text-rose-400",        bg: "bg-rose-50 dark:bg-rose-500/10",        border: "border-rose-300 dark:border-rose-500/25"        };
}

// ── Evidence label pill ───────────────────────────────────────────────────────
function EvidencePill({ label, score }) {
  if (!label && score == null) return null;
  const display = label ?? (score >= 70 ? "Strong Evidence" : score >= 40 ? "Moderate Evidence" : "Limited Evidence");
  const color   = score >= 70 ? { bg: "#22c55e22", text: "#16a34a" }
                : score >= 40 ? { bg: "#f59e0b22", text: "#b45309" }
                              : { bg: "#ef444422", text: "#dc2626" };
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold"
      style={{ background: color.bg, color: color.text }}
      title={`PubMed evidence score: ${score ?? "?"}/100`}
    >
      🔬 {display}
    </span>
  );
}

// ── Criterion pill ────────────────────────────────────────────────────────────
function CritPill({ value, color, label }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-bold tabular-nums"
      style={{ background: color + "28", color }}
      title={label}
    >
      {value}
    </span>
  );
}

// ── "WHY NOW" row (Improvement 2) ─────────────────────────────────────────────
function WhyNowRow({ text }) {
  if (!text) return null;
  return (
    <div style={{ margin: "6px 0", padding: "6px 10px", background: "rgba(37,99,235,0.05)", borderLeft: "2px solid rgba(37,99,235,0.25)", borderRadius: "0 4px 4px 0" }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "#2563eb", margin: 0 }}>WHY NOW</p>
      <p style={{ fontSize: 12, fontStyle: "italic", color: "rgb(var(--text-faint))", margin: "2px 0 0" }}>{text}</p>
    </div>
  );
}

// ── Refresh toast (Improvement 3) ─────────────────────────────────────────────
function RefreshToast({ message }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
      className="fixed bottom-4 right-4 z-[80] rounded-lg bg-[rgb(var(--panel))] px-3.5 py-2 text-[12px] font-semibold text-[rgb(var(--text))] shadow-lg"
      style={{ border: "0.5px solid rgb(var(--border))" }}
    >
      ✓ {message}
    </motion.div>
  );
}

// ── Topic row ─────────────────────────────────────────────────────────────────
function TopicRow({ topic, index, isSelected, isDisabled, onSelect, color, critColors }) {
  const band           = scoreBand(topic.score);
  const competitionGap = topic.competition_gap ?? 75;

  // Warn if PubMed already confirmed weak/no evidence — will likely fail Stage 3
  const weakEvidence = topic.pubmed_verified && (topic.pubmed_evidence_score ?? 100) < 40;
  // Creator already covered a similar angle (Improvement 4) — still selectable
  const isUsed = topic.is_used_topic === true;

  const baseStyle =
    weakEvidence ? { borderColor: "#ef444430", background: "#ef444408" } :
    isSelected   ? { borderColor: color + "55", background: color + "0e" }
                 : { borderColor: "rgb(var(--border))" };

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      whileHover={!isDisabled && !weakEvidence ? { y: -1, transition: { duration: 0.12 } } : {}}
      onClick={() => !isDisabled && !weakEvidence && onSelect(topic)}
      className={`group flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
        weakEvidence ? "opacity-50 cursor-not-allowed" :
        isDisabled && !isSelected ? "opacity-35 cursor-not-allowed" : "cursor-pointer"
      }`}
      style={{ ...baseStyle, ...(isUsed && !isSelected && !weakEvidence ? { opacity: 0.65 } : {}) }}
      title={weakEvidence ? "Weak PubMed evidence — will likely fail medical verification in Stage 3"
            : isUsed ? "You've covered a similar angle before. Consider a fresh perspective." : undefined}
    >
      {/* Checkbox */}
      <div
        className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded border-2 transition-all duration-200"
        style={isSelected
          ? { borderColor: color, background: color }
          : { borderColor: "rgb(var(--border))" }
        }
      >
        {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
      </div>

      {/* Number */}
      <span className="mt-0.5 w-5 shrink-0 text-[11px] font-bold tabular-nums text-faint">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Title + description + pills */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-snug transition-colors" style={isSelected ? { color } : {}}>
          {topic.title}
        </p>
        {topic.description && (
          <p className="mt-0.5 text-[11px] leading-snug text-faint">{topic.description}</p>
        )}
        {weakEvidence && (
          <p className="mt-1 text-[10px] font-bold text-rose-400">
            ⚠️ Weak PubMed evidence — skip this topic to avoid Stage 3 removal
          </p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          {isUsed && (
            <span
              className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold"
              style={{ color: "rgb(var(--text-faint))", background: "rgb(var(--bg-soft))", border: "0.5px solid rgb(var(--border))" }}
              title="You've covered a similar angle before. Consider a fresh perspective."
            >
              Already made
            </span>
          )}
          <CritPill value={topic.demand}     color={critColors.demand} label="Demand (PubMed-adjusted)" />
          <CritPill value={topic.social}     color={critColors.social} label="Social Demand"   />
          <CritPill value={competitionGap}   color={critColors.gap}    label="Competition Gap" />
          <CritPill value={topic.fit}        color={critColors.fit}    label="DF Fit"          />
          <EvidencePill label={topic.pubmed_evidence_label} score={topic.pubmed_evidence_score} />
          {/* Anchor badge */}
          {topic.anchor_type && (
            <span
              className="inline-flex items-center rounded px-1 py-0.5 text-[9px] font-bold tracking-wide"
              style={{
                background:
                  topic.anchor_type === "A" ? critColors.demand + "30" :
                  topic.anchor_type === "B" ? critColors.gap    + "30" :
                                              critColors.social + "30",
                color:
                  topic.anchor_type === "A" ? critColors.demand :
                  topic.anchor_type === "B" ? critColors.gap    :
                                              critColors.social,
              }}
              title={topic.anchor_note ?? `Anchor ${topic.anchor_type}`}
            >
              {topic.anchor_type === "A" ? "⚓ A · Direct" :
               topic.anchor_type === "B" ? "↳ B · Derivative" :
                                           "🕌 C · Cultural"}
            </span>
          )}
        </div>
        {topic.why_now && (
          <div className="mt-1 hidden rounded-md group-hover:block" style={{ background: "rgb(var(--bg-soft))", padding: "4px 8px" }}>
            <p style={{ fontSize: 12, color: "rgb(var(--text-faint))", margin: 0 }}>{topic.why_now}</p>
          </div>
        )}
      </div>

      {/* Score + badge */}
      <div className="ml-2 flex shrink-0 flex-col items-end gap-1">
        <span
          className="text-base font-bold tabular-nums leading-none transition-colors"
          style={isSelected ? { color } : { color: "rgb(var(--text-soft))" }}
        >
          {topic.score}
        </span>
        <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${band.bg} ${band.text} ${band.border}`}>
          {band.label}
        </span>
      </div>
    </motion.button>
  );
}

// ── Doctor's Pick card (single reel — batchSize=1) ───────────────────────────
function DoctorsPick({ pick, tabConfig, onSelect, isSelected, critColors, nextBest, onNextBest, totalTopicsCount = 25 }) {
  if (!pick) return null;
  const band           = scoreBand(pick.score);
  const competitionGap = pick.competition_gap ?? 75;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="rounded-xl border-2 p-4 space-y-3"
      style={{ borderColor: "#f59e0b60", background: "linear-gradient(135deg, #f59e0b0a 0%, #f9731608 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20">
            <Star size={14} className="text-amber-400 fill-amber-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Doctor's Pick</p>
            <p className="text-[10px] text-faint">Highest score across all {totalTopicsCount} topics</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-black tabular-nums leading-none text-amber-400">{pick.score}</p>
          <span className={`mt-0.5 inline-block rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${band.bg} ${band.text} ${band.border}`}>
            {band.label}
          </span>
        </div>
      </div>

      {/* Category + anchor */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ background: (tabConfig?.color ?? "#f59e0b") + "20", color: tabConfig?.color ?? "#f59e0b" }}
        >
          {tabConfig?.icon} {tabConfig?.label}
        </span>
        {pick.anchor_type && (
          <span className="text-[10px] text-faint">
            {pick.anchor_type === "A" ? "⚓ Direct keyword" :
             pick.anchor_type === "B" ? "↳ Derivative topic" : "🕌 Cultural intersection"}
          </span>
        )}
      </div>

      {/* Title + description */}
      <p className="text-[13px] font-bold leading-snug text-[rgb(var(--text))]">{pick.title}</p>
      {pick.description && (
        <p className="text-[11px] text-faint leading-relaxed">{pick.description}</p>
      )}

      {/* Why now (Improvement 2) */}
      <WhyNowRow text={pick.why_now} />

      {/* Already-made warning + Next Best Pick (Improvement 4) */}
      {pick.is_used_topic && (
        <div className="rounded-lg" style={{ background: "rgb(var(--bg-soft))", padding: "8px 10px" }}>
          <p className="text-[11px] font-semibold" style={{ color: "rgb(var(--text-faint))" }}>
            You've covered a similar topic before — consider the next best pick
          </p>
          {nextBest && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onNextBest?.(); }}
              className="mt-1.5 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold text-white transition hover:brightness-110"
              style={{ background: "#2563eb" }}
            >
              Next Best Pick →
            </button>
          )}
        </div>
      )}

      {/* Criteria + evidence */}
      <div className="flex flex-wrap items-center gap-1.5">
        <CritPill value={pick.demand}    color={critColors.demand} label="Demand"          />
        <CritPill value={pick.social}    color={critColors.social} label="Social Demand"   />
        <CritPill value={competitionGap} color={critColors.gap}    label="Competition Gap" />
        <CritPill value={pick.fit}       color={critColors.fit}    label="DF Fit"          />
        <EvidencePill label={pick.pubmed_evidence_label} score={pick.pubmed_evidence_score} />
      </div>

      {/* CTA */}
      <motion.button
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
        onClick={() => onSelect(pick)}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition"
        style={{
          background: isSelected ? "linear-gradient(90deg,#22c55e,#16a34a)" : "linear-gradient(90deg,#f59e0b,#f97316)",
          color: "#0a101e",
        }}
      >
        {isSelected
          ? <><Check size={14} strokeWidth={3} /> Selected — Send to Stage 3</>
          : <><Star size={13} className="fill-current" /> Use Doctor's Pick</>
        }
        <ArrowRight size={14} />
      </motion.button>
    </motion.div>
  );
}

// ── Smart Batch banner (batchSize > 1) ────────────────────────────────────────
// Shows the best N topics with category diversity — one from each content type,
// best-in-category-first, so a 3x batch gets 3 different content angles.
function SmartBatch({ picks, batchSize, selectedItems, onSelectBatch, critColors, isDemo = false }) {
  if (!picks?.length) return null;

  const allSelected = picks.every(p => selectedItems.some(s => s.title === p.title));
  const someSelected = picks.some(p => selectedItems.some(s => s.title === p.title));

  // Per-pick selected state
  const isPickSelected = (pick) => selectedItems.some(s => s.title === pick.title);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="rounded-xl border-2 p-4 space-y-3"
      style={{ borderColor: "#818cf860", background: "linear-gradient(135deg, #818cf80a 0%, #38bdf808 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20">
            <Star size={14} className="text-violet-400 fill-violet-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
              Smart Batch — {batchSize} Reels
            </p>
            <p className="text-[10px] text-faint">
              {isDemo
                ? "Best topic per content angle · maximum variety · sample data (unverified)"
                : "Best topic per content angle · maximum variety · PubMed-verified"}
            </p>
          </div>
        </div>
        {/* Average score badge */}
        <div className="text-right shrink-0">
          <p className="text-[10px] text-faint">avg score</p>
          <p className="text-xl font-black tabular-nums leading-none text-violet-400">
            {Math.round(picks.reduce((s, p) => s + (p.score ?? 0), 0) / picks.length)}
          </p>
        </div>
      </div>

      {/* Diversity chips — one per category in the batch */}
      <div className="flex flex-wrap gap-1.5">
        {picks.map((p, i) => {
          const tabCfg = TABS.find(t => t.id === p._cat);
          return (
            <span
              key={i}
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ background: (tabCfg?.color ?? "#888") + "20", color: tabCfg?.color ?? "#888" }}
            >
              {tabCfg?.icon} {tabCfg?.label}
            </span>
          );
        })}
        <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-400">
          {picks.length} unique angles
        </span>
      </div>

      {/* Topic rows — compact */}
      <div className="space-y-1.5">
        {picks.map((p, i) => {
          const tabCfg   = TABS.find(t => t.id === p._cat);
          const band     = scoreBand(p.score);
          const selected = isPickSelected(p);
          return (
            <motion.button
              key={i}
              whileHover={{ x: 2 }}
              onClick={() => onSelectBatch([p])} // toggle individual pick
              className="group flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-all"
              style={selected
                ? { borderColor: (tabCfg?.color ?? "#818cf8") + "50", background: (tabCfg?.color ?? "#818cf8") + "0d" }
                : { borderColor: "rgb(var(--border))" }
              }
            >
              {/* Selected indicator */}
              <div
                className="grid h-4 w-4 shrink-0 place-items-center rounded border-2 transition-all"
                style={selected
                  ? { borderColor: tabCfg?.color ?? "#818cf8", background: tabCfg?.color ?? "#818cf8" }
                  : { borderColor: "rgb(var(--border))" }
                }
              >
                {selected && <Check size={9} className="text-white" strokeWidth={3} />}
              </div>

              {/* Category chip */}
              <span
                className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold"
                style={{ background: (tabCfg?.color ?? "#888") + "20", color: tabCfg?.color ?? "#888" }}
              >
                {tabCfg?.icon} {tabCfg?.label}
              </span>

              {/* Title */}
              <p className="flex-1 truncate text-[11px] font-semibold text-soft group-hover:text-[rgb(var(--text))] transition">
                {p.title}
              </p>

              {/* Score + evidence */}
              <div className="flex shrink-0 items-center gap-1.5">
                <EvidencePill label={p.pubmed_evidence_label} score={p.pubmed_evidence_score} />
                <span className="text-sm font-black tabular-nums" style={{ color: tabCfg?.color ?? "#818cf8" }}>
                  {p.score}
                </span>
                <span className={`rounded border px-1 py-0.5 text-[8px] font-bold uppercase ${band.bg} ${band.text} ${band.border}`}>
                  {band.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* CTA row */}
      <div className="flex gap-2">
        {/* Select All / Deselect All */}
        <motion.button
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          onClick={() => onSelectBatch(allSelected ? [] : picks)} // pass empty to deselect all
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition"
          style={{
            background: allSelected
              ? "linear-gradient(90deg,#22c55e,#16a34a)"
              : "linear-gradient(90deg,#818cf8,#38bdf8)",
            color: "#0a101e",
          }}
        >
          {allSelected
            ? <><Check size={14} strokeWidth={3} /> All {picks.length} Selected</>
            : <><Star size={13} className="fill-current" /> Use Smart Batch ({picks.length})</>
          }
          <ArrowRight size={14} />
        </motion.button>
      </div>

      <p className="text-[10px] text-faint text-center">
        Click a row to toggle individual topics · or use the tabs below to manually swap any angle
      </p>
    </motion.div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function TabSkeleton() {
  return (
    <div className="space-y-2 py-1">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-[68px] animate-pulse rounded-xl bg-[rgb(var(--bg-soft))]"
          style={{ animationDelay: `${i * 0.07}s` }}
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Stage2TopicMatrix({ topic, bucket, batchSize = 1, selectedContentTypes = ["auto"], usedTopics = [], onSendToStage3, onTopicPreview, onBufferPoolReady, demoMode = false, cachedData = null, onDataLoaded, className = "" }) {

  // Derive which categories to show based on Stage 1 selection
  const finalCategories = useMemo(() => {
    if (!selectedContentTypes || selectedContentTypes.includes("auto") || selectedContentTypes.length === 0) {
      return ALL_CATEGORIES;
    }
    const valid = selectedContentTypes.filter(c => ALL_CATEGORIES.includes(c));
    return valid.length > 0 ? valid : ALL_CATEGORIES;
  }, [selectedContentTypes]);

  // Tabs and goal intents filtered to only the selected categories
  const visibleTabs = useMemo(() => TABS.filter(t => finalCategories.includes(t.id)), [finalCategories]);
  const visibleGoalIntents = useMemo(() => GOAL_INTENTS.filter(g => finalCategories.includes(g.tab)), [finalCategories]);

  // Total topics count for display purposes
  const totalTopicsCount = finalCategories.length * 5;

  const [activeTab,      setActiveTab]     = useState(() => finalCategories[0] ?? "myth");
  const [mythType,       setMythType]      = useState("false_myth");
  // Initialise from the parent's cache so navigating back restores topics
  // instantly without a re-fetch (lazy init runs only on mount).
  const [topicsData,     setTopicsData]    = useState(() => cachedData?.topics ?? null);
  const [level1Signals,  setLevel1Signals] = useState(() => cachedData?.level1_signals ?? null);
  // Track whether the displayed topics are real LLM output ("live") or fabricated
  // sample/fallback data ("demo"). Critical for a MEDICAL app — fallback topics
  // must never masquerade as verified.
  const [dataMode,       setDataMode]      = useState(() => cachedData?.mode ?? null);
  const [fallbackReason, setFallbackReason] = useState(() => cachedData?.fallback_reason ?? null);
  const [globalLoading,  setGlobalLoading] = useState(() => !cachedData?.topics);
  const [refreshingTab,  setRefreshingTab] = useState(null);
  const [selectedItems,  setSelectedItems] = useState([]);
  const [isDark,         setIsDark]        = useState(true);
  const [toast,          setToast]         = useState(null);
  const [bufferPool,     setBufferPool]    = useState([]);

  // Latest usedTopics in a ref so fetchTopics stays stable (no dep churn).
  const usedTopicsRef = useRef(usedTopics);
  useEffect(() => { usedTopicsRef.current = usedTopics; }, [usedTopics]);

  // Keep activeTab valid whenever the set of generated categories changes
  useEffect(() => {
    if (finalCategories.length > 0 && !finalCategories.includes(activeTab)) {
      setActiveTab(finalCategories[0]);
    }
  }, [finalCategories]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scrollable inner area — used to scroll back to top after a category refresh.
  const scrollAreaRef = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast((cur) => (cur === msg ? null : cur)), 2000);
  }, []);

  // Per-tab "show all" toggle state — default collapsed to COLLAPSE_COUNT
  const [showAllMap,       setShowAllMap]       = useState({});
  // Angle explorer (goal buttons + tabs + topic list) — collapsed by default
  // User opens it only when they want to manually swap a topic
  const [angleExplorerOpen, setAngleExplorerOpen] = useState(false);
  // Minimum 2-second loading duration for a polished UX
  const [minLoadDone, setMinLoadDone] = useState(false);

  useEffect(() => {
    setMinLoadDone(false);
    const t = setTimeout(() => setMinLoadDone(true), 2000);
    return () => clearTimeout(t);
  }, [topic, bucket]);

  // Track dark/light mode for criterion pill colors
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const critColors = isDark
    ? { demand: "#38bdf8", social: "#a78bfa", gap: "#f59e0b", fit: "#34d399" }
    : { demand: "#0369a1", social: "#6d28d9", gap: "#b45309", fit: "#059669" };

  const batchFull = selectedItems.length >= batchSize;
  const remaining = batchSize - selectedItems.length;

  // ── Build + emit bufferPool whenever topicsData changes ─────────────────
  // bufferPool = all topics flat-sorted by score, used by Stage 3 fail-safe
  useEffect(() => {
    if (!topicsData) return;
    const flat = flattenTopics(topicsData)
      .slice()
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    setBufferPool(flat);
    onBufferPoolReady?.(flat);
  }, [topicsData, onBufferPoolReady]);

  // ── Doctor's Pick (batchSize=1) — single highest-scoring topic ───────────
  // Highest + second-highest across all 25 (for Doctor's Pick + Next Best Pick)
  const sortedAll = useMemo(() => {
    if (!topicsData) return [];
    return flattenTopics(topicsData).slice().sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [topicsData]);

  const doctorsPick  = batchSize === 1 ? (sortedAll[0] ?? null) : null;
  const nextBestPick = batchSize === 1 ? (sortedAll[1] ?? null) : null;

  const doctorsPickTabConfig = doctorsPick
    ? (TABS.find(t => t.id === doctorsPick._cat) ?? TABS[0])
    : null;

  // ── Smart Batch (batchSize>1) — diverse top-N across all categories ────────
  const smartBatchPicks = useMemo(() => {
    if (!topicsData || batchSize <= 1) return null;
    return buildSmartBatch(topicsData, batchSize);
  }, [topicsData, batchSize]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchTopics = useCallback(async (keyword, bucket, category = null, signal = null, level1Cached = null) => {
    const ak = typeof window !== "undefined"
      ? (localStorage.getItem("V_KEY_CLAUDE") || localStorage.getItem("ms_anthropic_key"))
      : null;
    const gk = typeof window !== "undefined"
      ? (localStorage.getItem("V_KEY_GOOGLE") || localStorage.getItem("ms_gemini_key"))
      : null;
    const ok = typeof window !== "undefined" ? localStorage.getItem("ms_openai_key") : null;
    const res = await fetch("/api/reels/stage2-topics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(ak && { "x-client-anthropic-key": ak }),
        ...(gk && { "x-client-gemini-key":    gk }),
        ...(ok && { "x-client-openai-key":    ok }),
      },
      body: JSON.stringify({
        keyword, bucket, category,
        selectedContentTypes: selectedContentTypes ?? ["auto"],
        usedTopics: usedTopicsRef.current ?? [],
        ...(level1Cached ? { level1_signals: level1Cached } : {}),
      }),
      ...(signal && { signal }),
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  }, [selectedContentTypes]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();

    // Frozen-state restore: if the parent already has topics cached for this
    // exact (keyword + content types) selection, reuse them — do NOT refetch.
    // This is what stops Stage 2 from re-loading every time the user navigates
    // back to it from Stage 3/4.
    if (cachedData?.topics) {
      setTopicsData(cachedData.topics);
      setLevel1Signals(cachedData.level1_signals ?? null);
      setDataMode(cachedData.mode ?? null);
      setFallbackReason(cachedData.fallback_reason ?? null);
      setGlobalLoading(false);
      return () => controller.abort();
    }

    setGlobalLoading(true);
    setTopicsData(null);
    setSelectedItems([]);
    setShowAllMap({});
    onTopicPreview?.(null);

    // Reset to first valid tab for the new selection
    setActiveTab(finalCategories[0] ?? "myth");

    (async () => {
      // Demo mode: skip API, use mock data immediately
      if (demoMode) {
        const mock = generateMockStage2Topics(topic, selectedContentTypes);
        setTopicsData(mock);
        setLevel1Signals(null);
        setDataMode("demo");
        setFallbackReason(null);
        setGlobalLoading(false);
        onDataLoaded?.(mock, null, "demo", null); // lift to parent so back-nav is frozen
        return;
      }
      try {
        const data = await fetchTopics(topic, bucket, null, controller.signal);
        if (!controller.signal.aborted) {
          setTopicsData(data.topics);
          setLevel1Signals(data.level1_signals ?? null);
          setDataMode(data.mode ?? "live");
          setFallbackReason(data.fallback_reason ?? null);
          onDataLoaded?.(data.topics, data.level1_signals ?? null, data.mode ?? "live", data.fallback_reason ?? null);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          // Live call failed entirely → we are showing fabricated sample topics.
          const mock = generateMockStage2Topics(topic, selectedContentTypes);
          setTopicsData(mock);
          setLevel1Signals(null);
          setDataMode("demo");
          setFallbackReason("Live generation failed — network or model error");
          onDataLoaded?.(mock, null, "demo", "Live generation failed — network or model error");
        }
      } finally {
        if (!controller.signal.aborted) setGlobalLoading(false);
      }
    })();

    return () => { controller.abort(); };
  }, [topic, bucket, fetchTopics]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Per-tab refresh ───────────────────────────────────────────────────────
  // ── Per-category refresh (Improvement 3) ──────────────────────────────────
  // Regenerates ONLY this category. Spinner shows on this tab; others stay
  // interactive. Sends cached Level 1 signals so the backend skips Level 1.
  const refreshTab = async (tabId) => {
    if (refreshingTab || globalLoading) return;
    const label = TABS.find(t => t.id === tabId)?.label ?? tabId;
    setRefreshingTab(tabId);
    setSelectedItems(prev => prev.filter(s => s.tabId !== tabId));
    setShowAllMap(prev => ({ ...prev, [tabId]: false }));
    if (activeTab === tabId) onTopicPreview?.(null);

    const applySlice = (slice) => {
      if (slice == null) return;
      setTopicsData(prev => {
        const merged = { ...prev, [tabId]: slice }; // replace just this category
        onDataLoaded?.(merged, level1Signals, dataMode, fallbackReason); // keep parent cache in sync
        return merged;
      });
    };

    try {
      if (demoMode) {
        // Demo: regenerate this category locally — instant, no API
        applySlice(generateMockStage2Topics(topic, selectedContentTypes)[tabId]);
      } else {
        // Backend returns { category, topics: <slice> } — partial, fewer tokens
        const data = await fetchTopics(topic, bucket, tabId, null, level1Signals);
        applySlice(data?.topics ?? (tabId === "myth" ? topicsData?.myth : topicsData?.[tabId]));
      }
      showToast(`${label} topics refreshed`);
      scrollAreaRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      applySlice(generateMockStage2Topics(topic, selectedContentTypes)[tabId]);
      showToast(`${label} topics refreshed`);
    } finally {
      setRefreshingTab(null);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeTabCfg  = TABS.find((t) => t.id === activeTab) ?? TABS[0];
  const isTabLoading  = globalLoading || refreshingTab === activeTab;

  // All topics for active tab (already sorted best-first from backend)
  const allCurrentTopics = !topicsData ? [] :
    activeTab === "myth"
      ? (topicsData.myth?.[mythType] ?? [])
      : (topicsData[activeTab] ?? []);

  // Collapsed/expanded slice for current tab
  const collapseKey     = activeTab === "myth" ? `myth_${mythType}` : activeTab;
  const isExpanded      = showAllMap[collapseKey] ?? false;
  const currentTopics   = isExpanded
    ? allCurrentTopics
    : allCurrentTopics.slice(0, COLLAPSE_COUNT);
  const hiddenCount     = allCurrentTopics.length - COLLAPSE_COUNT;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectTopic = (t) => {
    const alreadySelected = selectedItems.some(s => s.title === t.title);
    if (alreadySelected) {
      const updated = selectedItems.filter(s => s.title !== t.title);
      setSelectedItems(updated);
      const last = updated[updated.length - 1];
      if (last) onTopicPreview?.({ topic: last, tabId: last.tabId, tabConfig: TABS.find(tab => tab.id === last.tabId) ?? activeTabCfg, mythType, level1Signals });
      else onTopicPreview?.(null);
    } else if (!batchFull) {
      // For Doctor's Pick, use _cat as tabId
      const tabId = t._cat ?? activeTab;
      const updated = [...selectedItems, { ...t, tabId }];
      setSelectedItems(updated);
      onTopicPreview?.({ topic: t, tabId, tabConfig: TABS.find(tab => tab.id === tabId) ?? activeTabCfg, mythType, level1Signals });
    }
  };

  const handleTabChange = (id) => {
    setActiveTab(id);
    onTopicPreview?.(null);
  };

  const handleGoalIntent = (tab) => {
    setActiveTab(tab);
    onTopicPreview?.(null);
  };

  const handleSend = () => {
    if (selectedItems.length === 0) return;
    // Pass the full topicsData pool as 2nd arg so Stage 3 can auto-replace
    // any topic that fails medical verification with the next-best alternative.
    onSendToStage3?.(selectedItems, topicsData);
  };

  const toggleShowAll = () => {
    setShowAllMap(prev => ({ ...prev, [collapseKey]: !isExpanded }));
  };

  // ── Batch select handler (used by SmartBatch) ──────────────────────────
  // Pass an array of picks to select them all, or [] to deselect all batch picks.
  const handleSelectBatch = (picks) => {
    if (!picks.length) {
      // Deselect all smart batch picks
      const batchTitles = new Set((smartBatchPicks ?? []).map(p => p.title));
      setSelectedItems(prev => prev.filter(s => !batchTitles.has(s.title)));
      onTopicPreview?.(null);
      return;
    }
    // Select one or all picks — merge with existing, respecting batchSize cap
    setSelectedItems(prev => {
      const existing     = prev.filter(s => !picks.some(p => p.title === s.title));
      const toAdd        = picks.filter(p => !prev.some(s => s.title === p.title));
      const merged       = [...existing, ...toAdd.map(p => ({ ...p, tabId: p._cat ?? activeTab }))];
      return merged.slice(0, batchSize); // never exceed batchSize
    });
    // Preview the last pick
    const last    = picks[picks.length - 1];
    const tabId   = last._cat ?? activeTab;
    const tabCfg  = TABS.find(t => t.id === tabId) ?? activeTabCfg;
    onTopicPreview?.({ topic: last, tabId, tabConfig: tabCfg, mythType, level1Signals });
  };

  const isDoctorsPickSelected = doctorsPick
    ? selectedItems.some(s => s.title === doctorsPick.title)
    : false;

  const canSend = selectedItems.length > 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-[rgb(var(--border))] bg-[rgb(var(--panel))] shadow-sm dark:shadow-none ${className}`}>
      {/* Scrollable inner area — CTA stays pinned below */}
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto" style={{ minHeight: 0, scrollbarWidth: "thin", scrollbarColor: "rgba(0,0,0,0.15) transparent" }}>

      {/* ── Global loading banner ─────────────────────────────────────── */}
      <AnimatePresence>
        {(globalLoading || !minLoadDone) && (
          <motion.div
            key="loading-banner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-4 py-8"
          >
            <Loader2 size={22} className="animate-spin text-[#2563eb]" />
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-soft">
                {finalCategories.length === ALL_CATEGORIES.length
                  ? "Generating your 25 topics…"
                  : `Generating ${totalTopicsCount} topic${totalTopicsCount !== 1 ? "s" : ""}…`}
              </p>
              <p className="text-[11px] text-faint">
                {finalCategories.length === ALL_CATEGORIES.length
                  ? "Running Doctor Farmer engine · PubMed validation · Live signals"
                  : visibleTabs.map(t => t.label).join(" · ")}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5 text-[10px] text-faint">
              {["YouTube demand", "Reddit signals", "Google Trends", "PubMed pre-check", "DF scoring"].map(s => (
                <span key={s} className="flex items-center gap-1 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-2 py-0.5">
                  <Loader2 size={8} className="animate-spin" />{s}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MEDICAL SAFETY: unverified sample-data warning ──────────────
          Shows when live generation fell back to fabricated sample topics
          (e.g. API quota / model error). These are NOT real, NOT PubMed-verified,
          and must never be treated as clinically validated. */}
      {!globalLoading && minLoadDone && dataMode === "demo" && !demoMode && (
        <div className="border-b border-amber-400/40 bg-amber-50 dark:bg-amber-500/10 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <span className="text-base leading-none mt-0.5">⚠️</span>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-amber-700 dark:text-amber-300">
                Sample topics — NOT live or medically verified
              </p>
              <p className="text-[11px] text-amber-700/90 dark:text-amber-200/80 mt-0.5 leading-relaxed">
                Live generation didn&apos;t run{fallbackReason ? ` (${fallbackReason})` : ""}, so these are reusable
                placeholder angles — the same set appears for every keyword and the scores/&ldquo;PubMed-verified&rdquo;
                labels are illustrative only. Do not publish from these. Switch the model (Claude/ChatGPT) or retry to get
                real, keyword-specific topics.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Doctor's Pick (1x) / Smart Batch (3x/5x/10x) banner ──────── */}
      <AnimatePresence>
        {!globalLoading && minLoadDone && (doctorsPick || smartBatchPicks) && (
          <motion.div
            key={batchSize === 1 ? "doctors-pick" : "smart-batch"}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-[rgb(var(--border))]"
          >
            <div className="p-3">
              {batchSize === 1 ? (
                <DoctorsPick
                  pick={doctorsPick}
                  tabConfig={doctorsPickTabConfig}
                  onSelect={handleSelectTopic}
                  isSelected={isDoctorsPickSelected}
                  critColors={critColors}
                  nextBest={nextBestPick}
                  onNextBest={() => nextBestPick && handleSelectTopic(nextBestPick)}
                  totalTopicsCount={totalTopicsCount}
                />
              ) : (
                <SmartBatch
                  picks={smartBatchPicks}
                  batchSize={batchSize}
                  selectedItems={selectedItems}
                  onSelectBatch={handleSelectBatch}
                  critColors={critColors}
                  isDemo={dataMode === "demo" && !demoMode}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Angle Explorer toggle button ──────────────────────────────── */}
      <button
        onClick={() => setAngleExplorerOpen(v => !v)}
        className="flex w-full items-center justify-between border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-4 py-2.5 text-left transition hover:bg-[rgb(var(--panel))]"
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-faint">
            {angleExplorerOpen ? "▾" : "▸"} {batchSize > 1 ? "Swap any angle in your batch" : `Browse all ${totalTopicsCount} topics by angle`}
          </span>
          {!angleExplorerOpen && selectedItems.length === 0 && (
            <span className="text-[10px] text-faint opacity-60">— click to explore</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {visibleTabs.map(t => (
            <span key={t.id} className="text-xs opacity-50">{t.icon}</span>
          ))}
        </div>
      </button>

      {/* ── Collapsible: Goal buttons + Tab bar + Topic list ──────────── */}
      <AnimatePresence initial={false}>
        {angleExplorerOpen && (
          <motion.div
            key="angle-explorer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >

      {/* ── Intent-First goal buttons ─────────────────────────────────── */}
      <div className="border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-3 py-2.5">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-faint">
          {batchSize > 1 ? "Swap any angle — or browse tabs to replace a Smart Batch pick:" : "Choose your goal today:"}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {visibleGoalIntents.map((g) => {
            const isActive = activeTab === g.tab;
            const tabCfg   = TABS.find(t => t.id === g.tab);
            return (
              <motion.button
                key={g.tab}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleGoalIntent(g.tab)}
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left transition-all"
                style={isActive
                  ? { borderColor: (tabCfg?.color ?? "#888") + "60", background: (tabCfg?.color ?? "#888") + "15", color: tabCfg?.color ?? "#888" }
                  : { borderColor: "rgb(var(--border))", color: "rgb(var(--text-faint))" }
                }
              >
                <span className="text-sm leading-none">{g.icon}</span>
                <div>
                  <p className="text-[11px] font-bold leading-none">{g.label}</p>
                  <p className="mt-0.5 text-[9px] leading-none opacity-70">{g.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 overflow-x-auto border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-2 py-1.5">
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const tabCount = selectedItems.filter(s => s.tabId === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className="relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
              style={isActive
                ? { background: tab.color + "18", color: tab.color }
                : { color: "rgb(var(--text-faint))" }
              }
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tabCount > 0 && (
                <span
                  className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ background: tab.color }}
                >
                  {tabCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Active tab description bar ──────────────────────────────── */}
      <div
        className="flex items-center gap-2 border-b px-4 py-2"
        style={{ borderColor: activeTabCfg.color + "30", background: activeTabCfg.color + "08" }}
      >
        <span className="text-base leading-none">{activeTabCfg.icon}</span>
        <div className="flex flex-1 flex-wrap items-center gap-2 min-w-0">
          <span className="text-[11px] font-bold" style={{ color: activeTabCfg.color }}>
            {activeTabCfg.label}
          </span>
          {activeTabCfg.badge && (
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
              style={{ background: activeTabCfg.color + "20", color: activeTabCfg.color }}
            >
              {activeTabCfg.badge}
            </span>
          )}
          <span className="text-[11px] text-faint leading-snug">{activeTabCfg.tagline}</span>
        </div>
      </div>

      {/* ── Batch selection banner ───────────────────────────────────── */}
      <AnimatePresence>
        {batchSize > 1 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={`flex items-center justify-between gap-3 border-b border-[rgb(var(--border))] px-4 py-2.5 ${batchFull ? "bg-emerald-500/8" : "bg-[rgb(var(--bg-soft))]"}`}>
              <div className="flex items-center gap-2">
                <ShoppingCart size={13} className={batchFull ? "text-emerald-400" : "text-faint"} />
                {batchFull ? (
                  <span className="text-xs font-bold text-emerald-400">
                    ✓ Batch Limit Reached — {selectedItems.length} topics selected
                  </span>
                ) : (
                  <span className="text-xs text-faint">
                    Select <span className="font-bold text-soft">{remaining}</span> more topic{remaining !== 1 ? "s" : ""}
                    <span className="ml-1 text-faint">({selectedItems.length} / {batchSize})</span>
                  </span>
                )}
              </div>
              {selectedItems.length > 0 && (
                <div className="flex gap-1 overflow-x-auto">
                  {selectedItems.map((s, i) => {
                    const tabCfg = TABS.find(t => t.id === s.tabId);
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedItems(prev => prev.filter(x => x.title !== s.title))}
                        className="flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold transition hover:opacity-70"
                        style={{ borderColor: (tabCfg?.color ?? "#888") + "50", color: tabCfg?.color ?? "#888", background: (tabCfg?.color ?? "#888") + "10" }}
                        title={`Remove: ${s.title}`}
                      >
                        <span>{tabCfg?.icon}</span>
                        <span className="max-w-[80px] truncate">{s.title.split(" ").slice(0, 3).join(" ")}…</span>
                        <X size={8} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tab content header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-4 py-2">
        <span className="text-[11px] text-faint">
          {activeTab === "myth" ? (
            <>{mythType === "false_myth" ? "3 False Myths" : "2 True Myths"}</>
          ) : (
            <>top {Math.min(COLLAPSE_COUNT, allCurrentTopics.length)} of {allCurrentTopics.length}</>
          )}
        </span>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => refreshTab(activeTab)}
          disabled={globalLoading || !!refreshingTab}
          className="flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] px-2.5 py-1.5 text-[11px] font-semibold text-faint transition hover:text-soft hover:border-[#2563eb]/30 disabled:opacity-40 disabled:cursor-not-allowed"
          style={refreshingTab === activeTab ? { color: activeTabCfg.color, borderColor: activeTabCfg.color + "50" } : {}}
        >
          {refreshingTab === activeTab ? (
            <><Loader2 size={11} className="animate-spin" /><span>Refreshing…</span></>
          ) : (
            <><RotateCcw size={11} /><span>Refresh {activeTabCfg.label}</span></>
          )}
        </motion.button>
      </div>

      {/* ── Myth type toggle ─────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {activeTab === "myth" && (
          <motion.div
            key="myth-toggle"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-3 border-b border-[rgb(var(--border))] px-4 py-2.5">
              <span className="text-[11px] font-semibold text-faint">Myth type:</span>
              <div className="flex items-center gap-0.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-0.5">
                {[
                  { id: "false_myth", label: "✗ False Myth (3)" },
                  { id: "true_myth",  label: "✓ True Myth (2)"  },
                ].map((opt) => {
                  const on = mythType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setMythType(opt.id)}
                      className="rounded-md px-3 py-1.5 text-[11px] font-bold transition-all"
                      style={on ? { background: "#f59e0b", color: "#fff" } : { color: "rgb(var(--text-faint))" }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <span className="text-[10px] text-faint">
                {mythType === "false_myth"
                  ? "Topics that debunk popular misconceptions"
                  : "Topics that validate overlooked scientific truths"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Topic list ───────────────────────────────────────────────── */}
      <div className="flex-1 p-3" style={{ minHeight: 240 }}>
        {isTabLoading ? (
          <div className="space-y-1">
            {globalLoading && (
              <div className="flex items-center gap-2 px-1 py-2">
                <Loader2 size={13} className="animate-spin text-faint" />
                <span className="text-xs text-faint">Validating with Doctor Farmer engine + PubMed…</span>
              </div>
            )}
            <TabSkeleton />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${mythType}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-2"
            >
              {currentTopics.map((t, i) => {
                const isSelected = selectedItems.some(s => s.title === t.title);
                const isDisabled = batchFull && !isSelected;
                return (
                  <TopicRow
                    key={i}
                    topic={t}
                    index={i}
                    isSelected={isSelected}
                    isDisabled={isDisabled}
                    onSelect={handleSelectTopic}
                    color={activeTabCfg.color}
                    critColors={critColors}
                  />
                );
              })}

              {/* ── Show more / Show less toggle ───────────────────── */}
              {hiddenCount > 0 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={toggleShowAll}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[rgb(var(--border))] py-2 text-[11px] font-semibold text-faint transition hover:border-[#2563eb]/30 hover:text-soft"
                >
                  {isExpanded ? (
                    <><ChevronUp size={13} /> Show less</>
                  ) : (
                    <><ChevronDown size={13} /> Show {hiddenCount} more topic{hiddenCount !== 1 ? "s" : ""} in this tab</>
                  )}
                </motion.button>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Score legend ─────────────────────────────────────────────── */}
      <div className="space-y-1.5 border-t border-[rgb(var(--border))] px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-[10px] font-semibold text-faint">Verdict:</span>
          {[
            { range: "70–100", label: "Approved", cls: "text-emerald-700 dark:text-emerald-400" },
            { range: "50–69",  label: "Reframe",  cls: "text-amber-700 dark:text-amber-400"     },
            { range: "0–49",   label: "Rejected", cls: "text-rose-700 dark:text-rose-400"       },
          ].map((item) => (
            <span key={item.range} className="flex items-center gap-1">
              <span className={`text-[10px] font-bold ${item.cls}`}>{item.range}</span>
              <span className="text-[10px] text-faint">{item.label}</span>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[10px] font-semibold text-faint">Criteria pills:</span>
          {[
            { label: "D = Demand",           color: isDark ? "#38bdf8" : "#0369a1" },
            { label: "S = Social",           color: isDark ? "#a78bfa" : "#6d28d9" },
            { label: "CG = Competition Gap", color: isDark ? "#f59e0b" : "#b45309" },
            { label: "F = DF Fit",           color: isDark ? "#34d399" : "#059669" },
          ].map((c) => (
            <span key={c.label} className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: c.color }} />
              <span className="text-[9px] text-faint">{c.label}</span>
            </span>
          ))}
          <span className="flex items-center gap-1">
            <span className="text-[9px]">🔬</span>
            <span className="text-[9px] text-faint">= PubMed Evidence</span>
          </span>
        </div>
      </div>

      </div>{/* end scrollable content */}

      {/* ── CTA button — always pinned at bottom ─────────────────────── */}
      <div className="shrink-0 border-t border-[rgb(var(--border))] px-3 py-2">
        <motion.button
          whileHover={{ scale: canSend ? 1.01 : 1 }}
          whileTap={{ scale: canSend ? 0.98 : 1 }}
          onClick={handleSend}
          disabled={!canSend}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-35"
          style={{
            background: canSend ? "linear-gradient(90deg,#38bdf8,#818cf8)" : "rgb(var(--bg-soft))",
            color:      canSend ? "#0a101e" : "rgb(var(--text-faint))",
          }}
        >
          {canSend ? (
            batchSize > 1
              ? <><span>Generate {selectedItems.length} Reel{selectedItems.length !== 1 ? "s" : ""}</span><ArrowRight size={15} /></>
              : <><span>→ Use this topic — Send to Stage 3</span><ArrowRight size={15} /></>
          ) : (
            <span>
              {batchSize > 1
                ? `Select up to ${batchSize} topics to continue`
                : "Select a topic above to continue"}
            </span>
          )}
        </motion.button>
      </div>

      {/* Per-category refresh toast (Improvement 3) */}
      {toast && <RefreshToast message={toast} />}

    </div>
  );
}
