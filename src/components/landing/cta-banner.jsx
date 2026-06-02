import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Reveal from "@/components/ui/reveal";

export default function CtaBanner() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-5xl px-5 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-cyan/30 bg-[rgb(var(--panel))] p-10 text-center shadow-glow-lg sm:p-14">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan/20 blur-[110px]" />
            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-electric/20 blur-[110px]" />
            <div className="relative">
              <span className="chip mx-auto w-fit px-3 py-1 text-xs font-semibold text-cyan">
                <ShieldCheck size={13} /> Science-first, always
              </span>
              <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-bold tracking-tight text-balance sm:text-[2.6rem] sm:leading-tight">
                Build a health audience that{" "}
                <span className="gradient-text">trusts you</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-soft">
                Start generating verified, multilingual creator content today — free, no
                credit card, no misinformation.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/signup" className="btn btn-primary px-6 py-3 text-sm">
                  Start Verifying Free <ArrowRight size={16} />
                </Link>
                <Link href="/dashboard" className="btn btn-ghost px-5 py-3 text-sm">
                  Explore the dashboard
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
