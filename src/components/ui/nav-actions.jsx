"use client";

/**
 * NavActions — shared right-side nav for all full-screen pages.
 * Renders: [⚡ credits chip] [theme toggle] [Avatar ▾ dropdown]
 *
 * Credits chip → Buy Credits page (/dashboard/billing)
 * Theme toggle → light/dark (moved out of the dropdown)
 * Avatar menu  → User info · Agents/Library/History/API · Account Settings · Sign Out
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Zap, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/dashboard/dashboard-shell";

const MENU_LINKS = [
  { icon: "📋", label: "Agents",  href: "/dashboard/agents"   },
  { icon: "📚", label: "Library", href: "/dashboard/library"  },
  { icon: "🕐", label: "History", href: "/dashboard/history"  },
  { icon: "🔌", label: "API",     href: "/dashboard/settings" },
];

// ── Dropdown shell ────────────────────────────────────────────────────────────
function DropdownShell({ children }) {
  return (
    <div
      className="absolute right-0 top-[44px] z-[100] bg-[rgb(var(--panel))]"
      style={{
        border: "0.5px solid rgb(var(--border))",
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        padding: 6,
        minWidth: 200,
      }}
    >
      {children}
    </div>
  );
}

// ── Dropdown item ─────────────────────────────────────────────────────────────
function DropItem({ href, onClick, className = "", children }) {
  const base =
    "flex w-full items-center gap-2.5 rounded-md text-[13px] font-medium text-[rgb(var(--text))] transition hover:bg-[rgb(var(--bg-soft))]";
  if (href) {
    return (
      <Link href={href} onClick={onClick} className={`${base} ${className}`} style={{ padding: "9px 16px" }}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={`${base} ${className}`} style={{ padding: "9px 16px" }}>
      {children}
    </button>
  );
}

// ── Credits chip — compact, lives in the nav bar ──────────────────────────────
function CreditsChip({ credits, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label="Buy credits"
      className="flex items-center transition"
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: "rgb(var(--accent))",
        background: hover ? "rgba(37,99,235,0.13)" : "rgba(37,99,235,0.08)",
        border: "0.5px solid rgba(37,99,235,0.20)",
        borderRadius: 20,
        padding: "4px 10px",
        gap: 4,
        cursor: "pointer",
      }}
    >
      <Zap size={13} style={{ color: "#f59e0b" }} className="shrink-0" />
      <span style={{ color: "rgb(var(--accent))" }}>{credits} cr</span>
    </button>
  );
}

// ── Theme toggle — compact icon button ────────────────────────────────────────
function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const isDark = theme !== "light";
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center justify-center transition hover:bg-[rgb(var(--bg-soft))]"
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "transparent",
        color: "rgb(var(--text-soft))",
        border: "0.5px solid rgb(var(--border))",
        fontSize: 15,
        lineHeight: 1,
      }}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}

// ── Main NavActions component ─────────────────────────────────────────────────
export default function NavActions() {
  const { user, logout } = useAuth();
  const router  = useRouter();
  const [avatarOpen, setAvatarOpen] = useState(false);

  if (!user) return null;

  const closeAll = () => setAvatarOpen(false);

  return (
    <div className="flex items-center gap-2">

      {/* ── Credits chip ───────────────────────────────────────────────── */}
      <CreditsChip credits={user.credits} onClick={() => router.push("/dashboard/billing")} />

      {/* ── Theme toggle ───────────────────────────────────────────────── */}
      <ThemeToggleButton />

      {/* ── Avatar button + dropdown ───────────────────────────────────── */}
      <div className="relative">
        <button
          type="button"
          aria-label="Account menu"
          onClick={() => setAvatarOpen(v => !v)}
          className="flex items-center gap-1.5 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] py-1 pl-1 pr-2 transition hover:border-[rgb(var(--border))]"
        >
          <Avatar user={user} size={26} />
          <ChevronDown size={13} className="hidden text-faint sm:block" />
        </button>

        {avatarOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={closeAll} />
            <DropdownShell>
              {/* User info */}
              <div style={{ padding: "9px 16px 10px" }}>
                <p className="text-[13px] font-bold text-[rgb(var(--text))]">{user.name}</p>
                <p className="truncate text-faint" style={{ fontSize: 12 }}>{user.email}</p>
              </div>

              <div style={{ height: 1, background: "rgb(var(--border))", margin: "4px 0" }} />

              {/* Agents / Library / History / API */}
              {MENU_LINKS.map(item => (
                <DropItem key={item.href} href={item.href} onClick={closeAll}>
                  <span className="text-base leading-none">{item.icon}</span>
                  {item.label}
                </DropItem>
              ))}

              <div style={{ height: 1, background: "rgb(var(--border))", margin: "4px 0" }} />

              {/* Account Settings + Sign Out */}
              <DropItem href="/dashboard/profile" onClick={closeAll}>
                <span className="text-base leading-none">⚙️</span>
                Account Settings
              </DropItem>
              <DropItem
                onClick={() => { logout(); closeAll(); router.push("/"); }}
                className="!text-[#ef4444] hover:!bg-[rgba(239,68,68,0.08)]"
              >
                <span className="text-base leading-none">🚪</span>
                Sign Out
              </DropItem>
            </DropdownShell>
          </>
        )}
      </div>

    </div>
  );
}
