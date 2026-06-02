"use client";

import { motion } from "framer-motion";
import { BUCKETS } from "@/lib/reels/buckets";

export default function BucketSelector({ selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {BUCKETS.map((bucket) => {
        const active = selected === bucket.id;
        return (
          <motion.button
            key={bucket.id}
            onClick={() => onSelect(active ? null : bucket.id)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold border transition-all duration-200 ${
              active
                ? "text-white shadow-lg"
                : "border-[rgb(var(--border))] text-soft hover:border-opacity-60 hover:text-[rgb(var(--text))] bg-[rgb(var(--panel))]"
            }`}
            style={
              active
                ? { background: bucket.color, borderColor: bucket.color, boxShadow: `0 0 16px ${bucket.color}55` }
                : {}
            }
          >
            <span>{bucket.icon}</span>
            <span>{bucket.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
