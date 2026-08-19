import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TextField, Button, Alert, CircularProgress } from '@mui/material'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(null)
    setBusy(true)
    try {
      const data = await signUp(email, password)
      if (data.session) {
        navigate('/dashboard', { replace: true })
      } else {
        // Email confirmation required before a session exists.
        setDone(true)
      }
    } catch (e) {
      setErr(e.message || 'Sign up failed')
    } finally {
      setBusy(false)
    }
  }

  const inputSx = {
    input: { color: 'var(--foreground)' },
    '.MuiOutlinedInput-root': {
      bgcolor: 'var(--surface-2)',
      '.MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border)' },
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--muted-foreground)' },
    },
    '.MuiInputLabel-root': { color: 'var(--muted-foreground)' },
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-sm rounded-xl p-6 space-y-5 glow-box" style={{ background: 'var(--surface)' }}>
        <div>
          <h1 className="text-lg font-bold text-[var(--foreground)]">Create your account</h1>
          <p className="text-[13px] mt-1 text-[var(--muted-foreground)]">Start scanning and prioritizing vulnerabilities.</p>
        </div>

        {err && <Alert severity="error" sx={{ bgcolor: 'rgba(220,38,38,0.1)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.3)' }}>{err}</Alert>}
        {done && <Alert severity="success" sx={{ bgcolor: 'rgba(5,150,105,0.1)', color: '#34d399', border: '1px solid rgba(5,150,105,0.3)' }}>Check your email to confirm your account, then sign in.</Alert>}

        {!done && (
          <form onSubmit={submit} className="space-y-4">
            <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              fullWidth size="small" required sx={inputSx} />
            <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
              fullWidth size="small" required inputProps={{ minLength: 6 }} sx={inputSx} />
            <Button type="submit" variant="contained" fullWidth disabled={busy}
              startIcon={busy ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{ bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' }, textTransform: 'none', fontWeight: 600, py: 1 }}>
              {busy ? 'Creating account…' : 'Sign up'}
            </Button>
          </form>
        )}

        <p className="text-[13px] text-center text-[var(--muted-foreground)]">
          Already have an account? <Link to="/login" className="text-[#3b82f6] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
