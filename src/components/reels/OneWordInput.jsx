"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Zap } from "lucide-react";
import { REELS_CREDITS } from "@/lib/reels/creditCosts";
import { useAuth } from "@/lib/auth-context";

export default function OneWordInput({ onAngleSelect }) {
  const { spendCredit } = useAuth();
  const [word, setWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [angles, setAngles] = useState(null);
  const [error, setError] = useState("");

  const handleExpand = async () => {
    const w = word.trim();
    if (!w) return;
    setLoading(true);
    setError("");
    setAngles(null);

    try {
      const anthropicKey = typeof window !== "undefined" ? localStorage.getItem("ms_anthropic_key") : null;
      const openaiKey    = typeof window !== "undefined" ? localStorage.getItem("ms_openai_key") : null;

      const res = await fetch("/api/reels/expand", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(anthropicKey && { "x-client-anthropic-key": anthropicKey }),
          ...(openaiKey    && { "x-client-openai-key": openaiKey }),
        },
        body: JSON.stringify({ word: w }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAngles(data.angles);
      spendCredit(REELS_CREDITS.ONE_WORD_EXPAND);
    } catch (e) {
      setError("Expansion failed — try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleExpand()}
          placeholder='Type one word — e.g. "insulin", "cortisol", "fasting"'
          className="flex-1 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-2.5 text-sm outline-none transition placeholder:text-faint focus:border-[#2563eb]/50 focus:ring-1 focus:ring-[#2563eb]/20"
        />
        <button
          onClick={handleExpand}
          disabled={!word.trim() || loading}
          className="flex items-center gap-1.5 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-navy-950 transition hover:brightness-110 disabled:opacity-40"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
          Expand ({REELS_CREDITS.ONE_WORD_EXPAND}cr)
        </button>
      </div>

      {error && <p className="text-xs text-rose-400">{error}</p>}

      <AnimatePresence>
        {angles && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid gap-3 sm:grid-cols-3"
          >
            {angles.map((a, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => onAngleSelect(a.angle)}
                className="group rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3.5 text-left transition hover:border-[#2563eb]/40 hover:bg-[#2563eb]/5"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-faint">{a.type}</span>
                  <span className="text-[10px] font-semibold text-[#2563eb]">🔥 {a.virality_score}/10</span>
                </div>
                <p className="text-sm font-semibold leading-snug group-hover:text-[#2563eb] transition">{a.angle}</p>
                <p className="mt-1.5 text-xs text-faint italic">"{a.hook_preview}"</p>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
