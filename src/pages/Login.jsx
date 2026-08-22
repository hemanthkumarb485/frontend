import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { TextField, Button, Alert, CircularProgress, InputAdornment, IconButton, Stack } from '@mui/material'
import { Mail, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { ThemeToggleFab } from '../components/ui/ThemeToggleFab'

export default function Login() {
  const { signIn } = useAuth()
  const { mode } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  const from = location.state?.from?.pathname || '/dashboard'

  const submit = async (e) => {
    e.preventDefault()
    setErr(null)
    setBusy(true)
    try {
      await signIn(email, password)
      navigate(from, { replace: true })
    } catch (e) {
      setErr(e.message || 'Sign in failed')
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
            <h1 className="text-lg font-bold text-[var(--foreground)]">Sign in</h1>
            <p className="text-[13px] mt-1.5 text-[var(--muted-foreground)]">Access your vulnerability dashboard.</p>
          </div>

          {err && <Alert severity="error" sx={{ bgcolor: 'rgba(220,38,38,0.1)', color: '#fca5a5', border: '1px solid rgba(220,38,38,0.3)' }}>{err}</Alert>}

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
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-[12px] font-semibold hover:underline"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Forgot password?
                </Link>
              </div>
              <TextField
                label="Password" type={showPassword ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                fullWidth size="small" required autoComplete="current-password" sx={inputSx}
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
            </div>
            <Button type="submit" variant="contained" fullWidth disabled={busy}
              startIcon={busy ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{
                bgcolor: btnBg, color: btnFg,
                '&:hover': { bgcolor: btnBg, opacity: 0.85 },
                '&.Mui-disabled': { bgcolor: 'var(--muted-foreground)', color: btnFg },
                textTransform: 'none', fontWeight: 700, py: 1.1, borderRadius: '10px',
              }}>
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>
          </Stack>

          <p className="text-[13px] text-center text-[var(--muted-foreground)]">
            No account?{' '}
            <Link to="/signup" className="font-bold underline underline-offset-2" style={{ color: 'var(--foreground)' }}>
              Sign up
            </Link>
          </p>
        </Stack>
      </Stack>

      <ThemeToggleFab />
    </div>
  )
}
