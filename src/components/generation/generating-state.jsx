"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Search, FlaskConical, Gauge, ShieldAlert, Sparkles } from "lucide-react";

const STEPS = [
  { icon: Search, label: "Analyzing the topic & intent" },
  { icon: FlaskConical, label: "Searching PubMed · NIH · WHO · FDA" },
  { icon: Gauge, label: "Scoring evidence confidence" },
  { icon: ShieldAlert, label: "Running misinformation safety scan" },
  { icon: Sparkles, label: "Writing native multilingual content" },
];

export default function GeneratingState({ topic }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActive((a) => Math.min(a + 1, STEPS.length));
    }, 480);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid place-items-center py-16">
      <div className="w-full max-w-md rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 shadow-glow">
        <div className="flex items-center gap-3">
          <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-cyan to-electric">
            <span className="absolute inset-0 animate-pulse-ring rounded-xl bg-cyan/40" />
            <Loader2 size={20} className="animate-spin text-navy-900" />
          </span>
          <div>
            <div className="font-display text-sm font-bold">Verifying & generating…</div>
            <div className="truncate text-xs text-faint">"{topic}"</div>
          </div>
        </div>

        <div className="mt-5 space-y-2.5">
          {STEPS.map((s, i) => {
            const done = i < active;
            const current = i === active;
            return (
              <motion.div
                key={s.label}
                className="flex items-center gap-2.5"
                animate={{ opacity: done || current ? 1 : 0.4 }}
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg transition ${
                    done
                      ? "bg-emerald-500/15 text-emerald-400"
                      : current
                      ? "bg-cyan/15 text-cyan"
                      : "bg-[rgb(var(--bg-soft))] text-faint"
                  }`}
                >
                  {done ? (
                    <Check size={14} />
                  ) : current ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <s.icon size={13} />
                  )}
                </span>
                <span
                  className={`text-xs font-medium ${
                    done || current ? "" : "text-faint"
                  }`}
                >
                  {s.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[rgb(var(--bg-soft))]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan to-electric"
            initial={{ width: "0%" }}
            animate={{ width: `${(active / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    </div>
  );
}
