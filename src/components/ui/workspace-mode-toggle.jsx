"use client";

import { useRouter, usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TAB_STATE_KEYS, tabHasActivity } from "@/lib/tabState";

// emoji  → the always-visible icon (never moves)
// text   → the label that animates in/out (shown only when the tab is active)
// color  → the tab's vibrant identity colour (null → Studio keeps cyan classes)
// stateKey → localStorage key used to detect in-progress work (multitask dot)
const MODES = [
  { id: "studio",  emoji: "🎛️", text: "Studio",                   href: "/dashboard/generate", locked: false, soon: false, color: null,      stateKey: null },
  { id: "reels",   emoji: "⚡",  text: "Micro Content (1 min)",    href: "/dashboard/reels",    locked: false, soon: false, color: "#f97316", stateKey: TAB_STATE_KEYS.reels },
  { id: "youtube", emoji: "🎬",  text: "Long Content (10 min)",    href: "/dashboard/youtube",  locked: false, soon: false, color: "#7c3aed", stateKey: null },
  { id: "podcast", emoji: "🎙️", text: "Podcast Content (30 min)", href: "/dashboard/podcast",  locked: false, soon: false, color: "#f43f5e", stateKey: TAB_STATE_KEYS.podcast },
];

// ── Per-tab button — handles its own hover state so inline colour works ───────
function TabButton({ m, active, hasActivity, activeCls, lockedCls, idleCls, onTabClick }) {
  const [hovered, setHovered] = useState(false);
  const tc = m.color; // vibrant hex colour for this tab (null = studio default)

  // Build inline styles — works on both #ffffff and #212121 backgrounds.
  // Inactive: no background / no border.
  // Active: a clear colour-tinted pill + ring. The label colour is the tab's
  // vibrant hue by default (great on the dark theme); in LIGHT mode a CSS rule
  // (`html:not(.dark) .navtab-active`, see globals.css) overrides it with
  // `!important` to the neutral high-contrast text token, since vibrant hues
  // read poorly on white. `!important` author rules beat non-important inline.
  let inlineStyle = {};
  if (active && tc) {
    inlineStyle = {
      background: tc + "26",                       // ~15% tint — a clear bright pill
      boxShadow: `inset 0 0 0 1px ${tc}66`,        // ~40% ring
      color: tc,                                    // vibrant label (dark mode); CSS neutralises in light
    };
  } else if (!active && !m.locked && hovered && tc) {
    inlineStyle = { background: tc + "1f" };
  }

  // Multitask dot only on INACTIVE tabs that have work in progress.
  const showDot = !active && hasActivity && tc;

  return (
    <button
      role="tab"
      aria-selected={active}
      aria-label={m.text}
      style={inlineStyle}
      onMouseEnter={() => !m.locked && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onTabClick}
      className={`flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
        active
          ? tc ? "navtab-active" : activeCls   // coloured tabs → vibrant inline + light-mode CSS override
          : m.locked ? lockedCls
          : idleCls
      }`}
    >
      {/* Emoji icon — fixed anchor, never moves */}
      <span className="navtab-emoji">
        {m.emoji}
        {showDot && <span className="navtab-dot" style={{ background: tc }} />}
      </span>

      {/* Label — clipped to width 0 when inactive, animates open when active */}
      <span className="navtab-label" data-active={active ? "true" : "false"}>
        {m.text}
      </span>

      {m.soon && active && <Lock size={9} className="ml-1 opacity-60" />}
    </button>
  );
}

// ── Main toggle ───────────────────────────────────────────────────────────────
export default function WorkspaceModeToggle({ tone = "default", activeOverride = null }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [comingSoon, setComingSoon] = useState(null);

  // Track which tabs have persisted work in progress → multitask dots.
  const [activity, setActivity] = useState({});
  useEffect(() => {
    const refresh = () =>
      setActivity({
        reels:   tabHasActivity(TAB_STATE_KEYS.reels),
        podcast: tabHasActivity(TAB_STATE_KEYS.podcast),
      });
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const activeId =
    activeOverride
    ?? (pathname?.startsWith("/dashboard/reels")    ? "reels"
      : pathname?.startsWith("/dashboard/youtube") ? "youtube"
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
        {MODES.map((m) => (
          <TabButton
            key={m.id}
            m={m}
            active={m.id === activeId}
            hasActivity={m.id === "reels" ? activity.reels : m.id === "podcast" ? activity.podcast : false}
            activeCls={activeCls}
            lockedCls={lockedCls}
            idleCls={idleCls}
            onTabClick={() => {
              if (m.soon)        setComingSoon(m.text);
              else if (!m.locked) router.push(m.href);
            }}
          />
        ))}
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
              <div className="mb-4 text-5xl">{comingSoon.includes("Long Content") ? "▶️" : "🎙️"}</div>
              <h2 className="mb-2 font-display text-xl font-bold">{comingSoon}</h2>
              <p className="mb-6 text-sm text-faint">
                The {comingSoon} pipeline is in development. Join the waitlist and we'll notify you when it's ready.
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
