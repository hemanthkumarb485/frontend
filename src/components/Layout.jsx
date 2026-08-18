import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  HomeIcon,
  ArrowUpTrayIcon,
  BugAntIcon,
  ShieldExclamationIcon,
  TicketIcon,
  DocumentArrowDownIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useScan } from "../context/ScanContext";
import { useTheme } from "../context/ThemeContext";
import { Fab, Tooltip, Box } from "@mui/material";
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from "@mui/icons-material";

const SECTIONS = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", icon: HomeIcon }],
  },
  {
    label: "Vulnerability Management",
    items: [
      { to: "/upload", label: "Upload Scans", icon: ArrowUpTrayIcon },
      { to: "/findings", label: "Findings", icon: BugAntIcon },
      { to: "/priority", label: "Risk & Priority", icon: ShieldExclamationIcon },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/tickets", label: "GitHub Tickets", icon: TicketIcon },
      { to: "/reports", label: "Reports", icon: DocumentArrowDownIcon },
    ],
  },
];

export function Layout({ children }) {
  const { session, githubUsername } = useScan();
  const { mode, toggleTheme } = useTheme();
  const isDark = mode === "dark";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sidebarBg = isDark ? "var(--sidebar)" : "var(--sidebar)";
  const sidebarBorder = isDark ? "var(--sidebar-border)" : "var(--sidebar-border)";
  const mainBg = isDark ? "var(--background)" : "var(--background)";
  const textPrimary = isDark ? "var(--foreground)" : "var(--foreground)";
  const textSecondary = isDark ? "var(--muted-foreground)" : "var(--muted-foreground)";

  return (
    <div className="flex min-h-screen" style={{ background: mainBg }}>
      {/* Sidebar Backdrop for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-80 flex flex-col flex-shrink-0 border-r smooth-transition h-screen fixed lg:sticky top-0 left-0 z-50 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } transition-transform duration-300 ease-in-out`}
        style={{ background: sidebarBg, borderColor: sidebarBorder }}
      >
        {/* Logo Section */}
        <div className="px-6 py-6 border-b flex items-center justify-between gap-4" style={{ borderColor: sidebarBorder }}>
          <Link to="/" className="flex items-center gap-3 hover:opacity-85 transition-opacity">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.6"
              stroke="var(--foreground)"
              style={{ filter: "drop-shadow(0 0 6px var(--glow-color))" }}
              className="w-8 h-8 shrink-0"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
            </svg>
            <div>
              <p className="font-extrabold text-[19px] tracking-tight leading-none" style={{ color: textPrimary }}>
                VulneraX
              </p>
              <p className="text-[10px] mt-1.5 font-semibold uppercase tracking-[0.14em]" style={{ color: textSecondary }}>
                Risk Prioritization
              </p>
            </div>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-6 overflow-y-auto">
          {SECTIONS.map((section) => (
            <div key={section.label}>
              <p
                className="px-3.5 mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{ color: textSecondary }}
              >
                {section.label}
              </p>
              <div className="flex flex-col gap-1">
                {section.items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/dashboard"}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-4 py-2.5 rounded-md text-[14px] font-medium smooth-transition ${
                        isActive
                          ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                          : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
                      }`
                    }
                  >
                    <Icon className="w-[20px] h-[20px] shrink-0" />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Status Section */}
        <div className="px-4 py-4 space-y-3 border-t" style={{ borderColor: sidebarBorder }}>
          {session && (
            <div
              className="rounded-lg p-3 border"
              style={{
                background: "var(--accent)",
                borderColor: "var(--border)",
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: textSecondary }}>
                LAST SCAN
              </p>
              <p className="mono text-lg font-bold mt-1 text-[var(--primary)]">
                {session.total_after_dedup}
              </p>
              <p className="text-xs mt-0.5" style={{ color: textSecondary }}>
                {session.tools_detected?.slice(0, 2)?.join(", ")}
              </p>
            </div>
          )}

          {githubUsername && (
            <div
              className="flex items-center gap-2 px-2 py-2 rounded-lg"
              style={{ background: "var(--accent)" }}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <p className="text-xs truncate" style={{ color: textSecondary }}>
                {githubUsername}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Mobile Header Bar */}
        <header
          className="lg:hidden flex items-center gap-3 px-6 py-4 border-b sticky top-0 z-30"
          style={{ background: sidebarBg, borderColor: sidebarBorder }}
        >
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <Link to="/" className="font-extrabold text-lg tracking-tight hover:opacity-85 transition-opacity" style={{ color: textPrimary }}>
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
          <Tooltip
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            placement="left"
          >
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
      </div>
    </div>
  );
}
