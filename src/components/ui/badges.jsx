import { ShieldCheck, Scale, AlertTriangle, ShieldX } from "lucide-react";
import { VERDICTS, EVIDENCE_LEVELS } from "@/lib/research-data";
import { verdictStyle } from "@/lib/utils";

const VERDICT_ICON = {
  proven: ShieldCheck,
  mixed: Scale,
  misleading: AlertTriangle,
  false: ShieldX,
};

export function VerdictBadge({ verdict = "mixed", size = "md", showLabel = true }) {
  const Icon = VERDICT_ICON[verdict] || Scale;
  const s = verdictStyle(verdict);
  const meta = VERDICTS[verdict] || VERDICTS.mixed;
  const pad = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs";
  const iconSize = size === "sm" ? 12 : 14;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${s.bg} ${s.border} ${s.text} ${pad}`}
    >
      <Icon size={iconSize} />
      {showLabel && meta.label}
    </span>
  );
}

const EV_COLOR = {
  emerald: "bg-emerald-500/12 text-emerald-300 border-emerald-400/35",
  cyan: "bg-cyan/12 text-cyan border-cyan/35",
  blue: "bg-electric/12 text-electric border-electric/35",
  amber: "bg-amber-500/12 text-amber-300 border-amber-400/35",
  orange: "bg-orange-500/12 text-orange-300 border-orange-400/35",
  rose: "bg-rose-500/12 text-rose-300 border-rose-400/35",
};

export function EvidenceLevelBadge({ level }) {
  const meta = EVIDENCE_LEVELS[level] || { color: "blue", short: "B" };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
        EV_COLOR[meta.color] || EV_COLOR.blue
      }`}
    >
      <span className="opacity-70">{meta.short}</span>
      {level}
    </span>
  );
}

const SOURCE_COLOR = {
  PubMed: "from-sky-500 to-blue-600",
  NIH: "from-indigo-500 to-violet-600",
  WHO: "from-cyan-500 to-teal-600",
  FDA: "from-emerald-500 to-green-600",
  "ClinicalTrials.gov": "from-fuchsia-500 to-purple-600",
};

export function SourceBadge({ source, size = 36 }) {
  const abbr =
    source === "ClinicalTrials.gov"
      ? "CT"
      : source === "PubMed"
      ? "PM"
      : source;
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-lg bg-gradient-to-br font-display text-[11px] font-bold text-white ${
        SOURCE_COLOR[source] || "from-slate-500 to-slate-700"
      }`}
      style={{ width: size, height: size }}
    >
      {abbr}
    </span>
  );
}

export function Chip({ children, className = "", tone = "default" }) {
  const tones = {
    default: "text-soft",
    cyan: "text-cyan border-cyan/30 bg-cyan/8",
    accent: "text-electric border-electric/30 bg-electric/8",
  };
  return (
    <span className={`chip px-2.5 py-1 text-xs ${tones[tone] || tones.default} ${className}`}>
      {children}
    </span>
  );
}
