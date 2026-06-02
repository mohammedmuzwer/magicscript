"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function ManualTopicInput({ onSubmit }) {
  const [value, setValue] = useState("");
  const MAX = 300;

  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, MAX))}
        rows={3}
        placeholder={`Describe your topic, angle, or paste a claim you want to debunk...\ne.g. "Why eating fat doesn't make you fat — the insulin theory explained simply for Tamil housewives"`}
        className="w-full resize-none rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-3 text-sm outline-none transition placeholder:text-faint focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20"
      />
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-faint">{value.length}/{MAX}</span>
        <button
          onClick={() => value.trim() && onSubmit(value.trim())}
          disabled={!value.trim()}
          className="flex items-center gap-1.5 rounded-xl bg-cyan px-4 py-2 text-sm font-semibold text-navy-950 transition hover:brightness-110 disabled:opacity-40"
        >
          Set Topic <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
