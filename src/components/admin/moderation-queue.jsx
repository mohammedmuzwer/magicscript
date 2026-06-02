"use client";

import { useState } from "react";
import { ShieldAlert, Check, Trash2, RotateCcw, Clock } from "lucide-react";
import { MODERATION_QUEUE } from "@/lib/mock-data";
import { VerdictBadge } from "@/components/ui/badges";
import { timeAgo, riskLabel } from "@/lib/utils";

const STATUS_STYLE = {
  pending: "bg-amber-500/12 text-amber-300",
  reviewing: "bg-electric/12 text-cyan",
  resolved: "bg-emerald-500/12 text-emerald-300",
  removed: "bg-rose-500/12 text-rose-300",
};

export default function ModerationQueue() {
  const [items, setItems] = useState(MODERATION_QUEUE);
  const [filter, setFilter] = useState("all");

  function setStatus(id, status) {
    setItems((list) => list.map((it) => (it.id === id ? { ...it, status } : it)));
  }

  const filtered =
    filter === "all" ? items : items.filter((it) => it.status === filter);
  const pendingCount = items.filter((it) => it.status === "pending").length;

  return (
    <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgb(var(--border))] px-5 py-4">
        <h2 className="flex items-center gap-2 font-display text-base font-bold">
          <ShieldAlert size={17} className="text-rose-300" /> Content Moderation Queue
          <span className="rounded-md bg-rose-500/12 px-1.5 py-0.5 text-[11px] font-bold text-rose-300">
            {pendingCount} pending
          </span>
        </h2>
        <div className="flex gap-1">
          {["all", "pending", "reviewing", "resolved"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize transition ${
                filter === f
                  ? "bg-cyan/15 text-cyan ring-1 ring-cyan/25"
                  : "text-soft hover:bg-electric/8"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-[rgb(var(--border))]">
        {filtered.map((it) => {
          const risk = riskLabel(it.risk);
          return (
            <div key={it.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold capitalize ${STATUS_STYLE[it.status]}`}>
                    {it.status}
                  </span>
                  <VerdictBadge verdict={it.verdict} size="sm" showLabel={false} />
                  <span className="flex items-center gap-1 text-[10px] text-faint">
                    <Clock size={10} /> {timeAgo(it.at)}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold leading-snug">{it.topic}</p>
                <p className="mt-0.5 text-[11px] text-faint">
                  by <span className="text-soft">@{it.user}</span> · {it.flaggedFor}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-24">
                  <div className="flex justify-between text-[10px] text-faint">
                    <span>Risk</span>
                    <span className={`font-bold text-${risk.tone}-300`}>{it.risk}</span>
                  </div>
                  <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-[rgb(var(--bg-soft))]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-400 to-rose-400"
                      style={{ width: `${it.risk}%` }}
                    />
                  </div>
                </div>
                <div className="flex gap-1">
                  <Action
                    onClick={() => setStatus(it.id, "resolved")}
                    title="Approve reframed"
                    tone="emerald"
                  >
                    <Check size={14} />
                  </Action>
                  <Action
                    onClick={() => setStatus(it.id, "removed")}
                    title="Remove content"
                    tone="rose"
                  >
                    <Trash2 size={14} />
                  </Action>
                  <Action
                    onClick={() => setStatus(it.id, "pending")}
                    title="Reset"
                    tone="slate"
                  >
                    <RotateCcw size={14} />
                  </Action>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-faint">No items in this view.</p>
        )}
      </div>
    </div>
  );
}

function Action({ children, onClick, title, tone }) {
  const tones = {
    emerald: "hover:border-emerald-400/50 hover:text-emerald-300",
    rose: "hover:border-rose-400/50 hover:text-rose-300",
    slate: "hover:border-electric/45 hover:text-cyan",
  };
  return (
    <button
      onClick={onClick}
      title={title}
      className={`grid h-8 w-8 place-items-center rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] text-faint transition ${tones[tone]}`}
    >
      {children}
    </button>
  );
}
