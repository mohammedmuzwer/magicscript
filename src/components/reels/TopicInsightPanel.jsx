"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, Sparkles, ExternalLink, Mic } from "lucide-react";

// ── Score band ────────────────────────────────────────────────────────────────
function scoreBand(s) {
  if (s >= 70) return { label: "APPROVED",         text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-300 dark:border-emerald-500/30" };
  if (s >= 50) return { label: "REFRAME REQUIRED", text: "text-amber-700 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-500/10",     border: "border-amber-300 dark:border-amber-500/30"     };
  return              { label: "REJECTED",         text: "text-rose-700 dark:text-rose-400",       bg: "bg-rose-50 dark:bg-rose-500/10",       border: "border-rose-300 dark:border-rose-500/30"       };
}

// ── Animated score bar ────────────────────────────────────────────────────────
function ScoreBar({ value, color, weightLabel, label, animate = true }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-soft">{label}</span>
        <span className="text-[11px] tabular-nums font-bold" style={{ color }}>
          {value}
          {weightLabel && <span className="ml-1 font-normal text-faint">{weightLabel}</span>}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgb(var(--bg))]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: animate ? 0.55 : 0, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

// ── Signal bullets per criterion ─────────────────────────────────────────────
function demandSignals(d) {
  if (d >= 80) return ["Google Trends: Rising ↑ 12+ months",      "Search volume: High",        "Answer the Public: Dense question cluster"];
  if (d >= 60) return ["Google Trends: Steady demand",             "Search volume: Moderate",    "Answer the Public: Active but not saturated"];
  return              ["Google Trends: Flat or declining",         "Search volume: Low / niche", "Answer the Public: Sparse results"];
}
function socialSignals(s) {
  if (s >= 85) return ["Instagram save rate: Very high",    "Share-to-family motivation: Strong",   "Scroll-stop hook quality: Excellent", "Comment trigger: High"];
  if (s >= 70) return ["Instagram save rate: Good",         "Share-to-family motivation: Moderate", "Scroll-stop hook quality: Solid"];
  return              ["Instagram save rate: Below average","Share-to-family motivation: Low",      "Hook needs emotional reframe"];
}
function competitionSignals(cg) {
  if (cg >= 80) return ["Creator saturation: Generic influencers only", "Doctor-authority angle: Open lane", "Content age: Top reels 2+ years old"];
  if (cg >= 60) return ["Creator saturation: Moderate",                 "Doctor angle: Partially covered",  "Some credentialed creators present"];
  return              ["Saturated by credentialed doctors",             "Doctor-authority gap: Narrowing",   "Strong competition from clinical creators"];
}
function fitSignals(f) {
  if (f >= 85) return ["Audience: Diabetic / PCOD — Direct match", "South Indian food culture: Strong tie-in", "MHS funnel: Clear path to webinar",  "Doctor authority: Ideal"];
  if (f >= 70) return ["Audience: DF audience — Good match",        "South Indian context: Relevant",          "MHS funnel: Moderate connection"];
  return              ["Audience fit: Partial — needs localisation", "South Indian context: Indirect link",     "MHS funnel connection: Weak"];
}

// ── Content strategy copy per tab ─────────────────────────────────────────────
const STRATEGY = {
  myth: {
    false_myth: { headline: "Myth Debunker",       copy: "Challenges a widespread misconception, positioning Dr. Raj as the truth-teller who reveals what mainstream medicine gets wrong. Patients instantly save and share with family — \"see, I told you!\" effect." },
    true_myth:  { headline: "Truth Validator",     copy: "Validates an overlooked scientific truth that patients already suspect but never had clinical confirmation for. Generates strong comment engagement and trust-building with the MHS community." },
  },
  problem:    { default: { headline: "Hidden Problem Reveal",     copy: "Exposes a silent health issue creating urgency and driving consultation inquiries. The alarm factor triggers strong share-to-worried-family-member behaviour — one of the highest-converting reel formats." } },
  faq:        { default: { headline: "FAQ Answer",                copy: "Answers exactly what patients type into Google. High search alignment means it ranks in Instagram's own search feature and brings in new audience discovery." } },
  contrarian: { default: { headline: "Contrarian / Rebel Reach", copy: "Bold rebel positioning separates Dr. Raj from conventional doctors. The controversial angle maximises comment volume, debate threads, and algorithm push — highest reach potential of all formats." } },
  clinical:   { default: { headline: "Clinical Deep Dive",        copy: "Uses Doctor Farmer's unique clinical authority to deliver science no generic creator can touch — patient data, Indian research, Tamil Nadu specificity. Zero competition from non-doctors. Highest DF Fit and Competition Gap scores of all five categories." } },
};
function getStrategy(tabId, mythType) {
  if (tabId === "myth") return STRATEGY.myth[mythType] ?? STRATEGY.myth.false_myth;
  return STRATEGY[tabId]?.default ?? STRATEGY.clinical.default;
}

// ── Weakness chip ─────────────────────────────────────────────────────────────
function WeaknessChip({ text }) {
  if (!text) return null;
  // Extract criterion name (before " — ")
  const parts     = text.split(" — ");
  const criterion = parts[0]?.trim();
  const reason    = parts.slice(1).join(" — ").trim();
  return (
    <div className="rounded-xl border border-rose-500/25 bg-rose-500/8 p-3.5 space-y-2">
      <div className="flex items-center gap-2">
        <AlertTriangle size={13} className="text-rose-400 shrink-0" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Biggest Weakness</p>
      </div>
      <p className="text-[11px] font-bold text-rose-300">{criterion}</p>
      <p className="text-[11px] text-soft leading-relaxed">{reason}</p>
    </div>
  );
}

// ── Reframe card ──────────────────────────────────────────────────────────────
function ReframeCard({ reframe, color, critColors }) {
  if (!reframe) return null;
  const band   = scoreBand(reframe.score);
  const delta  = reframe.delta ?? (reframe.score - (reframe._originalScore ?? 0));
  const origSc = reframe._originalScore ?? 0;

  return (
    <div className="rounded-xl border border-violet-500/25 bg-violet-500/6 p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-violet-400 shrink-0" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Reframe — Stronger Version</p>
        </div>
        {/* Delta pill */}
        {delta > 0 && (
          <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold text-violet-300">
            ↑ +{delta} pts
          </span>
        )}
      </div>

      {/* Original → Reframed score comparison */}
      {origSc > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-[rgb(var(--bg-soft))] px-3 py-2">
          <div className="text-center">
            <p className="text-[9px] font-semibold text-faint uppercase tracking-wide">Original</p>
            <p className="text-lg font-black tabular-nums text-faint">{origSc}</p>
          </div>
          <div className="flex-1 flex items-center gap-1">
            <div className="h-px flex-1 bg-violet-500/30" />
            <span className="text-[10px] font-bold text-violet-400">→</span>
            <div className="h-px flex-1 bg-violet-500/30" />
          </div>
          <div className="text-center">
            <p className="text-[9px] font-semibold text-violet-400 uppercase tracking-wide">Reframed</p>
            <p className="text-lg font-black tabular-nums text-violet-400">{reframe.score}</p>
          </div>
        </div>
      )}

      {/* Reframed title */}
      <p className="text-[12px] font-bold leading-snug text-soft">{reframe.title}</p>

      {/* Why stronger */}
      {reframe.why_stronger && (
        <p className="text-[11px] text-faint leading-relaxed italic border-l-2 border-violet-500/30 pl-3">
          {reframe.why_stronger}
        </p>
      )}

      {/* Re-scored bars */}
      <div className="space-y-2 pt-1">
        <ScoreBar value={reframe.demand}          color={critColors?.demand ?? "#38bdf8"} weightLabel="· 35%" label="Demand"          animate={false} />
        <ScoreBar value={reframe.social}          color={critColors?.social ?? "#a78bfa"} weightLabel="· 40%" label="Social Demand"   animate={false} />
        <ScoreBar value={reframe.competition_gap} color={critColors?.gap    ?? "#f59e0b"} weightLabel="· 20%" label="Competition Gap" animate={false} />
        <ScoreBar value={reframe.fit}             color={critColors?.fit    ?? "#34d399"} weightLabel="· 20%" label="DF Fit"          animate={false} />
      </div>

      <div className="flex items-center justify-between border-t border-violet-500/20 pt-2">
        <span className="text-[11px] text-faint">Reframed verdict</span>
        <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${band.bg} ${band.text} ${band.border}`}>
          {band.label}
        </span>
      </div>
    </div>
  );
}

// ── Verify card ───────────────────────────────────────────────────────────────
function VerifyCard({ verify }) {
  if (!verify) return null;
  const rows = [
    { label: "Ubersuggest",        icon: "📊", value: verify.ubersuggest,       url: `https://neilpatel.com/ubersuggest/?q=${encodeURIComponent(verify.ubersuggest ?? "")}` },
    { label: "Answer the Public",  icon: "💬", value: verify.answer_the_public, url: `https://answerthepublic.com/reports/new?query=${encodeURIComponent(verify.answer_the_public ?? "")}` },
    { label: "Google Trends",      icon: "📈", value: verify.google_trends,     url: `https://trends.google.com/trends/explore?q=${encodeURIComponent(verify.google_trends ?? "")}` },
    { label: "SEO Trending Angle", icon: "🔍", value: verify.seo_angle,         url: null },
  ];
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3.5 space-y-2.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-faint">🔬 Verify Before Shooting</p>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-2.5">
            <span className="mt-0.5 text-sm shrink-0">{r.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-faint leading-none mb-0.5">{r.label}</p>
              <p className="text-[11px] text-soft truncate">{r.value}</p>
            </div>
            {r.url && (
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 shrink-0 text-faint hover:text-cyan transition"
                title={`Open in ${r.label}`}
              >
                <ExternalLink size={11} />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Opening Line card ─────────────────────────────────────────────────────────
function OpeningLineCard({ line, color }) {
  if (!line) return null;
  return (
    <div
      className="rounded-xl border p-3.5 space-y-2"
      style={{ borderColor: color + "40", background: color + "08" }}
    >
      <div className="flex items-center gap-2">
        <Mic size={13} style={{ color }} className="shrink-0" />
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
          Reel Opening Line — First 3 Seconds
        </p>
      </div>
      <p className="text-[13px] font-bold leading-snug text-soft italic">"{line}"</p>
      <p className="text-[10px] text-faint">Culturally specific · Scroll-stop · Clinically sharp</p>
    </div>
  );
}

// ── Detail fetch hook ─────────────────────────────────────────────────────────
function useTopicDetail(preview) {
  const [detail,  setDetail]  = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!preview?.topic) { setDetail(null); return; }
    let cancelled = false;

    const { topic, tabId } = preview;
    setDetail(null);
    setLoading(true);

    const ak = typeof window !== "undefined" ? localStorage.getItem("ms_anthropic_key") : null;
    const ok = typeof window !== "undefined" ? localStorage.getItem("ms_openai_key")    : null;

    fetch("/api/reels/topic-validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(ak && { "x-client-anthropic-key": ak }),
        ...(ok && { "x-client-openai-key":    ok }),
      },
      body: JSON.stringify({
        topic:           topic.title,
        tabId:           tabId,
        demand:          topic.demand,
        social:          topic.social,
        competition_gap: topic.competition_gap ?? 75,
        fit:             topic.fit,
        score:           topic.score,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          // Tag reframe with original score for lift calculation
          if (data.reframe) data.reframe._originalScore = topic.score;
          setDetail(data);
        }
      })
      .catch(() => { /* silent — detail stays null */ })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [preview?.topic?.title, preview?.tabId]);

  return { detail, loading };
}

// ── Generation source chips ───────────────────────────────────────────────────
const SOURCES = [
  { label: "Google Trends API",    icon: "📈" },
  { label: "Answer The Public",    icon: "🔍" },
  { label: "Instagram Reels Data", icon: "📱" },
  { label: "PubMed / Clinical",    icon: "🧬" },
  { label: "MHS Patient Cases",    icon: "🏥" },
  { label: "DF Scoring Engine",    icon: "⚡" },
];

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function TopicInsightPanel({ preview }) {
  const { detail, loading } = useTopicDetail(preview);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Criterion colors: bright for dark mode, AA-contrast for light mode
  const C = isDark
    ? { demand: "#38bdf8", social: "#a78bfa", gap: "#f59e0b", fit: "#34d399" }
    : { demand: "#0369a1", social: "#6d28d9", gap: "#b45309", fit: "#059669" };

  if (!preview) return null;

  const { topic, tabId, tabConfig, mythType } = preview;
  const band     = scoreBand(topic.score);
  const strategy = getStrategy(tabId, mythType);

  const competitionGap = topic.competition_gap ?? 75;

  const dSignals  = demandSignals(topic.demand);
  const sSignals  = socialSignals(topic.social);
  const cgSignals = competitionSignals(competitionGap);
  const fSignals  = fitSignals(topic.fit);

  return (
    <motion.div
      key={topic.title}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="space-y-3"
    >

      {/* ── Topic header card ────────────────────────────────────────── */}
      <div
        className="rounded-xl border p-3.5 space-y-2"
        style={{ borderColor: tabConfig.color + "45", background: tabConfig.color + "0a" }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>{tabConfig.icon}</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-faint leading-none">
                {tabConfig.label}
                {tabId === "myth" && (
                  <span className="ml-1 opacity-70">· {mythType === "false_myth" ? "False Myth" : "True Myth"}</span>
                )}
              </p>
              <p className="text-[10px] font-semibold mt-0.5" style={{ color: tabConfig.color }}>
                {strategy.headline}
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-black tabular-nums leading-none" style={{ color: tabConfig.color }}>
              {topic.score}
            </p>
            <span className={`mt-1 inline-block rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${band.bg} ${band.text} ${band.border}`}>
              {band.label}
            </span>
          </div>
        </div>
        <p className="text-[11px] font-semibold leading-snug text-soft">{topic.title}</p>
        {topic.description && (
          <p className="text-[10px] text-faint leading-relaxed">{topic.description}</p>
        )}

        {/* Anchor type badge */}
        {topic.anchor_type && (
          <div
            className="mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-1"
            style={{
              background:
                topic.anchor_type === "A" ? C.demand + "20" :
                topic.anchor_type === "B" ? C.gap    + "20" : C.social + "20",
              border: `1px solid ${
                topic.anchor_type === "A" ? C.demand + "50" :
                topic.anchor_type === "B" ? C.gap    + "50" : C.social + "50"
              }`,
            }}
          >
            <span
              className="text-[10px] font-bold"
              style={{
                color:
                  topic.anchor_type === "A" ? C.demand :
                  topic.anchor_type === "B" ? C.gap    : C.social,
              }}
            >
              {topic.anchor_type === "A" ? "⚓ Anchor A — Direct keyword" :
               topic.anchor_type === "B" ? "↳ Anchor B — Derivative topic" :
               "🕌 Anchor C — Cultural intersection"}
            </span>
          </div>
        )}
        {topic.anchor_note && (
          <p className="mt-1 text-[10px] text-faint italic">{topic.anchor_note}</p>
        )}
      </div>

      {/* ── Score breakdown (4 criteria) ─────────────────────────────── */}
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3.5 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-faint">📊 Score Breakdown</p>
        <ScoreBar value={topic.demand}     color={C.demand} weightLabel="· 35%"         label="Search Demand"   />
        <ScoreBar value={topic.social}     color={C.social} weightLabel="· 40% ★ HIGH"  label="Social Demand"   />
        <ScoreBar value={competitionGap}   color={C.gap}    weightLabel="· 20%"         label="Competition Gap" />
        <ScoreBar value={topic.fit}        color={C.fit}    weightLabel="· 20%"         label="DF Fit"          />
        <div className="flex items-center justify-between border-t border-[rgb(var(--border))] pt-2.5">
          <div>
            <span className="text-[11px] font-semibold text-faint">Doctor Farmer Score</span>
            <p className="text-[9px] text-faint mt-0.5">
              (D×0.35 + S×0.40 + CG×0.20 + F×0.20) ÷ 115 × 100
            </p>
          </div>
          <span className="text-xl font-black tabular-nums" style={{ color: tabConfig.color }}>
            {topic.score}
          </span>
        </div>
      </div>

      {/* ── Signal sources (4 criteria) ──────────────────────────────── */}
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3.5 space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-faint">📡 Signal Sources</p>

        {/* Demand */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[11px] font-bold text-cyan">Search Demand <span className="font-normal text-faint">· 35%</span></p>
            <span className="text-[11px] font-bold tabular-nums text-cyan">{topic.demand}</span>
          </div>
          <ul className="space-y-1">
            {dSignals.map((s) => (
              <li key={s} className="flex items-start gap-1.5 text-[11px] text-faint">
                <span className="mt-0.5 shrink-0 text-cyan/50">›</span>{s}
              </li>
            ))}
          </ul>
        </div>

        {/* Social */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[11px] font-bold text-violet-400">
              Social Demand <span className="font-normal text-faint">· 40%</span>
              <span className="ml-1 text-[9px] font-bold text-violet-400/70">★ HIGHEST</span>
            </p>
            <span className="text-[11px] font-bold tabular-nums text-violet-400">{topic.social}</span>
          </div>
          <ul className="space-y-1">
            {sSignals.map((s) => (
              <li key={s} className="flex items-start gap-1.5 text-[11px] text-faint">
                <span className="mt-0.5 shrink-0 text-violet-400/50">›</span>{s}
              </li>
            ))}
          </ul>
        </div>

        {/* Competition Gap */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[11px] font-bold text-amber-400">Competition Gap <span className="font-normal text-faint">· 20%</span></p>
            <span className="text-[11px] font-bold tabular-nums text-amber-400">{competitionGap}</span>
          </div>
          <ul className="space-y-1">
            {cgSignals.map((s) => (
              <li key={s} className="flex items-start gap-1.5 text-[11px] text-faint">
                <span className="mt-0.5 shrink-0 text-amber-400/50">›</span>{s}
              </li>
            ))}
          </ul>
        </div>

        {/* DF Fit */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[11px] font-bold text-emerald-400">Doctor Farmer Fit <span className="font-normal text-faint">· 20%</span></p>
            <span className="text-[11px] font-bold tabular-nums text-emerald-400">{topic.fit}</span>
          </div>
          <ul className="space-y-1">
            {fSignals.map((s) => (
              <li key={s} className="flex items-start gap-1.5 text-[11px] text-faint">
                <span className="mt-0.5 shrink-0 text-emerald-400/50">›</span>{s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Content strategy ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3.5 space-y-2.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-faint">🎯 Content Strategy</p>
        <p className="text-[11px] text-soft leading-relaxed">{strategy.copy}</p>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {tabId === "myth" && (
            <span className="rounded-lg px-2 py-1 text-[10px] font-semibold" style={{ background: tabConfig.color + "18", color: tabConfig.color }}>
              {mythType === "false_myth" ? "✗ Debunks Myths" : "✓ Validates Truths"}
            </span>
          )}
          <span className="rounded-lg bg-cyan/10 px-2 py-1 text-[10px] font-semibold text-cyan">Doctor Authority</span>
          <span className="rounded-lg bg-violet-500/10 px-2 py-1 text-[10px] font-semibold text-violet-400">South Indian</span>
          <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-400">MHS Funnel</span>
        </div>
      </div>

      {/* ── Detail section (fetched after selection) ──────────────────── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2.5 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-3"
          >
            <Loader2 size={13} className="animate-spin text-violet-400 shrink-0" />
            <span className="text-[11px] text-faint">Running Doctor Farmer validation engine…</span>
          </motion.div>
        )}

        {!loading && detail && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {/* Biggest Weakness */}
            <WeaknessChip text={detail.biggest_weakness} />

            {/* Reframe */}
            <ReframeCard reframe={detail.reframe} color={tabConfig.color} critColors={C} />

            {/* Verify */}
            <VerifyCard verify={detail.verify} />

            {/* Opening Line */}
            <OpeningLineCard line={detail.opening_line} color={tabConfig.color} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Generation sources ────────────────────────────────────────── */}
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3.5 space-y-2.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-faint">🔬 How This Was Generated</p>
        <p className="text-[11px] text-faint leading-relaxed">
          The Doctor Farmer engine cross-referenced 6 signal sources and applied a 4-criterion weighted formula specific to Dr. Raj's audience and funnel goals.
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {SOURCES.map((src) => (
            <div key={src.label} className="flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-2 py-1.5">
              <span className="text-xs">{src.icon}</span>
              <span className="text-[10px] font-semibold text-faint leading-tight">{src.label}</span>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
}
