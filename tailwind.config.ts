import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#080706", // Deep luxury obsidian black
          900: "#100f0d", // Dark charcoal black (surfaces, headers, sidebar)
          850: "#161412", // Elevated cards & drawers
          800: "#201c18", // Hover states & button backings
          750: "#2d2822", // Subtle warm beige-tinted dark border
          700: "#3d362e", // Divider lines
          600: "#594f43",
        },
        beige: {
          50: "#faf7f2",
          100: "#f5eee2",
          200: "#eadcc5",
          300: "#dec8a4",
          400: "#ceb082",
          500: "#bd9761",
          DEFAULT: "#dfd5bf",
          sand: "#d4c5a9",
          warm: "#e8dec8",
          champagne: "#f4ede1",
          gold: "#c5a880",
          muted: "#968d7c",
          dark: "#736b5d",
        },
        cyan: {
          DEFAULT: "#c5a880", // Warm antique gold / beige default
          bright: "#e8dec8", // High-contrast warm champagne beige for dark mode text
          glow: "#dfd5bf", // Warm beige glow
          dark: "#a6885e",
        },
        intel: {
          verified: "#dfd5bf", // Champagne beige for verified
          allegation: "#d4a373", // Warm desert amber
          hypothesis: "#b392ac", // Muted mauve beige
          danger: "#c96a64", // Muted clay red
          success: "#7b9e87", // Muted sage green
          muted: "#8c8273", // Warm taupe
          border: "#2d2822", // Dark beige border
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        "cyan-glow": "0 0 16px -2px rgba(223, 213, 191, 0.22)",
        "cyan-glow-lg": "0 0 28px -4px rgba(232, 222, 200, 0.30)",
        "purple-glow": "0 0 16px -2px rgba(179, 146, 172, 0.20)",
        "amber-glow": "0 0 16px -2px rgba(212, 163, 115, 0.22)",
        "danger-glow": "0 0 16px -2px rgba(201, 106, 100, 0.22)",
        "hud": "inset 0 1px 1px 0 rgba(223, 213, 191, 0.08), 0 4px 20px 0 rgba(0, 0, 0, 0.6)",
      },
      backgroundImage: {
        "grid-pattern": "radial-gradient(circle, rgba(223, 213, 191, 0.12) 1px, transparent 1px)",
        "tactical-grid": "linear-gradient(to right, rgba(223, 213, 191, 0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(223, 213, 191, 0.035) 1px, transparent 1px)",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar-sweep": "radar 4s linear infinite",
        "scanline": "scanline 8s linear infinite",
      },
      keyframes: {
        radar: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
