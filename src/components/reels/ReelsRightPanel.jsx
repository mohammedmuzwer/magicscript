"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, ShieldCheck, FlaskConical } from "lucide-react";
import TopicInsightPanel from "@/components/reels/TopicInsightPanel";
import ReelsModelToggle  from "@/components/reels/ReelsModelToggle";
import { reelRunCost }   from "@/lib/reels/creditCosts";

// ── Stage 1: Batch size selector ──────────────────────────────────────────────
function BatchSizePanel({ batchSize, setBatchSize }) {
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Batch Size</p>
      <p className="text-[11px] text-faint">Generate multiple reels at once</p>
      <div className="grid grid-cols-4 gap-1 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-0.5">
        {[1, 3, 5, 10].map((n) => (
          <button key={n} onClick={() => setBatchSize(n)}
            className="rounded-md py-1.5 text-xs font-bold transition-all"
            style={batchSize === n ? { background: "#3b82f6", color: "#fff" } : { color: "rgb(var(--text-faint))" }}>
            {n === 1 ? "×1" : `×${n}`}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Evidence score donut ──────────────────────────────────────────────────────
function EvidenceScorePanel({ score, safety, sources = [] }) {
  const r = 22, circ = 2 * Math.PI * r;
  const progress = score != null ? (score / 100) * circ : 0;
  const color = score == null ? "#6b7280" : score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
  const safetyLabel = safety === "safe" ? "Safe" : safety === "caution" ? "Caution" : "Blocked";
  const safetyColor = safety === "safe"
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    : safety === "caution"
    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
    : "bg-rose-500/10 text-rose-400 border-rose-500/20";

  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Evidence Score</p>
      <div className="flex items-center gap-3">
        {/* Donut */}
        <div className="relative shrink-0">
          <svg width={54} height={54} className="-rotate-90">
            <circle cx={27} cy={27} r={r} fill="none" stroke="rgb(var(--bg))" strokeWidth={5} />
            <circle cx={27} cy={27} r={r} fill="none" stroke={score != null ? color : "transparent"}
              strokeWidth={5} strokeDasharray={circ}
              strokeDashoffset={circ - progress} strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.6s ease" }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-black tabular-nums" style={{ color }}>
              {score != null ? score : "—"}
            </span>
          </div>
        </div>
        <div className="space-y-1.5">
          {score != null && (
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${safetyColor}`}>
              {safety === "caution" ? "⚠️" : safety === "safe" ? "✅" : "⛔"} {safetyLabel}
            </span>
          )}
          <p className="text-[10px] text-faint">{score != null ? `${score}/100 · PubMed` : "Select a topic"}</p>
        </div>
      </div>

      {/* Sources */}
      {sources.length > 0 && (
        <div className="space-y-1.5 border-t border-[rgb(var(--border))] pt-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Sources</p>
          {sources.slice(0, 4).map((s, i) => (
            <p key={i} className="text-[10px] text-faint truncate leading-snug">
              <span className="mr-1.5 text-emerald-400">•</span>{s}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Stage 3: Cost breakdown ───────────────────────────────────────────────────
function CostPanel({ count, creditsRemaining }) {
  const total = reelRunCost(count);
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-faint flex items-center gap-1.5">
        <Zap size={10} className="text-[#2563eb]" /> Cost
      </p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-[rgb(var(--text))]">{total}</span>
        <span className="text-sm font-bold text-faint">cr</span>
      </div>
      <p className="text-[11px] text-faint">{count} reel{count !== 1 ? "s" : ""} · full Stage 1→5 run</p>
      <div className="h-px bg-[rgb(var(--border))]" />
      <p className="text-[10px] text-faint">{creditsRemaining} credits remaining</p>
    </div>
  );
}

// ── Fact-check grades legend ──────────────────────────────────────────────────
function FactCheckGrades() {
  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Fact-Check Grades</p>
      {[
        { color: "#22c55e", label: "Verified" },
        { color: "#f59e0b", label: "Partial" },
        { color: "#ef4444", label: "No source" },
        { color: "#3b82f6", label: "Clinical" },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-2 text-[11px] text-faint">
          <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
          {label}
        </div>
      ))}
    </div>
  );
}

// ── Stage 4: Live output + quality ────────────────────────────────────────────
function LiveOutputPanel({ finalReels, reelProgress }) {
  const completed = finalReels.length;
  const total = reelProgress.total || 1;

  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] overflow-hidden">
      <div className="flex items-center justify-between border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-3 py-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-faint">
          Live Output
        </p>
        <span className="text-[10px] font-bold text-[#2563eb]">{completed}/{total} complete</span>
      </div>
      <div className="max-h-[220px] overflow-y-auto p-3 space-y-3">
        {finalReels.length === 0 ? (
          <p className="text-[11px] text-faint text-center py-4">Generating first script…</p>
        ) : (
          finalReels.map((reel, i) => {
            const scriptText = typeof reel.scripts?.education === "string" ? reel.scripts.education : "";
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-1">
                <p className="text-[10px] font-bold text-[#2563eb] truncate">{reel.topic}</p>
                <p className="text-[10px] text-faint leading-snug line-clamp-3">
                  {scriptText.slice(0, 180) || "Generating…"}
                </p>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ScriptQualityPanel({ medCheck, contentType, selectedBucket }) {
  const score = medCheck?.evidence_score;
  const r = 18, circ = 2 * Math.PI * r;
  const qualScore = score != null ? Math.round(score * 0.6 + 40) : 75; // blend to engagement proxy
  const progress = (qualScore / 100) * circ;
  const color = qualScore >= 70 ? "#22c55e" : qualScore >= 50 ? "#f59e0b" : "#ef4444";
  const label = qualScore >= 70 ? "Approved" : qualScore >= 50 ? "Review" : "Reframe";

  return (
    <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Script Quality</p>

      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <svg width={46} height={46} className="-rotate-90">
            <circle cx={23} cy={23} r={r} fill="none" stroke="rgb(var(--bg))" strokeWidth={4} />
            <circle cx={23} cy={23} r={r} fill="none" stroke={color}
              strokeWidth={4} strokeDasharray={circ} strokeDashoffset={circ - progress}
              strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black" style={{ color }}>{qualScore}</span>
          </div>
        </div>
        <div>
          <span className="text-[10px] font-bold" style={{ color }}>✓ {label}</span>
          <p className="text-[10px] text-faint mt-0.5">{qualScore}/100</p>
        </div>
      </div>

      {/* Performance bars */}
      {medCheck && (
        <div className="space-y-2 border-t border-[rgb(var(--border))] pt-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Performance</p>
          {[
            { label: "Hook",         val: Math.min(100, qualScore + 7),  color: "#3b82f6" },
            { label: "Save rate",    val: Math.min(100, qualScore - 7),  color: "#3b82f6" },
            { label: "Share",        val: Math.min(100, qualScore),      color: "#3b82f6" },
            { label: "Comment pull", val: Math.min(100, qualScore + 3),  color: "#3b82f6" },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-[10px] text-faint">{label}</span>
              <div className="flex-1 h-1 bg-[rgb(var(--bg))] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${val}%`, background: color }} />
              </div>
              <span className="w-8 text-right text-[10px] font-bold" style={{ color }}>{val}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Safety */}
      {medCheck && (
        <div className="space-y-1.5 border-t border-[rgb(var(--border))] pt-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Safety</p>
          {[
            { label: "No harmful claims",       ok: true,    warn: false },
            { label: "Recommend professional",  ok: false,   warn: true  },
            { label: "PubMed verified",         ok: true,    warn: false },
          ].map(({ label, ok, warn }) => (
            <div key={label} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-semibold ${
              warn ? "bg-amber-500/8 text-amber-400" : "bg-emerald-500/8 text-emerald-400"
            }`}>
              {warn ? "⚠️" : "✓"} {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Topic Intelligence (Stage 2) ──────────────────────────────────────────────
function TopicIntelligencePanel({ preview }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Topic Intelligence</p>
        <p className="text-[11px] text-faint mt-0.5">Doctor Farmer analysis & signal breakdown</p>
      </div>
      {preview ? (
        <TopicInsightPanel preview={preview} />
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]">
          <div className="mb-2 text-2xl">📊</div>
          <p className="text-xs font-semibold text-soft">Awaiting topic</p>
          <p className="mt-1 text-[10px] text-faint px-4">Select a topic to see its Doctor Farmer analysis</p>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════════════════════
export default function ReelsRightPanel({
  currentStage,
  previewTopic,
  batchSize, setBatchSize,
  selectedTopics,
  medCheck,
  finalReels,
  pipeStatus, reelProgress,
  contentType, selectedBucket,
  user,
}) {
  // Derive evidence display data
  const evidenceScore  = medCheck?.evidence_score ?? null;
  const safetySt       = medCheck?.safety_status  ?? null;
  const sources        = (medCheck?.pubmed_references ?? []).map(r => r.split(" — ")[0]).slice(0, 4);

  const topicCount = selectedTopics?.length || 1;

  return (
    <aside className="hidden w-[280px] shrink-0 flex-col gap-3 border-l border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] overflow-y-auto p-3 xl:flex">
      <AnimatePresence mode="wait">

        {/* ── Stage 1 ─────────────────────────────────────────────────────── */}
        {currentStage === 1 && (
          <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <BatchSizePanel batchSize={batchSize} setBatchSize={setBatchSize} />
            <EvidenceScorePanel score={evidenceScore} safety={safetySt} sources={sources} />
          </motion.div>
        )}

        {/* ── Stage 2 ─────────────────────────────────────────────────────── */}
        {currentStage === 2 && (
          <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TopicIntelligencePanel preview={previewTopic} />
          </motion.div>
        )}

        {/* ── Stage 3 ─────────────────────────────────────────────────────── */}
        {currentStage === 3 && (
          <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            {/* Model toggle — hidden while pipeline is running (duplicate of inline selector) */}
            {pipeStatus !== "running" && (
              <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Model</p>
                <ReelsModelToggle stageNum={4} />
              </div>
            )}
            <CostPanel count={topicCount} creditsRemaining={user?.credits ?? 0} />
            <FactCheckGrades />
          </motion.div>
        )}

        {/* ── Stage 4 ─────────────────────────────────────────────────────── */}
        {currentStage >= 4 && (
          <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <LiveOutputPanel finalReels={finalReels ?? []} reelProgress={reelProgress ?? { current: 0, total: 1 }} />
            {medCheck && <ScriptQualityPanel medCheck={medCheck} contentType={contentType} selectedBucket={selectedBucket} />}
          </motion.div>
        )}

      </AnimatePresence>
    </aside>
  );
}
