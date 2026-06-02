"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Zap, LogOut, UserCircle, CreditCard, ChevronDown, Loader2 } from "lucide-react";
import Sidebar from "./sidebar";
import ThemeToggle from "@/components/ui/theme-toggle";
import { useAuth } from "@/lib/auth-context";

const TITLES = {
  "/dashboard/generate": "Generation Studio",
  "/dashboard/library": "Saved Library",
  "/dashboard/history": "AI Content History",
  "/dashboard/agents": "Agent Directory",
  "/dashboard/billing": "Subscription & Credits",
  "/dashboard/profile": "Profile",
  "/dashboard/workflow-builder": "Workflow Builder",
  "/dashboard/settings": "API Keys",
  "/dashboard/reels/history": "Reels History",
  "/dashboard/reels/library": "Reels Library",
};

// Pages that manage their own full-screen layout (no sidebar / topbar / container)
const FULLSCREEN_ROUTES = ["/dashboard/workflow-builder", "/dashboard/generate", "/dashboard/lab", "/dashboard/agents", "/dashboard/reels", "/dashboard/podcast", "/dashboard/history", "/dashboard/library"];
const FULLSCREEN_REGEX  = /^\/dashboard\/workspace\/[^/]+\/(workflow|pipeline)\//;

export default function DashboardShell({ children }) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  useEffect(() => setSidebarOpen(false), [pathname]);

  // Not authenticated + ready → redirect fires in effect; render nothing (no flash)
  if (ready && !user) return null;

  // Still initialising on the server or first paint — show minimal spinner
  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-[rgb(var(--bg))]">
        <Loader2 size={24} className="animate-spin text-cyan" />
      </div>
    );
  }

  // Full-screen pages handle their own layout — just auth-gate and render
  if (FULLSCREEN_ROUTES.some((r) => pathname.startsWith(r)) || FULLSCREEN_REGEX.test(pathname)) {
    return <>{children}</>;
  }

  const title = TITLES[pathname] || "Dashboard";

  return (
    <div className="min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-[260px]">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-[rgb(var(--border))] glass-strong px-4 lg:px-7">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-[rgb(var(--border))] lg:hidden"
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="font-display text-base font-bold leading-tight sm:text-lg">
                {title}
              </h1>
              <p className="hidden text-[11px] text-faint sm:block">
                Evidence-based multilingual content studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/billing"
              className="hidden items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-2.5 py-1.5 text-xs font-semibold sm:flex"
            >
              <Zap size={13} className="text-cyan" />
              <span className="text-cyan">{user.credits}</span>
              <span className="text-faint">credits</span>
            </Link>
            <ThemeToggle />
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] py-1 pl-1 pr-2"
              >
                <Avatar user={user} />
                <ChevronDown size={14} className="hidden text-faint sm:block" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-[rgb(var(--border))] glass-strong p-1.5 shadow-card">
                    <div className="border-b border-[rgb(var(--border))] px-3 py-2.5">
                      <div className="text-sm font-semibold">{user.name}</div>
                      <div className="truncate text-xs text-faint">{user.email}</div>
                    </div>
                    <MenuLink href="/dashboard/profile" icon={UserCircle} onClick={() => setMenuOpen(false)}>
                      Profile
                    </MenuLink>
                    <MenuLink href="/dashboard/billing" icon={CreditCard} onClick={() => setMenuOpen(false)}>
                      Subscription
                    </MenuLink>
                    <button
                      onClick={() => {
                        logout();
                        router.push("/");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-300 transition hover:bg-rose-500/10"
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-7 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

export function Avatar({ user, size = 30 }) {
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      className="grid shrink-0 place-items-center rounded-lg font-display text-xs font-bold text-white"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, hsl(${user.avatarHue} 80% 55%), hsl(${
          user.avatarHue + 45
        } 70% 45%))`,
      }}
    >
      {initials}
    </span>
  );
}

function MenuLink({ href, icon: Icon, children, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-soft transition hover:bg-electric/8 hover:text-[rgb(var(--text))]"
    >
      <Icon size={16} /> {children}
    </Link>
  );
}
