import {
  Users,
  Sparkles,
  ShieldAlert,
  DollarSign,
  TrendingUp,
  Languages,
  Server,
} from "lucide-react";
import {
  ADMIN_STATS,
  ADMIN_API_USAGE,
  ADMIN_RECENT_USERS,
} from "@/lib/mock-data";
import { GrowthChart, MrrChart, LanguagePie } from "@/components/admin/admin-charts";
import ModerationQueue from "@/components/admin/moderation-queue";
import { timeAgo } from "@/lib/utils";

const STAT_ICONS = [Users, Sparkles, ShieldAlert, DollarSign];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold">Platform Overview</h1>
        <p className="text-sm text-faint">
          Magic Script — operations, growth and content safety at a glance.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ADMIN_STATS.map((s, i) => {
          const Icon = STAT_ICONS[i];
          return (
            <div
              key={s.label}
              className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-4"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-cyan/15 to-electric/15 text-cyan">
                  <Icon size={17} />
                </span>
                <span className="flex items-center gap-0.5 rounded-md bg-emerald-500/12 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  <TrendingUp size={10} /> {s.trend}
                </span>
              </div>
              <div className="mt-3 font-display text-2xl font-bold">
                {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
              </div>
              <div className="text-xs text-faint">{s.label}</div>
              <div className="mt-1 text-[11px] text-faint">{s.hint}</div>
            </div>
          );
        })}
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="User Growth" subtitle="Total registered users · 6 months">
          <GrowthChart />
        </ChartCard>
        <ChartCard title="Subscription Revenue" subtitle="Monthly recurring revenue (MRR)">
          <MrrChart />
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard
          title="Generation Languages"
          subtitle="Share of content generated per language"
          icon={Languages}
        >
          <LanguagePie />
        </ChartCard>
        <ChartCard
          title="Research API Usage"
          subtitle="Verification calls per evidence source"
          icon={Server}
        >
          <div className="space-y-3 pt-1">
            {ADMIN_API_USAGE.map((a) => (
              <div key={a.source}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-semibold">{a.source}</span>
                  <span className="text-faint">
                    {a.calls.toLocaleString()} calls · {a.share}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[rgb(var(--bg-soft))]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan to-electric"
                    style={{ width: `${a.share * 2.4}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Moderation queue */}
      <ModerationQueue />

      {/* Recent users */}
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]">
        <div className="flex items-center gap-2 border-b border-[rgb(var(--border))] px-5 py-4">
          <Users size={16} className="text-cyan" />
          <h2 className="font-display text-base font-bold">Recent Signups</h2>
        </div>
        <div className="divide-y divide-[rgb(var(--border))]">
          {ADMIN_RECENT_USERS.map((u) => (
            <div key={u.email} className="flex items-center gap-3 px-5 py-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-cyan to-electric font-display text-[11px] font-bold text-navy-900">
                {u.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{u.name}</div>
                <div className="truncate text-[11px] text-faint">{u.email}</div>
              </div>
              <span className="hidden rounded-md bg-electric/10 px-2 py-0.5 text-[10px] font-bold uppercase text-cyan sm:block">
                {u.plan}
              </span>
              <span className="hidden text-xs text-soft sm:block">{u.gen} gens</span>
              <span className="w-20 text-right text-[11px] text-faint">
                {timeAgo(u.at)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5">
      <div className="mb-3 flex items-center gap-2">
        {Icon && <Icon size={16} className="text-cyan" />}
        <div>
          <h2 className="font-display text-base font-bold leading-tight">{title}</h2>
          <p className="text-[11px] text-faint">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
