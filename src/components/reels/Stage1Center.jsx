"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Check, Link2, AlertCircle } from "lucide-react";
import { BUCKETS } from "@/lib/reels/buckets";

// ── Content Bucket bento grid ─────────────────────────────────────────────────
function BucketBento({ selectedBucket, onSelectBucket, customWord, onCustomWord }) {
  const [inputErr, setInputErr] = useState("");

  const handleWordInput = (val) => {
    // Single word only — no spaces
    if (val.includes(" ")) {
      setInputErr("Only one word allowed here");
      return;
    }
    setInputErr("");
    onCustomWord(val);
  };

  const handleKeyDown = (e) => {
    if (e.key === " ") { e.preventDefault(); setInputErr("Only one word allowed here"); }
    else setInputErr("");
  };

  // Grid layout: first two cards side-by-side, then pairs, last one full width if odd
  return (
    <div className="flex flex-col gap-4">
      {/* Custom bucket input */}
      <div>
        <p className="mb-2 text-xs font-semibold text-faint">
          Or type your own bucket topic <span className="text-cyan">(one word)</span>
        </p>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={customWord}
            onChange={(e) => handleWordInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. ashwagandha, cortisol, insulin…"
            className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] py-2.5 pl-9 pr-10 text-sm outline-none transition placeholder:text-faint focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20"
          />
          {customWord && (
            <button onClick={() => { onCustomWord(""); setInputErr(""); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-soft transition">
              <X size={13} />
            </button>
          )}
        </div>
        {inputErr && <p className="mt-1 text-[11px] text-rose-400">{inputErr}</p>}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[rgb(var(--border))]" />
        <span className="text-[11px] font-semibold text-faint">or pick a content bucket</span>
        <div className="h-px flex-1 bg-[rgb(var(--border))]" />
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {BUCKETS.map((bucket, i) => {
          const active = selectedBucket === bucket.id;
          return (
            <motion.button
              key={bucket.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              onClick={() => { onSelectBucket(active ? null : bucket.id); onCustomWord(""); }}
              className="group relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all duration-200"
              style={active
                ? { borderColor: bucket.color + "80", background: bucket.color + "15", boxShadow: `0 0 20px ${bucket.color}25` }
                : { borderColor: "rgb(var(--border))", background: "rgb(var(--panel))" }
              }
            >
              {/* Active checkmark */}
              {active && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full"
                  style={{ background: bucket.color }}>
                  <Check size={11} className="text-white" strokeWidth={3} />
                </motion.span>
              )}

              {/* Icon */}
              <span className="mb-2.5 text-3xl">{bucket.icon}</span>

              {/* Label */}
              <p className="text-sm font-bold leading-tight" style={active ? { color: bucket.color } : {}}>
                {bucket.label}
              </p>

              {/* Topic count */}
              <p className="mt-1 text-[11px] text-faint">{bucket.topics.length} trending topics</p>

              {/* Color bar at bottom */}
              <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-[rgb(var(--bg-soft))]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: active ? "100%" : "30%" }}
                  transition={{ duration: 0.4 }}
                  className="h-full rounded-full"
                  style={{ background: bucket.color }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>

    </div>
  );
}

// ── Manual topic input ────────────────────────────────────────────────────────
function ManualTopicInput({ value, onChange }) {
  const MAX = 300;
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="mb-1.5 text-xs font-semibold text-faint">
          Describe your topic, angle, or paste a claim to debunk
        </p>
        <p className="mb-3 text-[11px] text-faint">
          Can be a full sentence — e.g.{" "}
          <span className="italic text-soft">"Why eating fat doesn't make you fat — insulin theory explained for Tamil housewives"</span>
        </p>
      </div>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX))}
          rows={5}
          placeholder="Type your topic, question, or claim here…"
          className="w-full resize-none rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-3 text-sm outline-none transition placeholder:text-faint focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20"
        />
        <span className="absolute bottom-3 right-3 text-[10px] text-faint">{value.length}/{MAX}</span>
      </div>
    </div>
  );
}

// ── Reference link input ──────────────────────────────────────────────────────
function ReferenceLinkInput({ value, onChange }) {
  const looksLikeUrl = /^https?:\/\/.+/i.test(value.trim());
  const invalid = value.length > 0 && !looksLikeUrl;
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="mb-1.5 text-xs font-semibold text-faint">
          Paste a viral video URL to adapt its structure
        </p>
        <p className="mb-3 text-[11px] text-faint">
          YouTube, Instagram Reel, or TikTok URL. We extract the pattern and pacing —
          health claims will be fact-checked through the Med Quick-Check step.
        </p>
      </div>
      <div className="relative">
        <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type="url"
          spellCheck={false}
          placeholder="https://www.youtube.com/watch?v=…  or  https://www.instagram.com/reel/…"
          className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] py-2.5 pl-9 pr-10 text-sm outline-none transition placeholder:text-faint focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20"
        />
        {value && (
          <button onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-soft transition">
            <X size={13} />
          </button>
        )}
      </div>
      {invalid && (
        <p className="text-[11px] text-rose-400">Please paste a full URL starting with http:// or https://</p>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/8 px-3 py-2.5 text-[11px] text-amber-300">
        <AlertCircle size={12} className="shrink-0 mt-0.5" />
        <span>
          Reference mode uses the URL for <strong>pattern and structure only</strong>.
          Any health claims will be fact-checked and corrected through the Med Quick-Check.
        </span>
      </div>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
/**
 * @param {object} props
 * @param {"bucket"|"manual"|"link"} props.inputMode
 * @param {string|null}  props.selectedBucket
 * @param {function}     props.onSelectBucket
 * @param {string}       props.customWord
 * @param {function}     props.onCustomWord
 * @param {string}       props.manualTopic
 * @param {function}     props.onManualTopic
 * @param {string}       props.referenceLink
 * @param {function}     props.onReferenceLink
 * @param {function}     props.onSendToStage2   — called with the committed topic string
 */
export default function Stage1Center({
  inputMode,
  selectedBucket,
  onSelectBucket,
  customWord,
  onCustomWord,
  manualTopic,
  onManualTopic,
  referenceLink   = "",
  onReferenceLink = () => {},
  onSendToStage2,
}) {
  const bucketReady = inputMode === "bucket" && (selectedBucket || customWord.trim());
  const manualReady = inputMode === "manual" && manualTopic.trim().length >= 3;
  const linkReady   = inputMode === "link"   && /^https?:\/\/.+/i.test(referenceLink.trim());
  const canProceed  = bucketReady || manualReady || linkReady;

  const handleSend = () => {
    if (!canProceed) return;
    if (inputMode === "bucket") {
      const b = BUCKETS.find((b) => b.id === selectedBucket);
      const topic = customWord.trim() || b?.label || "";
      onSendToStage2(topic);
    } else if (inputMode === "link") {
      onSendToStage2(referenceLink.trim());
    } else {
      onSendToStage2(manualTopic.trim());
    }
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Mode content */}
      <AnimatePresence mode="wait">
        {inputMode === "bucket" && (
          <motion.div key="bucket" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
            <BucketBento
              selectedBucket={selectedBucket}
              onSelectBucket={onSelectBucket}
              customWord={customWord}
              onCustomWord={onCustomWord}
            />
          </motion.div>
        )}
        {inputMode === "manual" && (
          <motion.div key="manual" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
            <ManualTopicInput value={manualTopic} onChange={onManualTopic} />
          </motion.div>
        )}
        {inputMode === "link" && (
          <motion.div key="link" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
            <ReferenceLinkInput value={referenceLink} onChange={onReferenceLink} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Send to Stage 2 button */}
      <motion.button
        whileHover={{ scale: canProceed ? 1.01 : 1 }}
        whileTap={{ scale: canProceed ? 0.98 : 1 }}
        onClick={handleSend}
        disabled={!canProceed}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-35"
        style={{
          background: canProceed ? "linear-gradient(90deg, #38bdf8, #818cf8)" : "rgb(var(--bg-soft))",
          color: canProceed ? "#0a101e" : "rgb(var(--text-faint))",
        }}
      >
        <span>Send to Stage 2</span>
        <ArrowRight size={16} />
      </motion.button>

    </div>
  );
}
