import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(34, 197, 94, 0.25)",
      },
      backgroundImage: {
        "radial-fade": "radial-gradient(circle at top, rgba(16,185,129,0.18), transparent 55%)",
        "grain": "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 240 240\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"2\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"240\" height=\"240\" filter=\"url(%23noise)\" opacity=\"0.08\"/%3E%3C/svg%3E')",
      },
    },
  },
  plugins: [animate],
};

export default config;
