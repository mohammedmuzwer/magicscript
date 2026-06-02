import Link from "next/link";
import { CheckCircle2, Loader2, XCircle, Zap, ChevronRight } from "lucide-react";
import { getPreset } from "@/lib/pipeline-presets";
import { getPipelineAgent } from "@/lib/pipeline-registry";

function timeAgo(iso) {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60)    return "just now";
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function StatusBadge({ status }) {
  if (status === "completed")
    return (
      <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
        <CheckCircle2 size={10} /> Completed
      </span>
    );
  if (status === "running")
    return (
      <span className="flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-bold text-blue-400">
        <Loader2 size={10} className="animate-spin" /> Running
      </span>
    );
  return (
    <span className="flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
      <XCircle size={10} /> Failed
    </span>
  );
}

export default function WorkflowCard({ workflow, workspaceId }) {
  const preset      = getPreset(workflow.presetId);
  const outputAgent = getPipelineAgent(workflow.outputFormats?.[0]);
  const emoji       = preset?.emoji || outputAgent?.icon || "⚡";
  const label       = preset?.name || (workflow.outputFormats?.length
    ? workflow.outputFormats.map((id) => getPipelineAgent(id)?.name || id).join(", ")
    : "Custom Pipeline");

  return (
    <Link
      href={`/dashboard/workspace/${workspaceId}/workflow/${workflow.id}`}
      className="group flex items-center gap-4 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-3.5 transition hover:border-cyan/35 hover:shadow-md"
    >
      <span className="shrink-0 text-2xl">{emoji}</span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{workflow.topic}</p>
        <p className="mt-0.5 text-[11px] text-faint">{label}</p>
      </div>

      <StatusBadge status={workflow.status} />

      {workflow.confidenceScore != null && (
        <span className="hidden text-xs font-bold text-cyan sm:block">
          {workflow.confidenceScore}%
        </span>
      )}

      <div className="hidden items-center gap-1 text-xs text-faint sm:flex">
        <Zap size={11} className="text-cyan" /> {workflow.creditsUsed}
      </div>

      <span className="hidden text-[11px] text-faint sm:block">
        {timeAgo(workflow.createdAt)}
      </span>

      <ChevronRight
        size={15}
        className="shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-cyan"
      />
    </Link>
  );
}
