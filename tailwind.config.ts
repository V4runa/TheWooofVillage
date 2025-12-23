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
          DEFAULT: "#7FAF9B",
          foreground: "#0F172A",
        },
    
        secondary: {
          DEFAULT: "#D08C60",
          foreground: "#0F172A",
        },
    
        text: {
          primary: "#111827",    // near-black, very readable
          secondary: "#374151",  // muted but still readable
          muted: "#6B7280",      // metadata only
        },
      },
    },
    
  },
  plugins: [],
};

export default config;
