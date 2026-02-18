import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { supabase, Database } from '../utils/supabase'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean

  // Actions
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, username?: string) => Promise<{ error?: string }>
  signInWithProvider: (provider: 'google' | 'github' | 'discord') => Promise<{ error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: string }>
  fetchProfile: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      isLoading: true,

      initialize: async () => {
        try {
          // Get initial session
          const { data: { session }, error } = await supabase.auth.getSession()

          if (error) {
            console.error('Session error:', error)
            set({ isLoading: false })
            return
          }

          if (session) {
            set({ user: session.user, session })
            await get().fetchProfile()
          }

          set({ isLoading: false })

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
            console.log('Auth state changed:', event, session?.user?.email)

            if (session) {
              set({ user: session.user, session })
              await get().fetchProfile()
            } else {
              set({ user: null, session: null, profile: null })
            }

            set({ isLoading: false })
          })
        } catch (error) {
          console.error('Auth initialization error:', error)
          set({ isLoading: false })
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true })
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (error) return { error: error.message }

          return {}
        } catch (error) {
          return { error: 'An unexpected error occurred' }
        } finally {
          set({ isLoading: false })
        }
      },

      signUp: async (email: string, password: string, username?: string) => {
        try {
          set({ isLoading: true })
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username: username || email.split('@')[0]
              }
            }
          })

          if (error) return { error: error.message }

          return {}
        } catch (error) {
          return { error: 'An unexpected error occurred' }
        } finally {
          set({ isLoading: false })
        }
      },

      signInWithProvider: async (provider: 'google' | 'github' | 'discord') => {
        try {
          set({ isLoading: true })
          const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: `${window.location.origin}/auth/callback`
            }
          })

          if (error) return { error: error.message }

          return {}
        } catch (error) {
          return { error: 'An unexpected error occurred' }
        } finally {
          set({ isLoading: false })
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true })
          const { error } = await supabase.auth.signOut()

          if (error) {
            console.error('Sign out error:', error)
          }

          set({ user: null, session: null, profile: null })
        } catch (error) {
          console.error('Sign out error:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      resetPassword: async (email: string) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`
          })

          if (error) return { error: error.message }

          return {}
        } catch (error) {
          return { error: 'An unexpected error occurred' }
        }
      },

      updateProfile: async (updates: Partial<Profile>) => {
        try {
          const user = get().user
          if (!user) return { error: 'Not authenticated' }

          const { error } = await supabase
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', user.id)

          if (error) return { error: error.message }

          // Update local state
          set(state => ({
            profile: state.profile ? { ...state.profile, ...updates } : null
          }))

          return {}
        } catch (error) {
          return { error: 'An unexpected error occurred' }
        }
      },

      fetchProfile: async () => {
        try {
          const user = get().user
          if (!user) return

          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (error) {
            console.error('Profile fetch error:', error)
            return
          }

          set({ profile: data })
        } catch (error) {
          console.error('Profile fetch error:', error)
        }
      }
    }),
    {
      name: 'auth-store'
    }
  )
)

// Initialize auth on app start
if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize()
}
