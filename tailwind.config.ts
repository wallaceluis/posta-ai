import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tinta: "#1b1a17",
        papel: "#fbf8f3",
        coral: { DEFAULT: "#e8593c", escuro: "#c4442a", claro: "#fde7e0" },
        folha: { DEFAULT: "#2f7a5b", claro: "#e3f1ea" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
