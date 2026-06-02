"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import Logo from "@/components/ui/logo";
import ThemeToggle from "@/components/ui/theme-toggle";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#workflow" },
  { label: "Showcase", href: "#showcase" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-[rgb(var(--border))] glass-strong" : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Logo size={32} />

        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-soft transition hover:bg-electric/8 hover:text-cyan"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2.5 lg:flex">
          <ThemeToggle />
          <Link href="/login" className="btn btn-ghost px-4 py-2 text-sm">
            Log in
          </Link>
          <Link href="/signup" className="btn btn-primary px-4 py-2 text-sm">
            Start free <ArrowRight size={15} />
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-[rgb(var(--border))] glass-strong px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-soft hover:bg-electric/8"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Link href="/login" className="btn btn-ghost flex-1 py-2.5 text-sm">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary flex-1 py-2.5 text-sm">
                Start free
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
