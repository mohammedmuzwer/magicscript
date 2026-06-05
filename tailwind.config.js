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
        // Neutral grays — no purple tint
        navy: {
          950: "#171717",
          900: "#1a1a1a",
          800: "#212121",
          700: "#2a2a2a",
          600: "#333333",
          500: "#404040",
        },
        // Soft cyan for dark mode teal links
        cyan: {
          DEFAULT: "#67e8f9",
          glow: "#a5f3fc",
        },
        // Blue accent — only hue in the system
        electric: {
          DEFAULT: "#4f6ef7",
          deep: "#3a5bdf",
        },
        teal: {
          soft: "#06b6d4",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      boxShadow: {
        // Neutral shadows — no coloured glow
        glow: "0 0 0 1px rgba(79,110,247,0.14), 0 8px 24px rgba(0,0,0,0.15)",
        "glow-sm": "0 2px 8px rgba(0,0,0,0.20)",
        "glow-lg": "0 8px 32px rgba(0,0,0,0.25)",
        card: "0 1px 3px rgba(0,0,0,0.10), 0 0 0 0.5px rgba(0,0,0,0.08)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(circle at 1px 1px, rgba(79,110,247,0.07) 1px, transparent 0)",
        "brand-gradient":
          "linear-gradient(120deg, #4f6ef7 0%, #3a5bdf 100%)",
        "hero-glow":
          "radial-gradient(60% 60% at 50% 0%, rgba(79,110,247,0.10) 0%, transparent 70%)",
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
