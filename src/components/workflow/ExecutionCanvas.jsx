"use client";

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

function StatusIcon({ status }) {
  if (status === "running") return <Loader2 size={16} className="animate-spin text-blue-400" />;
  if (status === "done")    return <Check    size={16} className="text-emerald-400" />;
  if (status === "error")   return <AlertTriangle size={16} className="text-red-400" />;
  return <div className="h-2.5 w-2.5 rounded-full border-2 border-[rgb(var(--border))]" />;
}

function AgentNode({ agentType, status }) {
  const agent = AGENT_REGISTRY[agentType];
  if (!agent) return null;

  const colors = CATEGORY_COLORS[agent.color];
  const Icon   = ICON_MAP[agent.icon] || Sparkles;

  const wrapCls = {
    idle:    "border-[rgb(var(--border))] bg-[rgb(var(--panel))] opacity-55",
    running: "border-blue-400/55 bg-blue-500/10 ring-2 ring-blue-400/35 shadow-lg",
    done:    "border-emerald-400/45 bg-emerald-500/8",
    error:   "border-red-400/45 bg-red-500/8",
  }[status] || "border-[rgb(var(--border))] bg-[rgb(var(--panel))] opacity-55";

  return (
    <div
      className={`flex w-full max-w-md items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300 ${wrapCls}`}
    >
      {/* Icon */}
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border ${colors.border} ${colors.bg}`}
      >
        <Icon size={16} className={colors.text} />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight">{agent.name}</p>
        <p className={`mt-0.5 text-[11px] ${colors.text}`}>
          {agent.credits} credit{agent.credits !== 1 ? "s" : ""} · {agent.description.slice(0, 55)}…
        </p>
        {status === "running" && (
          <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-[rgb(var(--border))]">
            <div
              className="h-full w-3/5 rounded-full bg-gradient-to-r from-cyan to-electric animate-shimmer"
              style={{ backgroundSize: "200% 100%" }}
            />
          </div>
        )}
      </div>

      {/* Status */}
      <StatusIcon status={status} />
    </div>
  );
}

function Connector({ active }) {
  return (
    <div className="flex flex-col items-center py-1">
      <div
        className={`w-px h-6 transition-colors duration-500 ${
          active ? "bg-emerald-400/70" : "bg-[rgb(var(--border))]"
        }`}
      />
      <div
        className={`h-0 w-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent transition-colors duration-500 ${
          active ? "border-t-emerald-400/70" : "border-t-[rgb(var(--border))]"
        }`}
      />
    </div>
  );
}

export default function ExecutionCanvas({ preset, nodeStatuses }) {
  if (!preset) return null;

  return (
    <div className="flex flex-col items-center gap-0 py-4">
      {preset.agentTypes.map((agentType, i) => {
        const status   = nodeStatuses[agentType] || "idle";
        const prevDone = i > 0 && nodeStatuses[preset.agentTypes[i - 1]] === "done";

        return (
          <div key={agentType} className="flex w-full max-w-md flex-col items-center">
            {i > 0 && <Connector active={prevDone} />}
            <AgentNode agentType={agentType} status={status} />
          </div>
        );
      })}
    </div>
  );
}
