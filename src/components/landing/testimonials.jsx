import { TESTIMONIALS } from "@/lib/mock-data";
import Reveal from "@/components/ui/reveal";
import { Star } from "lucide-react";

function Avatar({ name, hue }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-sm font-bold text-white"
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 80% 55%), hsl(${hue + 40} 75% 45%))`,
      }}
    >
      {initials}
    </span>
  );
}

export default function Testimonials() {
  return (
    <section className="relative border-t border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="chip px-3 py-1 text-xs font-semibold text-cyan">
            Loved by responsible creators
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Trusted by creators who <span className="gradient-text">won't risk their credibility</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={(i % 2) * 0.08}>
              <figure className="h-full rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 card-hover">
                <div className="flex gap-0.5 text-cyan">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={14} fill="currentColor" />
                  ))}
                </div>
                <blockquote className="mt-3.5 text-[15px] leading-relaxed">
                  "{t.text}"
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <Avatar name={t.name} hue={t.hue} />
                  <div>
                    <div className="text-sm font-bold">{t.name}</div>
                    <div className="text-xs text-faint">
                      {t.role} · <span className="text-cyan">{t.handle}</span>
                    </div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
