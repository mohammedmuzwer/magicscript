"use client";

import { Handle, Position } from "reactflow";
import {
  Lightbulb, TrendingUp, BookOpen, CheckCircle, Shield,
  Sparkles, Layout, FileText, Layers, Globe, Star,
  Loader2, Check, AlertTriangle,
} from "lucide-react";
import { AGENT_REGISTRY, CATEGORY_COLORS } from "@/lib/agents/registry";

const ICON_MAP = {
  Lightbulb, TrendingUp, BookOpen, CheckCircle, Shield,
  Sparkles, Layout, FileText, Layers, Globe, Star,
};

const STATUS_RING = {
  idle:    "",
  running: "ring-2 ring-blue-400/60 animate-pulse",
  done:    "ring-2 ring-emerald-400/70",
  error:   "ring-2 ring-red-400/70",
};

export default function AgentNode({ data, selected }) {
  const agent = AGENT_REGISTRY[data.agentType];
  if (!agent) return null;

  const colors = CATEGORY_COLORS[agent.color];
  const Icon   = ICON_MAP[agent.icon] || Sparkles;
  const status = data.status || "idle";

  return (
    <div
      className={`
        relative w-[200px] rounded-[12px] border px-3 py-2.5
        transition-all duration-200 cursor-pointer
        ${colors.bg} ${colors.border}
        ${selected ? `ring-2 ${colors.ring} shadow-lg ${colors.glow}` : "shadow-md"}
        ${STATUS_RING[status]}
      `}
      style={{ fontFamily: "inherit" }}
    >
      {/* Left handle — input */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !border-2 !border-[rgb(var(--border))] !bg-[rgb(var(--panel))] hover:!bg-cyan"
        style={{ left: -6 }}
      />

      <div className="flex items-center gap-2.5">
        {/* Agent number + icon */}
        <div className="relative">
          <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${colors.border} ${colors.bg}`}>
            <Icon size={15} className={colors.text} />
          </div>
          {agent.agentNumber && (
            <span className={`absolute -right-1.5 -top-1.5 grid h-3.5 w-3.5 place-items-center rounded-full text-[7px] font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
              {agent.agentNumber}
            </span>
          )}
        </div>

        {/* Label */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold leading-tight" style={{ color: "rgb(var(--text))" }}>
            {agent.name}
          </p>
          <p className={`text-[10px] font-medium ${colors.text}`}>
            {agent.credits} credit{agent.credits !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Status indicator */}
        <div className="shrink-0">
          {status === "running" && <Loader2 size={14} className="animate-spin text-blue-400" />}
          {status === "done"    && <Check    size={14} className="text-emerald-400" />}
          {status === "error"   && <AlertTriangle size={14} className="text-red-400" />}
          {status === "idle"    && <div className="h-2 w-2 rounded-full bg-[rgb(var(--border))]" />}
        </div>
      </div>

      {/* Progress bar for running state */}
      {status === "running" && (
        <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-[rgb(var(--border))]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan to-electric animate-shimmer"
            style={{ width: "60%", backgroundSize: "200% 100%" }}
          />
        </div>
      )}

      {/* Result preview */}
      {status === "done" && data.result && (
        <div className="mt-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/8 px-2 py-1">
          <p className="truncate text-[9px] font-medium text-emerald-300">
            ✓ Output ready
          </p>
        </div>
      )}

      {/* Right handle — output */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !border-2 !border-[rgb(var(--border))] !bg-[rgb(var(--panel))] hover:!bg-cyan"
        style={{ right: -6 }}
      />
    </div>
  );
}
