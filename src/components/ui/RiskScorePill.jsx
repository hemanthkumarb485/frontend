import { clsx } from "clsx";
import { getRiskLevel } from "../../utils/helpers";

export function RiskScorePill({ score, className }) {
  const { color } = getRiskLevel(score);

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
