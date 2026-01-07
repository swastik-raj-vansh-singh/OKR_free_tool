"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase } from "./supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface AuthUser {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
}

interface AuthContextType {
  user: AuthUser | null
  supabaseUser: SupabaseUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // Parse hash tokens from URL and set session manually
  const handleHashTokens = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false
    
    const hash = window.location.hash
    if (!hash || !hash.includes('access_token=')) return false
    
    const params = new URLSearchParams(hash.substring(1))
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    
    if (!access_token || !refresh_token) return false
    
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      })
      
      if (error) return false
      
      if (data.session) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
        return true
      }
    } catch {
      // Ignore errors
    }
    
    return false
  }

  // Strip auth hash from URL
  const stripAuthHashIfPresent = () => {
    if (typeof window === 'undefined') return
    const h = window.location.hash || ''
    if (!h) return
    
    const isAuthHash = h.includes('access_token=') || h.includes('refresh_token=') || h.includes('provider_token=')
    if (!isAuthHash) return

    try {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    } catch {
      // Ignore
    }
  }

  // Fetch user profile from users table
  const fetchUserProfile = async (authUserId: string): Promise<AuthUser | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('id', authUserId)
        .single()

      if (error || !data) return null

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        avatar_url: null,
      }
    } catch {
      return null
    }
  }

  // Create or update user in users table
  const syncUserToDatabase = async (authUser: SupabaseUser) => {
    if (isSyncing) return
    setIsSyncing(true)
    
    try {
      const email = authUser.email!
      const name = authUser.user_metadata?.full_name || 
                   authUser.user_metadata?.name || 
                   authUser.user_metadata?.display_name ||
                   email.split('@')[0]

      const { error } = await supabase
        .from('users')
        .upsert({
          id: authUser.id,
          email,
          name,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()

      // If RLS is blocking, try using the function
      if (error && (error.code === '42501' || error.message.includes('policy'))) {
        await supabase.rpc('upsert_user', {
          p_id: authUser.id,
          p_email: email,
          p_name: name,
          p_role: null,
          p_company_name: null,
          p_website_url: null
        })
      }
    } catch {
      // Ignore sync errors
    } finally {
      setIsSyncing(false)
    }
  }

  // Refresh user data
  const refreshUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        setSupabaseUser(authUser)
        await syncUserToDatabase(authUser)
        const profile = await fetchUserProfile(authUser.id)
        setUser(profile)
      } else {
        setSupabaseUser(null)
        setUser(null)
      }
    } catch {
      setSupabaseUser(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/generate`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) throw error
  }

  // Sign out
  const signOut = async () => {
    // Clear state immediately
    setUser(null)
    setSupabaseUser(null)
    setLoading(false)
    
    stripAuthHashIfPresent()
    
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch {
      // Ignore sign out errors
    }
    
    // Hard redirect to /generate
    window.location.href = '/generate'
  }

  // Initialize auth state
  useEffect(() => {
    let isActive = true
    
    // Safety timeout - ensure loading never stays stuck
    const safetyTimeout = setTimeout(() => {
      if (isActive) setLoading(false)
    }, 5000)
    
    const initAuth = async () => {
      try {
        // Check for hash tokens from OAuth redirect
        const hasHashTokens = window.location.hash?.includes('access_token=')
        
        if (hasHashTokens) {
          const success = await handleHashTokens()
          if (success) {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user && isActive) {
              setSupabaseUser(session.user)
              await syncUserToDatabase(session.user)
              const profile = await fetchUserProfile(session.user.id)
              if (isActive) setUser(profile)
            }
            if (isActive) setLoading(false)
            return
          }
        }
        
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user && isActive) {
          setSupabaseUser(session.user)
          await syncUserToDatabase(session.user)
          const profile = await fetchUserProfile(session.user.id)
          if (isActive) setUser(profile)
        }
      } catch {
        // Ignore init errors
      } finally {
        if (isActive) setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isActive) return
      
      if (event === 'SIGNED_OUT') {
        setSupabaseUser(null)
        setUser(null)
        setLoading(false)
        return
      }
      
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        setSupabaseUser(session.user)
        if (event === 'SIGNED_IN') {
          await syncUserToDatabase(session.user)
        }
        const profile = await fetchUserProfile(session.user.id)
        if (isActive) setUser(profile)
      }
      
      if (isActive) setLoading(false)
    })

    return () => {
      isActive = false
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        loading,
        signInWithGoogle,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
