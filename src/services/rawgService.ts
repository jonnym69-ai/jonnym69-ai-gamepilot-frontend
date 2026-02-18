// RAWG API Service for enhanced game metadata
// https://rawg.io/apidocs

import { apiCache, CacheKeys, CacheTTL, withCache } from '../utils/apiCache'

export interface RAWGGame {
  id: number
  name: string
  slug: string
  description: string
  released: string
  tba: boolean
  background_image: string
  background_image_additional: string
  website: string
  rating: number
  rating_top: number
  ratings: Array<{
    id: number
    title: string
    count: number
    percent: number
  }>
  ratings_count: number
  reviews_text_count: number
  added: number
  added_by_status: {
    yet: number
    owned: number
    beaten: number
    toplay: number
    dropped: number
    playing: number
  }
  saturated_color: string
  dominant_color: string
  parent_platforms: Array<{
    platform: {
      id: number
      name: string
      slug: string
    }
  }>
  platforms: Array<{
    platform: {
      id: number
      name: string
      slug: string
      image: string
      year_end: number | null
      year_start: number
      games_count: number
      image_background: string
    }
    released_at: string
    requirements_en: string
    requirements_ru: string
    requirements_minimum: {
      os: string
      processor: string
      memory: string
      graphics: string
      storage: string
    }
    requirements_recommended: {
      os: string
      processor: string
      memory: string
      graphics: string
      storage: string
    }
  }>
  stores: Array<{
    id: number
    store: {
      id: number
      name: string
      slug: string
      domain: string
      games_count: number
      image_background: string
    }
    url: string
  }>
  developers: Array<{
    id: number
    name: string
    slug: string
    games_count: number
    image_background: string
  }>
  genres: Array<{
    id: number
    name: string
    slug: string
    games_count: number
    image_background: string
  }>
  tags: Array<{
    id: number
    name: string
    slug: string
    language: string
    games_count: number
    image_background: string
  }>
  publishers: Array<{
    id: number
    name: string
    slug: string
    games_count: number
    image_background: string
  }>
  esrb_rating: {
    id: number
    name: string
    slug: string
  }
  clip: string
  short_screenshots: Array<{
    id: number
    image: string
  }>
}

export interface RAWGSearchResponse {
  count: number
  next: string | null
  previous: string | null
  results: RAWGGame[]
}

export interface RAWGGameDetails extends RAWGGame {
  description_raw: string
  metacritic: number
  metacritic_platforms: Array<{
    metacritic: number
    platform: number
    url: string
  }>
  playtime: number
  suggestions_count: number
  user_game: string | null
  reviews_count: number
  saturated_color: string
  dominant_color: string
  alternative_names: string[]
  reddit_url: string
  reddit_name: string
  reddit_description: string
  reddit_count: number
  twitch_count: number
  youtube_count: number
}

class RAWGService {
  private baseURL = 'https://api.rawg.io/api'
  private apiKey: string | null = null

  constructor(apiKey?: string) {
    this.apiKey = apiKey || null
  }

  private getAuthParams(): string {
    if (this.apiKey) {
      return `?key=${this.apiKey}`
    }
    return ''
  }

  private getURLWithParams(endpoint: string, params: Record<string, string> = {}): string {
    const url = new URL(`${this.baseURL}${endpoint}`)
    
    // Add API key if available
    if (this.apiKey) {
      url.searchParams.append('key', this.apiKey)
    }
    
    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value)
      }
    })
    
    return url.toString()
  }

  async searchGames(query: string, page: number = 1, pageSize: number = 10): Promise<RAWGSearchResponse> {
    const cacheKey = CacheKeys.rawgSearch(query, page)
    
    return withCache(cacheKey, async () => {
      try {
        const url = this.getURLWithParams('/games', {
          search: query,
          page: page.toString(),
          page_size: pageSize.toString()
        })
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`RAWG API Error: ${response.status} - ${response.statusText}`)
        }
        
        const result = await response.json()
        console.log(`🎮 RAWG search for "${query}": ${result.results.length} games found`)
        return result
      } catch (error) {
        console.error('Error searching games:', error)
        throw error
      }
    }, CacheTTL.RAWG_SEARCH)
  }

  async getGameDetails(gameId: number): Promise<RAWGGameDetails> {
    const cacheKey = CacheKeys.rawgGameDetails(gameId)
    
    return withCache(cacheKey, async () => {
      try {
        const url = this.getURLWithParams(`/games/${gameId}`)
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`RAWG API Error: ${response.status} - ${response.statusText}`)
        }
        
        const result = await response.json()
        console.log(`🎮 RAWG game details for ID ${gameId}: ${result.name}`)
        return result
      } catch (error) {
        console.error('Error getting game details:', error)
        throw error
      }
    }, CacheTTL.RAWG_GAME_DETAILS)
  }

  async getGameDetailsByName(name: string): Promise<RAWGGameDetails | null> {
    const cacheKey = CacheKeys.rawgGameByName(name)
    
    return withCache(cacheKey, async () => {
      try {
        // First search for the game
        const searchResults = await this.searchGames(name, 1, 1)
        
        if (searchResults.results.length === 0) {
          console.log(`🎮 RAWG: No game found for "${name}"`)
          return null
        }
        
        // Get detailed info for the first result
        const gameId = searchResults.results[0].id
        const gameDetails = await this.getGameDetails(gameId)
        console.log(`🎮 RAWG: Found game details for "${name}"`)
        return gameDetails
      } catch (error) {
        console.error('Error getting game details by name:', error)
        return null
      }
    }, CacheTTL.RAWG_GAME_DETAILS)
  }

  async getGamesByGenre(genre: string, page: number = 1, pageSize: number = 20): Promise<RAWGSearchResponse> {
    const cacheKey = CacheKeys.rawgGamesByGenre(genre, page)
    
    return withCache(cacheKey, async () => {
      try {
        const url = this.getURLWithParams('/games', {
          genres: genre,
          page: page.toString(),
          page_size: pageSize.toString()
        })
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`RAWG API Error: ${response.status} - ${response.statusText}`)
        }
        
        const result = await response.json()
        console.log(`🎮 RAWG games by genre "${genre}": ${result.results.length} games found`)
        return result
      } catch (error) {
        console.error('Error getting games by genre:', error)
        throw error
      }
    }, CacheTTL.RAWG_GAMES_BY_GENRE)
  }

  async getGamesByTag(tag: string, page: number = 1, pageSize: number = 20): Promise<RAWGSearchResponse> {
    const cacheKey = CacheKeys.rawgGamesByTag(tag, page)
    
    return withCache(cacheKey, async () => {
      try {
        const url = this.getURLWithParams('/games', {
          tags: tag,
          page: page.toString(),
          page_size: pageSize.toString()
        })
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`RAWG API Error: ${response.status} - ${response.statusText}`)
        }
        
        const result = await response.json()
        console.log(`🎮 RAWG games by tag "${tag}": ${result.results.length} games found`)
        return result
      } catch (error) {
        console.error('Error getting games by tag:', error)
        throw error
      }
    }, CacheTTL.RAWG_GAMES_BY_TAG)
  }

  // Helper method to extract mood-relevant data from RAWG game
  extractMoodData(game: RAWGGame | RAWGGameDetails) {
    return {
      name: game.name,
      description: game.description || '',
      descriptionRaw: 'description_raw' in game ? game.description_raw : '',
      genres: game.genres.map(g => g.name),
      tags: game.tags.map(t => t.name),
      rating: game.rating,
      released: game.released,
      platforms: game.parent_platforms.map(p => p.platform.name),
      esrbRating: game.esrb_rating?.name || null,
      playtime: 'playtime' in game ? game.playtime : null,
      metacritic: 'metacritic' in game ? game.metacritic : null
    }
  }

  // Method to search for games with mood-related tags
  async searchGamesByMood(moodTags: string[], page: number = 1, pageSize: number = 20): Promise<RAWGSearchResponse> {
    const cacheKey = CacheKeys.rawgGamesByMood(moodTags, page)
    
    return withCache(cacheKey, async () => {
      try {
        const tags = moodTags.join(',')
        const url = this.getURLWithParams('/games', {
          tags: tags,
          page: page.toString(),
          page_size: pageSize.toString()
        })
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`RAWG API Error: ${response.status} - ${response.statusText}`)
        }
        
        const result = await response.json()
        console.log(`🎮 RAWG games by mood tags [${moodTags.join(', ')}]: ${result.results.length} games found`)
        return result
      } catch (error) {
        console.error('Error searching games by mood:', error)
        throw error
      }
    }, CacheTTL.RAWG_GAMES_BY_MOOD)
  }

  // Set API key after initialization
  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }

  // Check if API key is set
  hasApiKey(): boolean {
    return this.apiKey !== null
  }
}

// Create singleton instance (can be initialized without API key)
export const rawgService = new RAWGService()

// Export class for creating instances with API keys
export { RAWGService }
