"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wand2,
  Bookmark,
  History,
  CreditCard,
  UserCircle,
  ShieldHalf,
  Zap,
  X,
  Bot,
  KeyRound,
  Clapperboard,
} from "lucide-react";
import Logo from "@/components/ui/logo";
import { useAuth } from "@/lib/auth-context";

const BOTTOM_NAV = [
  {
    section: "Library",
    items: [
      { label: "Saved Library", href: "/dashboard/library", icon: Bookmark },
      { label: "AI History",    href: "/dashboard/history", icon: History },
      { label: "Agents",        href: "/dashboard/agents",  icon: Bot },
    ],
  },
  {
    section: "Account",
    items: [
      { label: "API Keys",     href: "/dashboard/settings", icon: KeyRound  },
      { label: "Subscription", href: "/dashboard/billing",  icon: CreditCard },
      { label: "Profile",      href: "/dashboard/profile",  icon: UserCircle },
    ],
  },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href) =>
    href === "/dashboard/generate" ? pathname === href : pathname.startsWith(href);

  const pct = user ? Math.round((user.credits / user.creditsTotal) * 100) : 0;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo size={30} href="/dashboard" />
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg border border-[rgb(var(--border))] lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">

          {/* Studio section */}
          <div>
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-faint">
              Studio
            </p>
            <div className="space-y-0.5">
              <Link
                href="/dashboard/generate"
                onClick={onClose}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname === "/dashboard/generate"
                    ? "bg-gradient-to-r from-cyan/15 to-electric/10 text-cyan ring-1 ring-cyan/25"
                    : "text-soft hover:bg-electric/8 hover:text-[rgb(var(--text))]"
                }`}
              >
                <Wand2 size={17} className={pathname === "/dashboard/generate" ? "text-cyan" : ""} />
                Generation Studio
              </Link>
              <Link
                href="/dashboard/reels"
                onClick={onClose}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname.startsWith("/dashboard/reels")
                    ? "bg-gradient-to-r from-cyan/15 to-electric/10 text-cyan ring-1 ring-cyan/25"
                    : "text-soft hover:bg-electric/8 hover:text-[rgb(var(--text))]"
                }`}
              >
                <Clapperboard size={17} className={pathname.startsWith("/dashboard/reels") ? "text-cyan" : ""} />
                Reels Agent
              </Link>
            </div>
          </div>

          {/* Bottom nav groups */}
          {BOTTOM_NAV.map((group) => (
            <div key={group.section}>
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-faint">
                {group.section}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        active
                          ? "bg-gradient-to-r from-cyan/15 to-electric/10 text-cyan ring-1 ring-cyan/25"
                          : "text-soft hover:bg-electric/8 hover:text-[rgb(var(--text))]"
                      }`}
                    >
                      <item.icon size={17} className={active ? "text-cyan" : ""} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Admin */}
          {user?.role === "admin" && (
            <div>
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-faint">
                Staff
              </p>
              <Link
                href="/admin"
                onClick={onClose}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname.startsWith("/admin")
                    ? "bg-gradient-to-r from-cyan/15 to-electric/10 text-cyan ring-1 ring-cyan/25"
                    : "text-soft hover:bg-electric/8"
                }`}
              >
                <ShieldHalf size={17} /> Admin Console
              </Link>
            </div>
          )}
        </nav>

        {/* Credits widget */}
        <div className="m-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-3.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold">
              <Zap size={13} className="text-cyan" /> Usage credits
            </span>
            <span className="font-display font-bold text-cyan">
              {user ? user.credits : 0}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[rgb(var(--bg-soft))]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan to-electric"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-faint capitalize">{user?.plan} plan</span>
            <Link href="/dashboard/billing" className="text-[10px] font-semibold text-cyan hover:underline">
              Upgrade
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
