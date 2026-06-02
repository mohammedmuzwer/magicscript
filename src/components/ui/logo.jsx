import Link from "next/link";

export function LogoMark({ size = 34, className = "" }) {
  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 48 48" width={size} height={size} fill="none" aria-hidden>
        <defs>
          <linearGradient id="vc-g" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0" stopColor="#22d3ee" />
            <stop offset="0.55" stopColor="#5b8cff" />
            <stop offset="1" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
        <path
          d="M24 3.5 7 11v12.5C7 34 14 41.6 24 44.5 34 41.6 41 34 41 23.5V11L24 3.5Z"
          fill="url(#vc-g)"
          fillOpacity="0.18"
          stroke="url(#vc-g)"
          strokeWidth="2"
        />
        <path
          d="M16 24.5 21.5 30 32.5 18"
          stroke="url(#vc-g)"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="24" r="20.5" stroke="url(#vc-g)" strokeOpacity="0.25" strokeWidth="1" />
      </svg>
    </span>
  );
}

export default function Logo({ href = "/", size = 34, showText = true, className = "" }) {
  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} />
      {showText && (
        <span className="font-display text-[1.05rem] font-700 font-bold tracking-tight">
          Magic <span className="gradient-text">Script</span>
        </span>
      )}
    </span>
  );
  if (!href) return content;
  return (
    <Link href={href} className="group">
      {content}
    </Link>
  );
}
