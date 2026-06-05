"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import TopicInsightPanel from "@/components/reels/TopicInsightPanel";

/**
 * Slide-in drawer that shows Topic Intelligence when a topic is clicked.
 * Replaces the persistent right panel — only appears when content exists.
 */
export default function TopicDrawer({ preview, onClose }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {preview && (
        <>
          {/* Backdrop — subtle, doesn't block center panel */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]"
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className="fixed right-0 top-0 bottom-0 z-40 flex flex-col w-[320px] border-l border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] shadow-2xl"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-4 py-3">
              <div>
                <p className="text-sm font-bold">Topic Intelligence</p>
                <p className="text-[10px] text-faint">Doctor Farmer analysis</p>
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[rgb(var(--border))] text-faint hover:text-[rgb(var(--text))] hover:border-[rgb(var(--text))]/20 transition"
              >
                <X size={13} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-3">
              <TopicInsightPanel preview={preview} />
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
