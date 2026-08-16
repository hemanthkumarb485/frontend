import { useState, useEffect } from 'react'
import { useScan } from '../context/ScanContext'
import { getGithubOAuthUrl, connectGithubPAT, getGithubRepos, createGithubIssue } from '../api/client'
import { TierBadge } from '../components/ui/Badge'
import { fmtScore } from '../utils/helpers'
import { Chip, Button, Alert, CircularProgress, Select, MenuItem, TextField, Tab, Tabs, Box } from '@mui/material'
import { CheckCircle as CheckCircleIcon, GitHub as GitHubIcon, Key as KeyIcon, Refresh as RefreshIcon, Logout as LogoutIcon } from '@mui/icons-material'

export default function Tickets() {
  const { session, githubToken, githubUsername, selectedRepo,
          saveSelectedRepo, raisedTickets, markTicketRaised, saveGithubConnection, disconnectGithub } = useScan()
  const [repos, setRepos]             = useState([])
  const [reposLoaded, setReposLoaded] = useState(false)
  const [creating, setCreating]       = useState(null)
  const [err, setErr]                 = useState(null)
  const [connectTab, setConnectTab]   = useState('pat') // Default to PAT since OAuth Client ID is placeholder by default
  const [pat, setPat]                 = useState('')
  const [connectingPat, setConnectingPat] = useState(false)
  const [warning, setWarning]         = useState(null)
  const [reconnecting, setReconnecting] = useState(false)

  const findings = session?.findings || []
  const p0p1 = findings.filter(f => ['P0','P1'].includes(f.risk_score?.priority_tier))

  // Listen to postMessage from the OAuth callback popup window
  useEffect(() => {
    const handleOAuthMessage = (event) => {
      if (event.data && event.data.type === 'github-connected') {
        const { encrypted_token, github_username } = event.data
        saveGithubConnection(encrypted_token, github_username)
        setErr(null)
        setWarning(null)
        setReconnecting(false)
        setRepos([])
        setReposLoaded(false)
      }
    }
    window.addEventListener('message', handleOAuthMessage)
    return () => window.removeEventListener('message', handleOAuthMessage)
  }, [saveGithubConnection])

  const connectOAuth = async () => {
    try {
      setErr(null)
      const { oauth_url } = await getGithubOAuthUrl()
      window.open(oauth_url, '_blank', 'width=600,height=700')
    } catch (e) {
      setErr('OAuth failed: ' + (e.response?.data?.detail || e.message))
    }
  }

  const connectWithPAT = async () => {
    if (!pat.trim()) {
      setErr('Please enter your GitHub Personal Access Token.')
      return
    }
    setConnectingPat(true)
    setErr(null)
    setWarning(null)
    try {
      const data = await connectGithubPAT(pat.trim())
      saveGithubConnection(data.encrypted_token, data.github_username)
      setWarning(data.warning || null)
      setPat('')
      setReconnecting(false)
      setRepos([])
      setReposLoaded(false)
      saveSelectedRepo('')
    } catch (e) {
      setErr('PAT connection failed: ' + (e.response?.data?.detail || e.message))
    } finally {
      setConnectingPat(false)
    }
  }

  const loadRepos = async () => {
    try {
      const d = await getGithubRepos(githubToken)
      setRepos(d.repositories || [])
      setReposLoaded(true)
    } catch (e) {
      setErr(e.message)
    }
  }

  const createIssue = async (f) => {
    if (!githubToken || !selectedRepo) {
      setErr('Connect GitHub and select a repo first.')
      return
    }
    setCreating(f.finding_id)
    setErr(null)
    markTicketRaised(f.finding_id, { status: 'creating' })
    try {
      const r = await createGithubIssue({
        finding_id: f.finding_id,
        finding_data: f,
        repo_full_name: selectedRepo,
        labels: ['security', 'vulnerability', f.risk_score?.priority_tier?.toLowerCase() || 'vuln']
      }, githubToken)
      if (r.success) {
        markTicketRaised(f.finding_id, { status: 'raised', issue_number: r.issue_number, issue_url: r.issue_url })
      } else {
        markTicketRaised(f.finding_id, null)
        setErr(r.error || 'Failed')
      }
    } catch (e) {
      markTicketRaised(f.finding_id, null)
      setErr(e.message)
    } finally {
      setCreating(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">GitHub Tickets</h1>
        <p className="text-slate-400 text-sm mt-1">Create GitHub Issues from vulnerability findings.</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
        <h2 className="text-slate-200 font-semibold text-sm">GitHub Connection</h2>
        
        {githubUsername ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"/>
              <span className="text-emerald-300 text-sm">Connected as <strong>{githubUsername}</strong></span>
              <div className="ml-auto flex gap-2">
                <Button variant="outlined" size="small" startIcon={<RefreshIcon style={{fontSize:14}}/>}
                  onClick={() => { setReconnecting(r => !r); setErr(null); setWarning(null) }}
                  sx={{fontSize:'0.7rem',borderColor:'#6366f1',color:'#818cf8',textTransform:'none','&:hover':{borderColor:'#818cf8',bgcolor:'#6366f115'}}}>
                  Reconnect
                </Button>
                <Button variant="text" size="small" startIcon={<LogoutIcon style={{fontSize:14}}/>}
                  onClick={() => { disconnectGithub(); setRepos([]); setReposLoaded(false); setReconnecting(false); setWarning(null) }}
                  sx={{fontSize:'0.7rem',color:'#94a3b8',textTransform:'none','&:hover':{color:'#fca5a5'}}}>
                  Disconnect
                </Button>
              </div>
            </div>

            {reconnecting && (
              <div className="space-y-3 border-t border-slate-700 pt-3">
                <label className="text-slate-400 text-xs block">Enter a new token to reconnect</label>
                <div className="flex gap-2 max-w-md">
                  <TextField
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    size="small"
                    value={pat}
                    onChange={e => setPat(e.target.value)}
                    sx={{
                      input: { color: '#f1f5f9' },
                      '.MuiOutlinedInput-root': {
                        bgcolor: '#0f172a',
                        '.MuiOutlinedInput-notchedOutline': { borderColor: '#334155' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' }
                      }
                    }}
                    fullWidth
                  />
                  <Button variant="contained" onClick={connectWithPAT} disabled={connectingPat}
                    startIcon={connectingPat ? <CircularProgress size={16} color="inherit" /> : <KeyIcon />}
                    sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, textTransform: 'none', fontWeight: 600, px: 3, whiteSpace: 'nowrap' }}>
                    {connectingPat ? 'Connecting...' : 'Connect New Token'}
                  </Button>
                </div>
                <p className="text-slate-500 text-xs">Fine-grained: <strong>Issues: Read and write</strong> on the repo · Classic: <strong>repo</strong> scope.</p>
                <Button variant="outlined" size="small" startIcon={<GitHubIcon style={{fontSize:14}}/>} onClick={connectOAuth}
                  sx={{fontSize:'0.7rem',borderColor:'#24292f',color:'#e2e8f0',textTransform:'none','&:hover':{bgcolor:'#30363d'}}}>
                  Or reconnect via GitHub OAuth
                </Button>
              </div>
            )}
            
            {!reposLoaded && (
              <Button variant="outlined" size="small" onClick={loadRepos}
                sx={{borderColor:'#6366f1',color:'#818cf8',textTransform:'none','&:hover':{borderColor:'#818cf8',bgcolor:'#6366f115'}}}>
                Load Repositories
              </Button>
            )}
            
            {reposLoaded && (
              <div className="pt-2">
                <label className="text-slate-400 text-xs mb-1 block">Select Repository</label>
                <Select value={selectedRepo||''} onChange={e=>saveSelectedRepo(e.target.value)} size="small"
                  sx={{bgcolor:'#0f172a',color:'#f1f5f9',minWidth:280,'.MuiOutlinedInput-notchedOutline':{borderColor:'#334155'}}}>
                  <MenuItem value="">select repo</MenuItem>
                  {repos.map(r=><MenuItem key={r.repo_id} value={r.full_name||r.repo_full_name}>{r.full_name||r.repo_full_name}</MenuItem>)}
                </Select>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Box sx={{ borderBottom: 1, borderColor: '#334155' }}>
              <Tabs value={connectTab} onChange={(e, val) => setConnectTab(val)} 
                sx={{
                  '.MuiTab-root': { color: '#94a3b8', textTransform: 'none', fontWeight: 600 },
                  '.Mui-selected': { color: '#818cf8 !important' },
                  '.MuiTabs-indicator': { bgcolor: '#6366f1' }
                }}>
                <Tab label="Personal Access Token (PAT)" value="pat" />
                <Tab label="GitHub OAuth" value="oauth" />
              </Tabs>
            </Box>

            {connectTab === 'pat' ? (
              <div className="space-y-3 max-w-md">
                <p className="text-slate-400 text-xs">
                  Generate a token at <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-indigo-400 underline">github.com/settings/tokens</a> with one of:
                </p>
                <ul className="text-slate-400 text-xs list-disc pl-4 space-y-1">
                  <li><strong className="text-slate-200">Fine-grained token</strong> → Repository permissions → <strong>Issues: Read and write</strong>, selected on the target repo.</li>
                  <li><strong className="text-slate-200">Classic token</strong> → <code className="text-indigo-300">repo</code> scope (<code className="text-indigo-300">public_repo</code> for public repos only).</li>
                </ul>
                <div className="flex gap-2">
                  <TextField
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    size="small"
                    value={pat}
                    onChange={e => setPat(e.target.value)}
                    sx={{
                      input: { color: '#f1f5f9' },
                      '.MuiOutlinedInput-root': {
                        bgcolor: '#0f172a',
                        '.MuiOutlinedInput-notchedOutline': { borderColor: '#334155' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#475569' }
                      }
                    }}
                    fullWidth
                  />
                  <Button 
                    variant="contained" 
                    onClick={connectWithPAT}
                    disabled={connectingPat}
                    startIcon={connectingPat ? <CircularProgress size={16} color="inherit" /> : <KeyIcon />}
                    sx={{ bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, textTransform: 'none', fontWeight: 600, px: 3, whiteSpace: 'nowrap' }}
                  >
                    {connectingPat ? 'Connecting...' : 'Connect PAT'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-slate-400 text-xs max-w-lg">
                  Authenticates via GitHub's OAuth system. Requires a registered Client ID and Secret in backend environment variables.
                </p>
                <Button variant="contained" startIcon={<GitHubIcon/>} onClick={connectOAuth}
                  sx={{bgcolor:'#24292f','&:hover':{bgcolor:'#30363d'},textTransform:'none',fontWeight:700}}>
                  Connect via GitHub OAuth
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {err && <Alert severity="error" onClose={()=>setErr(null)} sx={{bgcolor:'#450a0a',color:'#fca5a5',border:'1px solid #991b1b'}}>{err}</Alert>}
      {warning && <Alert severity="warning" onClose={()=>setWarning(null)} sx={{bgcolor:'#451a03',color:'#fcd34d',border:'1px solid #92400e'}}>{warning}</Alert>}

      <div className="space-y-3">
        <h2 className="text-slate-300 font-semibold text-sm">P0 &amp; P1 Findings ({p0p1.length})</h2>
        {p0p1.length===0 && <p className="text-slate-400 text-sm">No P0/P1 findings in current session.</p>}
        {p0p1.map(f => {
          const tk       = raisedTickets[f.finding_id]
          const isRaised = tk?.status === 'raised'
          const isBusy   = tk?.status === 'creating' || creating === f.finding_id
          return (
            <div key={f.finding_id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <TierBadge tier={f.risk_score?.priority_tier||'UNSCORED'}/>
                <div className="min-w-0">
                  <p className="text-slate-200 font-medium text-sm truncate">{f.vulnerability_name}</p>
                  <p className="text-slate-400 text-xs">{f.asset?.hostname||f.asset?.ip||'—'} · Score: {fmtScore(f.risk_score?.final_score)}/100</p>
                </div>
              </div>
              {isRaised ? (
                <a href={tk.issue_url} target="_blank" rel="noopener noreferrer">
                  <Chip icon={<CheckCircleIcon style={{fontSize:14}}/>} label={`#${tk.issue_number} Raised`} size="small"
                    sx={{bgcolor:'#065f46',color:'#6ee7b7',fontWeight:700,cursor:'pointer','&:hover':{bgcolor:'#047857'}}}/>
                </a>
              ) : (
                <Button variant="outlined" size="small" disabled={isBusy||!githubToken||!selectedRepo}
                  startIcon={isBusy?<CircularProgress size={12} color="inherit"/>:null}
                  onClick={()=>createIssue(f)}
                  sx={{fontSize:'0.7rem',borderColor:'#6366f1',color:'#818cf8',whiteSpace:'nowrap',textTransform:'none',
                    '&:hover':{bgcolor:'#6366f120',borderColor:'#818cf8'},
                    '&:disabled':{borderColor:'#334155',color:'#475569'}}}>
                  {isBusy?'Creating…':'Raise Ticket'}
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
