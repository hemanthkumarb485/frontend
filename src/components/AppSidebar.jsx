import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  ArrowUpTrayIcon,
  BugAntIcon,
  ShieldExclamationIcon,
  ServerIcon,
  TicketIcon,
  DocumentArrowDownIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowRightEndOnRectangleIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useScan } from "../context/ScanContext";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "./ui/sidebar";

const SECTIONS = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", icon: HomeIcon, end: true }],
  },
  {
    label: "Vulnerability Management",
    items: [
      { to: "/upload", label: "Upload Scans", icon: ArrowUpTrayIcon },
      { to: "/targets", label: "Targets", icon: ServerIcon },
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
  {
    label: "Account",
    items: [
      { to: "/profile", label: "Profile", icon: UserCircleIcon },
      { to: "/history", label: "Session History", icon: MagnifyingGlassIcon },
    ],
  },
];

export function AppSidebar() {
  const { session, githubUsername } = useScan();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { state, collapsible, isMobile } = useSidebar();
  const iconCollapsed = !isMobile && state === "collapsed" && collapsible === "icon";

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarHeader>
        {iconCollapsed ? (
          // Stacked layout: at icon width there's no room for the row-based
          // expanded header (logo + text + trigger side by side).
          <div className="flex flex-col items-center gap-3 py-6">
            <Link to="/" className="hover:opacity-85 transition-opacity">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.6"
                stroke="var(--foreground)"
                className="w-8 h-8 shrink-0 logo-glow-blink"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
              </svg>
            </Link>
            <SidebarTrigger className="hidden lg:inline-flex" />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 px-6 py-6">
            <Link to="/" className="flex items-center gap-4 hover:opacity-85 transition-opacity min-w-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.6"
                stroke="var(--foreground)"
                className="w-10 h-10 shrink-0 logo-glow-blink"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
              </svg>
              <div className="flex flex-col justify-center min-w-0">
                <p className="font-extrabold text-[20px] tracking-tight leading-tight truncate" style={{ color: "var(--foreground)" }}>
                  VulneraX
                </p>
                <p className="text-[10px] mt-1 font-semibold uppercase tracking-[0.14em] leading-none truncate" style={{ color: "var(--muted-foreground)" }}>
                  Risk Prioritization
                </p>
              </div>
            </Link>
            <SidebarTrigger className="hidden lg:inline-flex shrink-0" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className={cn("py-6 gap-6", iconCollapsed ? "px-1.5" : "px-4")}>
        {SECTIONS.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map(({ to, label, icon: Icon, end }) => (
                  <SidebarMenuItem key={to}>
                    <NavLink to={to} end={end}>
                      {({ isActive }) => (
                        <SidebarMenuButton isActive={isActive} tooltip={label}>
                          <Icon className="w-[20px] h-[20px] shrink-0" />
                          <span className="truncate">{label}</span>
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className={cn("py-4 space-y-3", iconCollapsed ? "px-1.5" : "px-4")}>
        {session && !iconCollapsed && (
          <div className="rounded-lg p-3 border" style={{ background: "var(--accent)", borderColor: "var(--border)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--muted-foreground)" }}>
              LAST SCAN
            </p>
            <p className="mono text-lg font-bold mt-1 text-[var(--primary)]">{session.total_after_dedup}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted-foreground)" }}>
              {session.tools_detected?.slice(0, 2)?.join(", ")}
            </p>
          </div>
        )}

        {githubUsername && !iconCollapsed && (
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg" style={{ background: "var(--accent)" }}>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
              {githubUsername}
            </p>
          </div>
        )}

        {user ? (
          <div className={cn("flex items-center gap-2 py-1", iconCollapsed ? "justify-center" : "px-2")}>
            {!iconCollapsed && (
              <p className="text-xs truncate flex-1 min-w-0" style={{ color: "var(--muted-foreground)" }} title={user.email}>
                {user.email}
              </p>
            )}
            <button
              onClick={() => signOut().then(() => navigate("/login"))}
              className="p-1.5 rounded-md shrink-0 text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
              title="Sign out"
            >
              <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className={cn(
              "flex items-center gap-2 py-2 rounded-lg text-xs font-semibold smooth-transition cursor-pointer",
              iconCollapsed ? "justify-center px-0" : "px-2.5"
            )}
            style={{ background: "var(--accent)", color: "var(--foreground)" }}
            title="Sign in"
          >
            <ArrowRightEndOnRectangleIcon className="w-4 h-4 shrink-0" />
            {!iconCollapsed && <span>Sign in to save reports</span>}
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
