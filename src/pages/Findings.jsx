import { useState, useMemo, useEffect } from "react";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { useScan } from "../context/ScanContext";
import { useTheme } from "../context/ThemeContext";
import { FindingCard } from "../components/FindingCard";
import { PageHeader } from "../components/ui/PageHeader";
import {
  getGithubOAuthUrl,
  getGithubRepos,
  createGithubIssue,
} from "../api/client";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";

const TIERS = ["All", "P0", "P1", "P2", "P3", "UNSCORED"];
const TOOLS = ["All", "zap", "nuclei", "openvas", "nmap"];
const TIER_LABELS = {
  P0: "Critical (P0)",
  P1: "High (P1)",
  P2: "Medium (P2)",
  P3: "Low (P3)",
  UNSCORED: "Unscored",
};

export default function Findings() {
  const navigate = useNavigate();
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const {
    session,
    githubToken,
    selectedRepo,
    saveSelectedRepo,
    raisedTickets,
    markTicketRaised,
    saveGithubConnection,
  } = useScan();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("All");
  const [toolFilter, setToolFilter] = useState("All");
  const [view, setView] = useState("priority");
  const [authDialog, setAuthDialog] = useState(false);
  const [repos, setRepos] = useState([]);
  const [repoLoading, setRepoLoading] = useState(false);
  const [pendingFinding, setPendingFinding] = useState(null);
  const [ticketError, setTicketError] = useState(null);

  useEffect(() => {
    const handler = (event) => {
      if (event.data && event.data.type === "github-connected") {
        const { encrypted_token, github_username } = event.data;
        saveGithubConnection(encrypted_token, github_username);
        setAuthDialog(false);
        navigate("/tickets");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [saveGithubConnection, navigate]);

  const findings = session?.findings || [];
  const filtered = useMemo(
    () =>
      findings.filter((f) => {
        const tier = f.risk_score?.priority_tier || "UNSCORED";
        const tool = f.source_tool || "";
        const matchTier = tierFilter === "All" || tier === tierFilter;
        const matchTool = toolFilter === "All" || tool === toolFilter;
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          (f.vulnerability_name || "").toLowerCase().includes(q) ||
          (f.cve_id || "").toLowerCase().includes(q) ||
          (f.cwe_id || "").toLowerCase().includes(q) ||
          (f.asset?.hostname || "").toLowerCase().includes(q) ||
          (f.asset?.ip || "").toLowerCase().includes(q);
        return matchTier && matchTool && matchSearch;
      }),
    [findings, tierFilter, toolFilter, search],
  );

  const grouped = useMemo(() => {
    if (view === "priority") {
      const g = { P0: [], P1: [], P2: [], P3: [], UNSCORED: [] };
      filtered.forEach((f) => {
        const t = f.risk_score?.priority_tier || "UNSCORED";
        g[t]?.push(f);
      });
      return g;
    }
    const g = {};
    filtered.forEach((f) => {
      const host =
        f.asset?.hostname ||
        f.asset?.ip ||
        f.asset?.domain ||
        f.asset?.url ||
        "Unknown";
      if (!g[host]) g[host] = [];
      g[host].push(f);
    });
    return g;
  }, [filtered, view]);

  const handleRaiseTicket = async (finding) => {
    setTicketError(null);
    if (!githubToken) {
      setPendingFinding(finding);
      setAuthDialog(true);
      return;
    }
    if (!selectedRepo) {
      setPendingFinding(finding);
      setAuthDialog(true);
      if (!repos.length) await loadRepos();
      return;
    }
    await doRaiseTicket(finding, githubToken, selectedRepo);
  };

  const loadRepos = async () => {
    setRepoLoading(true);
    try {
      const d = await getGithubRepos(githubToken);
      setRepos(d.repositories || []);
    } catch (e) {
      setTicketError(e.message);
    } finally {
      setRepoLoading(false);
    }
  };

  const doRaiseTicket = async (finding, token, repo) => {
    markTicketRaised(finding.finding_id, { status: "creating" });
    try {
      const r = await createGithubIssue(
        {
          finding_id: finding.finding_id,
          finding_data: finding,
          repo_full_name: repo,
          labels: [
            "security",
            "vulnerability",
            finding.risk_score?.priority_tier?.toLowerCase() || "vuln",
          ],
        },
        token,
      );
      if (r.success) {
        markTicketRaised(finding.finding_id, {
          status: "raised",
          issue_number: r.issue_number,
          issue_url: r.issue_url,
        });
      } else {
        markTicketRaised(finding.finding_id, null);
        setTicketError(r.error || "Failed");
      }
    } catch (e) {
      markTicketRaised(finding.finding_id, null);
      setTicketError(e.message);
    }
  };

  const connectGithub = () => {
    setAuthDialog(false);
    navigate("/tickets");
  };

  if (!session)
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-[13px] text-[var(--muted-foreground)]">
          No scan data. Upload first.
        </p>
        <button
          onClick={() => navigate("/upload")}
          className="px-6 py-2 bg-[var(--primary-600)] hover:bg-[var(--primary-700)] text-[var(--primary-foreground)] rounded-md text-sm font-medium transition-all"
        >
          Upload Scans
        </button>
      </div>
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Findings"
        subtitle={`${filtered.length} of ${findings.length} findings`}
        actions={
          <div className="flex gap-2">
            {["priority", "host"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-4 py-2 rounded-md text-sm font-medium smooth-transition"
                style={{
                  background:
                    view === v ? "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)" : "var(--accent)",
                  color: view === v ? "white" : "var(--foreground)",
                  border: `1px solid ${view === v ? "transparent" : "var(--border)"}`,
                }}
              >
                {v === "priority" ? "Priority View" : "Host View"}
              </button>
            ))}
          </div>
        }
      />

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div
          className="relative flex-1 min-w-48 px-4 py-2.5 rounded-md border smooth-transition focus-within:border-[var(--primary)]/40"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, CVE, host..."
            className="w-full pl-7 bg-transparent text-sm focus:outline-none text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4 text-[var(--muted-foreground)]" />
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="rounded-md px-3 py-2 text-sm font-medium border smooth-transition focus:outline-none focus:border-[var(--primary)]/40"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            {TIERS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select
            value={toolFilter}
            onChange={(e) => setToolFilter(e.target.value)}
            className="rounded-md px-3 py-2 text-sm font-medium border smooth-transition focus:outline-none focus:border-[var(--primary)]/40"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            {TOOLS.map((t) => (
              <option key={t} value={t}>
                {t === "All" ? "All Tools" : t.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {ticketError && (
        <Alert
          severity="error"
          onClose={() => setTicketError(null)}
          sx={{
            bgcolor: isDark ? "rgba(220, 38, 38, 0.1)" : "#fee2e2",
            color: isDark ? "#fca5a5" : "#991b1b",
            border: `1px solid ${isDark ? "rgba(220, 38, 38, 0.3)" : "#fca5a5"}`,
          }}
        >
          {ticketError}
        </Alert>
      )}

      {/* Findings List */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([group, items]) => {
          if (!items.length) return null;
          return (
            <div key={group}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-[13px] font-semibold text-[var(--foreground)]">
                  {view === "priority"
                    ? TIER_LABELS[group] || group
                    : group}
                </h2>
                <span
                  className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md"
                  style={{
                    background: "var(--muted)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  {items.length}
                </span>
              </div>
              <div className="space-y-3">
                {items.map((f) => (
                  <FindingCard
                    key={f.finding_id}
                    finding={f}
                    onRaiseTicket={handleRaiseTicket}
                    raisedTicket={raisedTickets[f.finding_id] || null}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-[var(--muted-foreground)]">
            <p className="text-[13px] font-medium">
              No findings match your filters.
            </p>
          </div>
        )}
      </div>

      <Dialog
        open={authDialog}
        onClose={() => setAuthDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: isDark ? "var(--surface)" : "#ffffff",
            color: isDark ? "var(--foreground)" : "#1c2434",
            borderRadius: 2,
            minWidth: 360,
            border: "1px solid var(--border)",
          },
        }}
      >
        <DialogTitle sx={{ color: "inherit", fontWeight: 700 }}>
          {githubToken ? "Select Repository" : "Connect GitHub"}
        </DialogTitle>
        <DialogContent>
          {!githubToken ? (
            <div className="space-y-3 pt-1">
              <p className="text-[var(--muted-foreground)] text-sm">
                Authenticate with GitHub to raise tickets. You will only be asked
                once.
              </p>
              <Button
                variant="contained"
                fullWidth
                onClick={connectGithub}
                sx={{
                  bgcolor: "#2563eb",
                  "&:hover": { bgcolor: "#1d4ed8" },
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Connect GitHub
              </Button>
              <p className="text-[var(--muted-foreground)] text-xs">
                After authorising, click Raise Ticket again.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <p className="text-[var(--muted-foreground)] text-sm">
                Select the repository where the issue will be created.
              </p>
              {repoLoading ? (
                <CircularProgress
                  size={24}
                  sx={{ color: "#2563eb", display: "block", mx: "auto" }}
                />
              ) : repos.length === 0 ? (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={loadRepos}
                  sx={{
                    borderColor: "#2563eb",
                    color: "#3b82f6",
                    textTransform: "none",
                  }}
                >
                  Load Repositories
                </Button>
              ) : (
                <Select
                  value={selectedRepo || ""}
                  onChange={(e) => saveSelectedRepo(e.target.value)}
                  fullWidth
                  size="small"
                  sx={{
                    bgcolor: "var(--surface-2)",
                    color: "var(--foreground)",
                    ".MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
                  }}
                >
                  <MenuItem value="">select repo</MenuItem>
                  {repos.map((r) => (
                    <MenuItem key={r.repo_id} value={r.full_name}>
                      {r.full_name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setAuthDialog(false)}
            sx={{ color: "var(--muted-foreground)", textTransform: "none" }}
          >
            Cancel
          </Button>
          {githubToken && selectedRepo && (
            <Button
              variant="contained"
              onClick={() => {
                setAuthDialog(false);
                pendingFinding &&
                  doRaiseTicket(pendingFinding, githubToken, selectedRepo);
              }}
              sx={{
                bgcolor: "#2563eb",
                "&:hover": { bgcolor: "#1d4ed8" },
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Raise Ticket
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
