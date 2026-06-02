"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Check, Mail, Zap, Languages, Shield, User, Lock,
  CreditCard, Globe,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/dashboard/dashboard-shell";
import { LANGUAGES } from "@/lib/languages";

// ── Internal team directory ────────────────────────────────────────────────
const TEAM = [
  { name: "Vasanth", role: "Team Leader / Senior Video Editor", initials: "VA" },
  { name: "Hari",    role: "Video Production Staff",            initials: "HA" },
  { name: "Karthik", role: "Video Production Staff",            initials: "KA" },
];

// ── Left sidebar tabs ──────────────────────────────────────────────────────
const TABS = [
  { id: "identity", label: "👤 Personal Identity", icon: User   },
  { id: "security", label: "🛡️ Security Access",   icon: Lock   },
  { id: "credits",  label: "⚡ Credits & Plan",    icon: Zap    },
  { id: "team",     label: "👥 Studio Crew",        icon: Globe  },
];

// ── Fallback profile used if auth takes >1.5 s to resolve ─────────────────
const FALLBACK_USER = {
  name: "Creator",
  email: "creator@magicscript.ai",
  provider: "email",
  plan: "creator",
  role: "creator",
  avatarHue: 210,
  credits: 300,
  creditsTotal: 300,
  joinedAt: new Date().toISOString(),
  niche: "",
  languagesUsed: ["en"],
};

export default function ProfilePage() {
  const { user: authUser, ready, updateUser } = useAuth();

  // Local resolved user — starts null, filled from auth or fallback
  const [user, setUser]   = useState(null);
  const [activeTab, setActiveTab] = useState("identity");
  const [name,  setName]  = useState("");
  const [niche, setNiche] = useState("");
  const [saved, setSaved] = useState(false);

  // Sync editable fields whenever the live auth user changes
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setName(authUser.name  || "");
      setNiche(authUser.niche || "");
    }
  }, [authUser]);

  // Safety timeout: if auth has not resolved within 1 500 ms, paint the page
  // with sensible fallback values so the user is never left on a blank screen.
  useEffect(() => {
    const id = setTimeout(() => {
      if (!authUser) {
        setUser(FALLBACK_USER);
        setName(FALLBACK_USER.name);
        setNiche(FALLBACK_USER.niche);
      }
    }, 1500);
    return () => clearTimeout(id);
  }, [authUser]);

  // ── Loading skeleton (shown at most ~1 frame after mount) ─────────────────
  if (!user) {
    return (
      <div className="-mx-4 -my-6 lg:-mx-7 lg:-my-8 flex h-[calc(100vh-64px)] bg-[#0D0F12] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 rounded-full border-2 border-[#007AFF] border-t-transparent animate-spin" />
          <p className="text-[11px] text-white/25 tracking-wide">Loading profile…</p>
        </div>
      </div>
    );
  }

  const creditPct = Math.round((user.credits / (user.creditsTotal || 1)) * 100);

  function save() {
    updateUser({ name, niche });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    /*
     * Negative margins cancel the shell's px-4 py-6 lg:px-7 lg:py-8 padding,
     * giving the 3-split panel full edge-to-edge height — same pattern as
     * History, Library, and Studio.
     */
    <div className="-mx-4 -my-6 lg:-mx-7 lg:-my-8 flex h-[calc(100vh-64px)] bg-[#0D0F12] text-white overflow-hidden">

      {/* ── LEFT: Account Matrix Sidebar (280px) ──────────────────────────── */}
      <aside className="w-[280px] shrink-0 bg-[#13161A] border-r border-white/[0.05] flex flex-col p-5 gap-5">

        {/* Header */}
        <div>
          <h2 className="text-sm font-bold text-white/90 tracking-tight">Account Matrix</h2>
          <p className="text-[11px] text-white/40 mt-0.5">Manage identity configurations</p>
        </div>

        {/* Avatar + name summary */}
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-xl px-3 py-3">
          <Avatar user={user} size={36} />
          <div className="min-w-0">
            <p className="text-xs font-bold text-white/90 truncate">{user.name}</p>
            <p className="text-[10px] text-white/40 truncate">{user.email}</p>
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs rounded-xl border transition-all text-left ${
                activeTab === tab.id
                  ? "border-[#007AFF] bg-[#007AFF]/5 text-white font-semibold"
                  : "border-transparent text-white/40 hover:text-white/70 hover:border-white/[0.05]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Plan badge */}
        <div className="mt-auto space-y-2">
          <div className="bg-white/[0.01] border border-white/[0.04] rounded-xl px-3 py-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Plan</span>
              <span className="text-[10px] font-bold text-cyan capitalize">{user.plan}</span>
            </div>
            <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan to-blue-500"
                style={{ width: `${creditPct}%` }}
              />
            </div>
            <p className="text-[10px] text-white/25 mt-1.5 text-right tabular-nums">
              {user.credits} / {user.creditsTotal} credits
            </p>
          </div>

          {/* Node ID */}
          <div className="bg-white/[0.01] border border-white/[0.04] p-2.5 rounded-xl text-center text-[10px] text-white/20 tracking-wider">
            Node ID: VC-33-CHENNAI
          </div>
        </div>
      </aside>

      {/* ── CENTER: Workspace panel ──────────────────────────────────────── */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">

        {/* Workspace header */}
        <div className="shrink-0 px-6 pt-6 pb-4">
          <span className="text-[10px] uppercase tracking-widest text-[#007AFF] font-bold">
            User Identity
          </span>
          <h1 className="text-lg font-bold text-white/90 mt-0.5 tracking-tight">
            Profile Settings
          </h1>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">

          {/* ── TAB: Personal Identity ───────────────────────────────────── */}
          {activeTab === "identity" && (
            <>
              {/* Identity card */}
              <div className="bg-[#13161A] border border-white/[0.05] rounded-2xl p-5 space-y-4 max-w-2xl">
                <SectionHeader icon={User} label="Operational Identity" />

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Display Name">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#16191E] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#007AFF]/50 transition-colors"
                    />
                  </Field>
                  <Field label="Creator Niche">
                    <input
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      placeholder="e.g. Health & Wellness"
                      className="w-full bg-[#16191E] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#007AFF]/50 transition-colors placeholder-white/20"
                    />
                  </Field>
                  <Field label="Email Address">
                    <div className="flex items-center gap-2 bg-[#16191E] border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-white/40 cursor-not-allowed">
                      <Mail size={12} className="shrink-0" />
                      {user.email}
                    </div>
                  </Field>
                  <Field label="Deployment Region">
                    <input
                      readOnly
                      value="Chennai, India"
                      className="w-full bg-[#16191E] border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-white/40 outline-none cursor-not-allowed"
                    />
                  </Field>
                  <Field label="Account Role">
                    <div className="flex items-center gap-2 bg-[#16191E] border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-white/40 cursor-not-allowed capitalize">
                      <Shield size={12} className="shrink-0" />
                      {user.role}
                    </div>
                  </Field>
                  <Field label="Auth Provider">
                    <div className="flex items-center gap-2 bg-[#16191E] border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-white/40 cursor-not-allowed capitalize">
                      <Globe size={12} className="shrink-0" />
                      {user.provider}
                    </div>
                  </Field>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={save}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                      saved
                        ? "bg-emerald-500 text-black"
                        : "bg-[#007AFF] hover:bg-[#0062cc] text-white"
                    }`}
                  >
                    {saved ? <><Check size={13} /> Saved</> : "Save Changes"}
                  </button>
                  <span className="text-[10px] text-white/25">
                    Joined {new Date(user.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>

              {/* Languages used */}
              <div className="bg-[#13161A] border border-white/[0.05] rounded-2xl p-5 space-y-3 max-w-2xl">
                <SectionHeader icon={Languages} label="Languages Used" />
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((l) => {
                    const used = user.languagesUsed?.includes(l.code);
                    return (
                      <span
                        key={l.code}
                        className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                          used
                            ? "border-[#007AFF]/40 bg-[#007AFF]/8 text-[#007AFF]"
                            : "border-white/[0.06] text-white/25"
                        }`}
                      >
                        {l.flag} {l.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ── TAB: Security Access ─────────────────────────────────────── */}
          {activeTab === "security" && (
            <div className="bg-[#13161A] border border-white/[0.05] rounded-2xl p-5 space-y-4 max-w-2xl">
              <SectionHeader icon={Lock} label="Security Configuration" />
              <div className="space-y-3">
                <InfoRow label="Authentication Method" value={`${user.provider} login`} />
                <InfoRow label="Session Storage"       value="Browser localStorage (encrypted)" />
                <InfoRow label="Account Role"          value={user.role} capitalize />
                <InfoRow label="API Key Storage"       value="Browser localStorage — never server-persisted" />
              </div>
              <div className="pt-2 border-t border-white/[0.05]">
                <p className="text-[11px] text-white/30 leading-relaxed">
                  To rotate your API keys, visit the{" "}
                  <Link href="/dashboard/settings" className="text-[#007AFF] hover:underline">
                    API Keys Settings
                  </Link>{" "}
                  panel. Session data is cleared automatically on logout.
                </p>
              </div>
            </div>
          )}

          {/* ── TAB: Credits & Plan ──────────────────────────────────────── */}
          {activeTab === "credits" && (
            <div className="space-y-4 max-w-2xl">
              {/* Credit balance */}
              <div className="bg-[#13161A] border border-white/[0.05] rounded-2xl p-5 space-y-4">
                <SectionHeader icon={Zap} label="Credit Balance" />
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-4xl font-bold text-cyan tabular-nums">{user.credits}</div>
                    <div className="text-xs text-white/35 mt-0.5">
                      of {user.creditsTotal} this billing cycle
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border capitalize ${
                      creditPct > 50
                        ? "border-emerald-400/30 bg-emerald-400/8 text-emerald-400"
                        : creditPct > 20
                        ? "border-amber-400/30 bg-amber-400/8 text-amber-400"
                        : "border-rose-400/30 bg-rose-400/8 text-rose-400"
                    }`}
                  >
                    {creditPct}% remaining
                  </span>
                </div>
                <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan to-blue-500 transition-all"
                    style={{ width: `${creditPct}%` }}
                  />
                </div>
              </div>

              {/* Plan details */}
              <div className="bg-[#13161A] border border-white/[0.05] rounded-2xl p-5 space-y-3">
                <SectionHeader icon={CreditCard} label="Subscription Plan" />
                <InfoRow label="Current Plan"   value={user.plan}  capitalize />
                <InfoRow label="Total Credits"  value={`${user.creditsTotal} / cycle`} />
                <InfoRow label="Used This Cycle" value={`${user.creditsTotal - user.credits} credits`} />
                <div className="pt-2">
                  <Link
                    href="/dashboard/billing"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#007AFF] hover:bg-[#0062cc] text-white text-xs font-bold transition-colors"
                  >
                    <Zap size={13} /> Manage Subscription
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: Studio Crew ─────────────────────────────────────────── */}
          {activeTab === "team" && (
            <div className="bg-[#13161A] border border-white/[0.05] rounded-2xl p-5 space-y-4 max-w-2xl">
              <SectionHeader icon={Globe} label="Internal Video Production Crew" />
              <div className="space-y-2">
                {TEAM.map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center justify-between bg-white/[0.01] border border-white/[0.03] px-4 py-3 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#007AFF]/30 to-cyan/20 border border-white/10 grid place-items-center text-[11px] font-bold text-cyan shrink-0">
                        {member.initials}
                      </div>
                      <span className="text-xs font-semibold text-white/90">{member.name}</span>
                    </div>
                    <span className="text-[11px] text-white/40">{member.role}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-white/20 pt-1">
                {TEAM.length} active crew members · Magic Script Studio
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────

function SectionHeader({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 border-b border-white/[0.05] pb-2.5">
      <Icon size={13} className="text-white/40 shrink-0" />
      <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-wider">{label}</h3>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider pl-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function InfoRow({ label, value, capitalize = false }) {
  return (
    <div className="flex items-center justify-between bg-white/[0.01] border border-white/[0.03] px-3 py-2.5 rounded-xl">
      <span className="text-xs text-white/40">{label}</span>
      <span className={`text-xs font-semibold text-white/80 ${capitalize ? "capitalize" : ""}`}>
        {value}
      </span>
    </div>
  );
}
