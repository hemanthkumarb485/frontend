import { clsx } from "clsx";
import { getRiskLevelFromTier } from "../../utils/helpers";

export function Badge({ children, className }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide",
        "bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function TierBadge({ tier }) {
  const map = {
    P0: { color: "var(--tier-p1)" },
    P1: { color: "var(--tier-p1)" },
    P2: { color: "var(--tier-p2)" },
    P3: { color: "var(--tier-p3)" },
  };
  const t = map[tier] || { color: "var(--sev-info)" };

  return (
    <span
      className="mono inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider"
      style={{
        color: t.color,
        background: `color-mix(in oklab, ${t.color} 14%, transparent)`,
        border: `1px solid color-mix(in oklab, ${t.color} 35%, transparent)`,
      }}
    >
      {tier}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const map = {
    critical: "var(--sev-critical)",
    high: "var(--sev-high)",
    medium: "var(--sev-medium)",
    low: "var(--sev-low)",
    informational: "var(--sev-info)",
    unknown: "var(--sev-info)",
  };
  const s = (severity || "unknown").toLowerCase();
  const color = map[s] || map.unknown;

  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
      style={{
        color,
        background: `color-mix(in oklab, ${color} 16%, transparent)`,
        border: `1px solid color-mix(in oklab, ${color} 38%, transparent)`,
      }}
    >
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}

// Maps priority_tier (P0-P3/UNSCORED) to "R-Critical" / "R-High" /
// "R-Medium" / "R-Low" / "R-Unscored" — the "R-" prefix distinguishes it at
// a glance from the Severity column (scanner-reported). Deliberately
// tier-based rather than derived from the raw numeric score: risk_engine.py
// caps CWE-based findings (no CVE) at P1 even when their score is high, so
// bucketing by score alone could show "R-Critical" on a finding while the
// P0 summary count elsewhere on the page correctly reads 0 — tying this to
// the same priority_tier the rest of the app uses keeps them in agreement.
export function RiskLevelBadge({ tier }) {
  const { label, color } = getRiskLevelFromTier(tier);

  return (
    <span
      className="mono inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
      style={{
        color,
        background: `color-mix(in oklab, ${color} 16%, transparent)`,
        border: `1px solid color-mix(in oklab, ${color} 38%, transparent)`,
      }}
    >
      R-{label}
    </span>
  );
}

export function ToolBadge({ tool }) {
  const map = {
    zap: "#2563eb",
    nuclei: "#9333ea",
    openvas: "#0891b2",
    nmap: "#059669",
  };
  const t = (tool || "").toLowerCase();
  const labels = { zap: "ZAP", nuclei: "Nuclei", openvas: "OpenVAS", nmap: "Nmap" };
  const color = map[t] || "var(--sev-info)";

  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
      style={{
        color,
        background: `color-mix(in oklab, ${color} 16%, transparent)`,
        border: `1px solid color-mix(in oklab, ${color} 38%, transparent)`,
      }}
    >
      {labels[t] || tool?.toUpperCase()}
    </span>
  );
}
