import { Zap, ChevronRight } from "lucide-react";
import { AGENT_REGISTRY } from "@/lib/agents/registry";

const PRESET_META = {
  instagram_reel: { emoji: "🎞️", color: "from-pink-500/15 to-rose-500/8 border-pink-500/25 hover:border-pink-500/50",  dot: "bg-pink-400" },
  youtube_long:   { emoji: "▶️",  color: "from-red-500/15 to-orange-500/8 border-red-500/25 hover:border-red-500/50",   dot: "bg-red-400" },
  podcast:        { emoji: "🎙️", color: "from-purple-500/15 to-indigo-500/8 border-purple-500/25 hover:border-purple-500/50", dot: "bg-purple-400" },
  stage_speech:   { emoji: "🎤",  color: "from-amber-500/15 to-yellow-500/8 border-amber-500/25 hover:border-amber-500/50",  dot: "bg-amber-400" },
  tamil_creator:  { emoji: "🔥",  color: "from-orange-500/15 to-red-500/8 border-orange-500/25 hover:border-orange-500/50", dot: "bg-orange-400" },
  full_pipeline:  { emoji: "⚡",  color: "from-cyan/15 to-electric/8 border-cyan/25 hover:border-cyan/50",                dot: "bg-cyan" },
};

export default function PresetCard({ preset, hasValue, topicPreview, onClick }) {
  const meta = PRESET_META[preset.id] || PRESET_META.full_pipeline;

  return (
    <button
      onClick={onClick}
      disabled={!hasValue}
      className={`
        group relative flex flex-col items-start rounded-xl border bg-gradient-to-br
        p-4 text-left transition-all duration-200
        ${hasValue
          ? `cursor-pointer hover:scale-[1.02] hover:shadow-lg ${meta.color}`
          : "cursor-not-allowed border-[rgb(var(--border))] opacity-45"}
      `}
    >
      {/* Header row */}
      <div className="flex w-full items-start justify-between">
        <span className="text-xl">{meta.emoji}</span>
        <div className="flex items-center gap-1 rounded-full bg-[rgb(var(--bg-soft))] px-2 py-0.5 text-[10px] font-bold">
          <Zap size={9} className="text-cyan" />
          <span className="text-cyan">{preset.credits}</span>
          <span className="text-faint">cr</span>
        </div>
      </div>

      <p className="mt-2 font-display text-sm font-bold">{preset.name}</p>
      <p className="text-[11px] text-faint">{preset.description}</p>

      {/* Agent chain */}
      <div className="mt-3 flex flex-wrap gap-1">
        {preset.agentTypes.slice(0, 5).map((agentId, i) => {
          const agent = AGENT_REGISTRY[agentId];
          return (
            <span
              key={i}
              className="flex items-center gap-1 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-1.5 py-0.5 text-[9px] font-semibold text-faint"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
              {agent?.name || agentId}
            </span>
          );
        })}
        {preset.agentTypes.length > 5 && (
          <span className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-1.5 py-0.5 text-[9px] text-faint">
            +{preset.agentTypes.length - 5} more
          </span>
        )}
      </div>

      {/* Hover run label */}
      {hasValue && topicPreview && (
        <div
          className="mt-3 flex w-full items-center justify-end gap-1 text-[11px] font-bold opacity-0 transition-opacity group-hover:opacity-100"
          style={{ color: "rgb(var(--text))" }}
        >
          Run with "{topicPreview.length > 20 ? topicPreview.slice(0, 20) + "…" : topicPreview}"
          <ChevronRight size={13} />
        </div>
      )}
    </button>
  );
}
