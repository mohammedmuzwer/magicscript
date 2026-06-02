"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, X, RotateCcw, LogOut, UserCircle, CreditCard,
  ChevronDown, Clapperboard, Loader2,
  ShieldCheck, ArrowRight,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import Logo from "@/components/ui/logo";
import ThemeToggle from "@/components/ui/theme-toggle";
import { Avatar } from "@/components/dashboard/dashboard-shell";
import WorkspaceModeToggle from "@/components/ui/workspace-mode-toggle";
import { useRouter } from "next/navigation";

import Stage1Center      from "@/components/reels/Stage1Center";
import Stage2TopicMatrix from "@/components/reels/Stage2TopicMatrix";
import TopicInsightPanel from "@/components/reels/TopicInsightPanel";
import GenerationPipeline from "@/components/reels/GenerationPipeline";
import MedQuickCheck     from "@/components/reels/MedQuickCheck";
import ScriptOutput      from "@/components/reels/ScriptOutput";
import BatchReelCard     from "@/components/reels/BatchReelCard";
import EngagementScore   from "@/components/reels/EngagementScore";
import ReelsLeftPanel    from "@/components/reels/ReelsLeftPanel";
import ReelsModelToggle  from "@/components/reels/ReelsModelToggle";

import { CONTENT_TYPES, getContentTypeById } from "@/lib/reels/contentTypes";
import { REELS_CREDITS, LOW_CREDIT_THRESHOLD } from "@/lib/reels/creditCosts";

// ── Tab id → content type id mapping ─────────────────────────────────────────
const TAB_TO_CONTENT_TYPE = {
  myth:       "myth-buster",
  problem:    "problem-reveal",
  faq:        "faq-explainer",
  contrarian: "contrarian",
  clinical:   "education-drop",   // clinical deep dive maps to the education script style
};

// ── Stage 1 input options (mirrors Podcast Stage 1's Mode A / Mode B / Manual) ─
const INPUT_OPTIONS = [
  { id: "bucket", label: "Content Bucket",   icon: "🏷️", description: "Pick from 7 health categories",              cr: 0 },
  { id: "manual", label: "Manual Topic",     icon: "✍️", description: "Type your own topic or sentence",             cr: 0 },
  { id: "link",   label: "Reference Link",   icon: "🔗", description: "Paste a viral video URL to adapt its structure", cr: 0 },
];

// ── Pipeline credit breakdown ─────────────────────────────────────────────────
const PIPELINE_STEPS = [
  { label: "Topic Expansion",   cr: 1 },
  { label: "Audience Profile",  cr: 0 },
  { label: "Med Quick-Check",   cr: 3 },
  { label: "Script Generation", cr: 3 },
  { label: "Format & Polish",   cr: 1 },
];

// ── Stage progress indicator (4 dots) ────────────────────────────────────────
function StageIndicator({ current, total = 4 }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${
          i + 1 < current  ? "bg-cyan"
          : i + 1 === current ? "bg-cyan/60"
          : "bg-[rgb(var(--border))]"
        }`} />
      ))}
    </div>
  );
}

// ── Left-panel section label ──────────────────────────────────────────────────
function SectionLabel({ dot, number, label }) {
  const dotColor =
    dot === "cyan"   ? "bg-cyan"         :
    dot === "violet" ? "bg-violet-500"   :
    dot === "amber"  ? "bg-amber-500"    : "bg-faint";
  return (
    <div className="mb-2.5 flex items-center gap-2">
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-faint">{number} — {label}</span>
    </div>
  );
}

// ── Radio-style input option row (Stage 1 left panel) ────────────────────────
function InputOptionRow({ option, selected, onSelect }) {
  const active = selected === option.id;
  return (
    <button
      onClick={() => onSelect(option.id)}
      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
        active
          ? "border-cyan/30 bg-cyan/8"
          : "border-[rgb(var(--border))] hover:border-cyan/20 hover:bg-electric/5"
      }`}
    >
      <div className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 transition ${
        active ? "border-cyan bg-cyan" : "border-[rgb(var(--border))]"
      }`}>
        {active && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
      </div>
      <span className="text-base shrink-0">{option.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold ${active ? "text-cyan" : "text-soft"}`}>{option.label}</p>
        <p className="text-[10px] text-faint">{option.description}</p>
      </div>
      <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400">FREE</span>
    </button>
  );
}

// ── Content type row in left panel ───────────────────────────────────────────
function ContentTypeRow({ ct, selected, onSelect }) {
  const active = selected === ct.id;
  return (
    <button
      onClick={() => onSelect(active ? null : ct.id)}
      className="flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all"
      style={active
        ? { borderColor: ct.accentColor + "60", background: ct.accentColor + "12" }
        : { borderColor: "rgb(var(--border))" }
      }
    >
      <div
        className="grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 transition"
        style={active ? { borderColor: ct.accentColor, background: ct.accentColor } : { borderColor: "rgb(var(--border))" }}
      >
        {active && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
      </div>
      <span className="text-base shrink-0">{ct.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold truncate" style={active ? { color: ct.accentColor } : {}}>{ct.label}</p>
        <p className="text-[10px] text-faint truncate">{ct.description}</p>
      </div>
    </button>
  );
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
  const [currentStage, setCurrentStage] = useState(1);  // 1 | 2 | 3 | 4

  // ── Stage 1 state ───────────────────────────────────────────────────────────
  const [inputMode,      setInputMode]      = useState("bucket");
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [customWord,     setCustomWord]     = useState("");
  const [manualTopic,    setManualTopic]    = useState("");
  const [referenceLink,  setReferenceLink]  = useState(""); // Stage 1 mode "link" — viral URL
  const [keyword,        setKeyword]        = useState(""); // Stage 1 committed keyword

  // ── Stage 2 state ───────────────────────────────────────────────────────────
  const [topic,       setTopic]       = useState(""); // Final validated topic from matrix
  const [contentType, setContentType] = useState(null);

  // ── Batch state ─────────────────────────────────────────────────────────────
  const [batchSize,      setBatchSize]      = useState(1);
  const [selectedTopics, setSelectedTopics] = useState([]); // [{title, tabId, ...}]
  const [finalReels,     setFinalReels]     = useState([]); // [{topic, contentType, scripts, medCheck}]
  const [reelProgress,   setReelProgress]   = useState({ current: 0, total: 0 });

  // ── Stage 3 pipeline state ──────────────────────────────────────────────────
  const [pipeStatus,  setPipeStatus]  = useState("idle");
  const [activeStep,  setActiveStep]  = useState(0);
  const [medCheck,    setMedCheck]    = useState(null);
  const [medBlocked,  setMedBlocked]  = useState(false);
  const [awaitingMed, setAwaitingMed] = useState(false);
  const [scripts,     setScripts]     = useState(null);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [previewTopic,  setPreviewTopic]  = useState(null);  // Stage 2 topic hover/select detail

  const outputRef = useRef(null);
  const stage2Ref = useRef(null);
  const stage3Ref = useRef(null);

  if (!ready || !user) return null;

  const lowCredits  = user.credits < LOW_CREDIT_THRESHOLD;
  const hasTopics   = batchSize === 1 ? !!topic : selectedTopics.length > 0;
  const canGenerate = hasTopics && !!contentType && user.credits >= REELS_CREDITS.FULL_REGEN;
  const selectedCT  = getContentTypeById(contentType);

  // ── Derive 5-stage progress for ReelsLeftPanel ────────────────────────────
  const visualApproved = [];
  if (keyword)                                visualApproved.push(1);
  if ((topic || selectedTopics.length > 0) && contentType) visualApproved.push(2);
  if (medCheck && !medBlocked)                visualApproved.push(3);
  if (scripts || finalReels.length > 0)       visualApproved.push(4);
  // Stage 5 (final output) is approved when user explicitly leaves it — not auto.

  const visualCurrent =
        !keyword                                ? 1
      : !topic                                  ? 2
      : !medCheck && pipeStatus !== "running"   ? 3
      : !scripts && pipeStatus === "running"    ? 4
      : scripts                                 ? 5
      : 3;

  function handleGoToStage(stageId) {
    // Stages 1-2 map to internal currentStage directly
    if (stageId === 1) { setCurrentStage(1); return; }
    if (stageId === 2 && keyword) { setCurrentStage(2); return; }
    // Stages 3-5 all live under internal currentStage 3 (generation + output)
    if (stageId >= 3 && topic) { setCurrentStage(3); return; }
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  // Stage 1 → Stage 2: commit the keyword/bucket selection
  const handleSendToStage2 = (kw) => {
    setKeyword(kw);
    setTopic("");           // clear any previous final topic
    setContentType(null);   // clear content type
    setMedCheck(null); setScripts(null);
    setAwaitingMed(false); setMedBlocked(false);
    setPipeStatus("idle");
    setCurrentStage(2);
    setTimeout(() => stage2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
  };

  // Stage 2 → Stage 3: accepts array (batch) or (title, tabId) legacy single
  const handleSendToStage3 = (topicsOrTitle, tabId) => {
    if (Array.isArray(topicsOrTitle)) {
      // Batch mode — array of {title, tabId, ...}
      setSelectedTopics(topicsOrTitle);
      setTopic(topicsOrTitle[0]?.title ?? "");
      setContentType(TAB_TO_CONTENT_TYPE[topicsOrTitle[0]?.tabId] ?? "myth-buster");
    } else {
      // Single mode legacy
      setTopic(topicsOrTitle);
      setSelectedTopics([{ title: topicsOrTitle, tabId }]);
      setContentType(TAB_TO_CONTENT_TYPE[tabId] ?? "myth-buster");
    }
    setCurrentStage(3);
    setPreviewTopic(null);
    setMedCheck(null); setScripts(null); setFinalReels([]);
    setAwaitingMed(false); setMedBlocked(false);
    setPipeStatus("idle");
    setTimeout(() => stage3Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
  };

  const handleReset = () => {
    setKeyword(""); setTopic(""); setContentType(null);
    setSelectedBucket(null); setCustomWord(""); setManualTopic("");
    setMedCheck(null); setScripts(null);
    setPipeStatus("idle"); setActiveStep(0);
    setAwaitingMed(false); setMedBlocked(false);
    setPreviewTopic(null);
    setBatchSize(1); setSelectedTopics([]); setFinalReels([]);
    setReelProgress({ current: 0, total: 0 });
    setCurrentStage(1);
  };

  const getHeaders = () => {
    if (typeof window === "undefined") return { "Content-Type": "application/json" };
    // Same key names as Podcast so users have a unified Settings page
    const gk = localStorage.getItem("V_KEY_GOOGLE") || localStorage.getItem("ms_gemini_key");
    const ak = localStorage.getItem("V_KEY_CLAUDE") || localStorage.getItem("ms_anthropic_key");
    const ok = localStorage.getItem("ms_openai_key");
    // The active model preference for whichever Reels stage we're triggering
    // (script-gen is Stage 4 — that's where the Claude/Gemini toggle is most relevant)
    const stagePref = (() => {
      try {
        const parsed = JSON.parse(localStorage.getItem("REELS_MODEL_PREFS_v1") || "{}");
        return parsed[4] ?? parsed[3] ?? "claude";
      } catch { return "claude"; }
    })();
    return {
      "Content-Type": "application/json",
      ...(gk && { "x-client-gemini-key":    gk }),
      ...(ak && { "x-client-anthropic-key": ak }),
      ...(ok && { "x-client-openai-key":    ok }),
      "x-preferred-model": stagePref,
    };
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setPipeStatus("running"); setActiveStep(0);
    setMedCheck(null); setScripts(null); setFinalReels([]);
    setAwaitingMed(false); setMedBlocked(false);

    const topics = selectedTopics.length > 0 ? selectedTopics : [{ title: topic, tabId: "myth" }];
    const total  = topics.length;
    setReelProgress({ current: 0, total });

    const headers = getHeaders();

    for (let i = 0; i < topics.length; i++) {
      const { title: tTitle } = topics[i];
      setReelProgress({ current: i + 1, total });
      setActiveStep(0); await ms(250);
      setActiveStep(1); await ms(250);
      setActiveStep(2);

      let medCheckResult = null;
      try {
        const res  = await fetch("/api/reels/medcheck", {
          method: "POST", headers,
          body: JSON.stringify({ topic: tTitle, contentType }),
        });
        const data = await res.json();
        medCheckResult = data;
        setMedCheck(data);
        setActiveStep(3);

        if ((data.evidence_score ?? 0) < 40) {
          if (total === 1) { setMedBlocked(true); setPipeStatus("idle"); return; }
          setFinalReels(prev => [...prev, { topic: tTitle, contentType, scripts: null, blocked: true, medCheck: data }]);
          continue;
        }

        // Single mode: show the evidence gate before generating
        if (total === 1) {
          setAwaitingMed(true);
          return; // handleMedContinue picks up from here
        }
      } catch (err) {
        console.error("[reels] medcheck failed:", err?.message);
        setActiveStep(3);
        // continue to generation anyway
      }

      // Generate scripts for this topic
      try {
        const summary = medCheckResult
          ? `Evidence: ${medCheckResult.evidence_score}/100. ${medCheckResult.safety_note ?? ""}`
          : "No medical data.";
        const res  = await fetch("/api/reels/generate", {
          method: "POST", headers,
          body: JSON.stringify({
            topic: tTitle, contentType,
            bucketId: selectedBucket, language: "english",
            evidenceSummary: summary, medCheck: medCheckResult,
          }),
        });
        const data = await res.json();
        setActiveStep(4); await ms(300);
        if (total === 1) setScripts(data.scripts);
        setFinalReels(prev => [...prev, { topic: tTitle, contentType, scripts: data.scripts, medCheck: medCheckResult }]);
      } catch {
        setFinalReels(prev => [...prev, { topic: tTitle, contentType, scripts: null, error: true }]);
      }
    }

    setPipeStatus("done");
    setCurrentStage(4);
    spendCredit(REELS_CREDITS.FULL_REGEN * total);
    setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
  };

  // Single-mode: resumes after user reviews the evidence gate
  const handleMedContinue = async () => {
    setAwaitingMed(false); setActiveStep(3);
    const headers = getHeaders();
    try {
      const summary = medCheck
        ? `Evidence: ${medCheck.evidence_score}/100. ${medCheck.safety_note ?? ""}`
        : "No medical data.";
      const res  = await fetch("/api/reels/generate", {
        method: "POST", headers,
        body: JSON.stringify({ topic, contentType, bucketId: selectedBucket, language: "english", evidenceSummary: summary, medCheck }),
      });
      const data = await res.json();
      setActiveStep(4); await ms(600);
      setScripts(data.scripts);
      setFinalReels([{ topic, contentType, scripts: data.scripts, medCheck }]);
      setPipeStatus("done");
      setCurrentStage(4);
      spendCredit(REELS_CREDITS.FULL_REGEN);
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    } catch { setPipeStatus("idle"); }
  };

  function ms(t) { return new Promise((r) => setTimeout(r, t)); }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[rgb(var(--bg))]">

      {/* ── TOP NAV ─────────────────────────────────────────────────────────── */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-4">
        <div className="flex items-center gap-3">
          <Logo size={26} href="/dashboard" />
          <div className="h-5 w-px bg-[rgb(var(--border))]" />
          <WorkspaceModeToggle />
        </div>
        <nav className="hidden items-center gap-0.5 md:flex">
          {[
            { label: "Agents",  href: "/dashboard/agents"   },
            { label: "Library", href: "/dashboard/library"  },
            { label: "History", href: "/dashboard/history"  },
            { label: "🔑 API",  href: "/dashboard/settings" },
          ].map((l) => (
            <Link key={l.href} href={l.href}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-soft transition hover:bg-electric/8 hover:text-[rgb(var(--text))]">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/billing"
            className="hidden items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-2.5 py-1.5 text-xs font-semibold sm:flex">
            <Zap size={13} className="text-cyan" />
            <span className="text-cyan">{user.credits}</span>
            <span className="text-faint">credits</span>
          </Link>
          <ThemeToggle />
          <div className="relative">
            <button onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] py-1 pl-1 pr-2">
              <Avatar user={user} size={26} />
              <ChevronDown size={13} className="hidden text-faint sm:block" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-1.5 shadow-card">
                  <div className="border-b border-[rgb(var(--border))] px-3 py-2.5">
                    <div className="text-sm font-semibold">{user.name}</div>
                    <div className="truncate text-xs text-faint">{user.email}</div>
                  </div>
                  <Link href="/dashboard/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-soft hover:bg-electric/8 transition"><UserCircle size={15}/> Profile</Link>
                  <Link href="/dashboard/billing" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-soft hover:bg-electric/8 transition"><CreditCard size={15}/> Subscription</Link>
                  <button onClick={() => { logout(); router.push("/"); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10 transition"><LogOut size={15}/> Log out</button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── 3-PANEL BODY ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ════════════════════════════════════════════════════════════════
            LEFT PANEL — clean 5-stage list (mirrors PodcastLeftPanel)
        ════════════════════════════════════════════════════════════════ */}
        <ReelsLeftPanel
          currentStage={visualCurrent}
          approvedStages={visualApproved}
          onGoToStage={handleGoToStage}
        />


        {/* ════════════════════════════════════════════════════════════════
            CENTER PANEL
        ════════════════════════════════════════════════════════════════ */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-6 overflow-y-auto p-6">

            {/* ── STAGE 1: Topic Input ─────────────────────────────────────── */}
            <AnimatePresence>
              {currentStage === 1 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cyan/15 text-xs font-bold text-cyan ring-1 ring-cyan/30">1</div>
                      <div>
                        <h2 className="font-display text-lg font-bold">Stage 1 — Choose your keyword</h2>
                        <p className="text-xs text-faint">
                          Pick one of three input modes: browse trending content buckets, type your own topic, or paste a viral reference link.
                        </p>
                      </div>
                    </div>
                    {/* AI model toggle (mirrors Podcast's Gemini/Claude switch) */}
                    <ReelsModelToggle stageNum={1} />
                  </div>

                  {/* ── Mode A / B / C selector (matches Podcast Stage 1) ── */}
                  <div className="mb-5 grid gap-2.5 grid-cols-1 md:grid-cols-3">
                    {INPUT_OPTIONS.map((opt, i) => {
                      const isActive = inputMode === opt.id;
                      const letter = ["A", "B", "C"][i] ?? "?";
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setInputMode(opt.id);
                            setSelectedBucket(null);
                            setCustomWord("");
                          }}
                          className={`group flex flex-col items-start gap-1.5 rounded-xl border px-3.5 py-3 text-left transition-all ${
                            isActive
                              ? "border-cyan/40 bg-cyan/8 ring-1 ring-inset ring-cyan/20"
                              : "border-[rgb(var(--border))] bg-[rgb(var(--panel))] hover:border-cyan/20"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-base leading-none">{opt.icon}</span>
                            <p className={`text-xs font-bold ${isActive ? "text-cyan" : "text-soft"}`}>
                              Mode {letter} — {opt.label}
                            </p>
                          </div>
                          <p className="text-[11px] text-faint leading-snug">{opt.description}</p>
                        </button>
                      );
                    })}
                  </div>

                  {/* ── Batch Size Selector ──────────────────────────────── */}
                  <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-3">
                    <div>
                      <p className="text-xs font-bold">Batch Size</p>
                      <p className="text-[11px] text-faint">Generate multiple reels simultaneously</p>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-0.5">
                      {[1, 3, 5, 10].map((n) => (
                        <button
                          key={n}
                          onClick={() => setBatchSize(n)}
                          className="rounded-md px-3 py-1.5 text-xs font-bold transition-all"
                          style={batchSize === n
                            ? { background: "#22d3ee", color: "#0a101e" }
                            : { color: "rgb(var(--text-faint))" }
                          }
                        >
                          {n === 1 ? "1" : `×${n}`}
                        </button>
                      ))}
                    </div>
                  </div>

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
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── STAGE 2: Doctor Farmer Validated Topic Matrix ────────────── */}
            <AnimatePresence>
              {currentStage === 2 && keyword && (
                <motion.div
                  ref={stage2Ref}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  {/* Keyword banner */}
                  <div className="mb-4 flex items-center gap-3 rounded-xl border border-cyan/25 bg-cyan/8 px-4 py-3">
                    <Clapperboard size={15} className="shrink-0 text-cyan" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-faint">Keyword</p>
                      <p className="truncate text-sm font-bold text-cyan">{keyword}</p>
                    </div>
                    <button
                      onClick={() => { setKeyword(""); setCurrentStage(1); }}
                      className="shrink-0 text-[11px] text-faint underline transition hover:text-soft"
                    >
                      Change
                    </button>
                  </div>

                  {/* Stage 2 heading */}
                  <div className="mb-4 flex items-center gap-2.5">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-500/15 text-xs font-bold text-violet-400 ring-1 ring-violet-500/30">2</div>
                    <div>
                      <h2 className="font-display text-lg font-bold">Select your topic angle</h2>
                      <p className="text-xs text-faint">Doctor Farmer validated — choose the highest scoring idea for your audience</p>
                    </div>
                  </div>

                  <Stage2TopicMatrix
                    topic={keyword}
                    bucket={selectedBucket}
                    batchSize={batchSize}
                    onSendToStage3={handleSendToStage3}
                    onTopicPreview={setPreviewTopic}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── STAGE 3: Confirmed topic(s) + content type + generate ─── */}
            <AnimatePresence>
              {currentStage >= 3 && (topic || selectedTopics.length > 0) && !scripts && finalReels.length === 0 && pipeStatus === "idle" && (
                <motion.div ref={stage3Ref} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>

                  {/* Confirmed topic(s) banner */}
                  {selectedTopics.length > 1 ? (
                    <div className="mb-4 rounded-xl border border-violet-500/25 bg-violet-500/8 px-4 py-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-bold text-violet-400">🎬 {selectedTopics.length} Topics — Batch Generation</p>
                        <button onClick={() => { setSelectedTopics([]); setTopic(""); setCurrentStage(2); }} className="text-[11px] text-faint underline hover:text-soft">Change</button>
                      </div>
                      <div className="space-y-0.5">
                        {selectedTopics.map((t, i) => {
                          const tabIcon = { myth: "⚡", problem: "🔍", faq: "❓", contrarian: "🎯", clinical: "🔬" };
                          return (
                            <p key={i} className="text-xs text-soft">
                              <span className="mr-1.5 text-faint">{String(i + 1).padStart(2, "0")}.</span>
                              <span className="mr-1">{tabIcon[t.tabId] ?? "📌"}</span>
                              {t.title}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 flex items-center gap-3 rounded-xl border border-cyan/25 bg-cyan/8 px-4 py-3">
                      <Clapperboard size={15} className="shrink-0 text-cyan" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-faint">Validated topic</p>
                        <p className="text-sm font-bold text-cyan leading-snug">{topic}</p>
                      </div>
                      <button onClick={() => { setTopic(""); setContentType(null); setCurrentStage(2); }} className="shrink-0 text-[11px] text-faint underline transition hover:text-soft">Change</button>
                    </div>
                  )}

                  {/* Stage heading */}
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber-500/15 text-xs font-bold text-amber-400 ring-1 ring-amber-500/30">3</div>
                    <div>
                      <h2 className="font-display text-lg font-bold">Choose content type &amp; generate</h2>
                      <p className="text-xs text-faint">
                        {selectedTopics.length > 1
                          ? `${selectedTopics.length} reels · ${selectedTopics.length * 8}cr total · select a script style`
                          : "Select a script style, then verify & generate"}
                      </p>
                    </div>
                  </div>

                  {/* Content type chip selector */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {CONTENT_TYPES.map((ct) => {
                      const active = contentType === ct.id;
                      return (
                        <button
                          key={ct.id}
                          onClick={() => setContentType(active ? null : ct.id)}
                          className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all"
                          style={active
                            ? { borderColor: ct.accentColor + "60", background: ct.accentColor + "15", color: ct.accentColor }
                            : { borderColor: "rgb(var(--border))", color: "rgb(var(--text-faint))" }
                          }
                        >
                          <span>{ct.icon}</span>
                          <span>{ct.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Generate row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <ReelsModelToggle stageNum={4} disabled={pipeStatus === "running"} />
                      <span className="flex items-center gap-1 text-xs text-faint">
                        <Zap size={11} className="text-cyan" /> {user.credits} credits
                      </span>
                      {lowCredits && (
                        <Link href="/dashboard/billing" className="text-xs font-semibold text-amber-400 underline">⚡ Upgrade</Link>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleGenerate}
                      disabled={!canGenerate || pipeStatus === "running"}
                      className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition disabled:opacity-40"
                      style={{ background: "linear-gradient(90deg,#38bdf8,#818cf8)", color: "#0a101e" }}
                    >
                      <Zap size={14} /> Verify &amp; Generate
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── PIPELINE ────────────────────────────────────────────────── */}
            <AnimatePresence>
              {pipeStatus !== "idle" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <GenerationPipeline
                    status={awaitingMed ? "running" : pipeStatus}
                    activeStep={activeStep}
                    awaitingMed={awaitingMed}
                    reelProgress={reelProgress}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {medBlocked && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
                ⛔ Evidence score too low. Please select a different topic angle before generating.
              </div>
            )}

            {/* ── STAGE 4/5: Script Output ─────────────────────────────── */}
            <AnimatePresence>
              {finalReels.length > 0 && (
                <motion.div ref={outputRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

                  {/* Output header */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cyan/15 text-xs font-bold text-cyan ring-1 ring-cyan/30">
                        {finalReels.length > 1 ? "🎬" : "4"}
                      </div>
                      <div>
                        <h2 className="font-display text-lg font-bold">
                          {finalReels.length > 1
                            ? `${finalReels.length} Shoot-Ready Reels`
                            : "3 Shoot-Ready Scripts"}
                        </h2>
                        <p className="text-xs text-faint">
                          {finalReels.length > 1
                            ? "Tap any reel to expand · Switch script style with the tabs inside"
                            : "3 script styles for the same topic — pick whichever fits your shoot"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1.5 rounded-xl border border-[rgb(var(--border))] px-3 py-1.5 text-xs text-soft hover:text-cyan transition"
                    >
                      <RotateCcw size={13} /> New Reel
                    </button>
                  </div>

                  {/* ── Style legend (single reel) or Accordion list (batch) ── */}
                  {finalReels.length === 1 ? (
                    /* Single reel — keep the familiar 3-tab / 3-column layout */
                    <ScriptOutput
                      scripts={finalReels[0].scripts}
                      contentTypeId={finalReels[0].contentType}
                      evidenceScore={finalReels[0].medCheck?.evidence_score ?? 75}
                      bucketId={selectedBucket}
                      language="english"
                      onSave={(data) => {
                        try {
                          const h = JSON.parse(localStorage.getItem("magicscript_reels_history") || "[]");
                          h.unshift({ id: "reel_" + Date.now(), keyword, topic: finalReels[0].topic, contentType: finalReels[0].contentType, bucket: selectedBucket, scripts: data, createdAt: new Date().toISOString() });
                          localStorage.setItem("magicscript_reels_history", JSON.stringify(h.slice(0, 50)));
                        } catch {}
                      }}
                    />
                  ) : (
                    /* Batch mode — script-style legend + per-reel accordion cards */
                    <div className="space-y-3">

                      {/* Style legend pill row */}
                      <div className="flex flex-wrap gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-3">
                        <span className="text-[11px] font-semibold text-faint self-center">Script styles inside each reel:</span>
                        {[
                          { icon: "🎬", label: "Cinematic",   desc: "Story-driven AUDIO/VISUAL beats",       color: "#818cf8" },
                          { icon: "📋", label: "Education",   desc: "Straight-to-camera numbered points",    color: "#22d3ee" },
                          { icon: "🔥", label: "Rebel Reach", desc: "Bold hook that drives comments",        color: "#f97316" },
                        ].map((s) => (
                          <span
                            key={s.label}
                            className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold"
                            style={{ borderColor: s.color + "40", color: s.color, background: s.color + "10" }}
                            title={s.desc}
                          >
                            <span>{s.icon}</span>
                            <span>{s.label}</span>
                            <span className="hidden text-[9px] opacity-70 sm:inline">— {s.desc}</span>
                          </span>
                        ))}
                      </div>

                      {/* Accordion cards — first one open by default */}
                      {finalReels.map((reel, idx) => (
                        <BatchReelCard
                          key={idx}
                          reel={reel}
                          index={idx}
                          defaultOpen={idx === 0}
                          onSave={(data) => {
                            try {
                              const h = JSON.parse(localStorage.getItem("magicscript_reels_history") || "[]");
                              h.unshift({ id: "reel_" + Date.now(), keyword, topic: reel.topic, contentType: reel.contentType, bucket: selectedBucket, scripts: data, createdAt: new Date().toISOString() });
                              localStorage.setItem("magicscript_reels_history", JSON.stringify(h.slice(0, 50)));
                            } catch {}
                          }}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state */}
            {currentStage === 1 && !keyword && (
              <div className="hidden lg:flex flex-col items-center justify-center py-12 text-center">
                <p className="text-xs text-faint">Select a topic type on the left to get started</p>
              </div>
            )}

          </div>
        </main>

        {/* ════════════════════════════════════════════════════════════════
            RIGHT PANEL — Quality Report
        ════════════════════════════════════════════════════════════════ */}
        <aside className="hidden w-[272px] shrink-0 flex-col border-l border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] xl:flex">
          <div className="border-b border-[rgb(var(--border))] px-4 py-3">
            <p className="text-sm font-bold">
              {previewTopic ? "Topic Intelligence" : "Quality Report"}
            </p>
            <p className="text-[11px] text-faint">
              {previewTopic ? "Doctor Farmer analysis & signal breakdown" : "Science verification output"}
            </p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-3">
            <AnimatePresence>
              {awaitingMed && medCheck && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <MedQuickCheck topic={topic} medCheck={medCheck} onViewDetails={() => {}} onContinue={handleMedContinue} />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {scripts && medCheck && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3.5">
                    <div className="mb-3 flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-400" />
                      <p className="text-xs font-bold">Evidence Summary</p>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-faint">Score</span>
                        <span className="font-bold text-cyan">{medCheck.evidence_score}/100</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[rgb(var(--bg))]">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${medCheck.evidence_score}%` }}
                          transition={{ duration: 0.8 }}
                          className={`h-full rounded-full ${medCheck.evidence_score >= 70 ? "bg-emerald-500" : medCheck.evidence_score >= 40 ? "bg-amber-500" : "bg-rose-500"}`} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-faint">Safety</span>
                        <span className={`font-semibold ${medCheck.safety_status === "safe" ? "text-emerald-400" : medCheck.safety_status === "caution" ? "text-amber-400" : "text-rose-400"}`}>
                          {medCheck.safety_status === "safe" ? "✅ Safe" : medCheck.safety_status === "caution" ? "⚠️ Caution" : "⛔ Blocked"}
                        </span>
                      </div>
                      {(medCheck.pubmed_references ?? []).length > 0 && (
                        <div className="border-t border-[rgb(var(--border))] pt-1.5">
                          <p className="mb-1 font-semibold text-faint">Sources</p>
                          {medCheck.pubmed_references.map((ref, i) => (
                            <p key={i} className="truncate text-faint leading-relaxed">{ref.split(" - ")[0]}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3.5">
                    <p className="mb-3 text-xs font-bold">Engagement Predictions</p>
                    <div className="space-y-3">
                      {[{ style: "cinematic", emoji: "🎬" }, { style: "education", emoji: "📋" }, { style: "rebel", emoji: "🔥" }].map(({ style, emoji }) => (
                        <div key={style}>
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-faint">{emoji} {style}</p>
                          <EngagementScore contentTypeId={contentType} scriptStyle={style} evidenceScore={medCheck.evidence_score} bucketId={selectedBucket} language="english" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {medCheck.safety_note && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 p-3 text-[11px] text-amber-300 leading-relaxed">
                      ℹ️ {medCheck.safety_note}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stage 2 topic intelligence — shown when a topic is selected in the matrix */}
            <AnimatePresence mode="wait">
              {!scripts && !awaitingMed && previewTopic && (
                <motion.div key="insight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <TopicInsightPanel preview={previewTopic} />
                </motion.div>
              )}
            </AnimatePresence>

            {!scripts && !awaitingMed && !previewTopic && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[rgb(var(--bg))] text-xl">📊</div>
                <p className="text-xs font-semibold text-soft">Awaiting topic</p>
                <p className="mt-1 text-[11px] text-faint">Select a topic in Stage 2 to see its Doctor Farmer score breakdown and signal analysis.</p>
              </div>
            )}
          </div>
        </aside>

      </div>

      <style jsx global>{`
        @keyframes shimmer { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
      `}</style>
    </div>
  );
}
