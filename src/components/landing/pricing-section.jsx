import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { PRICING } from "@/lib/mock-data";
import Reveal from "@/components/ui/reveal";

export default function PricingSection() {
  return (
    <section id="pricing" className="relative py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="chip px-3 py-1 text-xs font-semibold text-cyan">Pricing</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Plans that scale with your <span className="gradient-text">audience</span>
          </h2>
          <p className="mt-4 text-soft">
            Every plan includes all 7 languages and the full scientific verification engine.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 lg:grid-cols-4">
          {PRICING.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.07}>
              <div
                className={`relative flex h-full flex-col rounded-2xl border p-6 ${
                  p.highlight
                    ? "border-cyan/45 bg-[rgb(var(--panel))] shadow-glow"
                    : "border-[rgb(var(--border))] bg-[rgb(var(--panel))] card-hover"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan to-electric px-3 py-1 text-[11px] font-bold text-navy-900">
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-lg font-bold">{p.name}</h3>
                <p className="mt-1 text-xs text-faint">{p.tagline}</p>

                <div className="mt-4 flex items-end gap-1">
                  {p.price === null ? (
                    <span className="font-display text-3xl font-bold">Custom</span>
                  ) : (
                    <>
                      <span className="font-display text-4xl font-bold">${p.price}</span>
                      <span className="mb-1 text-sm text-faint">/{p.period}</span>
                    </>
                  )}
                </div>

                <div className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-lg bg-electric/10 px-2.5 py-1 text-xs font-semibold text-cyan">
                  <Sparkles size={12} /> {p.credits}
                </div>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-soft">
                      <Check size={15} className="mt-0.5 shrink-0 text-emerald-400" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={p.id === "enterprise" ? "#" : "/signup"}
                  className={`btn mt-6 w-full py-2.5 text-sm ${
                    p.highlight ? "btn-primary" : "btn-ghost"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-faint">
          All prices in USD. Cancel anytime. Generated content is yours to publish commercially.
        </p>
      </div>
    </section>
  );
}
