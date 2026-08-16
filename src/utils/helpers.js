/** Priority tier colors & labels */
export const TIER_CONFIG = {
  P0: { label: 'P0 Critical', bg: 'bg-red-600',    text: 'text-red-100',    border: 'border-red-500',    dot: 'bg-red-500'    },
  P1: { label: 'P1 High',     bg: 'bg-orange-500', text: 'text-orange-100', border: 'border-orange-400', dot: 'bg-orange-400' },
  P2: { label: 'P2 Medium',   bg: 'bg-yellow-500', text: 'text-yellow-100', border: 'border-yellow-400', dot: 'bg-yellow-400' },
  P3: { label: 'P3 Low',      bg: 'bg-green-600',  text: 'text-green-100',  border: 'border-green-500',  dot: 'bg-green-500'  },
  UNSCORED: { label: 'Unscored', bg: 'bg-slate-600', text: 'text-slate-200', border: 'border-slate-500', dot: 'bg-slate-400' },
}

export const SEVERITY_CONFIG = {
  critical:      { color: 'text-red-400',    bg: 'bg-red-900/40'    },
  high:          { color: 'text-orange-400', bg: 'bg-orange-900/40' },
  medium:        { color: 'text-yellow-400', bg: 'bg-yellow-900/40' },
  low:           { color: 'text-green-400',  bg: 'bg-green-900/40'  },
  informational: { color: 'text-slate-400',  bg: 'bg-slate-900/40'  },
  unknown:       { color: 'text-slate-400',  bg: 'bg-slate-900/40'  },
}

export const TOOL_CONFIG = {
  zap:     { label: 'OWASP ZAP', color: 'text-blue-400',   bg: 'bg-blue-900/30'   },
  nuclei:  { label: 'Nuclei',    color: 'text-purple-400', bg: 'bg-purple-900/30' },
  openvas: { label: 'OpenVAS',   color: 'text-cyan-400',   bg: 'bg-cyan-900/30'   },
  nmap:    { label: 'Nmap',      color: 'text-emerald-400',bg: 'bg-emerald-900/30'},
}

export function getTierConfig(tier) {
  return TIER_CONFIG[tier] || TIER_CONFIG.UNSCORED
}

export function getSeverityConfig(sev) {
  return SEVERITY_CONFIG[(sev || '').toLowerCase()] || SEVERITY_CONFIG.unknown
}

export function getToolConfig(tool) {
  return TOOL_CONFIG[(tool || '').toLowerCase()] || { label: tool, color: 'text-slate-400', bg: 'bg-slate-900/30' }
}

/** Get priority tier counts from findings */
export function getTierCounts(findings = []) {
  const counts = { P0: 0, P1: 0, P2: 0, P3: 0, UNSCORED: 0 }
  findings.forEach(f => {
    const tier = f.risk_score?.priority_tier || 'UNSCORED'
    counts[tier] = (counts[tier] || 0) + 1
  })
  return counts
}

/** Group findings by host */
export function groupByHost(findings = []) {
  const map = {}
  findings.forEach(f => {
    const host = f.asset?.hostname || f.asset?.ip || f.asset?.domain || f.asset?.url || 'Unknown'
    if (!map[host]) map[host] = []
    map[host].push(f)
  })
  return map
}

/** Group findings by priority tier */
export function groupByTier(findings = []) {
  const map = { P0: [], P1: [], P2: [], P3: [], UNSCORED: [] }
  findings.forEach(f => {
    const tier = f.risk_score?.priority_tier || 'UNSCORED'
    if (!map[tier]) map[tier] = []
    map[tier].push(f)
  })
  return map
}

/** Format a score to 1 decimal */
export function fmtScore(score) {
  if (score == null) return 'N/A'
  return Number(score).toFixed(1)
}

/** Truncate text */
export function truncate(str, n = 80) {
  if (!str) return '—'
  return str.length > n ? str.slice(0, n) + '…' : str
}

/**
 * Strip HTML tags from a string and decode common HTML entities.
 * Used to clean ZAP descriptions/solutions that contain raw HTML like <p>, <b>, &lt; etc.
 */
export function stripHtml(str) {
  if (!str) return '—'
  return str
    // Remove all HTML tags
    .replace(/<\/?[^>]+(>|$)/g, ' ')
    // Decode common HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Collapse multiple spaces/newlines into one
    .replace(/\s+/g, ' ')
    .trim()
}

/** Format ISO date */
export function fmtDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
  catch { return iso }
}
