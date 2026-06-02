"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Check, Copy, ArrowRight,
  FlaskConical, Users, Lightbulb, Zap, Target, MessageSquare,
  BookOpen, Layers, FileText, Edit3, CheckCircle2, Sparkles,
  ShieldCheck, Palette, HelpCircle, Compass, Sprout,
} from "lucide-react";

// ─── Animation variants ────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir) => ({
    x: dir > 0 ? -48 : 48,
    opacity: 0,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  }),
};

// ─── Stepper config ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Raw Translation", sublabel: "Levels 1–3",  icon: FlaskConical },
  { id: 2, label: "Master Content",  sublabel: "~250 words",  icon: FileText     },
  { id: 3, label: "Master Blueprint", sublabel: "Level 4",    icon: Layers       },
];

// ─── Blueprint card system ─────────────────────────────────────────────────
// Placeholders guide toward the Evidence-Based Narrative Engine rules.
const BLUEPRINT_CARDS = [
  {
    id: "hook", label: "Hook", sublabel: "First 3 seconds", icon: Zap,
    accent: "#22d3ee", bg: "rgba(34,211,238,0.06)", ring: "rgba(34,211,238,0.25)",
    placeholder:
      "There is a detail about [topic] that rarely gets discussed — and it may explain why results can be inconsistent even when people are putting in genuine effort.",
  },
  {
    id: "problem", label: "Problem", sublabel: "The tension", icon: Target,
    accent: "#f87171", bg: "rgba(248,113,113,0.06)", ring: "rgba(248,113,113,0.25)",
    placeholder:
      "One often-overlooked aspect of [topic] is how individual variation plays a larger role than most people expect. Use balanced language — 'may contribute', 'less discussed', 'worth understanding'.",
  },
  {
    id: "fact", label: "Fact", sublabel: "Science anchor", icon: FlaskConical,
    accent: "#a78bfa", bg: "rgba(167,139,250,0.06)", ring: "rgba(167,139,250,0.25)",
    placeholder:
      "Research suggests… / Current evidence supports… — use cautious, honest wording. Distinguish strong evidence from emerging findings. No 'proves' or 'guaranteed'.",
  },
  {
    id: "solution", label: "Solution", sublabel: "Practical direction", icon: Lightbulb,
    accent: "#34d399", bg: "rgba(52,211,153,0.06)", ring: "rgba(52,211,153,0.25)",
    placeholder:
      "An evidence-informed approach typically focuses on… — practical, sustainable, individually adjusted. Avoid miracle language. No guaranteed outcomes.",
  },
  {
    id: "cta", label: "CTA", sublabel: "Human engagement", icon: MessageSquare,
    accent: "#fbbf24", bg: "rgba(251,191,36,0.06)", ring: "rgba(251,191,36,0.25)",
    placeholder:
      "What has your experience with [topic] been like? — conversational, curious, human. Invite dialogue, not aggressive follow/subscribe pressure.",
  },
];

// ─── Evidence Translation Engine — section definitions ───────────────────
// The 7 structured sections that transform research → human understanding.
const TRANSLATION_SECTIONS = [
  {
    key: "coreScientificMeaning",
    label: "Core Scientific Meaning",
    sublabel: "Strongest single takeaway",
    icon: FlaskConical,
    color: "#a78bfa",
    rows: 3,
    hint: 'Good: "Current evidence suggests…" / "Research indicates…"  ·  Avoid: "Science proved", "Guaranteed"',
  },
  {
    key: "humanInterpretation",
    label: "Human Interpretation",
    sublabel: "What it means in daily life",
    icon: Users,
    color: "#22d3ee",
    rows: 3,
    hint: "Focus on energy, habits, recovery, decisions, emotions, performance — real-world experience.",
  },
  {
    key: "commonMisunderstanding",
    label: "Common Misunderstanding",
    sublabel: "What people get wrong",
    icon: HelpCircle,
    color: "#f87171",
    rows: 2,
    hint: 'Good: "Many people assume…" / "One common oversimplification is…"  ·  Never attack mainstream advice aggressively.',
  },
  {
    key: "practicalRelevance",
    label: "Practical Relevance",
    sublabel: "Why it matters",
    icon: Compass,
    color: "#34d399",
    rows: 2,
    hint: "Focus on daily outcomes, sustainability, consistency, long-term behaviour. Avoid miracle claims.",
  },
  {
    key: "audienceLens",
    label: "Audience Lens",
    sublabel: "Emotional experience",
    icon: Target,
    color: "#fbbf24",
    rows: 2,
    hint: "Frustrations, confusion, hopes, motivations, fears, desires — how does the audience feel this issue?",
  },
  {
    key: "analogy",
    label: "Analogy Engine",
    sublabel: "Simple mental model",
    icon: Lightbulb,
    color: "#e879f9",
    rows: 2,
    hint: 'Keep it visual and memorable. E.g.: "Think of it like a dimmer switch rather than an on/off button."',
  },
  {
    key: "narrativeSeeds",
    label: "Narrative Seeds",
    sublabel: "Story angles for downstream",
    icon: Sprout,
    color: "#fb923c",
    rows: 3,
    hint: "Curiosity angles, emotional tensions, audience questions, misconception hooks, practical conflicts.",
  },
];

// ─── Derive dynamic initial state from topic + research ───────────────────
// Called once on mount via lazy useState initializer.
// Returns rawTranslation (7 sections) + blueprint (5 beats).
// All language follows Evidence-Based Narrative Engine rules:
//   • No sensationalism  • Cautious wording  • Balanced framing  • No fearmongering
function deriveInitials(topic, research) {
  const t = (topic || "this topic").trim();
  const finding = research?.keyFinding || research?.summary || "";

  // ── 7-section Evidence Translation Engine ─────────────────────────────
  const rawTranslation = {
    // 1. Core Scientific Meaning — concise, nuanced, evidence-aware
    coreScientificMeaning:
      finding
        ? finding
        : `Current evidence suggests ${t} plays a meaningful role in overall health and function — though the full picture is more nuanced than most general advice conveys.`,

    // 2. Human Interpretation — daily life relevance
    humanInterpretation:
      `Two people can engage with ${t} in similar ways and experience noticeably different outcomes. ` +
      `Individual factors — including stress load, sleep quality, baseline habits, and metabolic context — ` +
      `appear to influence how much benefit people actually observe in practice.`,

    // 3. Common Misunderstanding — balanced, educational, never insulting
    commonMisunderstanding:
      `Many people assume that a single, universal approach to ${t} will produce consistent results for everyone. ` +
      `Online discussions often focus heavily on one variable while underestimating how interconnected ` +
      `the relevant systems tend to be.`,

    // 4. Practical Relevance — sustainable, specific, no miracle framing
    practicalRelevance:
      `Understanding the nuance around ${t} matters most for people who have tried general recommendations ` +
      `without seeing the results they expected. Small, well-targeted adjustments — applied consistently ` +
      `over time — tend to outperform dramatic interventions that are difficult to sustain.`,

    // 5. Audience Lens — emotional framing, not demographic labels
    audienceLens:
      `Many health-conscious people feel a quiet frustration when they do "everything right" around ${t} ` +
      `and still do not see the results they were hoping for. There is a mix of confusion, hope, and ` +
      `mild distrust of oversimplified advice — and a genuine desire for information that respects their intelligence.`,

    // 6. Analogy Engine — visual, memorable, not childish
    analogy:
      `Think of ${t} like a dial rather than an on/off switch — small, well-targeted adjustments ` +
      `in the right direction tend to produce steadier results than dramatic changes that are ` +
      `difficult to sustain over time.`,

    // 7. Narrative Seeds — angles for downstream storytelling
    narrativeSeeds:
      `• Why do some people respond very differently to the same approach?\n` +
      `• What general advice about ${t} quietly leaves out\n` +
      `• The gap between what research actually says and what gets simplified online\n` +
      `• How individual context shapes outcomes more than most people realise`,
  };

  // ── 5-beat Master Blueprint — Evidence-Based Narrative Engine ─────────
  const blueprint = {
    // HOOK: specific real-world consequence, curious but not clickbait
    hook:
      `There is a detail about ${t} that rarely gets discussed — and it may explain ` +
      `why results can be inconsistent even when people are putting in genuine effort.`,

    // PROBLEM: "often overlooked", balanced — no "mainstream is wrong"
    problem:
      `One often-overlooked aspect of ${t} is how individual variation plays a larger ` +
      `role than many people expect. What works reliably on average may not translate ` +
      `directly to every context — and that gap is worth understanding.`,

    // FACT: "Research suggests" / "Current evidence supports" — cautious, honest
    fact:
      finding
        ? `Research suggests: ${finding}`
        : `Current evidence supports the idea that ${t} may influence several interconnected ` +
          `pathways simultaneously — which helps explain why a more targeted approach often ` +
          `produces more consistent outcomes than broad, general guidance alone.`,

    // SOLUTION: practical direction, no guaranteed results, no miracle framing
    solution:
      `An evidence-informed approach to ${t} typically focuses on a small number of ` +
      `well-studied strategies that are practical to apply consistently. The emphasis ` +
      `is on sustainable habits over short-term fixes — and on adjusting based on ` +
      `individual response rather than following a one-size-fits-all protocol.`,

    // CTA: natural, conversational — no aggressive marketing
    cta:
      `What has your experience with ${t} been like? I am curious what has actually ` +
      `made a difference for you — feel free to share in the comments.`,
  };

  return { rawTranslation, blueprint };
}

// ─── Build ~250-word Master Content narrative from Raw Translation ─────────
// Produces a seamless narrative mini-essay (NOT a rigid 5-paragraph structure).
// Rules:
//   • Starts in media res — audience frustration / common misconception
//   • Introduces scientific nuance as a shift in perspective
//   • Weaves analogy naturally into explanation (conversational)
//   • Ends with a grounded open question / reflection — not promotional
//   • No subheadings, no bullet points, no bold labels
//   • Sounds like a human expert speaking to a respected peer
//   • Evidence-based voice throughout
function buildMasterContentFromRaw(rawTranslation, topic) {
  const t = (topic || "this topic").trim();
  const {
    coreScientificMeaning,
    humanInterpretation,
    commonMisunderstanding,
    practicalRelevance,
    audienceLens,
    analogy,
    narrativeSeeds,
  } = rawTranslation || {};

  const parts = [];

  // ── Para 1: Start IN MEDIA RES — audience frustration or misconception ──
  // This pulls the reader in from where they already are emotionally.
  if (commonMisunderstanding?.trim()) {
    parts.push(commonMisunderstanding.trim());
  } else if (audienceLens?.trim()) {
    parts.push(audienceLens.trim());
  } else {
    parts.push(
      `Most conversations about ${t} start at the same place — a single variable, ` +
      `a universal recommendation, the assumption that one approach fits most situations. ` +
      `That framing is understandable, but it skips over something important.`
    );
  }

  // ── Para 2: Scientific perspective shift — the nuance the reader hasn't heard ──
  const scienceParts = [coreScientificMeaning, humanInterpretation]
    .map((s) => s?.trim())
    .filter(Boolean);
  if (scienceParts.length) {
    parts.push(scienceParts.join(" "));
  } else {
    parts.push(
      `Current evidence suggests ${t} interacts with a broader range of individual factors ` +
      `than most simplified guidance acknowledges — which begins to explain why results ` +
      `can vary so significantly between people following similar habits.`
    );
  }

  // ── Para 3: Analogy woven in naturally ────────────────────────────────
  if (analogy?.trim()) {
    parts.push(analogy.trim());
  }

  // ── Para 4: Practical direction — what this actually means for behaviour ─
  if (practicalRelevance?.trim()) {
    parts.push(practicalRelevance.trim());
  } else {
    parts.push(
      `An evidence-informed approach to ${t} typically means working with a small number of ` +
      `well-studied strategies — applied consistently, adjusted for individual context, ` +
      `and evaluated over time rather than measured by immediate results.`
    );
  }

  // ── Para 5: Closing open question — grounded, not promotional ─────────
  // Pull from the first narrative seed if available.
  const firstSeed = narrativeSeeds?.split("\n")?.[0]
    ?.replace(/^[•·\-\*]\s*/, "")
    ?.trim();

  if (firstSeed && firstSeed.length > 20) {
    parts.push(firstSeed.endsWith("?") ? firstSeed : `${firstSeed}.`);
  } else {
    parts.push(
      `The more useful question is not whether ${t} matters — it is why individual ` +
      `responses differ so much, and what that tells us about how to approach it more thoughtfully.`
    );
  }

  return parts.join("\n\n");
}

// ─── Word count helper ──────────────────────────────────────────────────────
function wordCount(text) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

// ─────────────────────────────────────────────────────────────────────────
// Main Wizard Component
// ─────────────────────────────────────────────────────────────────────────
export default function StorybuilderWizard({
  topic,
  research,
  audienceData,
  activeLens,        // enrichmentModule id string e.g. "enrichment_cinema"
  enrichmentModules, // ENRICHMENT_MODULES array for metadata lookup
  onBack,
  onApprove,         // called with payload: { blueprint, rawTranslation, activeLens, masterContent }
}) {
  const [step, setStep]           = useState(1);
  const [direction, setDirection] = useState(1);
  const [copied, setCopied]       = useState(false);

  // ── Lazy-initialise from live topic + research props ───────────────────
  const initials = useMemo(
    () => deriveInitials(topic, research),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // only on mount — intentional lazy init
  );

  const [rawTranslation, setRawTranslation] = useState(initials.rawTranslation);
  const [blueprint,      setBlueprint]      = useState(initials.blueprint);

  function updateTranslation(key, value) {
    setRawTranslation((prev) => ({ ...prev, [key]: value }));
  }

  // ── Master Content (Step 2) ─────────────────────────────────────────
  const [masterContent, setMasterContent] = useState("");

  // Auto-build master content the first time Step 2 opens
  useEffect(() => {
    if (step === 2 && !masterContent.trim()) {
      setMasterContent(buildMasterContentFromRaw(rawTranslation, topic));
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Active lens metadata ─────────────────────────────────────────────
  const activeLensData = useMemo(() => {
    if (!activeLens || !enrichmentModules?.length) return null;
    return enrichmentModules.find((m) => m.id === activeLens) || null;
  }, [activeLens, enrichmentModules]);

  // ── Navigation ───────────────────────────────────────────────────────
  function goTo(next) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  // ── Approve → pass full payload to parent ────────────────────────────
  function handleApprove() {
    onApprove({ blueprint, rawTranslation, activeLens, masterContent });
  }

  // ── Copy master content ──────────────────────────────────────────────
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(masterContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }).catch(() => {});
  }, [masterContent]);

  const wc = wordCount(masterContent);

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">

      {/* ── Wizard header ── */}
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 ring-1 ring-cyan-500/30">
              <Sparkles size={16} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold leading-tight text-strong">
                Storybuilder
              </h2>
              <p className="text-[11px] text-faint">Stage 4 · Content Synthesis Wizard</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeLensData && (
              <div className="hidden items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 sm:flex">
                <span className="text-sm leading-none">{activeLensData.icon}</span>
                <span className="text-[11px] font-semibold text-violet-300">{activeLensData.name}</span>
              </div>
            )}
            <div className="hidden shrink-0 items-center gap-1.5 rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-3 py-1 sm:flex">
              <BookOpen size={11} className="text-faint" />
              <span className="max-w-[180px] truncate text-[11px] font-medium text-soft">
                {topic || "No topic set"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Step progress ── */}
        <div className="mt-4 flex items-center gap-2">
          {STEPS.map((s, idx) => {
            const done   = step > s.id;
            const active = step === s.id;
            const Icon   = s.icon;
            return (
              <div key={s.id} className="flex flex-1 items-center gap-2">
                <button
                  onClick={() => done && goTo(s.id)}
                  disabled={!done}
                  className={`flex flex-1 items-center gap-2 rounded-xl px-3 py-2 text-left transition-all ${
                    active ? "bg-gradient-to-r from-cyan-500/15 to-violet-500/10 ring-1 ring-cyan-500/30"
                    : done  ? "cursor-pointer hover:bg-emerald-500/8"
                    : "opacity-40"
                  }`}
                >
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    done   ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                    : active ? "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40"
                    : "bg-[rgb(var(--bg-soft))] text-faint"
                  }`}>
                    {done ? <Check size={12} /> : <Icon size={12} />}
                  </div>
                  <div className="min-w-0">
                    <div className={`truncate text-[11px] font-bold leading-tight ${
                      active ? "text-strong" : done ? "text-emerald-400" : "text-faint"
                    }`}>{s.label}</div>
                    <div className="text-[9px] text-faint">{s.sublabel}</div>
                  </div>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={`h-px w-4 flex-shrink-0 transition-colors ${
                    done ? "bg-emerald-500/40" : "bg-[rgb(var(--border))]"
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Animated views ── */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={step} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit">
            {step === 1 && (
              <View1RawTranslation
                topic={topic}
                research={research}
                audienceData={audienceData}
                rawTranslation={rawTranslation}
                updateTranslation={updateTranslation}
                onBack={onBack}
                onNext={() => goTo(2)}
              />
            )}
            {step === 2 && (
              <View2MasterContent
                masterContent={masterContent}
                setMasterContent={setMasterContent}
                activeLensData={activeLensData}
                wordCount={wc}
                copied={copied}
                onCopy={handleCopy}
                onBack={() => goTo(1)}
                onNext={() => goTo(3)}
              />
            )}
            {step === 3 && (
              <View3MasterBlueprint
                blueprint={blueprint}
                setBlueprint={setBlueprint}
                activeLensData={activeLensData}
                onBack={() => goTo(2)}
                onApprove={handleApprove}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// VIEW 1 — RAW TRANSLATION (Evidence Translation Engine — 7 Sections)
// ─────────────────────────────────────────────────────────────────────────
function View1RawTranslation({
  topic, research, audienceData,
  rawTranslation, updateTranslation,
  onBack, onNext,
}) {
  const scientificFact =
    research?.keyFinding ||
    "No verified finding yet — run Stage 3 Med Verify to retrieve peer-reviewed evidence for this topic.";

  const t = (topic || "this topic").trim();

  // Derive audience rows from audienceData (Stage 2) if available
  const targetAudienceLines = audienceData
    ? [
        { label: "Primary Segment",   value: audienceData.primarySegment   || audienceData.segment   || "Health-conscious adults"        },
        { label: "Pain Point",        value: audienceData.painPoint                                  || `Challenges related to ${t}`     },
        { label: "Awareness Level",   value: audienceData.awarenessLevel                             || "Problem-aware, solution-seeking" },
        { label: "Content Goal",      value: audienceData.contentGoal                                || "Educate → trust → action"       },
        { label: "Emotional Trigger", value: audienceData.emotionalTrigger  || audienceData.emotion  || "Frustration, hope, curiosity"   },
      ]
    : [
        { label: "Primary Segment",   value: "Health-conscious adults"        },
        { label: "Pain Point",        value: `Challenges related to ${t}`     },
        { label: "Awareness Level",   value: "Problem-aware, solution-seeking" },
        { label: "Content Goal",      value: "Educate → trust → action"       },
        { label: "Emotional Trigger", value: "Frustration, hope, curiosity"   },
      ];

  return (
    <div className="flex flex-col gap-4">

      {/* ── Header banner ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-5 py-3">
        <FlaskConical size={14} className="shrink-0 text-violet-400" />
        <div className="flex-1">
          <p className="text-xs text-soft">
            <span className="font-bold text-strong">Evidence Translation Engine</span>
            {" "}— transform research into human understanding without losing scientific integrity.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1">
          <ShieldCheck size={10} className="text-emerald-400" />
          <span className="text-[10px] font-semibold text-emerald-400">7 Sections</span>
        </div>
      </div>

      {/* ── Verified Research (read-only anchor) ──────────────────────── */}
      <div className="rounded-2xl border border-amber-500/20 bg-[rgb(var(--panel))] p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/15">
            <CheckCircle2 size={12} className="text-amber-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90">
            Verified Research Input
          </span>
          <span className="ml-auto text-[9px] text-faint">Med Verify · Stage 3</span>
        </div>
        <p className="text-xs leading-relaxed text-soft">{scientificFact}</p>
      </div>

      {/* ── Target Audience (from Stage 2) ────────────────────────────── */}
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/15">
            <Users size={12} className="text-violet-400" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-faint">Target Audience</span>
          <span className="ml-auto rounded-full bg-violet-500/10 px-2 py-0.5 text-[9px] font-semibold text-violet-400 ring-1 ring-violet-500/20">
            {audienceData ? "From Stage 2" : "Auto-derived"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
          {targetAudienceLines.map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-0.5 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-3 py-2"
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-faint">{row.label}</span>
              <span className="text-[11px] font-semibold leading-snug text-strong">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7 Evidence Translation Engine sections ─────────────────────── */}
      <div className="flex flex-col gap-3">
        {TRANSLATION_SECTIONS.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <motion.div
              key={sec.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.045, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden rounded-2xl border bg-[rgb(var(--panel))]"
              style={{ borderColor: `${sec.color}35` }}
            >
              {/* Section header */}
              <div
                className="flex items-center gap-2.5 border-b px-4 py-2.5"
                style={{ borderColor: `${sec.color}20`, background: `${sec.color}08` }}
              >
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${sec.color}20`, color: sec.color }}
                >
                  <Icon size={12} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-strong">{sec.label}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                    style={{ background: `${sec.color}18`, color: sec.color }}
                  >
                    {sec.sublabel}
                  </span>
                </div>
                <div className="ml-auto text-[9px] font-bold text-faint">
                  {idx + 1} / {TRANSLATION_SECTIONS.length}
                </div>
              </div>

              {/* Editable textarea */}
              <div className="px-4 pb-3 pt-3">
                <textarea
                  value={rawTranslation[sec.key] || ""}
                  onChange={(e) => updateTranslation(sec.key, e.target.value)}
                  rows={sec.rows}
                  className="w-full resize-none bg-transparent text-sm leading-relaxed text-strong outline-none placeholder:text-faint"
                  placeholder={sec.hint}
                />
                <p className="mt-1 text-[10px] leading-relaxed text-faint">{sec.hint}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between gap-3">
        <button onClick={onBack} className="btn btn-ghost flex items-center gap-2 px-4 py-2.5 text-sm">
          <ChevronLeft size={15} />
          Back to Stage 3
        </button>
        <button onClick={onNext} className="btn btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
          Approve Raw Translation
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// VIEW 2 — MASTER CONTENT (~250 words)
// Single seamless narrative essay — NOT a rigid 5-paragraph structure.
// Seeds ALL downstream formats.
// ─────────────────────────────────────────────────────────────────────────
function View2MasterContent({
  masterContent, setMasterContent,
  activeLensData,
  wordCount: wc,
  copied, onCopy,
  onBack, onNext,
}) {
  const TARGET = 250;
  const pct = Math.min(100, Math.round((wc / TARGET) * 100));

  const barColor =
    wc < 150  ? "#f59e0b" :
    wc < 200  ? "#22d3ee" :
    wc < 300  ? "#34d399" :
                "#a78bfa";

  const countColor =
    wc < 150  ? "text-amber-400" :
    wc < 200  ? "text-cyan-400"  :
    wc < 300  ? "text-emerald-400" :
                "text-violet-400";

  return (
    <div className="flex flex-col gap-4">

      {/* Active Modifiers badge */}
      {activeLensData && <ActiveModifiersBadge lens={activeLensData} />}

      {/* Master Content editor */}
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/15">
            <FileText size={12} className="text-emerald-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-faint">Master Content</span>
          <div className="ml-auto flex items-center gap-2">
            <span className={`text-[12px] font-bold tabular-nums ${countColor}`}>{wc}</span>
            <span className="text-[10px] text-faint">/ ~{TARGET} words</span>
          </div>
        </div>

        {/* Word-count progress bar */}
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-[rgb(var(--bg-soft))]">
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${pct}%`, backgroundColor: barColor }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {/* Narrative quality note */}
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/6 px-3 py-2.5">
          <Edit3 size={11} className="mt-0.5 shrink-0 text-emerald-400" />
          <p className="text-[11px] leading-relaxed text-emerald-400/90">
            <span className="font-semibold">Narrative Essay format</span> — starts in media res with your audience&apos;s frustration,
            shifts to scientific nuance, weaves in the analogy naturally, closes with an open question.
            No subheadings. No bullet points. Sounds like a human expert.
          </p>
        </div>

        {/* Editable textarea */}
        <textarea
          value={masterContent}
          onChange={(e) => setMasterContent(e.target.value)}
          rows={14}
          className="w-full resize-none rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-4 py-3 text-sm leading-relaxed text-strong outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 placeholder:text-faint"
          placeholder="Your master content will auto-populate from your Raw Translation. Edit freely to refine your narrative…"
        />

        <p className="mt-2.5 text-[11px] leading-relaxed text-faint">
          ✦ This ~250-word block is the{" "}
          <span className="font-semibold text-soft">single source of truth</span> for all formats —
          Instagram Reels, YouTube Scripts, Blog Articles, TED Talks, Podcasts, and more will
          all be generated from this content.
        </p>
      </div>

      {/* Bottom action bar */}
      <div className="flex items-center justify-between gap-3">
        <button onClick={onBack} className="btn btn-ghost flex items-center gap-2 px-4 py-2.5 text-sm">
          <ChevronLeft size={15} />
          Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className={`btn flex items-center gap-2 px-4 py-2.5 text-sm transition-all ${
              copied
                ? "border border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                : "btn-ghost"
            }`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy Content"}
          </button>

          <button
            onClick={onNext}
            className="btn btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
          >
            Build Blueprint
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// VIEW 3 — MASTER BLUEPRINT (5-Beat Narrative Structure)
// ─────────────────────────────────────────────────────────────────────────
function View3MasterBlueprint({ blueprint, setBlueprint, activeLensData, onBack, onApprove }) {
  function update(id, val) {
    setBlueprint((prev) => ({ ...prev, [id]: val }));
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Context banner */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-5 py-3">
        <Layers size={14} className="shrink-0 text-violet-400" />
        <p className="text-xs text-soft">
          Build your{" "}
          <span className="font-bold text-strong">5-beat narrative structure</span>.
          Each block flows into all output formats.
        </p>
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1">
          <ShieldCheck size={10} className="text-emerald-400" />
          <span className="text-[10px] font-semibold text-emerald-400">Evidence-Based Engine</span>
        </div>
        {activeLensData && (
          <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/10 px-2.5 py-1">
            <span className="text-xs leading-none">{activeLensData.icon}</span>
            <span className="text-[10px] font-semibold text-violet-300">{activeLensData.name} lens active</span>
          </div>
        )}
      </div>

      {/* Blueprint cards */}
      <div className="flex flex-col gap-3">
        {BLUEPRINT_CARDS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.055, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden rounded-2xl border bg-[rgb(var(--panel))]"
              style={{ borderColor: card.ring }}
            >
              <div
                className="flex items-center gap-3 border-b px-5 py-3"
                style={{ borderColor: card.ring, background: card.bg }}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${card.accent}20`, color: card.accent }}
                >
                  <Icon size={15} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-strong">{card.label}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                    style={{ background: `${card.accent}18`, color: card.accent }}
                  >
                    {card.sublabel}
                  </span>
                </div>
                <div className="ml-auto text-[10px] font-bold text-faint">Beat {idx + 1} / 5</div>
              </div>
              <div className="px-5 py-3">
                <textarea
                  value={blueprint[card.id]}
                  onChange={(e) => update(card.id, e.target.value)}
                  rows={2}
                  className="w-full resize-none bg-transparent text-sm leading-relaxed text-strong outline-none placeholder:text-faint"
                  placeholder={card.placeholder}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between gap-3">
        <button onClick={onBack} className="btn btn-ghost flex items-center gap-2 px-4 py-2.5 text-sm">
          <ChevronLeft size={15} />
          Back
        </button>
        <button onClick={onApprove} className="btn btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
          <Sparkles size={14} />
          Generate Full Content
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// ACTIVE MODIFIERS BADGE
// Shown above Master Content when a Creative Lens is applied.
// ─────────────────────────────────────────────────────────────────────────
function ActiveModifiersBadge({ lens }) {
  const chain = [
    { label: "Med Verify",      color: "#34d399", icon: <ShieldCheck size={10} /> },
    { label: "Blueprint",       color: "#a78bfa", icon: <Layers size={10} />      },
    { label: lens.name,         color: "#e879f9", icon: <span className="text-[10px] leading-none">{lens.icon}</span> },
    { label: "Master Content",  color: "#22d3ee", icon: <FileText size={10} />    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-2xl border border-violet-500/20 bg-[rgb(var(--panel))]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-violet-500/15 bg-violet-500/6 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <Palette size={12} className="text-violet-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300">
            Active Modifiers
          </span>
        </div>
        <div className="flex items-center gap-1">
          {chain.map((node, idx) => (
            <span key={node.label} className="flex items-center gap-1">
              <span
                className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold"
                style={{ background: `${node.color}18`, color: node.color }}
              >
                {node.icon}
                <span className="hidden sm:inline">{node.label}</span>
              </span>
              {idx < chain.length - 1 && (
                <ChevronRight size={9} className="shrink-0 text-faint" />
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <div className="flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-500/12 px-3 py-1">
          <span className="text-sm leading-none">{lens.icon}</span>
          <span className="text-[11px] font-semibold text-violet-300">Style: {lens.name}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
          <CheckCircle2 size={11} className="text-emerald-400" />
          <span className="text-[11px] font-semibold text-emerald-400">{lens.credits}cr applied</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1">
          <Layers size={11} className="text-cyan-400" />
          <span className="text-[11px] font-semibold text-cyan-400">5-beat blueprint</span>
        </div>
        <span className="ml-auto hidden text-[10px] text-faint sm:block">
          {lens.description}
        </span>
      </div>
    </motion.div>
  );
}
