"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { CONTENT_TYPES } from "@/lib/reels/contentTypes";

export default function ContentTypeCards({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {CONTENT_TYPES.map((ct, i) => {
        const active = selected === ct.id;
        return (
          <motion.button
            key={ct.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -2 }}
            onClick={() => onSelect(active ? null : ct.id)}
            className={`relative rounded-xl border p-4 text-left transition-all duration-200 ${
              active
                ? `${ct.accentBg} ${ct.accentBorder} shadow-lg ${ct.accentGlow}`
                : "border-[rgb(var(--border))] bg-[rgb(var(--panel))] hover:border-opacity-60"
            } ${i === 4 ? "col-span-2 sm:col-span-1" : ""}`}
          >
            {active && (
              <span
                className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full"
                style={{ background: ct.accentColor }}
              >
                <Check size={11} className="text-white" strokeWidth={3} />
              </span>
            )}
            <div className="mb-2 text-2xl">{ct.icon}</div>
            <p className="text-sm font-bold leading-tight">{ct.label}</p>
            <p className="mt-1 text-xs text-faint">{ct.description}</p>
          </motion.button>
        );
      })}
    </div>
  );
}
