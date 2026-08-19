import { useState, useMemo, useEffect } from "react";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { Columns3, ChevronDown } from "lucide-react";
import { useScan } from "../context/ScanContext";
import { useTheme } from "../context/ThemeContext";
import { PageHeader } from "../components/ui/PageHeader";
import { useNavigate, useSearchParams } from "react-router-dom";
import VulnerabilityTable from "../components/VulnerabilityTable";
import FindingsAccordion from "../components/findings/FindingsAccordion";

const TIERS = ["All", "P0", "P1", "P2", "P3", "UNSCORED"];
const TOOLS = ["All", "zap", "nuclei", "openvas", "nmap"];
const TIER_LABELS = {
  P0: "Critical (P0)",
  P1: "High (P1)",
  P2: "Medium (P2)",
  P3: "Low (P3)",
  UNSCORED: "Unscored"
};

const COLUMNS_CONFIG = [
  { field: "cve", label: "CVE" },
  { field: "severity", label: "Severity" },
  { field: "cvss", label: "CVSS" },
  { field: "epss", label: "EPSS" },
  { field: "kev", label: "KEV" },
  { field: "asset", label: "Asset" },
  { field: "riskScore", label: "Risk Score" },
  { field: "status", label: "Status" }
];

export default function Findings() {
  const navigate = useNavigate();
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const { session } = useScan();
  const [searchParams] = useSearchParams();
  const hostParam = searchParams.get("host");

  const [view, setView] = useState("host"); // "host" (accordion), "priority", "grid"
  const [search, setSearch] = useState(hostParam || "");
  const [tierFilter, setTierFilter] = useState("All");
  const [toolFilter, setToolFilter] = useState("All");
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);

  // Global column visibility state for grouped grids
  const [visibleColumns, setVisibleColumns] = useState({
    cve: true,
    severity: true,
    cvss: true,
    epss: true,
    kev: true,
    asset: true,
    riskScore: true,
    status: true
  });

  const toggleColumn = (field) => {
    setVisibleColumns((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const findings = session?.findings || [];

  const filtered = useMemo(() => {
    return findings.filter((f) => {
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
    });
  }, [findings, tierFilter, toolFilter, search]);

  const grouped = useMemo(() => {
    const g = { P0: [], P1: [], P2: [], P3: [], UNSCORED: [] };
    filtered.forEach((f) => {
      const t = f.risk_score?.priority_tier || "UNSCORED";
      g[t]?.push(f);
    });
    return g;
  }, [filtered]);

  if (!session) {
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
  }

  const tierColorMap = {
    P0: "var(--tier-p1)",
    P1: "var(--tier-p1)",
    P2: "var(--tier-p2)",
    P3: "var(--tier-p3)",
    UNSCORED: "var(--sev-info)"
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vulnerability Findings"
        subtitle={
          view === "grid"
            ? `Displaying all ${findings.length} findings in tabular grid view.`
            : `${filtered.length} of ${findings.length} findings filtered.`
        }
        actions={
          <div className="flex gap-1 bg-[var(--surface-2)] p-1 rounded-lg border border-[var(--border)]">
            {[
              { id: "host", label: "Host" },
              { id: "priority", label: "Priority" },
              { id: "grid", label: "Grid" }
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className="px-3 py-1 rounded-md text-xs font-semibold smooth-transition cursor-pointer"
                style={{
                  background:
                    view === v.id ? "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)" : "transparent",
                  color: view === v.id ? "white" : "var(--muted-foreground)",
                  boxShadow: view === v.id ? "0 2px 4px rgba(0, 0, 0, 0.1)" : "none"
                }}
              >
                {v.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Grid View */}
      {view === "grid" && (
        <VulnerabilityTable rows={findings} />
      )}

      {/* Priority and Host Grouped Grid Views */}
      {view !== "grid" && (
        <div className="space-y-6">
          {/* Global Search and Filters Toolbar */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center flex-1 min-w-[280px]">
              <div
                className="relative flex-1 max-w-md px-4 py-2 rounded-md border smooth-transition focus-within:border-[var(--primary)]/40"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)"
                }}
              >
                <MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, CVE, host..."
                  className="w-full pl-7 bg-transparent text-xs focus:outline-none text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                />
              </div>
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-4 h-4 text-[var(--muted-foreground)]" />
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="rounded-md px-3 py-1.5 text-xs font-semibold border smooth-transition focus:outline-none focus:border-[var(--primary)]/40"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)"
                  }}
                >
                  {TIERS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <select
                  value={toolFilter}
                  onChange={(e) => setToolFilter(e.target.value)}
                  className="rounded-md px-3 py-1.5 text-xs font-semibold border smooth-transition focus:outline-none focus:border-[var(--primary)]/40"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)"
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

            {/* Global Columns Dropdown for Grouped Tables (Priority view only) */}
            {view === "priority" && (
              <div className="relative">
                <button
                  onClick={() => setColumnsMenuOpen(!columnsMenuOpen)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold bg-[var(--surface-2)] border-[var(--border)] hover:bg-[var(--accent)] smooth-transition cursor-pointer text-[var(--foreground)]"
                >
                  <Columns3 className="size-4 text-[var(--muted-foreground)]" />
                  <span>Columns</span>
                  <ChevronDown className="size-3.5 text-[var(--muted-foreground)]" />
                </button>

                {columnsMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setColumnsMenuOpen(false)} />
                    <div
                      className="absolute right-0 mt-1.5 w-48 rounded-lg border p-2 shadow-lg z-20 space-y-1"
                      style={{
                        background: "var(--surface)",
                        borderColor: "var(--border)"
                      }}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--muted-foreground)] px-2 py-1">
                        Visible columns
                      </p>
                      {COLUMNS_CONFIG.map((col) => (
                        <label
                          key={col.field}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--accent)] text-xs font-medium cursor-pointer text-[var(--foreground)]"
                        >
                          <input
                            type="checkbox"
                            checked={visibleColumns[col.field]}
                            onChange={() => toggleColumn(col.field)}
                            className="accent-[var(--primary)]"
                          />
                          <span>{col.label}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Host view: Asset -> Vuln Type -> Path accordion */}
          {view === "host" && <FindingsAccordion findings={filtered} />}

          {/* Priority view: grouped tables per tier */}
          {view === "priority" && (
            <div className="space-y-8">
              {Object.entries(grouped).map(([group, items]) => {
                if (!items.length) return null;
                const color = tierColorMap[group] || "var(--border)";

                return (
                  <div key={group} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                      <h2 className="text-sm font-bold text-[var(--foreground)]">
                        {TIER_LABELS[group] || group}
                      </h2>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)]"
                      >
                        {items.length}
                      </span>
                    </div>
                    {/* Vulnerability Table for this Group */}
                    <VulnerabilityTable
                      rows={items}
                      hideToolbar={true}
                      visibleColumns={visibleColumns}
                      setVisibleColumns={setVisibleColumns}
                      defaultPageSize={5}
                    />
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-16 text-[var(--muted-foreground)] border border-dashed border-[var(--border)] rounded-xl bg-[var(--surface)]">
                  <p className="text-[13px] font-semibold">No findings match your filters.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
