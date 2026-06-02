export function cn(...args) {
  return args.flat().filter(Boolean).join(" ");
}

export function timeAgo(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  const w = Math.floor(days / 7);
  if (w < 5) return `${w}w ago`;
  return d.toLocaleDateString();
}

export function clamp(n, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

export function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

const VERDICT_STYLE = {
  proven: {
    text: "text-emerald-300",
    bg: "bg-emerald-500/12",
    border: "border-emerald-400/35",
    dot: "bg-emerald-400",
    ring: "#34d399",
  },
  mixed: {
    text: "text-amber-300",
    bg: "bg-amber-500/12",
    border: "border-amber-400/35",
    dot: "bg-amber-400",
    ring: "#fbbf24",
  },
  misleading: {
    text: "text-orange-300",
    bg: "bg-orange-500/12",
    border: "border-orange-400/35",
    dot: "bg-orange-400",
    ring: "#fb923c",
  },
  false: {
    text: "text-rose-300",
    bg: "bg-rose-500/12",
    border: "border-rose-400/35",
    dot: "bg-rose-400",
    ring: "#fb7185",
  },
};

export function verdictStyle(v) {
  return VERDICT_STYLE[v] || VERDICT_STYLE.mixed;
}

export function riskLabel(risk) {
  if (risk >= 75) return { label: "Critical", tone: "rose" };
  if (risk >= 50) return { label: "Elevated", tone: "orange" };
  if (risk >= 30) return { label: "Moderate", tone: "amber" };
  return { label: "Low", tone: "emerald" };
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
