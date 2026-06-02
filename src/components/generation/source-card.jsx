"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ExternalLink, FlaskConical, Users, Calendar, Quote } from "lucide-react";
import { SourceBadge, EvidenceLevelBadge } from "@/components/ui/badges";

// Generate the best real URL for each source type
function getSourceUrl(source) {
  const q = encodeURIComponent(source.title || "");
  switch (source.source) {
    case "PubMed":
      return `https://pubmed.ncbi.nlm.nih.gov/?term=${q}`;
    case "NIH":
      return `https://www.nccih.nih.gov/health/search?q=${q}`;
    case "WHO":
      return `https://www.who.int/search?indexCatalogue=genericsearchindex1&searchQuery=${q}`;
    case "FDA":
      return `https://www.fda.gov/search?s=${q}`;
    case "ClinicalTrials.gov":
      return `https://clinicaltrials.gov/search?query=${q}`;
    default:
      return `https://scholar.google.com/scholar?q=${q}`;
  }
}

export default function SourceCard({ source }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-[rgb(var(--bg-soft))] transition-colors ${
        open ? "border-cyan/40" : "border-[rgb(var(--border))]"
      }`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-3.5 text-left"
      >
        <SourceBadge source={source.source} size={38} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-cyan">{source.source}</span>
            <span className="text-[11px] text-faint">· {source.journal}</span>
          </div>
          <h4 className="mt-0.5 text-[13px] font-semibold leading-snug line-clamp-2">
            {source.title}
          </h4>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <EvidenceLevelBadge level={source.evidenceLevel} />
            <Meta icon={Calendar}>{source.year}</Meta>
            <Meta icon={Users}>{source.sampleSize}</Meta>
            <Meta icon={FlaskConical}>{source.subjects}</Meta>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`mt-1 shrink-0 text-faint transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="border-t border-[rgb(var(--border))] p-3.5">
              <div className="flex items-start gap-2">
                <Quote size={13} className="mt-0.5 shrink-0 text-cyan" />
                <p className="text-xs leading-relaxed text-soft">{source.summary}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-faint">
                  Study type: <span className="text-soft">{source.studyType}</span>
                </span>
                <a
                  href={source.url || getSourceUrl(source)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-2.5 py-1 text-[11px] font-semibold text-cyan transition hover:border-cyan/45 hover:bg-cyan/8"
                >
                  View citation <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Meta({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-[rgb(var(--panel))] px-1.5 py-0.5 text-[10px] text-faint">
      <Icon size={10} /> {children}
    </span>
  );
}
