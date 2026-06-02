"use client";

import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import Logo from "@/components/ui/logo";
import LabWorkspace from "@/components/LabWorkspace";
import WorkspaceModeToggle from "@/components/ui/workspace-mode-toggle";
import { useAuth } from "@/lib/auth-context";

export default function LabPage() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen w-full flex-col bg-[#0D0F12]">
      {/* Top chrome — mode toggle + minimal identity */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/[0.05] bg-[#0B0D10] px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.08] text-white/60 transition hover:bg-white/[0.04] hover:text-white"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={15} />
          </Link>
          <Logo size={26} href="/dashboard" />
          <div className="h-5 w-px bg-white/[0.08]" />
          <WorkspaceModeToggle tone="dark" />
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <Link
              href="/dashboard/billing"
              className="hidden items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs font-semibold text-white/80 sm:flex"
            >
              <Zap size={13} className="text-[#34C759]" />
              <span className="text-[#34C759]">{user.credits}</span>
              <span className="text-white/40">credits</span>
            </Link>
          )}
        </div>
      </header>

      <LabWorkspace />
    </div>
  );
}
