"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, ShieldAlert, Loader2, ChevronRight,
  ChevronDown, ChevronUp, CheckCircle2, AlertTriangle,
  BookOpen, FlaskConical, Globe, Edit3, AlertCircle, ExternalLink,
} from "lucide-react";
import ModelToggle from "@/components/podcast/ModelToggle";
import { getModelPref } from "@/lib/podcast/model-preference";
import { FACT_CHECK_COLORS, TRUSTED_SOURCES } from "@/lib/podcast/stages";
import { getPreVerifiedFacts, saveToFactLibrary, getFactLibraryStats } from "@/lib/podcast/fact-library";

// ─── Grade Badge ─────────────────────────────────────────────────────────────
function GradeBadge({ grade }) {
  const c = FACT_CHECK_COLORS[grade];
  if (!c) return null;
  return (
    <span
      className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.hex }}
    >
      {c.label}
    </span>
  );
}

// ─── Claim Card ──────────────────────────────────────────────────────────────
function ClaimCard({ claim, blueNote, onBlueNoteChange }) {
  const [open, setOpen] = useState(false);
  const c = FACT_CHECK_COLORS[claim.grade] ?? FACT_CHECK_COLORS.YELLOW;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: c.border }}
    >
      {/* Header row */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-3 text-left transition hover:opacity-90"
        style={{ background: c.bg + "cc" }}
      >
        <div className="mt-1.5 shrink-0 h-2 w-2 rounded-full" style={{ background: c.hex }} />
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-xs font-semibold leading-snug">{claim.claim}</p>
          <p className="text-[10px] text-faint truncate">Q: {claim.question_text}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <GradeBadge grade={claim.grade} />
          {open ? <ChevronUp size={12} className="text-faint" /> : <ChevronDown size={12} className="text-faint" />}
        </div>
      </button>

      {/* Expandable detail */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t"
            style={{ borderColor: c.border }}
          >
            <div className="p-3 space-y-2.5 text-[11px]">
              {/* Source */}
              <div className="flex items-start gap-2">
                <BookOpen size={12} className="shrink-0 mt-0.5 text-faint" />
                <span className="font-bold text-faint">Source:</span>
                <span className="text-soft">{claim.source}</span>
              </div>

              {/* Evidence level badge */}
              {claim.evidence_level && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-faint uppercase tracking-wide">Evidence:</span>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      background: claim.grade === "GREEN" ? "#22c55e18" : claim.grade === "YELLOW" ? "#f59e0b18" : claim.grade === "BLUE" ? "#3b82f618" : "#ef444418",
                      color:      claim.grade === "GREEN" ? "#22c55e"   : claim.grade === "YELLOW" ? "#f59e0b"   : claim.grade === "BLUE" ? "#93c5fd"   : "#fca5a5",
                    }}>
                    {claim.evidence_level}
                  </span>
                </div>
              )}

              {/* Citation */}
              {claim.citation ? (
                <div className="rounded-lg bg-[rgb(var(--panel))] border border-[rgb(var(--border))] px-3 py-2 font-mono text-[10px] text-faint leading-relaxed">
                  {claim.citation}
                </div>
              ) : claim.grade === "BLUE" ? (
                <div className="rounded-lg bg-blue-500/8 border border-blue-500/20 px-3 py-2 text-[10px] text-blue-300 space-y-1">
                  <p className="font-bold">No Grade A or B human evidence found.</p>
                  <p className="opacity-80">This is the "Honest Doctor Moment" — Dr. Prabhakar speaks directly to camera about what science doesn't yet know. More trust-building than any influencer claiming fake Grade A data.</p>
                </div>
              ) : claim.grade === "RED" ? (
                <div className="rounded-lg bg-red-500/8 border border-red-500/20 px-3 py-2 text-[10px] text-red-300">
                  No credible human evidence — animal/in-vitro only, or contradicted by Tier-1 sources. Stage 5 decides.
                </div>
              ) : null}

              {/* Note */}
              {claim.note && <p className="text-faint leading-relaxed">{claim.note}</p>}

              {/* Script rule — YELLOW */}
              {claim.script_rule && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-500/8 border border-amber-500/20 px-3 py-2">
                  <AlertTriangle size={11} className="shrink-0 mt-0.5 text-amber-400" />
                  <p className="text-[10px] text-amber-300">
                    <span className="font-bold">Script rule: </span>{claim.script_rule}
                  </p>
                </div>
              )}

              {/* Social demand — RED */}
              {claim.social_demand && (
                <div className="flex items-start gap-2 rounded-lg bg-red-500/8 border border-red-500/20 px-3 py-2">
                  <Globe size={11} className="shrink-0 mt-0.5 text-red-400" />
                  <p className="text-[10px] text-red-300">
                    <span className="font-bold">Tamil Nadu demand: </span>{claim.social_demand}
                  </p>
                </div>
              )}

              {/* Blue note editor */}
              {claim.grade === "BLUE" && (
                <div className="space-y-2">
                  <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 px-3 py-2 text-[10px] text-blue-300/80 leading-relaxed">
                    <span className="font-bold text-blue-300">On-camera script template: </span>
                    "The internet tells you [CLAIM] is a proven fact. I checked the research — there is actually
                    zero Grade A proof for this yet. But in my clinical experience with my patients, here is
                    what I actually see…"
                  </div>
                  <p className="text-[10px] font-bold text-blue-300 flex items-center gap-1.5">
                    <Edit3 size={10} />
                    Dr. Prabhakar's clinical observation (his words, his patients)
                  </p>
                  <textarea
                    value={blueNote ?? ""}
                    onChange={(e) => onBlueNoteChange?.(e.target.value)}
                    rows={3}
                    placeholder="e.g. I have seen dozens of patients who reintroduced ghee after years of avoidance and reported improved energy and reduced joint stiffness within 4–6 weeks. No blood markers worsened in any case I observed."
                    className="w-full rounded-lg border border-blue-500/30 bg-blue-500/6 px-3 py-2 text-[11px] text-soft placeholder:text-faint/40 focus:outline-none focus:border-blue-400/50 resize-none transition"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Myth Ledger Entry ───────────────────────────────────────────────────────
function MythLedgerRow({ entry }) {
  const TYPE_STYLE = {
    disproven:             { color: "#22c55e", bg: "#22c55e10", border: "#22c55e30", label: "Myth — Disproven" },
    unsettled:             { color: "#f59e0b", bg: "#f59e0b10", border: "#f59e0b30", label: "Myth — Unsettled" },
    "unsettled-clinical":  { color: "#3b82f6", bg: "#3b82f610", border: "#3b82f630", label: "Myth — Unsettled + Clinical" },
  };
  const ts = TYPE_STYLE[entry.myth_type] ?? TYPE_STYLE.unsettled;

  return (
    <div className="rounded-xl border p-3 space-y-1.5" style={{ borderColor: ts.border, background: ts.bg }}>
      <span className="inline-block text-[10px] font-bold uppercase tracking-wide" style={{ color: ts.color }}>
        {ts.label}
      </span>
      <p className="text-xs font-semibold text-soft leading-snug">{entry.question_text}</p>
      {entry.evidence && <p className="text-[11px] text-faint leading-relaxed">{entry.evidence}</p>}
      {entry.clinical_verdict && (
        <p className="text-[11px] text-blue-300 mt-1 leading-relaxed">
          <span className="font-bold">Clinical verdict: </span>{entry.clinical_verdict}
        </p>
      )}
    </div>
  );
}

// ─── Indian Context Entry ────────────────────────────────────────────────────
function IndianContextRow({ item }) {
  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1.5">
      <div className="flex items-center gap-2">
        <Globe size={12} className="text-emerald-400 shrink-0" />
        <span className="text-xs font-bold text-emerald-300">{item.angle}</span>
      </div>
      <p className="text-[11px] text-faint leading-relaxed">{item.significance}</p>
      {item.source && (
        <p className="text-[10px] text-faint/60 font-mono">
          Source: {item.source}
        </p>
      )}
    </div>
  );
}

// ─── Grade order and labels ───────────────────────────────────────────────────
const GRADE_ORDER = ["GREEN", "YELLOW", "BLUE", "RED"];
const CHUNK_SIZE  = 5;

// ─── Helper — build confidence dashboard from raw claims ─────────────────────
function buildDashboard(claims) {
  const d = { green: 0, yellow: 0, blue: 0, red: 0, total: claims.length, approvable: true };
  claims.forEach((c) => {
    const key = c.grade?.toLowerCase();
    if (key in d) d[key]++;
  });
  d.approvable = d.red === 0;
  return d;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Stage4({ data, onComplete, demoMode }) {
  const stage3 = data?.[3];   // { foundation, audience, myth, team, all_questions, overlaps }
  const lock   = data?.[2];   // Stage 2 Topic Lock

  const [loading,       setLoading]       = useState(false);
  const [research,      setResearch]      = useState(null);
  const [error,         setError]         = useState(null);
  const [blueNotes,     setBlueNotes]     = useState({});
  const [gradeFilter,   setGradeFilter]   = useState({ GREEN: true, YELLOW: true, BLUE: true, RED: true });
  const [chunkProgress, setChunkProgress] = useState({ current: 0, total: 0, label: "" });
  const [factHits,      setFactHits]      = useState(0);   // pre-verified facts sent to Gemini this run
  const [savedCount,    setSavedCount]    = useState(0);   // new facts saved after this run
  const [modelPref,     setModelPref]     = useState(() =>
    typeof window !== "undefined" ? getModelPref(4) : "gemini"
  );
  const libStats = (typeof window !== "undefined") ? getFactLibraryStats() : { total: 0, green: 0, yellow: 0 };

  // ── Run research — chunked for live mode, single call for demo ────────────
  async function handleResearch() {
    setLoading(true);
    setError(null);
    setChunkProgress({ current: 0, total: 0, label: "" });

    const geminiKey    = (demoMode || typeof localStorage === "undefined") ? null : localStorage.getItem("V_KEY_GOOGLE");
    const anthropicKey = (demoMode || typeof localStorage === "undefined") ? null : localStorage.getItem("V_KEY_CLAUDE");
    const isDemo       = !geminiKey && !anthropicKey;

    const headers = { "Content-Type": "application/json" };
    if (geminiKey)    headers["x-client-gemini-key"]    = geminiKey;
    if (anthropicKey) headers["x-client-anthropic-key"] = anthropicKey;
    headers["x-preferred-model"] = modelPref;

    const locked_topic = lock?.locked_topic ?? "Health Topic";
    const category     = lock?.category     ?? "Myth";

    try {
      // ── Demo: single call returns full mock instantly ─────────────────────
      if (isDemo) {
        setChunkProgress({ current: 0, total: 0, label: "Loading demo research…" });
        const res = await fetch("/api/pipeline/stage4-research", {
          method: "POST",
          headers,
          body: JSON.stringify({ locked_topic, category, stage3_data: stage3 ?? null }),
        });
        if (!res.ok) throw new Error(`Research API returned ${res.status}`);
        const d = await res.json();
        if (d.error) throw new Error(d.error);
        const notes = {};
        d.claims?.filter((c) => c.grade === "BLUE").forEach((c) => { notes[c.id] = c.note ?? ""; });
        setBlueNotes(notes);
        setResearch(d);
        return;
      }

      // ── Live mode: query Fact Library first, then chunk 5 questions at a time ─
      const allQuestions       = stage3?.all_questions ?? [];
      const preVerifiedFacts   = getPreVerifiedFacts(locked_topic);
      setFactHits(preVerifiedFacts.length);

      const chunks = [];
      for (let i = 0; i < allQuestions.length; i += CHUNK_SIZE) {
        chunks.push(allQuestions.slice(i, i + CHUNK_SIZE));
      }
      const totalSteps = chunks.length + 1; // chunks + 1 summary call

      const allClaims       = [];
      let   pubmedArticles  = [];
      let   pubmedEvidence  = null;

      for (let i = 0; i < chunks.length; i++) {
        const start = i * CHUNK_SIZE + 1;
        const end   = Math.min((i + 1) * CHUNK_SIZE, allQuestions.length);
        setChunkProgress({
          current: i + 1,
          total:   totalSteps,
          label:   preVerifiedFacts.length > 0
            ? `Checking ${preVerifiedFacts.length} cached facts · Researching questions ${start}–${end}…`
            : `Researching questions ${start}–${end} of ${allQuestions.length}…`,
        });

        const res = await fetch("/api/pipeline/stage4-research", {
          method:  "POST",
          headers,
          body: JSON.stringify({
            mode:               "chunk",
            locked_topic,
            category,
            questions:          chunks[i],
            chunkIndex:         i,
            totalChunks:        chunks.length,
            pre_verified_facts: preVerifiedFacts,  // injected into Gemini prompt
          }),
        });
        if (!res.ok) throw new Error(`Research API returned ${res.status}`);
        const d = await res.json();
        if (d.mode === "error" || d.error) throw new Error(d.error ?? "API error on batch " + (i + 1));
        allClaims.push(...(d.claims ?? []));
        // Capture PubMed data from first chunk (same for all chunks — fetched once server-side)
        if (i === 0 && d.pubmed_articles?.length) {
          pubmedArticles = d.pubmed_articles;
          pubmedEvidence = d.pubmed_evidence ?? null;
        }
      }

      // ── Summary: myth ledger + indian context + critic pass + dashboard ───
      setChunkProgress({
        current: totalSteps,
        total:   totalSteps,
        label:   "Building Myth Ledger & Confidence Dashboard…",
      });

      const summaryRes = await fetch("/api/pipeline/stage4-research", {
        method:  "POST",
        headers,
        body: JSON.stringify({ mode: "summary", locked_topic, claims: allClaims }),
      });
      if (!summaryRes.ok) throw new Error(`Summary API returned ${summaryRes.status}`);
      const summary = await summaryRes.json();
      if (summary.mode === "error" || summary.error) throw new Error(summary.error ?? "Summary step failed");

      const finalResult = {
        claims:               allClaims,
        myth_ledger:          summary.myth_ledger          ?? [],
        indian_context:       summary.indian_context       ?? [],
        critic_pass:          summary.critic_pass          ?? { status: "passed", flags: [] },
        confidence_dashboard: summary.confidence_dashboard ?? buildDashboard(allClaims),
        mode:                 summary.mode,
        pubmed_articles:      pubmedArticles,
        pubmed_evidence:      pubmedEvidence,
      };

      // ── Save new GREEN/YELLOW claims to Fact Library for future episodes ─
      const newlySaved = saveToFactLibrary(allClaims, locked_topic);
      setSavedCount(newlySaved);

      const notes = {};
      finalResult.claims.filter((c) => c.grade === "BLUE").forEach((c) => { notes[c.id] = c.note ?? ""; });
      setBlueNotes(notes);
      setResearch(finalResult);

    } catch (e) {
      setError(e.message || "Research failed — check your API key or try demo mode");
    } finally {
      setLoading(false);
      setChunkProgress({ current: 0, total: 0, label: "" });
    }
  }

  // ── Approve ───────────────────────────────────────────────────────────────
  function handleApprove() {
    const updatedClaims = research.claims.map((c) =>
      c.grade === "BLUE" ? { ...c, clinical_note: blueNotes[c.id] ?? c.note } : c
    );
    onComplete({ ...research, claims: updatedClaims, blue_notes: blueNotes });
  }

  // ── Derived state ─────────────────────────────────────────────────────────
  const cd = research?.confidence_dashboard;

  const claimsByGrade = GRADE_ORDER.reduce((acc, g) => {
    acc[g] = research?.claims?.filter((c) => c.grade === g) ?? [];
    return acc;
  }, {});

  const blueClaims = claimsByGrade.BLUE;

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-bold">Research — The Authority Firewall</h2>
          <ShieldCheck size={18} className="text-emerald-400" />
        </div>
        <p className="text-sm text-faint">
          Every factual claim is verified against the trusted source whitelist.
          No claim may enter a Doctor Farmer script without a named credible source — or an explicit no-source flag.
        </p>
      </div>

      {/* ── Trusted Sources + Fact Library stats ────────────────────────── */}
      <div className="flex gap-2 flex-wrap items-center">
        {TRUSTED_SOURCES.map((s) => (
          <div key={s.id}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/6 px-3 py-1.5 text-[11px]">
            <ShieldCheck size={11} className="text-emerald-400" />
            <span className="font-bold text-emerald-300">{s.label}</span>
          </div>
        ))}

        {/* Fact Library memory indicator */}
        {libStats.total > 0 && (
          <div className="ml-auto flex items-center gap-1.5 rounded-lg border border-violet-500/25 bg-violet-500/6 px-3 py-1.5 text-[11px]">
            <BookOpen size={11} className="text-violet-400" />
            <span className="font-bold text-violet-300">Fact Library:</span>
            <span className="text-violet-300/70">{libStats.green} GREEN · {libStats.yellow} YELLOW cached</span>
          </div>
        )}
      </div>

      {/* ── Not yet run ──────────────────────────────────────────────────── */}
      {!research && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 text-center space-y-4">

          {lock?.locked_topic && (
            <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-faint mb-0.5">Topic to research</p>
              <p className="text-sm font-bold">{lock.locked_topic}</p>
              {stage3?.all_questions && (
                <p className="text-[11px] text-faint mt-0.5">
                  {stage3.all_questions.length} questions from Stage 3
                </p>
              )}
            </div>
          )}

          <div className="text-4xl">🔬</div>
          <div>
            <p className="text-sm font-semibold mb-1">Run the Authority Firewall</p>
            <p className="text-xs text-faint max-w-sm mx-auto">
              The system will run Claim Planning → Source Hunting → Claim Verification & Grading →
              Myth Ledger → Indian Context → Critic Pass.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/8 px-4 py-2.5 text-xs text-red-300 text-left">
              <AlertCircle size={13} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <ModelToggle stageNum={4} onChange={setModelPref} disabled={loading} />
          <button onClick={handleResearch}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white transition hover:brightness-110 mx-auto">
            <FlaskConical size={14} /> Run Research
          </button>
        </motion.div>
      )}

      {/* ── Loading ──────────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 space-y-5">
          <div className="flex items-center gap-3">
            <Loader2 size={20} className="animate-spin text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Running Authority Firewall…</p>
              <p className="text-xs text-faint mt-0.5">
                Questions are researched in batches of {CHUNK_SIZE} to stay within API limits.
              </p>
            </div>
          </div>

          {/* Progress bar — only shown when chunks are actively running */}
          {chunkProgress.total > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-faint">{chunkProgress.label}</span>
                <span className="font-bold text-emerald-400">
                  {chunkProgress.current} / {chunkProgress.total}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[rgb(var(--bg-soft))] overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.round((chunkProgress.current / chunkProgress.total) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-faint">
                <span>Claim Planning · Source Hunting · 4-Colour Grading</span>
                <span>{Math.round((chunkProgress.current / chunkProgress.total) * 100)}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {research && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

            {/* Fact Library memory summary */}
            {(factHits > 0 || savedCount > 0) && (
              <div className="flex gap-3">
                {factHits > 0 && (
                  <div className="flex items-center gap-2 rounded-xl border border-violet-500/25 bg-violet-500/6 px-3 py-2 flex-1 text-[11px]">
                    <BookOpen size={12} className="text-violet-400 shrink-0" />
                    <span className="text-violet-300">
                      <span className="font-bold">{factHits}</span> pre-verified fact{factHits !== 1 ? "s" : ""} from Fact Library checked — Gemini skipped re-searching matching claims
                    </span>
                  </div>
                )}
                {savedCount > 0 && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/6 px-3 py-2 flex-1 text-[11px]">
                    <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
                    <span className="text-emerald-300">
                      <span className="font-bold">{savedCount}</span> new fact{savedCount !== 1 ? "s" : ""} saved to Fact Library — future episodes on this topic will be faster
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ── Live PubMed Articles Panel ────────────────────────────── */}
            {research.pubmed_articles?.length > 0 && (
              <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-cyan-400 shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-cyan-300">Live PubMed Evidence</span>
                    <span className="ml-2 text-[10px] text-cyan-400/70">
                      {research.pubmed_evidence
                        ? `${research.pubmed_evidence.totalCount} papers found · ${research.pubmed_evidence.label}`
                        : `${research.pubmed_articles.length} real articles retrieved`}
                    </span>
                  </div>
                  <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                    NCBI · PubMed
                  </span>
                </div>
                <div className="space-y-2">
                  {research.pubmed_articles.slice(0, 5).map((a) => (
                    <a
                      key={a.pmid}
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2.5 rounded-lg border border-cyan-500/15 bg-[rgb(var(--panel))] px-3 py-2 text-[10px] hover:border-cyan-400/40 transition-colors group"
                    >
                      <ExternalLink size={9} className="mt-0.5 shrink-0 text-faint group-hover:text-cyan-400 transition-colors" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-soft leading-tight line-clamp-2 group-hover:text-cyan-300 transition-colors">
                          {a.title}
                        </p>
                        <p className="mt-0.5 text-faint">
                          {a.journal}{a.year ? ` · ${a.year}` : ""}
                          {a.articleTypes?.length ? ` · ${a.articleTypes.slice(0,2).join(", ")}` : ""}
                          {a.pmid ? ` · PMID ${a.pmid}` : ""}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
                <p className="text-[10px] text-faint/60">
                  These real citations were injected into the AI prompt to ground claim grading in verified NCBI data.
                </p>
              </div>
            )}

            {/* Confidence Dashboard */}
            {cd && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-faint mb-3">
                  Confidence Dashboard — {cd.total} claims graded
                </p>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {GRADE_ORDER.map((grade) => {
                    const c     = FACT_CHECK_COLORS[grade];
                    const count = cd[grade.toLowerCase()] ?? 0;
                    const on    = gradeFilter[grade];
                    return (
                      <button key={grade}
                        onClick={() => setGradeFilter((prev) => ({ ...prev, [grade]: !prev[grade] }))}
                        className="rounded-xl border p-3 text-center transition hover:brightness-110"
                        style={{
                          borderColor: c.border,
                          background:  on ? c.bg : "transparent",
                          opacity:     on ? 1 : 0.4,
                        }}>
                        <div className="text-2xl font-black leading-none mb-0.5" style={{ color: c.hex }}>{count}</div>
                        <div className="text-[10px] font-bold" style={{ color: c.hex }}>{grade}</div>
                        <div className="text-[9px] text-faint mt-0.5">{on ? "shown" : "hidden"}</div>
                      </button>
                    );
                  })}
                </div>
                {!cd.approvable && (
                  <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/8 px-3 py-2.5 text-[11px] text-amber-300">
                    <AlertTriangle size={11} className="shrink-0" />
                    RED claims present — Stage 5 must decide action for each before this episode can proceed.
                  </div>
                )}
              </div>
            )}

            {/* Critic Pass */}
            {research.critic_pass && (
              <div className={`rounded-xl border p-4 space-y-2 ${
                research.critic_pass.status === "passed"
                  ? "border-emerald-500/30 bg-emerald-500/6"
                  : "border-red-500/30 bg-red-500/6"
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14}
                    className={research.critic_pass.status === "passed" ? "text-emerald-400" : "text-red-400"} />
                  <span className={`text-xs font-bold ${
                    research.critic_pass.status === "passed" ? "text-emerald-300" : "text-red-300"
                  }`}>
                    Critic Pass — {research.critic_pass.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-faint">Second agent reviewed the full brief and flagged:</p>
                <div className="space-y-1">
                  {research.critic_pass.flags?.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-amber-300">
                      <AlertTriangle size={11} className="shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Claims by grade */}
            {GRADE_ORDER.map((grade) => {
              const claims = claimsByGrade[grade];
              if (!claims.length || !gradeFilter[grade]) return null;
              const c = FACT_CHECK_COLORS[grade];
              return (
                <div key={grade}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-faint mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full inline-block shrink-0" style={{ background: c.hex }} />
                    {grade} Claims ({claims.length})
                    {grade === "BLUE" && (
                      <span className="font-normal text-blue-300/70 normal-case">Honest Doctor Moments — no Grade A evidence exists · biggest trust builder</span>
                    )}
                    {grade === "RED" && (
                      <span className="font-normal text-red-300/70 normal-case">Stage 5 decision required</span>
                    )}
                  </p>
                  <div className="space-y-2">
                    {claims.map((claim) => (
                      <ClaimCard
                        key={claim.id}
                        claim={claim}
                        blueNote={blueNotes[claim.id]}
                        onBlueNoteChange={
                          claim.grade === "BLUE"
                            ? (v) => setBlueNotes((prev) => ({ ...prev, [claim.id]: v }))
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Myth Ledger */}
            {research.myth_ledger?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-faint mb-3">
                  Myth Ledger — {research.myth_ledger.length} myths classified
                </p>
                <div className="space-y-2">
                  {research.myth_ledger.map((m, i) => (
                    <MythLedgerRow key={i} entry={m} />
                  ))}
                </div>
              </div>
            )}

            {/* Indian Context */}
            {research.indian_context?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-faint mb-3">
                  Indian Context — {research.indian_context.length} local angles
                </p>
                <div className="space-y-2">
                  {research.indian_context.map((item) => (
                    <IndianContextRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Blue claim note reminder */}
            {blueClaims.length > 0 && (
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/6 p-4">
                <div className="flex items-start gap-3">
                  <Edit3 size={15} className="shrink-0 mt-0.5 text-blue-400" />
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-blue-300">
                      {blueClaims.length} Honest Doctor Moment{blueClaims.length > 1 ? "s" : ""} — Zero Grade A Evidence Found
                    </p>
                    <p className="text-[11px] text-faint leading-relaxed">
                      These are your most powerful content moments. Influencers fake Grade A data.
                      Dr. Prabhakar looks at the camera and says{" "}
                      <span className="text-blue-300 italic">"I checked the research — science doesn't know for sure yet. But here's what I see in my clinic."</span>
                      {" "}That honesty is what builds trust and sells the reversal programs.
                    </p>
                    <p className="text-[11px] text-faint">
                      Click each blue claim above to enter Dr. Prabhakar's clinical observation in his own words.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Approve gate */}
            <div className="rounded-xl border border-emerald-500/30 bg-[rgb(var(--bg-soft))] p-4">
              <div className="flex items-start gap-3 mb-3">
                <ShieldAlert size={16} className="shrink-0 mt-0.5 text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-emerald-300">This gate is the medical authority firewall.</p>
                  <p className="text-[11px] text-faint mt-0.5">
                    Review every claim and colour code before approving. Recommended: Super Admin only.
                    {cd?.red > 0 && (
                      <span className="text-amber-300 ml-1">
                        {cd.red} RED claim{cd.red > 1 ? "s" : ""} will go to Stage 5 for decisions.
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-cyan">Approve research brief</p>
                  <p className="text-[11px] text-faint mt-0.5">
                    Locks the fact-check layer. No new facts can be added after this point.
                  </p>
                </div>
                <button
                  onClick={handleApprove}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-cyan px-5 py-2.5 text-sm font-bold text-navy-950 transition hover:brightness-110"
                >
                  Approve &amp; Continue <ChevronRight size={14} />
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
