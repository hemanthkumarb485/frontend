import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { TextField, Button, Alert, CircularProgress, InputAdornment, IconButton } from '@mui/material'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ThemeToggleFab } from '../components/ui/ThemeToggleFab'
import { AuthBrandHeader, useAuthStyles } from '../components/ui/AuthShell'

// Reached only via the link in the password-reset email. That link carries
// a recovery token which supabase-js exchanges for a session automatically
// on load (see AuthContext's onAuthStateChange) — so `user` being set here
// means the link was valid; if it's still null once the initial auth check
// finishes loading, the link was missing/expired/already used.
export default function ResetPassword() {
  const { user, loading, updatePassword } = useAuth()
  const { inputSx, buttonSx } = useAuthStyles()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [done, setDone] = useState(false)

  const longEnough = password.length >= 6
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const showMismatch = confirmPassword.length > 0 && !passwordsMatch

  const submit = async (e) => {
    e.preventDefault()
    setErr(null)
    if (!longEnough) {
      setErr('Password must be at least 6 characters.')
      return
    }
    if (!passwordsMatch) {
      setErr('Passwords do not match.')
      return
    }
    setBusy(true)
    try {
      await updatePassword(password)
      setDone(true)
      setTimeout(() => navigate('/dashboard', { replace: true }), 1800)
    } catch (e) {
      setErr(e.message || 'Could not update password')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-sm flex flex-col gap-8">
        <AuthBrandHeader />

        <div className="w-full rounded-xl p-7 flex flex-col gap-6 glow-box" style={{ background: 'var(--surface)' }}>
          {loading ? (
            <div className="flex justify-center py-6">
              <CircularProgress size={24} />
            </div>
          ) : !user ? (
            <>
              <div>
                <h1 className="text-lg font-bold text-[var(--foreground)]">Link expired or invalid</h1>
                <p className="text-[13px] mt-1.5 text-[var(--muted-foreground)]">
                  This password reset link is no longer valid — reset links expire and can only be used once. Request a new one.
                </p>
              </div>
              <Link to="/forgot-password">
                <Button variant="contained" fullWidth sx={buttonSx}>Request new link</Button>
              </Link>
            </>
          ) : done ? (
            <Alert severity="success" sx={{ bgcolor: 'rgba(5,150,105,0.1)', color: '#34d399', border: '1px solid rgba(5,150,105,0.3)' }}>
              Password updated — redirecting…
            </Alert>
          ) : (
            <>
              <div>
                <h1 className="text-lg font-bold text-[var(--foreground)]">Set a new password</h1>
                <p className="text-[13px] mt-1.5 text-[var(--muted-foreground)]">Choose a new password for your account.</p>
              </div>

              {err && <Alert severity="error" sx={{ bgcolor: 'rgba(220,38,38,0.1)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.3)' }}>{err}</Alert>}

              <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <TextField
                    label="New password" type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    fullWidth size="small" required autoComplete="new-password" autoFocus
                    inputProps={{ minLength: 6 }} sx={inputSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock className="size-4" style={{ color: 'var(--muted-foreground)' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(v => !v)}
                            edge="end" size="small" tabIndex={-1}
                            sx={{ color: 'var(--muted-foreground)' }}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {password.length > 0 && !longEnough && (
                    <p className="text-[11px] pl-1" style={{ color: 'var(--sev-critical)' }}>At least 6 characters</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <TextField
                    label="Confirm new password" type={showPassword ? 'text' : 'password'} value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    fullWidth size="small" required autoComplete="new-password"
                    error={showMismatch} sx={inputSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock className="size-4" style={{ color: 'var(--muted-foreground)' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {showMismatch && (
                    <p className="text-[11px] pl-1" style={{ color: 'var(--sev-critical)' }}>Passwords do not match</p>
                  )}
                </div>
                <Button type="submit" variant="contained" fullWidth disabled={busy}
                  startIcon={busy ? <CircularProgress size={16} color="inherit" /> : null}
                  sx={buttonSx}>
                  {busy ? 'Updating…' : 'Update password'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

      <ThemeToggleFab />
    </div>
  )
}
