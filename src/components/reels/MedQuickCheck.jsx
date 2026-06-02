"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle, ExternalLink } from "lucide-react";

/**
 * Compact evidence card shown after medical quick-check.
 * @param {object} props
 * @param {string}  props.topic
 * @param {object}  props.medCheck  — result from /api/reels/medcheck
 * @param {function} props.onViewDetails — open full MedVerify modal
 * @param {function} props.onContinue
 */
export default function MedQuickCheck({ topic, medCheck, onViewDetails, onContinue }) {
  if (!medCheck) return null;

  const score  = medCheck.evidence_score ?? 0;
  const status = medCheck.safety_status ?? "caution";
  const refs   = medCheck.pubmed_references ?? [];
  const flags  = medCheck.flagged_claims ?? [];

  const band =
    score >= 70 ? { label: "Safe to publish", color: "text-emerald-400", bar: "bg-emerald-500", icon: <CheckCircle size={15} className="text-emerald-400" /> }
    : score >= 40 ? { label: "Publish with caution", color: "text-amber-400", bar: "bg-amber-500", icon: <AlertTriangle size={15} className="text-amber-400" /> }
    : { label: "Do not publish — rephrase required", color: "text-rose-400", bar: "bg-rose-500", icon: <XCircle size={15} className="text-rose-400" /> };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4"
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">🔬</span>
        <span className="font-display font-bold text-sm">Quick Evidence Check</span>
      </div>

      <p className="mb-3 text-xs text-faint truncate">Topic: {topic}</p>

      {/* Evidence score bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-faint">Evidence Score</span>
          <span className="text-xs font-bold">{score}/100</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[rgb(var(--bg-soft))]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${band.bar}`}
          />
        </div>
      </div>

      {/* Claim safety */}
      <div className="mb-3 flex items-center gap-1.5">
        {band.icon}
        <span className={`text-xs font-semibold ${band.color}`}>{band.label}</span>
      </div>

      {/* Sources */}
      {refs.length > 0 && (
        <p className="mb-2 text-[11px] text-faint">
          Sources: {refs.map((r) => r.split(" - ")[0]).join(" • ")}
        </p>
      )}

      {/* Flagged claims */}
      {flags.length > 0 && (
        <div className="mb-3 rounded-lg bg-amber-500/10 border border-amber-500/25 px-3 py-2">
          <p className="text-[11px] font-semibold text-amber-400">
            ⚠️ {flags.length} claim{flags.length > 1 ? "s" : ""} flagged — rephrase suggested
          </p>
        </div>
      )}

      {/* Safety note */}
      {medCheck.safety_note && (
        <p className="mb-3 text-[11px] text-faint italic">{medCheck.safety_note}</p>
      )}

      {/* Actions */}
      {status !== "blocked" ? (
        <div className="flex gap-2">
          <button
            onClick={onViewDetails}
            className="flex items-center gap-1 text-xs text-cyan hover:underline"
          >
            View Details <ExternalLink size={11} />
          </button>
          <button
            onClick={onContinue}
            className="ml-auto rounded-lg bg-cyan px-3 py-1.5 text-xs font-bold text-navy-950 transition hover:brightness-110"
          >
            {score >= 70 ? "Continue →" : "Continue Anyway →"}
          </button>
        </div>
      ) : (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 px-3 py-2.5 text-xs text-rose-400 font-semibold">
          ⛔ Score too low — please rephrase your topic before generating scripts.
        </div>
      )}
    </motion.div>
  );
}
