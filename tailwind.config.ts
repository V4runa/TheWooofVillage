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
        background: "#FAFAF8",

        primary: {
          DEFAULT: "#7FAF9B", // sage
          foreground: "#0F172A",
        },

        secondary: {
          DEFAULT: "#D08C60", // clay
          foreground: "#0F172A",
        },
      },
    },
  },
  plugins: [],
};

export default config;
