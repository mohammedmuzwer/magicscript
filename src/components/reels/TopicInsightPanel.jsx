"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, Sparkles, ExternalLink, Mic } from "lucide-react";
import ReelsModelToggle from "@/components/reels/ReelsModelToggle";

// ── Score band ────────────────────────────────────────────────────────────────
function scoreBand(s) {
  if (s >= 70) return { label: "APPROVED",         text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-300 dark:border-emerald-500/30" };
  if (s >= 50) return { label: "REFRAME REQUIRED", text: "text-amber-700 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-500/10",     border: "border-amber-300 dark:border-amber-500/30"     };
  return              { label: "REJECTED",         text: "text-rose-700 dark:text-rose-400",       bg: "bg-rose-50 dark:bg-rose-500/10",       border: "border-rose-300 dark:border-rose-500/30"       };
}

// ── Hex → rgba helper ─────────────────────────────────────────────────────────
function hexRgba(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

// ── Animated score bar ────────────────────────────────────────────────────────
function ScoreBar({ value, color, weightLabel, label, animate = true, trackColor }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-soft">{label}</span>
        <span className="text-[13px] tabular-nums font-semibold" style={{ color }}>
          {value}
          {weightLabel && <span className="ml-1 text-[11px] font-normal text-faint">{weightLabel}</span>}
        </span>
      </div>
      <div
        className="h-[5px] w-full overflow-hidden rounded-full"
        style={{ background: trackColor ?? "rgb(var(--bg))" }}
      >
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
  if (d >= 80) return ["Search volume trend: Rising ↑ 12+ months (estimated)", "Patient question density: High", "Google Trends proxy: Strong sustained interest"];
  if (d >= 60) return ["Search volume trend: Steady (estimated)",               "Patient question density: Moderate", "Google Trends proxy: Consistent interest"];
  return              ["Search volume trend: Flat or declining (estimated)",    "Patient question density: Low / niche", "Google Trends proxy: Weak signal"];
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

// ── Signal bullet with coloured arrow ────────────────────────────────────────
function SignalBullet({ text, bulletColor, isDark }) {
  // Colour ↑ ↓ → arrows
  const colored = text.replace(/(↑)/g, `<up>`).replace(/(↓)/g, `<down>`).replace(/(→)/g, `<stable>`);
  const textColor = isDark ? "rgb(var(--text-faint))" : "#4b5563";
  const parts = text.split(/(↑|↓|→)/);
  return (
    <li className="flex items-start gap-1.5 text-[11px]" style={{ color: textColor }}>
      <span className="mt-0.5 shrink-0" style={{ color: bulletColor + (isDark ? "80" : "") }}>›</span>
      <span>
        {parts.map((p, i) => {
          if (p === "↑") return <span key={i} style={{ color: "#16a34a", fontWeight: 600 }}>↑</span>;
          if (p === "↓") return <span key={i} style={{ color: "#dc2626", fontWeight: 600 }}>↓</span>;
          if (p === "→") return <span key={i} style={{ color: "#6b7280", fontWeight: 600 }}>→</span>;
          return p;
        })}
      </span>
    </li>
  );
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
        {delta > 0 && (
          <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold text-violet-300">
            ↑ +{delta} pts
          </span>
        )}
      </div>

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

      <p className="text-[12px] font-bold leading-snug text-soft">{reframe.title}</p>

      {reframe.why_stronger && (
        <p className="text-[11px] text-faint leading-relaxed italic border-l-2 border-violet-500/30 pl-3">
          {reframe.why_stronger}
        </p>
      )}

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
  // Prefer new reddit_search field, fall back to old answer_the_public
  const redditQuery = verify.reddit_search || verify.answer_the_public;
  const rows = [
    {
      label: "Ubersuggest",
      icon:  "📊",
      value: verify.ubersuggest,
      url:   verify.ubersuggest
        ? `https://neilpatel.com/ubersuggest/?q=${encodeURIComponent(verify.ubersuggest)}&localeCode=in`
        : null,
    },
    {
      label: "Reddit Discussion",
      icon:  "💬",
      value: redditQuery,
      url:   redditQuery
        ? `https://www.reddit.com/search/?q=${encodeURIComponent(redditQuery)}&type=link&sort=hot`
        : null,
    },
    {
      label: "Google Trends",
      icon:  "📈",
      value: verify.google_trends,
      url:   verify.google_trends
        ? `https://trends.google.com/trends/explore?q=${encodeURIComponent(verify.google_trends)}&geo=IN`
        : null,
    },
    {
      label: "SEO Angle",
      icon:  "🔍",
      value: verify.seo_angle,
      url:   verify.seo_angle
        ? `https://www.google.com/search?q=${encodeURIComponent(verify.seo_angle + " site:reddit.com OR healthline OR ncbi")}`
        : null,
    },
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
              <a href={r.url} target="_blank" rel="noopener noreferrer"
                className="mt-0.5 shrink-0 text-faint hover:text-[#2563eb] transition" title={`Open in ${r.label}`}>
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
    <div className="rounded-xl border p-3.5 space-y-2"
      style={{ borderColor: color + "40", background: color + "08" }}>
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

    const { topic, tabId } = preview;
    const controller = new AbortController();
    setDetail(null);
    setLoading(true);

    const ak = typeof window !== "undefined" ? (localStorage.getItem("V_KEY_CLAUDE") || localStorage.getItem("ms_anthropic_key")) : null;
    const gk = typeof window !== "undefined" ? (localStorage.getItem("V_KEY_GOOGLE") || localStorage.getItem("ms_gemini_key")) : null;
    const ok = typeof window !== "undefined" ? localStorage.getItem("ms_openai_key") : null;

    fetch("/api/reels/topic-validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(ak && { "x-client-anthropic-key": ak }),
        ...(gk && { "x-client-gemini-key":    gk }),
        ...(ok && { "x-client-openai-key":    ok }),
      },
      body: JSON.stringify({
        topic: topic.title, tabId,
        demand: topic.demand, social: topic.social,
        competition_gap: topic.competition_gap ?? 75,
        fit: topic.fit, score: topic.score,
      }),
      signal: controller.signal,
    })
      .then(r => r.json())
      .then(data => {
        if (!controller.signal.aborted) {
          if (data.reframe) data.reframe._originalScore = topic.score;
          setDetail(data);
        }
      })
      .catch(() => {})
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });

    return () => { controller.abort(); };
  }, [preview?.topic?.title, preview?.tabId]);

  return { detail, loading };
}

// ── "How This Was Generated" — live signal summary ────────────────────────────
function LiveSignalSummary({ signals, isDark }) {
  const isDemo = !signals;

  const PILL_COLORS = isDark ? {} : {
    "YouTube Demand (India)":  "#dc2626",
    "YouTube Social":          "#dc2626",
    "Reddit / Patient Q&A":    "#7c3aed",
    "Google Trends":           "#1d4ed8",
    "PubMed / Clinical":       "#374151",
    "MHS Patient Cases":       "#374151",
    "DF Scoring Engine":       "#374151",
  };

  const hasYT     = signals?.youtube_demand_score != null;
  const socialSrc = signals?.social_signal_source ?? null;
  const hasSocial = signals?.social_signal_score != null;
  const ytIsSocial = socialSrc === "youtube";

  const rows = [
    { label: "YouTube Demand (India)", icon: "▶️", live: hasYT,     value: hasYT     ? `Demand ${signals.youtube_demand_score}/100 · Gap ${signals.youtube_gap}/100` : "Not retrieved this session (quota or timeout)" },
    { label: "YouTube Social",         icon: "💬", live: hasSocial && ytIsSocial, value: hasSocial && ytIsSocial ? `Engagement ${signals.social_signal_score}/100 · ${signals.youtube_total_comments != null ? signals.youtube_total_comments.toLocaleString() : "?"} comments` : "—" },
    { label: "Reddit / Patient Q&A",   icon: "🟠", live: socialSrc === "reddit", value: socialSrc === "reddit" ? `Social ${signals.social_signal_score}/100 · ${signals.reddit_total_comments} comments` : "Blocked server-side (403) — needs OAuth" },
    { label: "Google Trends",          icon: "📈", live: false,     value: "Not integrated — no official public API" },
    { label: "PubMed / Clinical",      icon: "🧬", live: true,      value: "Evidence pre-check applied" },
    { label: "DF Scoring Engine",      icon: "⚡", live: true,      value: "4-criterion formula · weighted" },
  ];

  // Light mode: amber demo box; dark mode: neutral card
  const containerStyle = isDark
    ? {}
    : isDemo
      ? { background: "#fef9c3", borderColor: "#fde68a" }
      : {};
  const containerBorder = isDark ? "border-[rgb(var(--border))]" : isDemo ? "border" : "border border-[rgb(var(--border))]";
  const containerBg = isDark ? "bg-[rgb(var(--panel))]" : isDemo ? "" : "bg-[rgb(var(--panel))]";

  const labelColor = isDark ? undefined : isDemo ? "#92400e" : "#6b7280";
  const bodyTextColor = isDark ? undefined : isDemo ? "#78350f" : "#374151";

  return (
    <div className={`rounded-xl ${containerBorder} ${containerBg} p-3.5 space-y-2.5`} style={containerStyle}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[1px]" style={{ color: labelColor ?? undefined }}>
          {isDemo ? "🔬 How This Was Generated" : "🔬 How This Was Generated"}
        </p>
        {isDemo ? (
          <span className="rounded px-1.5 py-0.5 text-[9px] font-bold"
            style={isDark ? { background: "rgba(245,158,11,0.10)", color: "#f59e0b" } : { background: "#f59e0b", color: "#fff" }}>
            DEMO
          </span>
        ) : (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">LIVE DATA</span>
        )}
      </div>
      <p className="text-[11px] leading-relaxed"
        style={{ color: bodyTextColor ?? "rgb(var(--text-faint))" }}>
        {isDemo
          ? "YouTube signals not retrieved this session — scores are AI-estimated. PubMed evidence check still applied. Regenerate to retry live signals."
          : `Live signals from YouTube (demand${ytIsSocial ? " + social engagement" : ""}) + PubMed. Demand, social & competition scores use real API data. Reddit JSON is blocked server-side.`}
      </p>
      <div className="space-y-1.5">
        {rows.map((src) => {
          const pillStyle = isDark
            ? {}
            : { background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 5 };
          const textColor = isDark ? undefined : (PILL_COLORS[src.label] ?? "#374151");
          return (
            <div key={src.label} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
              style={isDark ? { border: "1px solid rgb(var(--border))", background: "rgb(var(--bg-soft))" } : pillStyle}>
              <span className="text-xs shrink-0">{src.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold leading-none"
                  style={{ color: textColor ?? "rgb(var(--text-faint))" }}>{src.label}</p>
                {src.value && (
                  <p className="mt-0.5 text-[10px] leading-none text-soft">{src.value}</p>
                )}
              </div>
              <span className={`shrink-0 h-1.5 w-1.5 rounded-full ${src.live && src.value ? "bg-emerald-400" : "bg-faint/30"}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

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

  // Criterion colours — bright for dark, fully opaque readable for light
  const C = isDark
    ? { demand: "#38bdf8", social: "#a78bfa", gap: "#f59e0b", fit: "#34d399" }
    : { demand: "#3358e8", social: "#7c3aed", gap: "#ea580c", fit: "#16a34a" };

  // Track colours for score bars in light mode (rgba at 12% of bar colour)
  const T = isDark
    ? { demand: undefined, social: undefined, gap: undefined, fit: undefined }
    : {
        demand: hexRgba("#3358e8", 0.12),
        social: hexRgba("#7c3aed", 0.12),
        gap:    hexRgba("#ea580c", 0.12),
        fit:    hexRgba("#16a34a", 0.12),
      };

  const labelColor = isDark ? undefined : "#6b7280";
  const bodyText   = isDark ? "text-soft" : "text-[#111827]";
  const subText    = isDark ? "text-faint" : "text-[#4b5563]";

  if (!preview) return null;

  const { topic, tabId, tabConfig, mythType, level1Signals } = preview;
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

        {topic.anchor_type && (
          <div
            className="mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-1"
            style={{
              background: topic.anchor_type === "A" ? C.demand + "20" : topic.anchor_type === "B" ? C.gap + "20" : C.social + "20",
              border: `1px solid ${topic.anchor_type === "A" ? C.demand + "50" : topic.anchor_type === "B" ? C.gap + "50" : C.social + "50"}`,
            }}
          >
            <span className="text-[10px] font-bold" style={{ color: topic.anchor_type === "A" ? C.demand : topic.anchor_type === "B" ? C.gap : C.social }}>
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

      {/* ── Why now (Improvement 2) ──────────────────────────────────── */}
      {topic.why_now && (
        <div style={{ margin: "6px 0", padding: "6px 10px", background: "rgba(37,99,235,0.05)", borderLeft: "2px solid rgba(37,99,235,0.25)", borderRadius: "0 4px 4px 0" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "#2563eb", margin: 0 }}>WHY NOW</p>
          <p style={{ fontSize: 12, fontStyle: "italic", color: "rgb(var(--text-faint))", margin: "2px 0 0" }}>{topic.why_now}</p>
        </div>
      )}

      {/* ── Score breakdown (4 criteria) ─────────────────────────────── */}
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3.5 space-y-3"
        style={isDark ? {} : { background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.12)" }}>
        <p className="text-[10px] font-bold uppercase tracking-[1px]"
          style={{ color: isDark ? "rgb(var(--text-faint))" : "#6b7280" }}>
          📊 Score Breakdown
        </p>
        <ScoreBar value={topic.demand}   color={C.demand} weightLabel="· 35%"        label="Search Demand"   trackColor={T.demand} />
        <ScoreBar value={topic.social}   color={C.social} weightLabel="· 40% ★ HIGH" label="Social Demand"   trackColor={T.social} />
        <ScoreBar value={competitionGap} color={C.gap}    weightLabel="· 20%"        label="Competition Gap" trackColor={T.gap} />
        <ScoreBar value={topic.fit}      color={C.fit}    weightLabel="· 20%"        label="DF Fit"          trackColor={T.fit} />
        <div className="flex items-center justify-between pt-2.5"
          style={{ borderTop: isDark ? "1px solid rgb(var(--border))" : "0.5px solid rgba(0,0,0,0.10)" }}>
          <div>
            <span className="text-[11px] font-semibold text-faint">Doctor Farmer Score</span>
            <p className="text-[9px] text-faint mt-0.5">(D×0.35 + S×0.40 + CG×0.20 + F×0.20) ÷ 115 × 100</p>
          </div>
          <span className="text-xl font-black tabular-nums" style={{ color: tabConfig.color }}>
            {topic.score}
          </span>
        </div>
      </div>

      {/* ── Signal sources (4 criteria) ──────────────────────────────── */}
      {(() => {
        const sig = level1Signals;
        const hasYT      = sig?.youtube_demand_score != null;
        const hasYTGap   = sig?.youtube_gap          != null;
        // Social is "live" when we have a real social signal from any source.
        const socialSrc  = sig?.social_signal_source ?? null; // "reddit" | "youtube" | null
        const hasSocial  = sig?.social_signal_score != null;

        // Live bullets for Search Demand (YouTube)
        const searchBullets = hasYT
          ? [
              `YouTube India demand: ${sig.youtube_demand_score}/100 (${sig.youtube_demand_score >= 70 ? "high" : sig.youtube_demand_score >= 40 ? "moderate" : "low"})`,
              `Top 5 video views: ${sig.youtube_total_views != null ? sig.youtube_total_views.toLocaleString() : "N/A"}`,
              ...(sig.youtube_top_titles?.slice(0, 1).map(t => `Existing: "${t.length > 55 ? t.slice(0, 55) + "…" : t}"`) ?? []),
            ]
          : dSignals;

        // Live bullets for Social Demand — Reddit if it returned data, else YouTube engagement
        const socialBullets = hasSocial
          ? (socialSrc === "reddit"
              ? [
                  `Reddit buzz score: ${sig.social_signal_score}/100`,
                  `Patient comments across posts: ${sig.reddit_total_comments ?? 0}`,
                  ...(sig.reddit_questions?.slice(0, 2).map(q => `Real Q: "${q.length > 60 ? q.slice(0, 60) + "…" : q}"`) ?? []),
                ]
              : [
                  `YouTube social engagement: ${sig.social_signal_score}/100`,
                  `Total comments (top 5 videos): ${sig.youtube_total_comments != null ? sig.youtube_total_comments.toLocaleString() : "N/A"}`,
                  `Like engagement rate: ${sig.youtube_engagement != null ? sig.youtube_engagement + "%" : "N/A"}`,
                  `Source: YouTube Data API (Reddit JSON blocked server-side)`,
                ])
          : sSignals;

        // Live bullets for Competition Gap (YouTube gap)
        const gapBullets = hasYTGap
          ? [
              `YouTube doctor-angle gap: ${sig.youtube_gap}/100`,
              `Existing competition score: ${sig.youtube_competition != null ? `${sig.youtube_competition}/100` : "moderate"}`,
              `Source: YouTube Data API (India, top 5 results)`,
            ]
          : cgSignals;

        // DF Fit always uses PubMed + LLM (no live external signal)
        const fitBullets = topic.pubmed_evidence_label
          ? [
              `PubMed evidence: ${topic.pubmed_evidence_label} (${topic.pubmed_evidence_score ?? "?"}/100)`,
              `Published studies found: ${topic.pubmed_total_count ?? "?"}`,
              ...fSignals.slice(1),
            ]
          : fSignals;

        function CritHeader({ label, weight, color, value, isLive, weightSuffix }) {
          return (
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-[11px] font-bold" style={{ color: isDark ? color : "#111827" }}>
                  {label}
                  <span className="font-normal ml-1" style={{ color: isDark ? "rgb(var(--text-faint))" : "#6b7280" }}>
                    · {weight}{weightSuffix ? ` ${weightSuffix}` : ""}
                  </span>
                </p>
                <span
                  className="rounded px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide"
                  style={isLive
                    ? { background: isDark ? "rgba(52,211,153,0.12)" : "#dcfce7", color: isDark ? "#34d399" : "#166534" }
                    : { background: isDark ? "rgba(100,116,139,0.15)" : "#f1f5f9", color: isDark ? "#94a3b8" : "#64748b" }
                  }
                >
                  {isLive ? "● Live" : "◌ Estimated"}
                </span>
              </div>
              <span className="text-[13px] font-semibold tabular-nums" style={{ color }}>{value}</span>
            </div>
          );
        }

        return (
          <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3.5 space-y-4"
            style={isDark ? {} : { background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.12)" }}>
            <p className="text-[10px] font-bold uppercase tracking-[1px]"
              style={{ color: isDark ? "rgb(var(--text-faint))" : "#6b7280" }}>
              📡 Signal Sources
            </p>

            {/* Search Demand */}
            <div>
              <CritHeader label="Search Demand" weight="35%" color={C.demand} value={topic.demand} isLive={hasYT} />
              <ul className="space-y-1">
                {searchBullets.map(s => <SignalBullet key={s} text={s} bulletColor={C.demand} isDark={isDark} />)}
              </ul>
            </div>

            {/* Social Demand */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-[11px] font-bold" style={{ color: isDark ? C.social : "#111827" }}>
                    Social Demand
                    <span className="font-normal ml-1" style={{ color: isDark ? "rgb(var(--text-faint))" : "#6b7280" }}>· 40%</span>
                    {isDark
                      ? <span className="ml-1 text-[9px] font-bold" style={{ color: C.social + "b0" }}>★ HIGHEST</span>
                      : <span className="ml-1 inline-flex items-center rounded px-1 py-0.5 text-[9px] font-bold" style={{ background: "#fef3c7", color: "#92400e" }}>★ HIGH</span>
                    }
                  </p>
                  <span
                    className="rounded px-1 py-0.5 text-[8px] font-bold uppercase tracking-wide"
                    style={hasSocial
                      ? { background: isDark ? "rgba(52,211,153,0.12)" : "#dcfce7", color: isDark ? "#34d399" : "#166534" }
                      : { background: isDark ? "rgba(100,116,139,0.15)" : "#f1f5f9", color: isDark ? "#94a3b8" : "#64748b" }
                    }
                  >
                    {hasSocial ? "● Live" : "◌ Estimated"}
                  </span>
                </div>
                <span className="text-[13px] font-semibold tabular-nums" style={{ color: C.social }}>{topic.social}</span>
              </div>
              <ul className="space-y-1">
                {socialBullets.map(s => <SignalBullet key={s} text={s} bulletColor={C.social} isDark={isDark} />)}
              </ul>
            </div>

            {/* Competition Gap */}
            <div>
              <CritHeader label="Competition Gap" weight="20%" color={C.gap} value={competitionGap} isLive={hasYTGap} />
              <ul className="space-y-1">
                {gapBullets.map(s => <SignalBullet key={s} text={s} bulletColor={C.gap} isDark={isDark} />)}
              </ul>
            </div>

            {/* DF Fit */}
            <div>
              <CritHeader label="Doctor Farmer Fit" weight="20%" color={C.fit} value={topic.fit} isLive={!!topic.pubmed_evidence_label} />
              <ul className="space-y-1">
                {fitBullets.map(s => <SignalBullet key={s} text={s} bulletColor={C.fit} isDark={isDark} />)}
              </ul>
            </div>
          </div>
        );
      })()}

      {/* ── Content strategy ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3.5 space-y-2.5"
        style={isDark ? {} : { background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.12)" }}>
        <p className="text-[10px] font-bold uppercase tracking-[1px]"
          style={{ color: isDark ? "rgb(var(--text-faint))" : "#6b7280" }}>
          🎯 Content Strategy
        </p>
        <p className={`text-[11px] leading-relaxed ${bodyText}`}>{strategy.copy}</p>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {tabId === "myth" && (
            <span className="rounded-lg px-2 py-1 text-[10px] font-semibold"
              style={{ background: tabConfig.color + "18", color: tabConfig.color }}>
              {mythType === "false_myth" ? "✗ Debunks Myths" : "✓ Validates Truths"}
            </span>
          )}
          {/* Doctor Authority — blue */}
          <span className="rounded-lg px-2 py-1 text-[10px] font-semibold"
            style={isDark
              ? { background: "rgba(103,232,249,0.10)", color: "#67e8f9" }
              : { background: "#dbeafe", color: "#1e40af" }}>
            Doctor Authority
          </span>
          {/* South Indian — amber */}
          <span className="rounded-lg px-2 py-1 text-[10px] font-semibold"
            style={isDark
              ? { background: "rgba(167,139,250,0.10)", color: "#a78bfa" }
              : { background: "#fef3c7", color: "#92400e" }}>
            South Indian
          </span>
          {/* MHS Funnel — green */}
          <span className="rounded-lg px-2 py-1 text-[10px] font-semibold"
            style={isDark
              ? { background: "rgba(52,211,153,0.10)", color: "#34d399" }
              : { background: "#dcfce7", color: "#166534" }}>
            MHS Funnel
          </span>
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
            className="flex items-center gap-2.5 rounded-xl px-4 py-3"
            style={isDark
              ? { border: "1px solid rgb(var(--border))", background: "rgb(var(--panel))" }
              : { border: "0.5px solid rgba(37,99,235,0.15)", background: "#f0f9ff" }}
          >
            <Loader2 size={13} className="animate-spin shrink-0"
              style={{ color: isDark ? "#a78bfa" : "#3358e8" }} />
            <span className="text-[11px]"
              style={{ color: isDark ? "rgb(var(--text-faint))" : "#374151" }}>
              Running Doctor Farmer validation engine…
            </span>
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
            <WeaknessChip text={detail.biggest_weakness} />
            <ReframeCard reframe={detail.reframe} color={tabConfig.color} critColors={C} />
            <VerifyCard verify={detail.verify} />
            <OpeningLineCard line={detail.opening_line} color={tabConfig.color} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Generation sources (live-data aware) ─────────────────────── */}
      <LiveSignalSummary signals={level1Signals} isDark={isDark} />

    </motion.div>
  );
}
