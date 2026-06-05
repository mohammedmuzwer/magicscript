"use client";

import ScriptCard from "./ScriptCard";

function extractText(val) {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (val.script)   return val.script;
  if (val.text)     return val.text;
  if (val.content)  return val.content;
  if (val.timing || val.beat_name || val.audio || val.visual) {
    const lines = [];
    if (val.timing)    lines.push(`[${val.timing}]`);
    if (val.beat_name) lines.push(val.beat_name.toUpperCase());
    if (val.audio)     lines.push(`AUDIO: "${val.audio}"`);
    if (val.visual)    lines.push(`VISUAL: ${val.visual}`);
    if (val.subtitle)  lines.push(`SUBTITLE: [${val.subtitle}]`);
    return lines.join("\n");
  }
  try { return JSON.stringify(val, null, 2); } catch { return ""; }
}

// Single-reel output — Education format only (no 3-column, no tabs)
export default function ScriptOutput({ scripts, contentTypeId, evidenceScore, bucketId, language, onSave }) {
  const scriptText = extractText(
    scripts?.education ?? scripts?.cinematic ?? ""
  );

  return (
    <ScriptCard
      style="education"
      scriptText={scriptText}
      delay={0}
      contentTypeId={contentTypeId}
      evidenceScore={evidenceScore}
      bucketId={bucketId}
      language={language}
      onSave={onSave}
    />
  );
}
