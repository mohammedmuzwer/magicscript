"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Play, ShieldCheck, FlaskConical, Quote } from "lucide-react";
import { AuroraBackground } from "@/components/ui/background";
import { ConfidenceRing } from "@/components/ui/meters";
import { VerdictBadge, SourceBadge } from "@/components/ui/badges";

const FLOAT_LANGS = [
  { code: "தமிழ்", x: "-6%", y: "12%", d: 0 },
  { code: "Tanglish", x: "92%", y: "6%", d: 0.4 },
  { code: "हिन्दी", x: "96%", y: "62%", d: 0.8 },
  { code: "മലയാളം", x: "-8%", y: "70%", d: 1.2 },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-32 lg:pt-40">
      <AuroraBackground />

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        {/* Copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="chip px-3 py-1.5 text-xs font-semibold text-soft"
          >
            <Sparkles size={13} className="text-cyan" />
            Perplexity-grade research, for health creators
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-5 font-display text-[2.6rem] font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl"
          >
            Create Viral Health Content{" "}
            <span className="gradient-text">Backed by Real Science</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-5 max-w-xl text-lg leading-relaxed text-soft"
          >
            Generate medically responsible multilingual content powered by scientific
            research verification — across English, Tamil, Tanglish, Hindi and more.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.19 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="/signup" className="btn btn-primary px-6 py-3 text-sm">
              Start Verifying <ArrowRight size={16} />
            </Link>
            <Link href="#workflow" className="btn btn-ghost px-5 py-3 text-sm">
              <Play size={15} className="text-cyan" /> Watch Demo
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-faint"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" /> PubMed · NIH · WHO · FDA
            </span>
            <span className="flex items-center gap-1.5">
              <FlaskConical size={14} className="text-cyan" /> 7 languages, native voice
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-electric" /> No card required
            </span>
          </motion.div>
        </div>

        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.21, 0.65, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md"
        >
          {/* floating language pills */}
          {FLOAT_LANGS.map((l) => (
            <motion.div
              key={l.code}
              className="absolute z-20 hidden rounded-xl border border-[rgb(var(--border))] glass-strong px-3 py-1.5 text-xs font-semibold shadow-glow-sm sm:block"
              style={{ left: l.x, top: l.y }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5 + l.d, repeat: Infinity, ease: "easeInOut", delay: l.d }}
            >
              <span className="gradient-text">{l.code}</span>
            </motion.div>
          ))}

          {/* main verification card */}
          <div className="relative z-10 rounded-3xl border border-[rgb(var(--border))] glass-strong p-5 shadow-glow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-soft">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
                </span>
                Scientific Verification
              </div>
              <VerdictBadge verdict="proven" size="sm" />
            </div>

            <div className="mt-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-3.5 py-2.5 text-sm font-medium">
              Ashwagandha for stress
            </div>

            <div className="mt-4 flex items-center gap-4">
              <ConfidenceRing value={86} size={104} stroke={9} color="#34d399" label="Evidence" />
              <div className="flex-1 space-y-2">
                <MeterRow label="Evidence strength" v={78} c="#34d399" />
                <MeterRow label="Consensus" v={81} c="#22d3ee" />
                <MeterRow label="Misinfo risk" v={28} c="#fb7185" />
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-faint">
                Sources used
              </p>
              <div className="flex gap-2">
                {["PubMed", "NIH", "WHO", "FDA"].map((s) => (
                  <SourceBadge key={s} source={s} size={34} />
                ))}
              </div>
            </div>
          </div>

          {/* floating content preview */}
          <motion.div
            className="absolute -bottom-10 -right-4 z-30 w-60 rounded-2xl border border-cyan/30 glass-strong p-3.5 shadow-glow"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan">
              <Quote size={11} /> Tanglish reel hook
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-soft">
              "Ashwagandha daily eduthaa stress semma kammi aaguthu nu science prove
              panniruku 🔥 — aana doctor kitta kelunga!"
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function MeterRow({ label, v, c }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] text-faint">
        <span>{label}</span>
        <span style={{ color: c }}>{v}</span>
      </div>
      <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-[rgb(var(--bg-soft))]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: c }}
          initial={{ width: 0 }}
          animate={{ width: `${v}%` }}
          transition={{ duration: 1, delay: 0.6 }}
        />
      </div>
    </div>
  );
}
