import { clsx } from "clsx";

function getColor(score) {
  if (score >= 85) return { label: "Critical", color: "var(--sev-critical)" };
  if (score >= 70) return { label: "High", color: "var(--sev-high)" };
  if (score >= 45) return { label: "Medium", color: "var(--sev-medium)" };
  return { label: "Low", color: "var(--sev-low)" };
}

export function RiskScorePill({ score, className }) {
  const { color } = getColor(score);

  return (
    <span
      className={clsx(
        "mono inline-flex min-w-[42px] items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold",
        className,
      )}
      style={{
        color,
        background: `color-mix(in oklab, ${color} 15%, transparent)`,
        border: `1px solid color-mix(in oklab, ${color} 35%, transparent)`,
      }}
    >
      {score}
    </span>
  );
}

export function SeverityChip({ severity, className }) {
  const map = {
    critical: { color: "var(--sev-critical)" },
    high: { color: "var(--sev-high)" },
    medium: { color: "var(--sev-medium)" },
    low: { color: "var(--sev-low)" },
    info: { color: "var(--sev-info)" },
  };

  const s = map[severity] || map.info;
  const label = severity.charAt(0).toUpperCase() + severity.slice(1);

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        className,
      )}
      style={{
        color: s.color,
        background: `color-mix(in oklab, ${s.color} 16%, transparent)`,
        border: `1px solid color-mix(in oklab, ${s.color} 38%, transparent)`,
      }}
    >
      {label}
    </span>
  );
}

export function TierBadge({ tier, className }) {
  const map = {
    P1: { color: "var(--tier-p1)" },
    P2: { color: "var(--tier-p2)" },
    P3: { color: "var(--tier-p3)" },
  };

  const t = map[tier] || map.P3;

  return (
    <span
      className={clsx(
        "mono inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider",
        className,
      )}
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
