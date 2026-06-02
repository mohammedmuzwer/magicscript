import { WORKFLOW_STEPS } from "@/lib/mock-data";
import Reveal from "@/components/ui/reveal";
import { Search, ShieldCheck, Sparkles, Send } from "lucide-react";

const STEP_ICONS = [Search, ShieldCheck, Sparkles, Send];

export default function Workflow() {
  return (
    <section id="workflow" className="relative border-y border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="chip px-3 py-1 text-xs font-semibold text-cyan">
            The workflow
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            From a health topic to a{" "}
            <span className="gradient-text">verified, ready-to-post reel</span>
          </h2>
          <p className="mt-4 text-soft">
            Four steps. No medical degree required — just a topic and an audience you respect.
          </p>
        </Reveal>

        <div className="relative mt-16 grid gap-6 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-electric/40 to-transparent lg:block" />
          {WORKFLOW_STEPS.map((s, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <Reveal key={s.step} delay={i * 0.1}>
                <div className="relative h-full rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 card-hover">
                  <div className="relative z-10 mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan to-electric text-navy-900 shadow-glow-sm">
                    <Icon size={24} strokeWidth={2.4} />
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-xs font-bold uppercase tracking-wider text-cyan">
                      Step {s.step}
                    </div>
                    <h3 className="mt-1.5 font-display text-lg font-bold">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-soft">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
