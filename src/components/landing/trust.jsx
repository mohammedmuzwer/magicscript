import { TRUST_SOURCES } from "@/lib/mock-data";
import { SourceBadge } from "@/components/ui/badges";
import Reveal from "@/components/ui/reveal";

export default function Trust() {
  return (
    <section id="trust" className="border-y border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] py-12">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-faint">
            Every claim cross-checked against trusted medical research
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
            {TRUST_SOURCES.map((s) => (
              <div
                key={s.name}
                className="flex items-center gap-2.5 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] px-4 py-2.5 card-hover"
              >
                <SourceBadge source={s.name} size={32} />
                <div>
                  <div className="text-sm font-bold leading-tight">{s.name}</div>
                  <div className="text-[11px] text-faint">{s.note}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
