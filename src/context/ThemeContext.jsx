import { createContext, useContext, useState, useMemo } from 'react'
import { createTheme, ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('theme') || 'dark')

  const toggleTheme = () => {
    setMode(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', next)
      return next
    })
  }

  const muiTheme = useMemo(() => createTheme({
    palette: {
      mode,
      ...(mode === 'dark' ? {
        primary:    { main: '#6366f1' },
        background: { default: '#0f172a', paper: '#1e293b' },
        text:       { primary: '#f1f5f9', secondary: '#94a3b8' },
      } : {
        primary:    { main: '#4f46e5' },
        background: { default: '#f8fafc', paper: '#ffffff' },
        text:       { primary: '#0f172a', secondary: '#475569' },
      }),
    },
    typography: { fontFamily: 'Inter, system-ui, sans-serif' },
    shape: { borderRadius: 10 },
  }), [mode])

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider')
  return ctx
}
