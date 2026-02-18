import type { Game } from '@gamepilot/types'

export interface Genre {
  id: string
  name: string
  color: string
  description: string
}

export interface GenreAffinity {
  genre: string
  affinity: number
  playtime: number
  rating: number
  frequency: number
  lastPlayed: Date | null
  trend: 'increasing' | 'decreasing' | 'stable'
}

export interface GenreInsight {
  genre: string
  affinity: number
  description: string
  recommendation: string
  icon: string
  color: string
}

// Static genres data
const GENRE_DATA: Genre[] = [
  {
    id: 'action',
    name: 'Action',
    color: 'from-red-500 to-orange-500',
    description: 'Fast-paced gameplay and combat'
  },
  {
    id: 'rpg',
    name: 'RPG',
    color: 'from-purple-500 to-pink-500',
    description: 'Role-playing and character development'
  },
  {
    id: 'adventure',
    name: 'Adventure',
    color: 'from-green-500 to-emerald-500',
    description: 'Exploration and puzzle-solving'
  },
  {
    id: 'strategy',
    name: 'Strategy',
    color: 'from-blue-500 to-indigo-500',
    description: 'Tactical planning and resource management'
  },
  {
    id: 'simulation',
    name: 'Simulation',
    color: 'from-yellow-500 to-amber-500',
    description: 'Real-world simulation and management'
  },
  {
    id: 'sports',
    name: 'Sports',
    color: 'from-cyan-500 to-teal-500',
    description: 'Athletic competitions and sports games'
  },
  {
    id: 'racing',
    name: 'Racing',
    color: 'from-orange-500 to-red-500',
    description: 'Vehicle racing and speed challenges'
  },
  {
    id: 'puzzle',
    name: 'Puzzle',
    color: 'from-pink-500 to-purple-500',
    description: 'Problem-solving and brain teasers'
  }
]

export class GenreStrategy {
  /**
   * Calculate genre affinity based on user behavior
   */
  calculateGenreAffinity(games: Game[]): GenreAffinity[] {
    if (!games || games.length === 0) return []

    const genreMap: Record<string, GenreAffinity> = {}

    games.forEach(game => {
      game.genres?.forEach(genre => {
        const genreName = genre.name
        
        if (!genreMap[genreName]) {
          genreMap[genreName] = {
            genre: genreName,
            affinity: 0,
            playtime: 0,
            rating: 0,
            frequency: 0,
            lastPlayed: null,
            trend: 'stable'
          }
        }

        // Update affinity based on playtime
        if (game.hoursPlayed) {
          genreMap[genreName].playtime += game.hoursPlayed
          genreMap[genreName].affinity += Math.min(game.hoursPlayed / 10, 5) // Cap at 5 points per 10 hours
        }

        // Update affinity based on rating
        if (game.userRating) {
          genreMap[genreName].rating += game.userRating
          genreMap[genreName].affinity += (game.userRating - 3) * 2 // Rating bonus/penalty
        }

        // Update frequency
        genreMap[genreName].frequency += 1

        // Update last played
        if (game.lastPlayed && (!genreMap[genreName].lastPlayed || game.lastPlayed > genreMap[genreName].lastPlayed)) {
          genreMap[genreName].lastPlayed = game.lastPlayed
        }
      })
    })

    // Calculate trends
    Object.values(genreMap).forEach(affinity => {
      const recentGames = games.filter(game => 
        game.genres?.some(g => g.name === affinity.genre) && 
        game.lastPlayed && 
        game.lastPlayed > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      )

      const olderGames = games.filter(game => 
        game.genres?.some(g => g.name === affinity.genre) && 
        game.lastPlayed && 
        game.lastPlayed < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      )

      if (recentGames.length > olderGames.length) {
        affinity.trend = 'increasing'
      } else if (recentGames.length < olderGames.length) {
        affinity.trend = 'decreasing'
      } else {
        affinity.trend = 'stable'
      }
    })

    return Object.values(genreMap).sort((a, b) => b.affinity - a.affinity)
  }

  /**
   * Get genre insights based on affinity analysis
   */
  getGenreInsights(games: Game[]): GenreInsight[] {
    const insights: GenreInsight[] = []
    const affinities = this.calculateGenreAffinity(games)

    if (affinities.length === 0) return insights

    // Top genres
    const topGenres = affinities.slice(0, 3)
    topGenres.forEach((affinity: GenreAffinity, index: number) => {
      insights.push({
        genre: affinity.genre,
        affinity: Math.round(affinity.affinity),
        description: `Your #${index + 1} favorite genre with ${Math.round(affinity.affinity)} affinity score`,
        recommendation: `Continue exploring ${affinity.genre} games`,
        icon: '🎯',
        color: '#10B981'
      })
    })

    // Hidden gems (high affinity, low playtime)
    const hiddenGems = affinities.filter(affinity => 
      affinity.affinity > 15 && affinity.playtime < 5
    ).slice(0, 2)

    hiddenGems.forEach(gem => {
      insights.push({
        genre: gem.genre,
        affinity: Math.round(gem.affinity),
        description: `Undiscovered ${gem.genre} gem with high affinity`,
        recommendation: `Try this ${gem.genre} game you haven't played much`,
        icon: '💎',
        color: '#8B5CF6'
      })
    })

    // Trending genres
    const trendingGenres = affinities.filter(affinity => affinity.trend === 'increasing').slice(0, 2)
    trendingGenres.forEach(trend => {
      insights.push({
        genre: trend.genre,
        affinity: Math.round(trend.affinity),
        description: `Trending ${trend.genre} in your library`,
        recommendation: `Explore more ${trend.genre} games`,
        icon: '🔥',
        color: '#F59E0B'
      })
    })

    return insights
  }

  /**
   * Get genre statistics
   */
  getGenreStatistics(games: Game[]): {
    uniqueGenres: number
    averageAffinity: number
    averagePlaytime: number
    averageRating: number
    totalGames: number
  } {
    const affinities = this.calculateGenreAffinity(games)
    
    if (affinities.length === 0) {
      return {
        uniqueGenres: 0,
        averageAffinity: 0,
        averagePlaytime: 0,
        averageRating: 0,
        totalGames: games.length
      }
    }

    return {
      uniqueGenres: affinities.length,
      averageAffinity: Math.round(affinities.reduce((sum, a) => sum + a.affinity, 0) / affinities.length),
      averagePlaytime: Math.round(affinities.reduce((sum, a) => sum + a.playtime, 0) / affinities.length),
      averageRating: Math.round(affinities.reduce((sum, a) => sum + a.rating, 0) / affinities.length),
      totalGames: games.length
    }
  }

  /**
   * Get all available genres
   */
  getGenres(): Genre[] {
    return GENRE_DATA
  }

  /**
   * Get genre by ID
   */
  getGenreById(id: string): Genre | undefined {
    return GENRE_DATA.find(genre => genre.id === id)
  }

  /**
   * Get genre by name
   */
  getGenreByName(name: string): Genre | undefined {
    return GENRE_DATA.find(genre => genre.name.toLowerCase() === name.toLowerCase())
  }

  /**
   * Filter games by genre
   */
  filterGamesByGenre(games: Game[], genreName: string): Game[] {
    return games.filter(game => 
      game.genres?.some(genre => 
        genre.name.toLowerCase() === genreName.toLowerCase()
      )
    )
  }

  /**
   * Get top genres by affinity
   */
  getTopGenres(games: Game[], limit: number = 5): GenreAffinity[] {
    return this.calculateGenreAffinity(games).slice(0, limit)
  }

  /**
   * Get trending genres (increasing trend)
   */
  getTrendingGenres(games: Game[], limit: number = 3): GenreAffinity[] {
    return this.calculateGenreAffinity(games)
      .filter(affinity => affinity.trend === 'increasing')
      .slice(0, limit)
  }

  /**
   * Get hidden gem genres (high affinity, low playtime)
   */
  getHiddenGemGenres(games: Game[], limit: number = 2): GenreAffinity[] {
    return this.calculateGenreAffinity(games)
      .filter(affinity => affinity.affinity > 15 && affinity.playtime < 5)
      .slice(0, limit)
  }
}

// Export singleton instance
export const genreStrategy = new GenreStrategy()
