import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { UserProfile } from '../types/profile'

interface UserStats {
  totalHoursPlayed: number
  gamesCompleted: number
  favoriteGenres: string[]
  favoriteMoods: string[]
  joinDate: string
  lastActive: string
}

interface ProfileState {
  profile: UserProfile | null
  stats: UserStats
  isEditing: boolean
  isLoading: boolean
  
  // Actions
  setProfile: (profile: UserProfile) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  updateStats: (updates: Partial<UserStats>) => void
  setEditing: (editing: boolean) => void
  setLoading: (loading: boolean) => void
  
  // Computed
  getGamingLevel: () => string
  getDisplayName: () => string
  getAvatarUrl: () => string
}

const defaultStats: UserStats = {
  totalHoursPlayed: 0,
  gamesCompleted: 0,
  favoriteGenres: [],
  favoriteMoods: [],
  joinDate: new Date().toISOString(),
  lastActive: new Date().toISOString()
}

const defaultProfile: UserProfile = {
  displayName: 'Gamer',
  avatar: {
    type: 'preset',
    presetId: 'pro-gamer'
  },
  banner: '/banners/default-banner.jpg',
  bio: 'Passionate gamer exploring new worlds',
  favoriteMoods: [],
  gamingLevel: 'Newcomer',
  totalHoursPlayed: 0,
  gamesCompleted: 0,
  favoriteGenres: [],
  joinDate: new Date().toISOString(),
  lastActive: new Date().toISOString()
}

export const useProfileStore = create<ProfileState>()(
  devtools(
    persist(
      (set, get) => ({
        profile: defaultProfile,
        stats: defaultStats,
        isEditing: false,
        isLoading: false,

        setProfile: (profile) => set({ profile }),
        
        updateProfile: (updates) => set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null
        })),
        
        updateStats: (updates) => set((state) => ({
          stats: { ...state.stats, ...updates }
        })),
        
        setEditing: (editing) => set({ isEditing: editing }),
        setLoading: (loading) => set({ isLoading: loading }),

        getGamingLevel: () => {
          const { totalHoursPlayed, gamesCompleted } = get().stats
          if (totalHoursPlayed >= 1000) return 'Mythic'
          if (totalHoursPlayed >= 500) return 'Legendary'
          if (totalHoursPlayed >= 200) return 'Veteran'
          if (totalHoursPlayed >= 100) return 'Expert'
          if (totalHoursPlayed >= 50) return 'Advanced'
          if (totalHoursPlayed >= 25) return 'Intermediate'
          if (totalHoursPlayed >= 10) return 'Experienced'
          if (totalHoursPlayed >= 5) return 'Skilled'
          return 'Newcomer'
        },

        getDisplayName: () => {
          const { profile } = get()
          return profile?.displayName || 'Gamer'
        },

        getAvatarUrl: () => {
          const { profile } = get()
          if (!profile) return '/avatars/default.png'
          
          if (profile.avatar.type === 'preset' && profile.avatar.presetId) {
            return `/avatars/${profile.avatar.presetId}.png`
          }
          
          return profile.avatar.url || '/avatars/default.png'
        }
      }),
      {
        name: 'profile-store',
        partialize: (state) => ({
          profile: state.profile,
          stats: state.stats
        })
      }
    )
  )
)
