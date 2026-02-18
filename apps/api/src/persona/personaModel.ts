// Unified Persona Model
// Consolidates all persona-related interfaces for the backend

import type { PersonaTraits, PersonaArchetypeId, PersonaIntensity, PersonaPacing, PersonaRiskProfile, PersonaSocialStyle } from '@gamepilot/static-data'
import type { IdentityCore } from '@gamepilot/shared'

/**
 * Current intent states for gaming sessions
 */
export type PersonaIntent = 
  | 'short_session'    // Quick gaming session (< 30 mins)
  | 'comfort'          // Familiar, relaxing games
  | 'novelty'          // Try something new
  | 'social'           // Multiplayer with friends
  | 'challenge'        // Difficult content
  | 'exploration'      // Discover new content
  | 'achievement'      // Complete goals/achievements
  | 'neutral'          // No specific intent

/**
 * Dynamic mood states affecting recommendations
 */
export type PersonaMood = 
  | 'energetic'        // High energy, want action
  | 'focused'          // Concentrated, strategic gameplay
  | 'relaxed'          // Casual, low-pressure
  | 'creative'         // Want to build/create
  | 'competitive'      // Want to win/compete
  | 'social'           // Want to interact
  | 'curious'          // Want to explore/discover
  | 'nostalgic'        // Want familiar experiences
  | 'stressed'         // Need stress relief
  | 'bored'            // Need stimulation
  | 'neutral'          // No strong mood

/**
 * Behavioral pattern tracking
 */
export interface BehavioralPatterns {
  // Recent gaming behavior (last 30 days)
  recentGames: {
    gameId: string
    gameName: string
    sessionCount: number
    totalPlaytime: number
    lastPlayed: Date
    averageSessionLength: number
    completionRate: number
  }[]
  
  // Session patterns
  sessionPatterns: {
    averageLength: number
    preferredTimes: number[] // Hours of day (0-23)
    sessionsPerWeek: number
    lateNightRatio: number
    weekendRatio: number
  }
  
  // Abandonment patterns
  abandonedGames: {
    gameId: string
    abandonedAt: Date
    playtimeBeforeAbandonment: number
    lastSessionLength: number
    reason?: 'difficulty' | 'boredom' | 'time' | 'technical' | 'other'
  }[]
  
  // Completion patterns
  completionPatterns: {
    gamesCompleted: number
    averageCompletionRate: number
    preferredCompletionTypes: ('main_story' | 'full_completion' | 'achievements')[]
    achievementHunting: boolean
  }
}

/**
 * Historical tracking for persona evolution
 */
export interface PersonaHistory {
  moodHistory: {
    mood: PersonaMood
    intensity: number // 1-10
    timestamp: Date
    context?: string
    gameId?: string
  }[]
  
  intentHistory: {
    intent: PersonaIntent
    timestamp: Date
    success: boolean // Was the intent fulfilled?
    gameId?: string
  }[]
  
  traitEvolution: {
    date: Date
    traits: PersonaTraits
    confidence: number
    triggerEvent?: string
  }[]
}

/**
 * Complete unified persona model
 */
export interface UnifiedPersona {
  // Core identification
  userId: string
  createdAt: Date
  lastUpdated: Date
  
  // Core traits (from PersonaTraits)
  traits: PersonaTraits
  
  // Dynamic state
  currentMood: PersonaMood
  currentIntent: PersonaIntent
  moodIntensity: number // 1-10
  
  // Behavioral patterns
  patterns: BehavioralPatterns
  
  // Historical tracking
  history: PersonaHistory
  
  // Computed signals (from IdentityCore)
  signals: IdentityCore['signals']
  
  // Metadata
  confidence: number // Overall confidence in persona accuracy
  dataPoints: number // Number of data points contributing to persona
  lastAnalysisDate: Date
  
  // Recommendations context
  recommendationContext: {
    preferredGenres: string[]
    avoidedGenres: string[]
    sessionLengthPreference: 'short' | 'medium' | 'long'
    difficultyPreference: 'easy' | 'normal' | 'hard' | 'adaptive'
    socialPreference: 'solo' | 'coop' | 'competitive' | 'any'
  }
}

/**
 * Persona update events
 */
export interface PersonaUpdateEvent {
  type: 'mood' | 'intent' | 'behavior' | 'session' | 'achievement'
  timestamp: Date
  userId: string
  data: any
  context?: {
    gameId?: string
    sessionId?: string
    source?: 'user_input' | 'behavioral' | 'system_inferred'
  }
}

/**
 * Persona state for recommendation engine
 * Simplified output for recommendation scoring
 */
export interface PersonaState {
  userId: string
  
  // Core preferences
  archetype: PersonaArchetypeId
  mood: PersonaMood
  intent: PersonaIntent
  
  // Behavioral signals
  sessionLengthPreference: number // Average preferred minutes
  genreAffinities: Record<string, number> // 0-1 scale
  difficultyPreference: number // 0-1 scale (easy to hard)
  socialPreference: number // 0-1 scale (solo to competitive)
  
  // Context factors
  timeOfDay: number // 0-23
  dayOfWeek: number // 0-6 (Sunday to Saturday)
  recentGames: string[] // Recently played game IDs
  
  // Confidence metrics
  confidence: number // 0-1
  dataFreshness: number // 0-1 (how recent is the data)
}

/**
 * Persona update request
 */
export interface PersonaUpdateRequest {
  mood?: {
    mood: PersonaMood
    intensity: number
    context?: string
  }
  
  intent?: {
    intent: PersonaIntent
    context?: string
  }
  
  behavior?: {
    gameId: string
    sessionLength: number
    completed: boolean
    achievements?: number
    difficulty?: 'easy' | 'normal' | 'hard'
    multiplayer?: boolean
    timestamp: Date
  }
  
  event?: PersonaUpdateEvent
}

/**
 * Persona analysis result
 */
export interface PersonaAnalysisResult {
  persona: UnifiedPersona
  state: PersonaState
  insights: {
    dominantTraits: string[]
    behaviorPatterns: string[]
    recommendations: string[]
    confidence: number
  }
  metadata: {
    analysisDate: Date
    dataPointsUsed: number
    computationTime: number
  }
}
