import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Fab, Tooltip, Box } from "@mui/material";
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from "@mui/icons-material";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "./ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export function Layout({ children }) {
  const { mode, toggleTheme } = useTheme();
  const isDark = mode === "dark";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Mobile Header Bar */}
        <header
          className="lg:hidden flex items-center gap-3 px-6 py-4 border-b sticky top-0 z-30"
          style={{ background: "var(--sidebar)", borderColor: "var(--sidebar-border)" }}
        >
          <SidebarTrigger className="-ml-2" />
          <Link to="/" className="font-extrabold text-lg tracking-tight hover:opacity-85 transition-opacity" style={{ color: "var(--foreground)" }}>
            VulneraX
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto relative">
          <Box
            sx={{
              maxWidth: "1400px",
              margin: "0 auto",
              padding: { xs: "1.5rem 1rem", sm: "2rem 1.5rem" },
              minHeight: "100%",
            }}
          >
            {children}
          </Box>

          {/* Theme Toggle FAB */}
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
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
