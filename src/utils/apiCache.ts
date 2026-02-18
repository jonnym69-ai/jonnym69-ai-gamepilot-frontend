// API Caching System for RAWG and other external APIs
// Prevents excessive API calls and improves performance

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTTL = 24 * 60 * 60 * 1000 // 24 hours default
  private maxCacheSize = 1000 // Maximum number of entries

  // Set cache entry with TTL
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    }

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      this.cleanup()
    }

    this.cache.set(key, entry)
    console.log(`📦 Cached entry: ${key} (TTL: ${entry.ttl}ms)`)
  }

  // Get cache entry if valid
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      console.log(`🗑️ Cache expired: ${key}`)
      return null
    }

    console.log(`✅ Cache hit: ${key}`)
    return entry.data as T
  }

  // Check if key exists and is valid
  has(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  // Delete specific entry
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) {
      console.log(`🗑️ Cache deleted: ${key}`)
    }
    return deleted
  }

  // Clear all cache
  clear(): void {
    const size = this.cache.size
    this.cache.clear()
    console.log(`🧹 Cache cleared: ${size} entries removed`)
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    let removed = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        removed++
      }
    }

    // If still too many entries, remove oldest ones
    if (this.cache.size >= this.maxCacheSize) {
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const toRemove = entries.slice(0, this.cache.size - this.maxCacheSize + 100)
      for (const [key] of toRemove) {
        this.cache.delete(key)
        removed++
      }
    }

    if (removed > 0) {
      console.log(`🧹 Cache cleanup: ${removed} entries removed`)
    }
  }

  // Get cache statistics
  getStats(): {
    size: number
    hitRate: number
    entries: Array<{ key: string; age: number; ttl: number }>
  } {
    const now = Date.now()
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      ttl: entry.ttl
    }))

    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses for real rate
      entries
    }
  }

  // Set TTL for specific key
  setTTL(key: string, ttl: number): boolean {
    const entry = this.cache.get(key)
    if (!entry) {
      return false
    }

    entry.ttl = ttl
    console.log(`⏰ TTL updated: ${key} (${ttl}ms)`)
    return true
  }

  // Get all keys matching a pattern
  getKeysMatching(pattern: RegExp): string[] {
    return Array.from(this.cache.keys()).filter(key => pattern.test(key))
  }

  // Delete all keys matching a pattern
  deleteMatching(pattern: RegExp): number {
    const keysToDelete = this.getKeysMatching(pattern)
    let deleted = 0

    for (const key of keysToDelete) {
      if (this.cache.delete(key)) {
        deleted++
      }
    }

    if (deleted > 0) {
      console.log(`🗑️ Pattern delete: ${deleted} entries removed`)
    }

    return deleted
  }
}

// Singleton instance
export const apiCache = new APICache()

// Cache key generators for different API types
export const CacheKeys = {
  // RAWG API keys
  rawgGameDetails: (gameId: number) => `rawg:game:${gameId}`,
  rawgGameByName: (gameName: string) => `rawg:game:name:${gameName.toLowerCase()}`,
  rawgSearch: (query: string, page: number) => `rawg:search:${query.toLowerCase()}:${page}`,
  rawgGamesByGenre: (genre: string, page: number) => `rawg:genre:${genre.toLowerCase()}:${page}`,
  rawgGamesByTag: (tag: string, page: number) => `rawg:tag:${tag.toLowerCase()}:${page}`,
  rawgGamesByMood: (tags: string[], page: number) => `rawg:mood:${tags.join(',')}:${page}`,

  // Mood analysis keys
  moodAnalysis: (gameTitle: string, genres: string[]) => 
    `mood:analysis:${gameTitle.toLowerCase()}:${genres.join(',').toLowerCase()}`,
  rawgMoodAnalysis: (gameTitle: string) => 
    `mood:rawg:${gameTitle.toLowerCase()}`,

  // Recommendation keys
  moodRecommendations: (mood: string, limit: number) => 
    `rec:mood:${mood.toLowerCase()}:${limit}`,
  personaRecommendations: (personaId: string, limit: number) => 
    `rec:persona:${personaId}:${limit}`,

  // Steam API keys (for future use)
  steamUserGames: (steamId: string) => `steam:games:${steamId}`,
  steamGameDetails: (appId: number) => `steam:game:${appId}`
}

// TTL constants (in milliseconds)
export const CacheTTL = {
  // RAWG data - longer TTL since game metadata doesn't change often
  RAWG_GAME_DETAILS: 7 * 24 * 60 * 60 * 1000, // 7 days
  RAWG_SEARCH: 24 * 60 * 60 * 1000, // 24 hours
  RAWG_GAMES_BY_GENRE: 6 * 60 * 60 * 1000, // 6 hours
  RAWG_GAMES_BY_TAG: 6 * 60 * 60 * 1000, // 6 hours
  RAWG_GAMES_BY_MOOD: 6 * 60 * 60 * 1000, // 6 hours

  // Mood analysis - medium TTL since analysis logic might change
  MOOD_ANALYSIS: 24 * 60 * 60 * 1000, // 24 hours
  RAWG_MOOD_ANALYSIS: 24 * 60 * 60 * 1000, // 24 hours

  // Recommendations - shorter TTL for freshness
  MOOD_RECOMMENDATIONS: 2 * 60 * 60 * 1000, // 2 hours
  PERSONA_RECOMMENDATIONS: 2 * 60 * 60 * 1000, // 2 hours

  // Steam data - medium TTL
  STEAM_USER_GAMES: 30 * 60 * 1000, // 30 minutes
  STEAM_GAME_DETAILS: 7 * 24 * 60 * 60 * 1000 // 7 days
}

// Cache helper functions
export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // Try cache first
      const cached = apiCache.get<T>(key)
      if (cached !== null) {
        resolve(cached)
        return
      }

      // Fetch fresh data
      const data = await fetcher()
      
      // Cache the result
      apiCache.set(key, data, ttl)
      
      resolve(data)
    } catch (error) {
      reject(error)
    }
  })
}

// Periodic cleanup (run every hour)
setInterval(() => {
  apiCache.cleanup()
}, 60 * 60 * 1000)

export default apiCache
