/**
 * Free AI Components for GamePilot 1.0
 * Uses only free, open-source libraries (MIT/Apache/BSD)
 * No paid APIs, external LLMs, or cloud services
 */

import type { 
  GameSession, 
  PlayerIdentity, 
  UserMood, 
  GameRecommendation,
  RecommendationContext 
} from './types'
import { MOODS, GENRES, type MoodId, type GenreId } from '@gamepilot/static-data'

// ============================================================================
// FREE MOOD ENGINE - Rule-based Classification
// ============================================================================

export interface MoodAnalysisResult {
  mood: MoodId
  confidence: number
  intensity: number
  triggers: string[]
  reasoning: string
}

export class FreeMoodEngine {
  private moodKeywords: Record<MoodId, string[]> = {
    chill: ['relax', 'casual', 'peaceful', 'calm', 'zen', 'meditative', 'stress-free'],
    competitive: ['win', 'battle', 'pvp', 'rank', 'score', 'challenge', 'tournament'],
    story: ['narrative', 'plot', 'character', 'dialogue', 'cinematic', 'storyline', 'quest'],
    creative: ['build', 'craft', 'design', 'create', 'customize', 'express', 'artistic'],
    social: ['friends', 'team', 'chat', 'community', 'multiplayer', 'co-op', 'guild'],
    focused: ['concentrate', 'deep', 'immersive', 'intense', 'skill', 'precision', 'mastery'],
    energetic: ['action', 'fast', 'dynamic', 'exciting', 'thrilling', 'adrenaline', 'intense'],
    exploratory: ['discover', 'explore', 'wander', 'adventure', 'open-world', 'curiosity', 'journey']
  }

  private sessionMoodWeights: Record<MoodId, number> = {
    chill: 0.3,
    competitive: 0.9,
    story: 0.5,
    creative: 0.4,
    social: 0.6,
    focused: 0.8,
    energetic: 0.9,
    exploratory: 0.5
  }

  /**
   * Analyze mood from gaming sessions using rule-based classification
   */
  analyzeMood(sessions: GameSession[]): MoodAnalysisResult {
    if (sessions.length === 0) {
      return {
        mood: 'chill',
        confidence: 0.5,
        intensity: 0.3,
        triggers: ['no_data'],
        reasoning: 'No gaming sessions available, defaulting to chill mood'
      }
    }

    // Get recent sessions (last 7 days)
    const recentSessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return sessionDate >= weekAgo
    })

    if (recentSessions.length === 0) {
      return {
        mood: 'chill',
        confidence: 0.4,
        intensity: 0.3,
        triggers: ['old_data'],
        reasoning: 'No recent gaming sessions, defaulting to chill mood'
      }
    }

    // Calculate mood scores based on sessions
    const moodScores: Record<MoodId, number> = {} as Record<MoodId, number>
    const moodTriggers: Record<MoodId, string[]> = {} as Record<MoodId, string[]>
    
    recentSessions.forEach(session => {
      const score = this.calculateSessionMoodScore(session)
      const triggers = this.getSessionMoodTriggers(session)
      
      moodScores[session.mood] = (moodScores[session.mood] || 0) + score
      moodTriggers[session.mood] = [...(moodTriggers[session.mood] || []), ...triggers]
    })

    // Find mood with highest score
    let bestMood: MoodId = 'chill'
    let bestScore = 0
    let totalScore = 0

    Object.entries(moodScores).forEach(([mood, score]) => {
      totalScore += score
      if (score > bestScore) {
        bestScore = score
        bestMood = mood as MoodId
      }
    })

    const confidence = totalScore > 0 ? bestScore / totalScore : 0.5
    const intensity = Math.min(1, bestScore / recentSessions.length)

    return {
      mood: bestMood,
      confidence: Math.min(1, confidence + 0.2), // Boost confidence slightly
      intensity,
      triggers: moodTriggers[bestMood] || [],
      reasoning: this.generateMoodReasoning(bestMood, recentSessions, bestScore, totalScore)
    }
  }

  /**
   * Calculate mood score for a single session
   */
  private calculateSessionMoodScore(session: GameSession): number {
    const baseScore = this.sessionMoodWeights[session.mood || 'neutral']
    const durationWeight = Math.min(1, (session.duration || 0) / 3600000) // Weight by duration (max 1 hour)
    const intensityWeight = session.intensity || 0.5
    
    return baseScore * durationWeight * intensityWeight
  }

  /**
   * Get mood triggers from session data
   */
  private getSessionMoodTriggers(session: GameSession): string[] {
    const triggers: string[] = []
    
    // Duration-based triggers
    if ((session.duration || 0) > 7200000) triggers.push('long_session')
    if ((session.duration || 0) < 1800000) triggers.push('short_session')
    
    // Intensity-based triggers
    if (session.intensity > 0.8) triggers.push('high_intensity')
    if (session.intensity < 0.3) triggers.push('low_intensity')
    
    // Genre-based triggers
    if (session.genre) {
      triggers.push(`genre_${session.genre}`)
    }
    
    // Platform-based triggers
    if (session.platform) {
      triggers.push(`platform_${session.platform}`)
    }
    
    return triggers
  }

  /**
   * Generate reasoning for mood analysis
   */
  private generateMoodReasoning(
    mood: MoodId, 
    sessions: GameSession[], 
    bestScore: number, 
    totalScore: number
  ): string {
    const moodData = MOODS.find(m => m.id === mood)
    const moodName = moodData?.name || 'Unknown'
    const sessionCount = sessions.length
    const avgDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessionCount
    
    return `Detected ${moodName} mood based on ${sessionCount} recent gaming sessions ` +
           `with average duration of ${Math.round(avgDuration / 60000)} minutes. ` +
           `Mood confidence: ${Math.round((bestScore / totalScore) * 100)}%`
  }
}

// ============================================================================
// FREE RECOMMENDATION ENGINE - Cosine Similarity
// ============================================================================

export interface GameVector {
  id: string
  name: string
  vector: number[]
  genres: GenreId[]
  tags: string[]
  difficulty: number
  socialScore: number
  estimatedPlaytime: number
}

export interface RecommendationResult {
  gameId: string
  name: string
  score: number
  reasons: string[]
  moodMatch: number
  playstyleMatch: number
  socialMatch: number
  estimatedPlaytime: number
  difficulty: string
  tags: string[]
}

export class FreeRecommendationEngine {
  private moodVectors: Record<MoodId, number[]> = this.generateMoodVectors()
  private genreVectors: Record<GenreId, number[]> = this.generateGenreVectors()

  /**
   * Get recommendations using cosine similarity
   */
  getRecommendations(
    identity: PlayerIdentity,
    context: RecommendationContext,
    availableGames: any[]
  ): RecommendationResult[] {
    const recommendations: RecommendationResult[] = []
    
    // Create user vector based on identity and context
    const userVector = this.createUserVector(identity, context)
    
    availableGames.forEach(game => {
      const gameVector = this.createGameVector(game)
      const similarity = this.calculateCosineSimilarity(userVector, gameVector.vector)
      
      if (similarity > 0.3) { // Minimum similarity threshold
        recommendations.push({
          gameId: game.id,
          name: game.name,
          score: similarity * 100,
          reasons: this.generateReasons(game, identity, context, similarity),
          moodMatch: this.calculateMoodMatch(game, context.currentMood || 'chill'),
          playstyleMatch: this.calculatePlaystyleMatch(game, identity),
          socialMatch: this.calculateSocialMatch(game, identity),
          estimatedPlaytime: game.estimatedPlaytime || 120,
          difficulty: game.difficulty || 'medium',
          tags: game.tags || []
        })
      }
    })

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
  }

  /**
   * Generate mood vectors for similarity calculations
   */
  private generateMoodVectors(): Record<MoodId, number[]> {
    const vectorSize = 8 // Number of mood dimensions
    const vectors: Record<MoodId, number[]> = {} as Record<MoodId, number[]>
    
    Object.keys(MOODS).forEach((moodId, index) => {
      const vector = new Array(vectorSize).fill(0)
      vector[index] = 1 // One-hot encoding
      vectors[moodId as MoodId] = vector
    })
    
    return vectors
  }

  /**
   * Generate genre vectors for similarity calculations
   */
  private generateGenreVectors(): Record<GenreId, number[]> {
    const vectorSize = Object.keys(GENRES).length
    const vectors: Record<GenreId, number[]> = {} as Record<GenreId, number[]>
    
    Object.keys(GENRES).forEach((genreId, index) => {
      const vector = new Array(vectorSize).fill(0)
      vector[index] = 1 // One-hot encoding
      vectors[genreId as GenreId] = vector
    })
    
    return vectors
  }

  /**
   * Create user vector based on identity and context
   */
  private createUserVector(identity: PlayerIdentity, context: RecommendationContext): number[] {
    const moodVector = this.moodVectors[context.currentMood || 'chill'] || []
    const playstyleVector = this.createPlaystyleVector((identity.playstyle as any)?.primary?.id || 'explorer')
    const preferenceVector = this.createPreferenceVector(identity.preferences || {})
    
    // Combine vectors with weights
    const combinedVector = [
      ...moodVector.map((v: number) => v * 0.4), // Mood weight: 40%
      ...playstyleVector.map((v: number) => v * 0.3), // Playstyle weight: 30%
      ...preferenceVector.map((v: number) => v * 0.3) // Preference weight: 30%
    ]
    
    return combinedVector
  }

  /**
   * Create game vector for similarity calculations
   */
  private createGameVector(game: any): GameVector {
    const genreVector = this.combineGenreVectors(game.genres || [])
    const tagVector = this.createTagVector(game.tags || [])
    
    return {
      id: game.id,
      name: game.name,
      vector: [
        ...genreVector.map(v => v * 0.5), // Genre weight: 50%
        ...tagVector.map(v => v * 0.3), // Tag weight: 30%
        game.difficulty === 'easy' ? 0.1 : game.difficulty === 'hard' ? 0.9 : 0.5, // Difficulty: 20%
        (game.socialScore || 0.5) * 0.2 // Social score: 20%
      ],
      genres: game.genres || [],
      tags: game.tags || [],
      difficulty: game.difficulty === 'easy' ? 0.2 : game.difficulty === 'hard' ? 0.8 : 0.5,
      socialScore: game.socialScore || 0.5,
      estimatedPlaytime: game.estimatedPlaytime || 120
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i]
      normA += vectorA[i] * vectorA[i]
      normB += vectorB[i] * vectorB[i]
    }
    
    if (normA === 0 || normB === 0) return 0
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  /**
   * Combine multiple genre vectors
   */
  private combineGenreVectors(genres: GenreId[]): number[] {
    const vectorSize = Object.keys(GENRES).length
    const combined = new Array(vectorSize).fill(0)
    
    genres.forEach(genre => {
      const genreVector = this.genreVectors[genre]
      if (genreVector) {
        for (let i = 0; i < vectorSize; i++) {
          combined[i] += genreVector[i]
        }
      }
    })
    
    // Normalize
    const sum = combined.reduce((a, b) => a + b, 0)
    return sum > 0 ? combined.map(v => v / sum) : combined
  }

  /**
   * Create tag vector
   */
  private createTagVector(tags: string[]): number[] {
    // Simple tag encoding based on common gaming tags
    const tagFeatures = [
      'action', 'adventure', 'rpg', 'strategy', 'puzzle',
      'simulation', 'sports', 'racing', 'horror', 'comedy',
      'drama', 'fantasy', 'sci-fi', 'historical', 'modern',
      'multiplayer', 'singleplayer', 'coop', 'pvp', 'mmo',
      'indie', 'aaa', 'retro', 'modern', 'casual', 'hardcore'
    ]
    
    return tagFeatures.map(tag => tags.includes(tag) ? 1 : 0)
  }

  /**
   * Create playstyle vector
   */
  private createPlaystyleVector(playstyle: string): number[] {
    const playstyles = ['competitive', 'explorer', 'story-driven', 'creative', 'social', 'focused', 'energetic', 'relaxed']
    return playstyles.map(style => playstyle === style ? 1 : 0)
  }

  /**
   * Create preference vector
   */
  private createPreferenceVector(preferences: any): number[] {
    const features = [
      preferences.difficulty === 'easy' ? 0.2 : preferences.difficulty === 'hard' ? 0.8 : 0.5,
      preferences.social ? 0.8 : 0.2,
      preferences.story ? 0.8 : 0.2,
      preferences.action ? 0.8 : 0.2,
      preferences.creative ? 0.8 : 0.2
    ]
    
    return features
  }

  /**
   * Generate reasons for recommendations
   */
  private generateReasons(
    game: any,
    identity: PlayerIdentity,
    context: RecommendationContext,
    similarity: number
  ): string[] {
    const reasons: string[] = []
    
    if (similarity > 0.8) {
      reasons.push('Excellent match for your preferences')
    } else if (similarity > 0.6) {
      reasons.push('Good match for your gaming style')
    } else {
      reasons.push('Similar to games you\'ve enjoyed')
    }
    
    if (game.genres && identity.preferences?.favoriteGenre && game.genres.includes(identity.preferences.favoriteGenre)) {
      reasons.push('Matches your favorite genre')
    }
    
    if (context.currentMood && game.moodCompatibility && game.moodCompatibility[context.currentMood] > 0.7) {
      reasons.push('Perfect for your current mood')
    }
    
    return reasons
  }

  /**
   * Calculate mood match
   */
  private calculateMoodMatch(game: any, currentMood: MoodId): number {
    return game.moodCompatibility?.[currentMood] || 0.5
  }

  /**
   * Calculate playstyle match
   */
  private calculatePlaystyleMatch(game: any, identity: PlayerIdentity): number {
    return game.playstyleCompatibility?.[(identity.playstyle as any)?.primary?.id] || 0.5
  }

  /**
   * Calculate social match
   */
  private calculateSocialMatch(game: any, identity: PlayerIdentity): number {
    const gameSocial = game.socialScore || 0.5
    const userSocial = identity.preferences?.social ? 0.8 : 0.2
    return 1 - Math.abs(gameSocial - userSocial)
  }
}

// ============================================================================
// VECTOR SEARCH LAYER - Free Implementation
// ============================================================================

export interface VectorSearchResult {
  id: string
  score: number
  metadata: any
}

export class FreeVectorSearch {
  private vectors: Map<string, number[]> = new Map()
  private metadata: Map<string, any> = new Map()

  /**
   * Add vector to search index
   */
  addVector(id: string, vector: number[], metadata: any): void {
    this.vectors.set(id, vector)
    this.metadata.set(id, metadata)
  }

  /**
   * Search for similar vectors
   */
  search(queryVector: number[], topK: number = 10): VectorSearchResult[] {
    const results: VectorSearchResult[] = []
    
    for (const [id, vector] of this.vectors.entries()) {
      const similarity = this.calculateCosineSimilarity(queryVector, vector)
      
      if (similarity > 0.1) { // Minimum similarity threshold
        results.push({
          id,
          score: similarity,
          metadata: this.metadata.get(id)
        })
      }
    }
    
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
  }

  /**
   * Calculate cosine similarity
   */
  private calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i]
      normA += vectorA[i] * vectorA[i]
      normB += vectorB[i] * vectorB[i]
    }
    
    if (normA === 0 || normB === 0) return 0
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  /**
   * Remove vector from index
   */
  removeVector(id: string): void {
    this.vectors.delete(id)
    this.metadata.delete(id)
  }

  /**
   * Get vector count
   */
  size(): number {
    return this.vectors.size
  }

  /**
   * Clear all vectors
   */
  clear(): void {
    this.vectors.clear()
    this.metadata.clear()
  }
}

// ============================================================================
// MOOD → RECOMMENDATION MAPPING
// ============================================================================

export interface MoodRecommendationMapping {
  mood: MoodId
  recommendedGenres: GenreId[]
  recommendedTags: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  socialPreference: boolean
  reasoning: string
}

export class MoodRecommendationMapper {
  private mappings: Record<MoodId, MoodRecommendationMapping> = {
    chill: {
      mood: 'chill',
      recommendedGenres: ['puzzle', 'simulation', 'casual'],
      recommendedTags: ['relaxing', 'peaceful', 'low-stress'],
      difficulty: 'easy',
      socialPreference: false,
      reasoning: 'Chill mood calls for relaxing, low-stress gaming experiences'
    },
    competitive: {
      mood: 'competitive',
      recommendedGenres: ['action', 'strategy', 'sports'],
      recommendedTags: ['pvp', 'ranked', 'challenge'],
      difficulty: 'hard',
      socialPreference: true,
      reasoning: 'Competitive mood thrives on challenging, skill-based gameplay'
    },
    story: {
      mood: 'story',
      recommendedGenres: ['rpg', 'adventure', 'visual-novel'],
      recommendedTags: ['narrative', 'character-driven', 'cinematic'],
      difficulty: 'medium',
      socialPreference: false,
      reasoning: 'Story mood seeks immersive narratives and character development'
    },
    creative: {
      mood: 'creative',
      recommendedGenres: ['simulation', 'sandbox', 'puzzle'],
      recommendedTags: ['building', 'crafting', 'customization'],
      difficulty: 'medium',
      socialPreference: true,
      reasoning: 'Creative mood desires self-expression and building experiences'
    },
    social: {
      mood: 'social',
      recommendedGenres: ['mmo', 'party', 'co-op'],
      recommendedTags: ['multiplayer', 'team', 'community'],
      difficulty: 'medium',
      socialPreference: true,
      reasoning: 'Social mood seeks connection and shared experiences'
    },
    focused: {
      mood: 'focused',
      recommendedGenres: ['strategy', 'puzzle', 'simulation'],
      recommendedTags: ['deep', 'immersive', 'skill-based'],
      difficulty: 'hard',
      socialPreference: false,
      reasoning: 'Focused mood requires deep, concentration-demanding gameplay'
    },
    energetic: {
      mood: 'energetic',
      recommendedGenres: ['action', 'racing', 'sports'],
      recommendedTags: ['fast-paced', 'exciting', 'thrilling'],
      difficulty: 'medium',
      socialPreference: true,
      reasoning: 'Energetic mood craves exciting, high-action experiences'
    },
    exploratory: {
      mood: 'exploratory',
      recommendedGenres: ['adventure', 'open-world', 'rpg'],
      recommendedTags: ['discovery', 'exploration', 'wander'],
      difficulty: 'medium',
      socialPreference: false,
      reasoning: 'Exploratory mood seeks new worlds and discovery experiences'
    }
  }

  /**
   * Get mood-based recommendation mapping
   */
  getMapping(mood: MoodId): MoodRecommendationMapping {
    return this.mappings[mood] || this.mappings.chill
  }

  /**
   * Filter games based on mood mapping
   */
  filterGamesByMood(games: any[], mood: MoodId): any[] {
    const mapping = this.getMapping(mood)
    
    return games.filter(game => {
      // Check genre compatibility
      const genreMatch = game.genres?.some((genre: GenreId) => 
        mapping.recommendedGenres.includes(genre)
      )
      
      // Check tag compatibility
      const tagMatch = game.tags?.some((tag: string) => 
        mapping.recommendedTags.includes(tag)
      )
      
      // Check difficulty preference
      const difficultyMatch = game.difficulty === mapping.difficulty
      
      // Check social preference
      const socialMatch = (game.socialScore || 0.5) > 0.5 === mapping.socialPreference
      
      return genreMatch || tagMatch || difficultyMatch || socialMatch
    })
  }

  /**
   * Get mood-based game recommendations
   */
  getMoodRecommendations(games: any[], mood: MoodId, limit: number = 10): any[] {
    const filteredGames = this.filterGamesByMood(games, mood)
    return filteredGames.slice(0, limit)
  }
}

// ============================================================================
// SESSION ANALYSIS MODULE
// ============================================================================

export interface SessionAnalysis {
  totalSessions: number
  totalPlaytime: number
  averageSessionLength: number
  preferredGenres: Map<GenreId, number>
  moodPatterns: Map<MoodId, number>
  difficultyPreference: number
  socialPreference: number
  completionRate: number
  peakGamingTimes: number[]
  recommendations: string[]
}

export class SessionAnalyzer {
  private moodEngine: FreeMoodEngine
  private recommendationMapper: MoodRecommendationMapper

  constructor() {
    this.moodEngine = new FreeMoodEngine()
    this.recommendationMapper = new MoodRecommendationMapper()
  }

  /**
   * Analyze gaming sessions and provide insights
   */
  analyzeSessions(sessions: GameSession[]): SessionAnalysis {
    if (sessions.length === 0) {
      return this.createEmptyAnalysis()
    }

    const totalSessions = sessions.length
    const totalPlaytime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0)
    const averageSessionLength = totalPlaytime / totalSessions
    
    const preferredGenres = this.calculatePreferredGenres(sessions)
    const moodPatterns = this.calculateMoodPatterns(sessions)
    const difficultyPreference = this.calculateDifficultyPreference(sessions)
    const socialPreference = this.calculateSocialPreference(sessions)
    const completionRate = this.calculateCompletionRate(sessions)
    const peakGamingTimes = this.calculatePeakGamingTimes(sessions)
    
    const recommendations = this.generateRecommendations(
      preferredGenres,
      moodPatterns,
      difficultyPreference,
      socialPreference
    )

    return {
      totalSessions,
      totalPlaytime,
      averageSessionLength,
      preferredGenres,
      moodPatterns,
      difficultyPreference,
      socialPreference,
      completionRate,
      peakGamingTimes,
      recommendations
    }
  }

  /**
   * Create empty analysis for no data
   */
  private createEmptyAnalysis(): SessionAnalysis {
    return {
      totalSessions: 0,
      totalPlaytime: 0,
      averageSessionLength: 0,
      preferredGenres: new Map(),
      moodPatterns: new Map(),
      difficultyPreference: 0.5,
      socialPreference: 0.5,
      completionRate: 0,
      peakGamingTimes: [],
      recommendations: ['Start gaming to get personalized recommendations']
    }
  }

  /**
   * Calculate preferred genres from sessions
   */
  private calculatePreferredGenres(sessions: GameSession[]): Map<GenreId, number> {
    const genreCounts = new Map<GenreId, number>()
    
    sessions.forEach(session => {
      if (session.genre) {
        const current = genreCounts.get(session.genre) || 0
        genreCounts.set(session.genre, current + (session.duration || 0))
      }
    })
    
    return genreCounts
  }

  /**
   * Calculate mood patterns from sessions
   */
  private calculateMoodPatterns(sessions: GameSession[]): Map<MoodId, number> {
    const moodCounts = new Map<MoodId, number>()
    
    sessions.forEach(session => {
      const current = moodCounts.get(session.mood) || 0
      moodCounts.set(session.mood, current + (session.duration || 0))
    })
    
    return moodCounts
  }

  /**
   * Calculate difficulty preference
   */
  private calculateDifficultyPreference(sessions: GameSession[]): number {
    const difficulties = sessions.map(s => (s.difficulty || 0.5) as number)
    return difficulties.reduce((sum, difficulty) => sum + difficulty, 0) / difficulties.length
  }

  /**
   * Calculate social preference
   */
  private calculateSocialPreference(sessions: GameSession[]): number {
    const socialScores = sessions.map(s => (s.isMultiplayer ? 1 : 0) as number)
    return socialScores.reduce((sum: number, score: number) => (sum || 0) + (score || 0), 0) / socialScores.length
  }

  /**
   * Calculate completion rate
   */
  private calculateCompletionRate(sessions: GameSession[]): number {
    const completedSessions = sessions.filter(s => s.completed).length
    return completedSessions / sessions.length
  }

  /**
   * Calculate peak gaming times
   */
  private calculatePeakGamingTimes(sessions: GameSession[]): number[] {
    const hourCounts = new Array(24).fill(0)
    
    sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours()
      hourCounts[hour]++
    })
    
    // Return top 3 peak hours
    const sortedHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour)
    
    return sortedHours
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(
    preferredGenres: Map<GenreId, number>,
    moodPatterns: Map<MoodId, number>,
    difficultyPreference: number,
    socialPreference: number
  ): string[] {
    const recommendations: string[] = []
    
    // Genre-based recommendations
    const topGenre = [...preferredGenres.entries()]
      .sort((a, b) => b[1] - a[1])[0]
    
    if (topGenre && topGenre[0]) {
      const genreData = GENRES.find(g => g.id === topGenre[0])
      recommendations.push(`Explore more ${genreData?.name || 'Unknown'} games`)
    }
    
    // Mood-based recommendations
    const topMood = [...moodPatterns.entries()]
      .sort((a, b) => b[1] - a[1])[0]
    
    if (topMood && topMood[0]) {
      const mapping = this.recommendationMapper.getMapping(topMood[0])
      if (mapping) {
        recommendations.push(mapping.reasoning)
      }
    }
    
    // Difficulty recommendations
    if (difficultyPreference > 0.7) {
      recommendations.push('You seem to enjoy challenging games')
    } else if (difficultyPreference < 0.3) {
      recommendations.push('Try more relaxing games')
    }
    
    // Social recommendations
    if (socialPreference > 0.7) {
      recommendations.push('Consider multiplayer games for social engagement')
    } else if (socialPreference < 0.3) {
      recommendations.push('Single-player games might suit your style')
    }
    
    return recommendations
  }
}

// ============================================================================
// MAIN FREE AI ENGINE EXPORTS
// ============================================================================

export class FreeAIEngine {
  private moodEngine: FreeMoodEngine
  private recommendationEngine: FreeRecommendationEngine
  private vectorSearch: FreeVectorSearch
  private moodMapper: MoodRecommendationMapper
  private sessionAnalyzer: SessionAnalyzer

  constructor() {
    this.moodEngine = new FreeMoodEngine()
    this.recommendationEngine = new FreeRecommendationEngine()
    this.vectorSearch = new FreeVectorSearch()
    this.moodMapper = new MoodRecommendationMapper()
    this.sessionAnalyzer = new SessionAnalyzer()
  }

  /**
   * Analyze mood from sessions
   */
  analyzeMood(sessions: GameSession[]): MoodAnalysisResult {
    return this.moodEngine.analyzeMood(sessions)
  }

  /**
   * Get game recommendations
   */
  getRecommendations(
    identity: PlayerIdentity,
    context: RecommendationContext,
    availableGames: any[]
  ): RecommendationResult[] {
    return this.recommendationEngine.getRecommendations(identity, context, availableGames)
  }

  /**
   * Search for similar games
   */
  searchSimilarGames(gameVector: number[], topK: number = 10): VectorSearchResult[] {
    return this.vectorSearch.search(gameVector, topK)
  }

  /**
   * Get mood-based recommendations
   */
  getMoodRecommendations(games: any[], mood: MoodId, limit: number = 10): any[] {
    return this.moodMapper.getMoodRecommendations(games, mood, limit)
  }

  /**
   * Analyze gaming sessions
   */
  analyzeSessions(sessions: GameSession[]): SessionAnalysis {
    return this.sessionAnalyzer.analyzeSessions(sessions)
  }

  /**
   * Add game to vector search index
   */
  indexGame(id: string, vector: number[], metadata: any): void {
    this.vectorSearch.addVector(id, vector, metadata)
  }

  /**
   * Get mood mapping
   */
  getMoodMapping(mood: MoodId): MoodRecommendationMapping {
    return this.moodMapper.getMapping(mood)
  }
}
