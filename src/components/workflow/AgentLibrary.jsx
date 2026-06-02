"use client";

import { useState } from "react";
import {
  Lightbulb, TrendingUp, BookOpen, CheckCircle, Shield,
  Sparkles, Layout, FileText, Layers, Globe, Star,
  ChevronDown, ChevronRight,
} from "lucide-react";
import { AGENTS_BY_CATEGORY, AGENT_CATEGORIES, CATEGORY_COLORS } from "@/lib/agents/registry";

const ICON_MAP = {
  Lightbulb, TrendingUp, BookOpen, CheckCircle, Shield,
  Sparkles, Layout, FileText, Layers, Globe, Star,
};

export default function AgentLibrary() {
  const [collapsed, setCollapsed] = useState({});

  const toggle = (cat) =>
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const onDragStart = (event, agentType) => {
    event.dataTransfer.setData("application/reactflow", agentType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))]">
      <div className="border-b border-[rgb(var(--border))] px-4 py-3.5">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">
          Agent Library
        </h2>
        <p className="mt-0.5 text-[10px] text-faint">Drag agents onto the canvas</p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {Object.entries(AGENT_CATEGORIES).map(([catKey, cat]) => {
          const agents  = AGENTS_BY_CATEGORY[catKey] || [];
          const colors  = CATEGORY_COLORS[cat.color];
          const isOpen  = !collapsed[catKey];

          return (
            <div key={catKey}>
              {/* Category header */}
              <button
                onClick={() => toggle(catKey)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-[rgb(var(--panel))]"
              >
                <span className={`h-2 w-2 rounded-full ${colors.text.replace("text-", "bg-")}`} style={{ background: colors.dot }} />
                <span className="flex-1 text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: colors.dot }}>
                  {cat.label}
                </span>
                <span className="text-[10px] text-faint">{agents.length}</span>
                {isOpen ? <ChevronDown size={12} className="text-faint" /> : <ChevronRight size={12} className="text-faint" />}
              </button>

              {/* Agents */}
              {isOpen && (
                <div className="mt-0.5 space-y-1 pl-1">
                  {agents.map((agent) => {
                    const Icon = ICON_MAP[agent.icon] || Sparkles;
                    return (
                      <div
                        key={agent.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, agent.id)}
                        className={`
                          group flex cursor-grab items-start gap-2 rounded-lg border p-2
                          transition-all duration-150 active:cursor-grabbing
                          ${colors.bg} ${colors.border}
                          hover:shadow-md hover:scale-[1.02]
                        `}
                        title={agent.description}
                      >
                        <div className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border ${colors.border} ${colors.bg}`}>
                          <Icon size={12} className={colors.text} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold leading-tight" style={{ color: "rgb(var(--text))" }}>
                            {agent.name}
                          </p>
                          <p className="mt-0.5 text-[9px] leading-tight text-faint line-clamp-2">
                            {agent.description}
                          </p>
                          <p className={`mt-1 text-[9px] font-bold ${colors.text}`}>
                            {agent.credits} credit{agent.credits !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer tip */}
      <div className="border-t border-[rgb(var(--border))] p-3">
        <p className="text-center text-[9px] text-faint">
          Drag ↑ to canvas · Click node to configure
        </p>
      </div>
    </aside>
  );
}
