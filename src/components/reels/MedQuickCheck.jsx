"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle, ExternalLink, BookOpen } from "lucide-react";

/**
 * Compact evidence card shown after medical quick-check.
 * @param {object} props
 * @param {string}   props.topic
 * @param {object}   props.medCheck  — result from /api/reels/medcheck
 * @param {function} props.onViewDetails — open full MedVerify modal
 * @param {function} props.onContinue
 */
export default function MedQuickCheck({ topic, medCheck, onViewDetails, onContinue }) {
  if (!medCheck) return null;

  const score        = medCheck.evidence_score ?? 0;
  const status       = medCheck.safety_status ?? "caution";
  const flags        = medCheck.flagged_claims ?? [];
  // Prefer full article objects (real PubMed); fall back to string refs
  const articles     = medCheck.pubmed_articles ?? [];
  const stringRefs   = medCheck.pubmed_references ?? [];
  const articleCount = medCheck.article_count ?? null;
  const evidenceLabel= medCheck.evidence_label ?? null;
  const pubmedQuery  = medCheck.pubmed_query ?? null;   // cleaned query used for search
  const isRealPubMed = articles.length > 0 || articleCount !== null;

  const band =
    score >= 70
      ? { label: "Safe to publish", color: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500", icon: <CheckCircle size={15} className="text-emerald-500 dark:text-emerald-400" /> }
      : score >= 40
      ? { label: "Publish with caution", color: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500", icon: <AlertTriangle size={15} className="text-amber-500 dark:text-amber-400" /> }
      : { label: "Do not publish — rephrase required", color: "text-rose-600 dark:text-rose-400", bar: "bg-rose-500", icon: <XCircle size={15} className="text-rose-500 dark:text-rose-400" /> };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4"
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">🔬</span>
        <div className="flex-1">
          <span className="font-display font-bold text-sm">Quick Evidence Check</span>
          {isRealPubMed && (
            <span className="ml-2 rounded-full bg-[#2563eb]/15 px-2 py-0.5 text-[10px] font-semibold text-[#2563eb] dark:text-[#60a5fa]">
              Live PubMed
            </span>
          )}
        </div>
      </div>

      <p className="mb-3 text-xs text-faint truncate">Topic: {topic}</p>

      {/* Evidence score bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-faint">
            Evidence Score
            {articleCount !== null && (
              <span className="ml-1 text-[10px] opacity-70">({articleCount} papers found)</span>
            )}
          </span>
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
        {evidenceLabel && (
          <p className="mt-0.5 text-[10px] text-faint">{evidenceLabel}</p>
        )}
      </div>

      {/* Claim safety */}
      <div className="mb-3 flex items-center gap-1.5">
        {band.icon}
        <span className={`text-xs font-semibold ${band.color}`}>{band.label}</span>
      </div>

      {/* Real PubMed articles with links */}
      {articles.length > 0 && (
        <div className="mb-3 space-y-1.5">
          <div className="flex items-center gap-1 text-[10px] text-faint font-semibold uppercase tracking-wide">
            <BookOpen size={10} />
            PubMed Sources
            {pubmedQuery && (
              <span className="ml-1 font-normal normal-case opacity-60">· searched: "{pubmedQuery}"</span>
            )}
          </div>
          {articles.slice(0, 3).map((a) => (
            <a
              key={a.pmid}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-2.5 py-2 text-[10px] hover:border-[#2563eb]/40 transition-colors group"
            >
              <ExternalLink size={9} className="mt-0.5 shrink-0 text-faint group-hover:text-[#2563eb]" />
              <div className="min-w-0">
                <p className="font-medium text-slate-700 dark:text-soft leading-tight line-clamp-2 group-hover:text-[#2563eb] dark:group-hover:text-[#60a5fa] transition-colors">
                  {a.title}
                </p>
                <p className="mt-0.5 text-faint">
                  {a.journal}{a.year ? ` · ${a.year}` : ""}{a.pmid ? ` · PMID ${a.pmid}` : ""}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Fallback string refs when no full article objects */}
      {articles.length === 0 && stringRefs.length > 0 && (
        <p className="mb-2 text-[11px] text-faint">
          Sources: {stringRefs.slice(0, 3).map((r) => r.split(" — ")[0] || r.split(" - ")[0]).join(" • ")}
        </p>
      )}

      {/* Flagged claims */}
      {flags.length > 0 && (
        <div className="mb-3 rounded-lg bg-amber-500/10 border border-amber-500/25 px-3 py-2">
          <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            ⚠️ {flags.length} claim{flags.length > 1 ? "s" : ""} flagged — rephrase suggested
          </p>
        </div>
      )}

      {/* Safety note */}
      {medCheck.safety_note && (
        <p className="mb-3 text-[11px] text-faint italic">{medCheck.safety_note}</p>
      )}

      {/* Low-evidence advisory — never hard-blocks, user always decides */}
      {score < 40 && (
        <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/8 px-3 py-2.5 text-[11px] text-amber-600 dark:text-amber-300 space-y-1">
          <p className="font-bold">⚠️ Limited PubMed research found for this topic</p>
          <p className="opacity-80">
            You can still generate — but cite carefully and avoid absolute claims.
            Or go back to Stage 2 and pick a higher-demand topic.
          </p>
        </div>
      )}

      {/* Actions — always visible, user always decides */}
      <div className="flex gap-2">
        <button
          onClick={onViewDetails}
          className="flex items-center gap-1 text-xs text-[#2563eb] dark:text-[#60a5fa] hover:underline"
        >
          View Details <ExternalLink size={11} />
        </button>
        <button
          onClick={onContinue}
          className={`ml-auto rounded-lg px-3 py-1.5 text-xs font-bold transition hover:brightness-110 ${
            score >= 70
              ? "bg-[#2563eb] text-navy-950"
              : score >= 40
              ? "bg-amber-500 text-white"
              : "bg-slate-600 dark:bg-slate-700 text-white"
          }`}
        >
          {score >= 70 ? "Continue →" : score >= 40 ? "Continue with Caution →" : "Generate Anyway →"}
        </button>
      </div>
    </motion.div>
  );
}
