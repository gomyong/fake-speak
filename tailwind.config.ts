import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          DEFAULT: "#fcf8f8",
          dim: "#ddd9d8",
          bright: "#fcf8f8",
          lowest: "#ffffff",
          low: "#f7f3f2",
          container: "#f1edec",
          high: "#ebe7e7",
          highest: "#e5e2e1",
        },
        boro: {
          text: "#1c1b1b",
          muted: "#444747",
          muted2: "#747878",
          muted3: "#c4c7c7",
          border: "#e5e2e1",
          black: "#080909",
          blue: "#0050d7",
          "blue-soft": "#dbe1ff",
          red: "#ba1a1a",
          "red-soft": "#ffdad6",
        },
      },
      borderRadius: {
        card: "1.5rem", // 24px
        control: "1.75rem", // 28px
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.02em",
      },
    },
  },
  plugins: [],
} satisfies Config;
