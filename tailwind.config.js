/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#05070f",
          900: "#070b18",
          800: "#0b1124",
          700: "#111a35",
          600: "#19264a",
          500: "#243561",
        },
        cyan: {
          DEFAULT: "#22d3ee",
          glow: "#3ee8ff",
        },
        electric: {
          DEFAULT: "#5b8cff",
          deep: "#3b5fe0",
        },
        teal: {
          soft: "#2dd4bf",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(91,140,255,0.18), 0 18px 60px -20px rgba(34,211,238,0.35)",
        "glow-sm": "0 0 24px -6px rgba(34,211,238,0.45)",
        "glow-lg": "0 0 90px -10px rgba(91,140,255,0.55)",
        card: "0 24px 70px -32px rgba(2,6,20,0.85)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 1px 1px, rgba(91,140,255,0.13) 1px, transparent 0)",
        "brand-gradient":
          "linear-gradient(120deg, #22d3ee 0%, #5b8cff 50%, #2dd4bf 100%)",
        "hero-glow":
          "radial-gradient(60% 60% at 50% 0%, rgba(34,211,238,0.22) 0%, rgba(7,11,24,0) 70%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { opacity: "0" },
        },
        blink: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
        blink: "blink 1s step-end infinite",
        "spin-slow": "spin-slow 14s linear infinite",
      },
    },
  },
  plugins: [],
};
