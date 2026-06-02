"use client";

import { useState, useEffect } from "react";
import { getModelPref, setModelPref, DEFAULT_MODEL_PREFS } from "@/lib/podcast/model-preference";

/**
 * ModelToggle — per-stage Gemini / Claude selector.
 *
 * Props:
 *   stageNum   — number  — which stage (1–10)
 *   onChange   — fn(model: "gemini"|"claude") — called when user switches
 *   disabled   — bool — grey out while a generation is running
 *   className  — extra Tailwind classes for positioning
 */
export default function ModelToggle({ stageNum, onChange, disabled = false, className = "" }) {
  const [pref, setPref] = useState("gemini");
  const isDefault = pref === (DEFAULT_MODEL_PREFS[stageNum] ?? "gemini");

  useEffect(() => {
    setPref(getModelPref(stageNum));
  }, [stageNum]);

  function handleSelect(model) {
    if (disabled || model === pref) return;
    setPref(model);
    setModelPref(stageNum, model);
    onChange?.(model);
    // Notify other components (e.g. PodcastChat badge) in the same tab
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("modelPrefChange", { detail: { stageNum, model } }));
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-faint select-none">
        Model
      </span>

      <div className={`flex rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-0.5 gap-0.5 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
        {/* Gemini option — uses the user's browser-side Gemini key */}
        <button
          onClick={() => handleSelect("gemini")}
          title="Use Gemini 2.5 Flash (your Google API key)"
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold transition-all ${
            pref === "gemini"
              ? "bg-cyan/15 text-cyan border border-cyan/30 shadow-sm"
              : "text-faint hover:text-soft"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full transition-colors ${pref === "gemini" ? "bg-cyan" : "bg-faint/30"}`} />
          Gemini
        </button>

        {/* Claude option — uses the user's browser-side Anthropic key */}
        <button
          onClick={() => handleSelect("claude")}
          title="Use Claude Sonnet 4.6 (your Anthropic API key)"
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

      {/* "custom" indicator — shows when overriding the default */}
      {!isDefault && (
        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wide">
          custom
        </span>
      )}
    </div>
  );
}
