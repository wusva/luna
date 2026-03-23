import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        tg: {
          bg: "var(--tg-theme-bg-color, #ffffff)",
          text: "var(--tg-theme-text-color, #000000)",
          hint: "var(--tg-theme-hint-color, #999999)",
          link: "var(--tg-theme-link-color, #2481cc)",
          button: "var(--tg-theme-button-color, #2481cc)",
          "button-text": "var(--tg-theme-button-text-color, #ffffff)",
          secondary: "var(--tg-theme-secondary-bg-color, #f0f0f0)",
          "header-bg": "var(--tg-theme-header-bg-color, #2481cc)",
          accent: "var(--tg-theme-accent-text-color, #2481cc)",
          destructive: "var(--tg-theme-destructive-text-color, #ff3b30)",
        },
        like: "#00d46a",
        nope: "#ff4458",
        superlike: "#00bfff",
      },
      animation: {
        "card-in": "cardIn 0.3s ease-out",
        "match-pop": "matchPop 0.5s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        cardIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        matchPop: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
