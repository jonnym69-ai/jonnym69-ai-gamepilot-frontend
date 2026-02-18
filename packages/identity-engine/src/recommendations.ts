import type { 
  PlayerIdentity, 
  GameRecommendation, 
  RecommendationContext,
  GameSession 
} from './types'
import { MOODS, GENRES, type MoodId, type GenreId } from '@gamepilot/static-data'

export class RecommendationEngine {
  /**
   * Get personalized game recommendations
   */
  getRecommendations(
    identity: PlayerIdentity,
    context: RecommendationContext,
    availableGames: any[] // Game library - will be typed when integrations are added
  ): GameRecommendation[] {
    const recommendations: GameRecommendation[] = []

    availableGames.forEach(game => {
      const score = this.calculateRecommendationScore(game, identity, context)
      
      if (score > 20) { // Minimum threshold
        recommendations.push({
          gameId: game.id,
          name: game.name,
          genre: game.genre,
          score,
          reasons: this.generateReasons(game, identity, context, score),
          moodMatch: this.calculateMoodMatch(game, identity, context),
          playstyleMatch: this.calculatePlaystyleMatch(game, identity),
          socialMatch: this.calculateSocialMatch(game, identity, context),
          estimatedPlaytime: this.estimatePlaytime(game, identity),
          difficulty: game.difficulty || 'medium',
          tags: game.tags || []
        })
      }
    })

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 20) // Return top 20
  }

  /**
   * Calculate overall recommendation score
   */
  private calculateRecommendationScore(
    game: any,
    identity: PlayerIdentity,
    context: RecommendationContext
  ): number {
    let score = 50 // Base score

    // Mood matching (30% weight)
    if (context.currentMood) {
      const moodScore = this.calculateMoodMatch(game, identity, context)
      score += (moodScore - 50) * 0.3
    }

    // Playstyle matching (25% weight)
    const playstyleScore = this.calculatePlaystyleMatch(game, identity)
    score += (playstyleScore - 50) * 0.25

    // Genre affinity (20% weight)
    const genreScore = this.calculateGenreMatch(game, identity)
    score += (genreScore - 50) * 0.2

    // Social context matching (15% weight)
    if (context.socialContext) {
      const socialScore = this.calculateSocialMatch(game, identity, context)
      score += (socialScore - 50) * 0.15
    }

    // Time constraints (10% weight)
    if (context.timeAvailable) {
      const timeScore = this.calculateTimeMatch(game, context.timeAvailable)
      score += (timeScore - 50) * 0.1
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Calculate how well game matches current mood
   */
  private calculateMoodMatch(
    game: any,
    identity: PlayerIdentity,
    context: RecommendationContext
  ): number {
    if (!context.currentMood) return 50

    const moodData = MOODS.find(m => m.id === context.currentMood)
    if (!moodData) return 50

    // Check if game genre is associated with current mood
    const genreMatch = moodData.associatedGenres.includes(game.genre)
    if (genreMatch) {
      return 85
    }

    // Check game tags for mood compatibility
    const moodTags = this.getMoodTags(context.currentMood)
    const matchingTags = game.tags?.filter((tag: string) => moodTags.includes(tag)) || []
    
    if (matchingTags.length > 0) {
      return 60 + (matchingTags.length * 5)
    }

    return 30
  }

  /**
   * Calculate how well game matches user's playstyle
   */
  private calculatePlaystyleMatch(game: any, identity: PlayerIdentity): number {
    const playstyle = identity.playstyle
    let score = 50

    // Primary playstyle traits
    playstyle.primary.traits.forEach(trait => {
      if (this.gameMatchesTrait(game, trait)) {
        score += 8
      }
    })

    // Secondary playstyle traits
    playstyle.secondary?.traits.forEach(trait => {
      if (this.gameMatchesTrait(game, trait)) {
        score += 4
      }
    })

    // Session length preference
    const estimatedTime = this.estimatePlaytime(game, identity)
    const preferredLength = playstyle.preferences.sessionLength
    
    if (
      (preferredLength === 'short' && estimatedTime <= 60) ||
      (preferredLength === 'medium' && estimatedTime >= 45 && estimatedTime <= 120) ||
      (preferredLength === 'long' && estimatedTime >= 90)
    ) {
      score += 10
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Calculate genre affinity score
   */
  private calculateGenreMatch(game: any, identity: PlayerIdentity): number {
    const affinity = identity.genreAffinities[game.genre] || 0
    return Math.max(0, Math.min(100, affinity))
  }

  /**
   * Calculate social context match
   */
  private calculateSocialMatch(
    game: any,
    identity: PlayerIdentity,
    context: RecommendationContext
  ): number {
    if (!context.socialContext) return 50

    const gameSocial = game.tags?.includes('multiplayer') ? 'multiplayer' : 'singleplayer'
    const userPreference = identity.playstyle.preferences.socialPreference

    if (context.socialContext === 'solo' && gameSocial === 'singleplayer') {
      return 90
    }

    if (context.socialContext === 'co-op' && gameSocial === 'multiplayer') {
      return 85
    }

    if (context.socialContext === 'pvp' && game.tags?.includes('competitive')) {
      return 85
    }

    return 30
  }

  /**
   * Calculate time availability match
   */
  private calculateTimeMatch(game: any, timeAvailable: number): number {
    const estimatedTime = this.estimatePlaytime(game, {} as PlayerIdentity)
    
    if (estimatedTime <= timeAvailable * 0.8) {
      return 85 // Game fits comfortably
    } else if (estimatedTime <= timeAvailable) {
      return 70 // Game fits but might be tight
    } else {
      return 30 // Game too long for available time
    }
  }

  /**
   * Generate reasons for recommendation
   */
  private generateReasons(
    game: any,
    identity: PlayerIdentity,
    context: RecommendationContext,
    score: number
  ): string[] {
    const reasons: string[] = []

    if (context.currentMood) {
      const moodData = MOODS.find(m => m.id === context.currentMood)
      if (moodData?.associatedGenres.includes(game.genre)) {
        reasons.push(`Perfect for your ${moodData.name} mood`)
      }
    }

    if (identity.genreAffinities[game.genre] > 70) {
      reasons.push(`You love ${game.genre} games`)
    }

    if (game.tags?.includes('story') && identity.playstyle.preferences.storyFocus > 70) {
      reasons.push('Rich storytelling experience')
    }

    if (game.tags?.includes('multiplayer') && identity.playstyle.preferences.socialPreference !== 'solo') {
      reasons.push('Great for social gaming')
    }

    if (score > 80) {
      reasons.push('Highly personalized match')
    }

    return reasons.slice(0, 3) // Max 3 reasons
  }

  /**
   * Estimate playtime for a game based on user patterns
   */
  private estimatePlaytime(game: any, identity: PlayerIdentity): number {
    // Base estimate from game data
    let baseTime = game.averagePlaytime || 60 // Default 1 hour

    // Adjust based on user's session length preference
    const preference = identity.playstyle.preferences.sessionLength
    if (preference === 'short') baseTime *= 0.7
    if (preference === 'long') baseTime *= 1.3

    // Adjust based on user's historical data for this genre
    const genreSessions = identity.sessions.filter(s => s.genre === game.genre)
    if (genreSessions.length > 0) {
      const avgUserTime = genreSessions.reduce((sum, s) => sum + (s.duration || 60), 0) / genreSessions.length
      baseTime = (baseTime + avgUserTime) / 2 // Weighted average
    }

    return Math.round(baseTime)
  }

  /**
   * Get tags associated with a mood
   */
  private getMoodTags(moodId: MoodId): string[] {
    const moodTagMap: Record<MoodId, string[]> = {
      chill: ['relaxing', 'casual', 'peaceful', 'cozy'],
      competitive: ['competitive', 'challenging', 'pvp', 'skill-based'],
      story: ['story', 'narrative', 'rpg', 'adventure'],
      creative: ['creative', 'building', 'sandbox', 'customization'],
      social: ['multiplayer', 'co-op', 'social', 'community'],
      focused: ['strategic', 'tactical', 'puzzle', 'thinking'],
      energetic: ['action', 'fast-paced', 'intense', 'exciting'],
      exploratory: ['exploration', 'open-world', 'discovery', 'adventure']
    }

    return moodTagMap[moodId] || []
  }

  /**
   * Check if game matches a specific trait
   */
  private gameMatchesTrait(game: any, trait: string): boolean {
    const traitGameMap: Record<string, string[]> = {
      'goal-oriented': ['achievements', 'progression', 'goals'],
      'curious': ['exploration', 'discovery', 'secrets'],
      'cooperative': ['co-op', 'multiplayer', 'team'],
      'competitive': ['pvp', 'competitive', 'ranked'],
      'imaginative': ['creative', 'building', 'sandbox'],
      'analytical': ['strategy', 'tactical', 'puzzle'],
      'relaxed': ['casual', 'relaxing', 'peaceful'],
      'dedicated': ['challenging', 'hardcore', 'grinding']
    }

    const gameTags = traitGameMap[trait] || []
    return gameTags.some(tag => game.tags?.includes(tag))
  }
}
