"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bookmark, BookOpen, Sparkles, Video, Image as ImageIcon,
  Mic, Film, Tv, Youtube, Settings2,
  ChevronDown, ChevronRight, Search, Bot,
  History as HistoryIcon, KeyRound, Zap, LogOut, UserCircle, CreditCard,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { SAVED_LIBRARY } from "@/lib/mock-data";
import GenerationCard from "@/components/dashboard/generation-card";
import Logo from "@/components/ui/logo";
import ThemeToggle from "@/components/ui/theme-toggle";
import WorkspaceModeToggle from "@/components/ui/workspace-mode-toggle";
import { Avatar } from "@/components/dashboard/dashboard-shell";

// ── Top nav links (mirrors Agents/History header) ──────────────────────────
const NAV_LINKS = [
  { label: "Agents",  href: "/dashboard/agents",   icon: Bot          },
  { label: "Library", href: "/dashboard/library",  icon: Bookmark     },
  { label: "History", href: "/dashboard/history",  icon: HistoryIcon  },
  { label: "🔑 API",  href: "/dashboard/settings", icon: KeyRound     },
];

// ── Product tabs ──────────────────────────────────────────────────────────────
const PRODUCT_TABS = [
  { id: "studio",  label: "Studio",  icon: Tv,      active: true  },
  { id: "reels",   label: "Reels",   icon: Film,    active: true  },
  { id: "podcast", label: "Podcast", icon: Mic,     active: false },
  { id: "youtube", label: "YouTube", icon: Youtube, active: false },
];

// ── Category filters in the left rail ──────────────────────────────────────
const CATEGORY_FILTERS = [
  { id: "all",        label: "All Saves",  icon: Bookmark },
  { id: "reels",      label: "Reels",      icon: Video    },
  { id: "carousels",  label: "Carousels",  icon: ImageIcon },
  { id: "podcasts",   label: "Podcasts",   icon: Mic      },
];

// ── Library stats (right-side summary) ─────────────────────────────────────
const LIBRARY_STATS = [
  { label: "Total Saved",        val: String(SAVED_LIBRARY.length) },
  { label: "Platforms Covered",  val: "4 of 6" },
  { label: "Languages Saved",    val: "3"      },
  { label: "Avg. Confidence",    val: "68%"    },
  { label: "Ready to Re-Export", val: String(SAVED_LIBRARY.length) },
];

// ── Time helper ───────────────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Reels Library panel — reads completed sessions from localStorage
// ═══════════════════════════════════════════════════════════════════════════
function ReelsLibraryPanel() {
  const [sessions, setSessions]   = useState([]);
  const [selected, setSelected]   = useState(null);
  const [search,   setSearch]     = useState("");
  const [copied,   setCopied]     = useState(false);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("ms_reels_sessions") || "[]");
      const completed = raw.filter(s => s.status === "completed" && s.reels?.length > 0);
      setSessions(completed);
      if (completed.length) setSelected(completed[0]);
    } catch {}
  }, []);

  const filtered = search
    ? sessions.filter(s => (s.keyword ?? "").toLowerCase().includes(search.toLowerCase()))
    : sessions;

  const handleCopyAll = async () => {
    if (!selected?.reels) return;
    const text = selected.reels.map((r, i) => `REEL ${i + 1}: ${r.topic}\n\n${r.script ?? "(script not stored in library)"}`).join("\n\n" + "═".repeat(40) + "\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    if (!selected) return;
    const text = selected.reels.map((r, i) => `REEL ${i + 1}\n${"─".repeat(50)}\n${r.topic}\n\n${r.script ?? "(script not stored)"}\n\n`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `magicscript-reels-${selected.keyword ?? "batch"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">

      {/* ── LEFT RAIL ─────────────────────────────────────────────────────── */}
      <aside className="flex w-[280px] shrink-0 flex-col overflow-hidden border-r border-[rgb(var(--border))] bg-[rgb(var(--panel))]">
        <div className="shrink-0 border-b border-[rgb(var(--border))] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Reels Library</p>
          <p className="mt-0.5 text-[10px] text-faint/60">
            {sessions.length} completed batch{sessions.length !== 1 ? "es" : ""}
          </p>
        </div>

        <div className="shrink-0 border-b border-[rgb(var(--border))] px-3 py-2.5">
          <div className="flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-2.5 py-1.5">
            <Search size={12} className="shrink-0 text-faint" />
            <input type="text" placeholder="Search by keyword…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-[11px] text-[rgb(var(--text))] placeholder-faint focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <div className="px-3 py-12 text-center">
              <Film size={22} className="mx-auto text-faint/40 mb-3" />
              <p className="text-[11px] font-semibold text-faint mb-1">No saved reels yet</p>
              <p className="text-[10px] text-faint/60 leading-relaxed">
                Complete a reel session and click "Save All" to add it here.
              </p>
            </div>
          )}
          {filtered.map(s => {
            const isActive = selected?.id === s.id;
            return (
              <button key={s.id} onClick={() => setSelected(s)}
                className={`group flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                  isActive ? "border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] ring-1 ring-inset ring-cyan/20" : "border-transparent hover:border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-soft))]"
                }`}
              >
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs ${isActive ? "bg-cyan/15 text-cyan" : "bg-[rgb(var(--bg-soft))] text-faint"}`}>
                  <Film size={12} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-soft capitalize">{s.keyword || "Untitled"}</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <p className="text-[9px] text-faint">{timeAgo(s.updatedAt ?? s.createdAt)}</p>
                    <span className="text-faint/30">·</span>
                    <p className="text-[9px] text-faint">{s.reels?.length ?? 0} reel{s.reels?.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                {isActive && <ChevronRight size={10} className="shrink-0 text-cyan" />}
              </button>
            );
          })}
        </div>

        <div className="shrink-0 border-t border-[rgb(var(--border))] px-4 py-2.5">
          <Link href="/dashboard/reels"
            className="flex items-center gap-1.5 text-[10px] font-semibold text-cyan hover:underline transition"
          >
            <Film size={10} /> + Create New Reels
          </Link>
        </div>
      </aside>

      {/* ── RIGHT DETAIL ──────────────────────────────────────────────────── */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {selected ? (
          <>
            {/* Header */}
            <div className="shrink-0 border-b border-[rgb(var(--border))] px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan/15 text-cyan">
                    <Film size={16} />
                  </span>
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-emerald-400 mb-1">
                      <span className="h-1 w-1 rounded-full bg-current" /> Completed
                    </span>
                    <h2 className="text-base font-bold capitalize">{selected.keyword || "Untitled"}</h2>
                    <p className="mt-0.5 text-xs text-faint">{selected.reels?.length ?? 0} reels · Education format · PubMed verified</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button onClick={handleCopyAll}
                    className="flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] px-3 py-1.5 text-xs font-semibold text-soft transition hover:border-cyan/30 hover:text-cyan"
                  >
                    {copied ? "✓ Copied!" : "📋 Copy All"}
                  </button>
                  <button onClick={handleExport}
                    className="flex items-center gap-1.5 rounded-lg bg-cyan px-3 py-1.5 text-xs font-bold text-[rgb(var(--bg))] transition hover:opacity-90"
                  >
                    📥 Export
                  </button>
                </div>
              </div>
            </div>

            {/* Reel cards */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
              {(selected.reels ?? []).map((reel, i) => (
                <div key={i} className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] overflow-hidden">
                  <div className="flex items-center gap-3 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-4 py-2.5">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan/15 text-[10px] font-bold text-cyan">{i + 1}</span>
                    <p className="flex-1 truncate text-[11px] font-semibold text-soft">{reel.topic}</p>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {reel.evidenceScore != null && (
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${reel.evidenceScore >= 70 ? "bg-emerald-500/10 text-emerald-400" : reel.evidenceScore >= 40 ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>
                          🔬 {reel.evidenceScore}/100
                        </span>
                      )}
                      <span className="rounded-full border border-[rgb(var(--border))] px-2 py-0.5 text-[9px] font-semibold text-faint">
                        {reel.shootStatus === "posted" ? "✅ Posted" : reel.shootStatus === "recorded" ? "🎥 Recorded" : "📌 To Shoot"}
                      </span>
                    </div>
                  </div>
                  {reel.script ? (
                    <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-soft max-h-[200px] overflow-y-auto p-4">
                      {reel.script}
                    </pre>
                  ) : (
                    <p className="px-4 py-3 text-[11px] text-faint italic">Script not stored. Re-generate from History to recover.</p>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <Film size={28} className="mx-auto text-faint/40 mb-3" />
              <p className="text-sm font-semibold text-faint">Select a saved batch to view scripts</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Studio Library panel (the default — shows the saved content vault)
// ═══════════════════════════════════════════════════════════════════════════
function StudioLibraryPanel() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search,         setSearch]         = useState("");

  // Filter
  const filtered = SAVED_LIBRARY.filter((g) => {
    if (search && !(g.topic ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCategory === "all") return true;
    if (activeCategory === "reels"     && (g.platform ?? "").includes("instagram"))  return true;
    if (activeCategory === "carousels" && (g.platform ?? "").includes("carousel"))   return true;
    if (activeCategory === "podcasts"  && (g.platform ?? "").includes("podcast"))    return true;
    return false;
  });

  const hasSaves = filtered.length > 0;

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">

      {/* ── LEFT RAIL — category filters ─────────────────────────────────── */}
      <aside className="flex w-[280px] shrink-0 flex-col overflow-hidden border-r border-[rgb(var(--border))] bg-[rgb(var(--panel))]">

        <div className="shrink-0 border-b border-[rgb(var(--border))] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Library Scope</p>
          <p className="mt-0.5 text-[10px] text-faint/60">Browse your saved content by type</p>
        </div>

        {/* Search */}
        <div className="shrink-0 px-3 py-2.5 border-b border-[rgb(var(--border))]">
          <div className="flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-2.5 py-1.5">
            <Search size={12} className="shrink-0 text-faint" />
            <input
              type="text"
              placeholder="Search saves…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-[11px] text-[rgb(var(--text))] placeholder-faint focus:outline-none"
            />
          </div>
        </div>

        {/* Category buttons */}
        <div className="flex-1 space-y-0.5 overflow-y-auto p-2 scrollbar-thin">
          {CATEGORY_FILTERS.map(({ id, label, icon: Icon }) => {
            const isActive = id === activeCategory;
            const count = id === "all" ? SAVED_LIBRARY.length : 0;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveCategory(id)}
                className={`group flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                  isActive
                    ? "border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] ring-1 ring-inset ring-cyan/20"
                    : "border-transparent hover:border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-soft))]"
                }`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  isActive ? "bg-cyan/15 text-cyan" : "bg-[rgb(var(--bg-soft))] text-faint"
                }`}>
                  <Icon size={12} />
                </span>
                <span className={`flex-1 text-[11px] font-semibold transition ${isActive ? "text-[rgb(var(--text))]" : "text-soft group-hover:text-[rgb(var(--text))]"}`}>
                  {label}
                </span>
                {id === "all" && count > 0 && (
                  <span className="rounded-full bg-cyan/15 px-1.5 py-0.5 text-[9px] font-bold text-cyan">
                    {count}
                  </span>
                )}
                {isActive && <ChevronRight size={10} className="shrink-0 text-cyan" />}
              </button>
            );
          })}
        </div>

        {/* CTA pinned to bottom */}
        <div className="shrink-0 border-t border-[rgb(var(--border))] p-3">
          <Link
            href="/dashboard/generate"
            className="flex items-center justify-center gap-1.5 w-full rounded-lg border border-cyan/30 bg-cyan/10 py-2 text-[11px] font-bold text-cyan hover:bg-cyan/15 transition"
          >
            <Sparkles size={11} />
            New Generation
          </Link>
        </div>
      </aside>

      {/* ── CENTER — saved content workspace ─────────────────────────────── */}
      <main className="flex flex-1 min-w-0 flex-col overflow-hidden">

        {/* Identity bar */}
        <div className="shrink-0 border-b border-[rgb(var(--border))] px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan/15 text-cyan">
                <BookOpen size={16} />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-cyan/25 bg-cyan/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-cyan">
                    <span className="h-1 w-1 rounded-full bg-cyan" />
                    Content Vault
                  </span>
                </div>
                <h2 className="mt-0.5 text-base font-bold truncate">Saved Content Library</h2>
                <p className="mt-0.5 text-xs text-faint">
                  {filtered.length} saved · re-open to export as reel, shorts caption, or teleprompter
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable card grid */}
        <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">
          {hasSaves ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 content-start">
              {filtered.map((gen) => (
                <GenerationCard key={gen.id} gen={gen} />
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-4">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[rgb(var(--panel))] border border-[rgb(var(--border))]">
                  <Bookmark size={26} className="text-faint/40" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-soft">
                    {search ? `No saves match "${search}"` : "Nothing saved yet"}
                  </h3>
                  <p className="text-xs text-faint mt-1">
                    {search ? "Try a different search term." : "Generate content and tap save to build your library."}
                  </p>
                </div>
                <Link
                  href="/dashboard/generate"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan text-[rgb(var(--bg))] text-xs font-bold hover:opacity-90 transition"
                >
                  <Sparkles size={13} />
                  New Generation
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── RIGHT — library stats ────────────────────────────────────────── */}
      <aside className="hidden w-[300px] shrink-0 flex-col overflow-hidden border-l border-[rgb(var(--border))] bg-[rgb(var(--panel))] xl:flex">

        <div className="shrink-0 border-b border-[rgb(var(--border))] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Library Summary</p>
          <p className="mt-0.5 text-[10px] text-faint/60">Saved content overview</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin">
          {LIBRARY_STATS.map(({ label, val }) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-3 py-2.5"
            >
              <span className="text-xs text-faint">{label}</span>
              <span className="text-xs font-bold text-soft tabular-nums">{val}</span>
            </div>
          ))}
        </div>

        <div className="shrink-0 border-t border-[rgb(var(--border))] p-4">
          <p className="text-[10px] uppercase tracking-widest text-faint/60 font-bold mb-1.5">Export Tip</p>
          <p className="text-[11px] text-faint leading-relaxed">
            Open any saved script to re-export as a reel, shorts caption, or teleprompter view — citations included.
          </p>
        </div>
      </aside>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Main page — Agents-style fullscreen layout
// ═══════════════════════════════════════════════════════════════════════════
export default function LibraryPage() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [activeProduct, setActiveProduct] = useState("studio");

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) return null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[rgb(var(--bg))]">

      {/* ── Header (matches Agents / History exactly) ─────────────────── */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[rgb(var(--border))] glass-strong px-4 lg:px-6">

        <div className="flex items-center gap-3">
          <Logo className="h-7 w-auto" />
          <WorkspaceModeToggle activeOverride={activeProduct} />
        </div>

        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => {
            const active = href === "/dashboard/library";
            return (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${
                  active
                    ? "bg-[rgb(var(--bg-soft))] text-[rgb(var(--text))]"
                    : "text-faint hover:bg-[rgb(var(--bg-soft))] hover:text-soft"
                }`}
              >
                <Icon size={13} />
                {label}
              </Link>
            );
          })}
        </nav>

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
                <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-[rgb(var(--border))] glass-strong p-1.5 shadow-card">
                  <div className="border-b border-[rgb(var(--border))] px-3 py-2.5">
                    <div className="text-sm font-semibold">{user.name}</div>
                    <div className="truncate text-xs text-faint">{user.email}</div>
                  </div>
                  <Link href="/dashboard/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-soft transition hover:bg-electric/8">
                    <UserCircle size={15} /> Profile
                  </Link>
                  <Link href="/dashboard/billing" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-soft transition hover:bg-electric/8">
                    <CreditCard size={15} /> Subscription
                  </Link>
                  <button
                    onClick={() => { logout(); router.push("/"); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-300 transition hover:bg-rose-500/10"
                  >
                    <LogOut size={15} /> Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* Product strip — same as Agents/History */}
        <div className="flex w-[72px] shrink-0 flex-col border-r border-[rgb(var(--border))] bg-[rgb(var(--panel))]">
          <div className="shrink-0 border-b border-[rgb(var(--border))] px-2 py-3">
            <Settings2 size={14} className="mx-auto text-faint" />
          </div>
          <div className="flex flex-col gap-0.5 p-2 pt-3">
            {PRODUCT_TABS.map(({ id, label, icon: Icon, active }) => (
              <button
                key={id}
                type="button"
                disabled={!active}
                onClick={() => active && setActiveProduct(id)}
                title={!active ? `${label} library — coming soon` : `${label} library`}
                className={`flex flex-col items-center gap-1 rounded-xl border py-2 text-[9px] font-bold uppercase tracking-wide transition-all ${
                  !active
                    ? "cursor-not-allowed opacity-25 border-transparent text-faint"
                    : activeProduct === id
                      ? id === "studio"
                        ? "border-cyan/30 bg-cyan/15 text-cyan"
                        : "border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] text-[rgb(var(--text))]"
                      : "border-transparent text-faint hover:border-[rgb(var(--border))] hover:text-soft"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {activeProduct === "studio" && <StudioLibraryPanel />}
        {activeProduct === "reels"  && <ReelsLibraryPanel />}
        {activeProduct !== "studio" && activeProduct !== "reels" && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-faint">
              {PRODUCT_TABS.find((p) => p.id === activeProduct)?.label} library — coming soon
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
