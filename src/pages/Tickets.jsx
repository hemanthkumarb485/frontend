import { useState, useEffect } from 'react'
import { useScan } from '../context/ScanContext'
import { useTheme } from '../context/ThemeContext'
import { getGithubOAuthUrl, connectGithubPAT, getGithubRepos, createGithubIssue } from '../api/client'
import { TierBadge } from '../components/ui/Badge'
import { PageHeader } from '../components/ui/PageHeader'
import { fmtScore } from '../utils/helpers'
import { Chip, Button, Alert, CircularProgress, Select, MenuItem, TextField, Tab, Tabs, Box } from '@mui/material'
import { CheckCircle as CheckCircleIcon, GitHub as GitHubIcon, Key as KeyIcon, Refresh as RefreshIcon, Logout as LogoutIcon } from '@mui/icons-material'

export default function Tickets() {
  const { session, githubToken, githubUsername, selectedRepo,
          saveSelectedRepo, raisedTickets, markTicketRaised, saveGithubConnection, disconnectGithub } = useScan()
  const { mode } = useTheme()
  const isDark = mode === "dark"
  const [repos, setRepos]             = useState([])
  const [reposLoaded, setReposLoaded] = useState(false)
  const [creating, setCreating]       = useState(null)
  const [err, setErr]                 = useState(null)
  const [connectTab, setConnectTab]   = useState('pat')
  const [pat, setPat]                 = useState('')
  const [connectingPat, setConnectingPat] = useState(false)
  const [warning, setWarning]         = useState(null)
  const [reconnecting, setReconnecting] = useState(false)

  const findings = session?.findings || []
  const p0p1 = findings.filter(f => ['P0','P1'].includes(f.risk_score?.priority_tier))

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
      <PageHeader
        title="GitHub Tickets"
        subtitle="Create GitHub Issues from vulnerability findings."
      />

      <div
        className="rounded-xl p-5 space-y-4 glow-box smooth-transition"
        style={{ background: 'var(--surface)' }}
      >
        <h2 className="text-[13px] font-semibold text-[var(--foreground)]">GitHub Connection</h2>

        {githubUsername ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 text-sm">Connected as <strong>{githubUsername}</strong></span>
              <div className="ml-auto flex gap-2">
                <Button variant="outlined" size="small" startIcon={<RefreshIcon style={{fontSize:14}}/>}
                  onClick={() => { setReconnecting(r => !r); setErr(null); setWarning(null) }}
                  sx={{fontSize:'0.7rem',borderColor:'#2563eb',color:'#3b82f6',textTransform:'none','&:hover':{borderColor:'#3b82f6',bgcolor:'rgba(37,99,235,0.06)'}}}>
                  Reconnect
                </Button>
                <Button variant="text" size="small" startIcon={<LogoutIcon style={{fontSize:14}}/>}
                  onClick={() => { disconnectGithub(); setRepos([]); setReposLoaded(false); setReconnecting(false); setWarning(null) }}
                  sx={{fontSize:'0.7rem',color:'var(--muted-foreground)',textTransform:'none','&:hover':{color:'#f87171'}}}>
                  Disconnect
                </Button>
              </div>
            </div>

            {reconnecting && (
              <div className="space-y-3 border-t border-[var(--border)] pt-3">
                <label className="text-[var(--muted-foreground)] text-xs block">Enter a new token to reconnect</label>
                <div className="flex gap-2 max-w-md">
                  <TextField
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    size="small"
                    value={pat}
                    onChange={e => setPat(e.target.value)}
                    sx={{
                      input: { color: 'var(--foreground)' },
                      '.MuiOutlinedInput-root': {
                        bgcolor: 'var(--surface-2)',
                        '.MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--muted-foreground)' }
                      }
                    }}
                    fullWidth
                  />
                  <Button variant="contained" onClick={connectWithPAT} disabled={connectingPat}
                    startIcon={connectingPat ? <CircularProgress size={16} color="inherit" /> : <KeyIcon />}
                    sx={{ bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' }, textTransform: 'none', fontWeight: 600, px: 3, whiteSpace: 'nowrap' }}>
                    {connectingPat ? 'Connecting...' : 'Connect New Token'}
                  </Button>
                </div>
                <p className="text-[var(--muted-foreground)] text-xs">Fine-grained: <strong>Issues: Read and write</strong> on the repo · Classic: <strong>repo</strong> scope.</p>
                <Button variant="outlined" size="small" startIcon={<GitHubIcon style={{fontSize:14}}/>} onClick={connectOAuth}
                  sx={{fontSize:'0.7rem',borderColor:'#24292f',color:'#e2e8f0',textTransform:'none','&:hover':{bgcolor:'#30363d'}}}>
                  Or reconnect via GitHub OAuth
                </Button>
              </div>
            )}

            {!reposLoaded && (
              <Button variant="outlined" size="small" onClick={loadRepos}
                sx={{borderColor:'#2563eb',color:'#3b82f6',textTransform:'none','&:hover':{borderColor:'#3b82f6',bgcolor:'rgba(37,99,235,0.06)'}}}>
                Load Repositories
              </Button>
            )}

            {reposLoaded && (
              <div className="pt-2">
                <label className="text-[var(--muted-foreground)] text-xs mb-1 block">Select Repository</label>
                <Select value={selectedRepo||''} onChange={e=>saveSelectedRepo(e.target.value)} size="small"
                  sx={{bgcolor:'var(--surface-2)',color:'var(--foreground)',minWidth:280,'.MuiOutlinedInput-notchedOutline':{borderColor:'var(--border)'}}}>
                  <MenuItem value="">select repo</MenuItem>
                  {repos.map(r=><MenuItem key={r.repo_id} value={r.full_name||r.repo_full_name}>{r.full_name||r.repo_full_name}</MenuItem>)}
                </Select>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Box sx={{ borderBottom: 1, borderColor: 'var(--border)' }}>
              <Tabs value={connectTab} onChange={(e, val) => setConnectTab(val)}
                sx={{
                  '.MuiTab-root': { color: 'var(--muted-foreground)', textTransform: 'none', fontWeight: 600 },
                  '.Mui-selected': { color: '#3b82f6 !important' },
                  '.MuiTabs-indicator': { bgcolor: '#2563eb' }
                }}>
                <Tab label="Personal Access Token (PAT)" value="pat" />
                <Tab label="GitHub OAuth" value="oauth" />
              </Tabs>
            </Box>

            {connectTab === 'pat' ? (
              <div className="space-y-3 max-w-md">
                <p className="text-[var(--muted-foreground)] text-xs">
                  Generate a token at <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="text-primary-400 underline">github.com/settings/tokens</a> with one of:
                </p>
                <ul className="text-[var(--muted-foreground)] text-xs list-disc pl-4 space-y-1">
                  <li><strong className="text-[var(--foreground)]">Fine-grained token</strong> → Repository permissions → <strong>Issues: Read and write</strong>, selected on the target repo.</li>
                  <li><strong className="text-[var(--foreground)]">Classic token</strong> → <code className="text-primary-300">repo</code> scope (<code className="text-primary-300">public_repo</code> for public repos only).</li>
                </ul>
                <div className="flex flex-col sm:flex-row gap-2">
                  <TextField
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    size="small"
                    value={pat}
                    onChange={e => setPat(e.target.value)}
                    sx={{
                      input: { color: 'var(--foreground)' },
                      '.MuiOutlinedInput-root': {
                        bgcolor: 'var(--surface-2)',
                        '.MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border)' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--muted-foreground)' }
                      }
                    }}
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    onClick={connectWithPAT}
                    disabled={connectingPat}
                    startIcon={connectingPat ? <CircularProgress size={16} color="inherit" /> : <KeyIcon />}
                    sx={{ bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' }, textTransform: 'none', fontWeight: 600, px: 3, whiteSpace: 'nowrap', width: { xs: '100%', sm: 'auto' } }}
                  >
                    {connectingPat ? 'Connecting...' : 'Connect PAT'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[var(--muted-foreground)] text-xs max-w-lg">
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

      {err && <Alert severity="error" onClose={()=>setErr(null)} sx={{bgcolor:'rgba(220,38,38,0.1)',color:'#fca5a5',border:'1px solid rgba(220,38,38,0.3)'}}>{err}</Alert>}
      {warning && <Alert severity="warning" onClose={()=>setWarning(null)} sx={{bgcolor:'rgba(234,179,8,0.1)',color:'#fbbf24',border:'1px solid rgba(234,179,8,0.3)'}}>{warning}</Alert>}

      <div className="space-y-3">
        <h2 className="text-[13px] font-semibold text-[var(--foreground)]">P0 & P1 Findings ({p0p1.length})</h2>
        {p0p1.length===0 && <p className="text-[var(--muted-foreground)] text-[13px]">No P0/P1 findings in current session.</p>}
        {p0p1.map(f => {
          const tk       = raisedTickets[f.finding_id]
          const isRaised = tk?.status === 'raised'
          const isBusy   = tk?.status === 'creating' || creating === f.finding_id
          return (
            <div key={f.finding_id}
              className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 glow-box smooth-transition"
              style={{ background: 'var(--surface)' }}
            >
              <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                <TierBadge tier={f.risk_score?.priority_tier||'UNSCORED'}/>
                <div className="min-w-0 flex-1">
                  <p className="text-[var(--foreground)] font-medium text-[13px] truncate">{f.vulnerability_name}</p>
                  <p className="text-[var(--muted-foreground)] text-xs">{f.asset?.hostname||f.asset?.ip||'\u2014'} · Score: {fmtScore(f.risk_score?.final_score)}/100</p>
                </div>
              </div>
              <div className="w-full sm:w-auto flex justify-end">
                {isRaised ? (
                  <a href={tk.issue_url} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto text-right">
                    <Chip icon={<CheckCircleIcon style={{fontSize:14}}/>} label={`#${tk.issue_number} Raised`} size="small"
                      sx={{bgcolor:'#059669',color:'white',fontWeight:700,cursor:'pointer','&:hover':{bgcolor:'#047857'}, width: { xs: '100%', sm: 'auto' }, justifyContent: 'center'}}/>
                  </a>
                ) : (
                  <Button variant="outlined" size="small" disabled={isBusy||!githubToken||!selectedRepo}
                    startIcon={isBusy?<CircularProgress size={12} color="inherit"/>:null}
                    onClick={()=>createIssue(f)}
                    sx={{fontSize:'0.7rem',borderColor:'#2563eb',color:'#3b82f6',whiteSpace:'nowrap',textTransform:'none',
                      '&:hover':{bgcolor:'rgba(37,99,235,0.08)',borderColor:'#3b82f6'},
                      '&:disabled':{borderColor:'var(--border)',color:'var(--muted-foreground)'},
                      width: { xs: '100%', sm: 'auto' }}}>
                    {isBusy?'Creating\u2026':'Raise Ticket'}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
