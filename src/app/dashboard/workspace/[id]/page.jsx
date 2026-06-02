"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search, ArrowLeft, Pencil, Check, Plus, Zap, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getWorkspace, getWorkflows, updateWorkspace } from "@/lib/workspaces-store";
import { PIPELINE_PRESETS }  from "@/lib/pipeline-presets";
import { getPipelineAgent }  from "@/lib/pipeline-registry";
import WorkflowCard from "@/components/workspace/WorkflowCard";
import Reveal from "@/components/ui/reveal";

// ── Preset card (shows INPUT → PROCESS → OUTPUT structure) ──────────────────
const PRESET_META = {
  instagram_reel:      { color: "from-pink-500/15 to-rose-500/8 border-pink-500/25 hover:border-pink-500/50",   dot: "bg-pink-400" },
  youtube_long:        { color: "from-red-500/15 to-orange-500/8 border-red-500/25 hover:border-red-500/50",    dot: "bg-red-400" },
  podcast:             { color: "from-purple-500/15 to-indigo-500/8 border-purple-500/25 hover:border-purple-500/50", dot: "bg-purple-400" },
  quick_draft:         { color: "from-cyan/15 to-electric/8 border-cyan/25 hover:border-cyan/50",               dot: "bg-cyan" },
  scientific_deep_dive:{ color: "from-indigo-500/15 to-purple-500/8 border-indigo-500/25 hover:border-indigo-500/50", dot: "bg-indigo-400" },
  full_pipeline:       { color: "from-amber-500/15 to-orange-500/8 border-amber-500/25 hover:border-amber-500/50", dot: "bg-amber-400" },
};

function AgentPill({ agentId, dot }) {
  const agent = getPipelineAgent(agentId);
  if (!agent) return null;
  return (
    <span className="flex items-center gap-1 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-1.5 py-0.5 text-[9px] font-semibold text-faint">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {agent.name}
    </span>
  );
}

function PresetCard({ preset, hasValue, topicPreview, onClick }) {
  const meta = PRESET_META[preset.id] || PRESET_META.instagram_reel;
  const allAgents = [preset.inputAgent, ...preset.processAgents, ...preset.outputFormats];

  return (
    <button
      onClick={onClick}
      disabled={!hasValue}
      className={`
        group relative flex flex-col items-start rounded-xl border bg-gradient-to-br p-4 text-left
        transition-all duration-200
        ${hasValue
          ? `cursor-pointer hover:scale-[1.02] hover:shadow-lg ${meta.color}`
          : "cursor-not-allowed border-[rgb(var(--border))] opacity-45"}
      `}
    >
      {/* Header */}
      <div className="flex w-full items-start justify-between">
        <span className="text-xl">{preset.emoji}</span>
        <span className="flex items-center gap-1 rounded-full bg-[rgb(var(--bg-soft))] px-2 py-0.5 text-[10px] font-bold">
          <Zap size={9} className="text-cyan" />
          <span className="text-cyan">{preset.credits}</span>
          <span className="text-faint">cr</span>
        </span>
      </div>

      <p className="mt-2 font-display text-sm font-bold">{preset.name}</p>
      <p className="text-[11px] text-faint">{preset.description}</p>

      {/* Pipeline flow mini-view */}
      <div className="mt-3 w-full">
        {/* INPUT */}
        <div className="mb-1.5 flex items-center gap-1.5">
          <span className="rounded bg-blue-500/20 px-1 py-0.5 text-[8px] font-bold uppercase text-blue-400">IN</span>
          <AgentPill agentId={preset.inputAgent} dot="bg-blue-400" />
        </div>
        {/* PROCESS */}
        {preset.processAgents.length > 0 && (
          <div className="mb-1.5 flex flex-wrap items-center gap-1">
            <span className="rounded bg-purple-500/20 px-1 py-0.5 text-[8px] font-bold uppercase text-purple-400">PRO</span>
            {preset.processAgents.slice(0, 3).map((id) => (
              <AgentPill key={id} agentId={id} dot={meta.dot} />
            ))}
            {preset.processAgents.length > 3 && (
              <span className="text-[9px] text-faint">+{preset.processAgents.length - 3}</span>
            )}
          </div>
        )}
        {/* OUTPUT */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="rounded bg-teal-500/20 px-1 py-0.5 text-[8px] font-bold uppercase text-teal-400">OUT</span>
          {preset.outputFormats.map((id) => (
            <AgentPill key={id} agentId={id} dot="bg-teal-400" />
          ))}
        </div>
      </div>

      {/* Hover run label */}
      {hasValue && topicPreview && (
        <div className="mt-2 flex w-full items-center justify-end gap-1 text-[11px] font-bold opacity-0 transition-opacity group-hover:opacity-100" style={{ color: "rgb(var(--text))" }}>
          Run with "{topicPreview.length > 20 ? topicPreview.slice(0, 20) + "…" : topicPreview}"
          <ChevronRight size={12} />
        </div>
      )}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WorkspaceDetailPage() {
  const { id }   = useParams();
  const router   = useRouter();

  const [workspace,   setWorkspace]   = useState(null);
  const [workflows,   setWorkflows]   = useState([]);
  const [topic,       setTopic]       = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameValue,   setNameValue]   = useState("");

  useEffect(() => {
    const ws = getWorkspace(id);
    if (!ws) { router.replace("/dashboard"); return; }
    setWorkspace(ws);
    setNameValue(ws.name);
    setWorkflows(getWorkflows(id));
  }, [id, router]);

  function saveWorkspaceName() {
    if (!nameValue.trim()) return;
    updateWorkspace(id, { name: nameValue.trim() });
    setWorkspace((prev) => ({ ...prev, name: nameValue.trim() }));
    setEditingName(false);
  }

  function handlePresetClick(preset) {
    if (!topic.trim()) { document.getElementById("ws-topic-input")?.focus(); return; }
    const params = new URLSearchParams({
      preset: preset.id,
      topic:  encodeURIComponent(topic.trim()),
    });
    router.push(`/dashboard/workspace/${id}/workflow/new?${params.toString()}`);
  }

  if (!workspace) return null;
  const hasValue = topic.trim().length > 0;

  return (
    <div className="space-y-8">
      {/* Breadcrumb + workspace name */}
      <div>
        <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-faint transition hover:text-soft">
          <ArrowLeft size={13} /> All Workspaces
        </Link>
        <div className="mt-3 flex items-center gap-3">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={saveWorkspaceName}
                onKeyDown={(e) => { if (e.key === "Enter") saveWorkspaceName(); if (e.key === "Escape") setEditingName(false); }}
                className="border-b-2 border-cyan bg-transparent font-display text-2xl font-bold focus:outline-none"
              />
              <button onClick={saveWorkspaceName} className="text-cyan hover:text-cyan/70"><Check size={18} /></button>
            </div>
          ) : (
            <button onClick={() => setEditingName(true)} className="group flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold">{workspace.name}</h1>
              <Pencil size={14} className="text-faint opacity-0 transition group-hover:opacity-100" />
            </button>
          )}
        </div>
        {workspace.description && <p className="mt-1 text-sm text-faint">{workspace.description}</p>}
      </div>

      {/* Topic search bar */}
      <div className={`relative mx-auto max-w-2xl rounded-2xl border bg-[rgb(var(--panel))] p-2 transition-all focus-within:border-cyan/55 focus-within:shadow-glow ${
        hasValue ? "border-cyan/55 shadow-glow" : "border-[rgb(var(--border))]"
      }`}>
        <div className="flex items-center gap-2">
          <Search size={19} className="ml-2.5 shrink-0 text-faint" />
          <input
            id="ws-topic-input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && hasValue) handlePresetClick(PIPELINE_PRESETS[0]); }}
            placeholder="What health claim should we verify today?"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-faint"
          />
          {hasValue && (
            <span className="shrink-0 rounded-full bg-cyan/15 px-3 py-1 text-xs font-bold text-cyan">topic ready ✓</span>
          )}
        </div>
      </div>

      {/* Preset pipeline cards */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-bold">
            Preset Pipelines
            {!hasValue && <span className="ml-2 text-sm font-normal text-faint">— type a topic first</span>}
          </h2>
          <Link
            href={`/dashboard/workspace/${id}/pipeline/new${topic.trim() ? `?topic=${encodeURIComponent(topic.trim())}` : ""}`}
            className="btn btn-ghost gap-1.5 px-3 py-1.5 text-xs"
          >
            <Plus size={13} /> Custom Pipeline
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PIPELINE_PRESETS.map((preset, i) => (
            <Reveal key={preset.id} delay={i * 0.04}>
              <PresetCard
                preset={preset}
                hasValue={hasValue}
                topicPreview={topic}
                onClick={() => handlePresetClick(preset)}
              />
            </Reveal>
          ))}
        </div>
      </div>

      {/* Existing workflows */}
      {workflows.length > 0 && (
        <div>
          <h2 className="mb-4 font-display text-base font-bold">
            Workflows
            <span className="ml-2 text-sm font-normal text-faint">({workflows.length})</span>
          </h2>
          <div className="space-y-2.5">
            {workflows.map((wf, i) => (
              <Reveal key={wf.id} delay={i * 0.04}>
                <WorkflowCard workflow={wf} workspaceId={id} />
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {workflows.length === 0 && (
        <div className="rounded-xl border border-dashed border-[rgb(var(--border))] py-12 text-center">
          <p className="text-sm text-faint">No workflows yet.</p>
          <p className="mt-1 text-xs text-faint">Type a topic above and choose a pipeline to get started.</p>
        </div>
      )}
    </div>
  );
}
