import { useScan } from "../context/ScanContext";
import { useTheme } from "../context/ThemeContext";
import { getTierCounts, fmtScore, TIER_CONFIG } from "../utils/helpers";
import { TierBadge, SeverityBadge, ToolBadge } from "../components/ui/Badge";
import { RiskScorePill } from "../components/ui/RiskScorePill";
import { Card, CardHeader } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { useNavigate } from "react-router-dom";

export default function Priority() {
  const { session } = useScan();
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const navigate = useNavigate();

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

  const findings = session.findings || [];
  const tierCounts = getTierCounts(findings);

  const grouped = { P0: [], P1: [], P2: [], P3: [], UNSCORED: [] };
  findings.forEach((f) => {
    const t = f.risk_score?.priority_tier || "UNSCORED";
    grouped[t]?.push(f);
  });

  const tierColorMap = {
    P0: "var(--tier-p1)",
    P1: "var(--tier-p1)",
    P2: "var(--tier-p2)",
    P3: "var(--tier-p3)",
    UNSCORED: "var(--sev-info)",
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Risk & Priority"
        subtitle="Findings sorted by composite risk score (0-100). Higher scores indicate greater urgency."
      />

      {/* Tier Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(TIER_CONFIG).map(([tier, cfg]) => (
          <Card key={tier} className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2 text-[var(--muted-foreground)]">
              {cfg.label}
            </p>
            <p
              className="text-[26px] font-bold tracking-tight mb-1"
              style={{ color: tierColorMap[tier] || "var(--foreground)" }}
            >
              {tierCounts[tier] || 0}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">findings</p>
          </Card>
        ))}
      </div>

      {/* Per-tier Tables */}
      {Object.entries(grouped).map(([tier, items]) => {
        if (!items.length) return null;
        const cfg = TIER_CONFIG[tier];
        const color = tierColorMap[tier] || "var(--border)";

        return (
          <Card key={tier} className="p-0 overflow-hidden">
            <div
              className="px-6 py-4 border-b flex items-center gap-3"
              style={{ borderColor: "var(--border)" }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: color }}
              />
              <h2 className="font-bold text-[15px] text-[var(--foreground)]">
                {cfg.label}
              </h2>
              <span
                className="text-xs font-semibold px-2.5 py-0.5 rounded-md"
                style={{
                  background: "var(--muted)",
                  color: "var(--muted-foreground)",
                }}
              >
                {items.length} findings
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="border-b text-[10.5px] font-semibold uppercase tracking-[0.1em]"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--muted-foreground)",
                      background: "var(--surface-2)",
                    }}
                  >
                    <th className="px-6 py-3 text-left">Score</th>
                    <th className="px-6 py-3 text-left">Vulnerability</th>
                    <th className="px-6 py-3 text-left">Severity</th>
                    <th className="px-6 py-3 text-left">Tool</th>
                    <th className="px-6 py-3 text-left">Host</th>
                    <th className="px-6 py-3 text-left">CVE/CWE</th>
                    <th className="px-6 py-3 text-left">Signals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {items.map((f) => {
                    const ti = f.threat_intel || {};
                    const risk = f.risk_score || {};
                    const host =
                      f.asset?.hostname ||
                      f.asset?.ip ||
                      f.asset?.domain ||
                      "\u2014";
                    return (
                      <tr
                        key={f.finding_id}
                        className="smooth-transition hover:bg-[var(--accent)]/40"
                      >
                        <td className="px-6 py-4">
                          {risk.final_score != null ? (
                            <RiskScorePill score={risk.final_score} />
                          ) : (
                            <span className="text-[var(--muted-foreground)] text-[13px]">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium truncate max-w-xs text-[13px] text-[var(--foreground)]">
                            {f.vulnerability_name}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <SeverityBadge severity={f.severity} />
                        </td>
                        <td className="px-6 py-4">
                          <ToolBadge tool={f.source_tool} />
                        </td>
                        <td className="px-6 py-4">
                          <span className="mono text-xs text-[var(--muted-foreground)]">
                            {host}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {f.cve_id ? (
                            <span className="text-[var(--primary)] font-medium mono">
                              {f.cve_id}
                            </span>
                          ) : f.cwe_id ? (
                            <span className="mono text-[var(--muted-foreground)]">
                              {f.cwe_id}
                            </span>
                          ) : (
                            <span className="text-[var(--muted-foreground)]">
                              {"\u2014"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1.5 flex-wrap">
                            {ti.is_kev && (
                              <span
                                className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                                style={{
                                  color: "var(--sev-critical)",
                                  background: "color-mix(in oklab, var(--sev-critical) 16%, transparent)",
                                  border: "1px solid color-mix(in oklab, var(--sev-critical) 38%, transparent)",
                                }}
                              >
                                KEV
                              </span>
                            )}
                            {ti.has_public_exploit && (
                              <span
                                className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                                style={{
                                  color: "var(--sev-high)",
                                  background: "color-mix(in oklab, var(--sev-high) 16%, transparent)",
                                  border: "1px solid color-mix(in oklab, var(--sev-high) 38%, transparent)",
                                }}
                              >
                                Exploit
                              </span>
                            )}
                            {ti.epss_score > 0.3 && (
                              <span
                                className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                                style={{
                                  color: "var(--sev-medium)",
                                  background: "color-mix(in oklab, var(--sev-medium) 16%, transparent)",
                                  border: "1px solid color-mix(in oklab, var(--sev-medium) 38%, transparent)",
                                }}
                              >
                                EPSS
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
