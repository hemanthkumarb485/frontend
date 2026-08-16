import { clsx } from "clsx";

export function Card({ children, className }) {
  return (
    <div
      className={clsx(
        "rounded-xl border smooth-transition backdrop-blur-xs",
        "dark:bg-slate-900/60 dark:border-slate-800/50 dark:hover:border-slate-700/50 dark:shadow-lg dark:hover:shadow-xl dark:hover:shadow-slate-900/20",
        "bg-white/80 border-slate-200/60 hover:border-slate-300/60 shadow-sm hover:shadow-md hover:shadow-slate-900/5",
        "p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <div className="flex items-center justify-between mb-4 gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {Icon && (
          <div className="p-2.5 rounded-lg shrink-0 backdrop-blur-sm dark:bg-primary-600/20 dark:text-primary-400 bg-primary-50 text-primary-700">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-sm dark:text-slate-100 text-slate-900">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs mt-0.5 dark:text-slate-400 text-slate-600">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  color = "text-primary-600",
  icon: Icon,
}) {
  return (
    <Card className="flex items-center gap-4">
      {Icon && (
        <div className="p-3 rounded-xl shrink-0 dark:bg-slate-800/60 dark:text-primary-400 bg-slate-100 text-primary-600">
          <Icon className={clsx("w-6 h-6", color)} />
        </div>
      )}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide dark:text-slate-400 text-slate-600">
          {label}
        </p>
        <p className={clsx("text-2xl font-bold mt-0.5", color)}>{value}</p>
        {sub && (
          <p className="text-xs mt-0.5 dark:text-slate-500 text-slate-500">
            {sub}
          </p>
        )}
      </div>
    </Card>
  );
}
