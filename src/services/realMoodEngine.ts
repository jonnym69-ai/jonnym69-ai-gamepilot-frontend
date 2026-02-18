import type { Game } from '@gamepilot/types'

export interface SteamMoodProfile {
  primaryMood: string
  moodScores: Record<string, number>
  genreDistribution: Record<string, number>
  playtimeAnalysis: {
    totalHours: number
    averageSession: number
    favoriteGenres: string[]
    gamingPatterns: string[]
  }
  personalityTraits: {
    competitive: number
    social: number
    creative: number
    exploratory: number
    focused: number
    storyDriven: number
    chill: number
    energetic: number
  }
  lastComputed: Date
}

export class RealMoodEngine {
  // Genre to mood mappings
  private static readonly GENRE_MOOD_MAP: Record<string, string[]> = {
    'action': ['energetic', 'competitive', 'focused'],
    'adventure': ['exploratory', 'storyDriven', 'chill'],
    'rpg': ['storyDriven', 'focused', 'exploratory'],
    'strategy': ['focused', 'competitive', 'creative'],
    'puzzle': ['focused', 'creative', 'chill'],
    'simulation': ['creative', 'chill', 'exploratory'],
    'sports': ['energetic', 'competitive', 'social'],
    'racing': ['energetic', 'competitive', 'focused'],
    'shooter': ['competitive', 'energetic', 'focused'],
    'platformer': ['energetic', 'focused', 'exploratory'],
    'fighting': ['competitive', 'energetic', 'focused'],
    'mmo': ['social', 'exploratory', 'competitive'],
    'casual': ['chill', 'creative', 'social'],
    'indie': ['creative', 'exploratory', 'chill'],
    'horror': ['focused', 'storyDriven', 'chill'],
    'stealth': ['focused', 'exploratory', 'competitive'],
    'survival': ['exploratory', 'focused', 'creative'],
    'music': ['creative', 'chill', 'energetic'],
    'party': ['social', 'energetic', 'chill'],
    'board': ['social', 'focused', 'competitive'],
    'card': ['focused', 'competitive', 'creative']
  }

  // Tag to mood mappings
  private static readonly TAG_MOOD_MAP: Record<string, string[]> = {
    'multiplayer': ['social', 'competitive'],
    'single-player': ['storyDriven', 'focused', 'exploratory'],
    'co-op': ['social', 'chill', 'competitive'],
    'achievements': ['competitive', 'focused'],
    'trading': ['creative', 'social'],
    'free-to-play': ['social', 'chill'],
    'action': ['energetic', 'competitive'],
    'adventure': ['exploratory', 'storyDriven'],
    'rpg': ['storyDriven', 'focused'],
    'strategy': ['focused', 'competitive'],
    'simulation': ['creative', 'chill'],
    'sports': ['energetic', 'competitive'],
    'racing': ['energetic', 'competitive'],
    'puzzle': ['focused', 'creative'],
    'horror': ['focused', 'storyDriven'],
    'survival': ['exploratory', 'focused']
  }

  /**
   * Compute mood profile from Steam library data
   */
  static computeMoodProfile(games: Game[]): SteamMoodProfile {
    if (!games || games.length === 0) {
      return this.getDefaultProfile()
    }

    // Analyze genre distribution
    const genreDistribution = this.analyzeGenreDistribution(games)
    
    // Analyze playtime patterns
    const playtimeAnalysis = this.analyzePlaytime(games)
    
    // Compute mood scores from genres and tags
    const moodScores = this.computeMoodScores(games, genreDistribution)
    
    // Compute personality traits
    const personalityTraits = this.computePersonalityTraits(moodScores, playtimeAnalysis)
    
    // Determine primary mood
    const primaryMood = Object.entries(moodScores).reduce((a, b) => 
      moodScores[a[0]] > moodScores[b[0]] ? a : b
    )[0]

    return {
      primaryMood,
      moodScores,
      genreDistribution,
      playtimeAnalysis,
      personalityTraits,
      lastComputed: new Date()
    }
  }

  /**
   * Analyze genre distribution from game library
   */
  private static analyzeGenreDistribution(games: Game[]): Record<string, number> {
    const genreCount: Record<string, number> = {}
    let totalGenres = 0

    games.forEach(game => {
      game.genres?.forEach(genre => {
        const genreName = genre.name.toLowerCase()
        genreCount[genreName] = (genreCount[genreName] || 0) + 1
        totalGenres++
      })
    })

    // Convert to percentages
    const distribution: Record<string, number> = {}
    Object.entries(genreCount).forEach(([genre, count]) => {
      distribution[genre] = totalGenres > 0 ? count / totalGenres : 0
    })

    return distribution
  }

  /**
   * Analyze playtime patterns
   */
  private static analyzePlaytime(games: Game[]): SteamMoodProfile['playtimeAnalysis'] {
    const totalHours = games.reduce((sum, game) => sum + (game.hoursPlayed || 0), 0)
    const playedGames = games.filter(game => (game.hoursPlayed || 0) > 0)
    
    const averageSession = playedGames.length > 0 
      ? totalHours / playedGames.length 
      : 0

    // Determine favorite genres based on playtime
    const genrePlaytime: Record<string, number> = {}
    games.forEach(game => {
      const playtime = game.hoursPlayed || 0
      if (playtime > 0) {
        game.genres?.forEach(genre => {
          const genreName = genre.name.toLowerCase()
          genrePlaytime[genreName] = (genrePlaytime[genreName] || 0) + playtime
        })
      }
    })

    const favoriteGenres = Object.entries(genrePlaytime)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre)

    // Analyze gaming patterns
    const gamingPatterns = this.identifyGamingPatterns(games, totalHours, averageSession)

    return {
      totalHours,
      averageSession,
      favoriteGenres,
      gamingPatterns
    }
  }

  /**
   * Identify gaming patterns from playtime data
   */
  private static identifyGamingPatterns(games: Game[], totalHours: number, averageSession: number): string[] {
    const patterns: string[] = []

    if (totalHours > 1000) {
      patterns.push('hardcore-gamer')
    } else if (totalHours > 500) {
      patterns.push('regular-gamer')
    } else if (totalHours > 100) {
      patterns.push('casual-gamer')
    } else {
      patterns.push('new-gamer')
    }

    if (averageSession > 10) {
      patterns.push('long-sessions')
    } else if (averageSession < 2) {
      patterns.push('short-sessions')
    } else {
      patterns.push('moderate-sessions')
    }

    const diverseGenres = new Set(
      games.flatMap(game => game.genres?.map(g => g.name.toLowerCase()) || [])
    ).size

    if (diverseGenres > 10) {
      patterns.push('genre-explorer')
    } else if (diverseGenres < 5) {
      patterns.push('genre-specialist')
    }

    return patterns
  }

  /**
   * Compute mood scores from games and genres
   */
  private static computeMoodScores(
    games: Game[], 
    _genreDistribution: Record<string, number>
  ): Record<string, number> {
    const moodScores: Record<string, number> = {
      competitive: 0,
      social: 0,
      creative: 0,
      exploratory: 0,
      focused: 0,
      storyDriven: 0,
      chill: 0,
      energetic: 0
    }

    // Weight by playtime and genre distribution
    games.forEach(game => {
      const playtimeWeight = Math.min((game.hoursPlayed || 0) / 50, 1) // Cap at 50 hours
      const genreWeight = 1 / (game.genres?.length || 1)

      // Contribuções from genres
      game.genres?.forEach(genre => {
        const genreName = genre.name.toLowerCase()
        const moods = this.GENRE_MOOD_MAP[genreName] || []
        const weight = playtimeWeight * genreWeight

        moods.forEach(mood => {
          moodScores[mood] = (moodScores[mood] || 0) + weight
        })
      })

      // Contributions from tags
      game.tags?.forEach(tag => {
        const tagName = tag.toLowerCase()
        const moods = this.TAG_MOOD_MAP[tagName] || []
        const weight = playtimeWeight * 0.5 // Tags have less weight than genres

        moods.forEach(mood => {
          moodScores[mood] = (moodScores[mood] || 0) + weight
        })
      })
    })

    // Normalize scores to 0-1 range
    const maxScore = Math.max(...Object.values(moodScores))
    if (maxScore > 0) {
      Object.keys(moodScores).forEach(mood => {
        moodScores[mood] = moodScores[mood] / maxScore
      })
    }

    return moodScores
  }

  /**
   * Compute personality traits from mood scores and playtime
   */
  private static computePersonalityTraits(
    moodScores: Record<string, number>,
    playtimeAnalysis: SteamMoodProfile['playtimeAnalysis']
  ): SteamMoodProfile['personalityTraits'] {
    const baseTraits = { ...moodScores }

    // Adjust based on playtime patterns
    if (playtimeAnalysis.gamingPatterns.includes('hardcore-gamer')) {
      baseTraits.competitive *= 1.2
      baseTraits.focused *= 1.1
    }

    if (playtimeAnalysis.gamingPatterns.includes('genre-explorer')) {
      baseTraits.exploratory *= 1.2
      baseTraits.creative *= 1.1
    }

    if (playtimeAnalysis.gamingPatterns.includes('social-gamer')) {
      baseTraits.social *= 1.3
    }

    // Normalize to 0-1 range
    const maxTrait = Math.max(...Object.values(baseTraits))
    if (maxTrait > 1) {
      Object.keys(baseTraits).forEach(trait => {
        baseTraits[trait as keyof typeof baseTraits] /= maxTrait
      })
    }

    return baseTraits as SteamMoodProfile['personalityTraits']
  }

  /**
   * Get default mood profile for empty libraries
   */
  private static getDefaultProfile(): SteamMoodProfile {
    return {
      primaryMood: 'chill',
      moodScores: {
        competitive: 0.3,
        social: 0.4,
        creative: 0.5,
        exploratory: 0.6,
        focused: 0.4,
        storyDriven: 0.5,
        chill: 0.8,
        energetic: 0.3
      },
      genreDistribution: {},
      playtimeAnalysis: {
        totalHours: 0,
        averageSession: 0,
        favoriteGenres: [],
        gamingPatterns: ['new-gamer']
      },
      personalityTraits: {
        competitive: 0.3,
        social: 0.4,
        creative: 0.5,
        exploratory: 0.6,
        focused: 0.4,
        storyDriven: 0.5,
        chill: 0.8,
        energetic: 0.3
      },
      lastComputed: new Date()
    }
  }

  /**
   * Get mood-based game recommendations
   */
  static getMoodRecommendations(
    games: Game[], 
    moodProfile: SteamMoodProfile,
    count: number = 10
  ): Game[] {
    const unplayedGames = games.filter(game => 
      (game.hoursPlayed || 0) < 2 // Less than 2 hours = essentially unplayed
    )

    // Score games based on mood alignment
    const scoredGames = unplayedGames.map(game => {
      let score = 0

      // Genre alignment with primary mood
      game.genres?.forEach(genre => {
        const genreName = genre.name.toLowerCase()
        const moods = this.GENRE_MOOD_MAP[genreName] || []
        if (moods.includes(moodProfile.primaryMood)) {
          score += 2
        }
      })

      // Tag alignment
      game.tags?.forEach(tag => {
        const tagName = tag.toLowerCase()
        const moods = this.TAG_MOOD_MAP[tagName] || []
        if (moods.includes(moodProfile.primaryMood)) {
          score += 1
        }
      })

      // Personality trait alignment
      game.genres?.forEach(genre => {
        const genreName = genre.name.toLowerCase()
        const moods = this.GENRE_MOOD_MAP[genreName] || []
        moods.forEach(mood => {
          score += moodProfile.personalityTraits[mood as keyof typeof moodProfile.personalityTraits] || 0
        })
      })

      // Global rating bonus
      if (game.globalRating) {
        score += game.globalRating / 10
      }

      return { game, score }
    })

    // Sort by score and return top recommendations
    return scoredGames
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(item => item.game)
  }
}

// Export singleton instance
export const realMoodEngine = RealMoodEngine
