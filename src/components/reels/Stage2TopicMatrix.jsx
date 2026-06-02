"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, Check, RotateCcw, ShoppingCart, X } from "lucide-react";
import { generateMockStage2Topics } from "@/lib/reels/mockStage2Topics";

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  {
    id: "myth",       label: "Myth",             icon: "⚡", color: "#f59e0b", hasToggle: true,
    tagline: "Debunks a false belief OR validates an overlooked truth — high alarm, family-share trigger",
  },
  {
    id: "problem",    label: "Problem + Fix",    icon: "🔍", color: "#06b6d4", hasToggle: false,
    tagline: "Reveals a hidden health issue your audience has right now — AND shows the actionable fix",
    badge: "Problem + Solution",
  },
  {
    id: "faq",        label: "FAQ",              icon: "❓", color: "#22c55e", hasToggle: false,
    tagline: "Answers the exact question patients type into Google — with doctor authority and nuance",
  },
  {
    id: "contrarian", label: "Contrarian",       icon: "🎯", color: "#f97316", hasToggle: false,
    tagline: "Challenges mainstream advice boldly — highest comment volume and algorithm push of all formats",
  },
  {
    id: "clinical",   label: "Clinical Deep Dive",icon: "🔬", color: "#8b5cf6", hasToggle: false,
    tagline: "Uses patient data, Indian research, Tamil Nadu specifics — zero competition from non-doctors",
  },
];

// ── Score band ────────────────────────────────────────────────────────────────
function scoreBand(s) {
  if (s >= 70) return { label: "APPROVED", text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-300 dark:border-emerald-500/25" };
  if (s >= 50) return { label: "REFRAME",  text: "text-amber-700 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-500/10",     border: "border-amber-300 dark:border-amber-500/25"     };
  return              { label: "REJECTED", text: "text-rose-700 dark:text-rose-400",        bg: "bg-rose-50 dark:bg-rose-500/10",        border: "border-rose-300 dark:border-rose-500/25"        };
}

// ── Criterion pill ────────────────────────────────────────────────────────────
function CritPill({ value, color, label }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-bold tabular-nums"
      style={{ background: color + "28", color }}
      title={label}
    >
      {value}
    </span>
  );
}

// ── Topic row ─────────────────────────────────────────────────────────────────
function TopicRow({ topic, index, isSelected, isDisabled, onSelect, color, critColors }) {
  const band           = scoreBand(topic.score);
  const competitionGap = topic.competition_gap ?? 75;

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      whileHover={!isDisabled ? { y: -1, transition: { duration: 0.12 } } : {}}
      onClick={() => !isDisabled && onSelect(topic)}
      className={`group flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
        isDisabled && !isSelected ? "opacity-35 cursor-not-allowed" : "cursor-pointer"
      }`}
      style={isSelected
        ? { borderColor: color + "55", background: color + "0e" }
        : { borderColor: "rgb(var(--border))" }
      }
    >
      {/* Checkbox */}
      <div
        className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded border-2 transition-all duration-200"
        style={isSelected
          ? { borderColor: color, background: color }
          : { borderColor: "rgb(var(--border))" }
        }
      >
        {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
      </div>

      {/* Number */}
      <span className="mt-0.5 w-5 shrink-0 text-[11px] font-bold tabular-nums text-faint">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Title + description + pills */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-snug transition-colors" style={isSelected ? { color } : {}}>
          {topic.title}
        </p>
        {topic.description && (
          <p className="mt-0.5 text-[11px] leading-snug text-faint">{topic.description}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <CritPill value={topic.demand}     color={critColors.demand} label="Demand"          />
          <CritPill value={topic.social}     color={critColors.social} label="Social Demand"   />
          <CritPill value={competitionGap}   color={critColors.gap}    label="Competition Gap" />
          <CritPill value={topic.fit}        color={critColors.fit}    label="DF Fit"          />
          {topic.anchor_type && (
            <span
              className="inline-flex items-center rounded px-1 py-0.5 text-[9px] font-bold tracking-wide"
              style={{
                background:
                  topic.anchor_type === "A" ? critColors.demand + "30" :
                  topic.anchor_type === "B" ? critColors.gap    + "30" :
                                              critColors.social  + "30",
                color:
                  topic.anchor_type === "A" ? critColors.demand :
                  topic.anchor_type === "B" ? critColors.gap    :
                                              critColors.social,
              }}
              title={topic.anchor_note ?? `Anchor ${topic.anchor_type}`}
            >
              {topic.anchor_type === "A" ? "⚓ A · Direct" :
               topic.anchor_type === "B" ? "↳ B · Derivative" :
               "🕌 C · Cultural"}
            </span>
          )}
        </div>
      </div>

      {/* Score + badge */}
      <div className="ml-2 flex shrink-0 flex-col items-end gap-1">
        <span
          className="text-base font-bold tabular-nums leading-none transition-colors"
          style={isSelected ? { color } : { color: "rgb(var(--text-soft))" }}
        >
          {topic.score}
        </span>
        <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${band.bg} ${band.text} ${band.border}`}>
          {band.label}
        </span>
      </div>
    </motion.button>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function TabSkeleton() {
  return (
    <div className="space-y-2 py-1">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-[68px] animate-pulse rounded-xl bg-[rgb(var(--bg-soft))]"
          style={{ animationDelay: `${i * 0.07}s` }}
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Stage2TopicMatrix({ topic, bucket, batchSize = 1, onSendToStage3, onTopicPreview }) {
  const [activeTab,     setActiveTab]    = useState("myth");
  const [mythType,      setMythType]     = useState("false_myth");
  const [topicsData,    setTopicsData]   = useState(null);
  const [globalLoading, setGlobalLoading]= useState(true);
  const [refreshingTab, setRefreshingTab]= useState(null);
  const [selectedItems, setSelectedItems]= useState([]); // [{...topicObj, tabId}]
  const [isDark,        setIsDark]       = useState(true); // default dark to avoid flash

  // Track dark/light mode for criterion pill colors
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Criterion pill colors: bright for dark mode, AA-contrast for light mode
  const critColors = isDark
    ? { demand: "#38bdf8", social: "#a78bfa", gap: "#f59e0b", fit: "#34d399" }
    : { demand: "#0369a1", social: "#6d28d9", gap: "#b45309", fit: "#059669" };

  const batchFull = selectedItems.length >= batchSize;
  const remaining = batchSize - selectedItems.length;

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchTopics = useCallback(async (keyword, bucket, category = null) => {
    const ak = typeof window !== "undefined" ? localStorage.getItem("ms_anthropic_key") : null;
    const ok = typeof window !== "undefined" ? localStorage.getItem("ms_openai_key")    : null;
    const res = await fetch("/api/reels/stage2-topics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(ak && { "x-client-anthropic-key": ak }),
        ...(ok && { "x-client-openai-key":    ok }),
      },
      body: JSON.stringify({ keyword, bucket, category }),
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  }, []);

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setGlobalLoading(true);
    setTopicsData(null);
    setSelectedItems([]);
    onTopicPreview?.(null);

    (async () => {
      try {
        const data = await fetchTopics(topic, bucket);
        if (!cancelled) setTopicsData(data.topics);
      } catch {
        if (!cancelled) setTopicsData(generateMockStage2Topics(topic));
      } finally {
        if (!cancelled) setGlobalLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [topic, bucket, fetchTopics]);

  // ── Per-tab refresh ───────────────────────────────────────────────────────
  const refreshTab = async (tabId) => {
    if (refreshingTab || globalLoading) return;
    setRefreshingTab(tabId);
    // Remove selections from the refreshed tab
    setSelectedItems(prev => prev.filter(s => s.tabId !== tabId));
    if (activeTab === tabId) onTopicPreview?.(null);

    try {
      const data = await fetchTopics(topic, bucket, tabId);
      const newSlice = tabId === "myth"
        ? { myth: data.topics.myth ?? topicsData?.myth }
        : { [tabId]: data.topics[tabId] ?? topicsData?.[tabId] };
      setTopicsData((prev) => ({ ...prev, ...newSlice }));
    } catch {
      const mock = generateMockStage2Topics(topic);
      const fallback = tabId === "myth" ? { myth: mock.myth } : { [tabId]: mock[tabId] };
      setTopicsData((prev) => ({ ...prev, ...fallback }));
    } finally {
      setRefreshingTab(null);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeTabCfg  = TABS.find((t) => t.id === activeTab) ?? TABS[0];
  const isTabLoading  = globalLoading || refreshingTab === activeTab;
  const currentTopics = !topicsData ? [] :
    activeTab === "myth"
      ? (topicsData.myth?.[mythType] ?? [])
      : (topicsData[activeTab] ?? []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectTopic = (t) => {
    const alreadySelected = selectedItems.some(s => s.title === t.title);
    if (alreadySelected) {
      const updated = selectedItems.filter(s => s.title !== t.title);
      setSelectedItems(updated);
      const last = updated[updated.length - 1];
      if (last) onTopicPreview?.({ topic: last, tabId: last.tabId, tabConfig: TABS.find(tab => tab.id === last.tabId) ?? activeTabCfg, mythType });
      else onTopicPreview?.(null);
    } else if (!batchFull) {
      const updated = [...selectedItems, { ...t, tabId: activeTab }];
      setSelectedItems(updated);
      onTopicPreview?.({ topic: t, tabId: activeTab, tabConfig: activeTabCfg, mythType });
    }
  };

  const handleTabChange = (id) => {
    setActiveTab(id);
    // selections persist across tabs — don't clear
    onTopicPreview?.(null);
  };

  const handleSend = () => {
    if (selectedItems.length === 0) return;
    onSendToStage3?.(selectedItems);
  };

  const canSend = selectedItems.length > 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-[rgb(var(--border))] bg-[rgb(var(--panel))] shadow-sm dark:shadow-none">

      {/* ── Tab bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 overflow-x-auto border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-2 py-1.5">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const tabCount = selectedItems.filter(s => s.tabId === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className="relative flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
              style={isActive
                ? { background: tab.color + "18", color: tab.color }
                : { color: "rgb(var(--text-faint))" }
              }
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tabCount > 0 && (
                <span
                  className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                  style={{ background: tab.color }}
                >
                  {tabCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Active tab description bar ──────────────────────────────── */}
      <div
        className="flex items-center gap-2 border-b px-4 py-2"
        style={{ borderColor: activeTabCfg.color + "30", background: activeTabCfg.color + "08" }}
      >
        <span className="text-base leading-none">{activeTabCfg.icon}</span>
        <div className="flex flex-1 flex-wrap items-center gap-2 min-w-0">
          <span className="text-[11px] font-bold" style={{ color: activeTabCfg.color }}>
            {activeTabCfg.label}
          </span>
          {activeTabCfg.badge && (
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
              style={{ background: activeTabCfg.color + "20", color: activeTabCfg.color }}
            >
              {activeTabCfg.badge}
            </span>
          )}
          <span className="text-[11px] text-faint leading-snug">{activeTabCfg.tagline}</span>
        </div>
      </div>

      {/* ── Batch selection banner ───────────────────────────────────── */}
      <AnimatePresence>
        {batchSize > 1 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={`flex items-center justify-between gap-3 border-b border-[rgb(var(--border))] px-4 py-2.5 ${batchFull ? "bg-emerald-500/8" : "bg-[rgb(var(--bg-soft))]"}`}>
              <div className="flex items-center gap-2">
                <ShoppingCart size={13} className={batchFull ? "text-emerald-400" : "text-faint"} />
                {batchFull ? (
                  <span className="text-xs font-bold text-emerald-400">
                    ✓ Batch Limit Reached — {selectedItems.length} topics selected
                  </span>
                ) : (
                  <span className="text-xs text-faint">
                    Select <span className="font-bold text-soft">{remaining}</span> more topic{remaining !== 1 ? "s" : ""}
                    <span className="ml-1 text-faint">({selectedItems.length} / {batchSize})</span>
                  </span>
                )}
              </div>
              {selectedItems.length > 0 && (
                <div className="flex gap-1 overflow-x-auto">
                  {selectedItems.map((s, i) => {
                    const tabCfg = TABS.find(t => t.id === s.tabId);
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedItems(prev => prev.filter(x => x.title !== s.title))}
                        className="flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold transition hover:opacity-70"
                        style={{ borderColor: (tabCfg?.color ?? "#888") + "50", color: tabCfg?.color ?? "#888", background: (tabCfg?.color ?? "#888") + "10" }}
                        title={`Remove: ${s.title}`}
                      >
                        <span>{tabCfg?.icon}</span>
                        <span className="max-w-[80px] truncate">{s.title.split(" ").slice(0, 3).join(" ")}…</span>
                        <X size={8} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tab content header ───────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-4 py-2">
        <span className="text-[11px] font-semibold text-faint">
          {activeTabCfg.icon} {activeTabCfg.label}
          {activeTab === "myth" ? (
            <span className="ml-1 opacity-70">
              — {mythType === "false_myth" ? "3 False Myths" : "2 True Myths"}
            </span>
          ) : (
            <span className="ml-1 opacity-70">— 5 topics</span>
          )}
        </span>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => refreshTab(activeTab)}
          disabled={globalLoading || !!refreshingTab}
          className="flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] px-2.5 py-1.5 text-[11px] font-semibold text-faint transition hover:text-soft hover:border-cyan/30 disabled:opacity-40 disabled:cursor-not-allowed"
          style={refreshingTab === activeTab ? { color: activeTabCfg.color, borderColor: activeTabCfg.color + "50" } : {}}
        >
          {refreshingTab === activeTab ? (
            <><Loader2 size={11} className="animate-spin" /><span>Refreshing…</span></>
          ) : (
            <><RotateCcw size={11} /><span>Refresh</span></>
          )}
        </motion.button>
      </div>

      {/* ── Myth type toggle ─────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {activeTab === "myth" && (
          <motion.div
            key="myth-toggle"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-3 border-b border-[rgb(var(--border))] px-4 py-2.5">
              <span className="text-[11px] font-semibold text-faint">Myth type:</span>
              <div className="flex items-center gap-0.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-0.5">
                {[
                  { id: "false_myth", label: "✗ False Myth (3)" },
                  { id: "true_myth",  label: "✓ True Myth (2)"  },
                ].map((opt) => {
                  const on = mythType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setMythType(opt.id)}
                      className="rounded-md px-3 py-1.5 text-[11px] font-bold transition-all"
                      style={on ? { background: "#f59e0b", color: "#fff" } : { color: "rgb(var(--text-faint))" }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              <span className="text-[10px] text-faint">
                {mythType === "false_myth"
                  ? "Topics that debunk popular misconceptions"
                  : "Topics that validate overlooked scientific truths"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Topic list ───────────────────────────────────────────────── */}
      <div className="flex-1 p-3" style={{ minHeight: 280 }}>
        {isTabLoading ? (
          <div className="space-y-1">
            {globalLoading && (
              <div className="flex items-center gap-2 px-1 py-2">
                <Loader2 size={13} className="animate-spin text-faint" />
                <span className="text-xs text-faint">Validating with Doctor Farmer engine…</span>
              </div>
            )}
            <TabSkeleton />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${mythType}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-2"
            >
              {currentTopics.map((t, i) => {
                const isSelected = selectedItems.some(s => s.title === t.title);
                const isDisabled = batchFull && !isSelected;
                return (
                  <TopicRow
                    key={i}
                    topic={t}
                    index={i}
                    isSelected={isSelected}
                    isDisabled={isDisabled}
                    onSelect={handleSelectTopic}
                    color={activeTabCfg.color}
                    critColors={critColors}
                  />
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* ── Score legend ─────────────────────────────────────────────── */}
      <div className="space-y-1.5 border-t border-[rgb(var(--border))] px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-[10px] font-semibold text-faint">Verdict:</span>
          {[
            { range: "70–100", label: "Approved", cls: "text-emerald-700 dark:text-emerald-400" },
            { range: "50–69",  label: "Reframe",  cls: "text-amber-700 dark:text-amber-400"     },
            { range: "0–49",   label: "Rejected", cls: "text-rose-700 dark:text-rose-400"       },
          ].map((item) => (
            <span key={item.range} className="flex items-center gap-1">
              <span className={`text-[10px] font-bold ${item.cls}`}>{item.range}</span>
              <span className="text-[10px] text-faint">{item.label}</span>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[10px] font-semibold text-faint">Criteria pills:</span>
          {[
            { label: "D = Demand",          color: isDark ? "#38bdf8" : "#0369a1" },
            { label: "S = Social",          color: isDark ? "#a78bfa" : "#6d28d9" },
            { label: "CG = Competition Gap",color: isDark ? "#f59e0b" : "#b45309" },
            { label: "F = DF Fit",          color: isDark ? "#34d399" : "#059669" },
          ].map((c) => (
            <span key={c.label} className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: c.color }} />
              <span className="text-[9px] text-faint">{c.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── CTA button ───────────────────────────────────────────────── */}
      <div className="border-t border-[rgb(var(--border))] p-3">
        <motion.button
          whileHover={{ scale: canSend ? 1.01 : 1 }}
          whileTap={{ scale: canSend ? 0.98 : 1 }}
          onClick={handleSend}
          disabled={!canSend}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-35"
          style={{
            background: canSend ? "linear-gradient(90deg,#38bdf8,#818cf8)" : "rgb(var(--bg-soft))",
            color:      canSend ? "#0a101e" : "rgb(var(--text-faint))",
          }}
        >
          {canSend ? (
            batchSize > 1
              ? <><span>Generate {selectedItems.length} Reel{selectedItems.length !== 1 ? "s" : ""}</span><ArrowRight size={15} /></>
              : <><span>→ Use this topic — Send to Stage 3</span><ArrowRight size={15} /></>
          ) : (
            <span>
              {batchSize > 1
                ? `Select up to ${batchSize} topics to continue`
                : "Select a topic above to continue"}
            </span>
          )}
        </motion.button>
      </div>

    </div>
  );
}
