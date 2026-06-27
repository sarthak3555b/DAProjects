import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        bg: "hsl(var(--bg))",
        surface: "hsl(var(--surface))",
        panel: "hsl(var(--panel))",
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        fg: "hsl(var(--fg))",
        muted: "hsl(var(--muted))",
        faint: "hsl(var(--faint))",
        learning: "hsl(var(--learning))",
        completed: "hsl(var(--completed))",
        current: "hsl(var(--current))",
        project: "hsl(var(--project))",
        prereq: "hsl(var(--prereq))",
        analytics: "hsl(var(--analytics))",
        gold: "hsl(var(--gold))",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "var(--font-inter)", "sans-serif"],
      },
      borderRadius: { lg: "16px", md: "12px", sm: "8px", xl: "22px" },
      boxShadow: {
        glow: "0 0 0 1px hsl(var(--border)), 0 20px 50px -20px rgba(0,0,0,.7)",
        soft: "0 10px 40px -12px rgba(0,0,0,.55)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "none" } },
        shimmer: { "0%": { backgroundPosition: "200% 0" }, "100%": { backgroundPosition: "-200% 0" } },
        "pulse-ring": { "0%,100%": { opacity: "0.6" }, "50%": { opacity: "1" } },
      },
      animation: {
        "fade-in": "fade-in .4s cubic-bezier(.22,1,.36,1)",
        shimmer: "shimmer 1.4s infinite",
        "pulse-ring": "pulse-ring 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
