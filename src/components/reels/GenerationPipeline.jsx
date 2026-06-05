"use client";

import { motion } from "framer-motion";
import { Check, Loader2, ArrowRight } from "lucide-react";
import { reelRunCost } from "@/lib/reels/creditCosts";

// Stage 4 = script generation only. Medical verification (PubMed + WHO) happens
// in Stage 3; here it is shown as an INHERITED pass-through, never re-scanned.
const STEPS = [
  { key: "expand",   icon: "🔍", label: "Topic Expansion",    cr: 1,  log: "Unpacking your topic angle..." },
  { key: "audience", icon: "👥", label: "Audience Profiling",  cr: 0,  log: "Cached psychographic data loaded" },
  { key: "medcheck", icon: "✅", label: "Medical Evidence",    cr: 0,  log: "Verified in Stage 3 — passed", inherited: true },
  { key: "scripts",  icon: "✍️", label: "Script Generation",   cr: 3,  log: "Writing 3 script styles in parallel..." },
  { key: "polish",   icon: "🎨", label: "Format & Polish",     cr: 1,  log: "Applying style, hooks, and CTAs..." },
];

/**
 * @param {object} props
 * @param {"idle"|"running"|"done"} props.status
 * @param {number}  props.activeStep   0-based index of the in-progress step
 * @param {boolean} props.awaitingMed  true when med-check is done and we're
 *                                     waiting for the user to click the gate
 */
export default function GenerationPipeline({ status, activeStep, awaitingMed = false, reelProgress = { current: 0, total: 0 }, model = "gemini" }) {
  if (status === "idle") return null;

  const isBatch = reelProgress.total > 1;

  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-faint">
            {awaitingMed ? "Awaiting your approval" : status === "done" ? "Pipeline complete" : "Generating..."}
          </p>
          {isBatch && reelProgress.current > 0 && (
            <p className="mt-0.5 text-sm font-bold text-[#2563eb]">
              Writing Reel {reelProgress.current} of {reelProgress.total}…
            </p>
          )}
        </div>
        {awaitingMed && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
            <ArrowRight size={10} />
            Review the Evidence panel →
          </span>
        )}
      </div>

      <div className="space-y-3">
        {STEPS.map((step, i) => {
          // Inherited steps (medical evidence from Stage 3) are always complete.
          const done    = step.inherited || i < activeStep || status === "done";
          // While awaitingMed, the script-gen step (i=3) is "waiting" — not actually running
          const isWaitGate = awaitingMed && i === activeStep;
          const running    = !step.inherited && !isWaitGate && i === activeStep && status === "running";

          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3"
            >
              {/* Status icon */}
              <div className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-sm transition ${
                done       ? "bg-[#2563eb]/20 text-[#2563eb]"
                : isWaitGate ? "bg-amber-500/20 text-amber-300"
                : running    ? "bg-electric/20 text-electric"
                : "bg-[rgb(var(--bg-soft))] text-faint"
              }`}>
                {done ? (
                  <Check size={12} strokeWidth={3} />
                ) : isWaitGate ? (
                  <span className="text-[11px] font-bold">⏸</span>
                ) : running ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <span className="text-[10px]">{i + 1}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{step.icon}</span>
                  <span className={`text-sm font-semibold ${
                    done       ? "text-[#2563eb]"
                    : isWaitGate ? "text-amber-300"
                    : running    ? "text-[rgb(var(--text))]"
                    : "text-faint"
                  }`}>
                    {step.label}
                  </span>
                  {/* Per-step cost is no longer charged individually — the whole
                      Stage 1→5 run is priced by batch size (shown in the footer).
                      Only the genuinely free/inherited steps keep a badge. */}
                  {step.cr === 0 && (
                    <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                      FREE
                    </span>
                  )}
                </div>
                {(running || done || isWaitGate) && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-0.5 truncate text-[11px] text-faint"
                  >
                    {done
                      ? "✓ Complete"
                      : isWaitGate
                        ? "Paused — click 'Continue Anyway' in the Evidence panel to proceed"
                        : step.log}
                  </motion.p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Total credit tally — only while generating; once done the "Total Spent"
          card (Stage 5) shows the authoritative figure, so we hide this to avoid
          three duplicate cost cards. */}
      {status !== "done" && (
        <div className="mt-4 flex items-center justify-between border-t border-[rgb(var(--border))] pt-3 text-xs">
          <span className="text-faint">Total cost</span>
          <span className="font-bold text-[#2563eb]">
            {reelRunCost(reelProgress.total || 1, model)} credits
            {(reelProgress.total || 1) > 1 ? ` (${reelProgress.total} reels)` : ""}
          </span>
        </div>
      )}
    </div>
  );
}
