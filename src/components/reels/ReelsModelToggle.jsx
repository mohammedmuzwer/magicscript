"use client";

import { useState, useEffect } from "react";
import { getReelsModelPref, setReelsModelPref, REELS_DEFAULT_MODEL_PREFS } from "@/lib/reels/stages";

/**
 * Reels per-stage Gemini / Claude selector.
 * Identical UX to podcast/ModelToggle but stores under a separate
 * localStorage key so Reels and Podcast prefs don't collide.
 */
export default function ReelsModelToggle({ stageNum, onChange, disabled = false, className = "" }) {
  const [pref, setPref] = useState("gemini");
  const isDefault = pref === (REELS_DEFAULT_MODEL_PREFS[stageNum] ?? "gemini");

  useEffect(() => {
    setPref(getReelsModelPref(stageNum));
  }, [stageNum]);

  function handleSelect(model) {
    if (disabled || model === pref) return;
    setPref(model);
    setReelsModelPref(stageNum, model);
    onChange?.(model);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("reelsModelPrefChange", { detail: { stageNum, model } }));
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-faint select-none">
        Model
      </span>

      <div className={`flex rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-0.5 gap-0.5 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
        {/* Gemini */}
        <button
          onClick={() => handleSelect("gemini")}
          title="Use Gemini 2.5 Flash for this stage"
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold transition-all ${
            pref === "gemini"
              ? "bg-cyan/15 text-cyan border border-cyan/30 shadow-sm"
              : "text-faint hover:text-soft"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full transition-colors ${pref === "gemini" ? "bg-cyan" : "bg-faint/30"}`} />
          Gemini
        </button>

        {/* Claude */}
        <button
          onClick={() => handleSelect("claude")}
          title="Use Claude Sonnet 4.6 for this stage"
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold transition-all ${
            pref === "claude"
              ? "bg-violet-500/15 text-violet-400 border border-violet-500/30 shadow-sm"
              : "text-faint hover:text-soft"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full transition-colors ${pref === "claude" ? "bg-violet-400" : "bg-faint/30"}`} />
          Claude
        </button>
      </div>

      {!isDefault && (
        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wide">
          custom
        </span>
      )}
    </div>
  );
}
