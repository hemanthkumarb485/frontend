import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  ArrowUpTrayIcon,
  BugAntIcon,
  ShieldExclamationIcon,
  TicketIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { useScan } from "../context/ScanContext";
import { useTheme } from "../context/ThemeContext";
import { Fab, Tooltip, Box } from "@mui/material";
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from "@mui/icons-material";

const NAV = [
  { to: "/", label: "Dashboard", icon: HomeIcon },
  { to: "/upload", label: "Upload Scans", icon: ArrowUpTrayIcon },
  { to: "/findings", label: "Findings", icon: BugAntIcon },
  { to: "/priority", label: "Risk & Priority", icon: ShieldExclamationIcon },
  { to: "/tickets", label: "GitHub Tickets", icon: TicketIcon },
  { to: "/reports", label: "Reports", icon: DocumentArrowDownIcon },
];

export function Layout({ children }) {
  const { session, githubUsername } = useScan();
  const { mode, toggleTheme } = useTheme();
  const isDark = mode === "dark";

  const sidebarBg = isDark ? "bg-slate-900" : "bg-white";
  const sidebarBorder = isDark ? "border-slate-800" : "border-slate-200";
  const mainBg = isDark ? "bg-slate-950" : "bg-slate-50";
  const textPrimary = isDark ? "text-slate-100" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-600";
  const accentColor = isDark ? "#5844ff" : "#5844ff";

  return (
    <div className={`flex min-h-screen ${mainBg}`}>
      {/* Sidebar */}
      <aside
        className={`w-64 flex flex-col flex-shrink-0 border-r smooth-transition ${sidebarBg} ${sidebarBorder}`}
      >
        {/* Logo Section */}
        <div
          className={`px-6 py-5 border-b smooth-transition ${sidebarBorder}`}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: `linear-gradient(135deg, ${accentColor}80, ${accentColor})`,
                boxShadow: `0 4px 12px ${accentColor}30`,
              }}
            >
              <ShieldExclamationIcon
                style={{ width: "1.5rem", height: "1.5rem", color: "white" }}
              />
            </div>
            <div>
              <p className={`font-bold text-sm leading-none ${textPrimary}`}>
                VulnRisk
              </p>
              <p className={`text-xs mt-1 ${textSecondary}`}>
                Risk Prioritization
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium smooth-transition ${
                  isActive
                    ? isDark
                      ? "bg-primary-600/20 text-primary-400 border border-primary-600/30 shadow-md shadow-primary-600/10"
                      : "bg-primary-50 text-primary-700 border border-primary-200 shadow-sm"
                    : isDark
                      ? `${textSecondary} hover:bg-slate-800/50 hover:${textPrimary}`
                      : `${textSecondary} hover:bg-slate-100 hover:${textPrimary}`
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Status Section */}
        <div className={`px-4 py-4 space-y-3 border-t ${sidebarBorder}`}>
          {session && (
            <div
              className={`rounded-lg p-3 backdrop-blur-sm smooth-transition ${
                isDark
                  ? "bg-slate-800/50 border border-slate-700/30"
                  : "bg-slate-100/50 border border-slate-200/50"
              }`}
            >
              <p className={`text-xs font-semibold ${textSecondary}`}>
                LAST SCAN
              </p>
              <p
                className="text-lg font-bold mt-1"
                style={{
                  background: "linear-gradient(135deg, #10b981, #34d399)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {session.total_after_dedup}
              </p>
              <p className={`text-xs ${textSecondary} mt-0.5`}>
                {session.tools_detected?.slice(0, 2)?.join(", ")}
              </p>
            </div>
          )}

          {githubUsername && (
            <div
              className={`flex items-center gap-2 px-2 py-2 rounded-lg ${isDark ? "bg-slate-800/30" : "bg-slate-100/30"}`}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <p className={`text-xs truncate ${textSecondary}`}>
                {githubUsername}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <Box
          sx={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "2rem 1.5rem",
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
            size="medium"
            sx={{
              position: "fixed",
              bottom: 32,
              right: 32,
              zIndex: 1300,
              background: isDark
                ? "linear-gradient(135deg, #5844ff, #7c6fff)"
                : "linear-gradient(135deg, #5844ff, #4830e6)",
              color: "#fff",
              boxShadow: isDark
                ? "0 8px 24px rgba(88, 68, 255, 0.3)"
                : "0 8px 24px rgba(88, 68, 255, 0.2)",
              transition: "all 0.3s ease-out",
              "&:hover": {
                transform: "scale(1.1)",
                boxShadow: isDark
                  ? "0 12px 32px rgba(88, 68, 255, 0.4)"
                  : "0 12px 32px rgba(88, 68, 255, 0.3)",
              },
              "&:active": {
                transform: "scale(0.95)",
              },
            }}
          >
            {isDark ? <LightModeIcon /> : <DarkModeIcon />}
          </Fab>
        </Tooltip>
      </main>
    </div>
  );
}
