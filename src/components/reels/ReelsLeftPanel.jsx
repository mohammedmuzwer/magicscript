"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Lock, Circle, ShieldAlert } from "lucide-react";
import { REELS_STAGES } from "@/lib/reels/stages";

function StageRow({ stage, status, onClick }) {
  const isApproved  = status === "approved";
  const isActive    = status === "active";
  const isAvailable = status === "available";
  const isLocked    = status === "locked";

  return (
    <button
      onClick={() => (isApproved || isActive || isAvailable) && onClick(stage.id)}
      disabled={isLocked}
      className={`group flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all ${
        isActive
          ? "bg-[rgb(var(--panel))] border"
          : isApproved
          ? "hover:bg-[rgb(var(--panel))]/50"
          : isAvailable
          ? "hover:bg-[rgb(var(--panel))]/30"
          : "opacity-40 cursor-not-allowed"
      }`}
      style={isActive ? { borderColor: stage.color + "50" } : {}}
    >
      {/* Status icon */}
      <div className="mt-0.5 shrink-0">
        {isApproved ? (
          <CheckCircle2 size={14} style={{ color: stage.color }} />
        ) : isActive ? (
          <div
            className="h-3.5 w-3.5 rounded-full border-2 animate-pulse"
            style={{ borderColor: stage.color, backgroundColor: stage.color + "30" }}
          />
        ) : isLocked ? (
          <Lock size={13} className="text-faint" />
        ) : (
          <Circle size={13} className="text-faint" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-faint">
            {stage.id}.
          </span>
          <p className={`text-xs font-semibold truncate ${
            isActive ? "text-[rgb(var(--text))]" : isApproved ? "text-soft" : "text-faint"
          }`}>
            {stage.label}
          </p>
          {stage.authorityFirewall && (
            <ShieldAlert size={11} className="shrink-0" style={{ color: "#10b981" }} />
          )}
        </div>
        {isActive && (
          <p className="text-[10px] text-faint leading-snug mt-0.5 truncate">{stage.desc}</p>
        )}
      </div>
    </button>
  );
}

/**
 * Reels stage navigator — 5-stage condensed pipeline.
 * Mirrors PodcastLeftPanel exactly in look and behaviour.
 */
export default function ReelsLeftPanel({ currentStage, approvedStages = [], onGoToStage }) {
  function getStatus(stageId) {
    if (approvedStages.includes(stageId)) return "approved";
    if (stageId === currentStage)         return "active";
    const maxApproved = approvedStages.length ? Math.max(...approvedStages) : 0;
    if (stageId <= maxApproved + 1)       return "available";
    return "locked";
  }

  const progress = approvedStages.length / REELS_STAGES.length;

  return (
    <aside className="hidden w-[260px] shrink-0 flex-col border-r border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] lg:flex">

      {/* Header */}
      <div className="border-b border-[rgb(var(--border))] px-4 py-3">
        <p className="text-sm font-bold">Reel Builder</p>
        <p className="text-[11px] text-faint">5-Stage Production Pipeline</p>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-faint mb-1">
            <span>{approvedStages.length} of {REELS_STAGES.length} stages approved</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-1 w-full rounded-full bg-[rgb(var(--border))]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg,#22d3ee,#818cf8)" }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Stage list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {REELS_STAGES.map((stage) => (
          <StageRow
            key={stage.id}
            stage={stage}
            status={getStatus(stage.id)}
            onClick={onGoToStage}
          />
        ))}
      </div>

      {/* Legend — Fact-check grades (same as Podcast for consistency) */}
      <div className="border-t border-[rgb(var(--border))] p-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-faint mb-2">
          Fact-Check Grades
        </p>
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
