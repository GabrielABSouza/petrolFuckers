/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Tokens semânticos de superfície/foreground — flipam entre temas via CSS vars
        ink: {
          DEFAULT: "rgb(var(--ink-rgb) / <alpha-value>)",
          deeper: "rgb(var(--ink-deeper-rgb) / <alpha-value>)",
          deepest: "rgb(var(--ink-deepest-rgb) / <alpha-value>)",
        },
        paper: "rgb(var(--paper-rgb) / <alpha-value>)",
        bone: "rgb(var(--bone-rgb) / <alpha-value>)",
        mist: {
          DEFAULT: "rgb(var(--mist-rgb) / <alpha-value>)",
          400: "rgb(var(--mist-400-rgb) / <alpha-value>)",
        },
        // Hairline (borders sutis) — theme-aware via CSS var. Alpha hard-coded.
        hairline: {
          DEFAULT: "rgb(var(--hairline-rgb) / 0.08)",
          strong: "rgb(var(--hairline-rgb) / 0.18)",
        },
        // Accent token — APENAS pra hover/focus rings. Theme-aware: dark=amber, light=cinder.
        accent: {
          DEFAULT: "rgb(var(--accent-rgb) / <alpha-value>)",
        },
        // Score scale — FIXAS em ambos os temas (semânticas)
        amber: {
          DEFAULT: "#fcc20a",
          dim: "#d4a309",
        },
        mango: "#fc9e24",
        ember: "#fc6926",
        cinder: "#fa441a",
        graphite: "#181818",
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
        scan: "scan 8s linear infinite",
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
