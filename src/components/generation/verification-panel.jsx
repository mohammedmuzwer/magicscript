"use client";

import {
  ShieldCheck,
  TriangleAlert,
  GitFork,
  Clock,
  BookMarked,
  Activity,
  Flame,
  Microscope,
} from "lucide-react";
import { VerdictBadge } from "@/components/ui/badges";
import { ConfidenceRing, LinearMeter, ConsensusBar } from "@/components/ui/meters";
import SourceCard from "./source-card";
import { VERDICTS } from "@/lib/research-data";
import { verdictStyle, riskLabel } from "@/lib/utils";

function SectionTitle({ icon: Icon, children, accent = "text-cyan" }) {
  return (
    <h3 className="flex items-center gap-1.5 font-display text-sm font-bold">
      <Icon size={15} className={accent} /> {children}
    </h3>
  );
}

export default function VerificationPanel({ research }) {
  const s = verdictStyle(research.verdict);
  const meta = VERDICTS[research.verdict];
  const risk = riskLabel(research.misinfoRisk);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5">
        <div className="flex items-center justify-between">
          <SectionTitle icon={ShieldCheck}>Scientific Verification</SectionTitle>
          <VerdictBadge verdict={research.verdict} size="sm" />
        </div>

        <div className="mt-4 flex items-center gap-4">
          <ConfidenceRing
            value={research.confidence}
            size={130}
            color={s.ring}
            label="Confidence"
          />
          <div className="flex-1">
            <div className={`font-display text-base font-bold ${s.text}`}>
              {meta.label}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-soft">{meta.note}</p>
          </div>
        </div>

        {/* metric meters */}
        <div className="mt-4 space-y-3">
          <LinearMeter
            label="Evidence Strength"
            value={research.evidenceStrength}
            color="#34d399"
            icon={<Activity size={12} className="text-emerald-400" />}
          />
          <LinearMeter
            label="Misinformation Risk"
            value={research.misinfoRisk}
            color={s.ring}
            caption={`${risk.label} risk — the safety engine ${
              research.misinfoRisk >= 60 ? "actively reframed" : "monitored"
            } this topic.`}
            icon={<TriangleAlert size={12} className="text-rose-400" />}
          />
          <LinearMeter
            label="Research Quality"
            value={research.researchQuality}
            color="#5b8cff"
            icon={<Microscope size={12} className="text-electric" />}
          />
          <LinearMeter
            label="Viral Potential"
            value={research.viralPotential}
            color="#22d3ee"
            icon={<Flame size={12} className="text-cyan" />}
          />
        </div>

        <div className="mt-4 border-t border-[rgb(var(--border))] pt-4">
          <ConsensusBar value={research.consensus} />
        </div>
      </div>

      {/* Research summary */}
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5">
        <SectionTitle icon={BookMarked}>Research Summary</SectionTitle>
        <div className="mt-2.5 rounded-xl border border-electric/20 bg-electric/5 p-3">
          <p className="text-xs font-semibold text-cyan">Key finding</p>
          <p className="mt-1 text-xs leading-relaxed text-soft">{research.keyFinding}</p>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-soft">{research.summary}</p>
      </div>

      {/* Limitations */}
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5">
        <SectionTitle icon={TriangleAlert} accent="text-amber-400">
          Honest Limitations
        </SectionTitle>
        <ul className="mt-2.5 space-y-1.5">
          {research.limitations.map((l, i) => (
            <li key={i} className="flex gap-2 text-xs leading-relaxed text-soft">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
              {l}
            </li>
          ))}
        </ul>
      </div>

      {/* Contradiction finder */}
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5">
        <SectionTitle icon={GitFork} accent="text-orange-400">
          Research Contradiction Finder
        </SectionTitle>
        <ul className="mt-2.5 space-y-2">
          {research.contradictions.map((c, i) => (
            <li
              key={i}
              className="rounded-lg border border-orange-400/20 bg-orange-500/5 p-2.5 text-xs leading-relaxed text-soft"
            >
              {c}
            </li>
          ))}
        </ul>
      </div>

      {/* Evidence timeline */}
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5">
        <SectionTitle icon={Clock}>Evidence Timeline</SectionTitle>
        <ol className="mt-3 space-y-0">
          {research.timeline.map((t, i) => (
            <li key={i} className="relative flex gap-3 pb-3.5 last:pb-0">
              {i < research.timeline.length - 1 && (
                <span className="absolute left-[7px] top-4 h-full w-px bg-[rgb(var(--border))]" />
              )}
              <span className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-cyan bg-[rgb(var(--panel))]" />
              <div>
                <span className="font-display text-xs font-bold text-cyan">{t.year}</span>
                <p className="text-xs leading-relaxed text-soft">{t.event}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Sources */}
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5">
        <div className="flex items-center justify-between">
          <SectionTitle icon={Microscope}>Sources Used</SectionTitle>
          <span className="text-[11px] text-faint">{research.sources.length} studies</span>
        </div>
        <div className="mt-3 space-y-2">
          {research.sources.map((src, i) => (
            <SourceCard key={i} source={src} />
          ))}
        </div>
      </div>
    </div>
  );
}
