"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ text, label = "Copy", className = "", compact = false }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard may be unavailable — fail silently in demo
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (compact) {
    return (
      <button
        onClick={copy}
        title="Copy"
        className={`grid h-7 w-7 place-items-center rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--panel))] text-faint transition hover:border-cyan/45 hover:text-cyan ${className}`}
      >
        {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
      </button>
    );
  }

  return (
    <button
      onClick={copy}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-2.5 py-1.5 text-xs font-semibold transition hover:border-cyan/45 ${
        copied ? "text-emerald-400" : "text-soft"
      } ${className}`}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied" : label}
    </button>
  );
}
