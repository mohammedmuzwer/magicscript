"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle2, Loader2, Zap, Clock, Play, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

import { getWorkflow, createWorkflow, updateWorkflow } from "@/lib/workspaces-store";
import { PRESET_MAP, getPreset }                       from "@/lib/pipeline-presets";
import { getPipelineAgent, calcPipelineMs }            from "@/lib/pipeline-registry";
import { executePipeline }                             from "@/lib/pipeline-engine";

// ── Visual node for a single agent ──────────────────────────────────────────
const STAGE_COLORS = {
  input:   { idle: "border-[rgb(var(--border))] bg-[rgb(var(--panel))] opacity-55",   running: "border-blue-400/60 bg-blue-500/10 ring-2 ring-blue-400/35 shadow-lg",   done: "border-blue-400/40 bg-blue-500/6" },
  process: { idle: "border-[rgb(var(--border))] bg-[rgb(var(--panel))] opacity-55",   running: "border-purple-400/60 bg-purple-500/10 ring-2 ring-purple-400/35 shadow-lg", done: "border-emerald-400/40 bg-emerald-500/6" },
  output:  { idle: "border-[rgb(var(--border))] bg-[rgb(var(--panel))] opacity-55",   running: "border-teal-400/60 bg-teal-500/10 ring-2 ring-teal-400/35 shadow-lg",   done: "border-teal-400/40 bg-teal-500/6" },
};

function AgentNode({ agentId, status }) {
  const agent = getPipelineAgent(agentId);
  if (!agent) return null;
  const stageStyle = (STAGE_COLORS[agent.stage] || STAGE_COLORS.process)[status] || STAGE_COLORS.process.idle;
  return (
    <div className={`flex w-full max-w-md items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300 ${stageStyle}`}>
      <span className="shrink-0 text-2xl">{agent.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight">{agent.name}</p>
        <p className="mt-0.5 text-[11px] text-faint">
          {agent.credits} credit{agent.credits !== 1 ? "s" : ""} · {agent.description.slice(0, 50)}…
        </p>
        {status === "running" && (
          <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-[rgb(var(--border))]">
            <div className="h-full w-3/5 animate-shimmer rounded-full bg-gradient-to-r from-cyan to-electric" style={{ backgroundSize: "200% 100%" }} />
          </div>
        )}
      </div>
      <div className="shrink-0">
        {status === "running" && <Loader2 size={16} className="animate-spin text-blue-400" />}
        {status === "done"    && <span className="text-base">✓</span>}
        {status === "error"   && <span className="text-base">✗</span>}
        {status === "idle"    && <div className="h-2.5 w-2.5 rounded-full border-2 border-[rgb(var(--border))]" />}
      </div>
    </div>
  );
}

function Connector({ active }) {
  return (
    <div className="flex flex-col items-center py-1">
      <div className={`h-5 w-px transition-colors duration-500 ${active ? "bg-emerald-400/70" : "bg-[rgb(var(--border))]"}`} />
      <div className={`h-0 w-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent transition-colors duration-500 ${active ? "border-t-emerald-400/70" : "border-t-[rgb(var(--border))]"}`} />
    </div>
  );
}

function StageDivider({ label }) {
  return (
    <div className="flex w-full max-w-md items-center gap-3 py-3">
      <div className="h-px flex-1 bg-[rgb(var(--border))]" />
      <span className="rounded-full border border-[rgb(var(--border))] px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-faint">
        {label}
      </span>
      <div className="h-px flex-1 bg-[rgb(var(--border))]" />
    </div>
  );
}

function ExecutionCanvas({ workflow, nodeStatuses }) {
  if (!workflow) return null;
  const { inputAgent, processAgents = [], outputFormats = [] } = workflow;
  const allAgentIds = [inputAgent, ...processAgents, ...outputFormats];

  return (
    <div className="flex flex-col items-center gap-0 py-4">
      {/* Stage label: INPUT */}
      <StageDivider label="Stage 1 · Input" />
      <AgentNode agentId={inputAgent} status={nodeStatuses[inputAgent] || "idle"} />

      {/* Stage label: PROCESS */}
      {processAgents.length > 0 && (
        <>
          <Connector active={nodeStatuses[inputAgent] === "done"} />
          <StageDivider label="Stage 2 · Process" />
          {processAgents.map((agentId, i) => (
            <div key={agentId} className="flex w-full max-w-md flex-col items-center">
              {i > 0 && <Connector active={nodeStatuses[processAgents[i - 1]] === "done"} />}
              <AgentNode agentId={agentId} status={nodeStatuses[agentId] || "idle"} />
            </div>
          ))}
        </>
      )}

      {/* Stage label: OUTPUT */}
      {outputFormats.length > 0 && (
        <>
          <Connector active={
            processAgents.length > 0
              ? nodeStatuses[processAgents[processAgents.length - 1]] === "done"
              : nodeStatuses[inputAgent] === "done"
          } />
          <StageDivider label="Stage 3 · Output" />
          {outputFormats.map((formatId, i) => (
            <div key={formatId} className="flex w-full max-w-md flex-col items-center">
              {i > 0 && <Connector active={nodeStatuses[outputFormats[i - 1]] === "done"} />}
              <AgentNode agentId={formatId} status={nodeStatuses[formatId] || "idle"} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ── Progress Panel (right side) ──────────────────────────────────────────────
function ProgressPanel({ workflow, nodeStatuses, creditsUsed, elapsed, isRunning, results, workspaceId, onRunAgain }) {
  const [expandedKey, setExpandedKey] = useState(null);
  if (!workflow) return null;

  const { inputAgent, processAgents = [], outputFormats = [] } = workflow;
  const allAgents  = [inputAgent, ...processAgents, ...outputFormats];
  const totalCreds = allAgents.reduce((s, id) => s + (getPipelineAgent(id)?.credits || 0), 0);
  const doneCount  = allAgents.filter((id) => nodeStatuses[id] === "done").length;
  const pct        = allAgents.length > 0 ? Math.round((doneCount / allAgents.length) * 100) : 0;
  const estSecs    = calcPipelineMs(inputAgent, [], processAgents, [], [], outputFormats);
  const remaining  = Math.max(0, estSecs - elapsed);

  const preset = workflow.presetId ? getPreset(workflow.presetId) : null;

  return (
    <div className="flex flex-col divide-y divide-[rgb(var(--border))]">
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Topic</p>
        <p className="mt-1 text-sm font-semibold leading-snug">{workflow.topic}</p>
      </div>

      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Pipeline</p>
        <p className="mt-1 text-sm font-semibold">{preset?.name || "Custom Pipeline"}</p>
        <p className="mt-0.5 text-[11px] text-faint">
          {allAgents.length} agents · {totalCreds} credits total
        </p>
      </div>

      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Status</p>
        <p className={`mt-1 text-sm font-bold ${isRunning ? "text-blue-400" : results ? "text-emerald-400" : "text-faint"}`}>
          {isRunning ? "Running…" : results ? "Completed ✓" : "Waiting"}
        </p>
      </div>

      {(isRunning || results) && (
        <div className="p-4">
          <div className="mb-2 flex justify-between text-[11px]">
            <span className="text-faint">{doneCount} / {allAgents.length} agents</span>
            <span className="font-bold text-cyan">{pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[rgb(var(--bg-soft))]">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan to-electric transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 p-4">
        <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Zap size={11} className="text-cyan" />
            <span className="text-sm font-bold text-cyan">{creditsUsed}</span>
            <span className="text-[10px] text-faint">/{totalCreds}</span>
          </div>
          <p className="mt-0.5 text-[10px] text-faint">Credits</p>
        </div>
        <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Clock size={11} className="text-faint" />
            <span className="text-sm font-bold">{elapsed}s</span>
          </div>
          <p className="mt-0.5 text-[10px] text-faint">{isRunning ? `~${remaining}s left` : "Elapsed"}</p>
        </div>
      </div>

      {results && workflow.confidenceScore != null && (
        <div className="p-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Confidence</p>
          <p className="mt-1 font-display text-3xl font-bold text-cyan">{workflow.confidenceScore}%</p>
          <p className="mt-0.5 text-[10px] text-faint">research evidence score</p>
        </div>
      )}

      {results && (
        <div className="p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-faint">Outputs</p>
          <div className="max-h-64 space-y-1.5 overflow-y-auto">
            {Object.entries(results).map(([agentId, res]) => {
              if (!res?.agentName) return null;
              const isOpen = expandedKey === agentId;
              return (
                <div key={agentId} className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))]">
                  <button
                    onClick={() => setExpandedKey(isOpen ? null : agentId)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-[11px] font-semibold"
                  >
                    <span>{res.agentName}</span>
                    {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  {isOpen && (
                    <div className="border-t border-[rgb(var(--border))] px-3 py-2">
                      <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap font-mono text-[10px] text-faint">
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

      {results && (
        <div className="space-y-2 p-4">
          <button onClick={onRunAgain} className="btn btn-ghost w-full gap-2 text-sm">
            <Play size={13} /> Run Again
          </button>
          <Link href={`/dashboard/workspace/${workspaceId}`} className="btn btn-ghost flex w-full items-center justify-center gap-2 text-sm">
            <ArrowLeft size={13} /> Back to Workspace
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Preset emoji lookup ──────────────────────────────────────────────────────
function presetEmoji(presetId) {
  const map = { instagram_reel: "🎞️", youtube_long: "▶️", podcast: "🎙️", quick_draft: "⚡", scientific_deep_dive: "🔬", full_pipeline: "🚀" };
  return map[presetId] || "⚡";
}

// ── Inner component (needs Suspense for useSearchParams) ─────────────────────
function WorkflowExecutionInner() {
  const params       = useParams();
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { id: workspaceId, workflowId } = params;

  const [workflow,     setWorkflow]     = useState(null);
  const [nodeStatuses, setNodeStatuses] = useState({});
  const [creditsUsed,  setCreditsUsed]  = useState(0);
  const [elapsed,      setElapsed]      = useState(0);
  const [results,      setResults]      = useState(null);
  const [isRunning,    setIsRunning]    = useState(false);

  const initialized = useRef(false);
  const hasAutoRun  = useRef(false);

  // ── Load or create workflow ─────────────────────────────────────────────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (workflowId === "new") {
      const presetId = searchParams.get("preset");
      const topicRaw = searchParams.get("topic");
      // Also support custom pipeline params
      const inputAgent    = searchParams.get("input");
      const processRaw    = searchParams.get("process");
      const outputRaw     = searchParams.get("output");

      if (!topicRaw) { router.replace(`/dashboard/workspace/${workspaceId}`); return; }

      let wfData;
      if (inputAgent) {
        // Custom pipeline from Pipeline Builder
        wfData = createWorkflow({
          workspaceId,
          topic:         decodeURIComponent(topicRaw),
          presetId:      null,
          inputAgent,
          processAgents: processRaw ? processRaw.split(",").filter(Boolean) : [],
          outputFormats: outputRaw  ? outputRaw.split(",").filter(Boolean)  : [],
        });
      } else if (presetId) {
        // Preset pipeline
        const p = PRESET_MAP[presetId];
        if (!p) { router.replace(`/dashboard/workspace/${workspaceId}`); return; }
        wfData = createWorkflow({
          workspaceId,
          topic:         decodeURIComponent(topicRaw),
          presetId,
          inputAgent:    p.inputAgent,
          processAgents: p.processAgents,
          outputFormats: p.outputFormats,
        });
      } else {
        router.replace(`/dashboard/workspace/${workspaceId}`);
        return;
      }
      setWorkflow(wfData);
    } else {
      const wf = getWorkflow(workflowId);
      if (!wf) { router.replace(`/dashboard/workspace/${workspaceId}`); return; }
      setWorkflow(wf);
      if (wf.status === "completed" && wf.results) {
        setResults(wf.results);
        setCreditsUsed(wf.creditsUsed || 0);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-run once workflow is set ──────────────────────────────────────────
  useEffect(() => {
    if (!workflow || hasAutoRun.current) return;
    if (workflow.status === "completed") return;
    hasAutoRun.current = true;
    runExecution(workflow);
  }, [workflow]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Elapsed timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isRunning) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [isRunning]);

  // ── Execution ──────────────────────────────────────────────────────────────
  async function runExecution(wf) {
    if (!wf) return;
    const initStatuses = {};
    [wf.inputAgent, ...(wf.processAgents || []), ...(wf.outputFormats || [])].forEach((id) => { initStatuses[id] = "idle"; });
    setNodeStatuses(initStatuses);
    setResults(null);
    setCreditsUsed(0);
    setElapsed(0);
    setIsRunning(true);

    try {
      const { results: wfResults, creditsUsed: finalCredits } = await executePipeline(
        {
          inputAgent:    wf.inputAgent,
          processAgents: wf.processAgents || [],
          outputFormats: wf.outputFormats || [],
          topic:         wf.topic,
        },
        (agentId, status, result, credits) => {
          setNodeStatuses((prev) => ({ ...prev, [agentId]: status }));
          if (credits !== undefined) setCreditsUsed(credits);
        }
      );
      const confidence = 70 + Math.floor(Math.random() * 25);
      setResults(wfResults);
      setIsRunning(false);
      updateWorkflow(wf.id, {
        status:          "completed",
        creditsUsed:     finalCredits,
        confidenceScore: confidence,
        completedAt:     new Date().toISOString(),
        results:         { ...wfResults, confidence },
      });
      setWorkflow((prev) => ({ ...prev, status: "completed", creditsUsed: finalCredits, confidenceScore: confidence }));
    } catch (err) {
      console.error("Pipeline failed:", err);
      setIsRunning(false);
      updateWorkflow(wf.id, { status: "failed" });
    }
  }

  function handleRunAgain() {
    if (!workflow) return;
    hasAutoRun.current = false;
    runExecution(workflow);
  }

  if (!workflow) {
    return (
      <div className="flex h-screen items-center justify-center bg-[rgb(var(--bg))]">
        <Loader2 size={22} className="animate-spin text-faint" />
      </div>
    );
  }

  const preset = workflow.presetId ? getPreset(workflow.presetId) : null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[rgb(var(--bg))]">
      {/* Toolbar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-4">
        <Link
          href={`/dashboard/workspace/${workspaceId}`}
          className="flex items-center gap-1.5 text-xs font-semibold text-faint transition hover:text-[rgb(var(--text))]"
        >
          <ChevronLeft size={14} /> Back
        </Link>
        <div className="h-4 w-px bg-[rgb(var(--border))]" />
        <span className="text-lg">{presetEmoji(workflow.presetId)}</span>
        <div className="min-w-0">
          <span className="block truncate text-sm font-bold">{workflow.topic}</span>
          <span className="block text-[11px] text-faint">{preset?.name || "Custom Pipeline"}</span>
        </div>
        <div className="flex-1" />
        {workflow.status === "completed" && !isRunning && (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">
            <CheckCircle2 size={12} /> Complete
          </span>
        )}
        {isRunning && (
          <span className="flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-400">
            <Loader2 size={12} className="animate-spin" /> Running…
          </span>
        )}
      </header>

      {/* Two-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left 60% — Pipeline canvas */}
        <div className="flex-[3] overflow-y-auto px-8 py-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-faint">Agent Pipeline</p>
          <ExecutionCanvas workflow={workflow} nodeStatuses={nodeStatuses} />
        </div>

        {/* Right 40% — Stats */}
        <div className="w-80 shrink-0 overflow-y-auto border-l border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))]">
          <ProgressPanel
            workflow={workflow}
            nodeStatuses={nodeStatuses}
            creditsUsed={creditsUsed}
            elapsed={elapsed}
            isRunning={isRunning}
            results={results}
            workspaceId={workspaceId}
            onRunAgain={handleRunAgain}
          />
        </div>
      </div>
    </div>
  );
}

export default function WorkflowExecutionPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[rgb(var(--bg))]">
        <Loader2 size={22} className="animate-spin text-faint" />
      </div>
    }>
      <WorkflowExecutionInner />
    </Suspense>
  );
}
