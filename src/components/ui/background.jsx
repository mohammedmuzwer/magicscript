// Decorative, non-interactive background layers. Pure CSS — no JS cost.

export function AuroraBackground({ className = "" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-cyan/20 blur-[120px]" />
      <div className="absolute -right-24 top-24 h-[24rem] w-[24rem] rounded-full bg-electric/20 blur-[120px]" />
      <div className="absolute bottom-0 left-1/3 h-[22rem] w-[22rem] rounded-full bg-teal-soft/15 blur-[130px]" />
      <div className="absolute inset-0 grid-bg opacity-60 mask-fade-b" />
    </div>
  );
}

export function GlowOrb({ className = "", color = "cyan" }) {
  const map = {
    cyan: "bg-cyan/25",
    electric: "bg-electric/25",
    teal: "bg-teal-soft/20",
  };
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-[110px] ${map[color]} ${className}`}
    />
  );
}

export function NoiseGrid({ className = "" }) {
  return <div aria-hidden className={`pointer-events-none absolute inset-0 grid-bg ${className}`} />;
}
