import { Link } from "react-router-dom";
import { Box } from "@mui/material";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "./ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ThemeToggleFab } from "./ui/ThemeToggleFab";

export function Layout({ children }) {
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

          <ThemeToggleFab />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
