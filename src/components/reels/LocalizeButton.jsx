"use client";

import { useState, useRef } from "react";
import { Globe, Loader2, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { REELS_CREDITS } from "@/lib/reels/creditCosts";
import { useAuth } from "@/lib/auth-context";

const LANGUAGES = [
  { id: "tanglish",  label: "Tanglish" },
  { id: "tamil",     label: "Tamil" },
  { id: "hindi",     label: "Hindi" },
  { id: "malayalam", label: "Malayalam" },
  { id: "telugu",    label: "Telugu" },
  { id: "kannada",   label: "Kannada" },
];

export default function LocalizeButton({ script, onLocalized }) {
  const { spendCredit } = useAuth();
  const [open, setOpen]             = useState(false);
  const [loading, setLoading]       = useState(false);
  const [activeLang, setActiveLang] = useState(null);
  const [localized, setLocalized]   = useState(null);
  const ref = useRef(null);

  const handleSelect = async (lang) => {
    setOpen(false);
    setLoading(true);

    const anthropicKey = typeof window !== "undefined" ? localStorage.getItem("ms_anthropic_key") : null;
    const openaiKey    = typeof window !== "undefined" ? localStorage.getItem("ms_openai_key") : null;

    try {
      const res = await fetch("/api/reels/localize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(anthropicKey && { "x-client-anthropic-key": anthropicKey }),
          ...(openaiKey    && { "x-client-openai-key": openaiKey }),
        },
        body: JSON.stringify({ script, targetLanguage: lang.label }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLocalized(data.localized);
      setActiveLang(lang);
      spendCredit(REELS_CREDITS.LOCALIZE_SCRIPT);
      onLocalized?.(data.localized, lang.id);
    } catch {
      // silent fallback
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setLocalized(null);
    setActiveLang(null);
    onLocalized?.(null, null);
  };

  if (activeLang) {
    return (
      <div className="flex items-center gap-2">
        <button onClick={handleReset} className="flex items-center gap-1 text-xs text-faint hover:text-soft transition">
          <ChevronLeft size={12} /> English
        </button>
        <span className="text-[11px] font-semibold text-cyan">🌐 {activeLang.label} ✓</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] px-2.5 py-1.5 text-xs font-medium text-soft transition hover:border-cyan/40 hover:text-cyan disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Globe size={12} className={loading ? "animate-spin" : ""} />
        )}
        Localize ({REELS_CREDITS.LOCALIZE_SCRIPT}cr)
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 z-20 mb-1.5 w-40 overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] shadow-card"
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => handleSelect(lang)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-soft transition hover:bg-cyan/10 hover:text-cyan"
                >
                  🌐 {lang.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
