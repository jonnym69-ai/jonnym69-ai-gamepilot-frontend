import type { 
  PlayerIdentity, 
  GameSession, 
  RecommendationContext,
  GameRecommendation 
} from './types'
import { IdentityEngine } from './computeIdentity'
import { ENHANCED_MOODS, type EnhancedMoodId } from '@gamepilot/static-data'
import type { Game } from '@gamepilot/types'

// Define MoodId locally since it's not exported from types
type MoodId = string

/**
 * Enhanced mood selection event for tracking user behavior
 */
export interface MoodSelectionEvent {
  id: string
  userId: string
  primaryMood: EnhancedMoodId
  secondaryMood?: EnhancedMoodId
  intensity: number
  timestamp: Date
  context: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
    dayOfWeek: number
    sessionLength?: number
    previousMood?: EnhancedMoodId
    trigger: 'manual' | 'suggested' | 'auto'
  }
  outcomes: {
    gamesRecommended: number
    gamesLaunched: number
    averageSessionDuration?: number
    userRating?: number
    ignoredRecommendations: number
  }
}

/**
 * Dynamic mood weights that adapt based on user behavior
 */
export interface DynamicMoodWeights {
  moodId: EnhancedMoodId
  genreWeights: Record<string, number> // -1 to 1, learned from behavior
  tagWeights: Record<string, number>    // -1 to 1, learned from behavior
  platformBiases: Record<string, number>
  timePreferences: {
    morning: number
    afternoon: number
    evening: number
    night: number
  }
  confidence: number // 0-1, how confident we are in these weights
  lastUpdated: Date
  sampleSize: number // number of data points
}

/**
 * Enhanced player identity with mood learning capabilities
 */
export interface EnhancedPlayerIdentity extends PlayerIdentity {
  moodHistory: MoodSelectionEvent[]
  dynamicMoodWeights: Record<EnhancedMoodId, DynamicMoodWeights>
  moodPatterns: {
    dailyRhythms: Record<string, EnhancedMoodId[]> // time -> likely moods
    weeklyPatterns: Record<number, EnhancedMoodId[]> // day -> likely moods
    contextualTriggers: Record<string, EnhancedMoodId> // context -> mood
  }
  hybridMoodPreferences: Record<string, number> // mood combinations -> success rate
  adaptationMetrics: {
    learningRate: number
    predictionAccuracy: number
    userSatisfactionScore: number
  }
}

/**
 * User action for learning feedback loop
 */
export interface UserAction {
  id: string
  userId: string
  type: 'launch' | 'ignore' | 'rate' | 'switch_mood' | 'session_complete'
  gameId?: string
  gameTitle?: string
  moodContext?: {
    primaryMood: EnhancedMoodId
    secondaryMood?: EnhancedMoodId
  }
  timestamp: Date
  metadata: {
    sessionDuration?: number
    rating?: number
    reason?: string
    previousMood?: EnhancedMoodId
  }
}

/**
 * Mood suggestion with confidence score
 */
export interface MoodSuggestion {
  moodId: EnhancedMoodId
  confidence: number
  reasoning: string
  contextualFactors: string[]
  successProbability: number
}

/**
 * Context for mood suggestions
 */
export interface MoodSuggestionContext {
  currentTime: Date
  recentSessions?: GameSession[]
  previousMood?: EnhancedMoodId
  availableTime?: number
  socialContext?: 'solo' | 'co-op' | 'pvp'
}

/**
 * Integration service connecting Enhanced Mood System with Persona Engine
 */
export class MoodPersonaIntegration {
  private identityEngine: IdentityEngine
  private moodHistory: Map<string, MoodSelectionEvent[]> = new Map()
  private dynamicWeights: Map<string, Record<EnhancedMoodId, DynamicMoodWeights>> = new Map()

  constructor() {
    this.identityEngine = new IdentityEngine()
  }

  /**
   * Process mood selection and update persona with learning
   */
  async processMoodSelection(
    userId: string,
    moodEvent: MoodSelectionEvent
  ): Promise<EnhancedPlayerIdentity> {
    // Store mood event
    const history = this.moodHistory.get(userId) || []
    history.push(moodEvent)
    this.moodHistory.set(userId, history)

    // Get or create enhanced identity
    const identity = await this.getEnhancedIdentity(userId)

    // Update mood patterns
    const updatedPatterns = this.updateMoodPatterns(identity, moodEvent)

    // Update dynamic weights based on outcomes
    const updatedWeights = await this.updateDynamicWeights(
      identity,
      moodEvent.primaryMood,
      moodEvent.outcomes
    )

    // Create enhanced identity
    const enhancedIdentity: EnhancedPlayerIdentity = {
      ...identity,
      moodHistory: history,
      dynamicMoodWeights: updatedWeights,
      moodPatterns: updatedPatterns,
      hybridMoodPreferences: this.calculateHybridMoodPreferences(history),
      adaptationMetrics: this.calculateAdaptationMetrics(history)
    }

    return enhancedIdentity
  }

  /**
   * Learn from user actions and update persona
   */
  async learnFromUserAction(
    userId: string,
    action: UserAction
  ): Promise<void> {
    const history = this.moodHistory.get(userId) || []
    
    if (action.type === 'launch' && action.moodContext) {
      // Update the most recent mood selection with positive outcome
      const recentMoodEvent = history[history.length - 1]
      if (recentMoodEvent) {
        recentMoodEvent.outcomes.gamesLaunched++
        if (action.metadata.sessionDuration) {
          recentMoodEvent.outcomes.averageSessionDuration = action.metadata.sessionDuration
        }
        if (action.metadata.rating) {
          recentMoodEvent.outcomes.userRating = action.metadata.rating
        }
      }
    } else if (action.type === 'ignore' && action.moodContext) {
      // Update with negative outcome
      const recentMoodEvent = history[history.length - 1]
      if (recentMoodEvent) {
        recentMoodEvent.outcomes.ignoredRecommendations++
      }
    }

    // Re-process the mood selection with updated outcomes
    if (history.length > 0) {
      await this.processMoodSelection(userId, history[history.length - 1])
    }
  }

  /**
   * Generate mood suggestions based on patterns and context
   */
  async generateMoodSuggestions(
    userId: string,
    context: MoodSuggestionContext
  ): Promise<MoodSuggestion[]> {
    const identity = await this.getEnhancedIdentity(userId)
    const suggestions: MoodSuggestion[] = []

    // Time-based suggestions
    const timeOfDay = this.getTimeOfDay(context.currentTime)
    const timeBasedMoods = identity.moodPatterns.dailyRhythms[timeOfDay] || []
    
    timeBasedMoods.forEach(moodId => {
      const confidence = this.calculateMoodConfidence(identity, moodId, context)
      suggestions.push({
        moodId,
        confidence,
        reasoning: `Based on your patterns, you often feel ${moodId} in the ${timeOfDay}`,
        contextualFactors: [timeOfDay],
        successProbability: confidence
      })
    })

    // Context-based suggestions
    if (context.socialContext) {
      const socialMoods = this.getMoodsForSocialContext(context.socialContext)
      socialMoods.forEach(moodId => {
        const confidence = this.calculateMoodConfidence(identity, moodId, context)
        suggestions.push({
          moodId,
          confidence,
          reasoning: `Good match for ${context.socialContext} gaming`,
          contextualFactors: [context.socialContext || 'unknown'],
          successProbability: confidence
        })
      })
    }

    // Sort by confidence and return top suggestions
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)
  }

  /**
   * Generate personalized recommendations using learned weights
   */
  async generatePersonalizedRecommendations(
    identity: EnhancedPlayerIdentity,
    mood: EnhancedMoodId,
    context: RecommendationContext,
    availableGames: Game[]
  ): Promise<GameRecommendation[]> {
    const recommendations: GameRecommendation[] = []
    const dynamicWeights = identity.dynamicMoodWeights[mood]

    if (!dynamicWeights) {
      // Fallback to static weights if no dynamic weights available
      return this.generateStaticRecommendations(mood, availableGames)
    }

    availableGames.forEach(game => {
      let score = 50 // Base score

      // Apply learned genre weights
      if (game.genres && game.genres.length > 0) {
        let genreScore = 0
        game.genres.forEach((genre: any) => {
          const genreName = typeof genre === 'string' ? genre : genre.name
          const weight = dynamicWeights.genreWeights[genreName] || 0
          genreScore += weight * 100
        })
        genreScore = genreScore / game.genres.length
        score += genreScore * 0.4
      }

      // Apply learned tag weights
      if (game.tags && game.tags.length > 0) {
        let tagScore = 0
        game.tags.forEach((tag: any) => {
          const tagName = typeof tag === 'string' ? tag : tag.name
          const weight = dynamicWeights.tagWeights[tagName] || 0
          tagScore += weight * 100
        })
        tagScore = tagScore / game.tags.length
        score += tagScore * 0.3
      }

      // Apply confidence factor
      score = 50 + (score - 50) * dynamicWeights.confidence

      if (score > 60) { // Only include recommendations with good scores
        recommendations.push({
          gameId: game.id,
          name: game.title,
          genre: String((game.genres?.[0] as unknown) || 'unknown'),
          score,
          reasons: [`Matches your learned preferences for ${mood}`],
          moodMatch: score,
          playstyleMatch: 75, // Placeholder
          socialMatch: 75, // Placeholder
          estimatedPlaytime: 60, // Placeholder
          difficulty: 'normal', // Placeholder
          tags: (game.tags as any)?.map((tag: any) => typeof tag === 'string' ? tag : tag.name) || []
        })
      }
    })

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  }

  /**
   * Get enhanced player identity with mood learning
   */
  private async getEnhancedIdentity(userId: string): Promise<EnhancedPlayerIdentity> {
    // For now, create a basic identity
    // In a real implementation, this would load from database
    const basicIdentity: PlayerIdentity = {
      id: `identity-${userId}`,
      userId,
      moods: [],
      playstyle: {
        primary: {
          id: 'casual',
          name: 'Casual Gamer',
          description: 'Plays for fun and relaxation',
          icon: '🎮',
          color: 'blue',
          traits: ['relaxed', 'exploratory']
        },
        preferences: {
          sessionLength: 'medium',
          difficulty: 'normal',
          socialPreference: 'solo',
          storyFocus: 50,
          graphicsFocus: 50,
          gameplayFocus: 50
        },
        traits: []
      },
      sessions: [],
      genreAffinities: {} as Record<string, number>,
      computedMood: undefined,
      lastUpdated: new Date(),
      version: '2.0.0'
    }

    return {
      ...basicIdentity,
      moodHistory: this.moodHistory.get(userId) || [],
      dynamicMoodWeights: this.dynamicWeights.get(userId) || this.initializeDynamicWeights(),
      moodPatterns: {
        dailyRhythms: {},
        weeklyPatterns: {},
        contextualTriggers: {}
      },
      hybridMoodPreferences: {},
      adaptationMetrics: {
        learningRate: 0.1,
        predictionAccuracy: 0.5,
        userSatisfactionScore: 0.7
      }
    }
  }

  /**
   * Initialize dynamic weights for all moods
   */
  private initializeDynamicWeights(): Record<EnhancedMoodId, DynamicMoodWeights> {
    const weights: Record<EnhancedMoodId, DynamicMoodWeights> = {} as any

    ENHANCED_MOODS.forEach(mood => {
      weights[mood.id] = {
        moodId: mood.id,
        genreWeights: { ...mood.genreWeights },
        tagWeights: { ...mood.tagWeights },
        platformBiases: mood.platformBias || {},
        timePreferences: {
          morning: 0.5,
          afternoon: 0.5,
          evening: 0.5,
          night: 0.5
        },
        confidence: 0.1, // Start with low confidence
        lastUpdated: new Date(),
        sampleSize: 0
      }
    })

    return weights
  }

  /**
   * Update mood patterns based on new selection
   */
  private updateMoodPatterns(
    identity: EnhancedPlayerIdentity,
    moodEvent: MoodSelectionEvent
  ): EnhancedPlayerIdentity['moodPatterns'] {
    const patterns = { ...identity.moodPatterns }
    const timeOfDay = this.getTimeOfDay(moodEvent.timestamp)

    // Update daily rhythms
    if (!patterns.dailyRhythms[timeOfDay]) {
      patterns.dailyRhythms[timeOfDay] = []
    }
    patterns.dailyRhythms[timeOfDay].push(moodEvent.primaryMood)

    // Update weekly patterns
    const dayOfWeek = moodEvent.timestamp.getDay()
    if (!patterns.weeklyPatterns[dayOfWeek]) {
      patterns.weeklyPatterns[dayOfWeek] = []
    }
    patterns.weeklyPatterns[dayOfWeek].push(moodEvent.primaryMood)

    return patterns
  }

  /**
   * Update dynamic weights based on mood outcomes
   */
  private async updateDynamicWeights(
    identity: EnhancedPlayerIdentity,
    moodId: EnhancedMoodId,
    outcomes: MoodSelectionEvent['outcomes']
  ): Promise<Record<EnhancedMoodId, DynamicMoodWeights>> {
    const weights = { ...identity.dynamicMoodWeights }
    const currentWeight = weights[moodId]

    if (!currentWeight) return weights

    // Calculate success metrics
    const launchRate = outcomes.gamesLaunched / Math.max(outcomes.gamesRecommended, 1)
    const satisfactionScore = (outcomes.userRating || 3) / 5

    // Update confidence based on sample size
    const newSampleSize = currentWeight.sampleSize + 1
    const newConfidence = Math.min(0.9, 0.1 + (newSampleSize / 100))

    // Adjust weights based on success
    const adjustmentFactor = (launchRate * 0.6 + satisfactionScore * 0.4) - 0.5

    // Apply learning rate
    const learningRate = identity.adaptationMetrics.learningRate
    const weightAdjustment = adjustmentFactor * learningRate

    // Update genre weights (simplified - would need actual game data)
    Object.keys(currentWeight.genreWeights).forEach(genre => {
      currentWeight.genreWeights[genre] = Math.max(-1, Math.min(1, 
        currentWeight.genreWeights[genre] + weightAdjustment
      ))
    })

    // Update metadata
    currentWeight.confidence = newConfidence
    currentWeight.sampleSize = newSampleSize
    currentWeight.lastUpdated = new Date()

    weights[moodId] = currentWeight
    return weights
  }

  /**
   * Calculate hybrid mood preferences
   */
  private calculateHybridMoodPreferences(
    history: MoodSelectionEvent[]
  ): Record<string, number> {
    const preferences: Record<string, number> = {}

    history.forEach(event => {
      if (event.secondaryMood) {
        const key = `${event.primaryMood}+${event.secondaryMood}`
        const success = event.outcomes.gamesLaunched / Math.max(event.outcomes.gamesRecommended, 1)
        preferences[key] = (preferences[key] || 0) + success
      }
    })

    return preferences
  }

  /**
   * Calculate adaptation metrics
   */
  private calculateAdaptationMetrics(
    history: MoodSelectionEvent[]
  ): EnhancedPlayerIdentity['adaptationMetrics'] {
    if (history.length === 0) {
      return {
        learningRate: 0.1,
        predictionAccuracy: 0.5,
        userSatisfactionScore: 0.7
      }
    }

    const recentHistory = history.slice(-10) // Last 10 selections
    const avgSatisfaction = recentHistory.reduce((sum, event) => 
      sum + (event.outcomes.userRating || 3), 0) / recentHistory.length / 5

    return {
      learningRate: Math.min(0.3, 0.05 + (history.length / 200)),
      predictionAccuracy: Math.min(0.9, 0.3 + (recentHistory.length / 20)),
      userSatisfactionScore: avgSatisfaction
    }
  }

  /**
   * Calculate mood confidence for suggestions
   */
  private calculateMoodConfidence(
    identity: EnhancedPlayerIdentity,
    moodId: EnhancedMoodId,
    context: MoodSuggestionContext
  ): number {
    const weights = identity.dynamicMoodWeights[moodId]
    if (!weights) return 0.5

    let confidence = weights.confidence

    // Boost confidence if mood matches time preference
    const timeOfDay = this.getTimeOfDay(context.currentTime)
    const timePreference = weights.timePreferences[timeOfDay as keyof typeof weights.timePreferences]
    confidence += (timePreference - 0.5) * 0.3

    return Math.max(0, Math.min(1, confidence))
  }

  /**
   * Get time of day from Date
   */
  private getTimeOfDay(date: Date): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = date.getHours()
    if (hour >= 6 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 18) return 'afternoon'
    if (hour >= 18 && hour < 22) return 'evening'
    return 'night'
  }

  /**
   * Get moods suitable for social context
   */
  private getMoodsForSocialContext(context: 'solo' | 'co-op' | 'pvp'): EnhancedMoodId[] {
    switch (context) {
      case 'solo':
        return ['focused', 'relaxed', 'exploratory', 'creative']
      case 'co-op':
        return ['social', 'energetic', 'creative']
      case 'pvp':
        return ['competitive', 'energetic', 'focused']
      default:
        return []
    }
  }

  /**
   * Generate static recommendations as fallback
   */
  private generateStaticRecommendations(
    mood: EnhancedMoodId,
    availableGames: Game[]
  ): GameRecommendation[] {
    // Fallback implementation using static mood data
    const moodData = ENHANCED_MOODS.find(m => m.id === mood)
    if (!moodData) return []

    return availableGames.slice(0, 5).map(game => ({
      gameId: game.id,
      name: game.title,
      genre: String(game.genres?.[0] || 'unknown'),
      score: 75,
      reasons: [`Matches ${moodData.name} mood`],
      moodMatch: 75,
      playstyleMatch: 70,
      socialMatch: 70,
      estimatedPlaytime: 60,
      difficulty: 'normal',
      tags: game.tags as string[] || []
    }))
  }
}
