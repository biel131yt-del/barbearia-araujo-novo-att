/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          500: "rgb(37 99 235)",
          600: "rgb(30 58 138)",
          700: "rgb(30 64 175)",
          900: "rgb(10 37 64)",
          950: "rgb(6 24 43)",
        },
        accent: "rgb(220 38 38)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Oswald", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        "geist-mono": ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        radius: "0.75rem",
      },
      boxShadow: {
        card: "0 4px 24px -6px rgba(10,37,64,.15)",
        "glow-red": "0 0 24px -4px rgba(220,38,38,.55)",
        "glow-red-sm": "0 0 12px -2px rgba(220,38,38,.5)",
      },
      animation: {
        tesoura: "tesoura 1.6s ease-in-out infinite",
        "spin-lento": "spin-lento 60s linear infinite",
      },
      keyframes: {
        tesoura: {
          "0%, to": { transform: "rotate(-8deg)" },
          "50%": { transform: "rotate(8deg)" },
        },
        "spin-lento": {
          "0%": { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
