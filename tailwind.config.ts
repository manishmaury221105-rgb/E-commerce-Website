import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#ea580c",
          600: "#c2410c",
          700: "#9a3412",
          800: "#7c2d12",
          900: "#431407",
          DEFAULT: "#ea580c",
        },
        accent: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#0d9488",
          600: "#0f766e",
          700: "#115e59",
          DEFAULT: "#0d9488",
        },
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          DEFAULT: "#d97706",
        },
        maroon: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
          DEFAULT: "#9f1239",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(234, 88, 12, 0.35)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.08)",
        card: "0 2px 12px -2px rgba(0,0,0,0.06), 0 4px 20px -2px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};
export default config;
