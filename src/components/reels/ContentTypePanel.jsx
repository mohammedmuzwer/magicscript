"use client";

import { motion, AnimatePresence } from "framer-motion";
import { getContentTypeById } from "@/lib/reels/contentTypes";

export default function ContentTypePanel({ contentTypeId }) {
  const ct = getContentTypeById(contentTypeId);

  return (
    <AnimatePresence>
      {ct && (
        <motion.div
          key={ct.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
          transition={{ duration: 0.25 }}
          className={`rounded-xl border p-4 ${ct.accentBg} ${ct.accentBorder}`}
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xl">{ct.icon}</span>
            <span className="font-display font-bold" style={{ color: ct.accentColor }}>
              {ct.label}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <Row label="Hook style" value={ct.hookStyle} />
            <Row label="Structure" value={ct.structure} />
            <Row label="Tone" value={ct.tone} />
            <Row label="Best for" value={ct.bestFor} />
            <Row label="Evidence need" value={ct.evidenceNeed} color={ct.accentColor} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value, color }) {
  return (
    <div>
      <span className="font-semibold text-faint">{label}: </span>
      <span style={color ? { color } : {}} className={color ? "font-semibold" : "text-soft"}>
        {value}
      </span>
    </div>
  );
}
