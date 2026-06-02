"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Lock, Edit2, Check, X, ChevronDown, ChevronRight,
  ShieldAlert, Shield, Sparkles, Users, Radio, AlertTriangle,
} from "lucide-react";
import ModelToggle from "@/components/podcast/ModelToggle";
import { getModelPref } from "@/lib/podcast/model-preference";

// ── Category colour map ───────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  "Myth":               { color: "#f59e0b", bg: "#f59e0b18", border: "#f59e0b35", icon: "⚡" },
  "Problem":            { color: "#06b6d4", bg: "#06b6d418", border: "#06b6d435", icon: "🔍" },
  "FAQ":                { color: "#22c55e", bg: "#22c55e18", border: "#22c55e35", icon: "❓" },
  "Contrarian":         { color: "#f97316", bg: "#f9731618", border: "#f9731635", icon: "🎯" },
  "Clinical Deep Dive": { color: "#8b5cf6", bg: "#8b5cf618", border: "#8b5cf635", icon: "🔬" },
};
function getCatStyle(cat) {
  return CATEGORY_COLORS[cat] ?? { color: "#38bdf8", bg: "#38bdf818", border: "#38bdf835", icon: "📌" };
}

// ── Editable text field ───────────────────────────────────────────────────────
function EditableField({ value, onChange, rows = 3, label }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(value);

  function save() { onChange(draft); setEditing(false); }
  function cancel() { setDraft(value); setEditing(false); }

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-faint">{label}</span>
          {!editing && (
            <button onClick={() => { setDraft(value); setEditing(true); }}
              className="flex items-center gap-1 rounded border border-[rgb(var(--border))] px-2 py-0.5 text-[10px] text-faint hover:text-soft transition">
              <Edit2 size={10} /> Edit
            </button>
          )}
        </div>
      )}
      {editing ? (
        <div className="space-y-2">
          <textarea
            rows={rows}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full resize-none rounded-xl border border-cyan/40 bg-[rgb(var(--bg))] px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-cyan/30"
          />
          <div className="flex gap-2">
            <button onClick={save}
              className="flex items-center gap-1.5 rounded-lg bg-cyan px-3 py-1.5 text-[11px] font-bold text-navy-950 hover:brightness-110 transition">
              <Check size={11} /> Save
            </button>
            <button onClick={cancel}
              className="flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] px-3 py-1.5 text-[11px] text-faint hover:text-soft transition">
              <X size={11} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-soft leading-relaxed">{value}</p>
      )}
    </div>
  );
}

// ── Section wrapper (collapsible) ─────────────────────────────────────────────
function Section({ icon, title, badge, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] overflow-hidden"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 hover:bg-[rgb(var(--bg-soft))] transition"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base">{icon}</span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-faint">{title}</span>
          {badge && (
            <span className="rounded-full bg-cyan/10 px-2 py-0.5 text-[9px] font-bold text-cyan">{badge}</span>
          )}
        </div>
        {open ? <ChevronDown size={14} className="text-faint" /> : <ChevronRight size={14} className="text-faint" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Pillar card ───────────────────────────────────────────────────────────────
function PillarCard({ pillar, index, catColor }) {
  const impacts = [
    { stg: "STG 3", text: pillar.stage3_impact },
    { stg: "STG 4", text: pillar.stage4_impact },
    { stg: "STG 6", text: pillar.stage6_impact },
    { stg: "STG 8", text: pillar.stage8_impact },
  ].filter((r) => r.text);

  return (
    <div
      className="rounded-xl border p-3.5 space-y-2.5"
      style={{ borderColor: catColor + "30", background: catColor + "07" }}
    >
      <div className="flex items-center gap-2">
        <div
          className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-black text-white"
          style={{ background: catColor }}
        >
          {index + 1}
        </div>
        <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: catColor }}>
          {pillar.name}
        </span>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-faint mb-0.5">Commits to</p>
          <p className="text-[11px] text-soft leading-relaxed">{pillar.commits}</p>
        </div>

        {impacts.length > 0 && (
          <div className="rounded-lg bg-[rgb(var(--bg-soft))] px-2.5 py-2 space-y-1.5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-faint">Downstream impact</p>
            {impacts.map(({ stg, text }) => (
              <div key={stg} className="flex items-start gap-2">
                <span
                  className="shrink-0 rounded px-1 py-0.5 text-[8px] font-black leading-none mt-0.5"
                  style={{ background: catColor + "20", color: catColor }}
                >
                  {stg}
                </span>
                <p className="text-[10px] text-faint leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Audience portrait card ────────────────────────────────────────────────────
function AudienceCard({ type, color, icon, portrait, onEdit }) {
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] p-3.5 space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>{type}</span>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 rounded border border-[rgb(var(--border))] px-2 py-0.5 text-[10px] text-faint hover:text-soft transition"
        >
          <Edit2 size={10} /> Edit
        </button>
      </div>
      <p className="text-[12px] text-soft leading-relaxed">{portrait}</p>
    </div>
  );
}

// ── Signal field key metadata ─────────────────────────────────────────────────
const SIGNAL_KEY_META = {
  prioritise:               { label: "Prioritise",    color: "#22d3ee" },
  avoid:                    { label: "Avoid",         color: "#f87171" },
  cultural_angle:           { label: "Cultural",      color: "#a78bfa" },
  evidence_type:            { label: "Evidence type", color: "#22d3ee" },
  indian_sources:           { label: "Indian sources",color: "#34d399" },
  blue_experience:          { label: "Blue experience",color: "#38bdf8" },
  red_flag:                 { label: "Red flag",      color: "#f87171" },
  sequencing_logic:         { label: "Sequence",      color: "#22d3ee" },
  myth_question_to_protect: { label: "Protect",       color: "#fbbf24" },
  tone_constraint:          { label: "Tone",          color: "#22d3ee" },
  structure_constraint:     { label: "Structure",     color: "#22d3ee" },
  demonstration_idea:       { label: "Demo idea",     color: "#fbbf24" },
  cta_timing:               { label: "CTA timing",    color: "#4ade80" },
  superfood_suggestion:     { label: "Superfood",     color: "#34d399" },
  cold_open:                { label: "Cold open",     color: "#22d3ee" },
  closing:                  { label: "Closing",       color: "#22d3ee" },
  pillar_check:             { label: "Pillar check",  color: "#fbbf24" },
  follow_up_topic:          { label: "Follow-up",     color: "#22d3ee" },
  best_reel_moment:         { label: "Best reel",     color: "#fbbf24" },
  // legacy fallback keys
  open:                     { label: "Open",          color: "#22d3ee" },
  close:                    { label: "Close",         color: "#22d3ee" },
};

function SignalRow({ fieldKey, value }) {
  const meta = SIGNAL_KEY_META[fieldKey] ?? { label: fieldKey, color: "#22d3ee" };
  const isArr = Array.isArray(value);

  if (isArr) {
    return (
      <div>
        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: meta.color }}>
          {meta.label}
        </span>
        <ul className="mt-1 space-y-0.5">
          {value.map((item, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] text-soft leading-relaxed">
              <span className="mt-0.5 shrink-0 text-[10px]" style={{ color: meta.color + "80" }}>→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <span
        className="shrink-0 text-[9px] font-bold uppercase tracking-wider mt-0.5 min-w-[72px]"
        style={{ color: meta.color }}
      >
        {meta.label}
      </span>
      <span className="text-[11px] text-soft leading-relaxed">{value}</span>
    </div>
  );
}

// ── Signal block for one stage ─────────────────────────────────────────────────
function SignalBlock({ stageNum, stageLabel, bullets }) {
  if (!bullets) return null;
  const isArr = Array.isArray(bullets);
  const isStr = typeof bullets === "string";
  const isObj = !isArr && !isStr;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="rounded bg-[rgb(var(--bg-soft))] px-1.5 py-0.5 text-[9px] font-black text-cyan">
          STG {stageNum}
        </span>
        <span className="text-[10px] font-bold text-faint">{stageLabel}</span>
      </div>

      {isStr && <p className="pl-1 text-[11px] text-soft">→ {bullets}</p>}

      {isArr && (
        <ul className="space-y-1 pl-1">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] text-soft">
              <span className="mt-0.5 shrink-0 text-cyan/50">→</span>{b}
            </li>
          ))}
        </ul>
      )}

      {isObj && (
        <div className="space-y-2 pl-1">
          {Object.entries(bullets).map(([k, v]) => (
            <SignalRow key={k} fieldKey={k} value={v} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function LockingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-cyan/20 bg-cyan/5 p-5 text-center space-y-3">
        <Loader2 size={22} className="animate-spin text-cyan mx-auto" />
        <div>
          <p className="text-sm font-bold text-cyan">Generating Topic Lock…</p>
          <p className="text-[11px] text-faint mt-1">
            Building angle · 4 pillars · audience portraits · carry-forward signals
          </p>
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-xl bg-[rgb(var(--bg-soft))]"
          style={{ animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function Stage2({ data, onComplete, demoMode }) {
  const [lock,      setLock]      = useState(null);   // full lock document
  const [loading,   setLoading]   = useState(true);
  const [apiError,  setApiError]  = useState(null);  // error message when live API fails
  const [modelPref, setModelPref] = useState(() =>
    typeof window !== "undefined" ? getModelPref(2) : "gemini"
  );

  // Editable fields (pulled from lock once generated)
  const [frame,          setFrame]          = useState("");
  const [promise,        setPromise]        = useState("");
  const [authority,      setAuthority]      = useState("");
  const [safetyFlag,     setSafetyFlag]     = useState("");
  const [primaryAud,     setPrimaryAud]     = useState("");
  const [secondaryAud,   setSecondaryAud]   = useState("");
  const [forwardSharerAud, setForwardSharerAud] = useState("");

  // Audience edit modal state
  const [editingAud, setEditingAud] = useState(null); // "primary"|"secondary"|"forward_sharer"|null
  const [audDraft,   setAudDraft]   = useState("");

  // ── Fetch lock on mount ─────────────────────────────────────────────────
  useEffect(() => {
    // data is the full stageData object keyed by stage number: { 1: { topic, mode }, ... }
    const topic = data?.[1]?.topic;
    if (!topic) { setLoading(false); return; }
    setApiError(null);

    const gk = (demoMode || typeof window === "undefined") ? null : localStorage.getItem("V_KEY_GOOGLE");
    const ak = (demoMode || typeof window === "undefined") ? null : localStorage.getItem("V_KEY_CLAUDE");

    fetch("/api/pipeline/stage2-lock", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(gk && { "x-client-gemini-key":    gk }),
        ...(ak && { "x-client-anthropic-key": ak }),
        "x-preferred-model": modelPref,
      },
      body: JSON.stringify({
        topic_title:      topic.title,
        category:         topic.category ?? "Myth",
        stage1_score:     topic.score    ?? 80,
        biggest_weakness: topic.weakness ?? null,
        reframe:          topic.reframe  ?? null,
        version:          topic.reframe  ? "Reframed" : "Original",
        topic_data:       topic,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.mode === "error" || d.error) {
          setApiError(d.error ?? "Gemini API error — check your API key or quota.");
          return;
        }
        setLock(d);
        setFrame(d.angle?.frame          ?? "");
        setPromise(d.angle?.promise      ?? "");
        setAuthority(d.angle?.authority ?? "");
        setSafetyFlag(d.angle?.safety_flag       ?? "");
        setPrimaryAud(d.audience?.primary   ?? "");
        setSecondaryAud(d.audience?.secondary ?? "");
        setForwardSharerAud(d.audience?.forward_sharer ?? "");
      })
      .catch((err) => {
        setApiError(err?.message ?? "Network error — could not reach the API.");
      })
      .finally(() => setLoading(false));
  }, [data?.[1]?.topic?.title, demoMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Audience edit handlers ───────────────────────────────────────────────
  function openAudEdit(type) {
    setAudDraft(type === "primary" ? primaryAud : type === "secondary" ? secondaryAud : forwardSharerAud);
    setEditingAud(type);
  }
  function saveAudEdit() {
    if (editingAud === "primary")   setPrimaryAud(audDraft);
    if (editingAud === "secondary") setSecondaryAud(audDraft);
    if (editingAud === "forward_sharer") setForwardSharerAud(audDraft);
    setEditingAud(null);
  }

  // ── Handle approve ───────────────────────────────────────────────────────
  function handleApprove() {
    if (!lock) return;
    onComplete({
      ...lock,
      angle: { frame, promise, authority, safety_flag: safetyFlag },
      audience: { primary: primaryAud, secondary: secondaryAud, forward_sharer: forwardSharerAud },
    });
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-5">
        <h2 className="text-lg font-bold mb-1">Topic Lock</h2>
        <p className="text-sm text-faint">Generating the locked angle, pillars, and audience commitment…</p>
      </div>
      <LockingSkeleton />
    </div>
  );

  if (apiError) return (
    <div className="max-w-2xl mx-auto rounded-xl border border-rose-500/25 bg-rose-500/8 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle size={18} className="text-rose-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-rose-300 mb-1">Gemini API Error</p>
          <p className="text-[11px] text-rose-300/80 font-mono break-all">{apiError}</p>
          <p className="text-[11px] text-faint mt-2">Check your API key in <strong>Settings → API Keys</strong>, or switch to Demo mode.</p>
        </div>
      </div>
    </div>
  );

  if (!lock) return (
    <div className="max-w-2xl mx-auto rounded-xl border border-rose-500/25 bg-rose-500/8 p-6 text-center">
      <AlertTriangle size={20} className="text-rose-400 mx-auto mb-2" />
      <p className="text-sm font-bold text-rose-300">Could not generate Topic Lock</p>
      <p className="text-[11px] text-faint mt-1">No topic data received from Stage 1. Please go back and select a topic.</p>
    </div>
  );

  const catStyle = getCatStyle(lock.category);
  const hasSafety = !lock.angle?.safety_flag?.startsWith("None");

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold mb-1">Topic Lock</h2>
        <p className="text-sm text-faint">
          Confirm the locked angle, pillars, and audience. No content is written until this is approved.
        </p>
      </div>

      {/* ── Locked topic card ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border p-4 space-y-3"
        style={{ borderColor: catStyle.border, background: catStyle.bg }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Lock size={12} style={{ color: catStyle.color }} />
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: catStyle.color }}>
                Locked Topic
              </span>
            </div>
            <p className="text-[15px] font-bold leading-snug text-[rgb(var(--text))]">
              {lock.locked_topic}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-2xl font-black tabular-nums" style={{ color: catStyle.color }}>
              {lock.stage1_score}
            </div>
            <div className="text-[9px] text-faint">Stage 1 score</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold"
            style={{ background: catStyle.color + "22", color: catStyle.color, border: `1px solid ${catStyle.border}` }}
          >
            {catStyle.icon} {lock.category}
          </span>
          <span className="rounded-full bg-[rgb(var(--bg-soft))] border border-[rgb(var(--border))] px-2.5 py-1 text-[10px] font-semibold text-faint">
            {lock.version_locked === "Reframed" ? "✨ Reframed version locked" : "Original version locked"}
          </span>
        </div>
      </motion.div>

      {/* ── Locked Angle ─────────────────────────────────────────────── */}
      <Section icon="🎯" title="Locked Angle" defaultOpen={true}>

        {/* Frame */}
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-3.5">
          <EditableField
            label="Frame — the overall approach"
            value={frame}
            onChange={setFrame}
            rows={2}
          />
        </div>

        {/* Promise */}
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-3.5">
          <EditableField
            label="Promise — what the viewer leaves with"
            value={promise}
            onChange={setPromise}
            rows={3}
          />
        </div>

        {/* Authority */}
        <div className="rounded-xl border border-cyan/20 bg-cyan/5 p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={12} className="text-cyan" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan">
              Doctor Farmer Authority
            </span>
          </div>
          <EditableField
            label="Specific credibility for this topic — patient data, clinical experience, or research access"
            value={authority}
            onChange={setAuthority}
            rows={2}
          />
        </div>

        {/* Safety Flag */}
        <div className={`rounded-xl border p-3.5 ${hasSafety ? "border-rose-500/25 bg-rose-500/8" : "border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))]"}`}>
          <div className="flex items-center gap-2 mb-1.5">
            {hasSafety
              ? <ShieldAlert size={12} className="text-rose-400" />
              : <Shield size={12} className="text-faint" />
            }
            <span className={`text-[10px] font-bold uppercase tracking-widest ${hasSafety ? "text-rose-400" : "text-faint"}`}>
              Safety Flag
            </span>
          </div>
          <EditableField
            value={safetyFlag}
            onChange={setSafetyFlag}
            rows={2}
          />
        </div>
      </Section>

      {/* ── 4 Pillars ────────────────────────────────────────────────── */}
      <Section icon="🏛️" title="4 Pillars" badge="Downstream filters" defaultOpen={true}>
        {lock.pillars?.map((pillar, i) => (
          <PillarCard key={i} pillar={pillar} index={i} catColor={catStyle.color} />
        ))}
      </Section>

      {/* ── Hard Gate ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-4 space-y-3"
      >
        <div className="flex items-center gap-2 border-b border-[rgb(var(--border))] pb-3">
          <Lock size={13} className="text-cyan shrink-0" />
          <p className="text-[10px] font-black uppercase tracking-widest text-cyan">Stage 2 Hard Gate</p>
        </div>

        {/* Summary of what's locked */}
        <div className="space-y-1.5">
          <div className="flex items-start gap-2 text-[11px] text-faint">
            <span className="shrink-0 text-cyan/60">✓</span>
            <span><span className="font-semibold text-soft">Topic locked:</span> {lock.locked_topic?.slice(0, 60)}{lock.locked_topic?.length > 60 ? "…" : ""}</span>
          </div>
          <div className="flex items-start gap-2 text-[11px] text-faint">
            <span className="shrink-0 text-cyan/60">✓</span>
            <span><span className="font-semibold text-soft">Angle locked:</span> {frame?.slice(0, 80)}{frame?.length > 80 ? "…" : ""}</span>
          </div>
          <div className="flex items-start gap-2 text-[11px] text-faint">
            <span className="shrink-0 text-cyan/60">✓</span>
            <span>
              <span className="font-semibold text-soft">Pillars locked:</span>{" "}
              {lock.pillars?.map((p) => p.name).join(" · ")}
            </span>
          </div>
          <div className="flex items-start gap-2 text-[11px] text-faint">
            <span className="shrink-0 text-cyan/60">✓</span>
            <span><span className="font-semibold text-soft">Audience locked:</span> {primaryAud?.slice(0, 70)}{(primaryAud?.length ?? 0) > 70 ? "…" : ""}</span>
          </div>
          <div className="flex items-start gap-2 text-[11px] text-faint">
            <span className="shrink-0 text-cyan/60">✓</span>
            <span><span className="font-semibold text-soft">Carry-forward signals:</span> Generated for Stages 3–9</span>
          </div>
        </div>

        {/* Awaiting approval CTA */}
        <div className="rounded-xl border border-cyan/25 bg-cyan/6 px-4 py-3 space-y-3">
          <div>
            <p className="text-xs font-bold text-cyan">Awaiting Approval</p>
            <p className="text-[11px] text-faint mt-0.5">
              Approve to continue to Stage 3 (Question Discovery), or edit any section above first.
            </p>
          </div>
          <ModelToggle stageNum={2} onChange={setModelPref} disabled={loading} />
          <button
            onClick={handleApprove}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan py-3 text-sm font-bold text-navy-950 transition hover:brightness-110"
          >
            <Check size={15} />
            Approve & Continue to Stage 3
          </button>
        </div>
      </motion.div>

    </div>
  );
}
