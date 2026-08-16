import { createContext, useContext, useState, useMemo, useEffect } from "react";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
} from "@mui/material";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(
    () => localStorage.getItem("theme") || "dark",
  );

  // Apply mode to document class for Tailwind
  useEffect(() => {
    const html = document.documentElement;
    if (mode === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      return next;
    });
  };

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "dark"
            ? {
                primary: { main: "#5844ff", light: "#7c6fff", dark: "#4830e6" },
                secondary: {
                  main: "#9333ea",
                  light: "#c084fc",
                  dark: "#7e22ce",
                },
                success: { main: "#10b981", light: "#6ee7b7", dark: "#059669" },
                warning: { main: "#f59e0b", light: "#fbbf24", dark: "#d97706" },
                error: { main: "#ef4444", light: "#f87171", dark: "#dc2626" },
                info: { main: "#3b82f6", light: "#93c5fd", dark: "#1d4ed8" },
                background: {
                  default: "#0f172a",
                  paper: "#1e293b",
                },
                text: {
                  primary: "#f1f5f9",
                  secondary: "#cbd5e1",
                  disabled: "#94a3b8",
                },
                divider: "#334155",
                action: {
                  active: "#5844ff",
                  hover: "#5844ff20",
                  selected: "#5844ff30",
                  disabled: "#94a3b8",
                  disabledBackground: "#334155",
                },
              }
            : {
                primary: { main: "#5844ff", light: "#7c6fff", dark: "#4830e6" },
                secondary: {
                  main: "#9333ea",
                  light: "#c084fc",
                  dark: "#7e22ce",
                },
                success: { main: "#059669", light: "#d1fae5", dark: "#065f46" },
                warning: { main: "#d97706", light: "#fef3c7", dark: "#92400e" },
                error: { main: "#dc2626", light: "#fee2e2", dark: "#7f1d1d" },
                info: { main: "#2563eb", light: "#dbeafe", dark: "#1e40af" },
                background: {
                  default: "#ffffff",
                  paper: "#f8fafc",
                },
                text: {
                  primary: "#0f172a",
                  secondary: "#475569",
                  disabled: "#94a3b8",
                },
                divider: "#e2e8f0",
                action: {
                  active: "#5844ff",
                  hover: "#5844ff10",
                  selected: "#5844ff20",
                  disabled: "#cbd5e1",
                  disabledBackground: "#e2e8f0",
                },
              }),
        },
        typography: {
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
          h1: { fontWeight: 600, letterSpacing: "-0.5px" },
          h2: { fontWeight: 600, letterSpacing: "-0.5px" },
          h3: { fontWeight: 600, letterSpacing: "-0.25px" },
          h4: { fontWeight: 600 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
          body1: { fontSize: "0.95rem" },
          body2: { fontSize: "0.875rem" },
          button: { fontWeight: 500, textTransform: "none" },
        },
        shape: { borderRadius: 12 },
        spacing: 8,
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 500,
                transition: "all 0.2s ease-out",
              },
              contained: {
                boxShadow: "none",
                "&:hover": {
                  boxShadow:
                    mode === "dark"
                      ? "0 10px 15px -3px rgba(88, 68, 255, 0.2)"
                      : "0 10px 15px -3px rgba(88, 68, 255, 0.15)",
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow:
                  mode === "dark"
                    ? "0 1px 3px 0 rgba(0, 0, 0, 0.3)"
                    : "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                border: `1px solid ${mode === "dark" ? "#334155" : "#e2e8f0"}`,
                transition: "all 0.2s ease-out",
                "&:hover": {
                  boxShadow:
                    mode === "dark"
                      ? "0 4px 6px -1px rgba(0, 0, 0, 0.4)"
                      : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  borderColor: mode === "dark" ? "#475569" : "#cbd5e1",
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 500,
                fontSize: "0.75rem",
              },
            },
          },
        },
      }),
    [mode],
  );

  // Apply mode to document body for potential inline styles
  useEffect(() => {
    document.body.classList.toggle("dark", mode === "dark");
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}
