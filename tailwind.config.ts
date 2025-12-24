import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /**
         * Semantic tokens (source of truth in globals.css :root)
         * Usage examples:
         * - text-ink-primary
         * - text-text-muted
         * - bg-surface
         * - border-black/5 still works for “linework”
         */
        ink: {
          primary: "rgb(var(--ink-primary) / <alpha-value>)",
          secondary: "rgb(var(--ink-secondary) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
        },

        text: {
          primary: "rgb(var(--ink-primary) / <alpha-value>)",
          secondary: "rgb(var(--ink-secondary) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
        },

        surface: {
          DEFAULT: "rgb(var(--surface-2) / <alpha-value>)",
          light: "rgb(var(--surface-1) / <alpha-value>)",
          muted: "rgb(var(--surface-0) / <alpha-value>)",
        },

        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          50: "#f0f7f5",
          100: "#d9ebe6",
          200: "#b7d7cd",
          300: "#7FAF9B",
          400: "#5a9a85",
          500: "#3d7f6a",
          600: "#2d6655",
          700: "#265347",
          800: "#22433a",
          900: "#1f3831",
        },

        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          50: "#faf6f2",
          100: "#f4e9de",
          200: "#e8d1bd",
          300: "#D08C60",
          400: "#c2744a",
          500: "#b55a3a",
          600: "#a74a2f",
          700: "#8b3c29",
          800: "#703228",
          900: "#5b2b24",
        },

        /**
         * Optional: keep “cream” as a palette for one-off utilities,
         * but avoid using it for core primitives (use surface tokens instead).
         */
        cream: {
          50: "#fbf7f1",
          100: "#f4eee6",
          200: "#ebe2d6",
          300: "#dfd2c2",
        },
      },

      boxShadow: {
        soft: "0 2px 8px rgba(40, 35, 30, 0.08)",
        medium: "0 6px 16px rgba(40, 35, 30, 0.12)",
        large: "0 12px 32px rgba(40, 35, 30, 0.16)",
        ambient: "0 3px 10px rgba(40, 35, 30, 0.08)",
        glow: "0 0 20px rgba(127, 175, 155, 0.12)",
      },

      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "gentle-pulse": "gentle-pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
