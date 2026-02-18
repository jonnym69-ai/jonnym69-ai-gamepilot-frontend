import type { EnhancedMoodId } from '@gamepilot/static-data'
import type { Game } from '@gamepilot/types'

/**
 * Simple Mood-Persona Service (Fallback Implementation)
 * 
 * This is a temporary fallback service to provide basic mood-persona functionality
 * while the full identity-engine package build issues are resolved.
 */
export class SimpleMoodPersonaService {
  private moodHistory: Map<string, any[]> = new Map()
  private userProfiles: Map<string, any> = new Map()

  /**
   * Process a mood selection event
   */
  async processMoodSelection(userId: string, moodData: {
    primaryMood: EnhancedMoodId
    secondaryMood?: EnhancedMoodId
    intensity: number
    context: any
  }): Promise<any> {
    const event = {
      id: `mood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      primaryMood: moodData.primaryMood,
      secondaryMood: moodData.secondaryMood,
      intensity: moodData.intensity,
      timestamp: new Date(),
      context: moodData.context
    }

    // Store mood history
    if (!this.moodHistory.has(userId)) {
      this.moodHistory.set(userId, [])
    }
    this.moodHistory.get(userId)!.push(event)

    // Update user profile
    await this.updateUserProfile(userId, event)

    return event
  }

  /**
   * Process a user action
   */
  async processUserAction(userId: string, actionData: {
    type: string
    gameId: string
    gameTitle: string
    moodContext: any
    metadata: any
  }): Promise<any> {
    const action = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: actionData.type,
      gameId: actionData.gameId,
      gameTitle: actionData.gameTitle,
      moodContext: actionData.moodContext,
      metadata: actionData.metadata,
      timestamp: new Date()
    }

    // Store action in user profile
    const profile = this.getUserProfile(userId)
    if (!profile.actions) {
      profile.actions = []
    }
    profile.actions.push(action)

    return action
  }

  /**
   * Get mood suggestions for a user
   */
  async getMoodSuggestions(userId: string, context?: any): Promise<any[]> {
    const profile = this.getUserProfile(userId)
    const history = this.moodHistory.get(userId) || []

    // Simple mood suggestion logic based on history
    const moodCounts = new Map<string, number>()
    history.forEach(event => {
      moodCounts.set(event.primaryMood, (moodCounts.get(event.primaryMood) || 0) + 1)
    })

    // Sort by frequency and return top suggestions
    const suggestions = Array.from(moodCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([mood, count], index) => ({
        id: `suggestion_${index}`,
        mood: mood as EnhancedMoodId,
        confidence: Math.min(count / Math.max(history.length, 1), 0.9),
        reasons: [`Used ${count} time(s) in the past`],
        context: context || {}
      }))

    return suggestions
  }

  /**
   * Generate personalized recommendations
   */
  async generatePersonalizedRecommendations(
    userId: string,
    primaryMood: EnhancedMoodId,
    secondaryMood?: EnhancedMoodId,
    limit: number = 10
  ): Promise<any[]> {
    const profile = this.getUserProfile(userId)
    const availableGames = await this.getAvailableGames(userId)

    // Simple recommendation logic based on mood and user history
    const recommendations = availableGames
      .map(game => this.calculateRecommendationScore(game, primaryMood, secondaryMood, profile))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return recommendations
  }

  /**
   * Get user profile
   */
  getUserProfile(userId: string): any {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        userId,
        moodPreferences: {},
        playstylePreferences: {
          sessionLength: 'medium',
          difficulty: 'normal',
          socialPreference: 'solo',
          storyFocus: 0.5,
          graphicsFocus: 0.5,
          gameplayFocus: 0.5
        },
        actions: [],
        moodHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
    return this.userProfiles.get(userId)
  }

  /**
   * Update user profile based on mood selection
   */
  private async updateUserProfile(userId: string, event: any): Promise<void> {
    const profile = this.getUserProfile(userId)
    
    // Update mood preferences
    if (!profile.moodPreferences[event.primaryMood]) {
      profile.moodPreferences[event.primaryMood] = {
        count: 0,
        averageIntensity: 0,
        lastUsed: null,
        contexts: []
      }
    }

    const pref = profile.moodPreferences[event.primaryMood]
    pref.count++
    pref.averageIntensity = (pref.averageIntensity * (pref.count - 1) + event.intensity) / pref.count
    pref.lastUsed = event.timestamp
    pref.contexts.push(event.context)

    profile.updatedAt = new Date()
  }

  /**
   * Calculate recommendation score for a game
   */
  private calculateRecommendationScore(
    game: Game,
    primaryMood: EnhancedMoodId,
    secondaryMood: EnhancedMoodId | undefined,
    profile: any
  ): any {
    // Simple scoring algorithm
    let score = 50 // Base score

    // Mood-based scoring
    const moodScore = this.getMoodGameScore(game, primaryMood)
    score += moodScore * 0.4

    if (secondaryMood) {
      const secondaryScore = this.getMoodGameScore(game, secondaryMood)
      score += secondaryScore * 0.2
    }

    // User history scoring
    const historyScore = this.getHistoryScore(game, profile)
    score += historyScore * 0.3

    // Random factor for variety
    score += Math.random() * 10

    return {
      gameId: game.id,
      title: game.title,
      score: Math.min(score, 100),
      moodMatch: moodScore,
      historyMatch: historyScore,
      reasons: this.generateRecommendationReasons(game, primaryMood, secondaryMood, profile),
      estimatedPlaytime: this.estimatePlaytime(game, profile),
      difficulty: this.recommendDifficulty(game, profile),
      tags: game.tags as string[] || []
    }
  }

  /**
   * Get mood-game compatibility score
   */
  private getMoodGameScore(game: Game, mood: EnhancedMoodId): number {
    // Simple mood-game mapping
    const moodGameMap: Record<string, Record<string, number>> = {
      energetic: {
        action: 90,
        adventure: 80,
        racing: 85,
        sports: 85,
        fps: 90
      },
      relaxed: {
        puzzle: 85,
        simulation: 80,
        strategy: 75,
        casual: 90,
        indie: 80
      },
      focused: {
        strategy: 90,
        puzzle: 85,
        rpg: 80,
        simulation: 75,
        turn_based: 90
      },
      social: {
        multiplayer: 90,
        co_op: 85,
        party: 90,
        mmo: 85,
        social_deduction: 80
      },
      competitive: {
        fps: 90,
        fighting: 85,
        moba: 90,
        sports: 85,
        racing: 80
      },
      creative: {
        sandbox: 90,
        building: 85,
        simulation: 80,
        rpg: 75,
        indie: 85
      },
      adventurous: {
        adventure: 90,
        open_world: 85,
        exploration: 90,
        rpg: 80,
        survival: 75
      },
      strategic: {
        strategy: 90,
        turn_based: 85,
        rts: 90,
        tactics: 85,
        puzzle: 80
      }
    }

    const gameGenres = game.genres?.map(g => g.name) || []
    const moodScores = moodGameMap[mood] || {}
    
    let maxScore = 0
    gameGenres.forEach(genre => {
      const score = moodScores[genre.toLowerCase()] || 50
      maxScore = Math.max(maxScore, score)
    })

    return maxScore
  }

  /**
   * Get history-based score
   */
  private getHistoryScore(game: Game, profile: any): number {
    if (!profile.actions || profile.actions.length === 0) {
      return 50 // Neutral score for new users
    }

    // Check if user has played similar games
    const similarGames = profile.actions.filter((action: any) => {
      if (action.gameId === game.id) return true
      
      // Simple genre similarity check
      const gameGenres = game.genres?.map(g => g.name) || []
      const actionGame = this.getGameById(action.gameId)
      if (actionGame) {
        const actionGenres = actionGame.genres?.map(g => g.name) || []
        return gameGenres.some(genre => actionGenres.includes(genre))
      }
      return false
    })

    if (similarGames.length > 0) {
      return 75 + Math.random() * 15 // Boost for similar games
    }

    return 40 + Math.random() * 20 // Slightly lower for completely new games
  }

  /**
   * Generate recommendation reasons
   */
  private generateRecommendationReasons(
    game: Game,
    primaryMood: EnhancedMoodId,
    secondaryMood: EnhancedMoodId | undefined,
    profile: any
  ): string[] {
    const reasons = []
    
    reasons.push(`Matches your ${primaryMood} mood`)
    
    if (secondaryMood) {
      reasons.push(`Also fits your ${secondaryMood} preferences`)
    }

    const gameGenres = game.genres?.map(g => g.name) || []
    if (gameGenres.length > 0) {
      reasons.push(`${gameGenres[0]} genre aligns with your interests`)
    }

    // Add personalized reasons based on history
    if (profile.actions && profile.actions.length > 0) {
      const similarGames = profile.actions.filter((action: any) => {
        const actionGame = this.getGameById(action.gameId)
        if (actionGame) {
          const actionGenres = actionGame.genres?.map(g => g.name) || []
          return gameGenres.some(genre => actionGenres.includes(genre))
        }
        return false
      })

      if (similarGames.length > 0) {
        reasons.push(`Similar to games you've enjoyed`)
      }
    }

    return reasons.slice(0, 3) // Limit to 3 reasons
  }

  /**
   * Estimate playtime
   */
  private estimatePlaytime(game: Game, profile: any): number {
    // Simple playtime estimation based on game type and user preferences
    const baseTime = 60 // 60 minutes base
    
    const gameGenres = game.genres?.map(g => g.name) || []
    if (gameGenres.includes('casual') || gameGenres.includes('puzzle')) {
      return baseTime * 0.5
    }
    if (gameGenres.includes('rpg') || gameGenres.includes('open_world')) {
      return baseTime * 2
    }
    
    return baseTime
  }

  /**
   * Recommend difficulty
   */
  private recommendDifficulty(game: Game, profile: any): string {
    // Use user's preferred difficulty or make a recommendation
    if (profile.playstylePreferences && profile.playstylePreferences.difficulty) {
      return profile.playstylePreferences.difficulty
    }
    
    // Simple difficulty recommendation based on game genres
    const gameGenres = game.genres?.map(g => g.name) || []
    if (gameGenres.includes('casual') || gameGenres.includes('puzzle')) {
      return 'casual'
    }
    if (gameGenres.includes('strategy') || gameGenres.includes('rpg')) {
      return 'normal'
    }
    
    return 'normal'
  }

  /**
   * Get available games for a user
   */
  private async getAvailableGames(userId: string): Promise<Game[]> {
    // This would typically fetch from the database
    // For now, return empty array - the actual games will be provided by the caller
    return []
  }

  /**
   * Get game by ID (placeholder)
   */
  private getGameById(gameId: string): Game | null {
    // This would typically fetch from the database
    return null
  }

  /**
   * Get mood statistics for a user
   */
  getMoodStatistics(userId: string): any {
    const history = this.moodHistory.get(userId) || []
    const profile = this.getUserProfile(userId)

    const moodCounts = new Map<string, number>()
    const intensityByMood = new Map<string, number[]>()

    history.forEach(event => {
      moodCounts.set(event.primaryMood, (moodCounts.get(event.primaryMood) || 0) + 1)
      
      if (!intensityByMood.has(event.primaryMood)) {
        intensityByMood.set(event.primaryMood, [])
      }
      intensityByMood.get(event.primaryMood)!.push(event.intensity)
    })

    const statistics = {
      totalMoodSelections: history.length,
      uniqueMoods: moodCounts.size,
      moodDistribution: Object.fromEntries(moodCounts),
      averageIntensities: {} as Record<string, number>,
      mostUsedMood: null as string | null,
      leastUsedMood: null as string | null,
      recentMoods: history.slice(-10).map(event => ({
        mood: event.primaryMood,
        intensity: event.intensity,
        timestamp: event.timestamp
      }))
    }

    // Calculate average intensities
    intensityByMood.forEach((intensities, mood) => {
      const avg = intensities.reduce((sum, intensity) => sum + intensity, 0) / intensities.length
      statistics.averageIntensities[mood] = Math.round(avg * 100) / 100
    })

    // Find most and least used moods
    if (moodCounts.size > 0) {
      const sorted = Array.from(moodCounts.entries()).sort((a, b) => b[1] - a[1])
      statistics.mostUsedMood = sorted[0][0]
      statistics.leastUsedMood = sorted[sorted.length - 1][0]
    }

    return statistics
  }

  /**
   * Get user action statistics
   */
  getActionStatistics(userId: string): any {
    const profile = this.getUserProfile(userId)
    const actions = profile.actions || []

    const actionCounts = new Map<string, number>()
    const gameCounts = new Map<string, number>()

    actions.forEach((action: any) => {
      actionCounts.set(action.type, (actionCounts.get(action.type) || 0) + 1)
      gameCounts.set(action.gameId, (gameCounts.get(action.gameId) || 0) + 1)
    })

    return {
      totalActions: actions.length,
      actionDistribution: Object.fromEntries(actionCounts),
      mostPlayedGame: null as string | null,
      uniqueGamesPlayed: gameCounts.size,
      recentActions: actions.slice(-10).map((action: any) => ({
        type: action.type,
        gameTitle: action.gameTitle,
        timestamp: action.timestamp
      }))
    }
  }
}
