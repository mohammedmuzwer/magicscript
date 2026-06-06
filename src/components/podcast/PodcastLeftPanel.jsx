"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Lock, Circle, ShieldAlert, KeyRound, Zap } from "lucide-react";
import { PODCAST_STAGES } from "@/lib/podcast/stages";
import { getModelPref, DEFAULT_MODEL_PREFS } from "@/lib/podcast/model-preference";

// ── Credit costs (Gemini base × multiplier) ───────────────────────────────────
const PODCAST_BASE_CREDITS = 20; // full 10-stage run at Gemini rate
const MODEL_MULTIPLIER = { gemini: 1, claude: 1.5, demo: 1 };

function podcastCost(model = "gemini") {
  return Math.round(PODCAST_BASE_CREDITS * (MODEL_MULTIPLIER[model] ?? 1));
}

// ── API key + enabled helpers ─────────────────────────────────────────────────
const PANEL_MODELS = [
  {
    id: "gemini", label: "Gemini", icon: "✦",
    lsKey: "V_KEY_GOOGLE",
    activeClass: "bg-[#1a73e8] text-white border-transparent",
    dotColor: "#1a73e8",
    settingsHint: "Add a Google AI key in Settings → API",
  },
  {
    id: "claude", label: "Claude", icon: "◆",
    lsKey: "V_KEY_CLAUDE",
    activeClass: "bg-[rgb(var(--bg-active-tint))] border-[rgb(var(--accent))]/25 text-[rgb(var(--accent))]",
    dotColor: "rgb(var(--accent))",
    settingsHint: "Add an Anthropic key in Settings → API",
  },
];

function hasKey(lsKey) {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(lsKey);
}
function isApiEnabled(lsKey) {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(lsKey + "_ENABLED") !== "false";
}

// ── Stage row ─────────────────────────────────────────────────────────────────
function StageRow({ stage, status, onClick }) {
  const isApproved  = status === "approved";
  const isActive    = status === "active";
  const isLocked    = status === "locked";
  const c = stage.color;
  const filled = isActive || isApproved;
  const dotStyle = filled
    ? { background: c, color: "#ffffff" }
    : { background: c + "26", color: c + "99" };

  return (
    <button
      onClick={() => !isLocked && onClick(stage.id)}
      disabled={isLocked}
      className={`group flex w-full items-center gap-2.5 rounded-lg text-left transition-all ${
        isLocked ? "cursor-default" : "hover:bg-[rgb(var(--bg-soft))]"
      }`}
      style={{
        padding: "7px 10px",
        background: isActive ? c + "0f" : undefined,
        boxShadow: isActive ? `inset 2px 0 0 0 ${c}` : undefined,
      }}
    >
      <span
        className="grid shrink-0 place-items-center rounded-full text-[10px] font-bold tabular-nums"
        style={{ width: 22, height: 22, ...dotStyle }}
      >
        {isApproved ? <CheckCircle2 size={11} /> : `${stage.id}`}
      </span>
      <span
        className="flex-1 truncate"
        style={{
          fontSize: 12,
          fontWeight: isActive ? 700 : isApproved ? 600 : 500,
          color: isLocked ? "rgb(var(--text-faint))" : "rgb(var(--text))",
        }}
      >
        {stage.label}
      </span>
      {isLocked    && <Lock size={11} className="shrink-0 text-faint/50" />}
      {stage.authorityFirewall && !isLocked && (
        <ShieldAlert size={10} className="shrink-0" style={{ color: "#10b981" }} />
      )}
    </button>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
export default function PodcastLeftPanel({
  currentStage,
  approvedStages = [],
  onGoToStage,
  demoMode = false,
  onToggleDemoMode,
  userCredits = 0,
}) {
  const [apiStatus,     setApiStatus]     = useState({ gemini: false, claude: false });
  const [activeModel,   setActiveModel]   = useState("gemini");

  // ── API key status ────────────────────────────────────────────────────────
  useEffect(() => {
    const check = () => setApiStatus({
      gemini: hasKey("V_KEY_GOOGLE") && isApiEnabled("V_KEY_GOOGLE"),
      claude: hasKey("V_KEY_CLAUDE") && isApiEnabled("V_KEY_CLAUDE"),
    });
    check();
    window.addEventListener("storage", check);
    window.addEventListener("apiEnabledChange", check);
    return () => {
      window.removeEventListener("storage", check);
      window.removeEventListener("apiEnabledChange", check);
    };
  }, []);

  // ── Sync active model from current stage's inline ModelToggle ─────────────
  useEffect(() => {
    setActiveModel(getModelPref(currentStage));
  }, [currentStage]);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.stageNum === currentStage) {
        setActiveModel(e.detail.model);
      }
    };
    window.addEventListener("modelPrefChange", handler);
    return () => window.removeEventListener("modelPrefChange", handler);
  }, [currentStage]);

  // ── Stage navigation ──────────────────────────────────────────────────────
  function getStatus(stageId) {
    if (approvedStages.includes(stageId)) return "approved";
    if (stageId === currentStage)          return "active";
    const maxApproved = approvedStages.length ? Math.max(...approvedStages) : 0;
    return stageId <= maxApproved + 1 ? "available" : "locked";
  }

  const progress    = approvedStages.length / PODCAST_STAGES.length;
  const displayModel = demoMode ? "demo" : activeModel;
  const runCost      = podcastCost(displayModel);

  return (
    <aside className="hidden w-[200px] shrink-0 flex-col border-r border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] lg:flex">

      {/* ── Header ── */}
      <div className="border-b border-[rgb(var(--border))] px-3.5 pt-3.5 pb-3">
        <p className="font-display text-sm font-bold text-[rgb(var(--text))]">Podcast Builder</p>
        <p className="text-[11px] font-medium text-faint">10-Stage Production Pipeline</p>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-faint">
            {approvedStages.length}/{PODCAST_STAGES.length} stages complete
          </span>
          <span className="text-[10px] font-bold text-[rgb(var(--accent))]">{Math.round(progress * 100)}%</span>
        </div>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[rgb(var(--panel-soft))]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg,#22d3ee,#818cf8)" }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Demo badge */}
      {demoMode && (
        <div className="flex justify-center border-b border-[rgb(var(--border))] py-2">
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
            color: "#d97706", background: "rgba(217,119,6,0.10)",
            border: "0.5px solid rgba(217,119,6,0.25)", borderRadius: 4, padding: "2px 8px",
          }}>
            DEMO MODE
          </span>
        </div>
      )}

      {/* ── Stage list ── */}
      <div className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {PODCAST_STAGES.map((stage) => (
          <StageRow
            key={stage.id}
            stage={stage}
            status={getStatus(stage.id)}
            onClick={onGoToStage}
          />
        ))}
      </div>

      {/* ── Credits display ── */}
      <div className="border-t border-[rgb(var(--border))] px-3 pt-3 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-faint flex items-center gap-1 mb-2">
          <Zap size={9} className="text-[rgb(var(--accent))]" /> Est. Cost
        </p>
        <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-[rgb(var(--text))]">{runCost}</span>
            <span className="text-xs font-bold text-faint">cr</span>
            {displayModel !== "gemini" && displayModel !== "demo" && (
              <span className="text-[9px] text-faint ml-1">
                ({displayModel} ×{displayModel === "claude" ? "1.5" : "1.3"})
              </span>
            )}
          </div>
          <p className="text-[10px] text-faint mt-0.5">Full 10-stage run</p>
          <div className="h-px bg-[rgb(var(--border))] my-1.5" />
          <p className="text-[10px] text-faint">{userCredits} cr remaining</p>
        </div>
      </div>

      {/* ── Model selector ── */}
      <div className="px-3 pt-2 pb-2 space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-faint">
          {demoMode ? "Model (demo mode)" : "Model"}
        </p>
        <div className="flex flex-col gap-1">
          {PANEL_MODELS.map((m) => {
            const keyExists  = hasKey(m.lsKey);
            const apiEnabled = apiStatus[m.id];
            const isPaused   = keyExists && !apiEnabled && !demoMode;
            const isDisabled = demoMode || !apiEnabled;
            const isSelected = activeModel === m.id && !demoMode;

            const tooltip = demoMode
              ? "Disabled in demo mode"
              : isPaused
              ? `${m.label} is paused — go to Settings → API Keys and turn it ON`
              : !keyExists
              ? m.settingsHint
              : `${m.label} active`;

            return (
              <div
                key={m.id}
                title={tooltip}
                className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-all ${
                  isDisabled
                    ? "opacity-40 border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] cursor-not-allowed"
                    : isSelected
                    ? m.activeClass + " border"
                    : "border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] text-faint"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </span>
                <span className="flex items-center gap-1">
                  {isPaused   && <span style={{ fontSize: 8, fontWeight: 700, color: "#d97706" }}>OFF</span>}
                  {!keyExists && !demoMode && <KeyRound size={9} className="text-faint/50" />}
                  {isSelected && !isDisabled && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Live API / Demo toggle */}
        {onToggleDemoMode && (
          <button
            onClick={onToggleDemoMode}
            className={`mt-1 flex w-full items-center justify-between rounded-xl border px-3 py-2 transition-all duration-200 ${
              demoMode ? "border-orange-400/30 bg-orange-400/10" : "border-emerald-500/30 bg-emerald-500/10"
            }`}
          >
            <span className={`text-[11px] font-bold tracking-wide ${demoMode ? "text-orange-400" : "text-emerald-400"}`}>
              {demoMode ? "Demo" : "Live API"}
            </span>
            <div style={{ position: "relative", width: 52, height: 28, borderRadius: 14, flexShrink: 0, backgroundColor: demoMode ? "#fb923c" : "#22c55e", transition: "background-color 0.25s ease" }}>
              <div style={{ position: "absolute", top: 2, left: 2, width: 24, height: 24, borderRadius: "50%", backgroundColor: "#ffffff", boxShadow: "0 2px 4px rgba(0,0,0,0.3)", transform: demoMode ? "translateX(24px)" : "translateX(0px)", transition: "transform 0.25s ease" }} />
            </div>
          </button>
        )}
      </div>

      {/* ── Fact-Check Grades Legend ── */}
      <div className="border-t border-[rgb(var(--border))] px-3 pt-2.5 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-faint mb-2">Fact-Check Grades</p>
        {[
          { color: "#22c55e", label: "Green — verified" },
          { color: "#f59e0b", label: "Yellow — partial" },
          { color: "#ef4444", label: "Red — no source" },
          { color: "#3b82f6", label: "Blue — clinical" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2 text-[10px] text-faint mb-1">
            <div className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>
    </aside>
  );
}
