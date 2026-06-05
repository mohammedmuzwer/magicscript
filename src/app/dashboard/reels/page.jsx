"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, X, RotateCcw, LogOut, UserCircle, CreditCard,
  ChevronDown, Clapperboard, Loader2, Check,
  ArrowRight, LayoutGrid, List, ExternalLink,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import Logo from "@/components/ui/logo";
import { Avatar } from "@/components/dashboard/dashboard-shell";
import WorkspaceModeToggle from "@/components/ui/workspace-mode-toggle";
import NavActions from "@/components/ui/nav-actions";
import NewSessionButton from "@/components/ui/new-session-button";
import { useRouter } from "next/navigation";

import Stage1Center       from "@/components/reels/Stage1Center";
import Stage2TopicMatrix  from "@/components/reels/Stage2TopicMatrix";
import GenerationPipeline from "@/components/reels/GenerationPipeline";
import ScriptOutput       from "@/components/reels/ScriptOutput";
import BatchReelCard      from "@/components/reels/BatchReelCard";
import ReelsLeftPanel     from "@/components/reels/ReelsLeftPanel";
import TopicInsightPanel  from "@/components/reels/TopicInsightPanel";

import { getContentTypeById } from "@/lib/reels/contentTypes";
import { REELS_CREDITS, LOW_CREDIT_THRESHOLD, reelRunCost, reverifyCost } from "@/lib/reels/creditCosts";
import { getReelsModelPref } from "@/lib/reels/stages";
import { TAB_STATE_KEYS, saveTabState, loadTabState } from "@/lib/tabState";
import { getCurrentTamilContext } from "@/lib/tamilContext";

// ── Tab id → content type id mapping ─────────────────────────────────────────
const TAB_TO_CONTENT_TYPE = {
  myth:       "myth-buster",
  problem:    "problem-reveal",
  faq:        "faq-explainer",
  contrarian: "contrarian",
  clinical:   "education-drop",
};

// ── Stage 1 input options ─────────────────────────────────────────────────────
const INPUT_OPTIONS = [
  { id: "bucket", label: "Content Bucket", icon: "🧭", description: "Pick from 7 health categories" },
  { id: "manual", label: "Manual Topic",   icon: "✏️", description: "Type your own topic or sentence" },
  { id: "link",   label: "Reference Link", icon: "🔗", description: "Paste a viral video URL to adapt" },
];

// ── Shared small card: Fact-Check Grades ─────────────────────────────────────
function FactCheckCard() {
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Fact-Check Grades</p>
      {[
        { color: "#22c55e", label: "Verified"  },
        { color: "#f59e0b", label: "Partial"   },
        { color: "#ef4444", label: "No source" },
        { color: "#3b82f6", label: "Clinical"  },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-2 text-[11px] text-faint">
          <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
          {label}
        </div>
      ))}
    </div>
  );
}

// ── Shared small card: Cost ───────────────────────────────────────────────────
function CostCard({ count, credits, model = "gemini" }) {
  const total = reelRunCost(count, model);
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-faint flex items-center gap-1.5">
        <Zap size={10} className="text-[#2563eb]" /> Cost
      </p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-[rgb(var(--text))]">{total}</span>
        <span className="text-sm font-bold text-faint">cr</span>
      </div>
      <p className="text-[11px] text-faint">{count} reel{count !== 1 ? "s" : ""} · full Stage 1→5 run</p>
      <div className="h-px bg-[rgb(var(--border))]" />
      <p className="text-[10px] text-faint">{credits} credits remaining</p>
    </div>
  );
}

// ── Shared small card: Script Quality ────────────────────────────────────────
function ScriptQualityCard({ medCheck }) {
  const qs  = medCheck ? Math.round((medCheck.evidence_score ?? 60) * 0.6 + 40) : 82;
  const r3  = 18, c3 = 2 * Math.PI * r3;
  const p3  = (qs / 100) * c3;
  const cl3 = qs >= 70 ? "#22c55e" : qs >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Script Quality</p>
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <svg width={46} height={46} className="-rotate-90">
            <circle cx={23} cy={23} r={r3} fill="none" stroke="rgb(var(--bg))" strokeWidth={4} />
            <circle cx={23} cy={23} r={r3} fill="none" stroke={cl3} strokeWidth={4}
              strokeDasharray={c3} strokeDashoffset={c3 - p3} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black" style={{ color: cl3 }}>{qs}</span>
          </div>
        </div>
        <div>
          <span className="text-[10px] font-bold" style={{ color: cl3 }}>
            ✓ {qs >= 70 ? "Approved" : qs >= 50 ? "Review" : "Reframe"}
          </span>
          <p className="text-[10px] text-faint mt-0.5">{qs}/100</p>
        </div>
      </div>
    </div>
  );
}

// ── Shared small card: Performance ───────────────────────────────────────────
function PerformanceCard() {
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Performance</p>
      {[
        { label: "Hook strength", pct: 78, color: "#22c55e"  },
        { label: "Save rate",     pct: 62, color: "#38bdf8"  },
        { label: "Share trigger", pct: 55, color: "#818cf8"  },
      ].map(({ label, pct, color }) => (
        <div key={label} className="space-y-1">
          <div className="flex justify-between text-[10px]">
            <span className="text-faint">{label}</span>
            <span className="font-bold" style={{ color }}>{pct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[rgb(var(--bg))]">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Creator history (Improvement 4) ──────────────────────────────────────────
// Read topic titles the creator already produced (saved library + history) so
// Stage 2 can deprioritise near-duplicates. Safe: returns [] if unavailable.
function getCreatorUsedTopics() {
  if (typeof window === "undefined") return [];
  const titles = [];
  const pull = (key) => {
    try {
      const arr = JSON.parse(localStorage.getItem(key) || "[]");
      if (!Array.isArray(arr)) return;
      for (const item of arr) {
        if (!item) continue;
        if (Array.isArray(item.reels)) {
          item.reels.forEach((r) => { const t = r?.topic || r?.title; if (t) titles.push(t); });
        }
        const t = item.topic_title || item.topic || item.title;
        if (t) titles.push(t);
      }
    } catch {}
  };
  pull("magicscript_reels_saved");
  pull("magicscript_reels_history");
  pull("magicscript_saved_library");
  return [...new Set(titles.filter(Boolean).map((s) => String(s)))].slice(0, 50);
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function ReelsPage() {
  const { user, spendCredit, logout, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  // ── Stage tracking ──────────────────────────────────────────────────────────
  const [currentStage, setCurrentStage] = useState(1);
  const [scriptView,   setScriptView]   = useState("list");
  const [demoMode,     setDemoMode]     = useState(false);
  const [isDark,       setIsDark]       = useState(true);

  // ── Stage 1 state ───────────────────────────────────────────────────────────
  const [inputMode,      setInputMode]      = useState("bucket");
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [customWord,     setCustomWord]     = useState("");
  const [manualTopic,    setManualTopic]    = useState("");
  const [referenceLink,  setReferenceLink]  = useState("");
  const [keyword,        setKeyword]        = useState("");

  // ── Stage 2 state ───────────────────────────────────────────────────────────
  const [topic,       setTopic]       = useState("");
  const [contentType, setContentType] = useState(null);
  // Cache of generated Stage 2 topics, lifted out of Stage2TopicMatrix so that
  // navigating away and back does NOT re-trigger generation. Keyed by a
  // signature of (keyword + selected content types) so a real change refetches.
  const [stage2TopicsCache, setStage2TopicsCache] = useState(null);

  // ── Batch state ─────────────────────────────────────────────────────────────
  const [batchSize,      setBatchSize]      = useState(1);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [finalReels,     setFinalReels]     = useState([]);
  const [reelProgress,   setReelProgress]   = useState({ current: 0, total: 0 });

  // ── Stage 3 pipeline state ──────────────────────────────────────────────────
  const [pipeStatus,  setPipeStatus]  = useState("idle");
  const [activeStep,  setActiveStep]  = useState(0);
  const [medCheck,    setMedCheck]    = useState(null);
  const [medBlocked,  setMedBlocked]  = useState(false);
  const [awaitingMed, setAwaitingMed] = useState(false);
  const [scripts,     setScripts]     = useState(null);

  // ── Verify step state ───────────────────────────────────────────────────────
  const [verifyStatus,  setVerifyStatus]  = useState("idle");
  const [verifyResults, setVerifyResults] = useState([]);
  const [stage2Pool,    setStage2Pool]    = useState(null);
  const [bufferPool,    setBufferPool]    = useState([]);
  const [tamilContext,  setTamilContext]  = useState(null);
  const [scriptProgress, setScriptProgress] = useState({ current: 0, total: 0, phase: "" });

  // Stage 3 — rich verification report
  const [verifyLoadStep,         setVerifyLoadStep]         = useState(0);
  const [medVerificationReports, setMedVerificationReports] = useState([]);
  const [selectedReportIdx,      setSelectedReportIdx]      = useState(0);

  // Stage 1 — Content Type selector
  const [selectedContentTypes, setSelectedContentTypes] = useState(["auto"]);

  // ── Final output completion ──────────────────────────────────────────────────
  const [finalDone, setFinalDone] = useState(false);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [previewTopic, setPreviewTopic] = useState(null);
  const [sessionId,    setSessionId]    = useState(null);
  // When a live backend call falls back, we auto-switch the whole app into Demo
  // Mode. This holds the human-readable reason for the one-time notice banner.
  const [autoDemoReason, setAutoDemoReason] = useState(null);
  // Currently selected model (for cost display — Claude/GPT cost more than Gemini).
  const [selectedModel, setSelectedModel] = useState("gemini");
  // Running total of credits spent on the CURRENT reel run (shown at Stage 5).
  const [runSpend, setRunSpend] = useState(0);

  // ── Lightweight cross-tab persistence ────────────────────────────────────────
  // Restores where the user left off when returning to this tab. In-flight API
  // calls are NOT resumed — "running" statuses are sanitised to idle on restore.
  const [restored, setRestored] = useState(false);

  const mainScrollRef  = useRef(null);
  const rightColRef    = useRef(null);

  // Track dark mode for light-mode-only colour overrides
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // Reset scroll to top whenever the active stage changes
  useEffect(() => {
    mainScrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
    rightColRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [currentStage]);

  // Auto-advance loading steps while Stage 3 verification is running
  useEffect(() => {
    if (verifyStatus !== "running") { setVerifyLoadStep(0); return; }
    if (verifyLoadStep >= 5) return;
    const t = setTimeout(() => setVerifyLoadStep(s => Math.min(s + 1, 5)), 750);
    return () => clearTimeout(t);
  }, [verifyStatus, verifyLoadStep]);

  // Auto-advance Stage 4 → Stage 5 (Final Output) once generation finishes.
  useEffect(() => {
    if (currentStage === 4 && pipeStatus === "done" && finalReels.length > 0) {
      const t = setTimeout(() => setCurrentStage(5), 600);
      return () => clearTimeout(t);
    }
  }, [currentStage, pipeStatus, finalReels.length]);

  // Track the selected model so cost displays update live when it changes.
  useEffect(() => {
    setSelectedModel(demoMode ? "demo" : getReelsModelPref(4));
    const handler = (e) => { if (!demoMode && e.detail?.model) setSelectedModel(e.detail.model); };
    window.addEventListener("reelsModelPrefChange", handler);
    return () => window.removeEventListener("reelsModelPrefChange", handler);
  }, [demoMode]);

  // ── Restore persisted UI state on mount (runs once) ──────────────────────────
  useEffect(() => {
    const s = loadTabState(TAB_STATE_KEYS.reels);
    if (s) {
      if (s.currentStage   != null) setCurrentStage(s.currentStage);
      if (s.scriptView     != null) setScriptView(s.scriptView);
      if (s.demoMode       != null) setDemoMode(s.demoMode);
      if (s.inputMode      != null) setInputMode(s.inputMode);
      if (s.selectedBucket != null) setSelectedBucket(s.selectedBucket);
      if (s.customWord     != null) setCustomWord(s.customWord);
      if (s.manualTopic    != null) setManualTopic(s.manualTopic);
      if (s.referenceLink  != null) setReferenceLink(s.referenceLink);
      if (s.keyword        != null) setKeyword(s.keyword);
      if (s.topic          != null) setTopic(s.topic);
      if (s.contentType    != null) setContentType(s.contentType);
      if (s.batchSize      != null) setBatchSize(s.batchSize);
      if (s.selectedTopics != null) setSelectedTopics(s.selectedTopics);
      if (s.finalReels     != null) setFinalReels(s.finalReels);
      if (s.reelProgress   != null) setReelProgress(s.reelProgress);
      if (s.medCheck       != null) setMedCheck(s.medCheck);
      if (s.medBlocked     != null) setMedBlocked(s.medBlocked);
      if (s.scripts        != null) setScripts(s.scripts);
      if (s.verifyResults  != null) setVerifyResults(s.verifyResults);
      if (s.finalDone      != null) setFinalDone(s.finalDone);
      if (s.runSpend       != null) setRunSpend(s.runSpend);
      if (s.sessionId      != null) setSessionId(s.sessionId);
      // Sanitise transient "running" states — no API call is actually in flight.
      setPipeStatus(s.pipeStatus === "running" ? "idle" : (s.pipeStatus ?? "idle"));
      setVerifyStatus(s.verifyStatus === "running" ? "idle" : (s.verifyStatus ?? "idle"));
      if (s.pipeStatus !== "running" && s.activeStep != null) setActiveStep(s.activeStep);
      setAwaitingMed(false);
    }
    setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist UI state on change (after restore completes) ─────────────────────
  useEffect(() => {
    if (!restored) return;
    saveTabState(TAB_STATE_KEYS.reels, {
      currentStage, scriptView, demoMode, inputMode, selectedBucket, customWord,
      manualTopic, referenceLink, keyword, topic, contentType, batchSize,
      selectedTopics, finalReels, reelProgress, medCheck, medBlocked, scripts,
      verifyResults, verifyStatus, pipeStatus, activeStep, finalDone, runSpend, sessionId,
      busy: pipeStatus === "running" || verifyStatus === "running",
    });
  }, [restored, currentStage, scriptView, demoMode, inputMode, selectedBucket,
      customWord, manualTopic, referenceLink, keyword, topic, contentType, batchSize,
      selectedTopics, finalReels, reelProgress, medCheck, medBlocked, scripts,
      verifyResults, verifyStatus, pipeStatus, activeStep, finalDone, runSpend, sessionId]);

  const SESSIONS_KEY = "ms_reels_sessions";
  const saveSession = (patch) => {
    try {
      const sessions = JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]");
      const now = new Date().toISOString();
      const existing = sessionId ? sessions.find(s => s.id === sessionId) : null;
      if (existing) {
        Object.assign(existing, patch, { updatedAt: now });
      } else {
        const newId = "rs_" + Date.now();
        setSessionId(newId);
        sessions.unshift({ id: newId, createdAt: now, updatedAt: now, ...patch });
      }
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 100)));
    } catch {}
  };

  // Creator history → passed to Stage 2 so it can flag already-made angles.
  // Recomputed when entering a stage (cheap localStorage read).
  // NOTE: must stay ABOVE the early returns below — hooks can't run conditionally.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const usedTopics = useMemo(() => getCreatorUsedTopics(), [currentStage]);

  if (!ready) return (
    <div className="flex h-screen w-full items-center justify-center bg-[rgb(var(--bg))]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={28} className="animate-spin text-[#2563eb]" />
        <p className="text-sm font-semibold text-faint">Loading MagicScript…</p>
      </div>
    </div>
  );
  if (!user) return null;

  const lowCredits = user.credits < LOW_CREDIT_THRESHOLD;
  const hasTopics  = batchSize === 1 ? !!topic : selectedTopics.length > 0;

  // ── Sidebar progress ───────────────────────────────────────────────────────
  const visualApproved = [];
  if (keyword)                                          visualApproved.push(1);
  if ((topic || selectedTopics.length > 0) && contentType) visualApproved.push(2);
  // Stage 3 is "approved" only once verification actually finished this run.
  if (verifyStatus === "done" && verifyResults.some(r => r.passed)) visualApproved.push(3);
  // Stage 4 approved once scripts exist for this run.
  if (pipeStatus === "done" && finalReels.length > 0)   visualApproved.push(4);
  // Stage 5 approved only on a real finished run (not a stale persisted flag).
  if (finalDone && pipeStatus === "done" && finalReels.length > 0) visualApproved.push(5);

  // currentStage is authoritative now that all 5 stages are real & navigable.
  const visualCurrent = currentStage;

  // ── Demo mode mock data ──────────────────────────────────────────────────────
  const DEMO_SCRIPT_A = `[HOOK — 0-3s]\nSCRIPT: "Everyone asks: does intermittent fasting actually improve sugar numbers? Here's what 47 studies actually say."\nTEXT OVERLAY: "47 Studies Analyzed"\n\n[RETENTION LOOP — 3-15s]\nSCRIPT: "Research shows intermittent fasting triggers a metabolic reset — your liver stops producing excess glucose, and your cells become 44% more insulin-sensitive within 72 hours."\nTEXT OVERLAY: "44% More Insulin-Sensitive"\n\n[CREDIBILITY — 15-25s]\nSCRIPT: "A 2023 New England Journal study followed 312 diabetic patients through religious fasts. Morning glucose dropped an average of 22 points within 3 days of clean fasting."\nTEXT OVERLAY: "NEJM 2023 — 312 Patients"\n\n[CTA — 25-30s]\nSCRIPT: "If you have diabetes and want to fast safely — follow me for the exact protocol your doctor should be giving you."\nTEXT OVERLAY: "Follow for the Safe Protocol"`;

  const DEMO_REELS = [
    { topic: "Does fasting actually improve sugar numbers? What 47 studies reveal", contentType: "myth-buster",   scripts: { education: DEMO_SCRIPT_A }, medCheck: { evidence_score: 74, safety_status: "safe",    pubmed_references: ["NEJM 2023 — Intermittent fasting and glycemic control"] } },
    { topic: "The 16-hour fasting window that reverses insulin resistance — clinical evidence", contentType: "education-drop", scripts: { education: DEMO_SCRIPT_A.replace(/fasting/g, "16h fasting") }, medCheck: { evidence_score: 82, safety_status: "safe",    pubmed_references: ["Diabetes Care 2022", "J Clin Endocrinol 2021"] } },
    { topic: "Ramadan fasting is harming more diabetics than it helps — safe protocol inside", contentType: "contrarian",     scripts: { education: DEMO_SCRIPT_A.replace(/fasting/g, "Ramadan fasting") }, medCheck: { evidence_score: 61, safety_status: "caution", pubmed_references: ["WHO Ramadan Guidelines 2023"] } },
  ];

  const DEMO_TOPICS = [
    { title: DEMO_REELS[0].topic, tabId: "myth",       pubmed_evidence_score: 74, pubmed_verified: true, medCheck: DEMO_REELS[0].medCheck },
    { title: DEMO_REELS[1].topic, tabId: "clinical",   pubmed_evidence_score: 82, pubmed_verified: true, medCheck: DEMO_REELS[1].medCheck },
    { title: DEMO_REELS[2].topic, tabId: "contrarian", pubmed_evidence_score: 61, pubmed_verified: true, medCheck: DEMO_REELS[2].medCheck },
  ];

  const DEMO_VERIFY = DEMO_TOPICS.map(t => ({
    title: t.title, tabId: t.tabId,
    evidenceScore: t.pubmed_evidence_score,
    evidenceLabel: t.pubmed_evidence_score >= 70 ? "Strong Evidence" : "Moderate Evidence",
    passed: true, medCheck: t.medCheck,
  }));

  // Auto-switch into Demo Mode when a live backend call falls back (no key,
  // quota exceeded, model timeout). Lightweight flag flip — preserves the user's
  // current keyword, stage, and already-loaded data (unlike the manual toggle,
  // which resets everything to start a fresh demo walkthrough).
  function maybeAutoEnableDemo(mode, reason) {
    if ((mode === "demo" || mode === "fallback") && !demoMode) {
      setDemoMode(true);
      setAutoDemoReason(reason || "Live generation unavailable — switched to Demo Mode");
    }
  }

  function handleToggleDemoMode() {
    if (!demoMode) {
      // Enter demo — pre-fill keyword and jump to Stage 2 so user can walk the flow
      setDemoMode(true);
      setKeyword("Weight Loss");
      setTopic(""); setContentType(null);
      setSelectedBucket(null); setCustomWord(""); setManualTopic("");
      setMedCheck(null); setScripts(null); setFinalReels([]);
      setSelectedTopics([]); setVerifyStatus("idle"); setVerifyResults([]);
      setPipeStatus("idle"); setActiveStep(0);
      setCurrentStage(2);
    } else {
      // Exit demo — full reset
      setDemoMode(false);
      setAutoDemoReason(null);
      handleReset();
    }
  }

  function handleGoToStage(id) {
    if (id === 1)                                          { setCurrentStage(1); return; }
    if (id === 2 && keyword)                               { setCurrentStage(2); return; }
    if (id === 3 && (topic || selectedTopics.length > 0))  { setCurrentStage(3); return; }
    if (id === 4 && (finalReels.length > 0 || pipeStatus === "running")) { setCurrentStage(4); return; }
    if (id === 5 && finalReels.length > 0 && pipeStatus === "done")      { setCurrentStage(5); return; }
  }

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSendToStage2 = (kw) => {
    setKeyword(kw); setTopic(""); setContentType(null);
    setMedCheck(null); setScripts(null); setAwaitingMed(false); setMedBlocked(false);
    setPipeStatus("idle"); setCurrentStage(2); setSessionId(null);
    // Compute Tamil context and buffer size for Stage 2 enrichment
    try { setTamilContext(getCurrentTamilContext()); } catch {}
    saveSession({ keyword: kw, bucket: selectedBucket, stageReached: 1, stageLabel: "Topic Discovery", status: "in_progress", selectedTopics: [], verifiedCount: 0, removedCount: 0, reels: [], selectedContentTypes });
  };

  const handleSendToStage3 = (topicsOrTitle, tabIdOrPool, topicsDataPool) => {
    let topics = [];
    if (Array.isArray(topicsOrTitle)) {
      setSelectedTopics(topicsOrTitle);
      setTopic(topicsOrTitle[0]?.title ?? "");
      setContentType(TAB_TO_CONTENT_TYPE[topicsOrTitle[0]?.tabId] ?? "myth-buster");
      topics = topicsOrTitle;
      if (tabIdOrPool && typeof tabIdOrPool === "object" && !Array.isArray(tabIdOrPool)) setStage2Pool(tabIdOrPool);
    } else {
      setTopic(topicsOrTitle);
      setSelectedTopics([{ title: topicsOrTitle, tabId: tabIdOrPool }]);
      setContentType(TAB_TO_CONTENT_TYPE[tabIdOrPool] ?? "myth-buster");
      topics = [{ title: topicsOrTitle, tabId: tabIdOrPool }];
      if (topicsDataPool) setStage2Pool(topicsDataPool);
    }
    setCurrentStage(3); setPreviewTopic(null);
    setMedCheck(null); setScripts(null); setFinalReels([]); setFinalDone(false);
    setAwaitingMed(false); setMedBlocked(false); setPipeStatus("idle");
    setVerifyStatus("idle"); setVerifyResults([]); setStage2Pool(null); setRunSpend(0);
    saveSession({ stageReached: 2, stageLabel: "Topic Validation", status: "in_progress", selectedTopics: topics.map(t => t.title ?? t), batchSize: topics.length });
  };

  const handleReset = () => {
    setKeyword(""); setTopic(""); setContentType(null);
    setSelectedBucket(null); setCustomWord(""); setManualTopic("");
    setSelectedContentTypes(["auto"]);
    setMedCheck(null); setScripts(null); setPipeStatus("idle"); setActiveStep(0);
    setAwaitingMed(false); setMedBlocked(false); setPreviewTopic(null);
    setBatchSize(1); setSelectedTopics([]); setFinalReels([]);
    setReelProgress({ current: 0, total: 0 }); setVerifyStatus("idle"); setVerifyResults([]);
    setStage2Pool(null); setSessionId(null); setCurrentStage(1); setDemoMode(false);
    setStage2TopicsCache(null); setAutoDemoReason(null); setRunSpend(0);
  };

  const getHeaders = () => {
    if (typeof window === "undefined") return { "Content-Type": "application/json" };
    const gk = localStorage.getItem("V_KEY_GOOGLE") || localStorage.getItem("ms_gemini_key");
    const ak = localStorage.getItem("V_KEY_CLAUDE") || localStorage.getItem("ms_anthropic_key");
    const ok = localStorage.getItem("ms_openai_key");
    const stagePref = (() => { try { const p = JSON.parse(localStorage.getItem("REELS_MODEL_PREFS_v1") || "{}"); return p[4] ?? p[3] ?? "claude"; } catch { return "claude"; } })();
    return { "Content-Type": "application/json", ...(gk && { "x-client-gemini-key": gk }), ...(ak && { "x-client-anthropic-key": ak }), ...(ok && { "x-client-openai-key": ok }), "x-preferred-model": stagePref };
  };

  const flattenPool = (pool) => {
    if (!pool) return [];
    return [
      ...(pool.myth?.false_myth ?? []).map(t => ({ ...t, _cat: "myth" })),
      ...(pool.myth?.true_myth  ?? []).map(t => ({ ...t, _cat: "myth" })),
      ...(pool.problem    ?? []).map(t => ({ ...t, _cat: "problem"    })),
      ...(pool.faq        ?? []).map(t => ({ ...t, _cat: "faq"        })),
      ...(pool.contrarian ?? []).map(t => ({ ...t, _cat: "contrarian" })),
      ...(pool.clinical   ?? []).map(t => ({ ...t, _cat: "clinical"   })),
    ].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  };

  const handleVerify = async () => {
    setVerifyStatus("running"); setVerifyResults([]);
    setMedVerificationReports([]); setSelectedReportIdx(0); setVerifyLoadStep(0);

    // ── Demo mode: instant mock results + rich report, no API ──
    if (demoMode) {
      const topics = selectedTopics.length > 0 ? selectedTopics : DEMO_TOPICS;
      const MOCK_SOURCES = [
        { title: "Intermittent fasting and glycaemic control in type 2 diabetes: A systematic review", source: "PubMed", year: 2023, study_type: "Systematic Review", tier: "green", url: "https://pubmed.ncbi.nlm.nih.gov/", pmid: "36521234" },
        { title: "Time-restricted eating reduces HbA1c: RCT evidence from South Asian patients", source: "PubMed", year: 2022, study_type: "RCT", tier: "accent", url: "https://pubmed.ncbi.nlm.nih.gov/", pmid: "35102847" },
        { title: "Meta-analysis: Fasting protocols and insulin resistance reversal", source: "PubMed", year: 2023, study_type: "Meta-analysis", tier: "green", url: "https://pubmed.ncbi.nlm.nih.gov/", pmid: "37004521" },
        { title: "Cochrane review: Dietary interventions for type 2 diabetes management", source: "Cochrane", year: 2022, study_type: "Systematic Review", tier: "green", url: "https://www.cochranelibrary.com/", pmid: null },
        { title: "WHO global report: Dietary patterns and metabolic disease prevention", source: "WHO", year: 2023, study_type: "Clinical Guideline", tier: "accent", url: "https://www.who.int/", pmid: null },
      ];
      const mockReport = (t, i) => ({
        topic_title: t.title, key_finding: "47 peer-reviewed studies including 3 meta-analyses confirm structured intermittent fasting significantly improves fasting glucose and HbA1c in Type 2 diabetics when clinician-supervised. Tamil Nadu patients show equivalent outcomes with rice-adjusted meal timing.",
        evidence_score: DEMO_VERIFY[i % DEMO_VERIFY.length]?.evidenceScore ?? 74, evidence_grade: i % 2 === 0 ? "A" : "B",
        safe_to_publish: true, ai_confidence: 90, ev_strength: 88, consensus: 92, quality: 87, misinfo_risk: 32,
        sources: MOCK_SOURCES, databases_searched: ["PubMed", "NIH", "Cochrane", "WHO", "CDC"],
        papers_found: 47, study_types_found: ["Systematic Review", "Meta-analysis", "RCT", "Clinical Guideline"],
        claim_accuracy: 90, claim_text: t.title,
        misinfo_flags: [],
        safety_checks: [
          { label: "No dangerous cure claims detected", passed: true },
          { label: "Disclaimer language verified",       passed: true },
          { label: "PubMed sources confirmed",           passed: true },
        ],
        guideline_match: { org: "ICMR", title: "ICMR Clinical Practice Guidelines for Type 2 Diabetes", year: 2023 },
        drug_flags: null,
      });
      const results = topics.map((t, i) => ({
        title: t.title, tabId: t.tabId,
        evidenceScore: DEMO_VERIFY[i % DEMO_VERIFY.length]?.evidenceScore ?? 74,
        evidenceLabel: "Strong Evidence", passed: true,
        evidenceGrade: i % 2 === 0 ? "A" : "B", studyCount: 47,
        guidelineMatch: { badge: "ICMR Guideline", org: "ICMR" }, drugFlags: null,
        medCheck: DEMO_VERIFY[i % DEMO_VERIFY.length]?.medCheck ?? DEMO_REELS[0].medCheck,
        medVerificationReport: mockReport(t, i),
      }));
      await ms(1200); // give loading steps time to animate
      setVerifyResults(results);
      setMedVerificationReports(results.map(r => r.medVerificationReport).filter(Boolean));
      setVerifyStatus("done");
      setMedCheck(results[0].medCheck);
      return;
    }

    const allTopics = selectedTopics.length > 0 ? selectedTopics : [{ title: topic, tabId: "myth" }];
    const headers   = getHeaders();

    // ── Try enhanced Stage 3 route first, fall back to per-topic medcheck ──
    // Hard cap the request at 45s — PubMed/LLM can hang; never leave the user
    // stuck on "Building verification report…" forever.
    try {
      const flatBuffer = bufferPool.length > 0 ? bufferPool : flattenPool(stage2Pool);
      const ctrl = new AbortController();
      const timeoutId = setTimeout(() => ctrl.abort(), 45000);
      let res;
      try {
        res = await fetch("/api/reels/stage3-medcheck", {
          method: "POST",
          headers,
          signal: ctrl.signal,
          body: JSON.stringify({
            topics:     allTopics,
            bufferPool: flatBuffer.slice(0, 30), // cap buffer at 30 candidates
            batchSize:  allTopics.length,
            keyword,
          }),
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (res.ok) {
        const data = await res.json();
        // If the medcheck backend fell back, switch the app into Demo Mode too.
        maybeAutoEnableDemo(data.mode, data.error ? `Medical check: ${data.error}` : "Medical verification fell back to sample data");
        // Map stage3 response to existing verifyResults format
        const results = (data.verifiedTopics ?? []).map((t) => ({
          title:         t.title,
          tabId:         t.tabId ?? t._cat ?? "myth",
          evidenceScore: t.evidenceScore ?? t.pubmed_evidence_score ?? 0,
          evidenceLabel: t.evidenceLabel ?? (t.evidenceScore >= 70 ? "Strong Evidence" : t.evidenceScore >= 40 ? "Moderate Evidence" : "Weak Evidence"),
          passed:        t.passed ?? (t.status === "passed" || t.status === "weak"),
          evidenceGrade: t.evidenceGrade ?? "B",
          studyCount:    t.studyCount ?? 0,
          guidelineMatch:t.guidelineMatch ?? null,
          drugFlags:     t.drugFlags ?? null,
          medCheck:      t.medCheck ?? null,
          medVerificationReport: t.medVerificationReport ?? null, // ← carry the rich report through (was dropped)
          isReplacement: !!t._replacedTopic,
          autoReplaced:  false,
        }));

        // Mark the originals that were replaced
        const replacedTitles = new Set((data.replacements ?? []).map(r => r.original?.title).filter(Boolean));
        const finalResults = results.map(r => replacedTitles.has(r.title) ? { ...r, autoReplaced: true } : r);

        setVerifyResults(finalResults); setVerifyStatus("done");
        const firstPassed = finalResults.find(r => r.passed);
        if (firstPassed?.medCheck) setMedCheck(firstPassed.medCheck);
        const reports = finalResults.map(r => r.medVerificationReport).filter(Boolean);
        setMedVerificationReports(reports);
        const fp = finalResults.filter(r => r.passed).length;
        const fr = finalResults.filter(r => !r.passed && !r.autoReplaced).length;
        const ar = finalResults.filter(r => r.isReplacement && r.passed).length;
        saveSession({ stageReached: 3, stageLabel: "Medical Check", status: "in_progress", verifiedCount: fp, removedCount: fr, autoReplaced: ar });
        return;
      }
    } catch (e) {
      console.warn("[handleVerify] stage3-medcheck failed, falling back:", e.message);
    }

    // ── Fallback: per-topic medcheck (original logic) ──
    let results = await Promise.all(allTopics.map(async ({ title: tTitle, tabId }) => {
      try {
        const ct  = TAB_TO_CONTENT_TYPE[tabId] ?? contentType;
        const res = await fetch("/api/reels/medcheck", { method: "POST", headers, body: JSON.stringify({ topic: tTitle, contentType: ct, keyword }) });
        const d   = await res.json();
        const s   = d.evidence_score ?? 0;
        return { title: tTitle, tabId, evidenceScore: s, evidenceLabel: s >= 70 ? "Strong Evidence" : s >= 40 ? "Moderate Evidence" : "Weak Evidence", passed: s >= 40, medCheck: d };
      } catch {
        return { title: tTitle, tabId, evidenceScore: 0, evidenceLabel: "Check failed", passed: false, medCheck: null };
      }
    }));

    const removedCount = results.filter(r => !r.passed).length;
    if (removedCount > 0 && stage2Pool) {
      const selectedTitles = new Set(allTopics.map(t => t.title));
      const candidates = flattenPool(stage2Pool).filter(t => !selectedTitles.has(t.title) && (t.pubmed_evidence_score ?? 100) >= 40).slice(0, removedCount * 3);
      if (candidates.length > 0) {
        const replacements = await Promise.all(candidates.map(async (t) => {
          const ct = TAB_TO_CONTENT_TYPE[t._cat] ?? contentType;
          try {
            const res = await fetch("/api/reels/medcheck", { method: "POST", headers, body: JSON.stringify({ topic: t.title, contentType: ct }) });
            const d   = await res.json();
            const s   = d.evidence_score ?? 0;
            return { title: t.title, tabId: t._cat, evidenceScore: s, evidenceLabel: s >= 70 ? "Strong Evidence" : s >= 40 ? "Moderate Evidence" : "Weak Evidence", passed: s >= 40, medCheck: d, isReplacement: true };
          } catch { return null; }
        }));
        const valid = replacements.filter(Boolean).filter(r => r.passed).slice(0, removedCount);
        if (valid.length > 0) {
          results = results.map(r => (!r.passed) ? { ...r, autoReplaced: true } : r);
          results.push(...valid);
        }
      }
    }

    setVerifyResults(results); setVerifyStatus("done");
    const fp = results.filter(r => r.passed).length;
    const fr = results.filter(r => !r.passed && !r.autoReplaced).length;
    const ar = results.filter(r => r.isReplacement && r.passed).length;
    setMedVerificationReports(results.map(r => r.medVerificationReport).filter(Boolean));
    saveSession({ stageReached: 3, stageLabel: "Medical Check", status: "in_progress", verifiedCount: fp, removedCount: fr, autoReplaced: ar, verifyResults: results.map(r => ({ title: r.title, evidenceScore: r.evidenceScore, passed: r.passed })) });
  };

  // Spend credits AND accumulate into the current run's running total (Stage 5).
  const chargeRun = (amount) => {
    spendCredit(amount);
    setRunSpend(prev => Math.round((prev + amount) * 10) / 10);
  };

  // Re-verify — re-runs medical verification and charges REVERIFY credits (model-scaled).
  // The first verification (initial "Verify Medical Claims" button) is free,
  // covered by the run cost charged at generation; re-running costs ~3 cr.
  const handleReverify = () => {
    chargeRun(reverifyCost(selectedModel));
    setMedVerificationReports([]); setSelectedReportIdx(0);
    handleVerify();
  };

  const handleGenerate = async () => {
    const topicsToGenerate = verifyResults.length > 0 ? verifyResults.filter(r => r.passed) : (selectedTopics.length > 0 ? selectedTopics : [{ title: topic, tabId: "myth" }]);
    if (!topicsToGenerate.length) return;

    setCurrentStage(4);
    setPipeStatus("running"); setActiveStep(0);
    setMedCheck(null); setScripts(null); setFinalReels([]);
    setAwaitingMed(false); setMedBlocked(false);
    setFinalDone(false);

    // ── Demo mode: animate steps then set pre-made scripts, no API ──
    if (demoMode) {
      const total = Math.min(topicsToGenerate.length, DEMO_REELS.length);
      setReelProgress({ current: 0, total });
      setScriptProgress({ current: 0, total, phase: "" });
      for (let step = 0; step <= 4; step++) {
        setActiveStep(step); await ms(180);
      }
      for (let i = 0; i < total; i++) {
        setReelProgress({ current: i + 1, total });
        setScriptProgress({ current: i + 1, total, phase: `Writing script ${i + 1} of ${total}…` });
        const reel = { ...DEMO_REELS[i], topic: topicsToGenerate[i]?.title ?? DEMO_REELS[i].topic };
        setFinalReels(prev => [...prev, reel]);
        if (i < total - 1) await ms(280);
      }
      setMedCheck(DEMO_REELS[0].medCheck);
      setPipeStatus("done");
      setScriptProgress({ current: total, total, phase: "" });
      chargeRun(reelRunCost(total, selectedModel));
      return;
    }

    const total   = topicsToGenerate.length;
    const headers = getHeaders();
    setReelProgress({ current: 0, total });
    setScriptProgress({ current: 0, total, phase: `Preparing ${total} script${total !== 1 ? "s" : ""}…` });

    // ── Try stage4-scripts (batch, structured) first ──
    try {
      // Steps: 0 expand → 1 audience → 2 medical (inherited from Stage 3, instant)
      // → 3 script generation (the actual long-running work — park the spinner here).
      setActiveStep(1); await ms(150);
      setActiveStep(2); await ms(150);
      setActiveStep(3); // Script Generation — spinner stays here during the fetch
      setScriptProgress({ current: 0, total, phase: `Generating ${total} script${total !== 1 ? "s" : ""} in parallel…` });

      const res = await fetch("/api/reels/stage4-scripts", {
        method: "POST",
        headers,
        body: JSON.stringify({
          verifiedTopics: topicsToGenerate,
          batchSize:      total,
          tamilContext,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // If script generation fell back, switch the app into Demo Mode too.
        maybeAutoEnableDemo(data.mode, "Script generation fell back to sample data");
        const scriptResults = data.scripts ?? [];
        setActiveStep(4); // Format & Polish

        for (let i = 0; i < scriptResults.length; i++) {
          const sr = scriptResults[i];
          setReelProgress({ current: i + 1, total });
          setScriptProgress({ current: i + 1, total, phase: `Script ${i + 1} of ${total} ready — ${sr.evidenceBadge ?? ""}` });
          const medCheckData = sr.topic?.medCheck ?? topicsToGenerate[i]?.medCheck ?? null;
          if (total === 1) setScripts(sr.scripts);
          if (i === 0 && medCheckData) setMedCheck(medCheckData);
          setFinalReels(prev => [...prev, {
            topic:       sr.topic?.title ?? topicsToGenerate[i]?.title ?? "",
            contentType: sr.topic?.tabId ? (TAB_TO_CONTENT_TYPE[sr.topic.tabId] ?? contentType) : contentType,
            scripts:     sr.scripts,
            medCheck:    medCheckData,
            evidenceBadge: sr.evidenceBadge ?? null,
            whatsappHook:  sr.whatsappHook ?? null,
            guidelineMatch: sr.guidelineMatch ?? null,
            drugFlags:     sr.drugFlags ?? null,
            qualityScore:  sr.qualityScore ?? null,
          }]);
          await ms(80);
        }

        setPipeStatus("done");
        setScriptProgress({ current: total, total, phase: "" });
        chargeRun(reelRunCost(total, selectedModel));
        return; // ← success — skip the fallback below
      }
    } catch (e) {
      console.warn("[handleGenerate] stage4-scripts failed, falling back:", e.message);
    }

    // ── Fallback: original per-topic sequential generation ──
    setScriptProgress({ current: 0, total, phase: "Using sequential generation…" });

    for (let i = 0; i < topicsToGenerate.length; i++) {
      const item   = topicsToGenerate[i];
      const tTitle = item.title;
      setReelProgress({ current: i + 1, total });
      setScriptProgress({ current: i + 1, total, phase: `Writing script ${i + 1} of ${total}…` });
      setActiveStep(0); await ms(200);
      setActiveStep(1); await ms(200);

      let medCheckResult = item.medCheck ?? null;
      if (medCheckResult) {
        setMedCheck(medCheckResult); setActiveStep(2); await ms(150); setActiveStep(3); await ms(150);
      } else {
        setActiveStep(2);
        try {
          const res = await fetch("/api/reels/medcheck", { method: "POST", headers, body: JSON.stringify({ topic: tTitle, contentType }) });
          const d   = await res.json();
          medCheckResult = d; setMedCheck(d); setActiveStep(3);
          if (total === 1) { setAwaitingMed(true); return; }
        } catch { setActiveStep(3); }
      }

      try {
        const summary = medCheckResult ? `Evidence: ${medCheckResult.evidence_score}/100. ${medCheckResult.safety_note ?? ""}` : "No medical data.";
        const res = await fetch("/api/reels/generate", { method: "POST", headers, body: JSON.stringify({ topic: tTitle, contentType, bucketId: selectedBucket, language: "english", evidenceSummary: summary, medCheck: medCheckResult }) });
        const d   = await res.json();
        setActiveStep(4); await ms(300);
        if (total === 1) setScripts(d.scripts);
        setFinalReels(prev => [...prev, { topic: tTitle, contentType, scripts: d.scripts, medCheck: medCheckResult }]);
      } catch {
        setFinalReels(prev => [...prev, { topic: tTitle, contentType, scripts: null, error: true }]);
      }
    }

    setPipeStatus("done");
    setScriptProgress({ current: total, total, phase: "" });
    chargeRun(reelRunCost(total, selectedModel));
    try {
      const sessions = JSON.parse(localStorage.getItem("ms_reels_sessions") || "[]");
      const s = sessionId ? sessions.find(x => x.id === sessionId) : sessions[0];
      if (s) {
        s.stageReached = 5; s.stageLabel = "Final Output"; s.status = "completed";
        s.updatedAt = new Date().toISOString();
        s.reels = topicsToGenerate.map(t => ({ topic: t.title, evidenceScore: t.medCheck?.evidence_score ?? null, shootStatus: "to_shoot" }));
        localStorage.setItem("ms_reels_sessions", JSON.stringify(sessions));
      }
    } catch {}
  };

  function ms(t) { return new Promise(r => setTimeout(r, t)); }

  // ── Derived evidence display ──────────────────────────────────────────────
  const evidenceScore = medCheck?.evidence_score ?? (verifyResults.length > 0 ? Math.round(verifyResults.filter(r => r.passed).reduce((a, r) => a + (r.evidenceScore ?? 0), 0) / Math.max(1, verifyResults.filter(r => r.passed).length)) : null);
  const safetySt      = medCheck?.safety_status ?? null;
  const sources       = (medCheck?.pubmed_references ?? []).map(r => r.split(" — ")[0]).slice(0, 4);
  const topicCount    = selectedTopics.length || 1;
  // From rich med verification report (Stage 3 bottom bar chips)
  const papersFound   = medVerificationReports[0]?.papers_found ?? null;
  const safeToPublish = medVerificationReports[0]?.safe_to_publish ?? null;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[rgb(var(--bg))]">

      {/* ── TOP NAV ── */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-4">
        <div className="flex items-center gap-3">
          <Logo size={26} href="/dashboard" />
          <div className="h-5 w-px bg-[rgb(var(--border))]" />
          <WorkspaceModeToggle />
        </div>
        <div className="flex items-center gap-2">
          {currentStage > 1 && <NewSessionButton onConfirm={handleReset} />}
          <NavActions />
        </div>
      </header>

      {/* ── BODY: 200px sidebar + 1fr content ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar — always 200px, always visible */}
        <ReelsLeftPanel
          currentStage={visualCurrent}
          approvedStages={visualApproved}
          onGoToStage={handleGoToStage}
          credits={user?.credits}
          demoMode={demoMode}
          onToggleDemoMode={handleToggleDemoMode}
        />

        {/* 1fr scrollable content area — bento grids live here */}
        <main className="tab-content-enter flex flex-1 flex-col overflow-hidden">
          <div
            ref={mainScrollRef}
            className={(currentStage === 1 || currentStage === 2)
              ? "flex-1 overflow-hidden flex flex-col p-5 pb-[52px]"
              : "flex-1 overflow-y-auto p-5 pb-[80px]"}
          >

            {/* ── Auto Demo-Mode notice — live call fell back, app switched to demo ── */}
            {autoDemoReason && demoMode && (
              <div className="mb-3 shrink-0 flex items-start gap-2.5 rounded-lg border border-amber-400/40 bg-amber-50 dark:bg-amber-500/10 px-3.5 py-2.5">
                <span className="text-base leading-none mt-0.5">🟡</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold text-amber-700 dark:text-amber-300">Switched to Demo Mode automatically</p>
                  <p className="text-[11px] text-amber-700/90 dark:text-amber-200/80 mt-0.5 leading-relaxed">
                    {autoDemoReason}. Topics, medical checks and scripts shown are non-verified samples. To get live,
                    keyword-specific results, switch the model (Claude / ChatGPT) or fix the API key, then turn the
                    <span className="font-semibold"> Live API</span> switch back on.
                  </p>
                </div>
                <button onClick={() => setAutoDemoReason(null)}
                  className="shrink-0 rounded px-1.5 text-[11px] font-bold text-amber-700/70 dark:text-amber-300/70 hover:text-amber-700 dark:hover:text-amber-300">✕</button>
              </div>
            )}

            {/* ════════════════════════════════════════════════════════
                STAGE 1 — Topic Discovery
                Bento: [2fr main card] [1fr batch + evidence + sources]
            ════════════════════════════════════════════════════════ */}
            <AnimatePresence>
              {currentStage === 1 && (
                <motion.div key="s1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="h-full flex flex-col">

                  {/* Stage eyebrow */}
                  <div className="mb-3 shrink-0">
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] dark:text-[#888]">Stage 1 of 5 — Topic Discovery</p>
                    <h1 className="font-display text-xl font-bold">Choose your keyword</h1>
                    <p className="text-[12px] text-faint">Select an input mode on the right, then pick a bucket or type your topic</p>
                  </div>

                  {/* 2fr + 1fr bento */}
                  <div className="flex-1 min-h-0 overflow-hidden grid gap-[10px]" style={{ gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gridTemplateRows: "1fr" }}>

                    {/* Left 2fr — main action card */}
                    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5 flex flex-col h-full overflow-hidden">
                      {/* Dynamic label */}
                      <p className="text-[10px] font-bold uppercase tracking-widest text-faint shrink-0 mb-2">
                        {{ bucket: "Content Buckets", manual: "Manual Topic", link: "Reference Link" }[inputMode]}
                      </p>
                      {/* Bucket / manual / reference input */}
                      <div className="flex-1 min-h-0 overflow-hidden">
                      <Stage1Center
                        inputMode={inputMode}
                        selectedBucket={selectedBucket}
                        onSelectBucket={setSelectedBucket}
                        customWord={customWord}
                        onCustomWord={setCustomWord}
                        manualTopic={manualTopic}
                        onManualTopic={setManualTopic}
                        referenceLink={referenceLink}
                        onReferenceLink={setReferenceLink}
                        onSendToStage2={handleSendToStage2}
                      />
                      </div>
                      {/* Batch Size — bottom of left card */}
                      <div style={{ borderTop: "0.5px solid rgb(var(--border))", margin: "8px 0 8px", flexShrink: 0 }} />
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px", flexShrink: 0 }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "rgb(var(--text))" }}>Batch Size</span>
                          <span style={{ fontSize: 11, color: "rgb(var(--text-faint))" }}>
                            {batchSize} reel{batchSize !== 1 ? "s" : ""} · <span style={{ fontWeight: 700, color: "rgb(var(--accent))" }}>{reelRunCost(batchSize, selectedModel)} cr</span>
                            {selectedModel !== "gemini" && selectedModel !== "demo" ? ` (${selectedModel} ×${selectedModel === "claude" ? "1.5" : "1.3"})` : ""}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          {[1, 3, 5, 10].map(n => (
                            <button key={n} type="button" onClick={() => setBatchSize(n)} style={{
                              display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                              padding: "4px 12px", borderRadius: 6, lineHeight: 1.1,
                              fontSize: 13, fontWeight: batchSize === n ? 600 : 500,
                              cursor: "pointer", transition: "all 150ms ease",
                              background: batchSize === n ? "rgb(var(--accent))" : "rgb(var(--panel-soft))",
                              color: batchSize === n ? "#fff" : "rgb(var(--text-faint))",
                              border: batchSize === n ? "none" : "0.5px solid rgb(var(--border))",
                            }}>
                              <span>{n === 1 ? "×1" : `×${n}`}</span>
                              <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.85 }}>{reelRunCost(n, selectedModel)}cr</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right 1fr — Input Mode + Content Type */}
                    <div className="flex flex-col gap-2 h-full overflow-hidden">

                      {/* Card 1 — Input Mode selector */}
                      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3 space-y-1.5 shrink-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-faint px-1 pb-0.5">Input Mode</p>
                        {INPUT_OPTIONS.map(opt => {
                          const isActive = inputMode === opt.id;
                          return (
                            <button key={opt.id} type="button"
                              onClick={() => { setInputMode(opt.id); setSelectedBucket(null); setCustomWord(""); }}
                              style={{
                                padding: "10px 12px",
                                borderRadius: 8,
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                cursor: "pointer",
                                textAlign: "left",
                                border: isActive ? "0.5px solid rgba(37,99,235,0.25)" : "0.5px solid rgb(var(--border))",
                                background: isActive ? "rgba(37,99,235,0.08)" : "rgb(var(--bg-soft))",
                                transition: "background 0.15s, border-color 0.15s",
                              }}
                            >
                              <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{opt.icon}</span>
                              <div style={{ minWidth: 0 }}>
                                <p style={{
                                  fontSize: 12,
                                  fontWeight: isActive ? 600 : 400,
                                  color: isActive ? "#2563eb" : "rgb(var(--text-soft))",
                                  lineHeight: 1.3,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}>{opt.label}</p>
                                <p style={{
                                  fontSize: 10,
                                  color: "rgb(var(--text-faint))",
                                  lineHeight: 1.3,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}>{opt.description}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Card 2 — Content Type */}
                      {(() => {
                        const CONTENT_TYPES = [
                          { id: "myth",       icon: "⚡", label: "Myth",         sub: "Debunk false beliefs · high share",        color: "#f97316" },
                          { id: "problem",    icon: "🔍", label: "Problem + Fix", sub: "Real problem · proven solution",           color: "#2563eb" },
                          { id: "faq",        icon: "❓", label: "FAQ",           sub: "Top searched questions",                   color: "#7c3aed" },
                          { id: "contrarian", icon: "🎯", label: "Contrarian",    sub: "Challenge mainstream · spark debate",      color: "#ef4444" },
                          { id: "clinical",   icon: "🩺", label: "Clinical",      sub: "Science-heavy · authority building",       color: "#16a34a" },
                          { id: "auto",       icon: "✨", label: "Auto Pick",     sub: "AI picks best types for your bucket",      color: "#16a34a", dashed: true },
                        ];

                        const toggleType = (id) => {
                          if (id === "auto") {
                            setSelectedContentTypes(["auto"]);
                            return;
                          }
                          setSelectedContentTypes(prev => {
                            const withoutAuto = prev.filter(t => t !== "auto");
                            if (withoutAuto.includes(id)) {
                              // Deselecting — don't allow empty
                              const next = withoutAuto.filter(t => t !== id);
                              return next.length === 0 ? withoutAuto : next;
                            }
                            return [...withoutAuto, id];
                          });
                        };

                        const topicCountLabel = (() => {
                          if (selectedContentTypes.includes("auto")) return "~15 topics";
                          const n = selectedContentTypes.length;
                          return `${n * 5} topic${n * 5 !== 1 ? "s" : ""}`;
                        })();

                        const showWarning = batchSize >= 5
                          && !selectedContentTypes.includes("auto")
                          && selectedContentTypes.length < 3;

                        return (
                          <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 flex-1 min-h-0 overflow-y-auto">
                            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "rgb(var(--text))", textTransform: "uppercase", marginBottom: 2 }}>Content Type</p>
                            <p style={{ fontSize: 11, color: "rgb(var(--text-faint))", marginBottom: 8 }}>Choose what kind of content to make</p>

                            {CONTENT_TYPES.map(ct => {
                              const isSelected = selectedContentTypes.includes(ct.id);
                              return (
                                <button
                                  key={ct.id}
                                  type="button"
                                  onClick={() => toggleType(ct.id)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    width: "100%",
                                    padding: "6px 8px",
                                    borderRadius: 8,
                                    marginBottom: 4,
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "all 150ms ease",
                                    background: isSelected ? ct.color + (ct.dashed ? "0f" : "14") : "rgb(var(--bg-soft))",
                                    border: isSelected
                                      ? `0.5px ${ct.dashed ? "dashed" : "solid"} ${ct.color}4d`
                                      : "0.5px solid rgb(var(--border))",
                                  }}
                                >
                                  <span style={{ fontSize: 16, width: 20, textAlign: "center", flexShrink: 0, color: isSelected ? ct.color : "rgb(var(--text-faint))" }}>
                                    {ct.icon}
                                  </span>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 12, fontWeight: 500, color: isSelected ? ct.color : "rgb(var(--text))", lineHeight: 1.3, margin: 0 }}>{ct.label}</p>
                                    <p style={{ fontSize: 10, color: "rgb(var(--text-faint))", lineHeight: 1.3, margin: 0 }}>{ct.sub}</p>
                                  </div>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: ct.color, visibility: isSelected ? "visible" : "hidden", flexShrink: 0 }}>✓</span>
                                </button>
                              );
                            })}

                            {/* Live count + optional warning */}
                            <div style={{ marginTop: 8, paddingTop: 8, borderTop: "0.5px solid rgb(var(--border))", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <span style={{ fontSize: 11, color: "rgb(var(--text-faint))" }}>Will generate:</span>
                              <span style={{ fontSize: 11, fontWeight: 600, color: "rgb(var(--text))" }}>{topicCountLabel}</span>
                            </div>
                            {showWarning && (
                              <div style={{ marginTop: 6, display: "flex", alignItems: "flex-start", gap: 6 }}>
                                <span style={{ fontSize: 12, color: "#d97706", flexShrink: 0 }}>⚠</span>
                                <span style={{ fontSize: 11, color: "#d97706" }}>Select 3+ types for a ×{batchSize} batch</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ════════════════════════════════════════════════════════
                STAGE 2 — Topic Validation
                Bento: [2fr topic matrix] [1fr topic intelligence]
            ════════════════════════════════════════════════════════ */}
            <AnimatePresence>
              {currentStage === 2 && keyword && (
                <motion.div key="s2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="h-full flex flex-col">

                  {/* Stage header — frozen above the bento grid */}
                  <div className="mb-3 shrink-0">
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] dark:text-[#888]">Stage 2 of 5 — Topic Validation</p>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h1 className="font-display text-xl font-bold">Select your topic angle</h1>
                      <div className="flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] px-2.5 py-1">
                        <Clapperboard size={11} className="shrink-0 text-[rgb(var(--accent))]" />
                        <span className="text-[12px] font-bold text-[rgb(var(--accent))]">{keyword}</span>
                        <button onClick={() => { setKeyword(""); setCurrentStage(1); }} className="text-[10px] text-faint underline transition hover:text-soft">Change</button>
                      </div>
                    </div>
                    <p className="text-[12px] text-faint mt-0.5">Doctor Farmer validated — choose the highest scoring idea for your audience</p>
                  </div>

                  {/* Bento grid — fills remaining height; left frozen, right scrolls */}
                  <div className="flex-1 min-h-0 grid gap-[10px]" style={{ gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)" }}>

                    {/* Left 2fr — frozen, never scrolls, CTA pinned at bottom */}
                    <div className="h-full overflow-hidden flex flex-col min-h-0">
                      <Stage2TopicMatrix
                        topic={keyword}
                        bucket={selectedBucket}
                        batchSize={batchSize}
                        selectedContentTypes={selectedContentTypes}
                        usedTopics={usedTopics}
                        onSendToStage3={handleSendToStage3}
                        onTopicPreview={setPreviewTopic}
                        onBufferPoolReady={setBufferPool}
                        demoMode={demoMode}
                        cachedData={
                          stage2TopicsCache?.signature === `${keyword}|${(selectedContentTypes || []).join(",")}|${demoMode ? "demo" : "live"}`
                            ? stage2TopicsCache
                            : null
                        }
                        onDataLoaded={(topics, signals, mode, fallbackReason) => {
                          setStage2TopicsCache({
                            signature:      `${keyword}|${(selectedContentTypes || []).join(",")}|${demoMode ? "demo" : "live"}`,
                            topics,
                            level1_signals: signals,
                            mode,
                            fallback_reason: fallbackReason,
                          });
                          // Live call fell back → switch the whole app into Demo Mode.
                          maybeAutoEnableDemo(mode, fallbackReason);
                        }}
                        className="h-full"
                      />
                    </div>

                    {/* Right 1fr — independently scrollable */}
                    <div className="h-full overflow-y-auto flex flex-col gap-3"
                      style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,0,0,0.15) transparent", background: isDark ? undefined : "#f8f7fc" }}>
                      <div className="rounded-xl bg-[rgb(var(--panel))] px-3 py-2.5 shrink-0"
                        style={isDark ? { border: "1px solid rgb(var(--border))" } : { background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.12)" }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest"
                          style={{ color: isDark ? "rgb(var(--text-faint))" : "#6b7280" }}>Topic Intelligence</p>
                        <p className="text-[11px] mt-0.5"
                          style={{ color: isDark ? "rgb(var(--text-faint))" : "#4b5563" }}>Doctor Farmer analysis &amp; signal breakdown</p>
                      </div>
                      {previewTopic ? (
                        <TopicInsightPanel preview={previewTopic} />
                      ) : (
                        <div className="flex flex-col items-center justify-center rounded-xl bg-[rgb(var(--panel))] py-12 text-center shrink-0"
                          style={isDark ? { border: "1px solid rgb(var(--border))" } : { background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.12)" }}>
                          <div className="mb-2 text-2xl">📊</div>
                          <p className="text-xs font-semibold text-soft">Awaiting topic</p>
                          <p className="mt-1 text-[10px] px-4" style={{ color: isDark ? "rgb(var(--text-faint))" : "#4b5563" }}>Select a topic to see Doctor Farmer analysis</p>
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ════════════════════════════════════════════════════════
                STAGE 3 — Med Quick-Check + Rich Verification Report
            ════════════════════════════════════════════════════════ */}
            <AnimatePresence>
              {currentStage === 3 && (
                <motion.div key="s3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>

                  {/* Stage eyebrow + breadcrumb */}
                  <div className="mb-4">
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] dark:text-[#888]">Stage 3 of 5 — Med Quick-Check</p>
                    <div className="flex items-center justify-between gap-2">
                      <h1 className="font-display text-xl font-bold">Medical Check &amp; Generate</h1>
                      {verifyStatus === "done" && (
                        <button onClick={handleReverify} className="flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-1.5 text-[11px] font-semibold text-faint transition hover:text-soft hover:border-[#2563eb]/30">
                          🔄 Re-verify ({REELS_CREDITS.REVERIFY}cr)
                        </button>
                      )}
                    </div>
                    {/* Breadcrumb pills — shown after verification */}
                    {verifyStatus === "done" && medVerificationReports[0] && (
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        <button onClick={() => setCurrentStage(2)} style={{ background: "rgba(37,99,235,0.06)", border: "0.5px solid rgba(37,99,235,0.18)", color: "rgb(var(--accent))", borderRadius: 20, fontSize: 11, fontWeight: 600, padding: "3px 10px", cursor: "pointer" }}>
                          ← Stage 2
                        </button>
                        <span style={{ background: "rgba(37,99,235,0.10)", border: "0.5px solid rgba(37,99,235,0.22)", color: "rgb(var(--accent))", borderRadius: 20, fontSize: 11, fontWeight: 600, padding: "3px 10px" }}>
                          STAGE 3 — MED VERIFY
                        </span>
                        <span style={{ background: medVerificationReports[0].evidence_score >= 70 ? "rgba(22,163,74,0.08)" : "rgba(217,119,6,0.08)", border: medVerificationReports[0].evidence_score >= 70 ? "0.5px solid rgba(22,163,74,0.22)" : "0.5px solid rgba(217,119,6,0.22)", color: medVerificationReports[0].evidence_score >= 70 ? "#16a34a" : "#d97706", borderRadius: 20, fontSize: 11, fontWeight: 600, padding: "3px 10px" }}>
                          {medVerificationReports[0].evidence_score}% confidence
                        </span>
                      </div>
                    )}
                    {verifyStatus === "idle" && <p className="text-[12px] text-faint mt-0.5">PubMed verified · Education script · Straight-to-camera</p>}
                  </div>

                  {/* 2fr + 1fr bento */}
                  <div className="grid gap-3" style={{ gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)" }}>

                    {/* ── LEFT 2fr ─────────────────────────────────────────── */}
                    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5 space-y-4">

                      {/* Topic banner — always visible */}
                      {selectedTopics.length > 1 ? (
                        <div className="rounded-xl border border-violet-500/25 bg-violet-500/8 px-4 py-3">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-bold text-violet-400">🎬 {selectedTopics.length} Topics — Batch Generation</p>
                            <button onClick={() => { setSelectedTopics([]); setTopic(""); setCurrentStage(2); }} className="text-[11px] text-faint underline hover:text-soft">Change</button>
                          </div>
                          <div className="space-y-0.5">
                            {selectedTopics.map((t, i) => {
                              const ic = { myth: "⚡", problem: "🔍", faq: "❓", contrarian: "🎯", clinical: "🔬" };
                              return <p key={i} className="text-xs text-soft"><span className="mr-1.5 text-faint">{String(i+1).padStart(2,"0")}.</span><span className="mr-1">{ic[t.tabId] ?? "📌"}</span>{t.title}</p>;
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 rounded-xl border border-[#2563eb]/25 bg-[#2563eb]/8 px-4 py-3">
                          <Clapperboard size={15} className="shrink-0 text-[#2563eb]" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-faint">Validated topic</p>
                            <p className="text-sm font-bold text-[#2563eb] leading-snug">{topic}</p>
                          </div>
                          <button onClick={() => { setTopic(""); setContentType(null); setCurrentStage(2); }} className="shrink-0 text-[11px] text-faint underline transition hover:text-soft">Change</button>
                        </div>
                      )}

                      {/* Credits */}
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs text-faint"><Zap size={11} className="text-[#2563eb]" /> {user.credits} credits</span>
                        {lowCredits && <Link href="/dashboard/billing" className="text-xs font-semibold text-amber-400 underline">⚡ Upgrade</Link>}
                      </div>

                      {/* ── IDLE state ── */}
                      {verifyStatus === "idle" && (
                        <>
                          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                            onClick={handleVerify} disabled={!hasTopics}
                            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition disabled:opacity-40"
                            style={{ background: "linear-gradient(90deg,#22c55e,#16a34a)", color: "#0a101e" }}>
                            🔬 Verify Medical Claims ({selectedTopics.length > 1 ? selectedTopics.length : 1} topics) <ArrowRight size={14} />
                          </motion.button>
                          {(selectedTopics.length > 0 || topic) && (
                            <div className="space-y-2">
                              {(selectedTopics.length > 0 ? selectedTopics : [{ title: topic, tabId: "myth" }]).slice(0, 5).map((t, i) => {
                                const ps = t.pubmed_evidence_score; const hs = ps != null;
                                const sc2 = hs ? (ps >= 70 ? "#22c55e" : ps >= 40 ? "#f59e0b" : "#ef4444") : "#6b7280";
                                const sl  = hs ? (ps >= 70 ? "Strong" : ps >= 40 ? "Moderate" : "Weak") : "Unverified";
                                return (
                                  <div key={i} className="flex items-center gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-3 py-2.5">
                                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#2563eb]/10 text-[10px] font-bold text-[#2563eb]">{i+1}</span>
                                    <p className="flex-1 truncate text-xs font-medium text-soft">{t.title}</p>
                                    <div className="flex shrink-0 items-center gap-1.5">
                                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[rgb(var(--bg))]">
                                        <div className="h-full rounded-full" style={{ width: `${hs ? ps : 50}%`, background: sc2 }} />
                                      </div>
                                      <span className="text-[10px] font-semibold" style={{ color: sc2 }}>{sl}{hs ? ` · ${ps}` : ""}</span>
                                    </div>
                                  </div>
                                );
                              })}
                              <div className="flex items-center gap-2 pt-1">
                                <span className="flex items-center gap-1.5 rounded-lg border border-[#2563eb]/20 bg-[#2563eb]/8 px-2.5 py-1.5 text-[11px] font-semibold text-[#2563eb]"><Zap size={11} />{reelRunCost(selectedTopics.length||1, selectedModel)} cr · full run ({selectedTopics.length||1} reel{(selectedTopics.length||1)!==1?"s":""})</span>
                                <span className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-400">🏥 PubMed verified</span>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* ── RUNNING state — animated loading steps ── */}
                      {verifyStatus === "running" && (() => {
                        const STEPS = [
                          "Searching PubMed database…",
                          "Checking Cochrane Library…",
                          "Running retraction check…",
                          "Checking ICMR / WHO guidelines…",
                          "Analysing evidence quality…",
                          "Building verification report…",
                        ];
                        const ICONS = ["🔍","📚","🛡","📋","🤖","✓"];
                        return (
                          <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-4 space-y-1">
                            <p className="text-[11px] font-bold text-faint mb-3">Running medical verification pipeline…</p>
                            {STEPS.map((step, i) => (
                              <div key={i} className="flex items-center gap-3" style={{ opacity: i > verifyLoadStep ? 0.25 : 1, transition: "opacity 0.3s" }}>
                                {i < verifyLoadStep ? (
                                  <span className="text-[13px] text-emerald-500 shrink-0 w-5 text-center">✓</span>
                                ) : i === verifyLoadStep ? (
                                  <Loader2 size={13} className="animate-spin text-[#2563eb] shrink-0 flex-shrink-0" style={{ width: 20 }} />
                                ) : (
                                  <span className="text-[11px] text-faint shrink-0 w-5 text-center">○</span>
                                )}
                                <span className="text-[12px]" style={{ color: i === verifyLoadStep ? "rgb(var(--text))" : i < verifyLoadStep ? "rgb(var(--text-faint))" : "rgb(var(--text-faint))" }}>
                                  {ICONS[i]} {step}
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}

                      {/* ── DONE state — rich Medical Verification Report ── */}
                      {verifyStatus === "done" && (() => {
                        const passedCount = verifyResults.filter(r => r.passed).length;
                        const hardFail    = verifyResults.filter(r => !r.passed && !r.autoReplaced).length;
                        const swapped     = verifyResults.filter(r => r.isReplacement && r.passed).length;
                        const allFailed   = verifyResults.every(r => !r.passed && !r.autoReplaced);

                        // Determine which report to show
                        const activeReport = medVerificationReports[selectedReportIdx] || medVerificationReports[0];

                        // Topic selector (batch mode)
                        const showTopicSelector = medVerificationReports.length > 1;

                        return (
                          <div className="space-y-4">

                            {/* Summary bar */}
                            <div className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-3 py-2">
                              <p className="text-[11px] font-bold text-soft">🔬 Medical Verification Complete</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-emerald-400">✅ {passedCount} ready</span>
                                {swapped > 0 && <span className="text-[10px] font-bold text-violet-400">🔄 {swapped} swapped</span>}
                                {hardFail > 0 && <span className="text-[10px] font-bold text-rose-400">❌ {hardFail} removed</span>}
                              </div>
                            </div>

                            {/* Topic selector tabs (batch) */}
                            {showTopicSelector && (
                              <div className="flex gap-1.5 flex-wrap">
                                {medVerificationReports.map((r, i) => (
                                  <button key={i} onClick={() => setSelectedReportIdx(i)}
                                    className="rounded-lg border px-2.5 py-1 text-[10px] font-semibold transition"
                                    style={i === selectedReportIdx
                                      ? { borderColor: "rgba(37,99,235,0.30)", background: "rgba(37,99,235,0.08)", color: "rgb(var(--accent))" }
                                      : { borderColor: "rgb(var(--border))", background: "rgb(var(--panel))", color: "rgb(var(--text-faint))" }}>
                                    Topic {i + 1} — {r.evidence_score}/100
                                  </button>
                                ))}
                              </div>
                            )}

                            {activeReport && (
                              <>
                                {/* SECTION 1 — Key Finding */}
                                <div style={{ background: "rgb(var(--panel-soft))", border: "0.5px solid rgb(var(--border))", borderLeft: "3px solid rgb(var(--accent))", borderRadius: 8, padding: "12px 14px" }}>
                                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "rgb(var(--accent))", marginBottom: 5 }}>KEY FINDING</p>
                                  <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgb(var(--text))", margin: 0 }}>{activeReport.key_finding}</p>
                                </div>

                                {/* SECTION 2 — Research Sources */}
                                {activeReport.sources?.length > 0 && (
                                  <div>
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "rgb(var(--text-soft))", marginBottom: 8 }}>
                                      RESEARCH SOURCES ({activeReport.sources.length})
                                    </p>
                                    <div className="space-y-1.5">
                                      {activeReport.sources.map((src, si) => {
                                        const dotColor = src.tier === "green" ? "#16a34a" : src.tier === "accent" ? "rgb(var(--accent))" : "#d97706";
                                        return (
                                          <div key={si} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 12px", background: "rgb(var(--panel))", border: "0.5px solid rgb(var(--border))", borderRadius: 8 }}>
                                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, marginTop: 5, flexShrink: 0, display: "inline-block" }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                              <p style={{ fontSize: 12, fontWeight: 500, color: "rgb(var(--text))", lineHeight: 1.4, margin: 0 }}>{src.title}</p>
                                              <p style={{ fontSize: 11, color: "rgb(var(--text-faint))", marginTop: 2 }}>{src.source} · {src.year ?? "n/a"} · {src.study_type}</p>
                                              {src.pmid && <p style={{ fontSize: 10, color: "rgb(var(--text-faint))", marginTop: 1 }}>PMID: {src.pmid}</p>}
                                            </div>
                                            {src.url && (
                                              <a href={src.url} target="_blank" rel="noopener noreferrer"
                                                style={{ color: "rgb(var(--text-faint))", display: "flex", alignItems: "center", flexShrink: 0 }}
                                                onMouseEnter={e => e.currentTarget.style.color = "rgb(var(--accent))"}
                                                onMouseLeave={e => e.currentTarget.style.color = "rgb(var(--text-faint))"}>
                                                <ExternalLink size={12} />
                                              </a>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* SECTION 3 — 3-column bento */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>

                                  {/* CARD A — Clinical Evidence */}
                                  <div style={{ background: "rgb(var(--panel))", border: "0.5px solid rgb(var(--border))", borderRadius: 10, padding: "12px 14px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                      <span style={{ fontSize: 13 }}>🔍</span>
                                      <div>
                                        <p style={{ fontSize: 11, fontWeight: 700, color: "rgb(var(--text))", margin: 0 }}>Clinical Evidence</p>
                                        <p style={{ fontSize: 10, color: "rgb(var(--text-faint))", margin: 0 }}>Database retrieval log</p>
                                      </div>
                                    </div>
                                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "rgb(var(--text-soft))", margin: "8px 0 6px" }}>DATABASES SEARCHED</p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                      {(activeReport.databases_searched || []).map(db => (
                                        <span key={db} style={{ background: "rgb(var(--panel-soft))", border: "0.5px solid rgb(var(--border))", borderRadius: 20, fontSize: 10, fontWeight: 500, color: "rgb(var(--text))", padding: "2px 7px", display: "inline-flex", alignItems: "center", gap: 3 }}>
                                          <span style={{ color: "#16a34a" }}>✓</span> {db}
                                        </span>
                                      ))}
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
                                      <div style={{ background: "rgb(var(--panel-soft))", borderRadius: 8, padding: "10px 8px" }}>
                                        <p style={{ fontSize: 24, fontWeight: 700, color: "rgb(var(--text))", margin: 0, lineHeight: 1 }}>{activeReport.papers_found ?? 0}</p>
                                        <p style={{ fontSize: 10, color: "rgb(var(--text-faint))", marginTop: 2 }}>Papers</p>
                                      </div>
                                      <div style={{ background: "rgb(var(--panel-soft))", borderRadius: 8, padding: "10px 8px" }}>
                                        <p style={{ fontSize: 24, fontWeight: 700, color: "rgb(var(--text))", margin: 0, lineHeight: 1 }}>{(activeReport.study_types_found || []).length}</p>
                                        <p style={{ fontSize: 10, color: "rgb(var(--text-faint))", marginTop: 2 }}>Study Types</p>
                                      </div>
                                    </div>
                                    {activeReport.study_types_found?.length > 0 && (
                                      <p style={{ fontSize: 10, color: "rgb(var(--text-faint))", marginTop: 8 }}>
                                        {activeReport.study_types_found.join(" · ")}
                                      </p>
                                    )}
                                  </div>

                                  {/* CARD B — Fact-Checker */}
                                  <div style={{ background: "rgb(var(--panel))", border: "0.5px solid rgb(var(--border))", borderRadius: 10, padding: "12px 14px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                      <span style={{ fontSize: 13, color: "#16a34a" }}>✓</span>
                                      <div>
                                        <p style={{ fontSize: 11, fontWeight: 700, color: "rgb(var(--text))", margin: 0 }}>Fact-Checker</p>
                                        <p style={{ fontSize: 10, color: "rgb(var(--text-faint))", margin: 0 }}>Claim validation log</p>
                                      </div>
                                    </div>
                                    <div style={{ background: "rgb(var(--panel-soft))", border: "0.5px solid rgb(var(--border))", borderRadius: 8, padding: "7px 10px", margin: "8px 0", fontSize: 11, color: "rgb(var(--text))", lineHeight: 1.4 }}>
                                      {(activeReport.claim_text || "").length > 80
                                        ? (activeReport.claim_text || "").slice(0, 80) + "…"
                                        : (activeReport.claim_text || "")}
                                    </div>
                                    {(() => {
                                      const ca = activeReport.claim_accuracy ?? 80;
                                      const barColor = ca >= 80 ? "#16a34a" : ca >= 60 ? "rgb(var(--accent))" : "#d97706";
                                      return (
                                        <>
                                          <p style={{ fontSize: 10, color: "rgb(var(--text-faint))", marginBottom: 4 }}>{ca}% claim accuracy</p>
                                          <div style={{ height: 6, borderRadius: 3, background: "rgb(var(--bg-soft))", overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${ca}%`, background: barColor, borderRadius: 3, transition: "width 0.8s ease" }} />
                                          </div>
                                        </>
                                      );
                                    })()}
                                    {activeReport.guideline_match && (
                                      <div style={{ marginTop: 8, background: "rgba(22,163,74,0.06)", border: "0.5px solid rgba(22,163,74,0.20)", borderRadius: 6, padding: "5px 8px" }}>
                                        <p style={{ fontSize: 10, color: "#16a34a", fontWeight: 600 }}>
                                          ✓ {activeReport.guideline_match.org} Guideline — {activeReport.guideline_match.year}
                                        </p>
                                      </div>
                                    )}
                                    {activeReport.misinfo_flags?.length > 0 && (
                                      <div style={{ marginTop: 8, background: "rgba(217,119,6,0.06)", border: "0.5px solid rgba(217,119,6,0.20)", borderRadius: 6, padding: "5px 8px" }}>
                                        <p style={{ fontSize: 10, color: "#d97706" }}>⚠ {activeReport.misinfo_flags[0]}</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* CARD C — Safety Guard */}
                                  <div style={{ background: "rgb(var(--panel))", border: "0.5px solid rgb(var(--border))", borderRadius: 10, padding: "12px 14px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                      <span style={{ fontSize: 13, color: activeReport.safe_to_publish ? "#16a34a" : "#dc2626" }}>🛡</span>
                                      <div>
                                        <p style={{ fontSize: 11, fontWeight: 700, color: "rgb(var(--text))", margin: 0 }}>Safety Guard</p>
                                        <p style={{ fontSize: 10, color: "rgb(var(--text-faint))", margin: 0 }}>Risk assessment log</p>
                                      </div>
                                    </div>
                                    {(() => {
                                      const mr = activeReport.misinfo_risk ?? 30;
                                      const rColor = mr < 40 ? "#16a34a" : mr < 60 ? "#d97706" : "#dc2626";
                                      return (
                                        <>
                                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, marginTop: 8 }}>
                                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: "rgb(var(--text-soft))", margin: 0 }}>MISINFO RISK</p>
                                            <p style={{ fontSize: 13, fontWeight: 700, color: rColor, margin: 0 }}>{mr}%</p>
                                          </div>
                                          <div style={{ height: 5, borderRadius: 2, background: "rgb(var(--bg-soft))", overflow: "hidden", marginBottom: 10 }}>
                                            <div style={{ height: "100%", width: `${mr}%`, background: rColor, borderRadius: 2, transition: "width 0.8s ease" }} />
                                          </div>
                                        </>
                                      );
                                    })()}
                                    <div style={{
                                      background: activeReport.safe_to_publish ? "rgba(22,163,74,0.08)" : "rgba(217,119,6,0.08)",
                                      border: `0.5px solid ${activeReport.safe_to_publish ? "rgba(22,163,74,0.25)" : "rgba(217,119,6,0.25)"}`,
                                      borderRadius: 8, padding: "7px 10px", fontSize: 12, fontWeight: 600,
                                      color: activeReport.safe_to_publish ? "#16a34a" : "#d97706", marginBottom: 8,
                                    }}>
                                      {activeReport.safe_to_publish ? "✓ Safe to publish" : "⚠ Review before publishing"}
                                    </div>
                                    <div className="space-y-1">
                                      {(activeReport.safety_checks || []).map((chk, ci) => (
                                        <div key={ci} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11, color: "rgb(var(--text-soft))" }}>
                                          <span style={{ color: chk.passed ? "#16a34a" : "#dc2626", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{chk.passed ? "✓" : "✗"}</span>
                                          <span>{chk.label}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                </div>{/* end 3-col bento */}
                              </>
                            )}

                            {/* Footer notices */}
                            {swapped > 0 && <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2"><p className="text-[10px] text-violet-300 font-semibold">🔄 {swapped} topic{swapped !== 1 ? "s" : ""} auto-replaced from your Stage 2 pool.</p></div>}
                            {hardFail > 0 && <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2"><p className="text-[10px] text-rose-400">⚠️ {hardFail} topic{hardFail !== 1 ? "s" : ""} removed — no replacement found.</p></div>}
                            {allFailed && <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2"><p className="text-[10px] text-rose-400 font-bold">All topics failed — go back to Stage 2.</p></div>}

                            {/* CTA row */}
                            <div className="flex gap-2 pt-1">
                              <button onClick={handleReverify} className="rounded-xl border border-[rgb(var(--border))] px-3 py-2.5 text-xs font-semibold text-faint transition hover:border-[#2563eb]/30 hover:text-soft">↩ Re-verify ({REELS_CREDITS.REVERIFY}cr)</button>
                              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                onClick={handleGenerate}
                                disabled={verifyStatus !== "done" || verifyResults.filter(r => r.passed).length === 0}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition disabled:opacity-40"
                                style={{ background: "linear-gradient(90deg,#2563eb,#1d4ed8)", color: "#fff" }}>
                                <Zap size={14} /> Generate {verifyResults.filter(r => r.passed).length} Verified Reel{verifyResults.filter(r => r.passed).length !== 1 ? "s" : ""} <ArrowRight size={14} />
                              </motion.button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* ── RIGHT 1fr ─────────────────────────────────────────── */}
                    <div className="flex flex-col gap-3">

                      {/* Enhanced Evidence Score card — shown after verification */}
                      {verifyStatus === "done" && medVerificationReports[0] && (() => {
                        const rpt = medVerificationReports[selectedReportIdx] || medVerificationReports[0];
                        const sc  = rpt.evidence_score;
                        const r   = 34, c = 2 * Math.PI * r;
                        const col = sc >= 80 ? "#16a34a" : sc >= 60 ? "rgb(var(--accent))" : sc >= 40 ? "#d97706" : "#dc2626";
                        const METRICS = [
                          { label: "AI Confidence",  value: rpt.ai_confidence, color: "rgb(var(--accent))" },
                          { label: "Ev. Strength",   value: rpt.ev_strength,   color: "#16a34a" },
                          { label: "Consensus",      value: rpt.consensus,     color: "#16a34a" },
                          { label: "Quality",        value: rpt.quality,       color: "rgb(var(--accent))" },
                          { label: "Misinfo Risk",   value: rpt.misinfo_risk,  color: rpt.misinfo_risk < 40 ? "#16a34a" : rpt.misinfo_risk < 60 ? "#d97706" : "#dc2626", invert: true },
                        ];
                        return (
                          <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-faint mb-3">Overall Evidence Score</p>
                            {/* Score ring */}
                            <div className="flex items-center justify-center mb-3">
                              <div className="relative">
                                <svg width={84} height={84} className="-rotate-90">
                                  <circle cx={42} cy={42} r={r} fill="none" stroke="rgb(var(--bg))" strokeWidth={6} />
                                  <circle cx={42} cy={42} r={r} fill="none" stroke={col} strokeWidth={6}
                                    strokeDasharray={c} strokeDashoffset={c - (sc / 100) * c} strokeLinecap="round"
                                    style={{ transition: "stroke-dashoffset 0.8s ease" }} />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-2xl font-black tabular-nums" style={{ color: col }}>{sc}</span>
                                  <span className="text-[9px] text-faint">/100</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-center text-[12px] font-semibold mb-4" style={{ color: rpt.safe_to_publish ? "#16a34a" : "#d97706" }}>
                              {rpt.safe_to_publish ? "✓ Safe to publish" : "⚠ Review required"}
                            </p>
                            {/* 5 metric bars */}
                            <div className="space-y-2">
                              {METRICS.map(m => (
                                <div key={m.label}>
                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                    <span style={{ fontSize: 11, color: "rgb(var(--text-faint))" }}>{m.label}</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: m.color }}>{m.value}%</span>
                                  </div>
                                  <div style={{ height: 4, borderRadius: 2, background: "rgb(var(--bg-soft))", overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${m.value}%`, background: m.color, borderRadius: 2, transition: "width 0.8s ease" }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                      <CostCard count={topicCount} credits={user.credits} model={selectedModel} />
                      <FactCheckCard />
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ════════════════════════════════════════════════════════
                STAGE 4 — Script Generation & Output
                Bento: [2fr left card] [1fr right cards]
            ════════════════════════════════════════════════════════ */}
            <AnimatePresence>
              {(currentStage === 4 || currentStage === 5) && (
                <motion.div key="s4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col" style={{ height: "calc(100dvh - 56px - 52px - 20px)" }}>

                  <div className="mb-4 shrink-0">
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-[#6b7280] dark:text-[#888]">
                      {currentStage === 5 ? "Stage 5 of 5 — Final Output" : "Stage 4 of 5 — Script Generation"}
                    </p>
                    <h1 className="font-display text-xl font-bold">
                      {currentStage === 5
                        ? "Your reels are ready to shoot"
                        : pipeStatus === "running" ? "Generating your scripts…" : "Scripts ready"}
                    </h1>
                  </div>

                  <div className="flex-1 min-h-0 grid gap-3" style={{ gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)" }}>

                    {/* LEFT 2fr — live output first, then reels + actions */}
                    <div className="overflow-y-auto overflow-x-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]">

                      {/* 1. Live Output — Stage 4 only (during generation) */}
                      {currentStage === 4 && pipeStatus === "running" && (
                        <div>
                          <div className="flex items-center justify-between bg-[rgb(var(--bg-soft))] px-4 py-2">
                            <div className="flex items-center gap-2">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Live Output</p>
                              {scriptProgress.phase && (
                                <span className="text-[10px] text-[#2563eb] font-semibold">{scriptProgress.phase}</span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-[#2563eb]">
                              {finalReels.length}/{reelProgress.total || 1} complete
                            </span>
                          </div>
                          <div className="p-4 space-y-5">
                            {finalReels.length === 0 && (
                              <div className="flex items-center gap-2 py-4 text-[11px] text-faint">
                                <span className="animate-pulse">●</span> Waiting for first reel…
                              </div>
                            )}
                            {finalReels.map((reel, i) => (
                              <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                                className={i < finalReels.length - 1 ? "border-b border-[rgb(var(--border))] pb-5" : ""}>
                                <p className="text-[11px] font-bold text-[#2563eb] mb-2">{reel.topic}</p>
                                <pre className="whitespace-pre-wrap font-sans text-[11px] leading-relaxed text-soft">
                                  {typeof reel.scripts?.education === "string"
                                    ? reel.scripts.education
                                    : "Generating…"}
                                </pre>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stage 4 done — generation finished, hand off to Final Output (Stage 5) */}
                      {currentStage === 4 && pipeStatus === "done" && finalReels.length > 0 && (
                        <div className="p-6 flex flex-col items-center justify-center text-center gap-3">
                          <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/15 text-emerald-400 text-2xl">✓</div>
                          <div>
                            <p className="text-sm font-bold text-soft">{finalReels.length} script{finalReels.length !== 1 ? "s" : ""} generated</p>
                            <p className="text-[11px] text-faint mt-0.5">Medical Quick-Check passed · ready to review &amp; export</p>
                          </div>
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => setCurrentStage(5)}
                            className="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition"
                            style={{ background: "linear-gradient(90deg,#10b981,#059669)", color: "#fff" }}>
                            View Final Output <ArrowRight size={14} />
                          </motion.button>
                        </div>
                      )}

                      {/* 2. Shoot-Ready Reels — Stage 5 (Final Output) */}
                      {currentStage === 5 && pipeStatus === "done" && finalReels.length > 0 && (
                        <div className="border-b border-[rgb(var(--border))]">
                          <div className="flex items-center justify-between bg-[rgb(var(--bg-soft))] px-4 py-2">
                            <div className="flex items-center gap-2">
                              <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#2563eb]/15 text-[10px] font-bold text-[#2563eb] ring-1 ring-[#2563eb]/30">{finalReels.length > 1 ? "🎬" : "4"}</div>
                              <div>
                                <p className="text-[11px] font-bold text-soft">{finalReels.length > 1 ? `${finalReels.length} Shoot-Ready Reels` : "Shoot-Ready Script"}</p>
                                <p className="text-[9px] text-faint">Education format · PubMed verified · tap to expand</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {finalReels.length > 1 && (
                                <div className="flex items-center gap-0.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-0.5">
                                  <button onClick={() => setScriptView("list")} className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-all ${scriptView === "list" ? "bg-[#2563eb]/15 text-[#2563eb]" : "text-faint hover:text-soft"}`}><List size={11}/> List</button>
                                  <button onClick={() => setScriptView("grid")} className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-all ${scriptView === "grid" ? "bg-[#2563eb]/15 text-[#2563eb]" : "text-faint hover:text-soft"}`}><LayoutGrid size={11}/> Grid</button>
                                </div>
                              )}
                              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={() => {
                                  try {
                                    const h = JSON.parse(localStorage.getItem("magicscript_reels_history") || "[]");
                                    const batch = { id: "batch_" + Date.now(), type: "batch", keyword, bucket: selectedBucket, stage: "completed", reelCount: finalReels.length, reels: finalReels.map(r => ({ topic: r.topic, contentType: r.contentType, evidenceScore: r.medCheck?.evidence_score ?? null, script: r.scripts?.education ?? "", shootStatus: "to_shoot" })), createdAt: new Date().toISOString() };
                                    h.unshift(batch); localStorage.setItem("magicscript_reels_history", JSON.stringify(h.slice(0, 50)));
                                    setFinalDone(true);
                                    alert(`✅ ${finalReels.length} reel${finalReels.length !== 1 ? "s" : ""} saved`);
                                  } catch(e) { console.error(e); }
                                }}
                                className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400 transition hover:bg-emerald-500/20">
                                💾 Save All
                              </motion.button>
                              <button onClick={handleGenerate} title="Re-generate the script content for these same topics"
                                className="flex items-center gap-1 rounded-lg border border-[rgb(var(--border))] px-2.5 py-1 text-[10px] text-soft hover:text-[#2563eb] transition">
                                <RotateCcw size={11} /> Re-Generate ({reelRunCost(finalReels.length, selectedModel)}cr)
                              </button>
                            </div>
                          </div>
                          <div className="p-4">
                            {finalReels.length === 1 ? (
                              <ScriptOutput
                                scripts={finalReels[0].scripts}
                                contentTypeId={finalReels[0].contentType}
                                evidenceScore={finalReels[0].medCheck?.evidence_score ?? 75}
                                bucketId={selectedBucket}
                                language="english"
                                onSave={(data) => {
                                  try {
                                    const h = JSON.parse(localStorage.getItem("magicscript_reels_history") || "[]");
                                    h.unshift({ id: "reel_" + Date.now(), type: "single", keyword, topic: finalReels[0].topic, contentType: finalReels[0].contentType, bucket: selectedBucket, stage: "completed", script: data, shootStatus: "to_shoot", createdAt: new Date().toISOString() });
                                    localStorage.setItem("magicscript_reels_history", JSON.stringify(h.slice(0, 50)));
                                  } catch {}
                                }}
                              />
                            ) : scriptView === "grid" ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                {finalReels.map((reel, idx) => {
                                  const ev = reel.medCheck?.evidence_score;
                                  const tx = typeof reel.scripts?.education === "string" ? reel.scripts.education : "";
                                  return (
                                    <div key={idx} className="flex flex-col rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] overflow-hidden">
                                      <div className="flex items-center gap-2 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2">
                                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#2563eb]/15 text-[10px] font-bold text-[#2563eb]">{idx+1}</span>
                                        <p className="flex-1 truncate text-[11px] font-semibold text-soft">{reel.topic}</p>
                                        {ev != null && <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${ev >= 70 ? "bg-emerald-500/10 text-emerald-400" : ev >= 40 ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>{ev}/100</span>}
                                      </div>
                                      <pre className="flex-1 whitespace-pre-wrap font-sans text-[10px] leading-relaxed text-soft p-3 overflow-y-auto max-h-[280px]">{tx || "No script generated."}</pre>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {finalReels.map((reel, idx) => (
                                  <div key={idx}>
                                    {/* Evidence badge + guideline + drug flag chips */}
                                    {(reel.evidenceBadge || reel.guidelineMatch || reel.drugFlags) && (
                                      <div className="flex flex-wrap gap-1 mb-1 px-1">
                                        {reel.evidenceBadge && (
                                          <span className="rounded-full px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            📊 {reel.evidenceBadge} · PubMed verified
                                          </span>
                                        )}
                                        {reel.guidelineMatch && (
                                          <span className="rounded-full px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            ✓ {reel.guidelineMatch.badge ?? reel.guidelineMatch.org}
                                          </span>
                                        )}
                                        {reel.drugFlags && reel.drugFlags.length > 0 && (
                                          <span className="rounded-full px-2 py-0.5 text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20" title={reel.drugFlags[0].risk}>
                                            ⚠ Drug interaction — see note
                                          </span>
                                        )}
                                        {reel.whatsappHook && (
                                          <button
                                            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(reel.whatsappHook)}`, "_blank")}
                                            className="rounded-full px-2 py-0.5 text-[9px] font-bold bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366]/20 transition"
                                          >
                                            📱 WhatsApp Share
                                          </button>
                                        )}
                                      </div>
                                    )}
                                    <BatchReelCard reel={reel} index={idx} defaultOpen={idx === 0}
                                      onSave={(data) => {
                                        try {
                                          const h = JSON.parse(localStorage.getItem("magicscript_reels_history") || "[]");
                                          h.unshift({ id: "reel_" + Date.now(), type: "single", keyword, topic: reel.topic, contentType: reel.contentType, bucket: selectedBucket, stage: "completed", script: data, shootStatus: "to_shoot", createdAt: new Date().toISOString() });
                                          localStorage.setItem("magicscript_reels_history", JSON.stringify(h.slice(0, 50)));
                                        } catch {}
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 3. Scripts ready — what's next? (Stage 5) */}
                      {currentStage === 5 && pipeStatus === "done" && (
                        <div className="border-b border-[#2563eb]/15 bg-gradient-to-br from-[#2563eb]/5 to-electric/5">
                          <div className="border-b border-[#2563eb]/15 px-4 py-3">
                            <p className="text-xs font-bold text-[#2563eb]">✅ Scripts ready — what&apos;s next?</p>
                            <p className="text-[11px] text-faint">Your content pack is ready to shoot.</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
                            {[
                              { icon: "📥", label: "Export Scripts", sub: "Download .txt", action: () => { const text = finalReels.map((r,i) => `REEL ${i+1}\n${"─".repeat(50)}\n${r.topic}\n\n${r.scripts?.education??""}\n\n`).join("\n"); const blob = new Blob([text],{type:"text/plain"}); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download=`magicscript-${keyword}-${finalReels.length}reels.txt`; a.click(); URL.revokeObjectURL(url); setFinalDone(true); } },
                              { icon: "📋", label: "Copy All", sub: "To clipboard", action: async () => { const t = finalReels.map((r,i) => `REEL ${i+1}: ${r.topic}\n\n${r.scripts?.education??""}`).join("\n\n"+"═".repeat(40)+"\n\n"); await navigator.clipboard.writeText(t); setFinalDone(true); alert("✅ Copied"); } },
                              { icon: "📚", label: "Save to Library", sub: "Track & review", action: () => { try { const now = new Date().toISOString(); const lib = JSON.parse(localStorage.getItem("magicscript_saved_library")||"[]"); finalReels.forEach(r => { lib.unshift({ topic_title: r.topic, evidence_grade: r.evidenceBadge?.split(" · ")[0] ?? null, study_count: r.studyCount ?? null, guideline_match: r.guidelineMatch?.badge ?? null, quality_score: r.qualityScore ?? null, pipeline: "micro_content", created_at: now }); }); localStorage.setItem("magicscript_saved_library", JSON.stringify(lib.slice(0,200))); const h = JSON.parse(localStorage.getItem("magicscript_reels_history")||"[]"); h.unshift({id:"batch_"+Date.now(),type:"batch",keyword,bucket:selectedBucket,stage:"completed",reelCount:finalReels.length,reels:finalReels.map(r=>({topic:r.topic,script:r.scripts?.education??"",shootStatus:"to_shoot",evidenceScore:r.medCheck?.evidence_score??null})),createdAt:now}); localStorage.setItem("magicscript_reels_history",JSON.stringify(h.slice(0,50))); setFinalDone(true); alert(`✅ Saved ${finalReels.length} reels to library`); } catch {} } },
                              { icon: "📱", label: "WhatsApp Share", sub: "First reel", action: () => { const firstHook = finalReels[0]?.whatsappHook || finalReels[0]?.scripts?.education?.split("\n")[1] || `Check this health insight: ${finalReels[0]?.topic ?? ""}`; window.open(`https://wa.me/?text=${encodeURIComponent(firstHook)}`, "_blank"); } },
                            ].map(({ icon, label, sub, action }) => (
                              <button key={label} onClick={action} className="flex flex-col items-center gap-1.5 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3 text-center transition hover:border-[#2563eb]/30 hover:bg-[#2563eb]/5">
                                <span className="text-xl">{icon}</span>
                                <p className="text-[11px] font-bold text-soft">{label}</p>
                                <p className="text-[9px] text-faint">{sub}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}


                    </div>{/* end LEFT big card */}

                    {/* RIGHT 1fr — compact pipeline first, then metrics */}
                    <div ref={rightColRef} className="flex flex-col gap-3 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>

                      {/* Generation pipeline card */}
                      <GenerationPipeline
                        status={pipeStatus}
                        activeStep={activeStep}
                        awaitingMed={awaitingMed}
                        reelProgress={reelProgress}
                        model={selectedModel}
                      />

                      {/* Total spend for this run — shown at Final Output (Stage 5) */}
                      {currentStage === 5 && pipeStatus === "done" && (
                        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4 space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/90 flex items-center gap-1.5">
                            <Zap size={10} /> Total Spent — This Run
                          </p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-[rgb(var(--text))]">{runSpend}</span>
                            <span className="text-sm font-bold text-faint">cr</span>
                          </div>
                          <p className="text-[11px] text-faint">
                            {finalReels.length} reel{finalReels.length !== 1 ? "s" : ""} · model: <span className="font-semibold capitalize">{selectedModel}</span>
                            {selectedModel !== "gemini" && selectedModel !== "demo" ? ` (×${selectedModel === "claude" ? "1.5" : "1.3"} vs Gemini)` : ""}
                          </p>
                          <div className="h-px bg-[rgb(var(--border))]" />
                          <p className="text-[10px] text-faint">
                            {demoMode ? "Demo — no real API charge" : `≈ ₹${runSpend} real cost`} · {user.credits} credits remaining
                          </p>
                        </div>
                      )}

                      <ScriptQualityCard medCheck={medCheck} />
                      {/* Projected cost — only during generation (Stage 4). At Stage 5
                          the "Total Spent — This Run" card above is the source of truth. */}
                      {currentStage !== 5 && (
                        <CostCard count={reelProgress.total || topicCount} credits={user.credits} model={selectedModel} />
                      )}
                      <FactCheckCard />
                      <PerformanceCard />
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </main>
      </div>

      {/* ── BOTTOM BAR — fixed left-[180px] so it lines up with the content area ── */}
      <div className="fixed bottom-0 left-[200px] right-0 z-50 flex h-[52px] shrink-0 items-center justify-between border-t border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-[22px]">
        {/* Left: stage tip OR evidence + safety */}
        <div className="flex items-center gap-2 min-w-0">
          {evidenceScore != null ? (
            <>
              <span className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${evidenceScore >= 70 ? "border-emerald-500/25 bg-emerald-500/8 text-emerald-400" : evidenceScore >= 40 ? "border-amber-500/25 bg-amber-500/8 text-amber-400" : "border-rose-500/25 bg-rose-500/8 text-rose-400"}`}>
                ◎ Evidence {evidenceScore}/100
              </span>
              {(safeToPublish !== null ? safeToPublish : safetySt === "safe") && (
                <span className="flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                  ✓ Safe
                </span>
              )}
              {papersFound != null
                ? <span className="shrink-0 text-[11px] text-faint">📄 {papersFound} sources</span>
                : sources.length > 0 && <span className="shrink-0 text-[11px] text-faint">📄 {sources.length} sources</span>
              }
            </>
          ) : (
            <span className="truncate text-[11px] text-faint">
              {currentStage === 1 && "💡 Pick a health bucket or type a one-word keyword — then select topics that match your niche"}
              {currentStage === 2 && "💡 Topics with Strong Evidence (70+) perform best — select 1–5 and click Generate Reels"}
              {currentStage === 3 && "💡 PubMed is scanning your topics — scores 40+ pass, blocked topics are auto-replaced with verified ones"}
              {currentStage === 4 && pipeStatus === "running" && "💡 Scripts are generating in parallel — Medical Quick-Check runs first to ensure every claim is evidence-backed"}
              {currentStage === 4 && pipeStatus === "done"    && "💡 Scripts generated — click View Final Output to review and export"}
              {currentStage === 5 && "💡 Final Output — export as .txt, copy all, save to Library, or share to WhatsApp"}
            </span>
          )}
        </div>

        {/* Right: Back + primary action */}
        <div className="flex items-center gap-2">
          {currentStage > 1 && (
            <button onClick={() => setCurrentStage(s => Math.max(1, s - 1))} className="rounded-lg border border-[rgb(var(--border))] px-3.5 py-1.5 text-xs font-semibold text-faint hover:text-soft transition">← Back</button>
          )}
          {currentStage === 1 && (
            <button disabled className="rounded-lg bg-blue-600/40 px-4 py-1.5 text-xs font-bold text-white cursor-not-allowed">Send to Stage 2 →</button>
          )}
          {currentStage === 2 && (
            <motion.button
              whileHover={previewTopic ? { scale: 1.02 } : {}}
              whileTap={previewTopic ? { scale: 0.98 } : {}}
              disabled={!previewTopic}
              onClick={() => previewTopic && handleSendToStage3([previewTopic.topic], previewTopic.tabId, null)}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold text-white transition ${previewTopic ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-600/30 cursor-not-allowed"}`}>
              Generate Reels →
            </motion.button>
          )}
          {currentStage === 3 && verifyStatus === "done" && verifyResults.filter(r => r.passed).length > 0 && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleGenerate} className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500">Generate Scripts →</motion.button>
          )}
          {/* Stage 4 done — hand off to Final Output */}
          {currentStage === 4 && finalReels.length > 0 && pipeStatus === "done" && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setCurrentStage(5)}
              className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500">View Final Output →</motion.button>
          )}
          {/* Stage 5 — export */}
          {currentStage === 5 && finalReels.length > 0 && pipeStatus === "done" && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => { const t = finalReels.map((r,i) => `REEL ${i+1}\n${r.topic}\n\n${r.scripts?.education??""}`).join("\n\n---\n\n"); const blob = new Blob([t],{type:"text/plain"}); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download=`magicscript-${keyword}.txt`; a.click(); URL.revokeObjectURL(url); setFinalDone(true); }}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-blue-500">Export Scripts →</motion.button>
          )}
        </div>
      </div>

    </div>
  );
}
