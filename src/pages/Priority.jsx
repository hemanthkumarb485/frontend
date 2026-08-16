import { useScan } from '../context/ScanContext'
import { getTierCounts, fmtScore, TIER_CONFIG } from '../utils/helpers'
import { TierBadge, SeverityBadge, ToolBadge } from '../components/ui/Badge'
import { useNavigate } from 'react-router-dom'

export default function Priority() {
  const { session } = useScan()
  const navigate = useNavigate()

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-4">
        <p className="text-slate-400">No scan data. Upload first.</p>
        <button onClick={() => navigate('/upload')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Upload →</button>
      </div>
    )
  }

  const findings = session.findings || []
  const tierCounts = getTierCounts(findings)

  const grouped = { P0: [], P1: [], P2: [], P3: [], UNSCORED: [] }
  findings.forEach(f => {
    const t = f.risk_score?.priority_tier || 'UNSCORED'
    grouped[t]?.push(f)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Risk & Priority</h1>
        <p className="text-slate-400 text-sm mt-1">Findings sorted by composite risk score (0–100). Higher = more urgent.</p>
      </div>

      {/* Tier summary */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(TIER_CONFIG).map(([tier, cfg]) => (
          <div key={tier} className={`rounded-xl p-4 border ${cfg.border} bg-slate-800`}>
            <p className="text-xs text-slate-400 mb-1">{cfg.label}</p>
            <p className="text-3xl font-bold text-slate-100">{tierCounts[tier] || 0}</p>
            <p className="text-xs text-slate-500 mt-1">findings</p>
          </div>
        ))}
      </div>

      {/* Per-tier tables */}
      {Object.entries(grouped).map(([tier, items]) => {
        if (!items.length) return null
        const cfg = TIER_CONFIG[tier]
        return (
          <div key={tier} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className={`px-5 py-3 border-b border-slate-700 flex items-center gap-3`}>
              <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
              <h2 className="text-slate-200 font-semibold text-sm">{cfg.label}</h2>
              <span className="text-slate-500 text-xs">({items.length} findings)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Score</th>
                    <th className="px-4 py-3 text-left">Vulnerability</th>
                    <th className="px-4 py-3 text-left">Severity</th>
                    <th className="px-4 py-3 text-left">Tool</th>
                    <th className="px-4 py-3 text-left">Host</th>
                    <th className="px-4 py-3 text-left">CVE/CWE</th>
                    <th className="px-4 py-3 text-left">Signals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {items.map(f => {
                    const ti = f.threat_intel || {}
                    const risk = f.risk_score || {}
                    const host = f.asset?.hostname || f.asset?.ip || f.asset?.domain || '—'
                    return (
                      <tr key={f.finding_id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-xl font-bold text-indigo-400">{fmtScore(risk.final_score)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-slate-200 font-medium truncate max-w-48">{f.vulnerability_name}</p>
                        </td>
                        <td className="px-4 py-3"><SeverityBadge severity={f.severity} /></td>
                        <td className="px-4 py-3"><ToolBadge tool={f.source_tool} /></td>
                        <td className="px-4 py-3 text-slate-300 text-xs">{host}</td>
                        <td className="px-4 py-3 text-xs">
                          <span className={f.cve_id ? 'text-blue-400' : 'text-slate-500'}>{f.cve_id || '—'}</span>
                          {f.cwe_id && <span className="text-violet-400 ml-1.5">{f.cwe_id}</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {ti.is_kev && <span className="text-xs bg-red-900 text-red-300 px-1.5 py-0.5 rounded font-semibold">KEV</span>}
                            {ti.has_public_exploit && <span className="text-xs bg-orange-900 text-orange-300 px-1.5 py-0.5 rounded">Exploit</span>}
                            {ti.epss_score > 0.3 && <span className="text-xs bg-yellow-900 text-yellow-300 px-1.5 py-0.5 rounded">EPSS↑</span>}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
