import { clsx } from 'clsx'

const variants = {
  primary:   'bg-indigo-600 hover:bg-indigo-500 text-white',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600',
  danger:    'bg-red-700 hover:bg-red-600 text-white',
  ghost:     'hover:bg-slate-700 text-slate-300',
  success:   'bg-emerald-700 hover:bg-emerald-600 text-white',
}

const sizes = {
  sm:  'px-3 py-1.5 text-xs',
  md:  'px-4 py-2 text-sm',
  lg:  'px-6 py-2.5 text-base',
}

export function Button({ children, variant = 'primary', size = 'md', className, disabled, onClick, type = 'button', icon: Icon }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  )
}
