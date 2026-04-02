import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getMyProfile } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)

  // 1) تحميل الـ session فقط
  useEffect(() => {
    let mounted = true

    async function initSession() {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session fetch error:', error.message)
        }

        if (!mounted) return

        setSession(data?.session ?? null)
        setLoading(false)
      } catch (err) {
        console.error('Auth init error:', err)
        if (!mounted) return
        setSession(null)
        setLoading(false)
      }
    }

    initSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return
      setSession(newSession ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // 2) تحميل الـ profile بعد وجود المستخدم
  useEffect(() => {
    let mounted = true

    async function loadProfile() {
      if (!session?.user) {
        setProfile(null)
        setProfileLoading(false)
        return
      }

      try {
        setProfileLoading(true)

        const { data, error } = await getMyProfile(session.user.id)

        if (!mounted) return

        if (error) {
          console.error('Profile fetch error:', error.message)
          setProfile(null)
        } else {
          console.log('Loaded profile:', data)
          setProfile(data ?? null)
        }
      } catch (err) {
        console.error('Profile load error:', err)
        if (!mounted) return
        setProfile(null)
      } finally {
        if (mounted) setProfileLoading(false)
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [session])

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        profileLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}