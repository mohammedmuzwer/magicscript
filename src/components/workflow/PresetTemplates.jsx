"use client";

import { X, Zap } from "lucide-react";
import { PRESET_LIST } from "@/lib/workflow-presets";

const PRESET_COLORS = {
  pink:   "from-pink-500/15 to-rose-500/10 border-pink-500/30",
  red:    "from-red-500/15 to-orange-500/10 border-red-500/30",
  orange: "from-orange-500/15 to-amber-500/10 border-orange-500/30",
  purple: "from-purple-500/15 to-indigo-500/10 border-purple-500/30",
};

const AGENT_BADGE_COLORS = {
  discovery:  "bg-blue-500/12 text-blue-400 border-blue-500/25",
  validation: "bg-red-500/12 text-red-400 border-red-500/25",
  enrichment: "bg-purple-500/12 text-purple-400 border-purple-500/25",
  output:     "bg-teal-400/12 text-teal-400 border-teal-400/25",
  review:     "bg-amber-500/12 text-amber-400 border-amber-500/25",
};

import { AGENT_REGISTRY } from "@/lib/agents/registry";

export default function PresetTemplates({ onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-bold">Preset Templates</h2>
            <p className="text-xs text-faint">Choose a ready-made agent workflow to get started instantly</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-xl border border-[rgb(var(--border))] transition hover:bg-[rgb(var(--bg-soft))]"
          >
            <X size={15} />
          </button>
        </div>

        {/* Preset grid */}
        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRESET_LIST.map((preset) => {
            const gradClass = PRESET_COLORS[preset.color] || PRESET_COLORS.purple;

            return (
              <button
                key={preset.id}
                onClick={() => { onSelect(preset.id); onClose(); }}
                className={`
                  group relative flex flex-col items-start rounded-xl border bg-gradient-to-br p-4
                  text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-xl
                  ${gradClass}
                `}
              >
                {/* Emoji + name */}
                <span className="text-2xl">{preset.emoji}</span>
                <h3 className="mt-2 font-display text-sm font-bold">{preset.name}</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-faint">{preset.description}</p>

                {/* Agent chain */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {preset.agentTypes.map((type) => {
                    const agent = AGENT_REGISTRY[type];
                    if (!agent) return null;
                    const cls = AGENT_BADGE_COLORS[agent.category];
                    return (
                      <span key={type} className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${cls}`}>
                        {agent.name}
                      </span>
                    );
                  })}
                </div>

                {/* Credits */}
                <div className="mt-3 flex items-center gap-1.5">
                  <Zap size={11} className="text-cyan" />
                  <span className="text-[11px] font-bold text-cyan">{preset.credits} credits</span>
                  <span className="text-[10px] text-faint">· {preset.agentTypes.length} agents</span>
                </div>

                {/* Load label */}
                <div className="absolute right-3 top-3 rounded-md bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-faint opacity-0 transition-opacity group-hover:opacity-100">
                  Load →
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
