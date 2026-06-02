"use client";

import { Check, Zap, Sparkles, CreditCard } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { PRICING } from "@/lib/mock-data";

const INVOICES = [
  { date: "May 1, 2026", plan: "Creator", amount: "$19.00", status: "Paid" },
  { date: "Apr 1, 2026", plan: "Creator", amount: "$19.00", status: "Paid" },
  { date: "Mar 1, 2026", plan: "Free", amount: "$0.00", status: "—" },
];

export default function BillingPage() {
  const { user, changePlan } = useAuth();
  if (!user) return null;

  const pct = Math.round((user.credits / user.creditsTotal) * 100);

  return (
    <div className="space-y-6">
      {/* Current plan */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <div className="relative overflow-hidden rounded-2xl border border-cyan/30 bg-[rgb(var(--panel))] p-5 shadow-glow">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan/15 blur-[80px]" />
          <div className="relative">
            <span className="text-xs font-semibold uppercase tracking-wider text-faint">
              Current plan
            </span>
            <div className="mt-1 flex items-center gap-2">
              <h2 className="font-display text-2xl font-bold capitalize">{user.plan}</h2>
              <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                Active
              </span>
            </div>
            <p className="mt-1 text-sm text-soft">
              Renews automatically · next cycle in 12 days
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-base font-bold">
              <Zap size={16} className="text-cyan" /> Usage credits
            </h3>
            <span className="font-display text-lg font-bold text-cyan">
              {user.credits}
              <span className="text-sm text-faint"> / {user.creditsTotal}</span>
            </span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[rgb(var(--bg-soft))]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan to-electric"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-faint">
            1 credit = 1 topic verification + full multilingual content set. Credits reset each
            billing cycle.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold">
          <Sparkles size={16} className="text-electric" /> Change plan
        </h3>
        <div className="grid gap-4 lg:grid-cols-4">
          {PRICING.map((p) => {
            const current = user.plan === p.id;
            return (
              <div
                key={p.id}
                className={`flex flex-col rounded-2xl border p-5 ${
                  current
                    ? "border-cyan/45 bg-[rgb(var(--panel))] shadow-glow"
                    : "border-[rgb(var(--border))] bg-[rgb(var(--panel))]"
                }`}
              >
                <h4 className="font-display text-base font-bold">{p.name}</h4>
                <div className="mt-1 flex items-end gap-1">
                  {p.price === null ? (
                    <span className="font-display text-2xl font-bold">Custom</span>
                  ) : (
                    <>
                      <span className="font-display text-3xl font-bold">${p.price}</span>
                      <span className="mb-1 text-xs text-faint">/{p.period}</span>
                    </>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-cyan">{p.credits}</p>
                <ul className="mt-3 flex-1 space-y-1.5">
                  {p.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-soft">
                      <Check size={13} className="mt-0.5 shrink-0 text-emerald-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  disabled={current || p.id === "enterprise"}
                  onClick={() => changePlan(p.id)}
                  className={`btn mt-4 py-2 text-xs ${
                    current ? "btn-ghost opacity-60" : "btn-primary"
                  }`}
                >
                  {current
                    ? "Current plan"
                    : p.id === "enterprise"
                    ? "Contact sales"
                    : "Switch plan"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices */}
      <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))]">
        <div className="flex items-center gap-2 border-b border-[rgb(var(--border))] px-5 py-4">
          <CreditCard size={16} className="text-cyan" />
          <h3 className="font-display text-base font-bold">Billing history</h3>
        </div>
        <div className="divide-y divide-[rgb(var(--border))]">
          {INVOICES.map((inv) => (
            <div key={inv.date} className="flex items-center justify-between px-5 py-3 text-sm">
              <span className="text-soft">{inv.date}</span>
              <span className="hidden sm:block">{inv.plan}</span>
              <span className="font-semibold">{inv.amount}</span>
              <span
                className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                  inv.status === "Paid"
                    ? "bg-emerald-500/12 text-emerald-300"
                    : "text-faint"
                }`}
              >
                {inv.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-faint">
        Demo mode — no real charges are made. Connect Stripe in production for live billing.
      </p>
    </div>
  );
}
