"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  History as HistoryIcon, Clock, ChevronRight, ChevronDown, ExternalLink,
  Mic, Film, Tv, Youtube, Settings2, Loader2, RefreshCw,
  Search, FileText, AlertCircle, Database, Bot, Bookmark,
  KeyRound, Zap, LogOut, UserCircle, CreditCard,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { getPodcastHistory } from "@/lib/supabaseClient";
import { PODCAST_STAGES } from "@/lib/podcast/stages";
import Logo from "@/components/ui/logo";
import ThemeToggle from "@/components/ui/theme-toggle";
import WorkspaceModeToggle from "@/components/ui/workspace-mode-toggle";
import { Avatar } from "@/components/dashboard/dashboard-shell";

// ── Top nav links (mirrors the Agents header) ──────────────────────────────
const NAV_LINKS = [
  { label: "Agents",  href: "/dashboard/agents",   icon: Bot      },
  { label: "Library", href: "/dashboard/library",  icon: Bookmark },
  { label: "History", href: "/dashboard/history",  icon: HistoryIcon },
  { label: "🔑 API",  href: "/dashboard/settings", icon: KeyRound },
];

// ── Product tabs (mirrors the Agents page sidebar) ──────────────────────────
const PRODUCT_TABS = [
  { id: "studio",  label: "Studio",  icon: Tv,      active: false },
  { id: "reels",   label: "Reels",   icon: Film,    active: false },
  { id: "podcast", label: "Podcast", icon: Mic,     active: true  },
  { id: "youtube", label: "YouTube", icon: Youtube, active: false },
];

// ── Time formatting ────────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)   return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5)  return `${weeks}w ago`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function formatExactDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// Podcast History Panel — mirrors the Agents PodcastAgentPanel layout
// ═══════════════════════════════════════════════════════════════════════════
function PodcastHistoryPanel() {
  const router = useRouter();
  const [episodes, setEpisodes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState("");

  async function loadHistory() {
    setLoading(true);
    setError(null);
    try {
      const rows = await getPodcastHistory();
      setEpisodes(rows ?? []);
      if (rows?.length) setSelected((prev) => prev ?? rows[0]);
    } catch (e) {
      setError(e?.message || "Could not load history.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadHistory(); }, []);

  const filteredEpisodes = search
    ? episodes.filter((ep) => (ep.topic ?? "").toLowerCase().includes(search.toLowerCase()))
    : episodes;

  function handleViewProject(id) {
    // ZERO API call — just navigate. The podcast page hydrates from Supabase.
    router.push(`/dashboard/podcast?load=${encodeURIComponent(id)}`);
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">

      {/* ── LEFT RAIL — episode list ─────────────────────────────────────── */}
      <aside className="flex w-[280px] shrink-0 flex-col overflow-hidden border-r border-[rgb(var(--border))] bg-[rgb(var(--panel))]">

        <div className="shrink-0 border-b border-[rgb(var(--border))] px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-faint">Podcast History</p>
              <p className="mt-0.5 text-[10px] text-faint/60">
                {episodes.length} saved episode{episodes.length === 1 ? "" : "s"} · read-only
              </p>
            </div>
            <button
              type="button"
              onClick={loadHistory}
              title="Refresh history"
              disabled={loading}
              className="rounded-lg border border-[rgb(var(--border))] p-1.5 text-faint transition hover:border-cyan/40 hover:text-cyan disabled:opacity-50"
            >
              <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="shrink-0 px-3 py-2.5 border-b border-[rgb(var(--border))]">
          <div className="flex items-center gap-2 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-2.5 py-1.5">
            <Search size={12} className="shrink-0 text-faint" />
            <input
              type="text"
              placeholder="Search episodes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-[11px] text-[rgb(var(--text))] placeholder-faint focus:outline-none"
            />
          </div>
        </div>

        {/* Episode list */}
        <div className="flex-1 space-y-0.5 overflow-y-auto p-2 scrollbar-thin">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-xs text-faint">
              <Loader2 size={14} className="animate-spin" />
              Loading episodes…
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-rose-500/25 bg-rose-500/8 p-3 text-xs text-rose-400">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <AlertCircle size={12} />
                Error
              </div>
              {error}
            </div>
          )}

          {!loading && !error && filteredEpisodes.length === 0 && (
            <div className="px-3 py-12 text-center">
              <Database size={22} className="mx-auto text-faint/50 mb-3" />
              <p className="text-[11px] font-semibold text-faint mb-1">
                {episodes.length === 0 ? "No saved episodes yet" : `No matches for "${search}"`}
              </p>
              {episodes.length === 0 && (
                <p className="text-[10px] text-faint/60 leading-relaxed">
                  Complete Stage 8 of a podcast to save your first episode.
                </p>
              )}
            </div>
          )}

          {!loading && !error && filteredEpisodes.map((ep) => {
            const isActive = selected?.id === ep.id;
            const stageCount = countStages(ep);
            return (
              <button
                key={ep.id}
                type="button"
                onClick={() => setSelected(ep)}
                className={`group flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                  isActive
                    ? "border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] ring-1 ring-inset ring-cyan/20"
                    : "border-transparent hover:border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-soft))]"
                }`}
              >
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  isActive ? "bg-cyan/15 text-cyan" : "bg-[rgb(var(--bg-soft))] text-faint"
                }`}>
                  <Mic size={12} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[11px] font-semibold transition ${isActive ? "text-[rgb(var(--text))]" : "text-soft group-hover:text-[rgb(var(--text))]"}`}>
                    {ep.topic || "Untitled Episode"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock size={9} className="text-faint/70" />
                    <p className="text-[9px] text-faint">{timeAgo(ep.created_at)}</p>
                    <span className="text-faint/30">·</span>
                    <p className="text-[9px] text-faint">{stageCount}/10 stages</p>
                  </div>
                </div>
                {isActive && <ChevronRight size={10} className="shrink-0 text-cyan" />}
              </button>
            );
          })}
        </div>

        <div className="shrink-0 border-t border-[rgb(var(--border))] px-4 py-2.5">
          <p className="text-[10px] text-faint">
            <Database size={9} className="inline mr-1 -mt-px" />
            Synced from Supabase
          </p>
        </div>
      </aside>

      {/* ── RIGHT WORKSPACE — episode detail ──────────────────────────────── */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {selected ? (
          <EpisodeDetail episode={selected} onView={() => handleViewProject(selected.id)} />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <HistoryIcon size={28} className="mx-auto text-faint/40 mb-3" />
              <p className="text-sm font-semibold text-faint">
                {loading ? "Loading…" : "Select an episode to view its full pipeline"}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Episode Detail — shows the topic + per-stage breakdown + "View Project" CTA
// ═══════════════════════════════════════════════════════════════════════════
function EpisodeDetail({ episode, onView }) {
  const totalRuntime = episode?.final_script_json?.totalRuntime
                    ?? episode?.final_script_json?.script?.totalRuntime
                    ?? "—";
  const scriptBlocks = episode?.final_script_json?.scriptBlocks
                    ?? episode?.final_script_json?.script?.scriptBlocks
                    ?? [];

  return (
    <>
      {/* Identity bar */}
      <div className="shrink-0 border-b border-[rgb(var(--border))] px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan/15 text-cyan">
              <Mic size={16} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-cyan/25 bg-cyan/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-cyan">
                  <span className="h-1 w-1 rounded-full bg-cyan" />
                  Saved Episode
                </span>
                <span className="text-[10px] text-faint">{formatExactDate(episode.created_at)}</span>
              </div>
              <h2 className="mt-0.5 text-base font-bold truncate">{episode.topic || "Untitled Episode"}</h2>
              <p className="mt-0.5 text-xs text-faint">
                {totalRuntime !== "—" ? `${totalRuntime} runtime · ` : ""}
                {scriptBlocks.length ? `${scriptBlocks.length} script blocks · ` : ""}
                Stored in Supabase
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onView}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-cyan px-4 py-1.5 text-xs font-bold text-[rgb(var(--bg))] transition hover:opacity-90"
          >
            <ExternalLink size={13} />
            View Project
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5 scrollbar-thin">

        {/* Zero-API banner */}
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 flex items-start gap-3">
          <Database size={14} className="mt-0.5 shrink-0 text-emerald-400" />
          <div>
            <p className="text-[11px] font-bold text-emerald-300">Zero-API view</p>
            <p className="text-[11px] text-emerald-400/70 mt-0.5 leading-relaxed">
              "View Project" hydrates the full 10-stage pipeline directly from Supabase — no Gemini or Claude calls are made.
              You can read the final Tanglish script, reels sheet, and every intermediate stage.
            </p>
          </div>
        </div>

        {/* Stage-by-stage breakdown */}
        <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]">
          <div className="flex items-center justify-between border-b border-[rgb(var(--border))] px-4 py-3">
            <div className="flex items-center gap-2">
              <FileText size={12} className="text-faint" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-faint">
                10-Stage Pipeline Snapshot
              </span>
            </div>
            <span className="rounded-full border border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] px-2 py-0.5 text-[9px] text-faint">
              read-only · from Supabase
            </span>
          </div>
          <div className="divide-y divide-[rgb(var(--border))]">
            {PODCAST_STAGES.map((stage) => (
              <div key={stage.id} className="grid grid-cols-[36px_1fr_auto] items-center gap-3 px-4 py-2.5">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-black"
                  style={{ background: stage.color + "22", color: stage.color }}
                >
                  S{stage.id}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{stage.label}</p>
                  <p className="text-[10px] text-faint truncate">{stage.desc}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-400">
                  ✓ Saved
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Final script preview */}
        {scriptBlocks.length > 0 && (
          <section className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]">
            <div className="border-b border-[rgb(var(--border))] px-4 py-3 flex items-center gap-2">
              <FileText size={12} className="text-faint" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-faint">Final Script Preview</span>
              <span className="ml-auto text-[10px] text-faint">{scriptBlocks.length} blocks</span>
            </div>
            <div className="divide-y divide-[rgb(var(--border))] max-h-72 overflow-y-auto scrollbar-thin">
              {scriptBlocks.slice(0, 5).map((b, i) => (
                <div key={i} className="px-4 py-2.5">
                  <p className="text-[10px] font-bold uppercase text-faint mb-1">{b.type ?? "BLOCK"}</p>
                  <p className="text-xs text-soft line-clamp-2">{b.left ?? ""}</p>
                </div>
              ))}
              {scriptBlocks.length > 5 && (
                <div className="px-4 py-2 text-[10px] text-faint italic text-center">
                  + {scriptBlocks.length - 5} more block{scriptBlocks.length - 5 === 1 ? "" : "s"} — click "View Project" to read the full script
                </div>
              )}
            </div>
          </section>
        )}

        {/* CTA Reminder */}
        <div className="rounded-xl border border-cyan/25 bg-cyan/5 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-cyan">Open the full pipeline view</p>
            <p className="text-[11px] text-faint mt-0.5">
              All 10 stages will be hydrated from this saved snapshot · zero LLM calls.
            </p>
          </div>
          <button
            type="button"
            onClick={onView}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-cyan px-4 py-2 text-xs font-bold text-[rgb(var(--bg))] transition hover:opacity-90"
          >
            <ExternalLink size={13} />
            View Project
          </button>
        </div>

      </div>
    </>
  );
}

function countStages(episode) {
  if (episode?.final_script_json) return 10;
  return 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// Main page — Agents-style fullscreen layout
// ═══════════════════════════════════════════════════════════════════════════
export default function HistoryPage() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState("podcast");

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) return null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[rgb(var(--bg))]">

      {/* ── Header (matches Agents page exactly) ────────────────────────── */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[rgb(var(--border))] glass-strong px-4 lg:px-6">

        {/* Left: Logo + workspace mode toggle */}
        <div className="flex items-center gap-3">
          <Logo className="h-7 w-auto" />
          <WorkspaceModeToggle activeOverride={activeProduct} />
        </div>

        {/* Centre: nav links */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV_LINKS.map(({ label, href, icon: Icon }) => {
            const active = href === "/dashboard/history";
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

        {/* Right: credits + theme + avatar */}
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

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* ── Product selector strip (mirrors Agents page) ─────────────── */}
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
                title={!active ? `${label} history — coming soon` : `${label} history`}
                className={`flex flex-col items-center gap-1 rounded-xl border py-2 text-[9px] font-bold uppercase tracking-wide transition-all ${
                  !active
                    ? "cursor-not-allowed opacity-25 border-transparent text-faint"
                    : activeProduct === id
                      ? id === "podcast"
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

        {/* ── PODCAST history ──────────────────────────────────────────── */}
        {activeProduct === "podcast" && <PodcastHistoryPanel />}

        {/* ── Other tabs (disabled — placeholder) ──────────────────────── */}
        {activeProduct !== "podcast" && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-faint">
              {PRODUCT_TABS.find((p) => p.id === activeProduct)?.label} history — coming soon
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
