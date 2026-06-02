import Link from "next/link";
import Logo from "@/components/ui/logo";

const COLS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#workflow" },
      { label: "Pricing", href: "#pricing" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Languages",
    links: [
      { label: "English & Tanglish", href: "#showcase" },
      { label: "Tamil & Malayalam", href: "#showcase" },
      { label: "Hindi & Telugu", href: "#showcase" },
      { label: "Kannada", href: "#showcase" },
    ],
  },
  {
    title: "Trust & Safety",
    links: [
      { label: "Evidence sources", href: "#trust" },
      { label: "Misinformation policy", href: "#faq" },
      { label: "Medical disclaimer", href: "#faq" },
      { label: "AI limitations", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Admin console", href: "/admin" },
      { label: "Log in", href: "/login" },
      { label: "Start free", href: "/signup" },
      { label: "Contact sales", href: "#pricing" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-[rgb(var(--border))] bg-[rgb(var(--bg-soft))]">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Logo size={34} />
            <p className="mt-3.5 text-sm text-soft">
              The evidence-based multilingual content studio for health, fitness and wellness creators.
            </p>
            <p className="mt-4 text-xs text-faint">
              Built for creators who refuse to spread misinformation.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-faint">
                {col.title}
              </h4>
              <ul className="mt-3.5 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-soft transition hover:text-cyan"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-[rgb(var(--border))] pt-6 text-xs text-faint sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Magic Script. All rights reserved.</p>
          <p className="max-w-xl leading-relaxed">
            Magic Script is a content tool, not a medical provider. It does not diagnose, prescribe
            or replace professional medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
