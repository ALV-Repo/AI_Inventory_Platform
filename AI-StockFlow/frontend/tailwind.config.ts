import type { Config } from "tailwindcss";

// Design tokens mirror the dashboard: navy structure, signal palette for stock state.
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      spacing: {
        "4.5": "1.125rem",   // used for card padding throughout
      },
      colors: {
        ink: { DEFAULT: "#12213A", 2: "#1D3055", soft: "#5A6B85" },
        paper: "#F4F6F9",
        line: "#DFE5EC",
        good: "#0E7C6B",
        warn: "#C77800",
        crit: "#B93B2E",
        over: "#7A6BB5",
        ai: "#2F4B8F",
      },
      fontFamily: {
        display: ["Archivo", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(18,33,58,.06), 0 4px 16px rgba(18,33,58,.05)",
      },
    },
  },
  plugins: [],
} satisfies Config;
