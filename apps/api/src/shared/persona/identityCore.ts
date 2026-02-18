// Persona Engine Identity Core Schema
// Canonical interface for identity computation and persona synthesis

import type { Game } from '../index'

/**
 * Session data for tracking gaming patterns
 */
export interface Session {
  gameId: string
  startTime?: Date
  timestamp?: Date // Support both startTime and timestamp
  endTime?: Date
  duration: number // in minutes
  achievements?: number
  multiplayer?: boolean
}

/**
 * Identity Core - Canonical persona engine schema
 * Contains raw data, computed signals, personality traits, mood signals, and reflection
 */
export interface IdentityCore {
  raw: {
    steam: {
      games: Game[]
      playtime: Record<string, number>
      genres: Record<string, number>
      achievements: Record<string, number>
      sessions: Session[]
    }
  }

  signals: {
    genreAffinity: Record<string, number>
    completionRate: number
    sessionPattern: number
    playtimeDistribution: number[]
    multiplayerRatio: number
  }

  traits: {
    explorer: number
    specialist: number
    competitor: number
    completionist: number
    strategist: number
    adventurer: number
  }

  moodSignals: {
    sessionPattern: number
    genreShift: number
    playtimeSpike: number
    returnFrequency: number
    abandonmentRate: number
  }

  reflection: {
    identitySummary: string
    dominantTraits: string[]
    currentMood: string
    recommendationContext: string
  }
}
