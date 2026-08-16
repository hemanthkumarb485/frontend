import { useScan } from "../context/ScanContext";
import { useTheme } from "../context/ThemeContext";
import { getTierCounts, fmtScore, TIER_CONFIG } from "../utils/helpers";
import { TierBadge, SeverityBadge, ToolBadge } from "../components/ui/Badge";
import { Card, CardHeader } from "../components/ui/Card";
import { useNavigate } from "react-router-dom";

export default function Priority() {
  const { session } = useScan();
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const navigate = useNavigate();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p
          className={`text-base ${isDark ? "text-slate-400" : "text-slate-600"}`}
        >
          No scan data. Upload first.
        </p>
        <button
          onClick={() => navigate("/upload")}
          className="px-6 py-2 bg-linear-to-r from-primary-600 to-primary-700 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
        >
          📤 Upload Scans
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className={`text-3xl font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}
        >
          Risk & Priority
        </h1>
        <p
          className={`text-base mt-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}
        >
          Findings sorted by composite risk score (0–100). Higher scores
          indicate greater urgency.
        </p>
      </div>

      {/* Tier Summary Cards */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(TIER_CONFIG).map(([tier, cfg]) => (
          <Card key={tier} className="text-center">
            <p
              className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}
            >
              {cfg.label}
            </p>
            <p
              className={`text-4xl font-bold mb-1 ${
                tier === "P0"
                  ? "text-red-600 dark:text-red-400"
                  : tier === "P1"
                    ? "text-orange-600 dark:text-orange-400"
                    : tier === "P2"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : tier === "P3"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {tierCounts[tier] || 0}
            </p>
            <p
              className={`text-xs ${isDark ? "text-slate-500" : "text-slate-600"}`}
            >
              findings
            </p>
          </Card>
        ))}
      </div>

      {/* Per-tier Tables */}
      {Object.entries(grouped).map(([tier, items]) => {
        if (!items.length) return null;
        const cfg = TIER_CONFIG[tier];
        const tierColors = {
          P0: isDark
            ? "border-red-900/50 bg-red-900/10"
            : "border-red-200 bg-red-50/30",
          P1: isDark
            ? "border-orange-900/50 bg-orange-900/10"
            : "border-orange-200 bg-orange-50/30",
          P2: isDark
            ? "border-yellow-900/50 bg-yellow-900/10"
            : "border-yellow-200 bg-yellow-50/30",
          P3: isDark
            ? "border-emerald-900/50 bg-emerald-900/10"
            : "border-emerald-200 bg-emerald-50/30",
          UNSCORED: isDark
            ? "border-slate-800/50 bg-slate-800/10"
            : "border-slate-200 bg-slate-50/30",
        };

        return (
          <Card key={tier} className={`border-2 p-0 ${tierColors[tier]}`}>
            <div
              className={`px-6 py-4 border-b ${isDark ? "border-slate-800/50" : "border-slate-200"} flex items-center gap-3`}
            >
              <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
              <h2
                className={`font-bold text-lg ${isDark ? "text-slate-200" : "text-slate-900"}`}
              >
                {cfg.label}
              </h2>
              <span
                className={`text-sm font-semibold px-3 py-1 rounded-full ${isDark ? "bg-slate-800 text-slate-400" : "bg-slate-200 text-slate-700"}`}
              >
                {items.length} findings
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className={`border-b ${isDark ? "border-slate-800/30 bg-slate-900/30" : "border-slate-200 bg-slate-100/50"} ${isDark ? "text-slate-400" : "text-slate-600"} text-xs font-semibold uppercase tracking-wider`}
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
                <tbody
                  className={`divide-y ${isDark ? "divide-slate-800/30" : "divide-slate-200"}`}
                >
                  {items.map((f) => {
                    const ti = f.threat_intel || {};
                    const risk = f.risk_score || {};
                    const host =
                      f.asset?.hostname ||
                      f.asset?.ip ||
                      f.asset?.domain ||
                      "—";
                    return (
                      <tr
                        key={f.finding_id}
                        className={`smooth-transition ${isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-100/50"}`}
                      >
                        <td className="px-6 py-4">
                          <span className="text-xl font-bold bg-linear-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                            {fmtScore(risk.final_score)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p
                            className={`font-medium truncate max-w-xs ${isDark ? "text-slate-200" : "text-slate-900"}`}
                          >
                            {f.vulnerability_name}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <SeverityBadge severity={f.severity} />
                        </td>
                        <td className="px-6 py-4">
                          <ToolBadge tool={f.source_tool} />
                        </td>
                        <td
                          className={`px-6 py-4 text-xs font-mono ${isDark ? "text-slate-400" : "text-slate-600"}`}
                        >
                          {host}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <span
                            className={
                              f.cve_id
                                ? isDark
                                  ? "text-blue-400"
                                  : "text-blue-700 font-medium"
                                : isDark
                                  ? "text-slate-500"
                                  : "text-slate-400"
                            }
                          >
                            {f.cve_id || "—"}
                          </span>
                          {f.cwe_id && (
                            <span
                              className={`ml-2 ${isDark ? "text-secondary-400" : "text-secondary-700 font-medium"}`}
                            >
                              {f.cwe_id}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1.5 flex-wrap">
                            {ti.is_kev && (
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded-full ${isDark ? "bg-red-600/30 text-red-300" : "bg-red-100 text-red-700"}`}
                              >
                                🚨 KEV
                              </span>
                            )}
                            {ti.has_public_exploit && (
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded-full ${isDark ? "bg-orange-600/30 text-orange-300" : "bg-orange-100 text-orange-700"}`}
                              >
                                💣 Exploit
                              </span>
                            )}
                            {ti.epss_score > 0.3 && (
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded-full ${isDark ? "bg-yellow-600/30 text-yellow-300" : "bg-yellow-100 text-yellow-700"}`}
                              >
                                ⚠️ EPSS
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
