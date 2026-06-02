import Link from "next/link";
import { Workflow, Zap, Clock, ChevronRight, FolderOpen } from "lucide-react";

function timeAgo(iso) {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60)    return "just now";
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function WorkspaceCard({ workspace }) {
  return (
    <Link
      href={`/dashboard/workspace/${workspace.id}`}
      className="group flex flex-col rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5 transition hover:border-cyan/45 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-cyan/15 to-electric/10 ring-1 ring-cyan/20">
          <FolderOpen size={19} className="text-cyan" />
        </div>
        <ChevronRight
          size={16}
          className="text-faint transition group-hover:translate-x-0.5 group-hover:text-cyan"
        />
      </div>

      <h3 className="mt-3 font-display text-base font-bold leading-tight">
        {workspace.name}
      </h3>
      {workspace.description && (
        <p className="mt-1 text-xs text-faint line-clamp-2">{workspace.description}</p>
      )}

      <div className="mt-4 flex items-center gap-3 text-xs text-faint">
        <span className="flex items-center gap-1">
          <Workflow size={11} />
          {workspace.workflowCount} workflow{workspace.workflowCount !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <Zap size={11} className="text-cyan" />
          <span className="text-cyan font-semibold">{workspace.totalCredits}</span>
          &nbsp;credits
        </span>
        <span className="ml-auto flex items-center gap-1">
          <Clock size={11} />
          {timeAgo(workspace.updatedAt)}
        </span>
      </div>
    </Link>
  );
}
