"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Loader2 } from "lucide-react";
import Sidebar from "./sidebar";
import NavActions from "@/components/ui/nav-actions";
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
const FULLSCREEN_ROUTES = ["/dashboard/workflow-builder", "/dashboard/generate", "/dashboard/lab", "/dashboard/agents", "/dashboard/reels", "/dashboard/youtube", "/dashboard/podcast", "/dashboard/history", "/dashboard/library"];
const FULLSCREEN_REGEX  = /^\/dashboard\/workspace\/[^/]+\/(workflow|pipeline)\//;

export default function DashboardShell({ children }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <Loader2 size={24} className="animate-spin text-[#2563eb]" />
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

          <NavActions />
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
