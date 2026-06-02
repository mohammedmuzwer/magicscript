"use client";

import { ShieldAlert, Info, Stethoscope } from "lucide-react";

// Critical banner — shown when the safety engine detects a dangerous claim.
export function DangerBanner({ research }) {
  const flags = research.claimFlags || [];
  const critical = research.verdict === "false";
  return (
    <div
      className={`rounded-xl border p-4 ${
        critical
          ? "border-rose-400/40 bg-rose-500/10"
          : "border-orange-400/40 bg-orange-500/10"
      }`}
    >
      <div className="flex gap-3">
        <ShieldAlert
          size={20}
          className={critical ? "shrink-0 text-rose-300" : "shrink-0 text-orange-300"}
        />
        <div>
          <h3
            className={`font-display text-sm font-bold ${
              critical ? "text-rose-200" : "text-orange-200"
            }`}
          >
            {critical
              ? "Unsafe medical claim detected"
              : "This topic contains medical claims"}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-soft">
            {research.claimNote ||
              "Always consult a qualified healthcare professional. Magic Script will not present this as a guaranteed fact — content has been reframed to communicate the real evidence honestly."}
          </p>
          {flags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {flags.map((f) => (
                <span
                  key={f}
                  className="rounded-md border border-rose-400/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-200"
                >
                  ⚠ {f}
                </span>
              ))}
            </div>
          )}
          <ul className="mt-2.5 grid gap-1 text-[11px] text-faint sm:grid-cols-2">
            <li>· No diagnosis or symptom interpretation</li>
            <li>· No medication or dosage prescriptions</li>
            <li>· No "cure" or "guaranteed result" claims</li>
            <li>· No advice to replace medical care</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Always-on disclaimer strip beneath generated content.
export function DisclaimerStrip({ text }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-3.5">
      <Stethoscope size={16} className="mt-0.5 shrink-0 text-cyan" />
      <p className="text-[11px] leading-relaxed text-faint">
        <span className="font-semibold text-soft">Medical disclaimer · </span>
        {text}
      </p>
    </div>
  );
}

export function SafetyNote({ children }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-electric/25 bg-electric/8 p-2.5">
      <Info size={14} className="mt-0.5 shrink-0 text-cyan" />
      <p className="text-[11px] leading-relaxed text-soft">{children}</p>
    </div>
  );
}
