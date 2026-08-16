import { clsx } from 'clsx'

export function Badge({ children, className }) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold', className)}>
      {children}
    </span>
  )
}

export function TierBadge({ tier }) {
  const cfg = {
    P0: 'bg-red-600 text-white',
    P1: 'bg-orange-500 text-white',
    P2: 'bg-yellow-500 text-black',
    P3: 'bg-green-600 text-white',
    UNSCORED: 'bg-slate-600 text-slate-200',
  }
  return <Badge className={cfg[tier] || cfg.UNSCORED}>{tier}</Badge>
}

export function SeverityBadge({ severity }) {
  const cfg = {
    critical: 'bg-red-900/60 text-red-300 ring-1 ring-red-700',
    high:     'bg-orange-900/60 text-orange-300 ring-1 ring-orange-700',
    medium:   'bg-yellow-900/60 text-yellow-300 ring-1 ring-yellow-700',
    low:      'bg-green-900/60 text-green-300 ring-1 ring-green-700',
    informational: 'bg-slate-700 text-slate-300',
    unknown:  'bg-slate-700 text-slate-300',
  }
  const s = (severity || 'unknown').toLowerCase()
  return <Badge className={cfg[s] || cfg.unknown}>{s.charAt(0).toUpperCase() + s.slice(1)}</Badge>
}

export function ToolBadge({ tool }) {
  const cfg = {
    zap:     'bg-blue-900/60 text-blue-300',
    nuclei:  'bg-purple-900/60 text-purple-300',
    openvas: 'bg-cyan-900/60 text-cyan-300',
    nmap:    'bg-emerald-900/60 text-emerald-300',
  }
  const t = (tool || '').toLowerCase()
  const labels = { zap: 'ZAP', nuclei: 'Nuclei', openvas: 'OpenVAS', nmap: 'Nmap' }
  return <Badge className={cfg[t] || 'bg-slate-700 text-slate-300'}>{labels[t] || tool?.toUpperCase()}</Badge>
}
