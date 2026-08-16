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
import { Fab, Tooltip } from "@mui/material";
import { LightMode as LightModeIcon, DarkMode as DarkModeIcon } from "@mui/icons-material";

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

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "240px",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          borderRight: "1px solid " + (isDark ? "#334155" : "#e2e8f0"),
          backgroundColor: isDark ? "#1e293b" : "#fff",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "1.25rem",
            borderBottom: "1px solid " + (isDark ? "#334155" : "#e2e8f0"),
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "2rem",
                height: "2rem",
                backgroundColor: "#4f46e5",
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldExclamationIcon
                style={{ width: "1.25rem", height: "1.25rem", color: "white" }}
              />
            </div>
            <div>
              <p
                style={{
                  fontWeight: "bold",
                  fontSize: "0.875rem",
                  lineHeight: "1",
                  color: isDark ? "#f1f5f9" : "#0f172a",
                }}
              >
                VulnRisk
              </p>
              <p style={{ color: "#64748b", fontSize: "0.75rem" }}>
                Prioritization System
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: "0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.625rem 0.75rem",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: "500",
                textDecoration: "none",
                transition: "all 0.2s",
                color: isActive ? "#a5b4fc" : isDark ? "#64748b" : "#64748b",
                backgroundColor: isActive
                  ? "rgba(79, 70, 229, 0.2)"
                  : "transparent",
                border: isActive ? "1px solid rgba(79, 70, 229, 0.3)" : "none",
              })}
            >
              <Icon style={{ width: "1rem", height: "1rem", flexShrink: 0 }} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom status */}
        <div
          style={{
            padding: "0.75rem",
            borderTop: "1px solid " + (isDark ? "#334155" : "#e2e8f0"),
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          {session && (
            <div
              style={{
                borderRadius: "0.5rem",
                padding: "0.625rem",
                fontSize: "0.75rem",
                backgroundColor: isDark ? "rgba(15, 23, 42, 0.5)" : "#f1f5f9",
              }}
            >
              <p style={{ color: "#64748b" }}>Last scan</p>
              <p style={{ color: "#10b981", fontWeight: "600" }}>
                {session.total_after_dedup} findings
              </p>
              <p style={{ color: "#64748b" }}>
                {session.tools_detected?.join(", ")}
              </p>
            </div>
          )}
          {githubUsername && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.375rem 0.5rem",
              }}
            >
              <div
                style={{
                  width: "0.5rem",
                  height: "0.5rem",
                  borderRadius: "50%",
                  backgroundColor: "#10b981",
                }}
              />
              <p
                style={{
                  color: "#64748b",
                  fontSize: "0.75rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {githubUsername}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          position: "relative",
          backgroundColor: isDark ? "#0f172a" : "#f8fafc",
        }}
      >
        <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "1.5rem" }}>
          {children}
        </div>

        {/* Dark / Light Mode Toggle — fixed bottom-right FAB */}
        <Tooltip
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          placement="left"
        >
          <Fab
            onClick={toggleTheme}
            size="medium"
            sx={{
              position: "fixed",
              bottom: 28,
              right: 28,
              zIndex: 1300,
              bgcolor: isDark ? "#6366f1" : "#4f46e5",
              color: "#fff",
              "&:hover": { bgcolor: isDark ? "#4f46e5" : "#3730a3" },
              boxShadow: "0 4px 20px rgba(99,102,241,0.5)",
            }}
          >
            {isDark ? <LightModeIcon /> : <DarkModeIcon />}
          </Fab>
        </Tooltip>
      </main>
    </div>
  );
}
