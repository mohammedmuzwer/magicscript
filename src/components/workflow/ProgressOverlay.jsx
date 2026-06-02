"use client";

import { useEffect, useState } from "react";
import { Loader2, Check, AlertTriangle, Zap, Clock } from "lucide-react";
import { AGENT_REGISTRY } from "@/lib/agents/registry";
import {
  Lightbulb, TrendingUp, BookOpen, CheckCircle, Shield,
  Sparkles, Layout, FileText, Layers, Globe, Star,
} from "lucide-react";

const ICON_MAP = {
  Lightbulb, TrendingUp, BookOpen, CheckCircle, Shield,
  Sparkles, Layout, FileText, Layers, Globe, Star,
};

const STATUS_ICON = {
  idle:    ({ cls }) => <div className={`h-2 w-2 rounded-full bg-[rgb(var(--border))] ${cls}`} />,
  running: ({ cls }) => <Loader2 size={14} className={`animate-spin text-blue-400 ${cls}`} />,
  done:    ({ cls }) => <Check    size={14} className={`text-emerald-400 ${cls}`} />,
  error:   ({ cls }) => <AlertTriangle size={14} className={`text-red-400 ${cls}`} />,
};

export default function ProgressOverlay({ nodes, nodeStatuses, creditsUsed, totalCredits, onCancel }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const doneCount = Object.values(nodeStatuses).filter((s) => s === "done").length;
  const pct = nodes.length > 0 ? Math.round((doneCount / nodes.length) * 100) : 0;

  const runningNode = nodes.find((n) => nodeStatuses[n.id] === "running");
  const runningAgent = runningNode ? AGENT_REGISTRY[runningNode.data?.agentType] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/85 backdrop-blur-md">
      <div className="w-full max-w-md rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan/20 to-electric/20">
            <Loader2 size={20} className="animate-spin text-cyan" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold">Running Workflow</h2>
            <p className="text-xs text-faint">
              {runningAgent ? `Running: ${runningAgent.name}…` : "Preparing agents…"}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="mb-1.5 flex items-center justify-between text-[11px]">
            <span className="text-faint">{doneCount} / {nodes.length} agents complete</span>
            <span className="font-bold text-cyan">{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[rgb(var(--bg-soft))]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan to-electric transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Agent list */}
        <div className="max-h-64 space-y-1.5 overflow-y-auto">
          {nodes.map((node) => {
            const agentKey = node.data?.agentType;
            const agent    = AGENT_REGISTRY[agentKey];
            if (!agent) return null;

            const status  = nodeStatuses[node.id] || "idle";
            const Icon    = ICON_MAP[agent.icon] || Sparkles;
            const SIcon   = STATUS_ICON[status] || STATUS_ICON.idle;

            return (
              <div
                key={node.id}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                  status === "running"
                    ? "border border-blue-400/30 bg-blue-400/8"
                    : status === "done"
                    ? "border border-emerald-400/20 bg-emerald-400/5"
                    : "border border-transparent"
                }`}
              >
                <Icon size={13} className="shrink-0 text-faint" />
                <span className={`flex-1 text-[11px] font-medium ${status === "idle" ? "text-faint" : ""}`}>
                  {agent.name}
                </span>
                <span className="text-[10px] text-faint">{agent.credits}cr</span>
                <SIcon cls="" />
              </div>
            );
          })}
        </div>

        {/* Stats footer */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <Zap size={13} className="text-cyan" />
            <span className="text-[11px]">
              <span className="font-bold text-cyan">{creditsUsed}</span>
              <span className="text-faint"> / {totalCredits} credits</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-faint" />
            <span className="text-[11px] text-faint">{elapsed}s elapsed</span>
          </div>
        </div>

        {/* Cancel */}
        <button
          onClick={onCancel}
          className="mt-3 w-full rounded-xl border border-[rgb(var(--border))] py-2 text-[11px] font-semibold text-faint transition hover:bg-[rgb(var(--bg-soft))]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
