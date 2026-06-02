"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Wand2,
  SlidersHorizontal,
  ChevronDown,
  Columns2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ENRICHMENT_MODULES } from "@/lib/pipeline-registry";
import { getResearch } from "@/lib/research-data";
import { generateContent } from "@/lib/generator";
import { LANGUAGES } from "@/lib/languages";
import SettingsPanel from "./settings-panel";
import GeneratingState from "./generating-state";
import ContentOutput from "./content-output";
import VerificationPanel from "./verification-panel";
import CompareView from "./compare-view";
import { DangerBanner } from "./safety-banner";
import { VerdictBadge } from "@/components/ui/badges";

const DEFAULTS = {
  language: "tanglish",
  tone: "educational",
  platform: "reels",
  length: "medium",
};

export default function GenerateStudio({ initialTopic = "", initialSettings = {} }) {
  const { spendCredit } = useAuth();
  const settings0 = { ...DEFAULTS, ...initialSettings };

  const [draftTopic, setDraftTopic] = useState(initialTopic);
  const [topic, setTopic] = useState(initialTopic);
  const [settings, setSettings] = useState(settings0);
  const [status, setStatus] = useState("idle");
  const [research, setResearch] = useState(null);
  const [content, setContent] = useState(null);
  const [seed, setSeed] = useState(1);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [showCompare, setShowCompare] = useState(false);
  const [enrichmentModule, setEnrichmentModule] = useState(null);
  // Ref so runFull/regen always read the *latest* enrichmentModule without stale closures
  const enrichmentModuleRef = useRef(null);
  useEffect(() => { enrichmentModuleRef.current = enrichmentModule; }, [enrichmentModule]);

  const runFull = useCallback(
    (t, s, sd) => {
      setStatus("generating");
      setShowSettings(false);
      setSaved(false);
      window.setTimeout(() => {
        const r = getResearch(t);
        const c = generateContent({ topic: t, research: r, ...s, seed: sd, enrichmentModule: enrichmentModuleRef.current });
        setResearch(r);
        setContent(c);
        setStatus("done");
        spendCredit(1);
      }, 2550);
    },
    [spendCredit]
  );

  const regen = useCallback(
    (s, sd, r) => {
      const useR = r || research;
      if (!useR) return;
      setBusy(true);
      window.setTimeout(() => {
        setContent(generateContent({ topic, research: useR, ...s, seed: sd, enrichmentModule: enrichmentModuleRef.current }));
        setBusy(false);
      }, 320);
    },
    [research, topic]
  );

  // Auto-run when a topic arrives via the URL.
  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
      runFull(initialTopic, settings0, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Called directly from the enrichment button — always has fresh closures (no useCallback)
  function onEnrichmentChange(moduleId) {
    const newModule = enrichmentModule === moduleId ? null : moduleId;
    setEnrichmentModule(newModule);
    if (status === "done" && research) {
      setBusy(true);
      window.setTimeout(() => {
        setContent(generateContent({ topic, research, ...settings, seed, enrichmentModule: newModule }));
        setBusy(false);
      }, 320);
    }
  }

  function onGenerate() {
    const t = draftTopic.trim();
    if (!t) return;
    setTopic(t);
    setSeed(1);
    runFull(t, settings, 1);
  }

  function onSettingsChange(next) {
    setSettings(next);
    if (status === "done") regen(next, seed);
  }

  function switchLanguage(code) {
    const next = { ...settings, language: code };
    setSettings(next);
    if (status === "done") regen(next, seed);
  }

  function onRegenerate() {
    const ns = seed + 1;
    setSeed(ns);
    regen(settings, ns);
  }

  const showDanger =
    research &&
    ((research.claimFlags && research.claimFlags.length > 0) ||
      research.verdict === "false" ||
      research.verdict === "misleading");

  return (
    <div className="space-y-5">
      {/* Topic + settings card */}
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-3">
            <Search size={17} className="shrink-0 text-faint" />
            <input
              value={draftTopic}
              onChange={(e) => setDraftTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onGenerate()}
              placeholder="Enter a medical claim, supplement, disease, or wellness topic…"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-faint"
            />
          </div>
          <button
            onClick={onGenerate}
            disabled={!draftTopic.trim() || status === "generating"}
            className="btn btn-primary px-5 py-3 text-sm disabled:opacity-50"
          >
            <Wand2 size={16} /> Verify & Generate
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-soft transition hover:text-cyan"
          >
            <SlidersHorizontal size={13} /> Generation settings
            <ChevronDown
              size={13}
              className={`transition-transform ${showSettings ? "rotate-180" : ""}`}
            />
          </button>
          {status === "done" && (
            <button
              onClick={() => setShowCompare(true)}
              className="flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] px-2.5 py-1.5 text-xs font-semibold text-cyan transition hover:border-cyan/45"
            >
              <Columns2 size={13} /> Compare languages
            </button>
          )}
        </div>

        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 border-t border-[rgb(var(--border))] pt-4"
          >
            <SettingsPanel settings={settings} onChange={onSettingsChange} />
          </motion.div>
        )}

        {/* Enrichment Layer */}
        <div className="mt-3 border-t border-[rgb(var(--border))] pt-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-faint">Enrichment Style</span>
            {enrichmentModule && (
              <button
                onClick={() => onEnrichmentChange(enrichmentModule)}
                className="text-[10px] font-semibold text-faint hover:text-soft"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {ENRICHMENT_MODULES.map((mod) => {
              const isActive = enrichmentModule === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => onEnrichmentChange(mod.id)}
                  title={mod.description}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? "border-amber-500/50 bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25"
                      : "border-[rgb(var(--border))] text-faint hover:border-amber-500/30 hover:text-amber-300/70"
                  }`}
                >
                  <span>{mod.icon}</span>
                  {mod.name}
                </button>
              );
            })}
          </div>
          {enrichmentModule && (
            <p className="mt-2 text-[10px] text-amber-400/70">
              {ENRICHMENT_MODULES.find((m) => m.id === enrichmentModule)?.description}
            </p>
          )}
        </div>
      </div>

      {/* Idle */}
      {status === "idle" && (
        <div className="grid place-items-center rounded-2xl border border-dashed border-[rgb(var(--border))] py-20 text-center">
          <div className="max-w-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan/15 to-electric/15 text-cyan ring-1 ring-cyan/20">
              <Sparkles size={24} />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">
              Verify a topic to begin
            </h3>
            <p className="mt-1.5 text-sm text-soft">
              Enter any health claim above. The science is checked before any content is
              written — then generated in your chosen language.
            </p>
          </div>
        </div>
      )}

      {/* Generating */}
      {status === "generating" && <GeneratingState topic={topic} />}

      {/* Done */}
      {status === "done" && content && research && (
        <div className="space-y-5">
          {showDanger && <DangerBanner research={research} />}

          {/* language quick-switch */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-2.5">
            <span className="text-[11px] font-semibold text-faint">Instant language switch:</span>
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => switchLanguage(l.code)}
                className={`rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                  settings.language === l.code
                    ? "bg-cyan/15 text-cyan ring-1 ring-cyan/30"
                    : "text-soft hover:bg-electric/8"
                }`}
              >
                {l.flag} {l.name}
              </button>
            ))}
            <span className="ml-auto flex items-center gap-1.5">
              <VerdictBadge verdict={research.verdict} size="sm" />
            </span>
          </div>

          {/* Split layout */}
          <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
            <motion.div
              animate={{ opacity: busy ? 0.55 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <ContentOutput
                content={content}
                onRegenerate={onRegenerate}
                onSave={() => setSaved((v) => !v)}
                saved={saved}
                busy={busy}
              />
            </motion.div>
            <div className="lg:sticky lg:top-20 lg:self-start">
              <VerificationPanel research={research} />
            </div>
          </div>
        </div>
      )}

      {showCompare && (
        <CompareView
          topic={topic}
          research={research}
          settings={settings}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}
