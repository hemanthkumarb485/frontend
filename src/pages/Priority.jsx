import { useScan } from "../context/ScanContext";
import { getTierCounts, TIER_CONFIG } from "../utils/helpers";
import { StatCard } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { useNavigate } from "react-router-dom";
import VulnerabilityTable from "../components/VulnerabilityTable";
import { ShieldAlert, Flame, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";

export default function Priority() {
  const { session } = useScan();
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Risk Prioritization"
        subtitle="Ranked by composite risk score — CVSS, EPSS, KEV, asset criticality and internet exposure."
      />

      {/* Tier Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(TIER_CONFIG).map(([tier, cfg]) => {
          const iconMap = {
            P0: ShieldAlert,
            P1: Flame,
            P2: AlertTriangle,
            P3: ShieldCheck,
            UNSCORED: HelpCircle,
          };
          const colorMap = {
            P0: "text-[var(--sev-critical)]",
            P1: "text-[var(--sev-high)]",
            P2: "text-[var(--sev-medium)]",
            P3: "text-emerald-500",
            UNSCORED: "text-[var(--muted-foreground)]",
          };
          return (
            <StatCard
              key={tier}
              label={cfg.label}
              value={tierCounts[tier] || 0}
              sub="findings"
              color={colorMap[tier]}
              icon={iconMap[tier]}
            />
          );
        })}
      </div>

      {/* Vulnerability Table */}
      <VulnerabilityTable rows={findings} />
    </div>
  );
}
