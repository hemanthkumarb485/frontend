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
    start: 'Starting',
    parsing: 'Parsing Files',
    normalization: 'Normalizing',
    deduplication: 'Deduplicating',
    enrichment: 'Enriching (NVD/EPSS/KEV)',
    scoring: 'Scoring Risk',
    processing: 'Processing',
    complete: 'Complete',
    error: 'Error',
  }

  const isComplete = stage === 'complete'
  const isError = stage === 'error'

  return (
    <div
      className="rounded-md p-5 space-y-4 border"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[var(--foreground)]">
          {stageLabels[stage] || stage}
        </span>
        <span className="mono font-bold text-[var(--primary)]">{percent}%</span>
      </div>

      {/* Bar */}
      <div
        className="w-full h-[5px] rounded-md overflow-hidden"
        style={{ background: 'var(--muted)' }}
      >
        <div
          className={`h-full rounded-md transition-all duration-500 ${
            isError ? 'bg-red-500' : isComplete ? 'bg-emerald-500' : 'bg-[var(--primary-600)]'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex justify-between text-[12.5px] text-[var(--muted-foreground)]">
        <span>{message}</span>
        <span className="flex gap-4">
          <span>Elapsed: {elapsed_seconds?.toFixed(1)}s</span>
          {eta != null && <span>ETA: ~{eta}s</span>}
        </span>
      </div>
    </div>
  )
}
