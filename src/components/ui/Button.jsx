import { clsx } from "clsx";

const variants = {
  primary: clsx(
    "bg-[var(--primary-600)] hover:bg-[var(--primary-700)] text-[var(--primary-foreground)]",
    "shadow-sm",
    "active:bg-[var(--primary-700)]",
  ),
  secondary: clsx(
    "bg-[var(--muted)] hover:bg-[var(--muted)]/80 text-[var(--foreground)]",
    "border border-[var(--border)]",
  ),
  danger: clsx(
    "bg-[var(--destructive)] hover:bg-[var(--destructive)]/90 text-white",
    "shadow-sm",
  ),
  success: clsx(
    "bg-emerald-600 hover:bg-emerald-700 text-white",
    "shadow-sm",
  ),
  warning: clsx(
    "bg-amber-600 hover:bg-amber-700 text-white",
    "shadow-sm",
  ),
  outline: clsx(
    "border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]",
  ),
  ghost: clsx(
    "text-[var(--foreground)] hover:bg-[var(--accent)]",
  ),
};

const sizes = {
  xs: "px-2.5 py-1.5 text-xs gap-1",
  sm: "px-3 py-1.5 text-sm gap-2",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-2.5 text-[15px] gap-2",
  xl: "px-8 py-3 text-base gap-3",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  disabled,
  onClick,
  type = "button",
  icon: Icon,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium smooth-transition",
        "focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--background)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
}
