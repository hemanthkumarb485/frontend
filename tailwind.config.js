/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        secondary: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },
      fontFamily: {
        sans: [
          "IBM Plex Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "sm-light": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "md-light": "0 4px 6px -1px rgba(0, 0, 0, 0.08)",
        "lg-light": "0 10px 15px -3px rgba(0, 0, 0, 0.08)",
        "sm-dark": "0 1px 2px 0 rgba(0, 0, 0, 0.24)",
        "md-dark": "0 4px 6px -1px rgba(0, 0, 0, 0.32)",
        "lg-dark": "0 10px 15px -3px rgba(0, 0, 0, 0.4)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
