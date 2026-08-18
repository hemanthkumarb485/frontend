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
                primary: { main: "#fafafa", light: "#ffffff", dark: "#e4e4e7" },
                secondary: {
                  main: "#a1a1aa",
                  light: "#d4d4d8",
                  dark: "#71717a",
                },
                success: { main: "#34d399", light: "#6ee7b7", dark: "#059669" },
                warning: { main: "#fb923c", light: "#fcd34d", dark: "#d97706" },
                error: { main: "#f87171", light: "#fca5a5", dark: "#b91c1c" },
                info: { main: "#38bdf8", light: "#7dd3fc", dark: "#0284c7" },
                background: {
                  default: "#09090b", // Shadcn Zinc dark canvas
                  paper: "#09090b", // Pinned to background for true zinc look
                },
                text: {
                  primary: "#fafafa",
                  secondary: "#a1a1aa",
                  disabled: "#71717a",
                },
                divider: "#27272a", // Zinc border
                action: {
                  active: "#fafafa",
                  hover: "rgba(250, 250, 250, 0.06)",
                  selected: "rgba(250, 250, 250, 0.12)",
                  disabled: "#71717a",
                  disabledBackground: "#18181b",
                },
              }
            : {
                primary: { main: "#18181b", light: "#27272a", dark: "#09090b" },
                secondary: {
                  main: "#71717a",
                  light: "#a1a1aa",
                  dark: "#3f3f46",
                },
                success: { main: "#10b981", light: "#d1fae5", dark: "#065f46" },
                warning: { main: "#f97316", light: "#fef3c7", dark: "#92400e" },
                error: { main: "#ef4444", light: "#fee2e2", dark: "#7f1d1d" },
                info: { main: "#0284c7", light: "#e0f2fe", dark: "#0369a1" },
                background: {
                  default: "#ffffff", // Pure white
                  paper: "#ffffff",
                },
                text: {
                  primary: "#09090b", // Zinc-950
                  secondary: "#71717a",
                  disabled: "#a1a1aa",
                },
                divider: "#e4e4e7", // Zinc-200 border
                action: {
                  active: "#18181b",
                  hover: "rgba(24, 24, 27, 0.05)",
                  selected: "rgba(24, 24, 27, 0.1)",
                  disabled: "#a1a1aa",
                  disabledBackground: "#f4f4f5",
                },
              }),
        },
        typography: {
          fontFamily:
            '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
          h1: { fontWeight: 700, letterSpacing: "-0.02em" },
          h2: { fontWeight: 700, letterSpacing: "-0.02em" },
          h3: { fontWeight: 700, letterSpacing: "-0.01em" },
          h4: { fontWeight: 700 },
          h5: { fontWeight: 700 },
          h6: { fontWeight: 700 },
          body1: { fontSize: "0.875rem", lineHeight: "1.25rem" }, // Tight modern body scaling
          body2: { fontSize: "0.75rem", lineHeight: "1rem" },
          button: { fontWeight: 500, textTransform: "none" },
        },
        shape: { borderRadius: 8 }, // 8px card rounding per Shadcn
        spacing: 8,
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.875rem",
                borderRadius: 6, // Tight button rounding
                boxShadow: "none",
                transition: "all 0.15s ease-out",
                "&:active": {
                  transform: "scale(0.98)",
                },
              },
              contained: {
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "none",
                  opacity: 0.9,
                },
              },
              outlined: {
                borderColor: mode === "dark" ? "#27272a" : "#e4e4e7",
                color: mode === "dark" ? "#fafafa" : "#18181b",
                "&:hover": {
                  backgroundColor: mode === "dark" ? "#27272a" : "#f4f4f5",
                  borderColor: mode === "dark" ? "#27272a" : "#e4e4e7",
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                boxShadow: "none", // Flat card design
                border: `1px solid ${mode === "dark" ? "#27272a" : "#e4e4e7"}`,
                borderRadius: 8,
                transition: "all 0.15s ease-out",
                "&:hover": {
                  boxShadow: "none",
                  borderColor: mode === "dark" ? "#3f3f46" : "#cbd5e1",
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                boxShadow: "none",
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 500,
                borderRadius: 6,
                fontSize: "0.75rem",
              },
              sizeSmall: {
                height: 22,
              },
            },
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                fontSize: 11,
                borderRadius: 6,
                padding: "4px 8px",
              },
            },
          },
        },
      }),
    [mode],
  );

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
