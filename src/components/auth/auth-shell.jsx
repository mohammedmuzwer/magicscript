import Link from "next/link";
import { ShieldCheck, Languages, Gauge, ArrowLeft } from "lucide-react";
import Logo from "@/components/ui/logo";
import { AuroraBackground } from "@/components/ui/background";

const POINTS = [
  { icon: ShieldCheck, text: "Every claim verified against PubMed, NIH, WHO & FDA" },
  { icon: Languages, text: "Native-voice content in 7 languages incl. Tamil & Tanglish" },
  { icon: Gauge, text: "Transparent confidence scores on every generation" },
];

export default function AuthShell({ children }) {
  return (
    <div className="relative min-h-screen lg:grid lg:grid-cols-2">
      <AuroraBackground />

      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))] p-10 lg:flex">
        <div className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-cyan/15 blur-[120px]" />
        <Logo size={36} />

        <div className="relative">
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-balance">
            The content studio that puts{" "}
            <span className="gradient-text">science before the algorithm</span>
          </h2>
          <ul className="mt-8 space-y-4">
            {POINTS.map((p) => (
              <li key={p.text} className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-cyan/15 to-electric/15 text-cyan ring-1 ring-cyan/20">
                  <p.icon size={17} />
                </span>
                <span className="pt-1.5 text-sm text-soft">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <figure className="relative rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--panel))] p-5">
          <blockquote className="text-sm leading-relaxed text-soft">
            "The Tanglish output actually sounds like me, not Google Translate. My audience
            trusts the science callouts."
          </blockquote>
          <figcaption className="mt-3 text-xs font-semibold">
            Arjun Selvam <span className="text-faint">· Tamil Fitness Creator, 480K</span>
          </figcaption>
        </figure>
      </aside>

      {/* Form panel */}
      <main className="relative flex min-h-screen flex-col px-5 py-10 sm:px-10 lg:py-0">
        <div className="flex items-center justify-between lg:hidden">
          <Logo size={32} />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm py-10">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-faint transition hover:text-cyan"
            >
              <ArrowLeft size={13} /> Back to home
            </Link>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
