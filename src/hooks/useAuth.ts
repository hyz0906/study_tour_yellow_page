'use client'

import { useState, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { User } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()

        if (authUser) {
          // Try to get user profile, create a basic one if it doesn't exist
          try {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', authUser.id)
              .single()

            if (profile) {
              setUser(profile)
            } else {
              // Create basic user profile from auth user data
              const basicProfile: User = {
                id: authUser.id,
                email: authUser.email || '',
                full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
                avatar_url: authUser.user_metadata?.avatar_url || null,
                role: 'user',
                created_at: authUser.created_at || new Date().toISOString(),
                updated_at: authUser.updated_at || new Date().toISOString()
              }
              setUser(basicProfile)
            }
          } catch (profileError) {
            // If profile fetch fails (e.g., in test mode), create basic profile from auth data
            const basicProfile: User = {
              id: authUser.id,
              email: authUser.email || '',
              full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
              avatar_url: authUser.user_metadata?.avatar_url || null,
              role: 'user',
              created_at: authUser.created_at || new Date().toISOString(),
              updated_at: authUser.updated_at || new Date().toISOString()
            }
            setUser(basicProfile)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          try {
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (profile) {
              setUser(profile)
            } else {
              // Create basic user profile from auth user data
              const basicProfile: User = {
                id: session.user.id,
                email: session.user.email || '',
                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
                avatar_url: session.user.user_metadata?.avatar_url || null,
                role: 'user',
                created_at: session.user.created_at || new Date().toISOString(),
                updated_at: session.user.updated_at || new Date().toISOString()
              }
              setUser(basicProfile)
            }
          } catch (profileError) {
            // Fallback to basic profile from session user data
            const basicProfile: User = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
              avatar_url: session.user.user_metadata?.avatar_url || null,
              role: 'user',
              created_at: session.user.created_at || new Date().toISOString(),
              updated_at: session.user.updated_at || new Date().toISOString()
            }
            setUser(basicProfile)
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const isAdmin = user?.role === 'admin'
  const isOrganizer = user?.role === 'organizer' || user?.role === 'admin'

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin,
    isOrganizer,
  }
}