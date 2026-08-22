import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TextField, Button, Alert, CircularProgress, InputAdornment, IconButton, Stack } from '@mui/material'
import { Mail, Lock, Eye, EyeOff, ShieldAlert, Check, X as XIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { ThemeToggleFab } from '../components/ui/ThemeToggleFab'

export default function Signup() {
  const { signUp } = useAuth()
  const { mode } = useTheme()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [done, setDone] = useState(false)

  const longEnough = password.length >= 6
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword
  const showConfirmMismatch = confirmPassword.length > 0 && !passwordsMatch

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
      borderRadius: '10px',
      '.MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border)' },
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--muted-foreground)' },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary)', borderWidth: '1.5px' },
    },
    '.MuiInputLabel-root': { color: 'var(--muted-foreground)' },
    '.MuiInputLabel-root.Mui-focused': { color: 'var(--primary)' },
  }

  // MUI's contained Button computes its own background/text color from the
  // theme palette for `.MuiButton-containedPrimary`, and that beat plain
  // `var(--foreground)`/`var(--background)` CSS-variable references in sx
  // (verified: identical var() references resolve correctly on plain
  // elements on this same page, only the Button ends up inverted) — so the
  // exact hex is computed here in JS instead, matching index.css's
  // --foreground/--background values for each mode, to sidestep whatever
  // MUI-internal precedence was winning.
  const isDark = mode === 'dark'
  const btnBg = isDark ? '#fafafa' : '#09090b'
  const btnFg = isDark ? '#09090b' : '#f4f4f5'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: 'var(--background)' }}>
      {/* Stack (MUI, spacing via inline style) rather than Tailwind's
          space-y-* — verified space-y's margin wasn't computing in this
          build (getComputedStyle showed marginTop: 0px despite the class
          being applied), so every gap on this page uses a mechanism that
          doesn't depend on Tailwind's utility generation picking it up. */}
      <Stack spacing={4} className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-xl border"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <ShieldAlert className="w-7 h-7 logo-glow-blink" style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <p className="font-black text-lg tracking-tight" style={{ color: 'var(--foreground)' }}>VulneraX</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Risk Prioritization
            </p>
          </div>
        </div>

        <Stack spacing={3} className="w-full rounded-xl p-7 glow-box" style={{ background: 'var(--surface)' }}>
          <div>
            <h1 className="text-lg font-bold text-[var(--foreground)]">Create your account</h1>
            <p className="text-[13px] mt-1.5 text-[var(--muted-foreground)]">Start scanning and prioritizing vulnerabilities.</p>
          </div>

          {err && <Alert severity="error" sx={{ bgcolor: 'rgba(220,38,38,0.1)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.3)' }}>{err}</Alert>}
          {done && <Alert severity="success" sx={{ bgcolor: 'rgba(5,150,105,0.1)', color: '#34d399', border: '1px solid rgba(5,150,105,0.3)' }}>Check your email to confirm your account, then sign in.</Alert>}

          {!done && (
            <Stack component="form" onSubmit={submit} spacing={3}>
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
              <Stack spacing={0.5}>
                <TextField
                  label="Password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  fullWidth size="small" required autoComplete="new-password" inputProps={{ minLength: 6 }} sx={inputSx}
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
                {password.length > 0 && (
                  <p className="flex items-center gap-1 text-[11px] pl-1" style={{ color: longEnough ? 'var(--sev-low)' : 'var(--muted-foreground)' }}>
                    {longEnough ? <Check className="size-3" /> : <XIcon className="size-3" />}
                    At least 6 characters
                  </p>
                )}
              </Stack>
              <Stack spacing={0.5}>
                <TextField
                  label="Confirm password" type={showPassword ? 'text' : 'password'} value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  fullWidth size="small" required autoComplete="new-password"
                  error={showConfirmMismatch}
                  sx={inputSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="size-4" style={{ color: 'var(--muted-foreground)' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                {showConfirmMismatch && (
                  <p className="flex items-center gap-1 text-[11px] pl-1" style={{ color: 'var(--sev-critical)' }}>
                    <XIcon className="size-3" /> Passwords do not match
                  </p>
                )}
              </Stack>
              <Button type="submit" variant="contained" fullWidth disabled={busy}
                startIcon={busy ? <CircularProgress size={16} color="inherit" /> : null}
                sx={{
                  bgcolor: btnBg, color: btnFg,
                  '&:hover': { bgcolor: btnBg, opacity: 0.85 },
                  '&.Mui-disabled': { bgcolor: 'var(--muted-foreground)', color: btnFg },
                  textTransform: 'none', fontWeight: 700, py: 1.1, borderRadius: '10px',
                }}>
                {busy ? 'Creating account…' : 'Sign up'}
              </Button>
            </Stack>
          )}

          <p className="text-[13px] text-center text-[var(--muted-foreground)]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold underline underline-offset-2" style={{ color: 'var(--foreground)' }}>
              Sign in
            </Link>
          </p>
        </Stack>
      </Stack>

      <ThemeToggleFab />
    </div>
  )
}
