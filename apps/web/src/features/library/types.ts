export interface Game {
  id: string
  title: string
  developer?: string
  publisher?: string
  releaseDate?: string
  genres?: string[]
  platforms?: PlatformCode[]
  coverImage?: string
  description?: string
  status?: 'playing' | 'completed' | 'backlog' | 'abandoned'
  playtime?: number
  rating?: number
  tags?: string[]
  achievements?: {
    unlocked: number
    total: number
  }
  lastPlayed?: string
  notes?: string
  launcherId?: string
  // Missing properties that are used in components
  platform?: string
  platformCodes?: string[]
  genre?: string
  mood?: string
  hoursPlayed?: number
  averageRating?: number
  completionPercentage?: number
  favoriteGenres?: string[]
  favoriteMoods?: string[]
  recentPlaytime?: number
  totalAchievements?: number
  isFavorite?: boolean
  isRecentlyPlayed?: boolean
  isCompleted?: boolean
  isPlaying?: boolean
}

// Platform code enum for type safety
export enum PlatformCode {
  STEAM = 'steam',
  EPIC = 'epic',
  XBOX = 'xbox',
  PLAYSTATION = 'playstation',
  NINTENDO = 'nintendo',
  GOG = 'gog',
  ORIGIN = 'origin',
  UPLAY = 'uplay',
  BATTLENET = 'battlenet',
  DISCORD = 'discord',
  ITCH = 'itch',
  HUMBLE = 'humble',
  YOUTUBE = 'youtube',
  CUSTOM = 'custom'
}

export interface GameFilter {
  platforms: string[]
  genres: string[]
  status: string[]
  tags: string[]
  ratingRange: [number, number]
  playtimeRange: [number, number]
}

export interface SortOption {
  field: 'title' | 'releaseDate' | 'playtime' | 'rating' | 'lastPlayed'
  direction: 'asc' | 'desc'
}

export type PlayStatus = 'unplayed' | 'playing' | 'completed' | 'paused' | 'abandoned'

export type TagCategory = 'memory' | 'feeling' | 'occasion' | 'social'

export type SessionType = 'main' | 'break' | 'social' | 'achievement'

export interface EmotionalTag {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  category: TagCategory
  isCustom: boolean
  createdBy?: string
  games: Game[]
}

export interface GameFilter {
  platforms: string[]
  genres: string[]
  status: string[]
  tags: string[]
  ratingRange: [number, number]
  playtimeRange: [number, number]
}

export interface SortOption {
  field: 'title' | 'releaseDate' | 'playtime' | 'rating' | 'lastPlayed'
  direction: 'asc' | 'desc'
}
