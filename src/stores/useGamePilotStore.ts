import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Game } from '@gamepilot/types'

// Integration status types
export interface IntegrationStatus {
  steam: {
    connected: boolean
    steamId?: string
    lastSync?: Date
    error?: string
  }
  discord: {
    connected: boolean
    username?: string
    lastSync?: Date
    error?: string
  }
  youtube: {
    connected: boolean
    lastSync?: Date
    error?: string
  }
}

/**
 * @deprecated Use canonical User.preferences from @gamepilot/shared/models/user instead
 * This interface is replaced by the canonical User.preferences
 */
export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto'
  animations: boolean
  reducedMotion: boolean
  language: string
  notifications: {
    achievements: boolean
    friendActivity: boolean
    gameRecommendations: boolean
  }
}

// Store interface
interface GamePilotStore {
  // Game library
  games: Game[]
  libraryLoading: boolean
  libraryError: string | null
  
  // Integrations
  integrations: IntegrationStatus
  integrationLoading: boolean
  
  // User data
  userPreferences: UserPreferences
  currentSteamId?: string
  
  // Actions
  setGames: (games: Game[]) => void
  addGame: (game: Game) => void
  updateGame: (id: string, updates: Partial<Game>) => void
  removeGame: (id: string) => void
  
  setIntegrationStatus: (platform: keyof IntegrationStatus, status: Partial<IntegrationStatus[keyof IntegrationStatus]>) => void
  setSteamId: (steamId: string) => void
  
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void
  
  // Computed values
  getGamesByStatus: (status: string) => Game[]
  getTotalPlaytime: () => number
  getRecentlyPlayed: (limit?: number) => Game[]
}

// Create the store
export const useGamePilotStore = create<GamePilotStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        games: [],
        libraryLoading: false,
        libraryError: null,
        
        integrations: {
          steam: { connected: false },
          discord: { connected: false },
          youtube: { connected: false }
        },
        integrationLoading: false,
        
        userPreferences: {
          theme: 'dark',
          animations: true,
          reducedMotion: false,
          language: 'en',
          notifications: {
            achievements: true,
            friendActivity: true,
            gameRecommendations: true
          }
        },
        
        // Game library actions
        setGames: (games) => set({ games }),
        
        addGame: (game) => set((state) => ({
          games: [...state.games, game]
        })),
        
        updateGame: (id, updates) => set((state) => ({
          games: state.games.map(game => 
            game.id === id ? { ...game, ...updates } : game
          )
        })),
        
        removeGame: (id) => set((state) => ({
          games: state.games.filter(game => game.id !== id)
        })),
        
        // Integration actions
        setIntegrationStatus: (platform, status) => set((state) => ({
          integrations: {
            ...state.integrations,
            [platform]: { ...state.integrations[platform], ...status }
          }
        })),
        
        setSteamId: (steamId) => set({ currentSteamId: steamId }),
        
        // User preferences actions
        updateUserPreferences: (preferences) => set((state) => ({
          userPreferences: { ...state.userPreferences, ...preferences }
        })),
        
        // Computed values
        getGamesByStatus: (status) => {
          const { games } = get()
          return games.filter(game => game.playStatus === status as any)
        },
        
        getTotalPlaytime: () => {
          const { games } = get()
          return games.reduce((total, game) => total + (game.hoursPlayed || 0), 0)
        },
        
        getRecentlyPlayed: (limit = 5) => {
          const { games } = get()
          return games
            .filter(game => game.lastPlayed)
            .sort((a, b) => (b.lastPlayed?.getTime() || 0) - (a.lastPlayed?.getTime() || 0))
            .slice(0, limit)
        }
      }),
      {
        name: 'gamepilot-store',
        partialize: (state) => ({
          games: state.games,
          userPreferences: state.userPreferences,
          integrations: state.integrations,
          currentSteamId: state.currentSteamId
        })
      }
    ),
    {
      name: 'GamePilotStore'
    }
  )
)

// Selectors for common use cases
export const useGames = () => useGamePilotStore(state => state.games)
export const useIntegrations = () => useGamePilotStore(state => state.integrations)
export const useUserPreferences = () => useGamePilotStore(state => state.userPreferences)
export const useSteamId = () => useGamePilotStore(state => state.currentSteamId)

// Computed selectors
export const useGamesByStatus = (status: string) => {
  const getGamesByStatus = useGamePilotStore(state => state.getGamesByStatus)
  return getGamesByStatus(status)
}

export const useTotalPlaytime = () => {
  const getTotalPlaytime = useGamePilotStore(state => state.getTotalPlaytime)
  return getTotalPlaytime()
}

export const useRecentlyPlayed = (limit?: number) => {
  const getRecentlyPlayed = useGamePilotStore(state => state.getRecentlyPlayed)
  return getRecentlyPlayed(limit)
}
