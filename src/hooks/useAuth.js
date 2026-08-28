import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

const DEMO_USER = { id: 'demo-user', email: 'demo@local' }

export function useAuth() {
  const [user, setUser] = useState(isSupabaseConfigured ? null : DEMO_USER)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signInWithPassword = useCallback(async (email, password) => {
    if (!isSupabaseConfigured) return
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
  }, [])

  const signUp = useCallback(async (email, password) => {
    if (!isSupabaseConfigured) return
    setError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
  }, [])

  const sendMagicLink = useCallback(async (email) => {
    if (!isSupabaseConfigured) return { ok: false }
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) {
      setError(error.message)
      return { ok: false }
    }
    return { ok: true }
  }, [])

  const resetPassword = useCallback(async (email) => {
    if (!isSupabaseConfigured) return { ok: false }
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    if (error) {
      setError(error.message)
      return { ok: false }
    }
    return { ok: true }
  }, [])

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return
    await supabase.auth.signOut()
  }, [])

  return {
    user,
    loading,
    error,
    isDemo: !isSupabaseConfigured,
    signInWithPassword,
    signUp,
    sendMagicLink,
    resetPassword,
    signOut,
  }
}
