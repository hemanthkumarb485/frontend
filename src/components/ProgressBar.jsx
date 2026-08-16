/**
 * ProgressBar — SSE real-time progress display.
 * Shows: stage label, animated bar, % complete, elapsed time, ETA.
 */
export function ProgressBar({ progress }) {
  if (!progress) return null

  const { stage, percent, message, elapsed_seconds } = progress
  const eta = percent > 5 && percent < 100
    ? Math.round((elapsed_seconds / percent) * (100 - percent))
    : null

  const stageLabels = {
    start: '🚀 Starting',
    parsing: '📂 Parsing Files',
    normalization: '🔄 Normalizing',
    deduplication: '🔍 Deduplicating',
    enrichment: '🛡️ Enriching (NVD/EPSS/KEV)',
    scoring: '📊 Scoring Risk',
    processing: '⚙️ Processing',
    complete: '✅ Complete',
    error: '❌ Error',
  }

  const isComplete = stage === 'complete'
  const isError = stage === 'error'

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-200">
          {stageLabels[stage] || stage}
        </span>
        <span className="text-sm font-bold text-indigo-400">{percent}%</span>
      </div>

      {/* Bar */}
      <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isError ? 'bg-red-500' : isComplete ? 'bg-emerald-500' : 'bg-indigo-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-400">
        <span>{message}</span>
        <span className="flex gap-4">
          <span>Elapsed: {elapsed_seconds?.toFixed(1)}s</span>
          {eta != null && <span>ETA: ~{eta}s</span>}
        </span>
      </div>
    </div>
  )
}
