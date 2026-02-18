// Game model validation and utilities for GamePilot platform

import { z } from 'zod'
import { Game, PlayStatus, Genre, Subgenre, EmotionalTag, Platform, TagCategory } from '../types'
import { PlatformCode } from '../types'

// Game validation schema
export const GameSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  coverImage: z.string().url().optional(),
  backgroundImages: z.array(z.string().url()).optional(),
  releaseDate: z.date().optional(),
  developer: z.string().max(100).optional(),
  publisher: z.string().max(100).optional(),
  genres: z.array(z.string()), // Will be validated with genre IDs
  subgenres: z.array(z.string()), // Will be validated with subgenre IDs
  platforms: z.array(z.string()), // Will be validated with platform codes
  emotionalTags: z.array(z.string()), // Will be validated with tag IDs
  userRating: z.number().min(1).max(10).optional(),
  globalRating: z.number().min(1).max(10).optional(),
  playStatus: z.enum(['unplayed', 'playing', 'completed', 'paused', 'abandoned']),
  hoursPlayed: z.number().min(0).optional(),
  lastPlayed: z.date().optional(),
  addedAt: z.date(),
  notes: z.string().max(1000).optional(),
  isFavorite: z.boolean(),
})

// Play status utilities
export const PLAY_STATUS_TRANSITIONS = {
  'unplayed': { next: ['playing', 'paused'], label: 'Start Playing', color: '#10B981' },
  'playing': { next: ['completed', 'paused', 'abandoned'], label: 'Continue Playing', color: '#059669' },
  'paused': { next: ['playing', 'completed', 'unplayed'], label: 'Resume Playing', color: '#F59E0B' },
  'completed': { next: ['replaying'], label: 'Replay Game', color: '#10B981' },
  'abandoned': { next: ['unplayed'], label: 'Start Fresh', color: '#6B7280' }
} as const

export const getPlayStatusTransition = (from: PlayStatus, to: PlayStatus) => {
  return PLAY_STATUS_TRANSITIONS[from]?.next?.find(status => status === to) || null
}

export const getPlayStatusColor = (status: PlayStatus) => {
  return PLAY_STATUS_TRANSITIONS[status]?.color || '#6B7280'
}

export const getPlayStatusLabel = (status: PlayStatus) => {
  return PLAY_STATUS_TRANSITIONS[status]?.label || status
}

// Game utility functions
export const validateGame = (game: unknown): Game => {
  const parsed = GameSchema.parse(game)
  // Convert schema result to Game interface format
  return {
    ...parsed,
    coverImage: parsed.coverImage || '',
    genres: parsed.genres.map((genre: string) => ({ id: genre, name: genre, color: '#666', subgenres: [] })),
    subgenres: parsed.subgenres.map((subgenre: string) => ({ id: subgenre, name: subgenre, genre: { id: '', name: '', color: '', subgenres: [] } })),
    platforms: parsed.platforms.map((platform: string) => {
      const platformCode = platform.toLowerCase()
      let code: PlatformCode
      switch (platformCode) {
        case 'steam': code = PlatformCode.STEAM; break
        case 'xbox': code = PlatformCode.XBOX; break
        case 'playstation': code = PlatformCode.PLAYSTATION; break
        case 'nintendo': code = PlatformCode.NINTENDO; break
        case 'epic': code = PlatformCode.EPIC; break
        case 'gog': code = PlatformCode.GOG; break
        case 'origin': code = PlatformCode.ORIGIN; break
        case 'uplay': code = PlatformCode.UPLAY; break
        case 'battlenet': code = PlatformCode.BATTLENET; break
        case 'discord': code = PlatformCode.DISCORD; break
        case 'itch': code = PlatformCode.ITCH; break
        case 'humble': code = PlatformCode.HUMBLE; break
        default: code = PlatformCode.CUSTOM; break
      }
      return { id: platform, name: platform, code, isConnected: false }
    }),
    emotionalTags: parsed.emotionalTags.map((tag: string) => ({ id: tag, name: tag, color: '#666', category: 'feeling' as TagCategory, isCustom: false, games: [] })),
    tags: [],
    moods: [],
    playHistory: [],
    releaseYear: parsed.releaseDate?.getFullYear() || new Date().getFullYear()
  }
}

export const createGame = (data: Partial<Game>): Game => {
  const now = new Date()
  return {
    id: crypto.randomUUID(),
    title: data.title || 'Untitled Game',
    description: data.description,
    backgroundImages: data.backgroundImages,
    coverImage: data.coverImage || '',
    releaseDate: data.releaseDate,
    developer: data.developer,
    publisher: data.publisher,
    genres: data.genres || [],
    subgenres: data.subgenres || [],
    platforms: data.platforms || [],
    emotionalTags: data.emotionalTags || [],
    userRating: data.userRating,
    globalRating: data.globalRating,
    playStatus: data.playStatus || 'unplayed',
    hoursPlayed: data.hoursPlayed,
    lastPlayed: data.lastPlayed,
    addedAt: data.addedAt || now,
    notes: data.notes,
    isFavorite: data.isFavorite || false,
    tags: data.tags || [],
    // Required properties matching Game interface
    moods: data.moods || [],
    playHistory: data.playHistory || [],
    releaseYear: data.releaseYear || new Date().getFullYear(),
    achievements: data.achievements || { unlocked: 0, total: 0 },
    totalPlaytime: data.totalPlaytime,
    averageRating: data.averageRating,
    completionPercentage: data.completionPercentage
  }
}

export const updateGamePlayStatus = (game: Game, newStatus: PlayStatus): Game => {
  return {
    ...game,
    playStatus: newStatus,
    lastPlayed: newStatus === 'playing' ? new Date() : game.lastPlayed
  }
}

export const addGameToLibrary = (game: Partial<Game>, library: Game[]): Game[] => {
  const newGame = createGame(game)
  return [...library, newGame]
}

export const removeGameFromLibrary = (gameId: string, library: Game[]): Game[] => {
  return library.filter(game => game.id !== gameId)
}

export const getGameById = (gameId: string, library: Game[]): Game | undefined => {
  return library.find(game => game.id === gameId)
}

export const searchGames = (games: Game[], query: string): Game[] => {
  const lowercaseQuery = query.toLowerCase()
  return games.filter(game => 
    game.title.toLowerCase().includes(lowercaseQuery) ||
    game.description?.toLowerCase().includes(lowercaseQuery) ||
    game.developer?.toLowerCase().includes(lowercaseQuery) ||
    game.publisher?.toLowerCase().includes(lowercaseQuery) ||
    game.genres.some((genre: Genre) => genre.name?.toLowerCase().includes(lowercaseQuery)) ||
    game.subgenres.some((subgenre: Subgenre) => subgenre.name?.toLowerCase().includes(lowercaseQuery))
  )
}

export const filterGamesByStatus = (games: Game[], status: PlayStatus): Game[] => {
  return games.filter(game => game.playStatus === status)
}

export const filterGamesByPlatform = (games: Game[], platformCode: PlatformCode): Game[] => {
  return games.filter(game => 
    game.platforms.some((platform: Platform) => platform.code === platformCode)
  )
}

export const filterGamesByGenre = (games: Game[], genreId: string): Game[] => {
  return games.filter(game => 
    game.genres.some((genre: Genre) => genre.id === genreId)
  )
}

export const getGameStats = (games: Game[]) => {
  const totalGames = games.length
  const playedGames = games.filter(game => game.playStatus !== 'unplayed').length
  const completedGames = games.filter(game => game.playStatus === 'completed').length
  const currentlyPlaying = games.filter(game => game.playStatus === 'playing').length
  const totalHoursPlayed = games.reduce((total, game) => total + (game.hoursPlayed || 0), 0)
  const averageHoursPerGame = totalGames > 0 ? totalHoursPlayed / totalGames : 0

  return {
    totalGames,
    playedGames,
    completedGames,
    currentlyPlaying,
    totalHoursPlayed,
    averageHoursPerGame,
    completionRate: totalGames > 0 ? (completedGames / playedGames) * 100 : 0
  }
}

export const getRecentGames = (games: Game[], limit: number = 10): Game[] => {
  return games
    .filter(game => game.lastPlayed)
    .sort((a, b) => new Date(b.lastPlayed || 0).getTime() - new Date(a.lastPlayed || 0).getTime())
    .slice(0, limit)
}

export const getMostPlayedGames = (games: Game[], limit: number = 5): Game[] => {
  return games
    .filter(game => game.hoursPlayed && game.hoursPlayed > 0)
    .sort((a, b) => (b.hoursPlayed || 0) - (a.hoursPlayed || 0))
    .slice(0, limit)
}

// Platform validation
const validCodes: PlatformCode[] = [
  PlatformCode.STEAM, PlatformCode.XBOX, PlatformCode.PLAYSTATION, PlatformCode.NINTENDO,
  PlatformCode.EPIC, PlatformCode.GOG, PlatformCode.ORIGIN, PlatformCode.UPLAY,
  PlatformCode.BATTLENET, PlatformCode.DISCORD, PlatformCode.ITCH, PlatformCode.HUMBLE,
  PlatformCode.CUSTOM
]

const colors: Record<PlatformCode, string> = {
  [PlatformCode.STEAM]: '#1B2838',
  [PlatformCode.XBOX]: '#107C10',
  [PlatformCode.PLAYSTATION]: '#003791',
  [PlatformCode.NINTENDO]: '#E60012',
  [PlatformCode.EPIC]: '#313131',
  [PlatformCode.GOG]: '#8B46FF',
  [PlatformCode.ORIGIN]: '#F56B00',
  [PlatformCode.UPLAY]: '#00B4D3',
  [PlatformCode.BATTLENET]: '#1A5CAD',
  [PlatformCode.DISCORD]: '#5865F2',
  [PlatformCode.ITCH]: '#FA5C5C',
  [PlatformCode.HUMBLE]: '#CB772D',
  [PlatformCode.YOUTUBE]: '#FF0000',
  [PlatformCode.CUSTOM]: '#6B7280'
}

const names: Record<PlatformCode, string> = {
  [PlatformCode.STEAM]: 'Steam',
  [PlatformCode.XBOX]: 'Xbox',
  [PlatformCode.PLAYSTATION]: 'PlayStation',
  [PlatformCode.NINTENDO]: 'Nintendo',
  [PlatformCode.EPIC]: 'Epic Games',
  [PlatformCode.GOG]: 'GOG',
  [PlatformCode.ORIGIN]: 'Origin',
  [PlatformCode.UPLAY]: 'Ubisoft Connect',
  [PlatformCode.BATTLENET]: 'Battle.net',
  [PlatformCode.DISCORD]: 'Discord',
  [PlatformCode.ITCH]: 'Itch.io',
  [PlatformCode.HUMBLE]: 'Humble Bundle',
  [PlatformCode.YOUTUBE]: 'YouTube',
  [PlatformCode.CUSTOM]: 'Other'
}

export const isValidPlatformCode = (code: string): code is PlatformCode => {
  return validCodes.includes(code as PlatformCode)
}

export const getPlatformColor = (platformCode: PlatformCode): string => {
  return colors[platformCode] || colors[PlatformCode.CUSTOM]
}

export const getPlatformName = (platformCode: PlatformCode): string => {
  return names[platformCode] || names[PlatformCode.CUSTOM]
}

// Rating utilities
export const validateRating = (rating: number): boolean => {
  return rating >= 1 && rating <= 10
}

export const getRatingColor = (rating: number): string => {
  if (rating >= 8) return '#059669' // Excellent
  if (rating >= 6) return '#10B981' // Great
  if (rating >= 4) return '#F59E0B' // Good
  return '#6B7280' // Average
}

export const getRatingLabel = (rating: number): string => {
  if (rating >= 8) return 'Excellent'
  if (rating >= 6) return 'Great'
  if (rating >= 4) return 'Good'
  return 'Average'
}

// Time utilities
export const formatPlaytime = (hours: number): string => {
  if (hours < 1) return `${Math.round(hours * 60)}m`
  if (hours < 24) return `${Math.round(hours * 10) / 10}h`
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return remainingHours > 0 ? `${days}d ${Math.round(remainingHours)}h` : `${days}d`
}

export const getRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

// Search and filter utilities
export const createSearchFilter = (query: string) => {
  const lowercaseQuery = query.toLowerCase()
  return (game: Game) => {
    const searchFields = [
      game.title.toLowerCase(),
      game.description?.toLowerCase() || '',
      game.developer?.toLowerCase() || '',
      game.publisher?.toLowerCase() || '',
      ...game.genres.map((genre: Genre) => genre.name?.toLowerCase() || ''),
      ...game.subgenres.map((subgenre: Subgenre) => subgenre.name?.toLowerCase() || ''),
      ...game.platforms.map((platform: Platform) => platform.name?.toLowerCase() || '')
    ]
    return searchFields.some(field => field.includes(lowercaseQuery))
  }
}

// Sorting utilities
export const sortGamesByTitle = (games: Game[]): Game[] => {
  return [...games].sort((a, b) => a.title.localeCompare(b.title))
}

export const sortGamesByRating = (games: Game[]): Game[] => {
  return [...games].sort((a, b) => (b.userRating || 0) - (a.userRating || 0))
}

export const sortGamesByPlaytime = (games: Game[]): Game[] => {
  return [...games].sort((a, b) => (b.hoursPlayed || 0) - (a.hoursPlayed || 0))
}

export const sortGamesByLastPlayed = (games: Game[]): Game[] => {
  return [...games].sort((a, b) => new Date(b.lastPlayed || 0).getTime() - new Date(a.lastPlayed || 0).getTime())
}

// Game session utilities
export const createGameSession = (gameId: string, platformCode: PlatformCode): any => {
  return {
    id: crypto.randomUUID(),
    gameId,
    platform: { code: platformCode, name: getPlatformName(platformCode) },
    startTime: new Date(),
    endTime: undefined,
    duration: undefined,
    sessionType: 'main' as const
  }
}

export const endGameSession = (session: any, endTime?: Date): any => {
  const duration = endTime ? 
    Math.floor((endTime.getTime() - new Date(session.startTime).getTime()) / (1000 * 60)) : 
    undefined

  return {
    ...session,
    endTime,
    duration
  }
}

// Game library management
export const getLibraryStats = (games: Game[]) => {
  const stats = getGameStats(games)
  const genreDistribution: Record<string, number> = games.reduce((acc: Record<string, number>, game) => {
    game.genres.forEach((genre: Genre) => {
      const genreName = genre.name || 'Unknown'
      acc[genreName] = (acc[genreName] || 0) + 1
    })
    return acc
  }, {})

  return {
    totalGames: stats.totalGames,
    playedGames: stats.playedGames,
    completedGames: stats.completedGames,
    currentlyPlaying: stats.currentlyPlaying,
    totalHoursPlayed: stats.totalHoursPlayed,
    averageHoursPerGame: stats.averageHoursPerGame,
    completionRate: stats.completionRate,
    genreDistribution
  }
}

export const getWishlistStats = (games: Game[]) => {
  const wishlistGames = games.filter(game => game.playStatus === 'unplayed')
  const totalWishlistGames = wishlistGames.length
  const averageRating = wishlistGames.reduce((sum, game) => sum + (game.userRating || 0), 0) / totalWishlistGames

  return {
    totalWishlistGames,
    averageRating
  }
}

// Validation rules
export const GAME_VALIDATION_RULES = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 2000,
  RATING_MIN: 1,
  RATING_MAX: 10,
  NOTES_MAX_LENGTH: 1000,
  MAX_BACKGROUND_IMAGES: 10,
  MAX_GENRES_PER_GAME: 5,
  MAX_SUBGENRES_PER_GAME: 10,
  MAX_PLATFORMS_PER_GAME: 5,
  MAX_EMOTIONAL_TAGS_PER_GAME: 20
} as const
