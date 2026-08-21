import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ServerIcon } from '@heroicons/react/24/outline'
import { CircularProgress, Alert } from '@mui/material'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { TierBadge } from '../components/ui/Badge'
import { getTargets } from '../api/client'
import { fmtDate } from '../utils/helpers'

export default function Targets() {
  const navigate = useNavigate()
  const [targets, setTargets] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    getTargets()
      .then(d => setTargets(d.targets || []))
      .catch(e => setErr(e.response?.data?.detail || e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Targets"
        subtitle="Assets seen across your scan history, aggregated from persisted findings."
      />

      {err && (
        <Alert severity="error" sx={{ bgcolor: 'rgba(220,38,38,0.1)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.3)' }}>
          {err}
        </Alert>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <CircularProgress size={28} />
        </div>
      )}

      {!loading && !err && targets.length === 0 && (
        <Card className="text-center py-12">
          <ServerIcon className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--muted-foreground)' }} />
          <p className="text-[var(--foreground)] font-medium">No targets yet</p>
          <p className="text-[13px] mt-1 text-[var(--muted-foreground)]">Upload a scan to start building your asset history.</p>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {targets.map((t) => (
          <button
            key={t.host}
            onClick={() => navigate(`/targets/${encodeURIComponent(t.host)}`)}
            className="text-left"
          >
            <Card className="hover:border-[var(--primary-600)] smooth-transition cursor-pointer h-full">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <ServerIcon className="w-4 h-4 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                  <p className="font-semibold text-[14px] text-[var(--foreground)] truncate">{t.host}</p>
                </div>
                {t.highest_tier && <TierBadge tier={t.highest_tier} />}
              </div>
              <p className="text-[13px] text-[var(--muted-foreground)]">
                {t.finding_count} finding{t.finding_count === 1 ? '' : 's'}
              </p>
              <p className="text-[11px] mt-1 text-[var(--muted-foreground)]">
                Last seen {fmtDate(t.last_seen)}
              </p>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}
