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
