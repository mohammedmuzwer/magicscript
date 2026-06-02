"use client";

import { useState } from "react";
import { X, Copy, Check, ChevronDown, ChevronRight, Download, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { AGENT_REGISTRY } from "@/lib/agents/registry";

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={copy}
      className="grid h-6 w-6 place-items-center rounded-md border border-[rgb(var(--border))] transition hover:bg-[rgb(var(--bg-soft))]"
    >
      {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} className="text-faint" />}
    </button>
  );
}

function AgentResult({ nodeId, result }) {
  const [open, setOpen] = useState(true);
  const agent = AGENT_REGISTRY[result.agentId];
  if (!agent) return null;

  const text = JSON.stringify(result.output, null, 2);

  return (
    <div className="rounded-xl border border-[rgb(var(--border))] overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 bg-[rgb(var(--bg-soft))] px-4 py-2.5 text-left"
      >
        {open ? <ChevronDown size={13} className="text-faint" /> : <ChevronRight size={13} className="text-faint" />}
        <span className="flex-1 text-[11px] font-bold">{agent.name}</span>
        <CopyBtn text={text} />
      </button>

      {open && (
        <div className="p-3 space-y-2">
          {Object.entries(result.output).map(([key, val]) => (
            <div key={key}>
              <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-faint">
                {key.replace(/_/g, " ")}
              </p>
              {Array.isArray(val) ? (
                <ul className="space-y-1">
                  {val.map((item, i) => (
                    <li key={i} className="rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-2 py-1 text-[11px]">
                      {typeof item === "object" ? JSON.stringify(item) : String(item)}
                    </li>
                  ))}
                </ul>
              ) : typeof val === "object" && val !== null ? (
                <pre className="overflow-x-auto rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-2 text-[10px]">
                  {JSON.stringify(val, null, 2)}
                </pre>
              ) : (
                <p className="rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-2 py-1.5 text-[11px]">
                  {String(val)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResultsPanel({ results, creditsUsed, topic, onClose }) {
  const entries = Object.entries(results || {});

  const exportAll = () => {
    const text = entries.map(([id, r]) => `=== ${r.agentName} ===\n${JSON.stringify(r.output, null, 2)}`).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = "workflow-results.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 flex h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-5 py-4">
          <div>
            <h2 className="font-display text-base font-bold">Workflow Results</h2>
            <p className="text-xs text-faint">{entries.length} agents completed · {creditsUsed} credits used</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportAll} className="btn btn-ghost gap-1.5 px-3 py-1.5 text-xs">
              <Download size={13} /> Export
            </button>
            {topic && (
              <Link
                href={`/dashboard/generate?topic=${encodeURIComponent(topic)}`}
                onClick={onClose}
                className="btn btn-primary gap-1.5 px-3 py-1.5 text-xs"
              >
                <Sparkles size={13} /> Generate Content <ArrowRight size={11} />
              </Link>
            )}
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-xl border border-[rgb(var(--border))] transition hover:bg-[rgb(var(--bg-soft))]">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {entries.length === 0 ? (
            <p className="text-center text-xs text-faint py-8">No results yet</p>
          ) : (
            entries.map(([nodeId, result]) => (
              <AgentResult key={nodeId} nodeId={nodeId} result={result} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
