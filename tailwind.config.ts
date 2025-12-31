import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./types/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /**
         * Semantic tokens (source of truth in globals.css :root)
         * Keep these stable so components can evolve without rewrites.
         */
        ink: {
          primary: "rgb(var(--ink-primary) / <alpha-value>)",
          secondary: "rgb(var(--ink-secondary) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
        },

        // Backwards compatibility (prefer ink.* going forward)
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

        line: "rgb(var(--line) / <alpha-value>)",

        /**
         * Brand accents: ONLY token-driven.
         * No more baked-in sage/terracotta ramps that keep us “stuck”.
         */
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
        },

        /**
         * Optional utility palettes for authored, non-template accents.
         * (Use sparingly. These are NOT the “theme”, just tools.)
         */
        sky: {
          50: "#f2f8ff",
          100: "#e7f2ff",
          200: "#cfe6ff",
          300: "#a9d3ff",
          400: "#7fbaff",
          500: "#4f9cff",
          600: "#2c79e6",
          700: "#1f5fb8",
          800: "#1b4f93",
          900: "#173f72",
        },

        meadow: {
          50: "#f1fbf4",
          100: "#dcf7e5",
          200: "#b8eec9",
          300: "#86dfa5",
          400: "#4fcb7a",
          500: "#2fb35f",
          600: "#228d4a",
          700: "#1e6f3d",
          800: "#1b5834",
          900: "#16472b",
        },

        sun: {
          50: "#fff6e8",
          100: "#ffedd1",
          200: "#ffd8a3",
          300: "#ffc071",
          400: "#ffa24a",
          500: "#ff7f2a",
          600: "#e65f14",
          700: "#b84512",
          800: "#923716",
          900: "#772f15",
        },
      },

      /**
       * Shadows: shift away from brown “cafe UI”
       * toward soft navy/ink shadows that feel airy.
       */
      boxShadow: {
        soft: "0 2px 10px rgba(24, 33, 46, 0.08)",
        medium: "0 10px 24px rgba(24, 33, 46, 0.12)",
        large: "0 18px 44px rgba(24, 33, 46, 0.16)",
        ambient: "0 4px 14px rgba(24, 33, 46, 0.10)",
        glow: "0 0 28px rgba(79, 168, 143, 0.18)",
      },

      animation: {
        "fade-in": "fadeIn 0.45s ease-out",
        "gentle-pulse": "gentle-pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
