import { clsx } from "clsx";

export function Card({ children, className }) {
  return (
    <div
      className={clsx(
        "rounded-lg bg-[var(--surface)] p-4 sm:p-6 border border-[var(--border)] glow-box smooth-transition",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <div className="flex items-center justify-between mb-4 gap-4 pb-2">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {Icon && (
          <div
            className="grid size-9 shrink-0 place-items-center rounded-md border border-[var(--border)] bg-[var(--accent)] text-[var(--foreground)]"
          >
            <Icon className="w-[18px] h-[18px]" />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-base text-[var(--foreground)]">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[13px] mt-0.5 text-[var(--muted-foreground)]">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({ children, className }) {
  return <div className={clsx("p-6 pt-0", className)}>{children}</div>;
}

export function StatCard({
  label,
  value,
  sub,
  color = "text-[var(--primary-600)]",
  icon: Icon,
}) {
  return (
    <Card className="flex items-center gap-3 !p-[16px] sm:!p-[18px]">
      {Icon && (
        <div
          className={clsx(
            "grid size-9 shrink-0 place-items-center rounded-md border smooth-transition",
            color
          )}
          style={{
            borderColor: "color-mix(in oklab, currentColor 35%, transparent)",
            background: "color-mix(in oklab, currentColor 10%, transparent)",
            boxShadow: "0 0 14px color-mix(in oklab, currentColor 25%, transparent)",
          }}
        >
          <Icon className="w-[18px] h-[18px]" style={{ filter: "drop-shadow(0 0 2px currentColor)" }} />
        </div>
      )}
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted-foreground)] leading-tight truncate">
          {label}
        </p>
        <p className="text-[25px] font-extrabold tracking-tight mt-1 leading-none text-[var(--foreground)]">
          {value}
        </p>
        {sub && (
          <p className="text-[11.5px] mt-1 text-[var(--muted-foreground)] leading-tight truncate">
            {sub}
          </p>
        )}
      </div>
    </Card>
  );
}
