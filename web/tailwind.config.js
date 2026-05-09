/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#05274b",
          deeper: "#031a33",
          deepest: "#020f1f",
        },
        paper: "#f4f1ea",
        bone: "#e8e3d6",
        amber: {
          DEFAULT: "#fcc20a",
          dim: "#d4a309",
        },
        ember: "#fc6926",
        cinder: "#fa441a",
        graphite: "#18212f",
        moss: "#5b7a6a",
        slate: {
          dim: "#94a3b8",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        sans: ['"Geist"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        ultratight: "-0.06em",
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "pulse-soft": "pulseSoft 2.4s ease-in-out infinite",
        "scan": "scan 8s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.15)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [],
};
