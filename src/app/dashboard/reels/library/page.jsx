"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bookmark, ArrowLeft } from "lucide-react";

export default function ReelsLibraryPage() {
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("magicscript_reels_saved");
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/reels" className="flex items-center gap-1.5 text-sm text-faint hover:text-cyan transition">
          <ArrowLeft size={15} /> Back to Reels
        </Link>
      </div>

      <div>
        <h1 className="font-display text-2xl font-bold">🔖 Saved Reel Scripts</h1>
        <p className="mt-1 text-sm text-faint">Scripts you've bookmarked for later</p>
      </div>

      {saved.length === 0 ? (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-12 text-center">
          <Bookmark size={32} className="mx-auto mb-3 text-faint" />
          <p className="text-sm text-faint">No saved scripts yet.</p>
          <Link href="/dashboard/reels" className="mt-3 inline-block text-sm font-semibold text-cyan hover:underline">
            Generate a Reel and save it →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {saved.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-faint">{item.style}</span>
              </div>
              <pre className="max-h-32 overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-soft">
                {item.script}
              </pre>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
