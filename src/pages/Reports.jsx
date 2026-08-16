import { useState } from 'react'
import { useScan } from '../context/ScanContext'
import { exportJSON, exportPDF } from '../api/client'
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { getTierCounts } from '../utils/helpers'
import { useNavigate } from 'react-router-dom'

export default function Reports() {
  const { session } = useScan()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(null)
  const [msg, setMsg] = useState(null)

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-4">
        <p className="text-slate-400">No scan data. Upload first.</p>
        <button onClick={() => navigate('/upload')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Upload →</button>
      </div>
    )
  }

  const tierCounts = getTierCounts(session.findings || [])

  const handle = async (type) => {
    setLoading(type); setMsg(null)
    try {
      if (type === 'json') await exportJSON(session)
      else await exportPDF(session)
      setMsg(`${type.toUpperCase()} downloaded successfully!`)
    } catch (e) { setMsg('Export failed: ' + e.message) }
    finally { setLoading(null) }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Reports & Export</h1>
        <p className="text-slate-400 text-sm mt-1">Download the current scan session as JSON or PDF.</p>
      </div>

      {/* Session summary */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-3">
        <h2 className="text-slate-200 font-semibold text-sm">Current Session Summary</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Session ID', session.session_id?.slice(0,16) + '…'],
            ['Tools Used', session.tools_detected?.join(', ')],
            ['Total Findings', session.total_after_dedup],
            ['Scored Findings', session.total_scored],
            ['Unscored (No CVE)', session.total_unscored],
            ['Processing Time', session.processing_time_seconds ? session.processing_time_seconds.toFixed(1) + 's' : '—'],
            ['P0 Critical', tierCounts.P0],
            ['P1 High', tierCounts.P1],
            ['P2 Medium', tierCounts.P2],
            ['P3 Low', tierCounts.P3],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <span className="text-slate-400 w-40 flex-shrink-0">{k}:</span>
              <span className="text-slate-200 font-medium">{String(v ?? '—')}</span>
            </div>
          ))}
        </div>
      </div>

      {msg && <div className="bg-emerald-900/40 border border-emerald-700 rounded-xl p-3 text-emerald-300 text-sm">{msg}</div>}

      {/* Export buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/30 rounded-lg"><DocumentArrowDownIcon className="w-5 h-5 text-blue-400" /></div>
            <div>
              <p className="text-slate-200 font-semibold text-sm">JSON Export</p>
              <p className="text-slate-400 text-xs">Full structured data — same format as frontend display</p>
            </div>
          </div>
          <button onClick={() => handle('json')} disabled={loading === 'json'}
            className="w-full py-2.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
            {loading === 'json' ? 'Generating...' : '⬇ Download JSON'}
          </button>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-900/30 rounded-lg"><DocumentArrowDownIcon className="w-5 h-5 text-red-400" /></div>
            <div>
              <p className="text-slate-200 font-semibold text-sm">PDF Report</p>
              <p className="text-slate-400 text-xs">Formatted report with risk breakdown (top 100 findings)</p>
            </div>
          </div>
          <button onClick={() => handle('pdf')} disabled={loading === 'pdf'}
            className="w-full py-2.5 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
            {loading === 'pdf' ? 'Generating...' : '⬇ Download PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}
