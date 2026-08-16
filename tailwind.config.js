/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f4ff",
          100: "#e5ecff",
          200: "#d0deff",
          300: "#b8d1ff",
          400: "#99bbff",
          500: "#6b5fff",
          600: "#5844ff",
          700: "#4830e6",
          800: "#3624c4",
          900: "#2e1fa0",
        },
        secondary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4ff",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["Fira Code", "monospace"],
      },
      boxShadow: {
        "sm-light": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "md-light": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        "lg-light": "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        "sm-dark": "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
        "md-dark": "0 4px 6px -1px rgba(0, 0, 0, 0.4)",
        "lg-dark": "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
