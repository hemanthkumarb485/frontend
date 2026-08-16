import { clsx } from "clsx";

const variants = {
  primary: clsx(
    "bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white",
    "dark:shadow-lg dark:shadow-primary-900/30 shadow-sm shadow-primary-600/20",
    "active:from-primary-800 active:to-primary-900",
  ),
  secondary: clsx(
    "bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100",
    "border border-slate-300 dark:border-slate-700",
  ),
  danger: clsx(
    "bg-red-600 hover:bg-red-700 text-white",
    "dark:shadow-lg dark:shadow-red-900/30 shadow-sm shadow-red-600/20",
  ),
  success: clsx(
    "bg-emerald-600 hover:bg-emerald-700 text-white",
    "dark:shadow-lg dark:shadow-emerald-900/30 shadow-sm shadow-emerald-600/20",
  ),
  warning: clsx(
    "bg-amber-600 hover:bg-amber-700 text-white",
    "dark:shadow-lg dark:shadow-amber-900/30 shadow-sm shadow-amber-600/20",
  ),
  outline: clsx(
    "border-2 border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-600/10",
    "dark:border-primary-500",
  ),
  ghost: clsx(
    "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50",
  ),
};

const sizes = {
  xs: "px-2.5 py-1.5 text-xs gap-1",
  sm: "px-3 py-1.5 text-sm gap-2",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-2.5 text-base gap-2",
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
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold smooth-transition",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 focus:ring-offset-slate-100",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:none",
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
