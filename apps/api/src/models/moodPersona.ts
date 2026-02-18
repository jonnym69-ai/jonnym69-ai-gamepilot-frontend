import type { EnhancedMoodId } from '@gamepilot/static-data'

/**
 * Mood Selection Event - tracks every mood choice with context and outcomes
 */
export interface MoodSelection {
  id: string
  userId: string
  primaryMood: EnhancedMoodId
  secondaryMood?: EnhancedMoodId
  intensity: number
  sessionId?: string
  timestamp: Date
  context: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
    dayOfWeek: number
    trigger: 'manual' | 'suggested' | 'auto'
    previousMood?: EnhancedMoodId
    sessionLength?: number
  }
  outcomes: {
    gamesRecommended: number
    gamesLaunched: number
    averageSessionDuration?: number
    userRating?: number
    ignoredRecommendations: number
  }
  createdAt: Date
}

/**
 * Persona Profile - stores learned preferences and weights for each user
 */
export interface PersonaProfile {
  id: string
  userId: string
  genreWeights: Record<string, number> // -1 to 1, learned from behavior
  tagWeights: Record<string, number>    // -1 to 1, learned from behavior
  moodAffinity: Record<EnhancedMoodId, number> // mood preference scores
  sessionPatterns: {
    dailyRhythms: Record<string, EnhancedMoodId[]>
    weeklyPatterns: Record<number, EnhancedMoodId[]>
    contextualTriggers: Record<string, EnhancedMoodId>
  }
  hybridSuccess: Record<string, number> // mood combinations -> success rate
  platformBiases: Record<string, number>
  timePreferences: {
    morning: number
    afternoon: number
    evening: number
    night: number
  }
  confidence: number // 0-1, how confident we are in these weights
  sampleSize: number // number of data points
  version: string
  lastUpdated: Date
  createdAt: Date
  updatedAt: Date
}

/**
 * User Action - tracks all user interactions for learning
 */
export interface UserAction {
  id: string
  userId: string
  type: 'launch' | 'ignore' | 'view' | 'wishlist' | 'rate' | 'switch_mood' | 'session_complete'
  gameId?: string
  gameTitle?: string
  moodContext?: {
    primaryMood: EnhancedMoodId
    secondaryMood?: EnhancedMoodId
  }
  timestamp: Date
  sessionId?: string
  metadata: {
    sessionDuration?: number
    rating?: number
    reason?: string
    previousMood?: EnhancedMoodId
  }
  createdAt: Date
}

/**
 * Recommendation Event - tracks recommendation performance
 */
export interface RecommendationEvent {
  id: string
  userId: string
  moodContext: {
    primaryMood: EnhancedMoodId
    secondaryMood?: EnhancedMoodId
    intensity: number
  }
  recommendedGames: Array<{
    gameId: string
    name: string
    score: number
    reasoning: string[]
  }>
  clickedGameId?: string
  successFlag?: boolean
  timestamp: Date
  sessionId?: string
  metadata?: Record<string, any>
  createdAt: Date
}

/**
 * Mood Prediction - tracks mood suggestion accuracy
 */
export interface MoodPrediction {
  id: string
  userId: string
  predictedMood: EnhancedMoodId
  confidence: number
  reasoning: string[]
  contextualFactors: string[]
  successProbability: number
  acceptedFlag?: boolean
  timestamp: Date
  sessionId?: string
  createdAt: Date
}

/**
 * Mood Pattern - stores detected patterns for predictions
 */
export interface MoodPattern {
  id: string
  userId: string
  patternType: 'daily_rhythm' | 'weekly_pattern' | 'contextual_trigger'
  patternKey: string // time of day, day of week, context
  moodId: EnhancedMoodId
  frequency: number
  successRate: number
  lastSeen: Date
  confidence: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Learning Metrics - tracks system performance over time
 */
export interface LearningMetrics {
  id: string
  userId: string
  metricType: 'prediction_accuracy' | 'user_satisfaction' | 'adaptation_rate' | 'recommendation_success'
  metricValue: number
  period: 'daily' | 'weekly' | 'monthly'
  timestamp: Date
  metadata?: Record<string, any>
  createdAt: Date
}

/**
 * Database row mapping functions
 */
export function mapRowToMoodSelection(row: any): MoodSelection {
  return {
    id: row.id,
    userId: row.userId,
    primaryMood: row.primaryMood,
    secondaryMood: row.secondaryMood,
    intensity: row.intensity,
    sessionId: row.sessionId,
    timestamp: new Date(row.timestamp),
    context: JSON.parse(row.context),
    outcomes: JSON.parse(row.outcomes),
    createdAt: new Date(row.createdAt)
  }
}

export function mapRowToPersonaProfile(row: any): PersonaProfile {
  return {
    id: row.id,
    userId: row.userId,
    genreWeights: JSON.parse(row.genreWeights),
    tagWeights: JSON.parse(row.tagWeights),
    moodAffinity: JSON.parse(row.moodAffinity),
    sessionPatterns: JSON.parse(row.sessionPatterns),
    hybridSuccess: JSON.parse(row.hybridSuccess),
    platformBiases: JSON.parse(row.platformBiases),
    timePreferences: JSON.parse(row.timePreferences),
    confidence: row.confidence,
    sampleSize: row.sampleSize,
    version: row.version,
    lastUpdated: new Date(row.lastUpdated),
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt)
  }
}

export function mapRowToUserAction(row: any): UserAction {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    gameId: row.gameId,
    gameTitle: row.gameTitle,
    moodContext: row.moodContext ? JSON.parse(row.moodContext) : undefined,
    timestamp: new Date(row.timestamp),
    sessionId: row.sessionId,
    metadata: JSON.parse(row.metadata || '{}'),
    createdAt: new Date(row.createdAt)
  }
}

export function mapRowToRecommendationEvent(row: any): RecommendationEvent {
  return {
    id: row.id,
    userId: row.userId,
    moodContext: JSON.parse(row.moodContext),
    recommendedGames: JSON.parse(row.recommendedGames),
    clickedGameId: row.clickedGameId,
    successFlag: row.successFlag,
    timestamp: new Date(row.timestamp),
    sessionId: row.sessionId,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    createdAt: new Date(row.createdAt)
  }
}

export function mapRowToMoodPrediction(row: any): MoodPrediction {
  return {
    id: row.id,
    userId: row.userId,
    predictedMood: row.predictedMood,
    confidence: row.confidence,
    reasoning: JSON.parse(row.reasoning || '[]'),
    contextualFactors: JSON.parse(row.contextualFactors || '[]'),
    successProbability: row.successProbability,
    acceptedFlag: row.acceptedFlag,
    timestamp: new Date(row.timestamp),
    sessionId: row.sessionId,
    createdAt: new Date(row.createdAt)
  }
}

export function mapRowToMoodPattern(row: any): MoodPattern {
  return {
    id: row.id,
    userId: row.userId,
    patternType: row.patternType,
    patternKey: row.patternKey,
    moodId: row.moodId,
    frequency: row.frequency,
    successRate: row.successRate,
    lastSeen: new Date(row.lastSeen),
    confidence: row.confidence,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt)
  }
}

export function mapRowToLearningMetrics(row: any): LearningMetrics {
  return {
    id: row.id,
    userId: row.userId,
    metricType: row.metricType,
    metricValue: row.metricValue,
    period: row.period,
    timestamp: new Date(row.timestamp),
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    createdAt: new Date(row.createdAt)
  }
}
