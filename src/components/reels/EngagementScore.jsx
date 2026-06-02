"use client";

import { motion } from "framer-motion";
import { computeEngagementScore } from "@/lib/reels/engagementScorer";

const LABEL_COLOR = {
  Viral:    "text-cyan",
  Strong:   "text-emerald-400",
  Moderate: "text-amber-400",
  Low:      "text-rose-400",
};

export default function EngagementScore({ contentTypeId, scriptStyle, evidenceScore, bucketId, language }) {
  const { score, label, hookStrength } = computeEngagementScore({
    contentTypeId,
    scriptStyle,
    evidenceScore,
    bucketId,
    language,
  });

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-faint">📊 Engagement Prediction</span>
          <span className={`text-[10px] font-bold ${LABEL_COLOR[label] ?? "text-soft"}`}>{label}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[rgb(var(--bg-soft))]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className={`h-full rounded-full ${
              label === "Viral" ? "bg-gradient-to-r from-cyan to-electric"
              : label === "Strong" ? "bg-emerald-500"
              : label === "Moderate" ? "bg-amber-500"
              : "bg-rose-500"
            }`}
          />
        </div>
      </div>
      <div className="text-right shrink-0">
        <span className="text-xs text-faint">🎯 Hook: </span>
        <span className="text-xs font-semibold text-soft">{hookStrength}</span>
      </div>
    </div>
  );
}
