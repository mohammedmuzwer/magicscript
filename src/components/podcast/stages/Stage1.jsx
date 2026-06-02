"use client";

/**
 * Stage 1 — Topic Discovery
 * Doctor Farmer MagicScript Podcast Pipeline
 *
 * Flow:
 *  1. User picks mode (Keyword | Link) and types input
 *  2. "Discover Topics" calls /api/pipeline/stage1-discover
 *  3. 5 scored topic cards render — click to select, expand for full detail
 *  4. "Lock Topic & Continue to Stage 2" gate fires onComplete({ topic, mode, keyword })
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Link2, ChevronDown, ChevronRight, Check, ExternalLink,
  Anchor, AlertCircle, TrendingUp, Loader2, ArrowRight,
  Shield, ShieldAlert, Zap, Star, Lightbulb, Sparkles,
} from "lucide-react";
import ModelToggle from "@/components/podcast/ModelToggle";
import { getModelPref } from "@/lib/podcast/model-preference";
import {
  saveToVault, getVaultIdeas, deleteFromVault,
  deleteFromVaultByTitle, getUsedTopicTitles,
} from "@/lib/supabaseClient";

// ── Colour helpers ─────────────────────────────────────────────────────────────

const VERDICT_STYLE = {
  APPROVED: { bg: "#22c55e18", border: "#22c55e40", text: "#22c55e" },
  REFRAME:  { bg: "#f59e0b18", border: "#f59e0b40", text: "#f59e0b" },
  REJECTED: { bg: "#ef444418", border: "#ef444440", text: "#ef4444" },
};

const ANCHOR_COLOR = { A: "#22d3ee", B: "#f59e0b", C: "#a78bfa" };
const ANCHOR_LABEL = { A: "Direct", B: "Derivative", C: "Cultural" };

const CATEGORY_COLOR = {
  "Myth":               "#f59e0b",
  "Problem":            "#06b6d4",
  "FAQ":                "#22c55e",
  "Contrarian":         "#f97316",
  "Clinical Deep Dive": "#8b5cf6",
};

const CRITERION_COLOR = {
  "Demand":          "#22d3ee",
  "Social Demand":   "#a78bfa",
  "Competition Gap": "#f59e0b",
  "DF Fit":          "#22c55e",
};

// ── Verify URL builders ────────────────────────────────────────────────────────

function verifyUrl(tool, query) {
  const q = encodeURIComponent(query);
  switch (tool) {
    case "ubersuggest":       return `https://app.neilpatel.com/en/ubersuggest/?keyword=${q}`;
    case "answer_the_public": return `https://answerthepublic.com/reports?keyword=${q}`;
    case "google_trends":     return `https://trends.google.com/trends/explore?q=${q}`;
    case "seo_trending":      return `https://trends.google.com/trends/explore?q=${q}`;
    case "vidiq":             return `https://www.youtube.com/results?search_query=${q}`;
    case "quora":             return `https://www.quora.com/search?q=${q}`;
    default:                  return "#";
  }
}

const VERIFY_LABELS = {
  ubersuggest:       "Ubersuggest",
  answer_the_public: "Answer the Public",
  google_trends:     "Google Trends",
  seo_trending:      "SEO Trending",
  vidiq:             "VidIQ / YouTube",
  quora:             "Quora",
};

// ── ScoreBar ──────────────────────────────────────────────────────────────────

function ScoreBar({ label, value, color, weight }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px]">
        <span className="text-faint">{label} <span className="opacity-50">({weight}%)</span></span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-[rgb(var(--border))]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="text-[10px] font-bold tabular-nums w-6 text-right" style={{ color }}>{value}</span>
      </div>
    </div>
  );
}

// ── Skeleton card for loading state ───────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] p-4 space-y-3 animate-pulse">
      <div className="flex justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[rgb(var(--border))] rounded w-3/4" />
          <div className="h-3 bg-[rgb(var(--border))] rounded w-full" />
          <div className="h-3 bg-[rgb(var(--border))] rounded w-5/6" />
        </div>
        <div className="h-10 w-10 bg-[rgb(var(--border))] rounded-lg shrink-0" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-20 bg-[rgb(var(--border))] rounded-full" />
        <div className="h-5 w-16 bg-[rgb(var(--border))] rounded-full" />
      </div>
    </div>
  );
}

// ── TopicCard ─────────────────────────────────────────────────────────────────

function TopicCard({ topic, isSelected, onSelect }) {
  // Selected card auto-expands; user can also toggle manually
  const [manualExpand, setManualExpand] = useState(false);
  const expanded = isSelected || manualExpand;

  const verdictStyle   = VERDICT_STYLE[topic.verdict] ?? VERDICT_STYLE.REFRAME;
  const anchorColor    = ANCHOR_COLOR[topic.anchor?.type] ?? "#94a3b8";
  const anchorLabel    = ANCHOR_LABEL[topic.anchor?.type] ?? "Unknown";
  const categoryColor  = CATEGORY_COLOR[topic.category] ?? "#94a3b8";
  const scoreColor     = topic.score >= 70 ? "#22c55e" : topic.score >= 50 ? "#f59e0b" : "#ef4444";

  function toggleExpand(e) {
    e.stopPropagation();
    setManualExpand((v) => !v);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={() => onSelect(topic)}
      className={`rounded-xl border cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-cyan/50 bg-cyan/6 shadow-sm shadow-cyan/10"
          : "border-[rgb(var(--border))] hover:border-cyan/20 hover:bg-[rgb(var(--panel))]"
      }`}
    >
      {/* ── Compact header (always visible) ── */}
      <div className="p-4">
        {/* Row 1: anchor badge + category chip + score + verdict */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {/* Anchor badge */}
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ background: `${anchorColor}18`, border: `1px solid ${anchorColor}40`, color: anchorColor }}
          >
            <Anchor size={9} />
            {topic.anchor?.type} · {anchorLabel}
          </span>

          {/* Category chip */}
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ background: `${categoryColor}18`, border: `1px solid ${categoryColor}40`, color: categoryColor }}
          >
            {topic.category}
          </span>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            {/* Score */}
            <span className="text-xl font-black tabular-nums leading-none" style={{ color: scoreColor }}>
              {topic.score}
            </span>

            {/* Verdict */}
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ background: verdictStyle.bg, border: `1px solid ${verdictStyle.border}`, color: verdictStyle.text }}
            >
              {topic.verdict}
            </span>
          </div>
        </div>

        {/* Row 2: title */}
        <p className={`text-sm font-bold leading-snug mb-1 ${isSelected ? "text-cyan" : "text-[rgb(var(--text))]"}`}>
          {topic.title}
        </p>

        {/* Row 3: description (2-line clamp) */}
        <p className="text-[11px] text-faint leading-relaxed line-clamp-2">{topic.description}</p>

        {/* Row 4: expand toggle */}
        <button
          onClick={toggleExpand}
          className="mt-2 inline-flex items-center gap-1 text-[10px] text-faint hover:text-soft transition"
        >
          {expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          {expanded ? "Collapse" : "Full details"}
        </button>
      </div>

      {/* ── Expanded body ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 space-y-4 border-t border-[rgb(var(--border))]" style={{ marginTop: 0 }}>

              {/* Score breakdown */}
              <div className="pt-3">
                <p className="text-[10px] font-bold text-soft uppercase tracking-wide mb-2">Score Breakdown</p>
                <div className="space-y-2">
                  <ScoreBar label="Demand"          value={topic.demand}          color="#22d3ee" weight={35} />
                  <ScoreBar label="Social Demand"   value={topic.social}          color="#a78bfa" weight={40} />
                  <ScoreBar label="Competition Gap" value={topic.competition_gap} color="#f59e0b" weight={20} />
                  <ScoreBar label="DF Fit"          value={topic.df_fit}          color="#22c55e" weight={20} />
                </div>
              </div>

              {/* Biggest Weakness */}
              {topic.biggest_weakness && (
                <div>
                  <p className="text-[10px] font-bold text-soft uppercase tracking-wide mb-1.5">Biggest Weakness</p>
                  <div className="flex items-start gap-2 rounded-lg bg-amber-500/8 border border-amber-500/20 px-3 py-2">
                    <ShieldAlert size={12} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span
                        className="text-[10px] font-bold rounded px-1.5 py-0.5 mr-1.5"
                        style={{
                          background: `${CRITERION_COLOR[topic.biggest_weakness.criterion] ?? "#94a3b8"}20`,
                          color: CRITERION_COLOR[topic.biggest_weakness.criterion] ?? "#94a3b8",
                        }}
                      >
                        {topic.biggest_weakness.criterion}
                      </span>
                      <span className="text-[11px] text-amber-200">{topic.biggest_weakness.explanation}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Reframe */}
              {topic.reframe && (
                <div>
                  <p className="text-[10px] font-bold text-soft uppercase tracking-wide mb-1.5">Reframe</p>
                  <div className="rounded-lg bg-cyan/6 border border-cyan/20 px-3 py-2.5 space-y-1.5">
                    {/* Score delta row */}
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-faint">Original</span>
                      <span className="font-bold" style={{ color: scoreColor }}>{topic.score}</span>
                      <ArrowRight size={10} className="text-faint" />
                      <span className="text-faint">Reframed</span>
                      <span className="font-bold text-cyan">{topic.reframe.score}</span>
                      <span className="ml-auto text-[10px] font-bold text-cyan">+{topic.reframe.delta} pts</span>
                    </div>
                    {/* Reframed title */}
                    <p className="text-[11px] font-semibold text-cyan leading-snug">
                      &ldquo;{topic.reframe.title}&rdquo;
                    </p>
                    {/* Why stronger */}
                    <p className="text-[10px] text-faint">
                      <span className="font-semibold text-soft">Why stronger: </span>
                      {topic.reframe.why_stronger}
                    </p>
                  </div>
                </div>
              )}

              {/* Verify */}
              {topic.verify && (
                <div>
                  <p className="text-[10px] font-bold text-soft uppercase tracking-wide mb-1.5">Verify Search Queries</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(topic.verify).map(([tool, query]) => (
                      <a
                        key={tool}
                        href={verifyUrl(tool, query)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium
                          bg-[rgb(var(--border))]/60 text-faint hover:text-soft hover:bg-[rgb(var(--border))]
                          border border-[rgb(var(--border))] transition-all"
                        title={query}
                      >
                        {VERIFY_LABELS[tool]}
                        <ExternalLink size={9} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Opening line */}
              {topic.opening_line && (
                <div>
                  <p className="text-[10px] font-bold text-soft uppercase tracking-wide mb-1.5">Reel Opening Line</p>
                  <p className="text-[11px] italic text-soft leading-relaxed border-l-2 border-cyan/30 pl-3">
                    &ldquo;{topic.opening_line}&rdquo;
                  </p>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Vault Dropdown ────────────────────────────────────────────────────────────

function VaultDropdown({ ideas, loading, onPick, onRefresh }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          if (!open) onRefresh?.();
          setOpen((v) => !v);
        }}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition ${
          open
            ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
            : "border-[rgb(var(--border))] bg-[rgb(var(--panel))] text-soft hover:border-amber-500/30 hover:text-amber-300"
        }`}
      >
        <Lightbulb size={12} className={open ? "text-amber-400" : "text-amber-400/70"} />
        Unused Ideas
        {ideas.length > 0 && (
          <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500/20 px-1 text-[9px] font-bold text-amber-300">
            {ideas.length}
          </span>
        )}
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-30 mt-2 w-[420px] max-w-[calc(100vw-2rem)] rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] shadow-xl shadow-black/40"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles size={11} className="text-amber-400" />
                <span className="text-[11px] font-bold text-soft">Idea Vault</span>
                <span className="text-[10px] text-faint">· latest 20</span>
              </div>
              <span className="text-[10px] text-faint">Click to re-use</span>
            </div>

            {/* Body */}
            <div className="max-h-[360px] overflow-y-auto scrollbar-thin">
              {loading && (
                <div className="flex items-center justify-center gap-2 px-4 py-8 text-[11px] text-faint">
                  <Loader2 size={12} className="animate-spin" />
                  Loading vault…
                </div>
              )}

              {!loading && ideas.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <Lightbulb size={20} className="mx-auto text-amber-400/40 mb-2" />
                  <p className="text-[11px] font-semibold text-faint mb-1">Vault is empty</p>
                  <p className="text-[10px] text-faint/70 leading-relaxed">
                    Every time you pick a topic, the other 4 will be saved here for later.
                  </p>
                </div>
              )}

              {!loading && ideas.length > 0 && (
                <ul className="divide-y divide-[rgb(var(--border))]">
                  {ideas.map((idea) => (
                    <li key={idea.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          onPick(idea);
                        }}
                        className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-amber-500/5"
                      >
                        <Lightbulb size={11} className="shrink-0 text-amber-400/60 group-hover:text-amber-400" />
                        <span className="flex-1 truncate text-[11px] font-semibold text-soft group-hover:text-[rgb(var(--text))]">
                          {idea.topic_title}
                        </span>
                        {idea.search_keyword && (
                          <span
                            className="shrink-0 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-2 py-0.5 text-[9px] font-mono text-faint"
                            title={`Original keyword: ${idea.search_keyword}`}
                          >
                            {idea.search_keyword}
                          </span>
                        )}
                        <ArrowRight size={10} className="shrink-0 text-faint opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[rgb(var(--border))] px-4 py-2 text-[10px] text-faint">
              Ideas are removed from the vault once re-used.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Stage1 component ─────────────────────────────────────────────────────

export default function Stage1({ onComplete, onPreview, demoMode }) {
  const [mode,          setMode]          = useState("keyword"); // "keyword" | "link"
  const [input,         setInput]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [topics,        setTopics]        = useState([]);
  const [summary,       setSummary]       = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [apiMode,       setApiMode]       = useState(null); // "demo" | "anthropic" | "openai"
  const [fallbackNotice, setFallbackNotice] = useState(null); // set when API auto-fell-back from Gemini → Claude
  const [modelPref,     setModelPref]     = useState(() =>
    typeof window !== "undefined" ? getModelPref(1) : "gemini"
  );

  // ── Idea Vault state ──────────────────────────────────────────────────────
  const [vaultIdeas,   setVaultIdeas]   = useState([]);
  const [vaultLoading, setVaultLoading] = useState(false);

  async function refreshVault() {
    setVaultLoading(true);
    try {
      const rows = await getVaultIdeas();
      setVaultIdeas(rows ?? []);
    } finally {
      setVaultLoading(false);
    }
  }

  // Load vault once on mount
  useEffect(() => { refreshVault(); }, []);

  // ── API call ───────────────────────────────────────────────────────────────
  async function handleDiscover() {
    if (!input.trim()) return;
    setLoading(true);
    setTopics([]);
    setSummary(null);
    setSelectedTopic(null);
    setApiMode(null);
    setFallbackNotice(null);

    try {
      const gk = demoMode ? null : localStorage.getItem("V_KEY_GOOGLE");
      const ak = demoMode ? null : localStorage.getItem("V_KEY_CLAUDE");

      // ── Fetch already-used titles so the model can avoid repeating them.
      //    Combines saved-podcasts + idea_vault entries for this keyword.
      //    DB-only call, never blocks if Supabase is unreachable.
      let excludeTitles = [];
      try {
        excludeTitles = await getUsedTopicTitles(input.trim());
      } catch { /* non-fatal — proceed without exclusion list */ }

      const res = await fetch("/api/pipeline/stage1-discover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(gk && { "x-client-gemini-key":    gk }),
          ...(ak && { "x-client-anthropic-key": ak }),
          "x-preferred-model": modelPref,
        },
        body: JSON.stringify({ keyword: input.trim(), mode, excludeTitles }),
      });
      const data = await res.json();
      if (data.mode === "error" || data.error) {
        setApiMode("error");
        setSummary({ error: data.error ?? "Gemini API error — check your API key or quota." });
        return;
      }
      const fresh = data.topics ?? [];
      setTopics(fresh);
      setSummary(data.summary ?? null);
      setApiMode(data.mode ?? "demo");

      // ── Push live preview to parent so the chat panel can see these topics
      //    even before the user clicks "Approve & Continue".
      onPreview?.({
        topics:        fresh,
        summary:       data.summary ?? null,
        selectedTopic: null,
        mode,
        keyword:       input.trim(),
        // shape so chat answers about "this topic" work — expose topic as the first one
        topic:         fresh[0] ?? null,
      });

      // If the server auto-fell-back from Gemini → Claude, surface a soft notice
      if (data.fallback_from === "gemini-overloaded") {
        setFallbackNotice(data.fallback_reason || "Gemini was overloaded — used Claude instead.");
      } else {
        setFallbackNotice(null);
      }

      // ── Silent save: ALL 5 topics go to vault immediately on generation ──
      // This means: re-searching the same keyword (without proceeding) will
      // exclude these 5 next time, producing genuinely fresh angles.
      // The picked topic gets removed from the vault on proceed (it's used now).
      if (fresh.length > 0) {
        saveToVault(fresh, input.trim())
          .then((inserted) => {
            if (inserted) refreshVault();
          })
          .catch(() => {/* silent */});
      }
    } catch (err) {
      console.error("[Stage1] discover error:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(topic) {
    setSelectedTopic((prev) => {
      const next = prev?.id === topic.id ? null : topic;
      // Push the new selection into the chat's view of stage 1
      onPreview?.({
        topics,
        summary,
        selectedTopic: next,
        mode,
        keyword: input.trim(),
        topic:   next ?? topics[0] ?? null,
      });
      return next;
    });
  }

  // ── Proceed to Stage 2 ───────────────────────────────────────────────────
  // All 5 topics were saved to the vault when they were generated.
  // Now that one is being used in the pipeline, remove only THAT one from the
  // vault — leaving the 4 unused ideas in the backlog for later.
  function handleProceed() {
    if (!selectedTopic) return;

    // Optimistically prune the local vault list so the count updates immediately
    setVaultIdeas((prev) => prev.filter(
      (v) => !(v.topic_title === selectedTopic.title && v.search_keyword === input.trim())
    ));

    // Fire-and-forget DB delete
    deleteFromVaultByTitle(selectedTopic.title, input.trim()).catch(() => {/* silent */});

    onComplete({ topic: selectedTopic, mode, keyword: input });
  }

  // ── Re-use an idea from the vault ─────────────────────────────────────────
  // Hydrates Stage 1 with the saved topic and immediately advances to Stage 2.
  // The vault row is deleted in the background (one-shot use).
  function handlePickFromVault(idea) {
    const topic = idea?.topic_json;
    if (!topic) return;

    const keyword = idea?.search_keyword ?? "";

    // Optimistic UI: remove from local vault list so the dropdown reflects the action
    setVaultIdeas((prev) => prev.filter((v) => v.id !== idea.id));

    // Hydrate local state (so it's visible if user lingers)
    setSelectedTopic(topic);
    setTopics([topic]);
    setInput(keyword);
    setSummary(null);
    setApiMode(null);

    // Fire-and-forget DB cleanup
    deleteFromVault(idea.id).catch(() => {/* silent */});

    // Immediately advance to Stage 2 — no extra click needed
    onComplete({ topic, mode: "keyword", keyword });
  }

  const hasResults = topics.length > 0 && !loading;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div>
        <h2 className="text-lg font-bold mb-1">Stage 1 — Topic Discovery</h2>
        <p className="text-sm text-faint leading-relaxed">
          Enter a keyword or paste a reference link. The engine generates 5 ranked, scored topic candidates
          anchored to your input — each with scoring breakdown, reframe, verify queries, and a culturally
          specific Tamil Nadu opening line.
        </p>
      </div>

      {/* ── Mode toggle ── */}
      <div className="flex gap-2">
        {[
          {
            id: "keyword",
            icon: <Search size={13} />,
            label: "Mode A — Keyword",
            desc: "Type a keyword and get a scored shortlist",
          },
          {
            id: "link",
            icon: <Link2 size={13} />,
            label: "Mode B — Reference Link",
            desc: "Paste a viral video URL to adapt its structure",
          },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setTopics([]); setSelectedTopic(null); setSummary(null); }}
            className={`flex-1 rounded-xl border px-4 py-3 text-left transition-all ${
              mode === m.id
                ? "border-cyan/40 bg-cyan/8"
                : "border-[rgb(var(--border))] hover:border-cyan/20"
            }`}
          >
            <p className={`text-xs font-bold flex items-center gap-1.5 ${mode === m.id ? "text-cyan" : "text-soft"}`}>
              {m.icon}{m.label}
            </p>
            <p className="text-[11px] text-faint mt-0.5">{m.desc}</p>
          </button>
        ))}
      </div>

      {/* ── Model preference + Vault dropdown (same row, opposite ends) ── */}
      <div className="flex items-center justify-between gap-3">
        <ModelToggle stageNum={1} onChange={setModelPref} disabled={loading} />
        <VaultDropdown
          ideas={vaultIdeas}
          loading={vaultLoading}
          onRefresh={refreshVault}
          onPick={handlePickFromVault}
        />
      </div>

      {/* ── Input ── */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            {mode === "keyword"
              ? <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none" />
              : <Link2  size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none" />
            }
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDiscover()}
              placeholder={mode === "keyword" ? "e.g. ghee, insulin, fasting, longevity…" : "Paste YouTube or podcast URL…"}
              className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] py-3 pl-9 pr-4 text-sm
                focus:border-cyan/40 focus:outline-none transition"
            />
          </div>
          <button
            onClick={handleDiscover}
            disabled={!input.trim() || loading}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-cyan px-5 py-3 text-sm font-bold
              text-navy-950 transition hover:brightness-110 disabled:opacity-40"
          >
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Researching…</>
              : <><TrendingUp size={14} /> Discover Topics</>
            }
          </button>
        </div>

        {/* Mode B disclaimer */}
        {mode === "link" && (
          <div className="flex items-start gap-2 rounded-xl bg-amber-500/8 border border-amber-500/20 px-3 py-2.5 text-[11px] text-amber-300">
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            Mode B uses the reference for pattern and structure only. Health claims will be fact-checked and
            corrected through the Fact-Check Engine.
          </div>
        )}
      </div>

      {/* ── Loading skeletons ── */}
      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Loader2 size={13} className="animate-spin text-cyan" />
            <p className="text-xs text-faint">
              Anchoring topics to keyword · scoring demand, social signal, competition gap, and DF fit…
            </p>
          </div>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </motion.div>
      )}

      {/* ── API Error ── */}
      {apiMode === "error" && summary?.error && (
        <div className="rounded-xl border border-rose-500/25 bg-rose-500/8 p-4">
          <div className="flex items-start gap-3">
            <span className="text-rose-400 text-base shrink-0">⚠</span>
            <div>
              <p className="text-sm font-bold text-rose-300 mb-1">Gemini API Error</p>
              <p className="text-[11px] text-rose-300/80 font-mono break-all">{summary.error}</p>
              <p className="text-[11px] text-faint mt-2">Check your API key in <strong>Settings → API Keys</strong>, or switch to Demo mode using the toggle above.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Gemini → Claude auto-fallback notice ── */}
      {fallbackNotice && hasResults && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3 flex items-start gap-3"
        >
          <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-400" />
          <div className="flex-1">
            <p className="text-[11px] font-bold text-amber-300">
              Gemini was overloaded — automatically used Claude instead
            </p>
            <p className="text-[10px] text-amber-300/70 mt-0.5 leading-relaxed">
              Google's <span className="font-mono">gemini-2.5-flash</span> servers are at capacity right now (their side, not yours).
              We fell back to Claude so your workflow isn't blocked.
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Results ── */}
      <AnimatePresence>
        {hasResults && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* Summary bar */}
            {summary && (
              <div className="mb-4 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                <div>
                  <p className="text-[10px] text-faint uppercase tracking-wide flex items-center gap-1">
                    <Star size={9} className="text-amber-400" /> Top Pick
                  </p>
                  <p className="text-[11px] text-soft font-medium truncate">{summary.top_pick}</p>
                </div>
                <div>
                  <p className="text-[10px] text-faint uppercase tracking-wide flex items-center gap-1">
                    <Zap size={9} className="text-cyan" /> Best Reach
                  </p>
                  <p className="text-[11px] text-soft font-medium truncate">{summary.best_reach}</p>
                </div>
                <div>
                  <p className="text-[10px] text-faint uppercase tracking-wide flex items-center gap-1">
                    <Shield size={9} className="text-violet-400" /> Best Save
                  </p>
                  <p className="text-[11px] text-soft font-medium truncate">{summary.best_save}</p>
                </div>
                <div>
                  <p className="text-[10px] text-faint uppercase tracking-wide flex items-center gap-1">
                    <TrendingUp size={9} className="text-emerald-400" /> Best Funnel
                  </p>
                  <p className="text-[11px] text-soft font-medium truncate">{summary.best_funnel}</p>
                </div>
              </div>
            )}

            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold">{topics.length} topics ranked by score</h3>
              <div className="flex items-center gap-2">
                {apiMode === "demo" && (
                  <span className="text-[10px] rounded-full px-2 py-0.5 bg-amber-500/12 border border-amber-500/20 text-amber-400">
                    Demo mode
                  </span>
                )}
                {apiMode === "gemini" && (
                  <span className="text-[10px] rounded-full px-2 py-0.5 bg-cyan/12 border border-cyan/20 text-cyan">
                    ✦ Gemini
                  </span>
                )}
                {apiMode === "anthropic" && (
                  <span className="text-[10px] rounded-full px-2 py-0.5 bg-violet-500/12 border border-violet-500/20 text-violet-400">
                    Claude
                  </span>
                )}
                {apiMode === "openai" && (
                  <span className="text-[10px] rounded-full px-2 py-0.5 bg-emerald-500/12 border border-emerald-500/20 text-emerald-400">
                    GPT-4o
                  </span>
                )}
                {apiMode === "error" && (
                  <span className="text-[10px] rounded-full px-2 py-0.5 bg-rose-500/12 border border-rose-500/20 text-rose-400">
                    API Error
                  </span>
                )}
                <span className="text-[11px] text-faint">Click a card to select</span>
              </div>
            </div>

            {/* Topic cards */}
            <div className="space-y-3">
              {topics.map((topic, i) => (
                <TopicCard
                  key={topic.id ?? i}
                  topic={topic}
                  isSelected={selectedTopic?.id === topic.id}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Gate: Lock Topic & Continue ── */}
      <AnimatePresence>
        {selectedTopic && (
          <motion.div
            key="gate"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="sticky bottom-0 z-10 rounded-xl border border-cyan/30 bg-[rgb(var(--bg-soft))]/95
              p-4 backdrop-blur shadow-lg shadow-black/20"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-cyan uppercase tracking-wide flex items-center gap-1">
                  <Check size={10} /> Selected topic
                </p>
                <p className="text-[11px] text-soft mt-0.5 leading-snug truncate">{selectedTopic.title}</p>
              </div>
              <button
                onClick={handleProceed}
                disabled={!selectedTopic}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-cyan px-5 py-2.5 text-sm font-bold
                  text-navy-950 transition hover:brightness-110 disabled:opacity-40"
              >
                Lock Topic &amp; Continue to Stage 2
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
