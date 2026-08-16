import { clsx } from "clsx";

export function Badge({ children, className }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold smooth-transition",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function TierBadge({ tier }) {
  const cfg = {
    P0: "bg-red-600 dark:bg-red-500/20 text-white dark:text-red-300 dark:ring-1 dark:ring-red-500/30",
    P1: "bg-orange-600 dark:bg-orange-500/20 text-white dark:text-orange-300 dark:ring-1 dark:ring-orange-500/30",
    P2: "bg-yellow-600 dark:bg-yellow-500/20 text-white dark:text-yellow-300 dark:ring-1 dark:ring-yellow-500/30",
    P3: "bg-emerald-600 dark:bg-emerald-500/20 text-white dark:text-emerald-300 dark:ring-1 dark:ring-emerald-500/30",
    UNSCORED:
      "bg-slate-400 dark:bg-slate-600/30 text-slate-900 dark:text-slate-300 dark:ring-1 dark:ring-slate-600/30",
  };
  return <Badge className={cfg[tier] || cfg.UNSCORED}>{tier}</Badge>;
}

export function SeverityBadge({ severity }) {
  const cfg = {
    critical:
      "bg-red-600/20 text-red-700 dark:bg-red-600/20 dark:text-red-300 ring-1 ring-red-600/40 dark:ring-red-600/60 font-semibold",
    high: "bg-orange-600/20 text-orange-700 dark:bg-orange-600/20 dark:text-orange-300 ring-1 ring-orange-600/40 dark:ring-orange-600/60 font-semibold",
    medium:
      "bg-yellow-600/20 text-yellow-700 dark:bg-yellow-600/20 dark:text-yellow-300 ring-1 ring-yellow-600/40 dark:ring-yellow-600/60",
    low: "bg-emerald-600/20 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-300 ring-1 ring-emerald-600/40 dark:ring-emerald-600/60",
    informational:
      "bg-slate-600/20 text-slate-700 dark:bg-slate-600/20 dark:text-slate-300 ring-1 ring-slate-600/40 dark:ring-slate-600/60",
    unknown:
      "bg-slate-600/20 text-slate-700 dark:bg-slate-600/20 dark:text-slate-300 ring-1 ring-slate-600/40 dark:ring-slate-600/60",
  };
  const s = (severity || "unknown").toLowerCase();
  return (
    <Badge className={cfg[s] || cfg.unknown}>
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </Badge>
  );
}

export function ToolBadge({ tool }) {
  const cfg = {
    zap: "bg-blue-600/20 text-blue-700 dark:bg-blue-600/20 dark:text-blue-300 ring-1 ring-blue-600/40 dark:ring-blue-600/60",
    nuclei:
      "bg-purple-600/20 text-purple-700 dark:bg-purple-600/20 dark:text-purple-300 ring-1 ring-purple-600/40 dark:ring-purple-600/60",
    openvas:
      "bg-cyan-600/20 text-cyan-700 dark:bg-cyan-600/20 dark:text-cyan-300 ring-1 ring-cyan-600/40 dark:ring-cyan-600/60",
    nmap: "bg-emerald-600/20 text-emerald-700 dark:bg-emerald-600/20 dark:text-emerald-300 ring-1 ring-emerald-600/40 dark:ring-emerald-600/60",
  };
  const t = (tool || "").toLowerCase();
  const labels = {
    zap: "ZAP",
    nuclei: "Nuclei",
    openvas: "OpenVAS",
    nmap: "Nmap",
  };
  return (
    <Badge
      className={
        cfg[t] ||
        "bg-slate-600/20 text-slate-700 dark:bg-slate-600/20 dark:text-slate-300 ring-1 ring-slate-600/40 dark:ring-slate-600/60"
      }
    >
      {labels[t] || tool?.toUpperCase()}
    </Badge>
  );
}
