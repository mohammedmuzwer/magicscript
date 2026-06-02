"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, ChevronDown, ChevronRight,
  Plus, X, Check, AlertTriangle,
  MessageSquare, Users, Zap, BookOpen,
} from "lucide-react";
import ModelToggle from "@/components/podcast/ModelToggle";
import { getModelPref } from "@/lib/podcast/model-preference";

// ── Category colour tokens ────────────────────────────────────────────────────
const CAT_COLORS = {
  foundation: "#38bdf8", // cyan
  audience:   "#10b981", // emerald
  myth:       "#f59e0b", // amber
  team:       "#8b5cf6", // violet
};

// ── Single question row ───────────────────────────────────────────────────────
function QuestionRow({ q, onRemove }) {
  const color    = CAT_COLORS[q.type] ?? "#38bdf8";
  const canRemove = q.type !== "foundation";

  return (
    <div className="flex items-start gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2.5">
      {/* ID badge */}
      <span
        className="mt-0.5 text-[9px] font-black rounded px-1 py-0.5 shrink-0"
        style={{ background: color + "20", color }}
      >
        {q.id}
      </span>

      {/* Question text */}
      <p className="flex-1 text-[11px] text-soft leading-relaxed">
        {q.placeholder
          ? <span className="italic text-faint">Slot available — add via Stage Chat</span>
          : q.text}
      </p>

      {/* Right badges + remove button */}
      <div className="flex items-center gap-1.5 shrink-0">
        {q.source && q.source !== "team" && (
          <span className="text-[9px] rounded px-1.5 py-0.5 bg-[rgb(var(--bg-soft))] text-faint">
            {q.source}
          </span>
        )}
        {q.section_tag && (
          <span
            className="text-[9px] rounded px-1.5 py-0.5"
            style={{ background: "#38bdf820", color: "#38bdf8" }}
          >
            [{q.section_tag}]
          </span>
        )}
        {canRemove && (
          <button
            onClick={() => onRemove(q.id, q.type)}
            className="text-faint hover:text-rose-400 transition"
            title="Remove question"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Collapsible section wrapper ───────────────────────────────────────────────
function QSection({ icon: Icon, iconColor, title, badge, count, defaultOpen = true, children }) {
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
          <Icon size={13} style={{ color: iconColor }} />
          <span className="text-[11px] font-bold uppercase tracking-widest text-faint">{title}</span>
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-bold"
            style={{ background: iconColor + "20", color: iconColor }}
          >
            {count}
          </span>
          {badge && (
            <span className="rounded-full bg-[rgb(var(--bg-soft))] px-2 py-0.5 text-[9px] text-faint border border-[rgb(var(--border))]">
              {badge}
            </span>
          )}
        </div>
        {open
          ? <ChevronDown size={14} className="text-faint" />
          : <ChevronRight size={14} className="text-faint" />}
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
            <div className="px-4 pb-4 pt-1 space-y-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function Stage3({ data, onComplete, demoMode }) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [loading,    setLoading]    = useState(true);
  const [apiError,   setApiError]   = useState(null);
  const [foundation, setFoundation] = useState([]);
  const [audience,   setAudience]   = useState([]);
  const [myth,       setMyth]       = useState([]);
  const [team,       setTeam]       = useState([]);
  const [overlaps,   setOverlaps]   = useState([]);
  const [modelPref,  setModelPref]  = useState(() =>
    typeof window !== "undefined" ? getModelPref(3) : "gemini"
  );

  // Add-question form
  const [addText, setAddText] = useState("");
  const [addType, setAddType] = useState("audience"); // "audience" | "myth" | "team"

  // ── Fetch on mount (keyed to locked_topic so re-runs if topic changes) ─────
  useEffect(() => {
    const lock = data?.[2];
    if (!lock) {
      setLoading(false);
      return;
    }
    setApiError(null);

    const gk = (demoMode || typeof window === "undefined") ? null : localStorage.getItem("V_KEY_GOOGLE");
    const ak = (demoMode || typeof window === "undefined") ? null : localStorage.getItem("V_KEY_CLAUDE");

    fetch("/api/pipeline/stage3-questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(gk && { "x-client-gemini-key":    gk }),
        ...(ak && { "x-client-anthropic-key": ak }),
        "x-preferred-model": modelPref,
      },
      body: JSON.stringify({
        locked_topic: lock.locked_topic,
        category:     lock.category,
        frame:        lock.angle?.frame,
        pillars:      lock.pillars,
        signals:      lock.signals,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.mode === "error" || d.error) {
          setApiError(d.error ?? "Gemini API error — check your API key or quota.");
          return;
        }
        setFoundation(d.foundation ?? []);
        setAudience(d.audience   ?? []);
        setMyth(d.myth           ?? []);
        setTeam(d.team           ?? []);
        setOverlaps(d.overlaps   ?? []);
      })
      .catch((err) => {
        setApiError(err?.message ?? "Network error — could not reach the API.");
      })
      .finally(() => setLoading(false));
  }, [data?.[2]?.locked_topic, demoMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Remove handler ─────────────────────────────────────────────────────────
  function handleRemove(id, type) {
    if (type === "audience") setAudience((prev) => prev.filter((q) => q.id !== id));
    if (type === "myth")     setMyth((prev)     => prev.filter((q) => q.id !== id));
    if (type === "team")     setTeam((prev)     => prev.filter((q) => q.id !== id));
  }

  // ── Add handler ────────────────────────────────────────────────────────────
  function handleAdd() {
    if (!addText.trim()) return;
    const id = `custom-${Date.now()}`;
    const q = {
      id,
      text:        addText.trim(),
      section_tag: "Rapid Fire",
      type:        addType,
      source:      addType === "team" ? "team" : "Manual",
      placeholder: false,
    };

    if (addType === "audience") setAudience((prev) => [...prev, q]);
    if (addType === "myth")     setMyth((prev)     => [...prev, { ...q, text: addText.trim() + " — true or false?" }]);
    if (addType === "team")     setTeam((prev)     => [...prev, q]);

    setAddText("");
  }

  // ── Approve handler ────────────────────────────────────────────────────────
  function handleApprove() {
    const allQuestions = [
      ...foundation,
      ...audience,
      ...myth,
      ...team.filter((t) => !t.placeholder),
    ];
    onComplete({ foundation, audience, myth, team, all_questions: allQuestions });
  }

  // ── Derived counts ─────────────────────────────────────────────────────────
  const lockedTopic  = data?.[2]?.locked_topic ?? "—";
  const totalLive    = foundation.length + audience.length + myth.length + team.filter((t) => !t.placeholder).length;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div>
          <h2 className="text-lg font-bold mb-1">Question Discovery</h2>
          <p className="text-sm text-faint">
            Generating 25 questions across 4 categories for the locked topic.
          </p>
        </div>

        {/* Spinner card */}
        <div className="rounded-xl border border-cyan/20 bg-cyan/5 p-6 text-center space-y-3">
          <Loader2 size={22} className="animate-spin text-cyan mx-auto" />
          <div>
            <p className="text-sm font-bold text-cyan">Generating 25 questions across 4 categories…</p>
            <p className="text-[11px] text-faint mt-1">
              Foundation · Audience-Discovered · Myth-Busting · Team slots
            </p>
          </div>
        </div>

        {/* Skeleton rows */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-xl bg-[rgb(var(--bg-soft))]"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    );
  }

  // ── API error ──────────────────────────────────────────────────────────────
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

  // ── No lock data error ─────────────────────────────────────────────────────
  if (!data?.[2]) {
    return (
      <div className="max-w-2xl mx-auto rounded-xl border border-rose-500/25 bg-rose-500/8 p-6 text-center">
        <AlertTriangle size={20} className="text-rose-400 mx-auto mb-2" />
        <p className="text-sm font-bold text-rose-300">No Stage 2 data found</p>
        <p className="text-[11px] text-faint mt-1">
          Please complete Stage 2 (Topic Lock) before proceeding to Question Discovery.
        </p>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-bold mb-1">Question Discovery</h2>
        <p className="text-sm text-faint">
          Raw master list of 25 questions across 4 categories. Nothing is filtered here —
          filtering and arc sequencing happen in Stage 5 after research.
        </p>
      </div>

      {/* ── Locked topic context strip ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-cyan/20 bg-cyan/5 px-4 py-3 flex items-center gap-3"
      >
        <BookOpen size={13} className="text-cyan shrink-0" />
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-cyan">Locked Topic</span>
          <p className="text-[12px] font-semibold text-soft leading-snug mt-0.5">{lockedTopic}</p>
        </div>
      </motion.div>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-5 gap-2"
      >
        {[
          { label: "Foundation",  count: foundation.length,                            color: CAT_COLORS.foundation, target: 5  },
          { label: "Audience",    count: audience.length,                              color: CAT_COLORS.audience,   target: 12 },
          { label: "Myth",        count: myth.length,                                  color: CAT_COLORS.myth,       target: 5  },
          { label: "Team slots",  count: team.length,                                  color: CAT_COLORS.team,       target: 3  },
          { label: "Total",       count: foundation.length + audience.length + myth.length + team.length, color: "#e2e8f0", target: 25 },
        ].map(({ label, count, color, target }) => (
          <div
            key={label}
            className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-2.5 text-center"
            style={{ borderColor: color + "30" }}
          >
            <div className="text-lg font-black tabular-nums" style={{ color }}>
              {count}
              <span className="text-[10px] font-normal text-faint">/{target}</span>
            </div>
            <div className="text-[9px] text-faint mt-0.5">{label}</div>
          </div>
        ))}
      </motion.div>

      {/* ── Foundation (5) ───────────────────────────────────────────────── */}
      <QSection
        icon={BookOpen}
        iconColor={CAT_COLORS.foundation}
        title="Foundation"
        badge="Cannot be removed"
        count={foundation.length}
        defaultOpen={true}
      >
        <AnimatePresence>
          {foundation.map((q) => (
            <motion.div key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <QuestionRow q={q} onRemove={handleRemove} />
            </motion.div>
          ))}
        </AnimatePresence>
        {foundation.length === 0 && (
          <p className="text-[11px] text-faint italic py-2">No foundation questions generated yet.</p>
        )}
      </QSection>

      {/* ── Audience-Discovered (12) ──────────────────────────────────────── */}
      <QSection
        icon={Users}
        iconColor={CAT_COLORS.audience}
        title="Audience-Discovered"
        badge="Source tagged"
        count={audience.length}
        defaultOpen={true}
      >
        <AnimatePresence>
          {audience.map((q) => (
            <motion.div key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <QuestionRow q={q} onRemove={handleRemove} />
            </motion.div>
          ))}
        </AnimatePresence>
        {audience.length === 0 && (
          <p className="text-[11px] text-faint italic py-2">No audience questions generated yet.</p>
        )}
      </QSection>

      {/* ── Myth-Busting (5) ─────────────────────────────────────────────── */}
      <QSection
        icon={Zap}
        iconColor={CAT_COLORS.myth}
        title="Myth-Busting"
        badge="Designed questions"
        count={myth.length}
        defaultOpen={true}
      >
        <AnimatePresence>
          {myth.map((q) => (
            <motion.div key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <QuestionRow q={q} onRemove={handleRemove} />
            </motion.div>
          ))}
        </AnimatePresence>
        {myth.length === 0 && (
          <p className="text-[11px] text-faint italic py-2">No myth questions generated yet.</p>
        )}
      </QSection>

      {/* ── Team-Fed (3 slots) ────────────────────────────────────────────── */}
      <QSection
        icon={MessageSquare}
        iconColor={CAT_COLORS.team}
        title="Team-Fed"
        badge="3 reserved slots"
        count={team.length}
        defaultOpen={true}
      >
        <AnimatePresence>
          {team.map((q) => (
            <motion.div key={q.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <QuestionRow q={q} onRemove={handleRemove} />
            </motion.div>
          ))}
        </AnimatePresence>
        {team.length === 0 && (
          <p className="text-[11px] text-faint italic py-2">No team slots generated yet.</p>
        )}
      </QSection>

      {/* ── Overlap flags ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {overlaps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={13} className="text-rose-400 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">
                Overlap Flags — Stage 5 will resolve
              </span>
            </div>
            {overlaps.map((flag, i) => (
              <div
                key={i}
                className="rounded-lg border border-rose-500/25 bg-rose-500/8 px-3 py-2 text-[11px] text-rose-300 leading-relaxed"
              >
                {flag}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Add question form ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 space-y-3"
      >
        <p className="text-[11px] font-bold text-soft">Add a question manually</p>

        {/* Type selector */}
        <div className="flex gap-2">
          {[
            { value: "audience", label: "Audience",   color: CAT_COLORS.audience },
            { value: "myth",     label: "Myth",        color: CAT_COLORS.myth    },
            { value: "team",     label: "Team",        color: CAT_COLORS.team    },
          ].map(({ value, label, color }) => (
            <button
              key={value}
              onClick={() => setAddType(value)}
              className="rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition"
              style={
                addType === value
                  ? { borderColor: color + "60", background: color + "15", color }
                  : {}
              }
              data-inactive={addType !== value || undefined}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Input + button row */}
        <div className="flex gap-2">
          <input
            value={addText}
            onChange={(e) => setAddText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder={addType === "myth" ? "Type the myth belief — '…true or false?' added automatically" : "Type a question…"}
            className="flex-1 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2 text-[11px] focus:border-cyan/40 focus:outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={!addText.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-cyan px-4 py-2 text-[11px] font-bold text-navy-950 transition hover:brightness-110 disabled:opacity-40"
          >
            <Plus size={12} /> Add
          </button>
        </div>
      </motion.div>

      {/* ── Hard Gate ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-4 space-y-3"
      >
        <div className="flex items-center gap-2 border-b border-[rgb(var(--border))] pb-3">
          <Check size={13} className="text-cyan shrink-0" />
          <p className="text-[10px] font-black uppercase tracking-widest text-cyan">Stage 3 Hard Gate</p>
        </div>

        {/* Summary */}
        <div className="space-y-1.5">
          <div className="flex items-start gap-2 text-[11px] text-faint">
            <span className="shrink-0 text-cyan/60">✓</span>
            <span>
              <span className="font-semibold text-soft">Master list:</span>{" "}
              {totalLive} questions across 4 categories
            </span>
          </div>
          <div className="flex items-start gap-2 text-[11px] text-faint">
            <span className="shrink-0 text-cyan/60">✓</span>
            <span>
              <span className="font-semibold text-soft">Foundation:</span> {foundation.length}
              {" · "}
              <span className="font-semibold text-soft">Audience:</span> {audience.length}
              {" · "}
              <span className="font-semibold text-soft">Myth:</span> {myth.length}
              {" · "}
              <span className="font-semibold text-soft">Team:</span> {team.length}
            </span>
          </div>
          {overlaps.length > 0 && (
            <div className="flex items-start gap-2 text-[11px] text-faint">
              <span className="shrink-0 text-rose-400/60">⚠</span>
              <span className="text-rose-300">
                {overlaps.length} overlap flag{overlaps.length !== 1 ? "s" : ""} — Stage 5 will resolve
              </span>
            </div>
          )}
        </div>

        {/* Approve CTA */}
        <div className="rounded-xl border border-cyan/25 bg-cyan/6 px-4 py-3 space-y-3">
          <div>
            <p className="text-xs font-bold text-cyan">Awaiting Approval</p>
            <p className="text-[11px] text-faint mt-0.5">
              Approve to continue to Stage 4 (Research). Stage 4 will investigate every question in this master list.
            </p>
          </div>
          <ModelToggle stageNum={3} onChange={setModelPref} disabled={loading} />
          <button
            onClick={handleApprove}
            disabled={foundation.length === 0 && audience.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan py-3 text-sm font-bold text-navy-950 transition hover:brightness-110 disabled:opacity-40"
          >
            <Check size={15} />
            Approve Master List &amp; Continue to Stage 4 →
          </button>
        </div>
      </motion.div>

    </div>
  );
}
