import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TextField, Button, Alert, CircularProgress, InputAdornment } from '@mui/material'
import { Mail, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ThemeToggleFab } from '../components/ui/ThemeToggleFab'
import { AuthBrandHeader, useAuthStyles } from '../components/ui/AuthShell'

export default function ForgotPassword() {
  const { sendPasswordReset } = useAuth()
  const { inputSx, buttonSx } = useAuthStyles()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [sent, setSent] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(null)
    setBusy(true)
    try {
      await sendPasswordReset(email)
      setSent(true)
    } catch (e) {
      setErr(e.message || 'Could not send reset email')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-sm flex flex-col gap-8">
        <AuthBrandHeader />

        <div className="w-full rounded-xl p-7 flex flex-col gap-6 glow-box" style={{ background: 'var(--surface)' }}>
          <div>
            <h1 className="text-lg font-bold text-[var(--foreground)]">Reset your password</h1>
            <p className="text-[13px] mt-1.5 text-[var(--muted-foreground)]">
              Enter your account email and we'll send you a link to set a new password.
            </p>
          </div>

          {err && <Alert severity="error" sx={{ bgcolor: 'rgba(220,38,38,0.1)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.3)' }}>{err}</Alert>}

          {sent ? (
            <Alert severity="success" sx={{ bgcolor: 'rgba(5,150,105,0.1)', color: '#34d399', border: '1px solid rgba(5,150,105,0.3)' }}>
              If an account exists for <strong>{email}</strong>, a reset link has been sent — check your inbox (and spam folder).
            </Alert>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-6">
              <TextField
                label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                fullWidth size="small" required autoComplete="email" autoFocus sx={inputSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail className="size-4" style={{ color: 'var(--muted-foreground)' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button type="submit" variant="contained" fullWidth disabled={busy}
                startIcon={busy ? <CircularProgress size={16} color="inherit" /> : null}
                sx={buttonSx}>
                {busy ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>
          )}

          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold justify-center"
            style={{ color: 'var(--foreground)' }}
          >
            <ArrowLeft className="size-3.5" /> Back to sign in
          </Link>
        </div>
      </div>

      <ThemeToggleFab />
    </div>
  )
}
