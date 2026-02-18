import type { PlayerIdentity, GameSession, IdentityComputationOptions } from './types'
import { MoodModel } from './moodModel'
import { PlaystyleModel } from './playstyleModel'
import { RecommendationEngine } from './recommendations'
import { GENRES, type GenreId } from '@gamepilot/static-data'

export class IdentityEngine {
  private moodModel: any // Simple object for mood operations
  private playstyleModel: PlaystyleModel
  private recommendationEngine: RecommendationEngine

  constructor() {
    this.moodModel = {} // Simple placeholder
    this.playstyleModel = new PlaystyleModel()
    this.recommendationEngine = new RecommendationEngine()
  }

  /**
   * Compute player identity from gaming history
   */
  computeIdentity(
    userId: string,
    sessions: GameSession[],
    options: Partial<IdentityComputationOptions> = {}
  ): PlayerIdentity {
    const opts: IdentityComputationOptions = {
      recentSessionWeight: 0.7,
      moodDecayDays: 30,
      minSessionsForComputation: 5,
      includeNegativeSessions: true,
      ...options
    }

    // Filter sessions based on options
    const relevantSessions = this.filterRelevantSessions(sessions, opts)

    if (relevantSessions.length < opts.minSessionsForComputation) {
      return this.createDefaultIdentity(userId, sessions)
    }

    // Compute mood preferences
    const moods = this.computeMoodPreferences(relevantSessions, opts)

    // Compute playstyle
    const playstyle = this.playstyleModel.computePlaystyle(relevantSessions)

    // Compute genre affinities
    const genreAffinities = this.computeGenreAffinities(relevantSessions)

    // Compute current mood (simplified)
    const computedMood = 'neutral' // Simple fallback

    return {
      id: `identity-${userId}`,
      userId,
      moods,
      playstyle,
      sessions: relevantSessions,
      genreAffinities,
      computedMood,
      lastUpdated: new Date(),
      version: '1.0.0'
    }
  }

  /**
   * Update identity with new gaming session
   */
  updateIdentity(
    identity: PlayerIdentity,
    newSession: GameSession
  ): PlayerIdentity {
    // Add new session
    const updatedSessions = [...identity.sessions, newSession]

    // Update mood preferences (simplified)
    const updatedMoods = identity.moods // Simple fallback

    // Recompute playstyle (could be optimized to incremental updates)
    const updatedPlaystyle = this.playstyleModel.computePlaystyle(updatedSessions)

    // Recompute genre affinities
    const updatedGenreAffinities = this.computeGenreAffinities(updatedSessions)

    // Update computed mood (simplified)
    const computedMood = 'neutral' // Simple fallback

    return {
      ...identity,
      moods: updatedMoods,
      playstyle: updatedPlaystyle,
      sessions: updatedSessions,
      genreAffinities: updatedGenreAffinities,
      computedMood,
      lastUpdated: new Date()
    }
  }

  /**
   * Get current mood from identity
   */
  getCurrentMood(identity: PlayerIdentity): string | undefined {
    return identity.computedMood
  }

  /**
   * Update mood preference
   */
  updateMoodPreference(
    identity: PlayerIdentity,
    moodId: string,
    preference: number
  ): PlayerIdentity {
    const updatedMoods = identity.moods.map(mood =>
      mood.id === moodId ? { ...mood, preference } : mood
    )

    return {
      ...identity,
      moods: updatedMoods,
      lastUpdated: new Date()
    }
  }

  /**
   * Get playstyle from identity
   */
  getPlaystyle(identity: PlayerIdentity) {
    return identity.playstyle
  }

  /**
   * Get recommendations for identity
   */
  getRecommendations(
    identity: PlayerIdentity,
    context: any,
    availableGames: any[]
  ) {
    return this.recommendationEngine.getRecommendations(identity, context, availableGames)
  }

  /**
   * Filter sessions based on computation options
   */
  private filterRelevantSessions(
    sessions: GameSession[],
    options: IdentityComputationOptions
  ): GameSession[] {
    let filtered = [...sessions]

    // Filter by recency
    if (options.moodDecayDays) {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - options.moodDecayDays)
      
      filtered = filtered.filter(session => 
        new Date(session.startTime) >= cutoffDate
      )
    }

    // Filter out negative sessions if option is disabled
    if (!options.includeNegativeSessions) {
      filtered = filtered.filter(session => 
        session.rating && session.rating >= 2
      )
    }

    // Sort by recency and limit weight
    filtered.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )

    return filtered
  }

  /**
   * Compute mood preferences from sessions
   */
  private computeMoodPreferences(sessions: GameSession[], opts: IdentityComputationOptions): any {
    // Simplified mood computation
    return {
      currentMood: 'neutral',
      moodHistory: [],
      moodPreferences: {}
    }
  }

  /**
   * Compute genre affinities from sessions
   */
  private computeGenreAffinities(sessions: GameSession[]): Record<string, number> {
    const genreCounts: Record<string, number> = {}
    const genreRatings: Record<string, number[]> = {}

    // Count sessions and ratings per genre
    sessions.forEach(session => {
      genreCounts[session.genre] = (genreCounts[session.genre] || 0) + 1
      
      if (session.rating) {
        if (!genreRatings[session.genre]) {
          genreRatings[session.genre] = []
        }
        genreRatings[session.genre].push(session.rating)
      }
    })

    // Calculate affinity scores
    const affinities: Record<string, number> = {}
    const totalSessions = sessions.length

    Object.entries(genreCounts).forEach(([genre, count]) => {
      let affinity = (count / totalSessions) * 100 // Base affinity from play frequency

      // Boost affinity based on ratings
      const ratings = genreRatings[genre]
      if (ratings && ratings.length > 0) {
        const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        affinity += (avgRating - 3) * 10 // Rating adjustment
      }

      affinities[genre] = Math.max(0, Math.min(100, affinity))
    })

    return affinities
  }

  /**
   * Create default identity for new users
   */
  private createDefaultIdentity(userId: string, sessions: GameSession[]): PlayerIdentity {
    return {
      id: `identity-${userId}`,
      userId,
      moods: [],
      playstyle: this.playstyleModel.computePlaystyle([]),
      sessions,
      genreAffinities: {},
      lastUpdated: new Date(),
      version: '1.0.0'
    }
  }
}
