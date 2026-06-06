"use client";

import { useState, useEffect } from "react";
import { KeyRound } from "lucide-react";
import { getModelPref, setModelPref, DEFAULT_MODEL_PREFS } from "@/lib/podcast/model-preference";

// ── Key existence + enabled check ────────────────────────────────────────────
function hasKey(lsKey) {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(lsKey);
}
function isApiEnabled(lsKey) {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(lsKey + "_ENABLED") !== "false";
}

const MODEL_META = {
  gemini: { lsKey: "V_KEY_GOOGLE",  label: "Gemini", activeClass: "bg-blue-600/15 text-blue-500 border border-blue-500/30 shadow-sm",       dot: "bg-blue-500" },
  claude: { lsKey: "V_KEY_CLAUDE",  label: "Claude", activeClass: "bg-violet-500/15 text-violet-500 border border-violet-500/30 shadow-sm", dot: "bg-violet-500" },
};

/**
 * ModelToggle — per-stage Gemini / Claude selector.
 * Respects the ON/OFF toggle from Settings → API Keys.
 *
 * Props:
 *   stageNum   — number  — which stage (1–10)
 *   onChange   — fn(model: "gemini"|"claude") — called when user switches
 *   disabled   — bool — grey out while a generation is running
 *   className  — extra Tailwind classes for positioning
 */
export default function ModelToggle({ stageNum, onChange, disabled = false, className = "" }) {
  const [pref, setPref]         = useState("gemini");
  const [apiStatus, setApiStatus] = useState({ gemini: false, claude: false });

  const isDefault = pref === (DEFAULT_MODEL_PREFS[stageNum] ?? "gemini");

  useEffect(() => {
    setPref(getModelPref(stageNum));
  }, [stageNum]);

  useEffect(() => {
    const check = () => setApiStatus({
      gemini: hasKey("V_KEY_GOOGLE") && isApiEnabled("V_KEY_GOOGLE"),
      claude: hasKey("V_KEY_CLAUDE") && isApiEnabled("V_KEY_CLAUDE"),
    });
    check();
    window.addEventListener("storage", check);
    window.addEventListener("apiEnabledChange", check);
    return () => {
      window.removeEventListener("storage", check);
      window.removeEventListener("apiEnabledChange", check);
    };
  }, []);

  function handleSelect(model) {
    if (disabled) return;
    if (!apiStatus[model]) return; // blocked — key missing or OFF
    if (model === pref) return;
    setPref(model);
    setModelPref(stageNum, model);
    onChange?.(model);
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
        {Object.entries(MODEL_META).map(([id, meta]) => {
          const keyExists  = hasKey(meta.lsKey);
          const enabled    = apiStatus[id];
          const isPaused   = keyExists && !enabled;
          const noKey      = !keyExists;
          const isSelected = pref === id;
          const isBlocked  = !enabled;

          const tooltip = isPaused
            ? `${meta.label} is paused — go to Settings → API Keys and turn it ON`
            : noKey
            ? `Add a ${meta.label} key in Settings → API Keys`
            : `Use ${meta.label}`;

          return (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              title={tooltip}
              disabled={isBlocked}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold transition-all ${
                isBlocked
                  ? "opacity-40 cursor-not-allowed text-faint"
                  : isSelected
                  ? meta.activeClass
                  : "text-faint hover:text-soft"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full transition-colors ${isSelected && !isBlocked ? meta.dot : "bg-[rgb(var(--text-faint))]/30"}`} />
              {meta.label}
              {isPaused && <span style={{ fontSize: 8, fontWeight: 700, color: "#d97706", marginLeft: 2 }}>OFF</span>}
              {noKey    && <KeyRound size={8} className="text-faint/50 ml-0.5" />}
            </button>
          );
        })}
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
