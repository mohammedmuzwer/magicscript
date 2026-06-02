import { SHOWCASE } from "@/lib/mock-data";
import Reveal, { Stagger, StaggerItem } from "@/components/ui/reveal";
import { Sparkles } from "lucide-react";

export default function Showcase() {
  return (
    <section id="showcase" className="relative py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="chip px-3 py-1 text-xs font-semibold text-cyan">
            Multilingual creator mode
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Content that sounds <span className="gradient-text">native</span>, not translated
          </h2>
          <p className="mt-4 text-soft">
            Tamil and Tanglish output is written in real creator voice — slang, rhythm and
            emojis included. Never a word-for-word translation.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid gap-5 md:grid-cols-2">
          {SHOWCASE.map((s) => (
            <StaggerItem key={s.lang}>
              <article className="relative h-full overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-6 card-hover">
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-electric/10 blur-2xl" />
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/8 px-3 py-1 text-xs font-bold text-cyan">
                    <span className="text-sm">{s.flag}</span> {s.lang}
                  </span>
                  <span className="text-[11px] text-faint">{s.topic}</span>
                </div>
                <p className="mt-4 text-[15px] leading-relaxed">{s.text}</p>
                <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-faint">
                  <Sparkles size={12} className="text-electric" />
                  Auto-generated · verified · disclaimer attached
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
