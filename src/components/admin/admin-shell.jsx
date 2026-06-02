"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, ShieldHalf, Lock } from "lucide-react";
import Logo from "@/components/ui/logo";
import ThemeToggle from "@/components/ui/theme-toggle";
import { useAuth } from "@/lib/auth-context";

export default function AdminShell({ children }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="grid min-h-screen place-items-center text-soft">
        <Loader2 size={24} className="animate-spin text-cyan" />
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="grid min-h-screen place-items-center px-5">
        <div className="max-w-sm rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/12 text-rose-300">
            <Lock size={24} />
          </div>
          <h1 className="mt-4 font-display text-lg font-bold">Admin access only</h1>
          <p className="mt-1.5 text-sm text-soft">
            This console is restricted to staff accounts. Log in with an email starting with{" "}
            <span className="text-cyan">admin@</span> to explore the admin demo.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link href="/dashboard" className="btn btn-ghost px-4 py-2 text-sm">
              Back to dashboard
            </Link>
            <Link href="/login" className="btn btn-primary px-4 py-2 text-sm">
              Switch account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[rgb(var(--border))] glass-strong px-5 lg:px-8">
        <div className="flex items-center gap-3">
          <Logo size={30} href="/dashboard" />
          <span className="hidden items-center gap-1.5 rounded-lg bg-electric/12 px-2.5 py-1 text-xs font-bold text-cyan sm:flex">
            <ShieldHalf size={13} /> Admin Console
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/dashboard" className="btn btn-ghost px-3 py-2 text-xs">
            <ArrowLeft size={13} /> Dashboard
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-7 lg:px-8">{children}</main>
    </div>
  );
}
