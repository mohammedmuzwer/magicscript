"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ScriptCard from "./ScriptCard";

const TABS = [
  { id: "cinematic", label: "🎬 Cinematic" },
  { id: "education", label: "📋 Education" },
  { id: "rebel",     label: "🔥 Rebel" },
];

function extractText(val) {
  if (!val) return "";
  if (typeof val === "string") return val;
  // Direct string fields (common LLM response shapes)
  if (val.script)   return val.script;
  if (val.text)     return val.text;
  if (val.content)  return val.content;
  // Structured cinematic beat object — convert to readable plain text
  if (val.timing || val.beat_name || val.audio || val.visual) {
    const lines = [];
    if (val.timing)    lines.push(`[${val.timing}]`);
    if (val.beat_name) lines.push(val.beat_name.toUpperCase());
    if (val.audio)     lines.push(`AUDIO: "${val.audio}"`);
    if (val.visual)    lines.push(`VISUAL: ${val.visual}`);
    if (val.subtitle)  lines.push(`SUBTITLE: [${val.subtitle}]`);
    return lines.join("\n");
  }
  // Last resort — pretty-print the object so nothing is silently swallowed
  try { return JSON.stringify(val, null, 2); } catch { return ""; }
}

export default function ScriptOutput({ scripts, contentTypeId, evidenceScore, bucketId, language, onSave }) {
  const [activeTab, setActiveTab] = useState(null); // null = desktop (all 3 shown)

  return (
    <div>
      {/* Mobile: tab switcher */}
      <div className="mb-4 flex gap-1 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-1 lg:hidden">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
              activeTab === tab.id
                ? "bg-[rgb(var(--bg-soft))] text-cyan shadow-sm"
                : "text-faint hover:text-soft"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Desktop: 3-column grid */}
      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4">
        {TABS.map((tab, i) => (
          <ScriptCard
            key={tab.id}
            style={tab.id}
            scriptText={extractText(scripts[tab.id])}
            delay={i * 0.15}
            contentTypeId={contentTypeId}
            evidenceScore={evidenceScore}
            bucketId={bucketId}
            language={language}
            onSave={onSave}
          />
        ))}
      </div>

      {/* Mobile: single card */}
      <div className="lg:hidden">
        {TABS.filter((tab) => tab.id === (activeTab ?? "cinematic")).map((tab, i) => (
          <ScriptCard
            key={tab.id}
            style={tab.id}
            scriptText={extractText(scripts[tab.id])}
            delay={0}
            contentTypeId={contentTypeId}
            evidenceScore={evidenceScore}
            bucketId={bucketId}
            language={language}
            onSave={onSave}
          />
        ))}
      </div>
    </div>
  );
}
