// Temporarily using relative imports until workspace is properly configured
import type { MoodId } from '@gamepilot/static-data'
import type { Game } from '@gamepilot/types'

export interface UserMood {
  id: MoodId
  preference: number // 0-100, how much user likes this mood
  frequency: number // 1-5, how often they experience this mood
  lastExperienced?: Date
  triggers?: string[]
  associatedGenres: string[]
}

export interface PlaystyleIndicator {
  id: string
  name: string
  description: string
  icon: string
  color: string // Tailwind gradient class
  traits: string[]
}

export interface UserPlaystyle {
  primary: PlaystyleIndicator
  secondary?: PlaystyleIndicator
  preferences: {
    sessionLength: 'short' | 'medium' | 'long'
    difficulty: 'casual' | 'normal' | 'hard' | 'expert'
    socialPreference: 'solo' | 'cooperative' | 'competitive'
    storyFocus: number // 0-100
    graphicsFocus: number // 0-100
    gameplayFocus: number // 0-100
  }
  customPlaystyles?: PlaystyleIndicator[]
  traits: string[]
}

export interface GameSession {
  id: string
  gameId: string
  gameName: string
  game: Game
  genre: string
  startTime: Date
  endTime?: Date
  duration?: number // in minutes
  mood: MoodId
  intensity: number // 1-10
  tags: string[]
  platform: string
  completed?: boolean
  difficulty?: 'casual' | 'normal' | 'hard' | 'expert'
  isMultiplayer?: boolean
  rating?: number // 1-5
  userId?: string
}

export interface PlayerIdentity {
  id: string
  userId: string
  moods: UserMood[]
  playstyle: UserPlaystyle
  sessions: GameSession[]
  genreAffinities: Record<string, number> // genre -> affinity score
  computedMood?: MoodId
  lastUpdated: Date
  version: string
  preferences?: {
    favoriteGenre?: string
    social?: boolean
  }
}

export interface RecommendationContext {
  currentMood?: MoodId
  timeAvailable?: number // minutes
  socialContext?: 'solo' | 'co-op' | 'pvp'
  intensity?: 'low' | 'medium' | 'high'
  platform?: string
  genres?: string[]
  excludeRecentlyPlayed?: boolean
}

export interface GameRecommendation {
  gameId: string
  name: string
  genre: string
  score: number // 0-100 recommendation strength
  reasons: string[]
  moodMatch: number
  playstyleMatch: number
  socialMatch: number
  estimatedPlaytime: number
  difficulty: string
  tags: string[]
}

export interface IdentityComputationOptions {
  recentSessionWeight: number // weight for recent sessions (0-1)
  moodDecayDays: number // days after which mood influence decays
  minSessionsForComputation: number
  includeNegativeSessions: boolean
}
