export function PageHeader({ title, subtitle, actions, children }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] pb-6 mb-8">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight sm:text-2xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-[13px] text-[var(--muted-foreground)]">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-wrap">{actions}</div>
      )}
      {children}
    </div>
  );
}
