"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Check, Link2, AlertCircle, Plus, Pencil, Trash2, CheckCheck } from "lucide-react";
import { BUCKETS } from "@/lib/reels/buckets";

// ── Constants ─────────────────────────────────────────────────────────────────
const BUCKETS_STORAGE_KEY = "reels_all_buckets";
const MAX_BUCKETS = 8;
const DEFAULT_IDS = new Set(BUCKETS.map((b) => b.id));

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#22c55e",
  "#10b981", "#06b6d4", "#3b82f6", "#6366f1",
  "#a855f7", "#ec4899", "#f43f5e", "#84cc16",
];

// ── localStorage helpers ──────────────────────────────────────────────────────
function loadBuckets() {
  if (typeof window === "undefined") return BUCKETS;
  try {
    const stored = JSON.parse(localStorage.getItem(BUCKETS_STORAGE_KEY));
    return Array.isArray(stored) && stored.length > 0 ? stored : BUCKETS;
  } catch { return BUCKETS; }
}

function saveBuckets(buckets) {
  try { localStorage.setItem(BUCKETS_STORAGE_KEY, JSON.stringify(buckets)); } catch {}
}

// ── Bucket Edit / Add Modal ───────────────────────────────────────────────────
function BucketModal({ bucket, onSave, onClose }) {
  const isNew = !bucket;
  const [icon,  setIcon]  = useState(bucket?.icon  ?? "🌟");
  const [label, setLabel] = useState(bucket?.label ?? "");
  const [color, setColor] = useState(bucket?.color ?? "#3b82f6");

  const handleSave = () => {
    if (!label.trim()) return;
    onSave({
      ...(bucket ?? {}),                     // preserve topics + any other fields
      id:    bucket?.id ?? `custom_${Date.now()}`,
      label: label.trim(),
      icon:  icon || "🌟",
      color,
      topics: bucket?.topics ?? [],
      isCustom: !DEFAULT_IDS.has(bucket?.id),
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 10 }}
        transition={{ duration: 0.18 }}
        className="w-[300px] rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-sm font-bold">
          {isNew ? "Add Custom Bucket" : "Edit Bucket"}
        </h3>

        {/* Icon */}
        <div className="mb-3">
          <label className="mb-1.5 block text-[11px] font-semibold text-faint">Icon (paste an emoji)</label>
          <input
            value={icon}
            onChange={(e) => setIcon([...e.target.value].slice(0, 2).join(""))}
            placeholder="🌟"
            className="w-16 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-2 py-2 text-center text-xl outline-none focus:border-[#2563eb]/50"
          />
        </div>

        {/* Name */}
        <div className="mb-3">
          <label className="mb-1.5 block text-[11px] font-semibold text-faint">Bucket Name</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value.slice(0, 28))}
            placeholder="e.g. Heart Health"
            autoFocus
            className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-3 py-2 text-sm outline-none focus:border-[#2563eb]/50 focus:ring-1 focus:ring-[#2563eb]/20"
          />
        </div>

        {/* Color */}
        <div className="mb-4">
          <label className="mb-2 block text-[11px] font-semibold text-faint">Accent Color</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)}
                className="h-5 w-5 rounded-full transition-transform hover:scale-110"
                style={{
                  background: c,
                  boxShadow: color === c ? `0 0 0 2px rgb(var(--panel)), 0 0 0 3.5px ${c}` : "none",
                }} />
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div className="mb-4 flex items-center gap-3 rounded-xl border p-3"
          style={{ borderColor: color + "50", background: color + "12" }}>
          <span className="text-xl leading-none">{icon || "🌟"}</span>
          <div>
            <p className="text-xs font-bold leading-snug" style={{ color }}>
              {label.trim() || "Bucket name"}
            </p>
            <div className="mt-1 h-0.5 w-12 rounded-full" style={{ background: color }} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 rounded-xl border border-[rgb(var(--border))] py-2 text-xs font-semibold text-faint transition hover:text-soft">
            Cancel
          </button>
          <button onClick={handleSave} disabled={!label.trim()}
            className="flex-1 rounded-xl py-2 text-xs font-bold text-white transition disabled:opacity-40"
            style={{ background: label.trim() ? color : undefined }}>
            {isNew ? "Add Bucket" : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Content Bucket bento grid ─────────────────────────────────────────────────
function BucketBento({
  allBuckets, canAddMore,
  selectedBucket, onSelectBucket,
  customWord, onCustomWord,
  onEdit, onDelete, onAdd,
}) {
  const [inputErr,    setInputErr]    = useState("");
  const [editMode,    setEditMode]    = useState(false);
  const [hoveredBucket, setHoveredBucket] = useState(null);

  const handleWordInput = (val) => {
    if (val.includes(" ")) { setInputErr("Only one word allowed here"); return; }
    setInputErr("");
    onCustomWord(val);
  };

  return (
    <div className="flex flex-col gap-2 flex-1 min-h-0">

      {/* Top row: one-word label + Manage button */}
      <div className="flex items-start justify-between gap-2 shrink-0">
        <p className="text-xs font-semibold text-faint">
          Or type your own bucket topic{" "}
          <span className="text-[#2563eb]">(one word)</span>
        </p>
        <button
          onClick={() => setEditMode((v) => !v)}
          title={editMode ? "Exit edit mode" : "Manage buckets"}
          className={`flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-semibold transition ${
            editMode
              ? "border-[#2563eb]/30 bg-[#2563eb]/10 text-[#2563eb]"
              : "border-[rgb(var(--border))] text-faint hover:border-[#2563eb]/30 hover:text-[#2563eb]"
          }`}
        >
          {editMode ? <CheckCheck size={11} /> : <Pencil size={11} />}
          {editMode ? "Done" : "Manage"}
        </button>
      </div>

      {/* Edit-mode banner */}
      <div className="shrink-0">
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 rounded-lg border border-[#2563eb]/20 bg-[#2563eb]/8 px-3 py-2 text-[11px] text-[#2563eb]">
              <Pencil size={11} className="shrink-0" />
              <span>Click <strong>✏️</strong> to edit any bucket · <strong>🗑</strong> to delete custom ones · <strong>＋</strong> to add new</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* One-word search input */}
      <div className="shrink-0">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={customWord}
            onChange={(e) => handleWordInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === " ") { e.preventDefault(); setInputErr("Only one word allowed here"); } else setInputErr(""); }}
            placeholder="e.g. ashwagandha, cortisol, insulin…"
            className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] py-2.5 pl-9 pr-10 text-sm outline-none transition placeholder:text-faint focus:border-[#2563eb]/50 focus:ring-1 focus:ring-[#2563eb]/20"
          />
          {customWord && (
            <button onClick={() => { onCustomWord(""); setInputErr(""); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-faint transition hover:text-soft">
              <X size={13} />
            </button>
          )}
        </div>
        {inputErr && <p className="mt-1 text-[11px] text-rose-400">{inputErr}</p>}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="h-px flex-1 bg-[rgb(var(--border))]" />
        <span className="text-[11px] font-semibold text-faint">or pick a content bucket</span>
        <div className="h-px flex-1 bg-[rgb(var(--border))]" />
      </div>

      {/* Bucket grid */}
      <div className="flex-1 min-h-0 overflow-hidden grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "repeat(2, 1fr)", gap: "8px" }}>
        {allBuckets.map((bucket, i) => {
          const active    = selectedBucket === bucket.id;
          const isDefault = DEFAULT_IDS.has(bucket.id);

          return (
            <div key={bucket.id} className="relative">
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={!editMode ? { y: -2, transition: { duration: 0.12 } } : {}}
                onMouseEnter={() => !editMode && setHoveredBucket(bucket.id)}
                onMouseLeave={() => setHoveredBucket(null)}
                onClick={() => {
                  if (editMode) return; // clicks handled by overlay in edit mode
                  onSelectBucket(active ? null : bucket.id);
                  onCustomWord("");
                }}
                className="group relative flex w-full flex-col items-start rounded-xl border text-left transition-all duration-200 h-full"
                style={{
                  padding: "8px 10px",
                  ...(active && !editMode
                    ? { borderColor: bucket.color + "80", background: bucket.color + "26", boxShadow: `0 0 14px ${bucket.color}22` }
                    : hoveredBucket === bucket.id && !editMode
                    ? { borderColor: bucket.color + "50", background: bucket.color + "26", opacity: 1 }
                    : { borderColor: "rgb(var(--border))", background: "rgb(var(--panel))", opacity: editMode ? 0.85 : 1 })
                }}
              >
                {active && !editMode && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full"
                    style={{ background: bucket.color }}>
                    <Check size={9} className="text-white" strokeWidth={3} />
                  </motion.span>
                )}
                <span className="mb-1 text-[20px] leading-none">{bucket.icon}</span>
                <p className="text-xs font-bold leading-tight"
                  style={active && !editMode ? { color: bucket.color } : {}}>
                  {bucket.label}
                </p>
                <p className="mt-0.5 text-[10px] text-faint">
                  {bucket.topics?.length ?? 0} topics
                </p>
                <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-[rgb(var(--bg-soft))]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: active && !editMode ? "100%" : "25%" }}
                    transition={{ duration: 0.35 }}
                    className="h-full rounded-full"
                    style={{ background: bucket.color }} />
                </div>
              </motion.button>

              {/* Edit-mode overlay — only visible when editMode is on */}
              <AnimatePresence>
                {editMode && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="absolute inset-0 z-10 flex items-end justify-center gap-1.5 rounded-xl pb-2"
                    style={{ background: "rgba(0,0,0,0.45)" }}
                  >
                    <button
                      onClick={() => onEdit(bucket)}
                      title="Edit bucket"
                      className="flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-semibold text-gray-800 shadow transition hover:bg-white">
                      <Pencil size={10} /> Edit
                    </button>
                    {!isDefault && (
                      <button
                        onClick={() => onDelete(bucket.id)}
                        title="Delete bucket"
                        className="flex items-center gap-1 rounded-lg bg-rose-500/90 px-2 py-1 text-[10px] font-semibold text-white shadow transition hover:bg-rose-500">
                        <Trash2 size={10} />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Add Bucket card */}
        {canAddMore && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onAdd}
            className="flex h-full min-h-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[rgb(var(--border))] p-2 text-faint transition hover:border-[#6b7280]/50 hover:bg-[#6b7280]/15 hover:text-[#6b7280]"
          >
            <Plus size={16} />
            <p className="text-center text-[10px] font-semibold leading-snug">
              Add Bucket
              <br />
              <span className="font-normal opacity-60">
                {MAX_BUCKETS - allBuckets.length} slot{MAX_BUCKETS - allBuckets.length !== 1 ? "s" : ""} left
              </span>
            </p>
          </motion.button>
        )}
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
          <span className="italic text-soft">
            "Why eating fat doesn't make you fat — insulin theory explained for Tamil housewives"
          </span>
        </p>
      </div>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, MAX))}
          rows={5}
          placeholder="Type your topic, question, or claim here…"
          className="w-full resize-none rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-3 text-sm outline-none transition placeholder:text-faint focus:border-[#2563eb]/50 focus:ring-1 focus:ring-[#2563eb]/20"
        />
        <span className="absolute bottom-3 right-3 text-[10px] text-faint">
          {value.length}/{MAX}
        </span>
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
        <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-faint" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type="url"
          spellCheck={false}
          placeholder="https://www.youtube.com/watch?v=…  or  https://www.instagram.com/reel/…"
          className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] py-2.5 pl-9 pr-10 text-sm outline-none transition placeholder:text-faint focus:border-[#2563eb]/50 focus:ring-1 focus:ring-[#2563eb]/20"
        />
        {value && (
          <button onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-faint transition hover:text-soft">
            <X size={13} />
          </button>
        )}
      </div>
      {invalid && (
        <p className="text-[11px] text-rose-400">
          Please paste a full URL starting with http:// or https://
        </p>
      )}
      <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/8 px-3 py-2.5 text-[11px] text-amber-300">
        <AlertCircle size={12} className="mt-0.5 shrink-0" />
        <span>
          Reference mode uses the URL for{" "}
          <strong>pattern and structure only</strong>. Any health claims will be
          fact-checked and corrected through the Med Quick-Check.
        </span>
      </div>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────
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
  // ── Bucket state ─────────────────────────────────────────────────────────
  const [allBuckets, setAllBuckets] = useState(() => loadBuckets());
  const [modalState, setModalState] = useState(null); // null | {mode:'add'} | {mode:'edit', bucket}

  // Sync to localStorage whenever allBuckets changes
  useEffect(() => { saveBuckets(allBuckets); }, [allBuckets]);

  const handleEdit = (bucket) => setModalState({ mode: "edit", bucket });
  const handleAdd  = ()       => setModalState({ mode: "add"  });

  const handleDelete = (bucketId) => {
    setAllBuckets((prev) => prev.filter((b) => b.id !== bucketId));
    if (selectedBucket === bucketId) onSelectBucket(null);
  };

  const handleModalSave = (bucketData) => {
    setAllBuckets((prev) => {
      const exists = prev.some((b) => b.id === bucketData.id);
      return exists
        ? prev.map((b) => (b.id === bucketData.id ? bucketData : b))
        : [...prev, bucketData];
    });
    setModalState(null);
  };

  // ── Proceed logic ─────────────────────────────────────────────────────────
  const bucketReady = inputMode === "bucket" && (selectedBucket || customWord.trim());
  const manualReady = inputMode === "manual" && manualTopic.trim().length >= 3;
  const linkReady   = inputMode === "link"   && /^https?:\/\/.+/i.test(referenceLink.trim());
  const canProceed  = bucketReady || manualReady || linkReady;

  const handleSend = () => {
    if (!canProceed) return;
    if (inputMode === "bucket") {
      const b     = allBuckets.find((b) => b.id === selectedBucket);
      const topic = customWord.trim() || b?.label || "";
      onSendToStage2(topic);
    } else if (inputMode === "link") {
      onSendToStage2(referenceLink.trim());
    } else {
      onSendToStage2(manualTopic.trim());
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">

      {/* Mode content */}
      <AnimatePresence mode="wait">
        {inputMode === "bucket" && (
          <motion.div key="bucket"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
            className="flex-1 min-h-0 flex flex-col">
            <BucketBento
              allBuckets={allBuckets}
              canAddMore={allBuckets.length < MAX_BUCKETS}
              selectedBucket={selectedBucket}
              onSelectBucket={onSelectBucket}
              customWord={customWord}
              onCustomWord={onCustomWord}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdd={handleAdd}
            />
          </motion.div>
        )}
        {inputMode === "manual" && (
          <motion.div key="manual"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
            <ManualTopicInput value={manualTopic} onChange={onManualTopic} />
          </motion.div>
        )}
        {inputMode === "link" && (
          <motion.div key="link"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
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
        className="flex w-full items-center justify-center gap-2.5 rounded-xl py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-35 shrink-0"
        style={{
          background: canProceed ? "linear-gradient(90deg,#38bdf8,#818cf8)" : "rgb(var(--bg-soft))",
          color: canProceed ? "#0a101e" : "rgb(var(--text-faint))",
        }}
      >
        <span>Send to Stage 2</span>
        <ArrowRight size={16} />
      </motion.button>

      {/* Bucket Add/Edit Modal */}
      <AnimatePresence>
        {modalState && (
          <BucketModal
            bucket={modalState.mode === "edit" ? modalState.bucket : null}
            onSave={handleModalSave}
            onClose={() => setModalState(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
