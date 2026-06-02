"use client";

import Link from "next/link";
import { Zap, Clock, Play, ArrowLeft, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { useState } from "react";
import { AGENT_REGISTRY } from "@/lib/agents/registry";

export default function ProgressPanel({
  workflow, preset, nodeStatuses, creditsUsed,
  elapsed, isRunning, results, workspaceId, onRunAgain,
}) {
  const [expandedAgent, setExpandedAgent] = useState(null);

  const doneCount  = preset.agentTypes.filter((a) => nodeStatuses[a] === "done").length;
  const pct        = preset.agentTypes.length > 0
    ? Math.round((doneCount / preset.agentTypes.length) * 100)
    : 0;
  const estSecs    = preset.agentTypes.reduce(
    (s, a) => s + (AGENT_REGISTRY[a]?.estimatedMs || 1000) / 1000, 0
  );
  const remaining  = Math.max(0, Math.round(estSecs - elapsed));

  return (
    <div className="flex flex-col gap-0 divide-y divide-[rgb(var(--border))]">

      {/* Topic */}
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Topic</p>
        <p className="mt-1 text-sm font-semibold leading-snug">{workflow.topic}</p>
      </div>

      {/* Pipeline */}
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Pipeline</p>
        <p className="mt-1 text-sm font-semibold">{preset.name}</p>
        <p className="text-[11px] text-faint">{preset.agentTypes.length} agents</p>
      </div>

      {/* Status */}
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Status</p>
        <p className={`mt-1 text-sm font-bold ${
          isRunning ? "text-blue-400" : results ? "text-emerald-400" : "text-faint"
        }`}>
          {isRunning ? "Running…" : results ? "Completed ✓" : "Waiting"}
        </p>
      </div>

      {/* Progress */}
      {(isRunning || results) && (
        <div className="p-4">
          <div className="mb-2 flex items-center justify-between text-[11px]">
            <span className="text-faint">{doneCount} / {preset.agentTypes.length} agents</span>
            <span className="font-bold text-cyan">{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[rgb(var(--bg-soft))]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan to-electric transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 p-4">
        <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Zap size={11} className="text-cyan" />
            <span className="text-sm font-bold text-cyan">{creditsUsed}</span>
            <span className="text-[10px] text-faint">/{preset.credits}</span>
          </div>
          <p className="mt-0.5 text-[10px] text-faint">Credits</p>
        </div>
        <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Clock size={11} className="text-faint" />
            <span className="text-sm font-bold">{elapsed}s</span>
          </div>
          <p className="mt-0.5 text-[10px] text-faint">
            {isRunning ? `~${remaining}s left` : "Elapsed"}
          </p>
        </div>
      </div>

      {/* Confidence when done */}
      {results && workflow.confidenceScore != null && (
        <div className="p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Confidence</p>
          <p className="mt-1 font-display text-3xl font-bold text-cyan">
            {workflow.confidenceScore}%
          </p>
          <p className="mt-0.5 text-[10px] text-faint">research evidence score</p>
        </div>
      )}

      {/* Results preview when done */}
      {results && (
        <div className="p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-faint">
            Agent Outputs
          </p>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {Object.entries(results).map(([nodeId, res]) => {
              if (!res?.agentName) return null;
              const isOpen = expandedAgent === nodeId;
              return (
                <div
                  key={nodeId}
                  className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))]"
                >
                  <button
                    onClick={() => setExpandedAgent(isOpen ? null : nodeId)}
                    className="flex w-full items-center justify-between px-3 py-2 text-[11px] font-semibold text-left"
                  >
                    <span>{res.agentName}</span>
                    {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  {isOpen && (
                    <div className="border-t border-[rgb(var(--border))] px-3 py-2">
                      <pre className="whitespace-pre-wrap text-[10px] text-faint font-mono max-h-40 overflow-y-auto">
                        {JSON.stringify(res.output, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions when done */}
      {results && (
        <div className="space-y-2 p-4">
          <button
            onClick={onRunAgain}
            className="btn btn-ghost w-full gap-2 text-sm"
          >
            <Play size={13} /> Run Again
          </button>
          <Link
            href={`/dashboard/workspace/${workspaceId}`}
            className="btn btn-ghost flex w-full items-center justify-center gap-2 text-sm"
          >
            <ArrowLeft size={13} /> Back to Workspace
          </Link>
        </div>
      )}
    </div>
  );
}
