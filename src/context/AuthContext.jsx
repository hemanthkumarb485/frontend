import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }, [])

  const signUp = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  // Sends the reset-password email. redirectTo must be an allowed redirect
  // URL in the Supabase project's Auth settings, or the link in the email
  // will fail — set to the app's own /reset-password page.
  const sendPasswordReset = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }, [])

  // Only works when the user arrived via the emailed reset link — that
  // link carries a recovery token which supabase-js exchanges for a
  // short-lived session automatically on load (see ResetPassword.jsx).
  const updatePassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }, [])

  return (
    <AuthContext.Provider value={{
      session, user: session?.user || null, loading,
      signIn, signUp, signOut, sendPasswordReset, updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
