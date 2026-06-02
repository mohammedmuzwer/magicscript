import {
  ShieldCheck,
  Languages,
  Flame,
  BookOpen,
  Gauge,
  AlertTriangle,
} from "lucide-react";
import { FEATURES } from "@/lib/mock-data";
import Reveal, { Stagger, StaggerItem } from "@/components/ui/reveal";

const ICONS = {
  "shield-check": ShieldCheck,
  languages: Languages,
  flame: Flame,
  "book-open": BookOpen,
  gauge: Gauge,
  "alert-triangle": AlertTriangle,
};

export default function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="chip px-3 py-1 text-xs font-semibold text-cyan">
            Built for trust
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            A research engine and a content studio,{" "}
            <span className="gradient-text">working as one</span>
          </h2>
          <p className="mt-4 text-soft">
            Most AI tools optimise for engagement. Magic Script optimises for engagement
            that happens to be true.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = ICONS[f.icon] || ShieldCheck;
            return (
              <StaggerItem key={f.title}>
                <div className="group h-full rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 card-hover">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-gradient/10 bg-gradient-to-br from-cyan/15 to-electric/15 text-cyan ring-1 ring-cyan/20 transition group-hover:scale-105">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-soft">{f.desc}</p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
