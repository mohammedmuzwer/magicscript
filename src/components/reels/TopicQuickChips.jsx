"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { getBucketById, getCachedTopics, setCachedTopics } from "@/lib/reels/buckets";
import { REELS_CREDITS } from "@/lib/reels/creditCosts";
import { useAuth } from "@/lib/auth-context";

export default function TopicQuickChips({ bucketId, onSelect }) {
  const { spendCredit } = useAuth();
  const bucket = getBucketById(bucketId);
  const [topics, setTopics] = useState(bucket?.topics ?? []);
  const [refreshing, setRefreshing] = useState(false);

  if (!bucket) return null;

  const handleRefresh = async () => {
    setRefreshing(true);
    spendCredit(REELS_CREDITS.REFRESH_TRENDING);
    // Simulate live refresh
    await new Promise((r) => setTimeout(r, 1200));
    const shuffled = [...bucket.topics].sort(() => Math.random() - 0.5);
    setTopics(shuffled);
    setCachedTopics(bucketId, shuffled);
    setRefreshing(false);
  };

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
        Trending in {bucket.label}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {topics.map((t, i) => (
          <motion.button
            key={t}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(t)}
            className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-3 py-1 text-xs font-medium text-soft transition hover:border-[#2563eb]/40 hover:text-[#2563eb]"
          >
            {t}
          </motion.button>
        ))}

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1 text-[11px] text-faint transition hover:text-[#2563eb] disabled:opacity-50"
        >
          <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
          Refresh ({REELS_CREDITS.REFRESH_TRENDING}cr)
        </button>
      </div>
    </div>
  );
}
