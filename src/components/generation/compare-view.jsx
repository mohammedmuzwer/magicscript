"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Columns2 } from "lucide-react";
import { LANGUAGES } from "@/lib/languages";
import { generateContent } from "@/lib/generator";
import CopyButton from "./copy-button";

export default function CompareView({ topic, research, settings, onClose }) {
  const [selected, setSelected] = useState(["en", "tanglish", "ta"]);

  function toggle(code) {
    setSelected((s) =>
      s.includes(code)
        ? s.filter((c) => c !== code)
        : s.length < 3
        ? [...s, code]
        : s
    );
  }

  const columns = selected.map((code) => ({
    code,
    lang: LANGUAGES.find((l) => l.code === code),
    content: generateContent({ ...settings, topic, research, language: code, seed: 3 }),
  }));

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-navy-950/92 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <span className="flex items-center gap-2 font-display text-sm font-bold text-white">
          <Columns2 size={16} className="text-cyan" /> Side-by-side language compare
        </span>
        <button
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-white/70 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* language selector */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-white/10 px-5 py-3">
        <span className="text-[11px] font-semibold text-white/50">
          Pick up to 3 languages:
        </span>
        {LANGUAGES.map((l) => {
          const on = selected.includes(l.code);
          return (
            <button
              key={l.code}
              onClick={() => toggle(l.code)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                on
                  ? "bg-cyan/20 text-cyan ring-1 ring-cyan/40"
                  : "text-white/55 hover:bg-white/5"
              }`}
            >
              {l.flag} {l.name}
            </button>
          );
        })}
      </div>

      {/* columns */}
      <div className="flex-1 overflow-auto p-5">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(260px, 1fr))` }}
        >
          {columns.map((col, idx) => (
            <motion.div
              key={col.code}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="text-lg">{col.lang.flag}</span>
                <span className="font-display text-sm font-bold text-white">
                  {col.lang.name}
                </span>
              </div>

              <Block title="Reel hook" text={col.content.hooks[0]} />
              <Block
                title="Script — evidence beat"
                text={
                  col.content.reelScript.sections.find((s) => s.label.includes("SCIENCE"))
                    ?.text || col.content.reelScript.sections[1]?.text
                }
              />
              <Block title="Caption" text={col.content.caption} />
              <Block title="CTA" text={col.content.cta} />
            </motion.div>
          ))}
        </div>
        <p className="mt-4 text-center text-[11px] text-white/40">
          Each column is independently generated in native creator voice — not translated.
        </p>
      </div>
    </div>
  );
}

function Block({ title, text }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan">
          {title}
        </span>
        <CopyButton text={text} compact />
      </div>
      <p className="rounded-lg border border-white/8 bg-white/[0.03] p-2.5 text-[13px] leading-relaxed text-white/85">
        {text}
      </p>
    </div>
  );
}
