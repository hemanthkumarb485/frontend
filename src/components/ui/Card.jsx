import { clsx } from 'clsx'

export function Card({ children, className }) {
  return (
    <div className={clsx('bg-slate-800 border border-slate-700 rounded-xl p-5', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {Icon && <div className="p-2 bg-indigo-600/20 rounded-lg"><Icon className="w-5 h-5 text-indigo-400" /></div>}
        <div>
          <h3 className="text-slate-100 font-semibold text-sm">{title}</h3>
          {subtitle && <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function StatCard({ label, value, sub, color = 'text-indigo-400', icon: Icon }) {
  return (
    <Card className="flex items-center gap-4">
      {Icon && (
        <div className="p-3 bg-slate-700 rounded-xl flex-shrink-0">
          <Icon className={clsx('w-6 h-6', color)} />
        </div>
      )}
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-wide">{label}</p>
        <p className={clsx('text-2xl font-bold', color)}>{value}</p>
        {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </Card>
  )
}
