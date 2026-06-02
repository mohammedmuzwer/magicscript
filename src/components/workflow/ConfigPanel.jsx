"use client";

import { useState, useEffect } from "react";
import { X, Trash2, Save, ChevronDown } from "lucide-react";
import {
  Lightbulb, TrendingUp, BookOpen, CheckCircle, Shield,
  Sparkles, Layout, FileText, Layers, Globe, Star,
} from "lucide-react";
import { AGENT_REGISTRY, CATEGORY_COLORS } from "@/lib/agents/registry";

const ICON_MAP = {
  Lightbulb, TrendingUp, BookOpen, CheckCircle, Shield,
  Sparkles, Layout, FileText, Layers, Globe, Star,
};

export default function ConfigPanel({ node, onClose, onDelete, onSave }) {
  const [localConfig, setLocalConfig] = useState({});

  const agent  = node ? AGENT_REGISTRY[node.data?.agentType] : null;
  const colors  = agent ? CATEGORY_COLORS[agent.color] : null;
  const Icon    = agent ? ICON_MAP[agent.icon] || Sparkles : null;

  // Reset config when node changes
  useEffect(() => {
    if (!agent) return;
    const defaults = {};
    for (const [key, field] of Object.entries(agent.config)) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      defaults[key] = node?.data?.config?.[key] ?? field.default ?? "";
    }
    setLocalConfig(defaults);
    // intentionally omit node.data.config — we only reset when the selected node id changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node?.id]);

  if (!node || !agent) {
    return (
      <aside className="flex h-full w-[260px] shrink-0 flex-col border-l border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))]">
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-center text-xs text-faint">
            Click an agent on the canvas to configure it
          </p>
        </div>
      </aside>
    );
  }

  const handleChange = (key, value) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(node.id, localConfig);
    onClose();
  };

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-l border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))]">
      {/* Header */}
      <div className={`border-b border-[rgb(var(--border))] px-4 py-3.5 ${colors.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`grid h-7 w-7 place-items-center rounded-lg border ${colors.border} ${colors.bg}`}>
              <Icon size={14} className={colors.text} />
            </div>
            <div>
              <h2 className="text-[12px] font-bold">{agent.name}</h2>
              <p className={`text-[9px] font-semibold uppercase tracking-wider ${colors.text}`}>
                {agent.category} · {agent.credits} credit{agent.credits !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-6 w-6 place-items-center rounded-md hover:bg-[rgb(var(--border))] transition"
          >
            <X size={12} />
          </button>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-faint">{agent.description}</p>
      </div>

      {/* Config fields */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-faint">Configuration</p>

        {Object.entries(agent.config).map(([key, field]) => (
          <div key={key}>
            <label className="mb-1 block text-[11px] font-semibold" style={{ color: "rgb(var(--text-soft))" }}>
              {field.label}
            </label>

            {field.type === "select" && (
              <div className="relative">
                <select
                  value={localConfig[key] ?? field.default}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full appearance-none rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-cyan/40"
                >
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </option>
                  ))}
                </select>
                <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-faint" />
              </div>
            )}

            {field.type === "number" && (
              <input
                type="number"
                min={field.min}
                max={field.max}
                value={localConfig[key] ?? field.default}
                onChange={(e) => handleChange(key, Number(e.target.value))}
                className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-cyan/40"
              />
            )}

            {field.type === "boolean" && (
              <label className="flex cursor-pointer items-center gap-2">
                <div
                  className={`relative h-4.5 w-8 rounded-full transition-colors ${localConfig[key] ? "bg-cyan" : "bg-[rgb(var(--border))]"}`}
                  onClick={() => handleChange(key, !localConfig[key])}
                >
                  <div
                    className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${localConfig[key] ? "translate-x-3.5" : "translate-x-0.5"}`}
                  />
                </div>
                <span className="text-[11px] text-soft">{localConfig[key] ? "Enabled" : "Disabled"}</span>
              </label>
            )}
          </div>
        ))}

        {/* Outputs preview */}
        <div className="mt-2">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-faint">Outputs</p>
          <div className="flex flex-wrap gap-1">
            {agent.outputs.map((out) => (
              <span key={out} className={`rounded-full border px-2 py-0.5 text-[9px] font-medium ${colors.border} ${colors.bg} ${colors.text}`}>
                {out.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="border-t border-[rgb(var(--border))] p-3 flex gap-2">
        <button
          onClick={() => onDelete(node.id)}
          className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/8 px-3 py-1.5 text-[11px] font-semibold text-red-400 transition hover:bg-red-500/15"
        >
          <Trash2 size={12} /> Delete
        </button>
        <button
          onClick={handleSave}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg btn btn-primary py-1.5 text-[11px]"
        >
          <Save size={12} /> Save & Close
        </button>
      </div>
    </aside>
  );
}
