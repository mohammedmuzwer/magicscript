"use client";

/**
 * PodcastKeyModal — API key management for the Doctor Farmer MagicScript Pipeline.
 * Stores keys to localStorage under the ms_* namespace consumed by all Stage components.
 *
 * Primary:   Google Gemini    → ms_gemini_key    (gemini-1.5-pro / flash)
 * Secondary: Anthropic Claude → ms_anthropic_key (fallback)
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Check, Trash2, Key, ChevronDown, ChevronUp, Zap } from "lucide-react";

const KEYS = [
  {
    id:       "gemini",
    ls:       "ms_gemini_key",
    label:    "Google Gemini",
    badge:    "Primary",
    badgeCls: "bg-cyan/15 text-cyan border-cyan/30",
    hint:     "Used for Stages 1, 4, 6 (gemini-1.5-pro) and Stages 2, 3, 5 (gemini-1.5-flash)",
    placeholder: "AIza…",
    icon:     "✦",
  },
  {
    id:       "anthropic",
    ls:       "ms_anthropic_key",
    label:    "Anthropic Claude",
    badge:    "Fallback",
    badgeCls: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    hint:     "Used if no Gemini key is present (primary for Stages 6, 8, 9)",
    placeholder: "sk-ant-…",
    icon:     "◈",
  },
];

function KeyRow({ def, value, onChange, onSave, onClear, saved }) {
  const [visible, setVisible] = useState(false);
  const isDirty = value !== (typeof window !== "undefined" ? localStorage.getItem(def.ls) || "" : "");

  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{def.icon}</span>
          <span className="text-sm font-semibold text-[rgb(var(--text))]">{def.label}</span>
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${def.badgeCls}`}>
            {def.badge}
          </span>
          {saved && (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
              <Check size={10} /> Saved
            </span>
          )}
        </div>
        {saved && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[10px] text-faint hover:text-red-400 transition-colors"
          >
            <Trash2 size={11} /> Remove
          </button>
        )}
      </div>

      <p className="text-[10px] text-faint">{def.hint}</p>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={visible ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={def.placeholder}
            className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-3 py-2 pr-10 text-xs font-mono text-[rgb(var(--text))] placeholder:text-faint focus:outline-none focus:border-cyan/50"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-[rgb(var(--text))] transition-colors"
          >
            {visible ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
        <button
          onClick={onSave}
          disabled={!value.trim()}
          className="rounded-lg bg-cyan px-4 py-2 text-xs font-bold text-navy-950 transition hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default function PodcastKeyModal({ open, onClose }) {
  const [values, setValues] = useState({ gemini: "", anthropic: "" });
  const [saved,  setSaved]  = useState({ gemini: false, anthropic: false });

  // Load on open
  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    const next = {};
    const savedNext = {};
    KEYS.forEach((k) => {
      const stored = localStorage.getItem(k.ls) || "";
      next[k.id]      = stored;
      savedNext[k.id] = stored.length > 0;
    });
    setValues(next);
    setSaved(savedNext);
  }, [open]);

  function handleSave(id, ls) {
    const v = values[id].trim();
    if (!v) return;
    localStorage.setItem(ls, v);
    setSaved((prev) => ({ ...prev, [id]: true }));
  }

  function handleClear(id, ls) {
    localStorage.removeItem(ls);
    setValues((prev)  => ({ ...prev, [id]: "" }));
    setSaved((prev)   => ({ ...prev, [id]: false }));
  }

  const hasGemini = saved.gemini;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="fixed inset-x-4 top-[10vh] z-50 mx-auto max-w-lg rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgb(var(--border))]">
              <div className="flex items-center gap-2">
                <Key size={16} className="text-cyan" />
                <h2 className="text-sm font-bold text-[rgb(var(--text))]">MagicScript API Keys</h2>
              </div>
              <button onClick={onClose} className="text-faint hover:text-[rgb(var(--text))] transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Status banner */}
              <div className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-xs ${
                hasGemini
                  ? "border-emerald-500/30 bg-emerald-500/8 text-emerald-400"
                  : "border-amber-500/30 bg-amber-500/8 text-amber-400"
              }`}>
                <Zap size={13} className="shrink-0 mt-0.5" />
                <div>
                  {hasGemini
                    ? "Gemini key detected — all stages will use Google Gemini as the primary AI engine."
                    : "Add your Google Gemini key to enable the MagicScript Pipeline. Without a key, the app runs in demo mode with sample data."}
                </div>
              </div>

              {KEYS.map((def) => (
                <KeyRow
                  key={def.id}
                  def={def}
                  value={values[def.id]}
                  onChange={(v) => setValues((prev) => ({ ...prev, [def.id]: v }))}
                  onSave={() => handleSave(def.id, def.ls)}
                  onClear={() => handleClear(def.id, def.ls)}
                  saved={saved[def.id]}
                />
              ))}

              {/* Privacy note */}
              <p className="text-[10px] text-faint leading-relaxed">
                <span className="font-semibold text-[rgb(var(--text-soft))]">Keys stay in your browser.</span>{" "}
                They are written to <span className="font-mono">localStorage</span> and never sent to or stored on any server. They are only sent directly to the AI provider API when you run a stage.
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end px-5 py-4 border-t border-[rgb(var(--border))]">
              <button
                onClick={onClose}
                className="rounded-xl bg-cyan px-5 py-2 text-sm font-bold text-navy-950 transition hover:brightness-110"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Compact key status indicator — shows in the podcast page header.
 */
export function PodcastKeyStatus({ onClick }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const gk = localStorage.getItem("V_KEY_GOOGLE");
    const ak = localStorage.getItem("V_KEY_CLAUDE");
    if (gk) setStatus("gemini");
    else if (ak) setStatus("anthropic");
    else setStatus("demo");
  }, []);

  const map = {
    loading:   { label: "…",          cls: "bg-[rgb(var(--bg-soft))] text-faint border-[rgb(var(--border))]" },
    gemini:    { label: "Gemini ✦",   cls: "bg-cyan/10 text-cyan border-cyan/30" },
    anthropic: { label: "Claude ◈",   cls: "bg-violet-500/10 text-violet-400 border-violet-500/30" },
    demo:      { label: "Demo mode",  cls: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  };

  const s = map[status] || map.loading;

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition hover:brightness-110 ${s.cls}`}
    >
      <Key size={10} />
      {s.label}
    </button>
  );
}
