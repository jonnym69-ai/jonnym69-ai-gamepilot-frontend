import { create } from 'zustand'
import { Game } from '../types'
// import { toast } from '../components/Toast'
import { processSteamGameData } from '../utils/steamGenreMapping'
import { SteamService } from '../services/steamService'
import { launcherService } from '../services/launcherService'
import { personaEngineService } from '../services/personaEngineService'
import { gameApiService } from '../services/gameApiService'
// import { SteamGame } from '@gamepilot/shared/models/gameExtensions'

// LocalStorage backup utilities
const LIBRARY_STORAGE_KEY = 'gamepilot_library'

const saveToLocalStorage = (games: Game[]) => {
  try {
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(games))
    console.log('💾 Library saved to localStorage as backup')
  } catch (error) {
    console.warn('Failed to save library to localStorage:', error)
  }
}

const loadFromLocalStorage = (): Game[] | null => {
  try {
    const stored = localStorage.getItem(LIBRARY_STORAGE_KEY)
    if (stored) {
      const games = JSON.parse(stored)
      console.log('📂 Library loaded from localStorage backup:', games.length)
      return games
    }
  } catch (error) {
    console.warn('Failed to load library from localStorage:', error)
  }
  return null
}

const importSteamLibrary = async (steamId: string, apiKey: string, forceReimport: boolean = false) => {
  const { setIsLoading } = useLibraryStore.getState()
  const { setGames } = useLibraryStore.getState().actions
  let games: Game[] = []

  try {
    setIsLoading(true)
    console.log('🔍 useLibraryStore: Calling SteamService.fetchOwnedGames with:', { steamId, apiKey, forceReimport })
    const steamGames = await SteamService.fetchOwnedGames(steamId, apiKey)
    console.log('🔍 useLibraryStore: SteamService returned:', steamGames)
    console.log('🔍 useLibraryStore: Number of games from Steam API:', steamGames.length)

    // Process games with enhanced metadata using our mapping
    const gamesForUpsert = steamGames.map((game: any) => {
      const processedGame = processSteamGameData(game)
      console.log('🔍 Steam Import - Game:', (processedGame as any)?.title || (processedGame as any)?.name || 'Unknown')
      console.log('🔍 Steam Import - Assigned moods:', (processedGame as any)?.moods || [])
      console.log('🔍 Steam Import - Genres:', (processedGame as any)?.genres?.map((g: any) => typeof g === 'string' ? g : g.name) || [])
      return {
        ...processedGame,
        id: undefined // Let database generate ID
      }
    })

    console.log('🔍 useLibraryStore: Upserting games to database via API')
    
    try {
      // Call the backend API to upsert games
      const { apiFetch } = await import('../config/api')
      console.log('🔍 useLibraryStore: About to call apiFetch with gamesForUpsert length:', gamesForUpsert.length)
      console.log('🔍 useLibraryStore: First game sample:', JSON.stringify(gamesForUpsert[0], null, 2))
      
      const upsertResponse = await apiFetch('launcher/upsert-games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(gamesForUpsert)
      })
      
      console.log('🔍 useLibraryStore: API response status:', upsertResponse.status)
      console.log('🔍 useLibraryStore: API response ok:', upsertResponse.ok)
      
      const upsertResult = await upsertResponse.json()
      console.log('🔍 useLibraryStore: API response result:', upsertResult)
      
      if (upsertResult.success && upsertResult.data) {
        // Use the database response
        const dbGames = upsertResult.data.games
        console.log('🔍 useLibraryStore: Successfully saved games to database:', dbGames.length)
        
        // Update local store with database games
        games = [...games, ...(dbGames as any[])]

        // Save to localStorage as backup
        localStorage.setItem('games_library', JSON.stringify(games))
        
        console.log('🔍 useLibraryStore: Games saved to database and localStorage:', games.length)
      } else {
        console.warn('🔍 useLibraryStore: Database save failed, result:', upsertResult)
        throw new Error(upsertResult.error || 'Database save failed')
      }
    } catch (apiError) {
      console.warn('🔍 useLibraryStore: API call failed, detailed error:', apiError)
      console.warn('🔍 useLibraryStore: API error type:', typeof apiError)
      if (apiError instanceof Error) {
        console.warn('🔍 useLibraryStore: API error message:', apiError.message)
        console.warn('🔍 useLibraryStore: API error stack:', apiError.stack)
      }
      
      // Fallback: Save games locally when backend fails
      const localGames = gamesForUpsert.map(game => ({
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: (game as any).title || (game as any).name,
        description: (game as any).description,
        coverImage: (game as any).coverImage || (game as any).cover,
        backgroundImages: (game as any).backgroundImages || ((game as any).background ? [(game as any).background] : []),
        developer: null,
        publisher: null,
        genres: (game as any).genres || [],
        subgenres: [],
        platforms: (game as any).platforms || [],
        emotionalTags: (game as any).emotionalTags || [],
        userRating: null,
        globalRating: null,
        playStatus: 'backlog',
        hoursPlayed: (game as any).hoursPlayed || 0,
        addedAt: new Date().toISOString(),
        notes: null,
        isFavorite: false,
        tags: [],
        moods: game.moods || [],
        playHistory: [],
        releaseYear: game.releaseYear || new Date().getFullYear(),
        achievements: {},
        totalPlaytime: null,
        averageRating: null,
        completionPercentage: null,
        appId: (game as any).appid || game.id
      }))
      
      // Add to local store with proper typing
      games = [...games, ...(localGames as any[])]

      // Save to localStorage as backup
      localStorage.setItem('games_library', JSON.stringify(games))
      
      console.log('🔍 useLibraryStore: Games saved locally as fallback:', localGames.length)
    }

    return {
      success: games.length > 0,
      gameCount: games.length,
      games
    }
  } catch (error) {
    console.error('🔍 useLibraryStore: Steam import failed:', error)
    
    // Enhanced error logging for debugging
    if (error instanceof Error) {
      console.error('🔍 useLibraryStore: Error message:', error.message)
      console.error('🔍 useLibraryStore: Error stack:', error.stack)
    } else if (typeof error === 'object' && error !== null) {
      console.error('🔍 useLibraryStore: Error object details:', JSON.stringify(error, null, 2))
    } else {
      console.error('🔍 useLibraryStore: Error type:', typeof error, 'value:', error)
    }
    
    // Re-throw the error with more context for the UI to handle
    throw new Error(
      error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : 'Steam import failed: Unknown error'
    )
  } finally {
    setIsLoading(false)
    if (games.length > 0) {
      console.log('🔍 useLibraryStore: Setting games in store:', games.length)
      setGames(games)
    }
  }
}

interface LibraryStore {
  games: Game[]
  currentSession: { gameId: string; startedAt: number } | null
  isLoading: boolean
  hasLoaded: boolean
  filters: {
    genre: string | null
    platform: string | null
    status: string | null
    search: string
  }
  intelligence: {
    selectedMood: string
    selectedMasterMood: string
    selectedSessionLength: string
    selectedGenres: string[]
    selectedSorting: string
    preferredGenres: string[]
    preferredMoods: string[]
    preferredSessionStyle: string | null
  }
  actions: any
  setIntelligenceState: (partial: Partial<LibraryStore['intelligence']>) => void
  setIsLoading: (loading: boolean) => void
  setHasLoaded: (hasLoaded: boolean) => void
  setGames: (games: Game[]) => void
}

export const useLibraryStore = create<LibraryStore>()((set, get) => ({
  games: [],
  currentSession: null,
  isLoading: false,
  hasLoaded: false,

  filters: {
    genre: null,
    platform: null,
    status: null,
    search: ''
  },

  intelligence: {
    selectedMood: '',
    selectedMasterMood: '',
    selectedSessionLength: '',
    selectedGenres: [],
    selectedSorting: '',
    preferredGenres: [],
    preferredMoods: [],
    preferredSessionStyle: null
  },

  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  setHasLoaded: (hasLoaded: boolean) => set({ hasLoaded }),
  setGames: (games: Game[]) => set({ games, hasLoaded: true }),

  actions: {
    addGame: (game: Game) => {
      set(state => {
        // Check if game already exists by ID or appId
        const existingById = state.games.find(g => g.id === game.id)
        const existingByAppId = state.games.find(g => (g as any).appId === (game as any).appId)
        
        if (existingById || existingByAppId) {
          // Game already exists, don't add duplicate
          return state
        }
        
        const newGames = [...state.games, game]
        // Save to localStorage as backup
        saveToLocalStorage(newGames)
        return { games: newGames }
      })
      // toast.success(`Added ${game.title} to your library`) // Moved to component
    },

    removeGame: (gameId: string) => {
      set(state => {
        const newGames = state.games.filter(g => g.id !== gameId)
        // Save to localStorage as backup
        saveToLocalStorage(newGames)
        return { games: newGames }
      })
      // toast.info('Game removed from library')
    },

    updateGame: (gameId: string, updates: Partial<Game>) => {
      set(state => {
        const newGames = state.games.map(g => (g.id === gameId ? { ...g, ...updates } : g))
        // Save to localStorage as backup
        saveToLocalStorage(newGames)
        return { games: newGames }
      })
    },

    bulkUpdateStatus: (gameIds: string[], status: string) => {
      set(state => ({
        games: state.games.map(g =>
          gameIds.includes(g.id) ? { ...g, playStatus: status as any } : g
        )
      }))
      // toast.success(`Updated ${gameIds.length} games`)
    },

    bulkExport: () => {
      const data = JSON.stringify(get().games, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'game-library.json'
      a.click()
      URL.revokeObjectURL(url)
      // toast.success('Library exported successfully')
    },

    bulkImport: (games: Omit<Game, 'id'>[]) => {
      const newGames = games.map(g => ({
        ...g,
        id: crypto.randomUUID(),
        addedAt: new Date()
      }))

      set(state => ({ games: [...state.games, ...newGames] }))
      // toast.success(`Imported ${games.length} games from Steam`)
    },

    importSteamLibrary,

    bulkAddToCategory: (gameIds: string[], category: string) => {
      set(state => ({
        games: state.games.map(g =>
          gameIds.includes(g.id)
            ? { ...g, tags: Array.from(new Set([...(g.tags || []), category])) }
            : g
        )
      }))
      // toast.success(`Added ${gameIds.length} games to ${category}`) // Moved to component
    },

    deduplicateGames: () => {
      set(state => {
        const unique = state.games.filter(
          (g, i, arr) =>
            i === arr.findIndex(x => x.title.toLowerCase() === g.title.toLowerCase())
        )
        return { games: unique }
      })
    },

    bulkDelete: (gameIds: string[]) => {
      set(state => ({ games: state.games.filter(g => !gameIds.includes(g.id)) }))
      // toast.success(`Deleted ${gameIds.length} games`) // Moved to component
    },

    launchGame: async (gameId: string) => {
      console.log('🔧 Frontend Store - launchGame called with gameId:', gameId)
      console.log('🔧 DEBUG: Store games count:', get().games.length)
      console.log('🔧 DEBUG: Sample game IDs:', get().games.slice(0, 3).map(g => ({ id: g.id, appId: g.appId, title: g.title })))
      
      let game = get().games.find(g => g.id === gameId)
      if (!game) {
        console.log('🔧 Frontend Store - Game not found by ID, trying appId lookup')
        // Try to find by appId
        game = get().games.find(g => g.appId?.toString() === gameId)
        if (!game) {
          console.log('🔧 DEBUG: Game not found, checking all games...')
          get().games.forEach((g, index) => {
            if (index < 5) {
              console.log(`🔧 DEBUG: Game ${index}: id=${g.id}, appId=${g.appId}, title=${g.title}`)
            }
          })
          console.error('🔧 Frontend Store - Game not found at all!')
          return
        }
      }

      // Get platform code for the game
      const steamPlatform = game.platforms.find(p => p.code === 'steam')
      const platformCode = steamPlatform ? 'steam' : undefined

      console.log('🔧 Frontend Store - About to call personaEngineService.launchGameWithPersonaTracking')
      console.log('🔧 Frontend Store - Game data:', game.title, game.appId)

      try {
        // Use persona engine service for enhanced tracking
        const result = await personaEngineService.launchGameWithPersonaTracking(gameId, game!)
        console.log('🔧 Frontend Store - Persona engine result:', result)
        
        if (result.success && result.data) {
          set({
            currentSession: {
              gameId: game.id,
              startedAt: Date.now()
            }
          })
        }
      } catch (error) {
        console.error('🔧 Frontend Store - Persona engine failed:', error)
        
        // Fallback to basic launcher service
        try {
          console.log('🔧 Frontend Store - Trying fallback launcher service')
          const result = await launcherService.launchGame(gameId, platformCode)
          console.log('🔧 Frontend Store - Launcher service result:', result)
          
          if (result.success && result.data) {
            set({
              currentSession: {
                gameId: game.id,
                startedAt: Date.now()
              }
            })
          }
        } catch (fallbackError) {
          console.error('🔧 Frontend Store - Fallback launch also failed:', fallbackError)
        }
      }
    },

    endCurrentSession: async () => {
      const state = get()
      if (!state.currentSession) return

      try {
        // Use persona engine service for enhanced tracking
        await personaEngineService.endSessionWithPersonaTracking(undefined, state.currentSession.gameId)
        
        // Update local playtime (fallback if backend sync fails)
        const durationMs = Date.now() - state.currentSession.startedAt
        const minutes = Math.floor(durationMs / 60000)

        set(prev => ({
          games: prev.games.map(g =>
            g.id === prev.currentSession?.gameId
              ? {
                  ...g,
                  hoursPlayed: (g.hoursPlayed || 0) + minutes / 60,
                  lastPlayed: new Date()
                }
              : g
          ),
          currentSession: null
        }))
      } catch (error) {
        console.error('Failed to end session with persona tracking:', error)
        
        // Fallback to basic launcher service
        try {
          await launcherService.endSession(undefined, state.currentSession.gameId)
          
          const durationMs = Date.now() - state.currentSession.startedAt
          const minutes = Math.floor(durationMs / 60000)

          set(prev => ({
            games: prev.games.map(g =>
              g.id === prev.currentSession?.gameId
                ? {
                    ...g,
                    hoursPlayed: (g.hoursPlayed || 0) + minutes / 60,
                    lastPlayed: new Date()
                  }
                : g
            ),
            currentSession: null
          }))
        } catch (fallbackError) {
          console.error('Fallback session end also failed:', fallbackError)
          
          // Last resort: just clear the session locally
          set({ currentSession: null })
        }
      }
    },

    setFilter: (filter: keyof LibraryStore['filters'], value: any) => {
      set(state => ({
        filters: { ...state.filters, [filter]: value }
      }))
    },

    clearFilters: () => {
      set({
        filters: {
          genre: null,
          platform: null,
          status: null,
          search: ''
        }
      })
    },

    setGames: (games: Game[]) => {
      // Ensure all games have a tags field
      const gamesWithTags = games.map(game => ({
        ...game,
        tags: game.tags || []
      }))
      set({ games: gamesWithTags, hasLoaded: true })
      // Save to localStorage as backup
      saveToLocalStorage(gamesWithTags)
    },

    updateGameStatus: (gameId: string, status: string) => {
      set(state => ({
        games: state.games.map(g =>
          g.id === gameId ? { ...g, playStatus: status as any } : g
        )
      }))
    },

    updateGamePlaytime: (gameId: string, playtime: number) => {
      set(state => ({
        games: state.games.map(g =>
          g.id === gameId ? { ...g, hoursPlayed: playtime } : g
        )
      }))
    },

    setHasLoaded: (hasLoaded: boolean) => set({ hasLoaded }),

    clearCacheAndRefresh: async () => {
      console.log('🧹 Clearing cache and refreshing...')
      
      // Clear localStorage
      localStorage.removeItem(LIBRARY_STORAGE_KEY)
      console.log('🗑️ localStorage cleared')
      
      // Reset store state
      set({ 
        games: [], 
        hasLoaded: false, 
        isLoading: false,
        currentSession: null 
      })
      
      // Force fresh API call
      await get().actions.loadGames(true) // force refresh
      console.log('🔄 Fresh data loaded from API')
    },

    loadGames: async (forceRefresh = false) => {
      // Prevent multiple loads unless force refresh
      if (!forceRefresh && get().hasLoaded) {
        console.log('🎮 Library already loaded, skipping...')
        return
      }

      try {
        get().setIsLoading(true)
        
        // Load games for authenticated user
        console.log('🔍 Store: Calling getUserGames API...')
        const response = await gameApiService.getUserGames()
        console.log('🔍 Store: API response:', response)
        
        if (response.success && response.data) {
          // Debug: Inspect first game object structure
          if (response.data.games && response.data.games.length > 0) {
            console.log('🔍 Raw game object from API:', JSON.stringify(response.data.games[0], null, 2))
          }
          
          // Map API fields to normalizer expected shape
          const mappedGames = response.data.games.map((game: any) => ({
            ...game,
            name: game.title || game.name,
            steamData: {
              short_description: game.description,
              genres: game.genres?.map((g: any) => {
                // Handle both object and string formats
                if (typeof g === 'object' && g.description) {
                  return { description: g.description }
                } else if (typeof g === 'string') {
                  return { description: g }
                } else {
                  return { description: String(g) }
                }
              }) || [],
              categories: game.categories || [],
              steam_appid: game.appId
            }
          }))
          
          // Normalize games through canonical pipeline
          const { normalizeGamesArray } = await import('../utils/dataPipelineNormalizer')
          const normalizedGames = normalizeGamesArray(mappedGames)
          
          // IMPORTANT: Set fresh API data BEFORE saving to localStorage
          get().actions.setGames(normalizedGames)
          
          // Save fresh data to localStorage (overwrite stale backup)
          saveToLocalStorage(normalizedGames)
          
          console.log('🎮 Loaded and normalized user games:', normalizedGames.length)
          console.log('💾 Fresh API data saved to localStorage')
        } else {
          console.error('Failed to load user games:', response.error)
          
          // Fallback to localStorage ONLY if API fails
          const localGames = loadFromLocalStorage()
          if (localGames && localGames.length > 0) {
            console.log('⚠️ Using localStorage fallback due to API failure')
            get().actions.setGames(localGames)
          }
        }
        
        get().setHasLoaded(true)
      } catch (error) {
        console.error('Failed to load games:', error)
        
        // Fallback to localStorage on error
        const localGames = loadFromLocalStorage()
        if (localGames && localGames.length > 0) {
          get().actions.setGames(localGames)
          console.log('🎮 Loaded games from localStorage fallback after error:', localGames.length)
        } else {
          get().actions.setGames([])
        }
        
        get().setHasLoaded(true)
      } finally {
        get().setIsLoading(false)
      }
    }
  },

  setIntelligenceState: (partial: Partial<LibraryStore['intelligence']>) => {
    set(state => ({
      intelligence: { ...state.intelligence, ...partial }
    }))
  }
}))


// ------------------------------------------------------------
// Utility Functions (outside the store)
// ------------------------------------------------------------

export const filterByMood = (games: Game[], mood: string): Game[] => {
  console.log('🔍 Filter Debug - Selected mood:', mood)
  console.log('🔍 Filter Debug - Available games:', games.length)
  
  const filteredGames = games.filter(game => {
    const hasMood = game.moods && game.moods.length > 0 && game.moods.includes(mood)
    console.log(`🔍 Filter Debug - Game "${game.title}":`, {
      moods: game.moods,
      hasMood,
      genres: game.genres?.map(g => g.name) || []
    })
    return hasMood
  })
  
  console.log('🔍 Filter Debug - Filtered games:', filteredGames.length)
  return filteredGames
}

export const filterByGenre = (games: Game[], genre: string): Game[] => {
  console.log('🔍 Filter Debug - Selected genre:', genre)
  console.log('🔍 Filter Debug - Available games:', games.length)
  
  const filteredGames = games.filter(game => {
    const hasGenre = game.genres && game.genres.length > 0 && 
      game.genres.some(g => {
        // Handle both string and object genre formats
        const genreName = typeof g === 'string' ? g : g.name
        return genreName.toLowerCase() === genre.toLowerCase()
      })
    console.log(`🔍 Filter Debug - Game "${game.title}":`, {
      genres: game.genres?.map(g => typeof g === 'string' ? g : g.name) || [],
      hasGenre
    })
    return hasGenre
  })
  
  console.log('🔍 Filter Debug - Filtered games:', filteredGames.length)
  return filteredGames
}

export const filterByPlatform = (games: Game[], platform: string): Game[] =>
  games.filter(game =>
    game.platforms.some(p => p.name.toLowerCase() === platform.toLowerCase())
  )

export const filterByStatus = (games: Game[], status: string): Game[] =>
  games.filter(game => game.playStatus === status)

export const searchGames = (games: Game[], query: string): Game[] => {
  const q = query.toLowerCase()
  return games.filter(
    game =>
      game.title.toLowerCase().includes(q) ||
      game.description?.toLowerCase().includes(q) ||
      game.tags?.some(tag => tag.toLowerCase().includes(q))
  )
}

export const getRecommendedGames = (
  games: Game[],
  preferredGenres: string[],
  preferredMoods: string[],
  preferredSessionStyle: string | null
): Game[] => {
  const scoreGame = (game: Game) => {
    let score = 0

    // Genre match (normalized)
    if (preferredGenres.length > 0) {
      const gList = Array.isArray(game.genres) ? game.genres : []
      const match = preferredGenres.some(pg =>
        gList.some((g: any) => {
          const name = typeof g === 'string' ? g : (g.name || g.description || '')
          return name.toLowerCase() === pg.toLowerCase()
        })
      )
      if (match) score += 30
    }

    // Mood match (normalized)
    if (preferredMoods.length > 0) {
      const mList = Array.isArray((game as any).moods) ? (game as any).moods : []
      const match = preferredMoods.some(pm =>
        mList.some((m: any) => {
          const name = typeof m === 'string' ? m : (m.name || m.moodId || '')
          return name.toLowerCase() === pm.toLowerCase()
        })
      )
      if (match) score += 40
    }

    // Rating
    score += (game.globalRating || 0)

    // Recency bonus
    if (game.lastPlayed) {
      const lastPlayedTime = new Date(game.lastPlayed).getTime()
      const daysSince = (Date.now() - lastPlayedTime) / (1000 * 60 * 60 * 24)
      if (daysSince < 7) score += 20 // Played recently
    }

    return score
  }

  return [...games]
    .map(g => ({ game: g, score: scoreGame(g) }))
    .sort((a, b) => b.score - a.score)
    .map(x => x.game)
}

export const getTrendingGames = (games: Game[]): Game[] => {
  return [...games]
    .sort((a, b) => {
      // Sort by rating desc, then recently played
      if ((b.globalRating || 0) !== (a.globalRating || 0)) {
        return (b.globalRating || 0) - (a.globalRating || 0)
      }
      const timeA = a.lastPlayed ? new Date(a.lastPlayed).getTime() : 0
      const timeB = b.lastPlayed ? new Date(b.lastPlayed).getTime() : 0
      return timeB - timeA
    })
}
