"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clapperboard, ArrowLeft, Clock } from "lucide-react";

export default function ReelsHistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("magicscript_reels_history");
      if (raw) setHistory(JSON.parse(raw));
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
        <h1 className="font-display text-2xl font-bold">📱 Reels History</h1>
        <p className="mt-1 text-sm text-faint">Your past generated Reel scripts</p>
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-12 text-center">
          <Clapperboard size={32} className="mx-auto mb-3 text-faint" />
          <p className="text-sm text-faint">No Reels generated yet.</p>
          <Link href="/dashboard/reels" className="mt-3 inline-block text-sm font-semibold text-cyan hover:underline">
            Create your first Reel →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {history.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="text-sm font-semibold leading-snug line-clamp-2">{item.topic}</p>
                <span className="shrink-0 rounded-md bg-cyan/10 px-2 py-0.5 text-[10px] font-bold text-cyan">
                  {item.contentType}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-faint">
                <Clock size={11} />
                {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
