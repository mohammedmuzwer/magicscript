"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, Check, ChevronDown, Copy, Star } from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Logo from "@/components/ui/logo";
import WorkspaceModeToggle from "@/components/ui/workspace-mode-toggle";
import NavActions from "@/components/ui/nav-actions";
import NewSessionButton from "@/components/ui/new-session-button";
import YoutubeLeftPanel from "@/components/youtube/YoutubeLeftPanel";

import { BUCKETS } from "@/lib/reels/buckets";
import {
  YT_STAGES, YT_BRAND, CONTENT_STYLES, styleLabel, HOOK_TYPES, VIDEO_CHAPTERS,
  YT_GEN_PIPELINE, YT_CREDITS_PER_SCRIPT, RETENTION_COLOR,
} from "@/lib/youtube/stages";

// ── Demo data ─────────────────────────────────────────────────────────────────
const DEMO_TOPIC = {
  title: "Intermittent Fasting & Blood Sugar: What 47 Studies Reveal",
  desc: "A clinical deep-dive into how time-restricted eating affects glucose control, with the protocol most doctors don't explain.",
  style: "education",
  df: 84, yt: 78,
  scores: { demand: 88, social: 74, retention: 81, fit: 90 },
  yt_signals: { ctr: 79, watch: 84, gap: 72, velocity: 66 },
};
const DEMO_COMPETITORS = [
  { title: "Intermittent Fasting for Beginners (Full Guide)", channel: "HealthLine", views: "2.1M", missing: "No glucose data for diabetics", gap: 82 },
  { title: "I Tried Fasting for 30 Days — Here's What Happened", channel: "Goal Guys", views: "5.4M", missing: "No medical citations", gap: 68 },
  { title: "The Science of Fasting | Dr. Explains", channel: "MedSimplified", views: "890K", missing: "No Tamil-diet context", gap: 74 },
];
const DEMO_KEYWORDS = [
  { kw: "intermittent fasting diabetes", vol: "40K", tier: "high" },
  { kw: "fasting blood sugar", vol: "22K", tier: "high" },
  { kw: "16:8 fasting results", vol: "9.5K", tier: "medium" },
  { kw: "fasting insulin resistance", vol: "4.1K", tier: "medium" },
  { kw: "time restricted eating protocol", vol: "1.2K", tier: "low" },
];
const DEMO_TAGS = [
  ["intermittent fasting", "high"], ["fasting diabetes", "high"], ["blood sugar control", "high"],
  ["16:8 fasting", "high"], ["insulin resistance", "medium"], ["time restricted eating", "medium"],
  ["fasting benefits", "medium"], ["glucose control", "medium"], ["metabolic health", "medium"],
  ["fasting protocol", "low"], ["autophagy", "low"], ["fasting myths", "low"],
  ["weight loss fasting", "high"], ["prediabetes", "medium"], ["fasting science", "low"],
  ["doctor explains", "low"], ["health 2024", "low"], ["fasting window", "medium"],
];
const DEMO_SCRIPT = `[HOOK — 0:00]
SCRIPT: "47 clinical studies looked at fasting and blood sugar — and what they found contradicts almost every diet video on YouTube."
ON-SCREEN TEXT: "47 Studies Analyzed"
B-ROLL: Fast cuts of glucose monitor readings, study papers
PATTERN INTERRUPT: Zoom punch on the number 47

[SCRIPT — 0:15]
SCRIPT: "Here's what actually happens to your liver in the first 16 hours of a clean fast..."`;
const VERDICT = (s) => (s >= 70 ? { label: "APPROVED", c: "#16a34a" } : s >= 50 ? { label: "REFRAME", c: "#f59e0b" } : { label: "REJECTED", c: "#ef4444" });
const KW_COLOR = { high: "#16a34a", medium: "#f59e0b", low: "#ef4444" };

// ── Shared UI atoms ───────────────────────────────────────────────────────────
function Card({ label, right, children, className = "" }) {
  return (
    <div className={`rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 ${className}`}>
      {label && (
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-faint">{label}</p>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

function Bar({ label, value, color = "#2563eb", suffix = "" }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-faint">{label}</span>
        <span className="font-bold text-[rgb(var(--text))]">{value}{suffix}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgb(var(--bg))]">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, value)}%`, background: color }} />
      </div>
    </div>
  );
}

function Ring({ value, size = 72, stroke = 6, color = "#2563eb", caption }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c - (value / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--border))" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-black" style={{ color }}>{value}</span>
        {caption && <span className="text-[8px] font-bold uppercase tracking-wide text-faint">{caption}</span>}
      </div>
    </div>
  );
}

function VerdictBadge({ score }) {
  const v = VERDICT(score);
  return (
    <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: v.c + "1f", color: v.c }}>
      {v.label}
    </span>
  );
}

function StageHeader({ id, title, subtitle }) {
  const st = YT_STAGES[id - 1];
  return (
    <div className="mb-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: st.color }}>
        Stage {id} of 7 — {st.label}
      </p>
      <h1 className="mt-1 font-display text-2xl font-black text-[rgb(var(--text))]">{title}</h1>
      <p className="mt-1 text-sm text-faint">{subtitle}</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
export default function YoutubePage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => { if (ready && !user) router.replace("/login"); }, [ready, user, router]);

  const [currentStage, setCurrentStage]   = useState(1);
  const [approvedStages, setApprovedStages] = useState([]);
  const [demoMode, setDemoMode]            = useState(false);

  // Stage 1
  const [inputMode, setInputMode]       = useState("bucket");
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [keyword, setKeyword]           = useState("");
  const [contentStyle, setContentStyle] = useState("auto");
  const [batchSize, setBatchSize]       = useState(1);
  // Stage 2/3
  const [topic, setTopic]               = useState(null);
  const [selectedHook, setSelectedHook] = useState("shock");
  // Stage 6/7
  const [expandedChapter, setExpandedChapter] = useState(0);
  const [openSection, setOpenSection]   = useState("script");
  const [shoot, setShoot]               = useState("to_shoot");

  const scrollRef = useRef(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0 }); }, [currentStage]);

  const approve = (id) => setApprovedStages((p) => (p.includes(id) ? p : [...p, id]));
  const goToStage = (id) => setCurrentStage(id);
  const advance = (id) => { approve(id); setCurrentStage(Math.min(7, id + 1)); };

  // Reset this pipeline's state only — clears progress back to Stage 1.
  function resetSession() {
    setApprovedStages([]); setDemoMode(false);
    setInputMode("bucket"); setSelectedBucket(null); setKeyword("");
    setContentStyle("auto"); setBatchSize(1);
    setTopic(null); setSelectedHook("shock");
    setExpandedChapter(0); setOpenSection("script"); setShoot("to_shoot");
    setCurrentStage(1);
  }

  function toggleDemo() {
    if (!demoMode) {
      setDemoMode(true);
      setSelectedBucket("weight-loss"); setKeyword("Intermittent Fasting");
      setContentStyle("education"); setTopic(DEMO_TOPIC);
      setApprovedStages([1]); setCurrentStage(2);
    } else {
      setDemoMode(false);
      setSelectedBucket(null); setKeyword(""); setContentStyle("auto");
      setTopic(null); setApprovedStages([]); setCurrentStage(1); setBatchSize(1);
    }
  }

  if (!ready) return (
    <div className="flex h-screen items-center justify-center bg-[rgb(var(--bg))]">
      <Loader2 size={28} className="animate-spin text-[#2563eb]" />
    </div>
  );
  if (!user) return null;

  const canAnalyse = !!selectedBucket || keyword.trim().length > 0;
  const FREEZE_H = "calc(100dvh - 56px - 52px)";

  // ── Bottom-bar CTA per stage ───────────────────────────────────────────────
  const ctas = {
    1: { label: "Analyse Topics →", color: "#2563eb", disabled: !canAnalyse, onClick: () => { if (!topic) setTopic(DEMO_TOPIC); advance(1); } },
    2: { label: "Lock Topic →",     color: "#16a34a", onClick: () => advance(2) },
    3: { label: "Build Structure →",color: "#16a34a", onClick: () => advance(3) },
    4: { label: "Run Med Check →",  color: "#16a34a", onClick: () => advance(4) },
    5: { label: "Generate Script →",color: "#16a34a", onClick: () => advance(5) },
    6: { label: "Go to Final Output →", color: "#2563eb", onClick: () => advance(6) },
    7: { label: "Export Full Pack →",   color: "#2563eb", onClick: () => approve(7) },
  };
  const cta = ctas[currentStage];

  const tips = {
    1: "💡 Pick a content bucket or type a keyword — choose a style, then analyse for YouTube + medical opportunity",
    2: "💡 Doctor's Pick blends Doctor Farmer score with YouTube signals — lock the highest combined opportunity",
    3: "💡 Find the gap competitors miss — your winning angle is auto-generated from what's missing",
    4: "💡 Keep the retention curve above 45% — add pattern interrupts at drop-off zones",
    5: "💡 PubMed verifies every medical claim before scripting — 12 credits for a longer YouTube script",
    6: "💡 Tap any chapter to expand — B-roll, on-screen text and pattern interrupts are built in",
    7: "💡 Your full pack: script, timestamps, SEO description, tags and a thumbnail brief — ready to upload",
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[rgb(var(--bg))]">

      {/* ── TOP NAV (h-14, matches Micro / Podcast) ── */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-4">
        <div className="flex items-center gap-3">
          <Logo size={26} href="/dashboard" />
          <div className="h-5 w-px bg-[rgb(var(--border))]" />
          <WorkspaceModeToggle activeOverride="youtube" />
        </div>
        <div className="flex items-center gap-2">
          {currentStage > 1 && <NewSessionButton onConfirm={resetSession} />}
          <NavActions />
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden">
        <YoutubeLeftPanel
          currentStage={currentStage}
          approvedStages={approvedStages}
          onGoToStage={goToStage}
          demoMode={demoMode}
          onToggleDemoMode={toggleDemo}
        />

        <main className="tab-content-enter flex flex-1 flex-col overflow-hidden">
          {(currentStage === 2 || currentStage === 6)
            ? <div ref={scrollRef} className="flex-1 overflow-hidden p-5 pb-[80px]" style={{ height: FREEZE_H }}>
                {currentStage === 2 && <Stage2 topic={topic || DEMO_TOPIC} />}
                {currentStage === 6 && <Stage6 topic={topic || DEMO_TOPIC} expanded={expandedChapter} setExpanded={setExpandedChapter} />}
              </div>
            : <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 pb-[80px]">
                {currentStage === 1 && <Stage1 {...{ inputMode, setInputMode, selectedBucket, setSelectedBucket, keyword, setKeyword, contentStyle, setContentStyle, batchSize, setBatchSize }} />}
                {currentStage === 3 && <Stage3 selectedHook={selectedHook} setSelectedHook={setSelectedHook} />}
                {currentStage === 4 && <Stage4 />}
                {currentStage === 5 && <Stage5 topic={topic || DEMO_TOPIC} credits={user.credits} />}
                {currentStage === 7 && <Stage7 topic={topic || DEMO_TOPIC} shoot={shoot} setShoot={setShoot} openSection={openSection} setOpenSection={setOpenSection} />}
              </div>}
        </main>
      </div>

      {/* ── BOTTOM BAR — fixed, lines up with content area ── */}
      <div className="fixed bottom-0 left-[200px] right-0 z-50 flex h-[52px] items-center justify-between border-t border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-[22px]">
        <span className="truncate text-[11px] text-faint">{tips[currentStage]}</span>
        <div className="flex items-center gap-2">
          {currentStage > 1 && (
            <button onClick={() => setCurrentStage((s) => Math.max(1, s - 1))}
              className="rounded-lg border border-[rgb(var(--border))] px-3.5 py-1.5 text-xs font-semibold text-faint transition hover:text-soft">← Back</button>
          )}
          <button
            onClick={cta.onClick}
            disabled={cta.disabled}
            className="rounded-lg px-4 py-1.5 text-xs font-bold text-white transition"
            style={{ background: cta.disabled ? cta.color + "55" : cta.color, cursor: cta.disabled ? "not-allowed" : "pointer" }}
          >
            {cta.label}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STAGE 1 — Topic Discovery
// ════════════════════════════════════════════════════════════════════════════
function Stage1({ inputMode, setInputMode, selectedBucket, setSelectedBucket, keyword, setKeyword, contentStyle, setContentStyle, batchSize, setBatchSize }) {
  const INPUT_MODES = [
    { id: "bucket", icon: "🧭", label: "Content Bucket", desc: "Pick from 7 health categories" },
    { id: "manual", icon: "✏️", label: "Manual Topic",   desc: "Type your own topic or sentence" },
    { id: "link",   icon: "🔗", label: "Reference Link", desc: "Paste a viral video URL to adapt" },
  ];
  return (
    <>
      <StageHeader id={1} title="Find your YouTube topic" subtitle="Keyword → ranked topics scored for YouTube + medical authority" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* LEFT 2fr */}
        <div className="xl:col-span-2">
          <Card label="Content Buckets">
            <div className="relative mb-3">
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. intermittent fasting, thyroid, PCOS..."
                className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] px-4 py-2.5 text-sm text-[rgb(var(--text))] outline-none focus:border-[rgb(var(--accent))]/40" />
            </div>
            <p className="mb-3 text-center text-[11px] text-faint">or pick a content bucket</p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {BUCKETS.map((b) => {
                const active = selectedBucket === b.id;
                return (
                  <button key={b.id} onClick={() => setSelectedBucket(active ? null : b.id)}
                    className="rounded-xl border p-3 text-left transition-all"
                    style={{ borderColor: active ? b.color : "rgb(var(--border))", background: active ? b.color + "14" : "rgb(var(--panel-soft))" }}>
                    <div className="text-2xl">{b.icon}</div>
                    <p className="mt-1.5 text-[13px] font-bold text-[rgb(var(--text))]">{b.label}</p>
                    <p className="text-[10px] text-faint">6 topics</p>
                    <div className="mt-2 h-1 w-full rounded-full" style={{ background: b.color }} />
                  </button>
                );
              })}
              <button className="rounded-xl border border-dashed border-[rgb(var(--border))] p-3 text-left text-faint transition hover:border-[#6b7280]">
                <div className="text-2xl">＋</div>
                <p className="mt-1.5 text-[13px] font-bold">Add Bucket</p>
                <p className="text-[10px]">1 slot left</p>
              </button>
            </div>
          </Card>
        </div>

        {/* RIGHT 1fr — 3 cards */}
        <div className="space-y-4">
          <Card label="Input Mode">
            <div className="space-y-2">
              {INPUT_MODES.map((m) => {
                const active = inputMode === m.id;
                return (
                  <button key={m.id} onClick={() => setInputMode(m.id)}
                    className="flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all"
                    style={{ borderColor: active ? "rgb(var(--accent))" : "rgb(var(--border))", background: active ? "rgba(37,99,235,0.08)" : "transparent" }}>
                    <span className="text-lg">{m.icon}</span>
                    <span>
                      <span className={`block text-[13px] font-bold ${active ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--text))]"}`}>{m.label}</span>
                      <span className="block text-[10px] text-faint">{m.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card label="Content Style">
            <div className="grid grid-cols-1 gap-2">
              {CONTENT_STYLES.map((s) => {
                const active = contentStyle === s.id;
                return (
                  <button key={s.id} onClick={() => setContentStyle(s.id)}
                    className="flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-all"
                    style={{ borderColor: active ? "rgb(var(--accent))" : "rgb(var(--border))", background: active ? "rgba(37,99,235,0.10)" : "transparent" }}>
                    <span className="text-base">{s.emoji}</span>
                    <span>
                      <span className={`block text-[12px] font-bold ${active ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--text))]"}`}>{s.label}</span>
                      <span className="block text-[10px] text-faint">{s.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card label="Batch Size">
            <div className="flex gap-2">
              {[1, 2, 3].map((n) => {
                const active = batchSize === n;
                return (
                  <button key={n} onClick={() => setBatchSize(n)}
                    className="flex-1 rounded-lg border py-2 text-sm font-bold transition-all"
                    style={{ borderColor: active ? "rgb(var(--accent))" : "rgb(var(--border))", background: active ? "rgb(var(--accent))" : "transparent", color: active ? "#fff" : "rgb(var(--text-faint))" }}>×{n}</button>
                );
              })}
            </div>
            <p className="mt-2 text-[10px] text-faint">YouTube scripts are longer — max batch 3</p>
          </Card>
        </div>
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STAGE 2 — Topic Validation (FREEZE)
// ════════════════════════════════════════════════════════════════════════════
function Stage2({ topic }) {
  const combined = Math.round((topic.df + topic.yt) / 2);
  return (
    <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-3">
      {/* LEFT frozen 2fr */}
      <div className="flex h-full flex-col overflow-hidden xl:col-span-2">
        <StageHeader id={2} title="Validate your topic angle" subtitle="Doctor Farmer + YouTube signal scoring — pick the highest opportunity" />
        <div className="rounded-xl border-2 p-5" style={{ borderColor: "#d97706", background: "linear-gradient(135deg, rgba(217,119,6,0.06), transparent)" }}>
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest" style={{ color: "#d97706" }}>
              <Star size={13} className="fill-current" /> Doctor's Pick
            </span>
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-500">APPROVED</span>
          </div>
          <div className="flex items-start gap-4">
            <Ring value={combined} size={84} color="#d97706" caption="combined" />
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold leading-snug text-[rgb(var(--text))]">{topic.title}</h3>
              <p className="mt-1 text-xs text-faint">{topic.desc}</p>
              <span className="mt-2 inline-block rounded-full bg-[rgb(var(--accent))]/10 px-2.5 py-0.5 text-[10px] font-bold text-[rgb(var(--accent))]">{styleLabel(topic.style)}</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[["Demand", topic.scores.demand], ["Social", topic.scores.social], ["YT Retention", topic.scores.retention], ["DF Fit", topic.scores.fit]].map(([l, v]) => (
              <div key={l} className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-2 text-center">
                <p className="text-sm font-black text-[rgb(var(--text))]">{v}</p>
                <p className="text-[9px] uppercase tracking-wide text-faint">{l}</p>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full rounded-xl py-2.5 text-sm font-bold text-white transition hover:brightness-110" style={{ background: "#d97706" }}>Use Doctor's Pick →</button>
        </div>

        <details className="mt-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3">
          <summary className="cursor-pointer text-xs font-bold text-[rgb(var(--text))]">Browse all topics by angle</summary>
          <p className="mt-2 text-[11px] text-faint">5 alternative angles scored across Education, Story and Myth Bust styles.</p>
        </details>

        <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
          {[["70–100 Approved", "#16a34a"], ["50–69 Reframe", "#f59e0b"], ["0–49 Rejected", "#ef4444"]].map(([l, c]) => (
            <span key={l} className="flex items-center gap-1.5 rounded-full border border-[rgb(var(--border))] px-2 py-1 text-faint">
              <span className="h-2 w-2 rounded-full" style={{ background: c }} /> {l}
            </span>
          ))}
        </div>
      </div>

      {/* RIGHT independent scroll 1fr */}
      <div className="h-full space-y-4 overflow-y-auto pr-1">
        <Card label="Dual Score Intelligence">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-faint">Doctor Farmer Score</div>
          <div className="flex items-center gap-4">
            <Ring value={topic.df} size={64} color="#2563eb" />
            <div className="flex-1 space-y-2">
              <Bar label="Search Demand" value={topic.yt_signals.gap} color="#2563eb" />
              <Bar label="Social Demand" value={topic.scores.social} color="#2563eb" />
              <Bar label="Competition Gap" value={72} color="#2563eb" />
              <Bar label="DF Fit" value={topic.scores.fit} color="#2563eb" />
            </div>
          </div>

          <div className="my-4 h-px bg-[rgb(var(--border))]" />

          <div className="mb-2 text-[10px] font-black uppercase tracking-wider" style={{ color: YT_BRAND }}>YouTube Signals</div>
          <div className="space-y-2">
            <Bar label="CTR Potential"     value={topic.yt_signals.ctr}      color="#2563eb" />
            <Bar label="Watch Time Score"  value={topic.yt_signals.watch}    color="#16a34a" />
            <Bar label="Competition Gap"   value={topic.yt_signals.gap}      color="#f97316" />
            <Bar label="Trending Velocity" value={topic.yt_signals.velocity} color="#7c3aed" />
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-[rgb(var(--bg))] px-3 py-2">
            <span className="text-[11px] font-bold text-faint">YouTube Score</span>
            <span className="text-xl font-black" style={{ color: YT_BRAND }}>{topic.yt}</span>
          </div>
        </Card>

        <Card label="Combined Score">
          <div className="flex flex-col items-center gap-2">
            <Ring value={combined} size={92} stroke={7} color="#d97706" caption="combined" />
            <VerdictBadge score={combined} />
          </div>
        </Card>

        <Card label="Content Strategy">
          <span className="inline-block rounded-full bg-[rgb(var(--accent))]/10 px-2.5 py-1 text-[11px] font-bold text-[rgb(var(--accent))]">{styleLabel(topic.style)}</span>
          <p className="mt-2 text-xs text-faint">Education works best here — the topic is question-driven and high search-intent, ideal for a structured explainer.</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["Diabetics 30–55", "Health-curious", "Tamil Nadu"].map((t) => (
              <span key={t} className="rounded-full bg-[rgb(var(--panel-soft))] px-2 py-0.5 text-[10px] text-faint">{t}</span>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-faint">Estimated watch-time retention: <span className="font-bold text-emerald-500">61%</span></p>
        </Card>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STAGE 3 — YouTube Research
// ════════════════════════════════════════════════════════════════════════════
function Stage3({ selectedHook, setSelectedHook }) {
  const hook = HOOK_TYPES.find((h) => h.id === selectedHook) || HOOK_TYPES[0];
  return (
    <>
      <StageHeader id={3} title="Research your competitive angle" subtitle="Gap analysis — find what top videos miss so yours wins" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* LEFT 2fr */}
        <div className="xl:col-span-2">
          <Card label="Competitor Gap Analysis">
            <div className="space-y-2.5">
              {DEMO_COMPETITORS.map((v, i) => (
                <div key={i} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-[rgb(var(--text))]">{v.title}</p>
                      <p className="text-[11px] text-faint">{v.channel}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[rgb(var(--bg))] px-2 py-0.5 text-[10px] font-bold text-faint">{v.views} views</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-md px-2 py-0.5 text-[10px] font-bold" style={{ background: "#ef44441f", color: "#ef4444" }}>Missing: {v.missing}</span>
                  </div>
                  <div className="mt-2"><Bar label="Gap opportunity" value={v.gap} color="#f97316" /></div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.20)" }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--accent))]">Your Winning Angle</p>
              <p className="mt-1.5 text-sm font-semibold text-[rgb(var(--text))]">"The clinical fasting protocol for diabetics that 5M-view videos skip — with the exact glucose numbers from 47 studies."</p>
              <button className="mt-3 rounded-lg bg-[rgb(var(--accent))] px-4 py-1.5 text-xs font-bold text-white transition hover:brightness-110">Use this angle →</button>
            </div>
          </Card>
        </div>

        {/* RIGHT 1fr — 3 cards */}
        <div className="space-y-4">
          <Card label="Hook Types">
            <div className="space-y-2">
              {HOOK_TYPES.map((h) => {
                const active = selectedHook === h.id;
                return (
                  <button key={h.id} onClick={() => setSelectedHook(h.id)}
                    className="w-full rounded-xl border px-3 py-2.5 text-left transition-all"
                    style={{ borderColor: active ? "rgb(var(--accent))" : "rgb(var(--border))", background: active ? "rgba(37,99,235,0.08)" : "transparent" }}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[12px] font-bold ${active ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--text))]"}`}>{h.emoji} {h.label}</span>
                      <span className="text-[10px] font-bold text-emerald-500">+{h.ctrLift}% CTR</span>
                    </div>
                    <p className="mt-1 text-[11px] italic text-faint">"{h.template}"</p>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card label="Thumbnail Brief">
            <div className="space-y-1.5 text-[11px]">
              <Row k="Background" v="Deep navy → orange gradient" />
              <Row k="Text overlay" v="“47 STUDIES LATER”" />
              <Row k="Face" v={hook.face} />
              <Row k="Style" v="Before / After split" />
            </div>
          </Card>

          <Card label="Target Keywords">
            <div className="flex flex-wrap gap-1.5">
              {DEMO_KEYWORDS.map((k) => (
                <span key={k.kw} className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold"
                  style={{ background: KW_COLOR[k.tier] + "1a", color: KW_COLOR[k.tier] }}>
                  {k.kw} · {k.vol}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-faint">{k}</span>
      <span className="text-right font-semibold text-[rgb(var(--text))]">{v}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STAGE 4 — Content Structure
// ════════════════════════════════════════════════════════════════════════════
function Stage4() {
  return (
    <>
      <StageHeader id={4} title="Build your 10-minute outline" subtitle="Chapter-by-chapter structure with timestamps and retention hooks" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* LEFT 2fr */}
        <div className="xl:col-span-2">
          <Card label="Video Structure">
            <div className="space-y-2">
              {VIDEO_CHAPTERS.map((ch, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-3">
                  <span className="shrink-0 rounded-md bg-[rgb(var(--bg))] px-2 py-1 text-[10px] font-bold tabular-nums text-faint">{ch.range}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-black text-[rgb(var(--text))]">{ch.type}</p>
                    <input defaultValue={ch.desc} className="mt-0.5 w-full bg-transparent text-[11px] text-faint outline-none" />
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-[10px] text-faint">{ch.words}w</span>
                    <span className="h-2 w-2 rounded-full" style={{ background: RETENTION_COLOR[ch.retention] }} title={ch.retention} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <button className="rounded-lg border border-[rgb(var(--border))] px-3 py-1.5 text-[11px] font-semibold text-faint transition hover:text-soft">↻ Regenerate Structure</button>
              <label className="flex items-center gap-1.5 text-[11px] text-faint"><input type="checkbox" className="accent-[#2563eb]" /> Edit chapters manually</label>
            </div>
          </Card>
        </div>

        {/* RIGHT 1fr — 2 cards */}
        <div className="space-y-4">
          <Card label="Structure Score">
            <div className="flex items-center gap-4">
              <Ring value={86} size={64} color="#16a34a" />
              <div className="flex-1 space-y-2">
                <Bar label="Hook Strength" value={88} color="#16a34a" />
                <Bar label="Retention Flow" value={79} color="#16a34a" />
                <Bar label="Chapter Balance" value={91} color="#16a34a" />
                <Bar label="CTA Power" value={84} color="#16a34a" />
              </div>
            </div>
          </Card>

          <Card label="Estimated Retention Curve">
            <RetentionChart />
            <p className="mt-2 text-[10px] text-faint">Target: keep average above <span className="font-bold text-emerald-500">45%</span>. Amber zones mark drop-off risk.</p>
          </Card>
        </div>
      </div>
    </>
  );
}

function RetentionChart() {
  // 0→10 min on X, 0→100% retention on Y. Dips at chapter transitions, recovers at hooks.
  const W = 260, H = 110, pad = 6;
  const pts = [100, 88, 72, 80, 64, 70, 52, 58, 46, 40];
  const stepX = (W - pad * 2) / (pts.length - 1);
  const toY = (v) => pad + (1 - v / 100) * (H - pad * 2);
  const line = pts.map((v, i) => `${pad + i * stepX},${toY(v)}`).join(" ");
  const area = `${pad},${H - pad} ${line} ${pad + (pts.length - 1) * stepX},${H - pad}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* danger zone (amber) where retention < 55 */}
      <rect x={pad + 6 * stepX} y={pad} width={3 * stepX} height={H - pad * 2} fill="#f59e0b" opacity="0.10" />
      <line x1={pad} y1={toY(45)} x2={W - pad} y2={toY(45)} stroke="#16a34a" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      <polygon points={area} fill="#2563eb" opacity="0.08" />
      <polyline points={line} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((v, i) => <circle key={i} cx={pad + i * stepX} cy={toY(v)} r="2.2" fill={v < 55 ? "#f59e0b" : "#2563eb"} />)}
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STAGE 5 — Med Quick-Check
// ════════════════════════════════════════════════════════════════════════════
function Stage5({ topic, credits }) {
  const claims = [
    { ch: "CHAPTER 2", claim: "16h fasting lowers fasting glucose by ~22 points", grade: "Strong", val: 86, sources: 7, color: "#16a34a" },
    { ch: "CHAPTER 3", claim: "Cells become 44% more insulin-sensitive in 72h", grade: "Moderate", val: 62, sources: 3, color: "#f59e0b" },
    { ch: "CASE STUDY", claim: "Ramadan fasting safe for most type-2 diabetics", grade: "Moderate", val: 58, sources: 4, color: "#f59e0b" },
  ];
  return (
    <>
      <StageHeader id={5} title="Verify medical claims" subtitle="PubMed fact-check all claims in your outline before scripting" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* LEFT 2fr */}
        <div className="xl:col-span-2">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[rgb(var(--text))]">{topic.title}</p>
                <span className="mt-1 inline-block rounded-full bg-[rgb(var(--accent))]/10 px-2 py-0.5 text-[10px] font-bold text-[rgb(var(--accent))]">{styleLabel(topic.style)}</span>
              </div>
            </div>
            <button className="mb-4 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500">Verify Medical Claims →</button>
            <div className="space-y-2">
              {claims.map((c, i) => (
                <div key={i} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-faint">{c.ch}</span>
                    <span className="rounded-full bg-[rgb(var(--bg))] px-2 py-0.5 text-[10px] font-bold text-faint">📄 {c.sources} sources</span>
                  </div>
                  <p className="mt-1 text-[12px] text-[rgb(var(--text))]">{c.claim}</p>
                  <div className="mt-2"><Bar label={`${c.grade} evidence`} value={c.val} color={c.color} /></div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-faint">
              <span className="rounded-full bg-[rgb(var(--panel-soft))] px-2 py-1">12 credits</span>
              <span className="rounded-full bg-[rgb(var(--panel-soft))] px-2 py-1">Education format</span>
              <span className="rounded-full bg-[rgb(var(--panel-soft))] px-2 py-1">PubMed verified</span>
            </div>
          </Card>
        </div>

        {/* RIGHT 1fr — 3 cards */}
        <div className="space-y-4">
          <Card label="Model">
            <div className="space-y-2">
              {[["✦ Gemini", true], ["◆ Claude", false], ["⚙ Custom", false]].map(([l, active]) => (
                <div key={l} className="rounded-lg border px-3 py-2 text-[12px] font-semibold"
                  style={{ borderColor: active ? "rgb(var(--accent))" : "rgb(var(--border))", background: active ? "rgba(37,99,235,0.08)" : "transparent", color: active ? "rgb(var(--accent))" : "rgb(var(--text-faint))" }}>
                  {l}{active && <span className="ml-1 text-emerald-500">●</span>}
                </div>
              ))}
            </div>
          </Card>
          <Card label="Cost">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-[rgb(var(--text))]">12</span><span className="text-sm font-bold text-faint">cr</span>
            </div>
            <p className="mt-1 text-[11px] text-faint">1 topic × 12cr (longer script)</p>
            <div className="my-2 h-px bg-[rgb(var(--border))]" />
            <p className="text-[10px] text-faint">{credits} credits remaining</p>
          </Card>
          <FactCheckGrades />
        </div>
      </div>
    </>
  );
}

function FactCheckGrades() {
  return (
    <Card label="Fact-Check Grades">
      <div className="space-y-2">
        {[["Verified", "#16a34a"], ["Partial", "#f59e0b"], ["No source", "#ef4444"], ["Clinical", "#2563eb"]].map(([l, c]) => (
          <div key={l} className="flex items-center gap-2 text-[11px] text-faint">
            <span className="h-2 w-2 rounded-full" style={{ background: c }} /> {l}
          </div>
        ))}
      </div>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STAGE 6 — Script Generation (FREEZE)
// ════════════════════════════════════════════════════════════════════════════
function Stage6({ topic, expanded, setExpanded }) {
  return (
    <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-3">
      {/* LEFT frozen, internal scroll, 2fr */}
      <div className="flex h-full flex-col overflow-hidden xl:col-span-2">
        <div className="mb-3 shrink-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: YT_STAGES[5].color }}>Stage 6 of 7 — Script Generation</p>
          <div className="mt-1 flex items-center justify-between">
            <h2 className="font-display text-lg font-black text-[rgb(var(--text))]">🎬 {topic.title}</h2>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px]">
            <span className="rounded-full bg-[rgb(var(--accent))]/10 px-2 py-0.5 font-bold text-[rgb(var(--accent))]">{styleLabel(topic.style)}</span>
            <span className="text-emerald-500">✓ PubMed verified</span>
            <span className="text-faint">tap chapter to expand</span>
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {VIDEO_CHAPTERS.map((ch, i) => {
            const open = expanded === i;
            return (
              <div key={i} className="overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]">
                <button onClick={() => setExpanded(open ? -1 : i)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left">
                  <span className="shrink-0 rounded-md bg-[rgb(var(--bg))] px-2 py-1 text-[10px] font-bold tabular-nums text-faint">{ch.range}</span>
                  <span className="flex-1 text-[12px] font-bold text-[rgb(var(--text))]">{ch.type}</span>
                  <span className="text-[10px] text-faint">{ch.words}w</span>
                  <ChevronDown size={14} className={`text-faint transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                {open && (
                  <div className="space-y-2 border-t border-[rgb(var(--border))] px-3 py-3 text-[12px] leading-relaxed">
                    <p><span className="font-bold text-[rgb(var(--accent))]">[{ch.type} — {ch.range.split("–")[0]}]</span></p>
                    <p className="text-[rgb(var(--text))]"><span className="font-bold">SCRIPT:</span> {DEMO_SCRIPT.split("\n").slice(1, 2).join(" ")}</p>
                    <p className="italic text-faint">B-ROLL: Glucose monitor close-ups, study papers fanning out</p>
                    <p className="font-semibold text-[rgb(var(--accent))]">ON-SCREEN TEXT: "47 Studies Analyzed"</p>
                    <p className="text-[11px] font-bold" style={{ color: "#ec4899" }}>PATTERN INTERRUPT: Zoom punch + sound sting</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {["Localize", "Copy", "Save", "Export"].map((b) => (
                        <button key={b} className="rounded-md border border-[rgb(var(--border))] px-2 py-1 text-[10px] font-semibold text-faint transition hover:text-soft">{b}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/8 p-4">
            <p className="text-[12px] font-bold text-emerald-500">Script ready — what's next?</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {["📤 Export Script", "📋 Copy All", "💾 Save to Library", "➕ New Batch"].map((t) => (
                <button key={t} className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] py-2 text-[11px] font-semibold text-[rgb(var(--text))] transition hover:border-emerald-500/40">{t}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT scroll 1fr */}
      <div className="h-full space-y-4 overflow-y-auto pr-1">
        <Card label="Generation Complete">
          <p className="text-[11px] font-bold text-[rgb(var(--accent))]">Writing Chapter 7 of 7…</p>
          <div className="mt-2 space-y-1.5">
            {YT_GEN_PIPELINE.map((r) => (
              <div key={r.label} className="flex items-center gap-2 text-[11px]">
                <Check size={12} className="text-emerald-500" />
                <span className="flex-1 text-[rgb(var(--text))]">{r.icon} {r.label}</span>
                <span className="text-faint">{r.cost}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between rounded-lg bg-[rgb(var(--bg))] px-3 py-2">
            <span className="text-[11px] text-faint">Total</span>
            <span className="text-sm font-black text-[rgb(var(--text))]">{YT_CREDITS_PER_SCRIPT} credits per script</span>
          </div>
        </Card>

        <Card label="Script Quality">
          <div className="flex items-center gap-3">
            <Ring value={88} size={56} color="#16a34a" />
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-500">Approved</span>
          </div>
          <div className="mt-3 space-y-2">
            <Bar label="Hook" value={90} color="#16a34a" />
            <Bar label="Retention" value={82} color="#16a34a" />
            <Bar label="Medical Accuracy" value={86} color="#16a34a" />
            <Bar label="CTA" value={84} color="#16a34a" />
          </div>
        </Card>

        <Card label="YouTube Optimisation">
          <div className="mb-2 text-[10px] font-black uppercase tracking-wider" style={{ color: YT_BRAND }}>YouTube Signals</div>
          <div className="space-y-2">
            <Bar label="CTR Score" value={79} color="#2563eb" />
            <Bar label="Retention Score" value={82} color="#16a34a" />
            <Bar label="SEO Score" value={88} color="#f97316" />
          </div>
        </Card>

        <Card label="Cost">
          <div className="flex items-baseline gap-1"><span className="text-3xl font-black text-[rgb(var(--text))]">12</span><span className="text-sm font-bold text-faint">cr</span></div>
          <p className="mt-1 text-[11px] text-faint">Longer YouTube script · all 7 chapters</p>
        </Card>

        <FactCheckGrades />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STAGE 7 — Final Output
// ════════════════════════════════════════════════════════════════════════════
function Stage7({ topic, shoot, setShoot, openSection, setOpenSection }) {
  const sections = [
    { id: "script", icon: "📄", title: "Full Script", meta: "1,480 words · ~9:50 read", body: (
      <>
        <pre className="whitespace-pre-wrap rounded-lg bg-[rgb(var(--bg))] p-2 text-[11px] leading-relaxed text-faint">{DEMO_SCRIPT.split("\n").slice(0, 3).join("\n")}</pre>
        <CopyRow labels={["Copy Script", "Export PDF"]} />
      </>
    ) },
    { id: "timestamps", icon: "⏱️", title: "Timestamps", meta: "7 chapters", body: (
      <>
        <pre className="whitespace-pre-wrap rounded-lg bg-[rgb(var(--bg))] p-2 text-[11px] leading-relaxed text-faint">{`0:00 Introduction\n0:45 Who this is for\n1:30 The core problem\n3:30 What 47 studies found\n5:30 The clinical protocol\n7:30 Real patient case\n9:00 Subscribe + next steps`}</pre>
        <CopyRow labels={["Copy Timestamps"]} />
      </>
    ) },
    { id: "description", icon: "📝", title: "Video Description", meta: "SEO-optimised", body: (
      <>
        <pre className="whitespace-pre-wrap rounded-lg bg-[rgb(var(--bg))] p-2 text-[11px] leading-relaxed text-faint">{`Does fasting actually fix blood sugar? 47 studies say something most videos won't.\n\nWhat you'll learn:\n• The real glucose numbers\n• The 16:8 protocol for diabetics\n• What doctors leave out\n\n#intermittentfasting #bloodsugar #diabetes`}</pre>
        <CopyRow labels={["Copy Description"]} />
      </>
    ) },
    { id: "tags", icon: "🏷️", title: "Tags & Keywords", meta: `${DEMO_TAGS.length} tags`, body: (
      <>
        <div className="flex flex-wrap gap-1.5">
          {DEMO_TAGS.map(([t, tier]) => (
            <span key={t} className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: KW_COLOR[tier] + "1a", color: KW_COLOR[tier] }}>{t}</span>
          ))}
        </div>
        <CopyRow labels={["Copy All Tags"]} />
      </>
    ) },
    { id: "thumb", icon: "🖼️", title: "Thumbnail Brief", meta: "for designer", body: (
      <>
        <div className="space-y-1.5 text-[11px]">
          <Row k="Background" v="#0b1f3a → #f97316" />
          <Row k="Main text" v="“47 STUDIES LATER”" />
          <Row k="Face expression" v="Surprised" />
          <Row k="Style" v="Before / After" />
        </div>
        <CopyRow labels={["Brief copied for designer"]} />
      </>
    ) },
  ];

  return (
    <>
      <StageHeader id={7} title="Your YouTube content pack" subtitle="Everything you need to film, upload and rank" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* LEFT 2fr */}
        <div className="xl:col-span-2">
          <Card label="Content Pack">
            <div className="space-y-2">
              {sections.map((s) => {
                const open = openSection === s.id;
                return (
                  <div key={s.id} className="overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))]">
                    <button onClick={() => setOpenSection(open ? "" : s.id)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left">
                      <span className="text-base">{s.icon}</span>
                      <span className="flex-1 text-[12px] font-bold text-[rgb(var(--text))]">{s.title}</span>
                      <span className="text-[10px] text-faint">{s.meta}</span>
                      <ChevronDown size={14} className={`text-faint transition-transform ${open ? "rotate-180" : ""}`} />
                    </button>
                    {open && <div className="space-y-2 border-t border-[rgb(var(--border))] px-3 py-3">{s.body}</div>}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* RIGHT 1fr — 3 cards */}
        <div className="space-y-4">
          <Card label="Pack Complete">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white"><Check size={14} strokeWidth={3} /></span>
              <span className="text-[12px] font-black text-emerald-500">CONTENT PACK READY</span>
            </div>
            <div className="space-y-1.5">
              {["Full 10-min script", "Chapter timestamps", "SEO description", "Tags & keywords", "Thumbnail brief"].map((t) => (
                <div key={t} className="flex items-center gap-2 text-[11px] text-[rgb(var(--text))]">
                  <Check size={12} className="text-emerald-500" /> {t}
                </div>
              ))}
            </div>
          </Card>

          <Card label="Predicted Performance">
            <div className="space-y-2">
              <Bar label="CTR Potential" value={79} suffix="/100" color="#2563eb" />
              <Bar label="Retention (avg)" value={58} suffix="%" color="#16a34a" />
              <Bar label="SEO Ranking Chance" value={84} suffix="/100" color="#f97316" />
            </div>
          </Card>

          <Card label="Shoot Tracker">
            <div className="flex gap-1.5">
              {[["to_shoot", "To Shoot"], ["recorded", "Recorded"], ["uploaded", "Uploaded"]].map(([id, l]) => {
                const active = shoot === id;
                return (
                  <button key={id} onClick={() => setShoot(id)}
                    className="flex-1 rounded-lg border py-2 text-[10px] font-bold transition-all"
                    style={{ borderColor: active ? "#2563eb" : "rgb(var(--border))", background: active ? "#2563eb" : "transparent", color: active ? "#fff" : "rgb(var(--text-faint))" }}>{l}</button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function CopyRow({ labels }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {labels.map((l) => (
        <button key={l} className="flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] px-2.5 py-1 text-[10px] font-semibold text-faint transition hover:text-soft">
          <Copy size={10} /> {l}
        </button>
      ))}
    </div>
  );
}
