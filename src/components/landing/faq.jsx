"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { FAQS } from "@/lib/mock-data";
import Reveal from "@/components/ui/reveal";

export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="relative border-t border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] py-24">
      <div className="mx-auto max-w-3xl px-5 lg:px-8">
        <Reveal className="text-center">
          <span className="chip px-3 py-1 text-xs font-semibold text-cyan">FAQ</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Accuracy, languages & <span className="gradient-text">honest limits</span>
          </h2>
        </Reveal>

        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => {
            const active = open === i;
            return (
              <Reveal key={f.q} delay={i * 0.04}>
                <div
                  className={`overflow-hidden rounded-xl border bg-[rgb(var(--panel))] transition-colors ${
                    active ? "border-cyan/40" : "border-[rgb(var(--border))]"
                  }`}
                >
                  <button
                    onClick={() => setOpen(active ? -1 : i)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  >
                    <span className="font-display text-[15px] font-semibold">{f.q}</span>
                    <Plus
                      size={18}
                      className={`shrink-0 text-cyan transition-transform duration-300 ${
                        active ? "rotate-45" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {active && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                      >
                        <p className="px-5 pb-5 text-sm leading-relaxed text-soft">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
