"use client";

import { motion } from "framer-motion";
import { clamp } from "@/lib/utils";

/* --------------------------- Confidence Ring --------------------------- */
export function ConfidenceRing({
  value = 0,
  size = 132,
  stroke = 11,
  color = "#5b8cff",
  label = "Confidence",
  sublabel,
}) {
  const v = clamp(value);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgb(var(--border))"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * v) / 100 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${color}99)` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-3xl font-bold leading-none">{v}%</div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">
            {label}
          </div>
          {sublabel && <div className="mt-0.5 text-[10px] text-faint">{sublabel}</div>}
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Linear Meter ------------------------------ */
export function LinearMeter({
  value = 0,
  label,
  caption,
  color = "#5b8cff",
  invert = false,
  icon,
}) {
  const v = clamp(value);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-soft">
          {icon}
          {label}
        </span>
        <span className="font-display text-sm font-bold" style={{ color }}>
          {v}
          <span className="text-faint">/100</span>
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[rgb(var(--bg-soft))]">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: invert
              ? `linear-gradient(90deg, ${color}, ${color})`
              : `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: `0 0 12px ${color}80`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      {caption && <p className="mt-1 text-[11px] text-faint">{caption}</p>}
    </div>
  );
}

/* ------------------------- Segmented Evidence -------------------------- */
export function EvidenceMeter({ value = 0, segments = 10, color = "#34d399", label = "Evidence Strength" }) {
  const filled = Math.round((clamp(value) / 100) * segments);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-soft">{label}</span>
        <span className="font-display text-sm font-bold" style={{ color }}>
          {clamp(value)}%
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <motion.div
            key={i}
            className="h-3 flex-1 rounded-sm"
            style={{
              background: i < filled ? color : "rgb(var(--bg-soft))",
              boxShadow: i < filled ? `0 0 8px ${color}70` : "none",
            }}
            initial={{ opacity: 0, scaleY: 0.4 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- Consensus ------------------------------ */
export function ConsensusBar({ value = 0 }) {
  const v = clamp(value);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-semibold text-soft">Scientific Consensus</span>
        <span className="text-faint">{v}% aligned</span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-gradient-to-r from-rose-500/30 via-amber-500/30 to-emerald-500/30">
        <motion.div
          className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-cyan shadow-glow-sm"
          initial={{ left: 0 }}
          animate={{ left: `calc(${v}% - 10px)` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-faint">
        <span>Disputed</span>
        <span>Emerging</span>
        <span>Strong consensus</span>
      </div>
    </div>
  );
}

/* ---------------------------- Mini Stat -------------------------------- */
export function MiniStat({ value, label, color = "#22d3ee", suffix = "" }) {
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-3 text-center">
      <div className="font-display text-xl font-bold" style={{ color }}>
        {value}
        {suffix}
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-faint">{label}</div>
    </div>
  );
}
