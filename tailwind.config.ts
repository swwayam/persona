import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        hitesh: {
          bg: "#0f0a07",
          surface: "#1a120c",
          primary: "#f59e0b",
          accent: "#ef4444",
          text: "#fde68a"
        },
        piyush: {
          bg: "#0a0f1a",
          surface: "#0f172a",
          primary: "#3b82f6",
          accent: "#8b5cf6",
          text: "#dbeafe"
        },
        neutral: {
          900: "#0a0a0a",
          850: "#141414",
          800: "#1c1c1c",
          750: "#262626",
          700: "#2f2f2f",
          600: "#404040",
          500: "#525252",
          400: "#737373",
          300: "#a3a3a3",
          200: "#d4d4d4"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        pulseDot: {
          "0%, 60%, 100%": { opacity: "0.3", transform: "scale(0.8)" },
          "30%": { opacity: "1", transform: "scale(1)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
