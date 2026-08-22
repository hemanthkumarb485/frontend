/** Priority tier colors & labels */
export const TIER_CONFIG = {
  P0: { label: 'P0 Critical', bg: 'bg-red-600',    text: 'text-red-100',    border: 'border-red-500',    dot: 'bg-red-500'    },
  P1: { label: 'P1 High',     bg: 'bg-orange-500', text: 'text-orange-100', border: 'border-orange-400', dot: 'bg-orange-400' },
  P2: { label: 'P2 Medium',   bg: 'bg-yellow-500', text: 'text-yellow-100', border: 'border-yellow-400', dot: 'bg-yellow-400' },
  P3: { label: 'P3 Low',      bg: 'bg-blue-600',   text: 'text-blue-100',   border: 'border-blue-500',   dot: 'bg-blue-500'   },
  UNSCORED: { label: 'Unscored', bg: 'bg-slate-600', text: 'text-slate-200', border: 'border-slate-500', dot: 'bg-slate-400' },
}

export const SEVERITY_CONFIG = {
  critical:      { color: 'text-red-400',    bg: 'bg-red-900/40'    },
  high:          { color: 'text-orange-400', bg: 'bg-orange-900/40' },
  medium:        { color: 'text-yellow-400', bg: 'bg-yellow-900/40' },
  low:           { color: 'text-blue-400',   bg: 'bg-blue-900/40'   },
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

/** Buckets a numeric risk_score.final_score (0-100) into a label/color for
 * RiskScorePill's number coloring — a continuous "heat" read of the score
 * itself, independent of the discrete P0-P3 tier. */
export function getRiskLevel(score) {
  if (score >= 85) return { label: 'Critical', color: 'var(--sev-critical)' }
  if (score >= 70) return { label: 'High', color: 'var(--sev-high)' }
  if (score >= 45) return { label: 'Medium', color: 'var(--sev-medium)' }
  return { label: 'Low', color: 'var(--sev-low)' }
}

/** Maps risk_score.priority_tier (P0-P3/UNSCORED) to a label/color for
 * RiskLevelBadge — deliberately tier-based, not score-based: a CWE-based
 * finding (no CVE) is capped at P1 by risk_engine.py regardless of how high
 * its numeric score is (no P0 without live-exploit evidence), so bucketing
 * by raw score alone can label a P1 finding "R-Critical" while the P0
 * summary card correctly reads 0 — this keeps the two in agreement. */
export function getRiskLevelFromTier(tier) {
  switch (tier) {
    case 'P0': return { label: 'Critical', color: 'var(--sev-critical)' }
    case 'P1': return { label: 'High', color: 'var(--sev-high)' }
    case 'P2': return { label: 'Medium', color: 'var(--sev-medium)' }
    case 'P3': return { label: 'Low', color: 'var(--sev-low)' }
    default: return { label: 'Unscored', color: 'var(--muted-foreground)' }
  }
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
