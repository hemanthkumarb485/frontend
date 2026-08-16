import { useState, useMemo } from 'react'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { useScan } from '../context/ScanContext'
import { FindingCard } from '../components/FindingCard'
import { getGithubOAuthUrl, getGithubRepos, createGithubIssue } from '../api/client'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, CircularProgress, Alert } from '@mui/material'

const TIERS = ['All', 'P0', 'P1', 'P2', 'P3', 'UNSCORED']
const TOOLS = ['All', 'zap', 'nuclei', 'openvas', 'nmap']
const TIER_LABELS = { P0:'🔴 P0 Critical', P1:'🟠 P1 High', P2:'🟡 P2 Medium', P3:'🟢 P3 Low', UNSCORED:'⚪ Unscored' }

export default function Findings() {
  const navigate = useNavigate()
  const { session, githubToken, selectedRepo, saveSelectedRepo, raisedTickets, markTicketRaised } = useScan()
  const [search, setSearch]         = useState('')
  const [tierFilter, setTierFilter] = useState('All')
  const [toolFilter, setToolFilter] = useState('All')
  const [view, setView]             = useState('priority')
  const [authDialog, setAuthDialog]       = useState(false)
  const [repos, setRepos]                 = useState([])
  const [repoLoading, setRepoLoading]     = useState(false)
  const [pendingFinding, setPendingFinding] = useState(null)
  const [ticketError, setTicketError]     = useState(null)

  const findings = session?.findings || []
  const filtered = useMemo(() => findings.filter(f => {
    const tier = f.risk_score?.priority_tier || 'UNSCORED'
    const tool = f.source_tool || ''
    const matchTier   = tierFilter === 'All' || tier === tierFilter
    const matchTool   = toolFilter === 'All' || tool === toolFilter
    const q           = search.toLowerCase()
    const matchSearch = !q || (f.vulnerability_name||'').toLowerCase().includes(q) ||
      (f.cve_id||'').toLowerCase().includes(q) ||
      (f.cwe_id||'').toLowerCase().includes(q) ||
      (f.asset?.hostname||'').toLowerCase().includes(q) ||
      (f.asset?.ip||'').toLowerCase().includes(q)
    return matchTier && matchTool && matchSearch
  }), [findings, tierFilter, toolFilter, search])

  const grouped = useMemo(() => {
    if (view === 'priority') {
      const g = { P0:[], P1:[], P2:[], P3:[], UNSCORED:[] }
      filtered.forEach(f => { const t = f.risk_score?.priority_tier || 'UNSCORED'; g[t]?.push(f) })
      return g
    }
    const g = {}
    filtered.forEach(f => {
      const host = f.asset?.hostname || f.asset?.ip || f.asset?.domain || f.asset?.url || 'Unknown'
      if (!g[host]) g[host] = []
      g[host].push(f)
    })
    return g
  }, [filtered, view])

  const handleRaiseTicket = async (finding) => {
    setTicketError(null)
    if (!githubToken) { setPendingFinding(finding); setAuthDialog(true); return }
    if (!selectedRepo) { setPendingFinding(finding); setAuthDialog(true); if (!repos.length) await loadRepos(); return }
    await doRaiseTicket(finding, githubToken, selectedRepo)
  }

  const loadRepos = async () => {
    setRepoLoading(true)
    try { const d = await getGithubRepos(githubToken); setRepos(d.repositories || []) }
    catch (e) { setTicketError(e.message) }
    finally { setRepoLoading(false) }
  }

  const doRaiseTicket = async (finding, token, repo) => {
    markTicketRaised(finding.finding_id, { status: 'creating' })
    try {
      const r = await createGithubIssue({
        finding_id: finding.finding_id, finding_data: finding, repo_full_name: repo,
        labels: ['security','vulnerability', finding.risk_score?.priority_tier?.toLowerCase() || 'vuln'],
      }, token)
      if (r.success) {
        markTicketRaised(finding.finding_id, { status:'raised', issue_number:r.issue_number, issue_url:r.issue_url })
      } else { markTicketRaised(finding.finding_id, null); setTicketError(r.error || 'Failed') }
    } catch (e) { markTicketRaised(finding.finding_id, null); setTicketError(e.message) }
  }

  const connectGithub = async () => {
    try { const { oauth_url } = await getGithubOAuthUrl(); window.open(oauth_url,'_blank','width=600,height=700') }
    catch (e) { setTicketError(e.message) }
  }

  if (!session) return (
    <div className="flex flex-col items-center justify-center h-80 gap-4">
      <p className="text-slate-400">No scan data. Upload first.</p>
      <button onClick={() => navigate('/upload')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Upload</button>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Findings</h1>
          <p className="text-slate-400 text-sm">{filtered.length} of {findings.length} findings</p>
        </div>
        <div className="flex gap-2">
          {['priority','host'].map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${view===v?'bg-indigo-600 text-white':'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
              {v==='priority'?'Priority View':'Host View'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, CVE, host..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </div>
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4 text-slate-400" />
          <select value={tierFilter} onChange={e=>setTierFilter(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none">
            {TIERS.map(t=><option key={t}>{t}</option>)}
          </select>
          <select value={toolFilter} onChange={e=>setToolFilter(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none">
            {TOOLS.map(t=><option key={t} value={t}>{t==='All'?'All Tools':t.toUpperCase()}</option>)}
          </select>
        </div>
      </div>
      {ticketError && <Alert severity="error" onClose={()=>setTicketError(null)} sx={{bgcolor:'#450a0a',color:'#fca5a5'}}>{ticketError}</Alert>}

      <div className="space-y-6">
        {Object.entries(grouped).map(([group, items]) => {
          if (!items.length) return null
          return (
            <div key={group}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-slate-300 font-semibold text-sm">{view==='priority'?TIER_LABELS[group]||group:`🌐 ${group}`}</h2>
                <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded-full">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map(f => (
                  <FindingCard key={f.finding_id} finding={f}
                    onRaiseTicket={handleRaiseTicket}
                    raisedTicket={raisedTickets[f.finding_id] || null} />
                ))}
              </div>
            </div>
          )
        })}
        {filtered.length===0 && <div className="text-center py-12 text-slate-400">No findings match your filters.</div>}
      </div>

      <Dialog open={authDialog} onClose={()=>setAuthDialog(false)}
        PaperProps={{sx:{bgcolor:'#1e293b',color:'#f1f5f9',borderRadius:3,minWidth:360}}}>
        <DialogTitle sx={{color:'#f1f5f9',fontWeight:700}}>{githubToken ? 'Select Repository' : 'Connect GitHub'}</DialogTitle>
        <DialogContent>
          {!githubToken ? (
            <div className="space-y-3 pt-1">
              <p className="text-slate-400 text-sm">Authenticate with GitHub to raise tickets. You will only be asked once.</p>
              <Button variant="contained" fullWidth onClick={connectGithub}
                sx={{bgcolor:'#6366f1','&:hover':{bgcolor:'#4f46e5'},textTransform:'none',fontWeight:700}}>
                Connect GitHub
              </Button>
              <p className="text-slate-500 text-xs">After authorising, click Raise Ticket again.</p>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <p className="text-slate-400 text-sm">Select the repository where the issue will be created.</p>
              {repoLoading ? <CircularProgress size={24} sx={{color:'#6366f1',display:'block',mx:'auto'}}/> : (
                repos.length === 0
                  ? <Button variant="outlined" fullWidth onClick={loadRepos} sx={{borderColor:'#6366f1',color:'#818cf8',textTransform:'none'}}>Load Repositories</Button>
                  : <Select value={selectedRepo||''} onChange={e=>saveSelectedRepo(e.target.value)} fullWidth size="small"
                      sx={{bgcolor:'#0f172a',color:'#f1f5f9','.MuiOutlinedInput-notchedOutline':{borderColor:'#334155'}}}>
                      <MenuItem value="">select repo</MenuItem>
                      {repos.map(r=><MenuItem key={r.repo_id} value={r.full_name}>{r.full_name}</MenuItem>)}
                    </Select>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{px:3,pb:2}}>
          <Button onClick={()=>setAuthDialog(false)} sx={{color:'#94a3b8',textTransform:'none'}}>Cancel</Button>
          {githubToken && selectedRepo && (
            <Button variant="contained" onClick={()=>{ setAuthDialog(false); pendingFinding && doRaiseTicket(pendingFinding, githubToken, selectedRepo) }}
              sx={{bgcolor:'#6366f1','&:hover':{bgcolor:'#4f46e5'},textTransform:'none',fontWeight:700}}>
              Raise Ticket
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  )
}
