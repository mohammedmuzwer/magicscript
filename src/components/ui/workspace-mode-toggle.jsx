"use client";

import { useRouter, usePathname } from "next/navigation";
import { Wand2, Clapperboard, Youtube, Mic2, Lock } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MODES = [
  { id: "studio", label: "Studio", href: "/dashboard/generate", icon: Wand2,       locked: false, soon: false },
  { id: "reels",  label: "Reels",  href: "/dashboard/reels",    icon: Clapperboard, locked: false, soon: false },
  { id: "youtube",label: "YouTube",href: "#",                   icon: Youtube,      locked: true,  soon: true  },
  { id: "podcast",label: "Podcast",href: "/dashboard/podcast",  icon: Mic2,         locked: false, soon: false },
];

export default function WorkspaceModeToggle({ tone = "default", activeOverride = null }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [comingSoon, setComingSoon] = useState(null);

  // activeOverride lets secondary pages (History, Agents, Library) explicitly
  // tell the toggle which product the user is currently viewing — instead of
  // falling back to the default "studio" when the URL doesn't match a product.
  const activeId =
    activeOverride
    ?? (pathname?.startsWith("/dashboard/reels")    ? "reels"
      : pathname?.startsWith("/dashboard/podcast") ? "podcast"
      : pathname?.startsWith("/dashboard/generate") ? "studio"
      : "studio");

  const shell =
    tone === "dark"
      ? "border-white/[0.08] bg-white/[0.03]"
      : "border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))]";

  const activeCls =
    tone === "dark"
      ? "bg-[#13161A] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
      : "bg-[rgb(var(--panel))] text-cyan shadow-[inset_0_0_0_1px_rgb(var(--border))]";
  const idleCls =
    tone === "dark"
      ? "text-white/60 hover:text-white"
      : "text-soft hover:text-[rgb(var(--text))]";
  const lockedCls =
    tone === "dark"
      ? "text-white/30 cursor-default"
      : "text-faint opacity-50 cursor-default";

  return (
    <>
      <div
        role="tablist"
        aria-label="Workspace mode"
        className={`inline-flex items-center gap-0.5 rounded-xl border p-0.5 ${shell}`}
      >
        {MODES.map((m) => {
          const active = m.id === activeId;
          const Icon   = m.icon;
          return (
            <button
              key={m.id}
              role="tab"
              aria-selected={active}
              onClick={() => {
                if (m.soon)        setComingSoon(m.label);
                else if (!m.locked) router.push(m.href);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                active ? activeCls : m.locked ? lockedCls : idleCls
              }`}
            >
              <Icon size={13} />
              {m.label}
              {m.soon && <Lock size={9} className="opacity-60" />}
            </button>
          );
        })}
      </div>

      {/* Coming Soon modal */}
      <AnimatePresence>
        {comingSoon && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-navy-950/70 backdrop-blur-sm"
              onClick={() => setComingSoon(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="fixed left-1/2 top-1/2 z-[70] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-8 text-center shadow-card"
            >
              <div className="mb-4 text-5xl">{comingSoon === "YouTube" ? "▶️" : "🎙️"}</div>
              <h2 className="mb-2 font-display text-xl font-bold">{comingSoon} Agent</h2>
              <p className="mb-6 text-sm text-faint">
                The {comingSoon} Agent is in development. Join the waitlist and we'll notify you when it's ready.
              </p>
              <button className="mb-3 w-full rounded-xl bg-cyan py-2.5 text-sm font-bold text-navy-950 transition hover:brightness-110">
                Join Waitlist
              </button>
              <button onClick={() => setComingSoon(null)} className="text-xs text-faint hover:text-soft transition">
                Maybe later
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
