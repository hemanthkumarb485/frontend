import { useScan } from "../context/ScanContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { StatCard, Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const { session } = useScan();
  const { mode } = useTheme();
  const navigate = useNavigate();
  const isDark = mode === "dark";

  if (!session) {
    return (
      <div className="flex items-center justify-center py-16">
        <Card className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-linear-to-br from-primary-100 to-primary-200 dark:from-primary-600/20 dark:to-primary-600/10 flex items-center justify-center">
            <SparklesIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            No scan data yet
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
            Upload security scanner results to see your vulnerability risk
            dashboard and prioritization analysis.
          </p>
          <Button
            onClick={() => navigate("/upload")}
            variant="primary"
            size="lg"
            className="w-full"
          >
            <span>📤 Upload Scan Results</span>
          </Button>
        </Card>
      </div>
    );
  }

  // Calculate statistics dynamically from findings
  const findings = session.findings || [];
  const findingsBySeverity = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  let p0Count = 0;
  let p1Count = 0;

  findings.forEach((f) => {
    const sev = (f.severity || "").toLowerCase();
    if (sev === "critical") findingsBySeverity.critical++;
    else if (sev === "high") findingsBySeverity.high++;
    else if (sev === "medium") findingsBySeverity.medium++;
    else if (sev === "low") findingsBySeverity.low++;

    const tier = f.risk_score?.priority_tier || "UNSCORED";
    if (tier === "P0") p0Count++;
    else if (tier === "P1") p1Count++;
  });

  const rimediated = session.remediated || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
          Risk Dashboard
        </h1>
        <p
          className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
        >
          Session:{" "}
          <span className="font-mono font-semibold">
            {session.session_id?.slice(0, 12)}…
          </span>
          {session.scan_date && (
            <span className="ml-4">
              Scanned:{" "}
              <span className="font-medium">
                {new Date(session.scan_date).toLocaleDateString()}
              </span>
            </span>
          )}
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ExclamationTriangleIcon}
          label="Total Findings"
          value={session.total_after_dedup}
          sub="After deduplication"
          color="text-primary-600 dark:text-primary-400"
        />
        <StatCard
          icon={ShieldCheckIcon}
          label="Critical (P0)"
          value={p0Count}
          sub="Immediate action required"
          color="text-red-600 dark:text-red-400"
        />
        <StatCard
          icon={ExclamationTriangleIcon}
          label="High Priority (P1)"
          value={p1Count}
          sub="Important vulnerabilities"
          color="text-orange-600 dark:text-orange-400"
        />
        <StatCard
          icon={ClipboardDocumentListIcon}
          label="Remediated"
          value={rimediated}
          sub="Issues fixed"
          color="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Severity Breakdown */}
      <Card>
        <CardHeader
          title="Findings by Severity"
          icon={ExclamationTriangleIcon}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Critical",
              value: findingsBySeverity.critical,
              color: "text-red-600 dark:text-red-400",
              bg: "bg-red-50 dark:bg-red-600/10",
            },
            {
              label: "High",
              value: findingsBySeverity.high,
              color: "text-orange-600 dark:text-orange-400",
              bg: "bg-orange-50 dark:bg-orange-600/10",
            },
            {
              label: "Medium",
              value: findingsBySeverity.medium,
              color: "text-yellow-600 dark:text-yellow-400",
              bg: "bg-yellow-50 dark:bg-yellow-600/10",
            },
            {
              label: "Low",
              value: findingsBySeverity.low,
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-600/10",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`${item.bg} rounded-lg p-4 text-center`}
            >
              <p className={`text-2xl font-bold ${item.color} mb-1`}>
                {item.value}
              </p>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Session Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Scan Information" />
          <div className="space-y-3 text-sm">
            {session.tools_detected && (
              <div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  Tools Detected
                </p>
                <p className="text-slate-900 dark:text-slate-100 mt-1">
                  {session.tools_detected.join(", ")}
                </p>
              </div>
            )}
            {session.scan_date && (
              <div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  Scan Date
                </p>
                <p className="text-slate-900 dark:text-slate-100 mt-1">
                  {new Date(session.scan_date).toLocaleString()}
                </p>
              </div>
            )}
            {session.total_raw && (
              <div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  Raw Findings
                </p>
                <p className="text-slate-900 dark:text-slate-100 mt-1">
                  {session.total_raw} findings (deduplicated to{" "}
                  {session.total_after_dedup})
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Next Steps" />
          <div className="space-y-2">
            <Button
              onClick={() => navigate("/findings")}
              variant="ghost"
              size="md"
              className="w-full justify-start"
            >
              <span>📋 Review All Findings</span>
            </Button>
            <Button
              onClick={() => navigate("/priority")}
              variant="ghost"
              size="md"
              className="w-full justify-start"
            >
              <span>⚡ View Risk Prioritization</span>
            </Button>
            <Button
              onClick={() => navigate("/reports")}
              variant="ghost"
              size="md"
              className="w-full justify-start"
            >
              <span>📊 Generate Report</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
