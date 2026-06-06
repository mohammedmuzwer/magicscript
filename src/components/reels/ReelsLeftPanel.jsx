"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Lock, KeyRound } from "lucide-react";
import { getReelsModelPref, setReelsModelPref } from "@/lib/reels/stages";

// ── Micro Content — 5 navigable stages with vibrant identity colours ──────────
const MICRO_STAGES = [
  { id: 1, label: "Topic Discovery",   color: "#2563eb" }, // Electric Blue
  { id: 2, label: "Topic Validation",  color: "#7c3aed" }, // Vivid Violet
  { id: 3, label: "Med Quick-Check",   color: "#ef4444" }, // Crimson Red
  { id: 4, label: "Script Generation", color: "#ec4899" }, // Hot Pink
  { id: 5, label: "Final Output",      color: "#10b981" }, // Emerald
];

// ── Model definitions ─────────────────────────────────────────────────────────
const MODELS = [
  { id: "gemini",  label: "Gemini",  icon: "✦", lsKeys: ["V_KEY_GOOGLE", "ms_gemini_key"],    activeClass: "bg-[#1a73e8] text-white border-transparent",                                              settingsHint: "Add a Google AI key in Settings → API" },
  { id: "claude",  label: "Claude",  icon: "◆", lsKeys: ["V_KEY_CLAUDE", "ms_anthropic_key"],  activeClass: "bg-[rgb(var(--bg-active-tint))] border-[rgb(var(--accent))]/25 text-[rgb(var(--accent))]", settingsHint: "Add an Anthropic key in Settings → API" },
  { id: "chatgpt", label: "ChatGPT", icon: "⊕", lsKeys: ["V_KEY_GPT", "ms_openai_key"],        activeClass: "bg-emerald-500/15 border-emerald-500/25 text-emerald-400",                                settingsHint: "Add an OpenAI key in Settings → API" },
];

function hasKey(lsKeys) {
  if (typeof window === "undefined") return false;
  return lsKeys.some((k) => !!localStorage.getItem(k));
}

function isEnabled(lsKeys) {
  if (typeof window === "undefined") return true;
  // Use the first key as the primary key for the enabled check
  const primaryKey = lsKeys[0];
  return localStorage.getItem(primaryKey + "_ENABLED") !== "false";
}

// ── Stage row — vibrant colored dot, no numbers in the name ───────────────────
function StageRow({ stage, status, onClick }) {
  const isApproved = status === "approved";
  const isActive   = status === "active";
  const isLocked   = status === "locked";
  const c = stage.color;

  const filled = isActive || isApproved;
  const dotStyle = filled
    ? { background: c, color: "#ffffff" }
    : { background: c + "26", color: c + "99" }; // locked: 15% bg, 60% colour text

  return (
    <button
      onClick={() => !isLocked && onClick(stage.id)}
      disabled={isLocked}
      className={`group flex w-full items-center gap-2.5 rounded-lg text-left transition-all ${
        isApproved ? "hover:bg-[rgb(var(--bg-soft))]" : isLocked ? "cursor-default" : "hover:bg-[rgb(var(--bg-soft))]"
      }`}
      style={{
        padding: "7px 10px",
        background: isActive ? c + "0f" : undefined,           // active: 6% tint
        boxShadow: isActive ? `inset 2px 0 0 0 ${c}` : undefined, // active: 2px left border
      }}
    >
      <span
        className="grid shrink-0 place-items-center rounded-full text-[11px] font-bold tabular-nums"
        style={{ width: 26, height: 26, ...dotStyle }}
      >
        {isApproved ? <Check size={13} strokeWidth={3} /> : `S${stage.id}`}
      </span>
      <span
        className="flex-1 truncate"
        style={{
          fontSize: 13,
          fontWeight: isActive ? 700 : isApproved ? 600 : 500,
          color: isLocked ? "rgb(var(--text-faint))" : "rgb(var(--text))",
        }}
      >
        {stage.label}
      </span>
      {isLocked && <Lock size={12} className="shrink-0 text-faint/50" />}
    </button>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
export default function ReelsLeftPanel({
  currentStage,
  approvedStages = [],
  onGoToStage,
  demoMode = false,
  onToggleDemoMode,
}) {
  const [modelPref, setModelPrefState] = useState("gemini");
  const [apiStatus, setApiStatus]      = useState({ gemini: false, claude: false, chatgpt: false });

  useEffect(() => {
    const check = () => setApiStatus({
      gemini:  hasKey(MODELS[0].lsKeys) && isEnabled(MODELS[0].lsKeys),
      claude:  hasKey(MODELS[1].lsKeys) && isEnabled(MODELS[1].lsKeys),
      chatgpt: hasKey(MODELS[2].lsKeys) && isEnabled(MODELS[2].lsKeys),
    });
    check();
    window.addEventListener("storage", check);
    // Also re-check when user toggles ON/OFF on the API Keys page
    window.addEventListener("apiEnabledChange", check);
    return () => {
      window.removeEventListener("storage", check);
      window.removeEventListener("apiEnabledChange", check);
    };
  }, []);

  useEffect(() => {
    setModelPrefState(getReelsModelPref(4));
    const handler = (e) => { if (e.detail?.stageNum === 4) setModelPrefState(e.detail.model); };
    window.addEventListener("reelsModelPrefChange", handler);
    return () => window.removeEventListener("reelsModelPrefChange", handler);
  }, []);

  function handleModelSelect(modelId) {
    if (demoMode || !apiStatus[modelId]) return;
    setModelPrefState(modelId);
    setReelsModelPref(4, modelId);
    window.dispatchEvent(new CustomEvent("reelsModelPrefChange", { detail: { stageNum: 4, model: modelId } }));
  }

  const approved5 = approvedStages.filter((id) => id <= 5);
  const cur = Math.min(5, currentStage);

  function getStatus(id) {
    if (approved5.includes(id)) return "approved";
    if (id === cur)             return "active";
    const max = approved5.length ? Math.max(...approved5) : 0;
    return id <= max + 1 ? "available" : "locked";
  }

  const progress = approved5.length / MICRO_STAGES.length;

  return (
    <aside className="hidden w-[200px] shrink-0 flex-col border-r border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] lg:flex">

      {/* Title */}
      <div className="border-b border-[rgb(var(--border))] px-3.5 pt-3.5 pb-3">
        <p className="font-display text-sm font-bold text-[rgb(var(--text))]">Micro Content Builder</p>
        <p className="text-[11px] font-medium text-faint">5-Stage Reel Pipeline</p>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-faint">
            {approved5.length}/{MICRO_STAGES.length} stages complete
          </span>
          <span className="text-[10px] font-bold text-[rgb(var(--accent))]">{Math.round(progress * 100)}%</span>
        </div>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[rgb(var(--panel-soft))]">
          <motion.div className="h-full rounded-full bg-[rgb(var(--accent))]"
            animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.5 }} />
        </div>
      </div>

      {/* Demo badge */}
      {demoMode && (
        <div className="flex justify-center border-b border-[rgb(var(--border))] py-2">
          <span
            className="inline-flex items-center"
            style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "#d97706", background: "rgba(217,119,6,0.10)", border: "0.5px solid rgba(217,119,6,0.25)", borderRadius: 4, padding: "2px 8px" }}
          >
            DEMO MODE
          </span>
        </div>
      )}

      {/* Stage list */}
      <div className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {MICRO_STAGES.map((stage) => (
          <StageRow key={stage.id} stage={stage} status={getStatus(stage.id)} onClick={onGoToStage} />
        ))}
      </div>

      {/* Model selector — pb-14 clears the fixed 52px bottom bar */}
      <div className="space-y-2 border-t border-[rgb(var(--border))] px-3 pt-3 pb-14">
        <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-faint">
          {demoMode ? "Model (demo mode)" : "Model"}
        </p>
        <div className="flex flex-col gap-1">
          {MODELS.map((m) => {
            const hasApiKey   = hasKey(m.lsKeys);
            const apiEnabled  = apiStatus[m.id]; // true only if key exists AND toggle is ON
            const isPaused    = hasApiKey && !apiEnabled && !demoMode;
            const isSelected  = modelPref === m.id;
            const isDisabled  = demoMode || !apiEnabled;

            const tooltip = demoMode
              ? "Disabled in demo mode"
              : isPaused
              ? `${m.label} is paused — go to Settings → API Keys and turn it ON`
              : !hasApiKey
              ? m.settingsHint
              : `Use ${m.label}`;

            return (
              <button
                key={m.id}
                onClick={() => handleModelSelect(m.id)}
                disabled={isDisabled}
                title={tooltip}
                className={`w-full rounded-lg border px-2.5 py-1.5 text-left text-[12px] font-medium transition-all ${
                  isDisabled
                    ? "cursor-not-allowed border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] opacity-40"
                    : isSelected
                    ? m.activeClass
                    : "border-[rgb(var(--border))] bg-[rgb(var(--panel-soft))] text-faint hover:text-soft"
                }`}
              >
                <span className="flex items-center justify-between gap-1">
                  <span className="flex items-center gap-1.5"><span>{m.icon}</span><span>{m.label}</span></span>
                  {isPaused && <span style={{ fontSize: 8, fontWeight: 700, color: "#d97706" }}>OFF</span>}
                  {!hasApiKey && !demoMode && <KeyRound size={9} className="shrink-0 text-faint/50" />}
                  {demoMode && <Lock size={9} className="shrink-0 text-faint/50" />}
                </span>
              </button>
            );
          })}
        </div>

        {!demoMode && !Object.values(apiStatus).some(Boolean) && (
          <p className="text-[9px] leading-snug text-faint/50 pt-0.5">
            Add API keys in{" "}
            <a href="/dashboard/settings" className="underline hover:text-faint">Settings → API</a>
          </p>
        )}

        {/* Demo / Live API toggle */}
        {onToggleDemoMode && (
          <button
            onClick={onToggleDemoMode}
            className={`mt-1 flex w-full items-center justify-between rounded-xl border px-3 py-2 transition-all duration-200 ${
              demoMode ? "border-orange-400/30 bg-orange-400/10" : "border-emerald-500/30 bg-emerald-500/10"
            }`}
          >
            <span className={`text-[11px] font-bold tracking-wide ${demoMode ? "text-orange-400" : "text-emerald-400"}`}
              style={demoMode ? { color: "#d97706" } : undefined}>
              {demoMode ? "Demo" : "Live API"}
            </span>
            <div style={{ position: "relative", width: 52, height: 28, borderRadius: 14, flexShrink: 0, backgroundColor: demoMode ? "#fb923c" : "#22c55e", transition: "background-color 0.25s ease" }}>
              <div style={{ position: "absolute", top: 2, left: 2, width: 24, height: 24, borderRadius: "50%", backgroundColor: "#ffffff", boxShadow: "0 2px 4px rgba(0,0,0,0.3)", transform: demoMode ? "translateX(24px)" : "translateX(0px)", transition: "transform 0.25s ease" }} />
            </div>
          </button>
        )}
      </div>
    </aside>
  );
}
