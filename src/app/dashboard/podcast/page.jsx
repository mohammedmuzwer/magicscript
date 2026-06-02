"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LogOut, UserCircle, CreditCard,
  ChevronDown, RotateCcw, ChevronLeft, History, Loader2,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import Logo from "@/components/ui/logo";
import ThemeToggle from "@/components/ui/theme-toggle";
import { Avatar } from "@/components/dashboard/dashboard-shell";
import WorkspaceModeToggle from "@/components/ui/workspace-mode-toggle";
import { useRouter, useSearchParams } from "next/navigation";

import PodcastLeftPanel from "@/components/podcast/PodcastLeftPanel";
import PodcastChat      from "@/components/podcast/PodcastChat";

import Stage1  from "@/components/podcast/stages/Stage1";
import Stage2  from "@/components/podcast/stages/Stage2";
import Stage3  from "@/components/podcast/stages/Stage3";
import Stage4  from "@/components/podcast/stages/Stage4";
import Stage5  from "@/components/podcast/stages/Stage5";
import Stage6  from "@/components/podcast/stages/Stage6";
import Stage7  from "@/components/podcast/stages/Stage7";
import Stage8  from "@/components/podcast/stages/Stage8";
import Stage9  from "@/components/podcast/stages/Stage9";
import Stage10 from "@/components/podcast/stages/Stage10";

import { PODCAST_STAGES } from "@/lib/podcast/stages";
import { savePodcastEpisode, getPodcastEpisode } from "@/lib/supabaseClient";

const STAGE_COMPONENTS = {
  1:  Stage1,  2:  Stage2,  3:  Stage3,  4:  Stage4,  5:  Stage5,
  6:  Stage6,  7:  Stage7,  8:  Stage8,  9:  Stage9,  10: Stage10,
};

// ─────────────────────────────────────────────────────────────────────────────
export default function PodcastPage() {
  const { user, logout, ready } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const loadId = searchParams?.get("load") ?? null;

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  const [currentStage,   setCurrentStage]   = useState(1);
  const [approvedStages, setApprovedStages] = useState([]); // array of approved stage ids
  const [stageData,      setStageData]      = useState({}); // accumulated data per stage (APPROVED)
  // ── livePreview: a stage's in-progress / unapproved snapshot so the right-side
  //    Stage Chat panel can answer questions about freshly generated content
  //    BEFORE the user clicks "Approve & Continue". Approved data always wins.
  const [livePreview,    setLivePreview]    = useState({}); // { [stageId]: any }
  // ── episodeId: set after Stage 8's first save. Stage 10 reuses it to
  //    UPDATE the same row instead of inserting a duplicate. One row per project.
  const [episodeId,      setEpisodeId]      = useState(null);
  // "idle" | "saving" | "saved" | "error"
  const [dbSaveState,    setDbSaveState]    = useState("idle");
  const [menuOpen,       setMenuOpen]       = useState(false);
  const [demoMode,       setDemoMode]       = useState(false); // false = live (use Gemini key), true = demo

  // ── History hydration ──────────────────────────────────────────────────────
  // When the URL has ?load=<uuid>, fetch the saved episode from Supabase
  // and populate ALL stage state from cache. ZERO LLM API calls are made.
  const [hydrating,      setHydrating]      = useState(false);
  const [hydratedFromId, setHydratedFromId] = useState(null);
  const [hydrationError, setHydrationError] = useState(null);

  useEffect(() => {
    if (!loadId) return;
    if (loadId === hydratedFromId) return; // already hydrated this id

    let cancelled = false;
    setHydrating(true);
    setHydrationError(null);

    getPodcastEpisode(loadId)
      .then((episode) => {
        if (cancelled) return;
        if (!episode) {
          setHydrationError("Episode not found in library.");
          setHydrating(false);
          return;
        }
        // ── DB read only — no LLM calls ─────────────────────────────────────
        const savedStages = episode.stage_data_json ?? {};
        const stageIds = Object.keys(savedStages)
          .map((k) => Number(k))
          .filter((n) => Number.isFinite(n) && n >= 1 && n <= 10)
          .sort((a, b) => a - b);

        setStageData(savedStages);
        setApprovedStages(stageIds);
        setEpisodeId(loadId);  // Editing this same project → next save UPDATEs it
        // Jump to the highest stage that has data (cap at 10)
        const jumpTo = stageIds.length ? Math.min(10, stageIds[stageIds.length - 1]) : 10;
        setCurrentStage(jumpTo);
        setHydratedFromId(loadId);
        setHydrating(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setHydrationError(err?.message || "Could not load episode.");
        setHydrating(false);
      });

    return () => { cancelled = true; };
  }, [loadId, hydratedFromId]);

  // Persist demo mode preference
  useEffect(() => {
    const stored = localStorage.getItem("ms_demo_mode");
    if (stored !== null) setDemoMode(stored === "true");
  }, []);

  function toggleDemoMode() {
    setDemoMode((prev) => {
      const next = !prev;
      localStorage.setItem("ms_demo_mode", String(next));
      return next;
    });
  }

  const centerRef = useRef(null);

  if (!ready || !user) return null;

  const currentStageDef = PODCAST_STAGES.find((s) => s.id === currentStage);

  // Called by each stage component when the user clicks Approve & Continue
  function handleStageComplete(stageId, data) {
    // Record the data from this stage
    const updatedStageData = { ...stageData, [stageId]: data };
    setStageData(updatedStageData);

    // Mark it approved (if not already)
    setApprovedStages((prev) => {
      if (prev.includes(stageId)) return prev;
      return [...prev, stageId];
    });

    // ── Stage 8 complete → save (INSERT or UPDATE) one row per project ────
    if (stageId === 8) {
      // Robust topic extraction — || (not ??) lets empty strings fall through.
      const topic      =
            updatedStageData[2]?.locked_topic
         || updatedStageData[1]?.topic?.title
         || updatedStageData[1]?.topic?.reframe?.title
         || updatedStageData[1]?.keyword
         || "Untitled Episode";
      const finalScript = data;                          // Stage 8 output = full script JSON
      const showDesign  = updatedStageData[7] ?? null;  // Stage 7 show design

      setDbSaveState("saving");
      // Pass episodeId so we UPDATE if this project was already saved
      // (e.g. user came back to Stage 8 after a previous save, or hydrated from history).
      savePodcastEpisode({ id: episodeId, topic, finalScript, showDesign, allStageData: updatedStageData })
        .then((result) => {
          if (result?.id) {
            console.log("[podcast] Episode saved to Supabase:", result.id, episodeId ? "(updated)" : "(inserted)");
            setEpisodeId(result.id);  // Remember the row id for Stage 10's update
            setDbSaveState("saved");
            setTimeout(() => setDbSaveState("idle"), 4000);
          } else {
            setDbSaveState("error");
            setTimeout(() => setDbSaveState("idle"), 5000);
          }
        })
        .catch(() => {
          setDbSaveState("error");
          setTimeout(() => setDbSaveState("idle"), 5000);
        });
    }

    // Advance to next stage
    const next = stageId + 1;
    if (next <= 10) {
      setCurrentStage(next);
      centerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleReset() {
    setCurrentStage(1);
    setApprovedStages([]);
    setStageData({});
    setLivePreview({});  // Clear in-progress previews too
    setEpisodeId(null);  // Fresh project → next save will INSERT a new row
    setHydratedFromId(null);
    setHydrationError(null);
    // Strip ?load=<id> from the URL so a fresh session starts cleanly
    if (loadId) router.replace("/dashboard/podcast");
    centerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleGoToStage(id) {
    setCurrentStage(id);
    centerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  const StageComponent = STAGE_COMPONENTS[currentStage];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[rgb(var(--bg))]">

      {/* ── TOP NAV (h-16 — matches Agents / History pages) ──────────────── */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[rgb(var(--border))] glass-strong px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Logo className="h-7 w-auto" href="/dashboard" />
          <WorkspaceModeToggle activeOverride="podcast" />
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

      {/* ── History hydration banner (when ?load=<id> is active) ──────────── */}
      {hydrating && (
        <div className="shrink-0 flex items-center gap-2 bg-violet-500/10 border-b border-violet-500/20 px-4 py-2 text-xs font-semibold text-violet-300">
          <Loader2 size={12} className="animate-spin" />
          Loading saved episode from library — no AI calls will be made…
        </div>
      )}
      {!hydrating && hydratedFromId && !hydrationError && (
        <div className="shrink-0 flex items-center justify-between gap-2 bg-violet-500/8 border-b border-violet-500/20 px-4 py-2 text-xs font-semibold text-violet-300">
          <span className="flex items-center gap-2">
            <History size={12} />
            Viewing saved episode from library · all stages hydrated from cache · zero API calls
          </span>
          <button
            onClick={handleReset}
            className="rounded-lg border border-violet-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-300 hover:bg-violet-500/15 transition"
          >
            Start new podcast
          </button>
        </div>
      )}
      {hydrationError && (
        <div className="shrink-0 flex items-center gap-2 bg-rose-500/10 border-b border-rose-500/20 px-4 py-2 text-xs font-semibold text-rose-400">
          <span className="h-2 w-2 rounded-full bg-rose-400" />
          {hydrationError}
        </div>
      )}

      {/* ── DB Save status toast (appears after Stage 8 approval) ─────────── */}
      {dbSaveState !== "idle" && (
        <div className={`shrink-0 flex items-center gap-2 px-4 py-2 text-xs font-semibold transition-all ${
          dbSaveState === "saving" ? "bg-cyan/10 text-cyan border-b border-cyan/20" :
          dbSaveState === "saved"  ? "bg-emerald-500/10 text-emerald-400 border-b border-emerald-500/20" :
          "bg-rose-500/10 text-rose-400 border-b border-rose-500/20"
        }`}>
          {dbSaveState === "saving" && <>
            <span className="h-2 w-2 rounded-full bg-cyan animate-pulse" />
            Saving episode to database…
          </>}
          {dbSaveState === "saved" && <>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Episode saved to Supabase ✓ — available in History
          </>}
          {dbSaveState === "error" && <>
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            Could not save to database — check Supabase connection in Settings
          </>}
        </div>
      )}

      {/* ── 3-PANEL BODY ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — Stage Navigator */}
        <PodcastLeftPanel
          currentStage={currentStage}
          approvedStages={approvedStages}
          onGoToStage={handleGoToStage}
        />

        {/* CENTER — Stage Content */}
        <main ref={centerRef} className="flex-1 overflow-y-auto">
          {/* Stage header banner */}
          <div className="sticky top-0 z-10 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))]/90 backdrop-blur">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3">
                {/* Back button */}
                {currentStage > 1 && (
                  <button
                    onClick={() => handleGoToStage(currentStage - 1)}
                    className="flex items-center gap-1 rounded-lg border border-[rgb(var(--border))] px-2 py-1.5 text-xs text-faint hover:text-soft hover:border-cyan/30 transition"
                  >
                    <ChevronLeft size={13} /> Back
                  </button>
                )}
                <span className="text-lg">{currentStageDef?.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-faint">Stage {currentStage} of 10</span>
                    {currentStageDef?.authorityFirewall && (
                      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">Authority Firewall</span>
                    )}
                  </div>
                  <p className="text-sm font-bold">{currentStageDef?.label}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Demo mode toggle */}
                <button
                  onClick={toggleDemoMode}
                  title={demoMode ? "Demo ON — click to use live Gemini API" : "Live mode — click to switch to demo"}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition hover:brightness-110 ${
                    demoMode
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${demoMode ? "bg-amber-400" : "bg-emerald-400"}`} />
                  {demoMode ? "Demo ON" : "Live API"}
                </button>
                {approvedStages.length > 0 && (
                  <button onClick={handleReset}
                    className="flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] px-3 py-1.5 text-xs text-faint hover:text-soft transition">
                    <RotateCcw size={12} /> New Podcast
                  </button>
                )}
              </div>
            </div>

            {/* Topic journey strip — shows once topic is locked */}
            {stageData[1]?.topic?.title && (
              <div className="flex items-center gap-2 border-t border-[rgb(var(--border))] bg-cyan/5 px-6 py-1.5">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-cyan shrink-0">Topic</span>
                <span className="text-[11px] font-semibold text-[rgb(var(--text))] truncate">
                  {stageData[1].topic.title}
                </span>
                {stageData[1].topic.category && (
                  <span className="ml-auto shrink-0 text-[9px] font-bold uppercase tracking-wide text-faint">
                    {stageData[1].topic.category}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Stage body */}
          <div className="px-6 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStage}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {StageComponent && (
                  <StageComponent
                    data={stageData}
                    onComplete={(data) => handleStageComplete(currentStage, data)}
                    onPreview={(preview) =>
                      setLivePreview((prev) => ({ ...prev, [currentStage]: preview }))
                    }
                    demoMode={demoMode}
                    episodeId={episodeId}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* RIGHT — Chat Box (sees approved data + the active stage's live preview) */}
        <PodcastChat
          currentStage={currentStage}
          stageData={{
            ...livePreview,   // unapproved snapshots — overridden if approved exists
            ...stageData,     // approved snapshots always win
          }}
          demoMode={demoMode}
        />
      </div>

    </div>
  );
}
