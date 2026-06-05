"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronRight, RotateCcw, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    key: "myth_buster",
    label: "Myth Buster",
    icon: "⚡",
    color: "#f59e0b",
    bg: "bg-amber-500/8",
    border: "border-amber-500/25",
    headerBg: "bg-amber-500/12",
    badge: "text-amber-400",
  },
  {
    key: "problem_reveal",
    label: "Problem Reveal",
    icon: "🔍",
    color: "#2563eb",
    bg: "bg-[#2563eb]/8",
    border: "border-[#2563eb]/25",
    headerBg: "bg-[#2563eb]/12",
    badge: "text-[#2563eb]",
  },
  {
    key: "education_drop",
    label: "Education Drop",
    icon: "🧠",
    color: "#8b5cf6",
    bg: "bg-violet-500/8",
    border: "border-violet-500/25",
    headerBg: "bg-violet-500/12",
    badge: "text-violet-400",
  },
  {
    key: "faq_explainer",
    label: "FAQ Explainer",
    icon: "❓",
    color: "#22c55e",
    bg: "bg-green-500/8",
    border: "border-green-500/25",
    headerBg: "bg-green-500/12",
    badge: "text-green-400",
  },
  {
    key: "contrarian",
    label: "Contrarian",
    icon: "🎯",
    color: "#f97316",
    bg: "bg-orange-500/8",
    border: "border-orange-500/25",
    headerBg: "bg-orange-500/12",
    badge: "text-orange-400",
  },
];

// ── Score band helpers ────────────────────────────────────────────────────────
function scoreBand(score) {
  if (score >= 90) return { label: "Consensus",  bar: "bg-emerald-500", text: "text-emerald-400" };
  if (score >= 70) return { label: "Strong",     bar: "bg-[#2563eb]",    text: "text-[#2563eb]"    };
  if (score >= 50) return { label: "Emerging",   bar: "bg-amber-500",   text: "text-amber-400"   };
  return              { label: "Fringe",      bar: "bg-rose-500",    text: "text-rose-400"    };
}

// ── Idea card ─────────────────────────────────────────────────────────────────
function IdeaCard({ idea, cat, delay, onSelect }) {
  const band = scoreBand(idea.medical_evidence_score);

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      onClick={() => onSelect(idea.topic)}
      className={`group w-full rounded-xl border p-3 text-left transition-all duration-200 ${cat.bg} ${cat.border} hover:ring-1`}
      style={{ "--tw-ring-color": cat.color + "55" }}
    >
      {/* Topic text */}
      <p className="mb-2.5 text-xs font-semibold leading-snug group-hover:text-[rgb(var(--text))] text-soft transition">
        {idea.topic}
      </p>

      {/* Score bar */}
      <div className="mb-1.5">
        <div className="h-1.5 overflow-hidden rounded-full bg-[rgb(var(--bg))]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${idea.medical_evidence_score}%` }}
            transition={{ delay: delay + 0.1, duration: 0.6, ease: "easeOut" }}
            className={`h-full rounded-full ${band.bar}`}
          />
        </div>
      </div>

      {/* Score meta row */}
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold ${band.text}`}>
          {band.label} · {idea.medical_evidence_score}
        </span>
        <span className="text-[10px] text-faint italic truncate max-w-[110px]">
          {idea.score_rationale}
        </span>
      </div>

      {/* Use this → hint on hover */}
      <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="text-[10px] font-semibold" style={{ color: cat.color }}>
          Use this topic
        </span>
        <ChevronRight size={10} style={{ color: cat.color }} />
      </div>
    </motion.button>
  );
}

// ── Category column ───────────────────────────────────────────────────────────
function CategoryColumn({ cat, ideas, onSelect }) {
  const avg = ideas.length
    ? Math.round(ideas.reduce((s, i) => s + i.medical_evidence_score, 0) / ideas.length)
    : 0;

  return (
    <div className={`flex flex-col rounded-xl border ${cat.border} overflow-hidden`}>
      {/* Column header */}
      <div className={`${cat.headerBg} border-b ${cat.border} px-3 py-2.5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{cat.icon}</span>
            <span className="text-xs font-bold" style={{ color: cat.color }}>{cat.label}</span>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cat.bg} ${cat.badge}`}>
            avg {avg}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-faint">{ideas.length} ideas</p>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 p-2.5">
        {ideas.map((idea, i) => (
          <IdeaCard
            key={i}
            idea={idea}
            cat={cat}
            delay={i * 0.05}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

// ── Score legend ──────────────────────────────────────────────────────────────
function ScoreLegend() {
  const items = [
    { label: "Consensus (90–100)", color: "bg-emerald-500" },
    { label: "Strong (70–89)",     color: "bg-[#2563eb]"    },
    { label: "Emerging (50–69)",   color: "bg-amber-500"   },
    { label: "Fringe (<50)",       color: "bg-rose-500"    },
  ];
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-[11px] font-semibold text-faint">Evidence score:</span>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <div className={`h-2 w-2 rounded-full ${item.color}`} />
          <span className="text-[10px] text-faint">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function IdeaMatrix({ onTopicSelect }) {
  const { spendCredit } = useAuth();
  const [keyword,  setKeyword]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [matrix,   setMatrix]   = useState(null);
  const [error,    setError]    = useState("");
  const [mode,     setMode]     = useState("demo");

  // Mobile: which category tab is active
  const [activeTab, setActiveTab] = useState("myth_buster");

  const handleGenerate = async () => {
    const kw = keyword.trim();
    if (!kw) return;
    setLoading(true);
    setError("");
    setMatrix(null);

    try {
      const anthropicKey = typeof window !== "undefined" ? localStorage.getItem("ms_anthropic_key") : null;
      const openaiKey    = typeof window !== "undefined" ? localStorage.getItem("ms_openai_key") : null;

      const res = await fetch("/api/reels/idea-matrix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(anthropicKey && { "x-client-anthropic-key": anthropicKey }),
          ...(openaiKey    && { "x-client-openai-key": openaiKey }),
        },
        body: JSON.stringify({ keyword: kw }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMatrix(data.matrix);
      setMode(data.mode);
      // Small credit cost for idea generation
      spendCredit(2);
    } catch (e) {
      setError("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (topic) => {
    onTopicSelect?.(topic);
  };

  const totalIdeas = matrix
    ? Object.values(matrix).reduce((s, arr) => s + arr.length, 0)
    : 0;

  return (
    <div className="space-y-5">
      {/* Input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleGenerate()}
            placeholder="Enter a keyword or health topic — e.g. insulin, thyroid, PCOS, gut health..."
            className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-2.5 text-sm outline-none transition placeholder:text-faint focus:border-[#2563eb]/50 focus:ring-1 focus:ring-[#2563eb]/20"
          />
        </div>
        <motion.button
          whileHover={{ scale: !loading && keyword.trim() ? 1.02 : 1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={loading || !keyword.trim()}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#2563eb] to-electric px-5 py-2.5 text-sm font-bold text-navy-950 transition disabled:opacity-40"
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Sparkles size={15} />
          )}
          {loading ? "Generating..." : "Generate 25 Ideas"}
          {!loading && <span className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-bold">2cr</span>}
        </motion.button>

        {matrix && (
          <button
            onClick={() => { setMatrix(null); setKeyword(""); }}
            className="flex items-center gap-1.5 rounded-xl border border-[rgb(var(--border))] px-3 py-2.5 text-xs text-faint transition hover:text-soft"
          >
            <RotateCcw size={13} /> Reset
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-rose-400">{error}</p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {CATEGORIES.map((cat) => (
            <div key={cat.key} className={`rounded-xl border ${cat.border} overflow-hidden`}>
              <div className={`${cat.headerBg} border-b ${cat.border} px-3 py-2.5`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{cat.icon}</span>
                  <span className="text-xs font-bold" style={{ color: cat.color }}>{cat.label}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 p-2.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl bg-[rgb(var(--bg-soft))] h-20" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Matrix output */}
      <AnimatePresence>
        {matrix && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Stats + legend row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-[#2563eb]/10 px-3 py-1 text-xs font-bold text-[#2563eb]">
                  ✨ {totalIdeas} ideas for "{keyword}"
                </span>
                {mode === "demo" && (
                  <span className="rounded-lg bg-[rgb(var(--panel))] border border-[rgb(var(--border))] px-2.5 py-1 text-[10px] font-semibold text-faint">
                    Demo mode
                  </span>
                )}
              </div>
              <ScoreLegend />
            </div>

            {/* Mobile: category tab bar */}
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-1 lg:hidden">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveTab(cat.key)}
                  className={`flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    activeTab === cat.key
                      ? "bg-[rgb(var(--bg-soft))] shadow-sm"
                      : "text-faint hover:text-soft"
                  }`}
                  style={activeTab === cat.key ? { color: cat.color } : {}}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Mobile: single column */}
            <div className="lg:hidden">
              {CATEGORIES.filter((c) => c.key === activeTab).map((cat) => (
                <CategoryColumn
                  key={cat.key}
                  cat={cat}
                  ideas={matrix[cat.key] ?? []}
                  onSelect={handleSelect}
                />
              ))}
            </div>

            {/* Desktop: 5-column grid */}
            <div className="hidden lg:grid lg:grid-cols-5 lg:gap-3">
              {CATEGORIES.map((cat) => (
                <CategoryColumn
                  key={cat.key}
                  cat={cat}
                  ideas={matrix[cat.key] ?? []}
                  onSelect={handleSelect}
                />
              ))}
            </div>

            {/* Footer hint */}
            <p className="text-center text-[11px] text-faint">
              Click any idea to use it as your Reel topic ↑
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
