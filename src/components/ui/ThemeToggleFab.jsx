import { Fab, Tooltip } from "@mui/material";
import { LightMode as LightModeIcon, DarkMode as DarkModeIcon } from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";

/** Floating light/dark toggle, fixed to the bottom-right corner. Used by
 * Layout for every authenticated page, and standalone on pages that render
 * outside Layout (Login, Signup) so the toggle isn't only available once
 * you're already signed in. */
export function ThemeToggleFab() {
  const { mode, toggleTheme } = useTheme();
  const isDark = mode === "dark";

  return (
    <Tooltip title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"} placement="left">
      <Fab
        onClick={toggleTheme}
        size="small"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1300,
          background: "var(--background)",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
          boxShadow: "none",
          transition: "all 0.15s ease-out",
          "&:hover": {
            background: "var(--accent)",
            borderColor: "var(--border)",
            boxShadow: "none",
          },
        }}
      >
        {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
      </Fab>
    </Tooltip>
  );
}
