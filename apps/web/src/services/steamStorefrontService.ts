import { AffiliateService } from './affiliateService'
import type { AffiliateLink } from './affiliateService'
import type { Game } from '@gamepilot/types'

export interface SteamStoreGame {
  appid: number
  name: string
  price_overview?: {
    currency: string
    initial: number
    final: number
    discount_percent: number
  }
  header_image: string
  short_description: string
  genres: Array<{ id: string, description: string }>
  categories: Array<{ id: number, description: string }>
  platforms: {
    windows: boolean
    mac: boolean
    linux: boolean
  }
  release_date: {
    coming_soon: boolean
    date: string
  }
  metacritic?: {
    score: number
    url: string
  }
  recommendations?: {
    total: number
  }
}

export interface PurchaseRecommendation {
  appId: number
  title: string
  description: string
  price: number
  originalPrice?: number
  discountPercent?: number
  headerImage: string
  genres: string[]
  platforms: string[]
  releaseDate: string
  metacriticScore?: number
  recommendationCount?: number
  reasoning: string
  alignmentScore: number
  moodSuitability: string
  estimatedPlaytime: string
  affiliateLinks: AffiliateLink[]
}

export class SteamStorefrontService {
  private static readonly BASE_URL = 'https://store.steampowered.com/api'

  /**
   * Get detailed store information for a game
   */
  static async getGameDetails(appId: number): Promise<SteamStoreGame | null> {
    try {
      console.log('🔍 Fetching Steam store data for app:', appId)

      // Use backend proxy instead of direct Steam API call to avoid CSP violations
      const response = await fetch(`/api/steam/store-details?appids=${appId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        console.warn('❌ Backend proxy request failed:', response.status)
        return null
      }

      const data = await response.json()
      const gameData = data[appId.toString()]

      if (!gameData || !gameData.success) {
        console.warn('❌ Steam API returned no data for app:', appId)
        return null
      }

      console.log('✅ Retrieved Steam store data for:', gameData.data.name)
      return gameData.data
    } catch (error) {
      console.error('❌ Error fetching Steam store data:', error)
      return null
    }
  }

  /**
   * Get multiple games' store details
   */
  static async getMultipleGameDetails(appIds: number[]): Promise<Map<number, SteamStoreGame>> {
    const results = new Map<number, SteamStoreGame>()

    // Steam API has rate limits, so we'll fetch them sequentially with delays
    for (const appId of appIds) {
      const gameData = await this.getGameDetails(appId)
      if (gameData) {
        results.set(appId, gameData)
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    return results
  }

  /**
   * Search for games (limited Steam API support)
   */
  static async searchGames(query: string, limit: number = 20): Promise<SteamStoreGame[]> {
    try {
      // Note: Steam doesn't have a public search API, so this is limited
      // We'll need to work with known app IDs or use alternative approaches
      console.log('🔍 Steam search not fully supported, query:', query)
      return []
    } catch (error) {
      console.error('❌ Error searching Steam games:', error)
      return []
    }
  }

  /**
   * Convert Steam store data to our purchase recommendation format
   */
  static steamGameToRecommendation(
    steamGame: SteamStoreGame,
    reasoning: string,
    alignmentScore: number,
    moodSuitability: string,
    estimatedPlaytime: string
  ): PurchaseRecommendation {
    return {
      appId: steamGame.appid,
      title: steamGame.name,
      description: steamGame.short_description,
      price: steamGame.price_overview?.final || 0,
      originalPrice: steamGame.price_overview?.initial,
      discountPercent: steamGame.price_overview?.discount_percent,
      headerImage: steamGame.header_image,
      genres: steamGame.genres?.map(g => g.description) || [],
      platforms: Object.entries(steamGame.platforms)
        .filter(([_, supported]) => supported)
        .map(([platform, _]) => platform),
      releaseDate: steamGame.release_date?.date || 'TBA',
      metacriticScore: steamGame.metacritic?.score,
      recommendationCount: steamGame.recommendations?.total,
      reasoning,
      alignmentScore,
      moodSuitability,
      estimatedPlaytime,
      affiliateLinks: [] // Will be populated by getPurchaseRecommendations
    }
  }

  /**
   * Get recommended games for purchase based on user's library and preferences
   */
  static async getPurchaseRecommendations(
    userLibrary: Game[],
    preferredGenres: string[] = [],
    preferredMoods: string[] = [],
    budget: number = 50,
    limit: number = 10
  ): Promise<PurchaseRecommendation[]> {
    try {
      console.log('🛒 Generating purchase recommendations...')

      // For now, we'll use some popular Steam games as examples
      // In a real implementation, you'd have a curated list or use Steam's featured/new releases
      const popularGameIds = [
        1174180, // Hades
        1426210, // It Takes Two
        1245620, // Elden Ring
        1817070, // Marvel's Spider-Man 2
        1085660, // Destiny 2
        359550,  // Tom Clancy's Rainbow Six Siege
        730,      // Counter-Strike 2
        578080,  // PUBG: BATTLEGROUNDS
        236390,  // War Thunder
        440,      // Team Fortress 2 (free but included for variety)
      ]

      // Get store details for these games
      const storeData = await this.getMultipleGameDetails(popularGameIds.slice(0, limit))

      const recommendations: PurchaseRecommendation[] = []

      for (const [appId, steamGame] of storeData) {
        // Skip if user already owns it
        const alreadyOwned = userLibrary.some(game =>
          game.appId === appId || game.title.toLowerCase() === steamGame.name.toLowerCase()
        )

        if (alreadyOwned) continue

        // Skip free games for purchase recommendations
        if (!steamGame.price_overview || steamGame.price_overview.final === 0) continue

        // Skip if over budget
        if (steamGame.price_overview.final > budget * 100) continue // Steam prices are in cents

        // Generate reasoning based on user's preferences
        const reasoning = this.generatePurchaseReasoning(steamGame, preferredGenres, preferredMoods)
        const alignmentScore = this.calculateAlignmentScore(steamGame, preferredGenres, preferredMoods)
        const moodSuitability = this.determineMoodSuitability(steamGame)
        const estimatedPlaytime = this.estimatePlaytime(steamGame)

        if (alignmentScore > 0.3) { // Only include reasonably aligned games
          const recommendation = this.steamGameToRecommendation(
            steamGame,
            reasoning,
            alignmentScore,
            moodSuitability,
            estimatedPlaytime
          )

          // Add affiliate links
          recommendation.affiliateLinks = AffiliateService.generateAffiliateLinks(
            steamGame.name,
            steamGame.appid
          )

          recommendations.push(recommendation)
        }
      }

      // Sort by alignment score and return top recommendations
      return recommendations
        .sort((a, b) => b.alignmentScore - a.alignmentScore)
        .slice(0, limit)

    } catch (error) {
      console.error('❌ Error generating purchase recommendations:', error)
      return []
    }
  }

  private static generatePurchaseReasoning(
    game: SteamStoreGame,
    preferredGenres: string[],
    preferredMoods: string[]
  ): string {
    const reasons: string[] = []

    // Genre matching
    const gameGenres = game.genres?.map(g => g.description.toLowerCase()) || []
    const matchingGenres = preferredGenres.filter(genre =>
      gameGenres.some(gameGenre => gameGenre.includes(genre.toLowerCase()))
    )

    if (matchingGenres.length > 0) {
      reasons.push(`Matches your love for ${matchingGenres.join(', ')} games`)
    }

    // Price consideration
    if (game.price_overview?.discount_percent && game.price_overview.discount_percent > 0) {
      reasons.push(`Currently ${game.price_overview.discount_percent}% off`)
    }

    // Metacritic score
    if (game.metacritic?.score && game.metacritic.score > 80) {
      reasons.push(`Critically acclaimed with ${game.metacritic.score}/100 Metacritic score`)
    }

    // Recommendations
    if (game.recommendations?.total && game.recommendations.total > 10000) {
      const thousands = Math.floor(game.recommendations.total / 1000)
      reasons.push(`Loved by ${thousands}k+ Steam users`)
    }

    // Fallback reasoning
    if (reasons.length === 0) {
      reasons.push('Highly rated game with great potential')
    }

    return reasons.join('. ')
  }

  private static calculateAlignmentScore(
    game: SteamStoreGame,
    preferredGenres: string[],
    preferredMoods: string[]
  ): number {
    let score = 0.5 // Base score

    const gameGenres = game.genres?.map(g => g.description.toLowerCase()) || []

    // Genre matching (0-0.4 points)
    const matchingGenres = preferredGenres.filter(genre =>
      gameGenres.some(gameGenre => gameGenre.includes(genre.toLowerCase()))
    )
    score += (matchingGenres.length / preferredGenres.length) * 0.4

    // Metacritic bonus (0-0.1 points)
    if (game.metacritic?.score) {
      score += Math.min(game.metacritic.score / 1000, 0.1)
    }

    // Recommendation count bonus (0-0.1 points)
    if (game.recommendations?.total) {
      score += Math.min(game.recommendations.total / 1000000, 0.1) // Cap at 1M recommendations
    }

    return Math.min(score, 1.0)
  }

  private static estimatePlaytime(game: SteamStoreGame): string {
    // Rough estimation based on game type
    const genres = game.genres?.map(g => g.description.toLowerCase()) || []

    if (genres.some(g => g.includes('rpg') || g.includes('strategy'))) {
      return '20-40 hours'
    } else if (genres.some(g => g.includes('action') || g.includes('adventure'))) {
      return '8-15 hours'
    } else if (genres.some(g => g.includes('puzzle') || g.includes('casual'))) {
      return '2-8 hours'
    }

    return '5-20 hours'
  }

  /**
   * Get user's recently played Steam games
   */
  static async getRecentlyPlayedSteamGames(steamId: string): Promise<any[]> {
    try {
      console.log('🕐 Fetching recently played Steam games for user')

      const response = await fetch(`/api/steam/recently-played`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        console.warn('❌ Failed to fetch recently played Steam games:', response.status)
        return []
      }

      const data = await response.json()
      console.log(`✅ Retrieved ${data.games?.length || 0} recently played Steam games`)

      return data.games || []
    } catch (error) {
      console.error('❌ Error fetching recently played Steam games:', error)
      return []
    }
  }
}
