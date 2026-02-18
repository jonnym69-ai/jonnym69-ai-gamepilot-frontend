// GOG Game Search Service
export interface GOGGame {
  id: string
  title: string
  slug: string
  url: string
  image: string
  price: string
  developers: string[]
  genres: string[]
  platforms: string[]
  releaseDate: string
  description: string
}

export class GOGAPI {
  private static readonly BASE_URL = 'https://api.gog.com/v2'
  private static readonly SEARCH_URL = 'https://catalog.gog.com/v1/catalog'

  static async searchGames(query: string, limit: number = 10): Promise<GOGGame[]> {
    try {
      const url = `${this.SEARCH_URL}?query=${encodeURIComponent(query)}&limit=${limit}&productType=game&sortBy=popularity&order=desc`
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'GamePilot/1.0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`GOG API Error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.products) {
        return data.products.map(this.transformGOGGame)
      }
      return []
    } catch (error) {
      console.error('GOG Search Error:', error)
      return []
    }
  }

  static async getGameDetails(gameId: string): Promise<GOGGame | null> {
    try {
      const url = `${this.BASE_URL}/products/${gameId}`
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'GamePilot/1.0'
        }
      })
      
      if (!response.ok) {
        throw new Error(`GOG API Error: ${response.status}`)
      }
      
      const data = await response.json()
      return this.transformGOGGame(data)
    } catch (error) {
      console.error('GOG Game Details Error:', error)
      return null
    }
  }

  static getGOGStoreUrl(gameId: string): string {
    return `https://www.gog.com/game/${gameId}`
  }

  static getGOGLauncherUrl(gameId: string): string {
    return `goggalaxy://openGame/${gameId}`
  }

  private static transformGOGGame(gogData: any): GOGGame {
    return {
      id: gogData.id || gogData.slug,
      title: gogData.title || gogData.name,
      slug: gogData.slug,
      url: gogData.url || `https://www.gog.com/game/${gogData.slug}`,
      image: gogData.coverHorizontal || gogData.image || gogData.cover,
      price: gogData.price?.amount || 'Free',
      developers: gogData.developers || [],
      genres: gogData.genres || [],
      platforms: gogData.platforms || [],
      releaseDate: gogData.releaseDate || gogData.release_date,
      description: gogData.description || gogData.summary || ''
    }
  }

  static convertGOGGameToGame(gogGame: GOGGame): Omit<any, 'id'> {
    return {
      title: gogGame.title,
      launcherId: gogGame.id,
      platforms: ['GOG'],
      status: 'backlog',
      playtime: 0,
      coverImage: gogGame.image,
      genres: gogGame.genres,
      tags: [],
      achievements: { unlocked: 0, total: 0 },
      description: gogGame.description
    }
  }

  static extractGOGIdFromUrl(url: string): string | null {
    const match = url.match(/gog\.com\/game\/([^\/\?]+)/)
    return match ? match[1] : null
  }

  static extractGOGIdFromStoreUrl(url: string): string | null {
    const match = url.match(/gog\.com\/en\/game\/([^\/\?]+)/)
    return match ? match[1] : null
  }
}

// GOG Game Search Component Helper
export class GOGGameSearch {
  private static searchCache = new Map<string, GOGGame[]>()
  private static cacheTimeout = 5 * 60 * 1000 // 5 minutes

  static async searchWithCache(query: string): Promise<GOGGame[]> {
    const cacheKey = query.toLowerCase().trim()
    
    // Check cache first
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey)!
    }

    // Perform search
    const results = await GOGAPI.searchGames(query)
    
    // Cache results
    this.searchCache.set(cacheKey, results)
    
    // Clear cache after timeout
    setTimeout(() => {
      this.searchCache.delete(cacheKey)
    }, this.cacheTimeout)

    return results
  }

  static clearCache(): void {
    this.searchCache.clear()
  }
}
