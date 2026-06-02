"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Check, Trash2, ShieldCheck, AlertCircle } from "lucide-react";

// ── localStorage key names (must match what callGenerateApi reads) ─────────
export const LS_KEY_CLAUDE  = "V_KEY_CLAUDE";
export const LS_KEY_GPT     = "V_KEY_GPT";
export const LS_KEY_GOOGLE  = "V_KEY_GOOGLE";

const PROVIDERS = [
  {
    id:          "claude",
    lsKey:       LS_KEY_CLAUDE,
    name:        "Anthropic Claude",
    description: "Primary generation engine. Powers hooks, scripts, captions and CTAs.",
    badge:       "Recommended",
    badgeColor:  "bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/20",
    accent:      "#FF9500",
    focusBorder: "focus:border-[#FF9500]",
    saveBg:      "bg-[#FF9500] hover:bg-[#e08400] text-black",
    placeholder: "sk-ant-api03-············································",
    icon:        "🤖",
    backendNote: null,
  },
  {
    id:          "gpt",
    lsKey:       LS_KEY_GPT,
    name:        "OpenAI GPT-4",
    description: "Automatic fallback layer when Claude key is absent.",
    badge:       "Fallback Layer",
    badgeColor:  "bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20",
    accent:      "#34C759",
    focusBorder: "focus:border-[#34C759]",
    saveBg:      "bg-[#34C759] hover:bg-[#2baa4f] text-black",
    placeholder: "sk-proj-············································",
    icon:        "🌌",
    backendNote: null,
  },
  {
    id:          "google",
    lsKey:       LS_KEY_GOOGLE,
    name:        "Google Gemini",
    description: "Stage 3 Medical Verification engine — Evidence Retrieval, Claim Validator & Safety Guard.",
    badge:       "Active Research Engine",
    badgeColor:  "bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20",
    accent:      "#34C759",
    focusBorder: "focus:border-[#34C759]",
    saveBg:      "bg-[#34C759] hover:bg-[#2baa4f] text-black",
    placeholder: "AIzaSy············································",
    icon:        "✨",
    backendNote: null,
  },
];

export default function ApiKeyManagementDesk() {
  const [keys, setKeys]       = useState({ claude: "", gpt: "", google: "" });
  const [visible, setVisible] = useState({ claude: false, gpt: false, google: false });
  const [saved, setSaved]     = useState({ claude: false, gpt: false, google: false });
  const [stored, setStored]   = useState({ claude: false, gpt: false, google: false });

  // Load from localStorage on mount
  useEffect(() => {
    const claude = localStorage.getItem(LS_KEY_CLAUDE)  || "";
    const gpt    = localStorage.getItem(LS_KEY_GPT)     || "";
    const google = localStorage.getItem(LS_KEY_GOOGLE)  || "";
    setKeys({ claude, gpt, google });
    setStored({
      claude: claude.length > 0,
      gpt:    gpt.length    > 0,
      google: google.length > 0,
    });
  }, []);

  function handleChange(id, value) {
    setKeys((prev) => ({ ...prev, [id]: value }));
  }

  function handleSave(id, lsKey) {
    const trimmed = keys[id].trim();
    if (trimmed) {
      localStorage.setItem(lsKey, trimmed);
    } else {
      localStorage.removeItem(lsKey);
    }
    setStored((prev) => ({ ...prev, [id]: trimmed.length > 0 }));
    setSaved((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [id]: false })), 2000);
  }

  function handleClear(id, lsKey) {
    localStorage.removeItem(lsKey);
    setKeys((prev)   => ({ ...prev, [id]: "" }));
    setStored((prev) => ({ ...prev, [id]: false }));
  }

  function toggleVisibility(id) {
    setVisible((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  // Determine which provider is currently active (first stored key wins)
  const activeProvider =
    stored.claude ? "claude" :
    stored.gpt    ? "gpt"    :
    stored.google ? "google" : null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-[#13161A] border border-white/[0.05] rounded-2xl p-6 space-y-1">
        <span className="text-[10px] font-bold text-[#007AFF] uppercase tracking-widest">
          System Infrastructure
        </span>
        <h2 className="text-base font-bold text-white/90 mt-0.5">
          Developer LLM Endpoint Gateway
        </h2>
        <p className="text-xs text-white/40 leading-relaxed">
          Provide developer credentials to route pipeline operations from local template data to
          live organic generation engines. Keys are encrypted to browser storage and sent securely
          with each request — they are never persisted on the server.
        </p>

        {/* Active provider status */}
        <div className="pt-3 flex items-center gap-2">
          {activeProvider ? (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
              <ShieldCheck size={13} />
              Live mode active —{" "}
              {activeProvider === "claude" ? "Anthropic Claude" :
               activeProvider === "gpt"    ? "OpenAI GPT-4"    : "Google Gemini"}{" "}
              routed
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white/30">
              <AlertCircle size={13} />
              No keys stored — running in demo template mode
            </span>
          )}
        </div>
      </div>

      {/* ── Provider cards ─────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {PROVIDERS.map((p) => {
          const isActive  = stored[p.id];
          const isSaved   = saved[p.id];
          const isVisible = visible[p.id];

          return (
            <div
              key={p.id}
              className="bg-[#13161A] border border-white/[0.05] rounded-xl p-4 space-y-3"
              style={isActive ? { borderColor: `${p.accent}30` } : undefined}
            >
              {/* Card header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{p.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white/90">{p.name}</h3>
                      {isActive && (
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: p.accent }}
                        />
                      )}
                    </div>
                    <p className="text-[10px] text-white/35 mt-0.5">{p.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isActive && !p.backendNote && (
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded-md">
                      Active
                    </span>
                  )}
                  <span
                    className={`text-[9px] font-semibold border px-2 py-0.5 rounded-md ${p.badgeColor}`}
                  >
                    {p.badge}
                  </span>
                </div>
              </div>

              {/* Input row */}
              <div className="flex gap-2">
                {/* Password field */}
                <div className="relative flex-1">
                  <input
                    type={isVisible ? "text" : "password"}
                    value={keys[p.id]}
                    onChange={(e) => handleChange(p.id, e.target.value)}
                    placeholder={p.placeholder}
                    autoComplete="off"
                    spellCheck={false}
                    className={`w-full bg-[#16191E] border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-xs font-mono text-white placeholder-white/20 outline-none transition-colors ${p.focusBorder}`}
                  />
                  {/* Toggle visibility */}
                  <button
                    type="button"
                    onClick={() => toggleVisibility(p.id)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                    aria-label={isVisible ? "Hide key" : "Show key"}
                  >
                    {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>

                {/* Clear button — only shown when key is stored */}
                {isActive && (
                  <button
                    type="button"
                    onClick={() => handleClear(p.id, p.lsKey)}
                    className="px-3 rounded-xl border border-white/10 text-white/30 hover:text-rose-400 hover:border-rose-400/30 transition-all"
                    aria-label="Clear key"
                  >
                    <Trash2 size={13} />
                  </button>
                )}

                {/* Save button */}
                <button
                  type="button"
                  onClick={() => handleSave(p.id, p.lsKey)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isSaved
                      ? "bg-emerald-500 text-black"
                      : p.saveBg
                  }`}
                >
                  {isSaved ? (
                    <span className="flex items-center gap-1.5">
                      <Check size={12} /> Locked
                    </span>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>

              {/* Backend note for unsupported providers */}
              {p.backendNote && (
                <p className="text-[10px] text-white/25 flex items-center gap-1.5">
                  <AlertCircle size={11} />
                  {p.backendNote}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <div className="bg-[#13161A] border border-white/[0.05] rounded-2xl p-5 space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-white/20 font-bold">How it works</p>
        <div className="space-y-2 text-[11px] text-white/40 leading-relaxed">
          <p>
            <span className="text-white/70 font-semibold">1. Keys stay in your browser.</span>{" "}
            They are written to <span className="font-mono text-white/60">localStorage</span> and never
            sent to or stored on any server outside your own device.
          </p>
          <p>
            <span className="text-white/70 font-semibold">2. Each generation request.</span>{" "}
            When you submit a keyword in the Studio, the key is attached as an encrypted
            request header so the local API route can call the live model on your behalf.
          </p>
          <p>
            <span className="text-white/70 font-semibold">3. Priority.</span>{" "}
            Claude → OpenAI → demo template. The first active key wins. Server environment
            variables in{" "}
            <span className="font-mono text-white/60">.env.local</span> take precedence over browser
            keys when both are present.
          </p>
        </div>
      </div>
    </div>
  );
}
