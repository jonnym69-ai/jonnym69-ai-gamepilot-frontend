import { createClient, RedisClientType } from 'redis'

interface CacheOptions {
  ttl?: number // Time to live in seconds
  prefix?: string
}

interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
}

export class CacheService {
  private redis: RedisClientType | null = null
  private memoryCache = new Map<string, CacheEntry>()
  private isProduction: boolean

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
    this.initializeRedis()
  }

  private async initializeRedis() {
    if (this.isProduction && process.env.REDIS_URL) {
      try {
        this.redis = createClient({ url: process.env.REDIS_URL })
        await this.redis.connect()
        console.log('🔄 Redis cache connected')
      } catch (error) {
        console.warn('⚠️ Redis connection failed, falling back to memory cache:', error)
        this.redis = null
      }
    }
  }

  private getCacheKey(key: string, prefix?: string): string {
    const cachePrefix = prefix || 'gamepilot'
    return `${cachePrefix}:${key}`
  }

  async get<T = any>(key: string, prefix?: string): Promise<T | null> {
    const cacheKey = this.getCacheKey(key, prefix)

    try {
      if (this.redis) {
        // Redis cache
        const cached = await this.redis.get(cacheKey)
        if (cached) {
          const entry: CacheEntry<T> = JSON.parse(cached)
          if (Date.now() - entry.timestamp < entry.ttl * 1000) {
            console.log(`🔄 Cache hit: ${cacheKey}`)
            return entry.data
          } else {
            // Expired, remove it
            await this.redis.del(cacheKey)
          }
        }
      } else {
        // Memory cache
        const entry = this.memoryCache.get(cacheKey)
        if (entry && Date.now() - entry.timestamp < entry.ttl * 1000) {
          console.log(`🔄 Cache hit: ${cacheKey}`)
          return entry.data
        } else if (entry) {
          // Expired, remove it
          this.memoryCache.delete(cacheKey)
        }
      }
    } catch (error) {
      console.warn(`⚠️ Cache get error for ${cacheKey}:`, error)
    }

    console.log(`📭 Cache miss: ${cacheKey}`)
    return null
  }

  async set<T = any>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const { ttl = 300, prefix } = options // Default 5 minutes TTL
    const cacheKey = this.getCacheKey(key, prefix)
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    }

    try {
      if (this.redis) {
        await this.redis.setEx(cacheKey, ttl, JSON.stringify(entry))
        console.log(`💾 Redis cached: ${cacheKey} (${ttl}s)`)
      } else {
        this.memoryCache.set(cacheKey, entry)
        console.log(`💾 Memory cached: ${cacheKey} (${ttl}s)`)
      }
    } catch (error) {
      console.warn(`⚠️ Cache set error for ${cacheKey}:`, error)
    }
  }

  async del(key: string, prefix?: string): Promise<void> {
    const cacheKey = this.getCacheKey(key, prefix)

    try {
      if (this.redis) {
        await this.redis.del(cacheKey)
      } else {
        this.memoryCache.delete(cacheKey)
      }
      console.log(`🗑️ Cache deleted: ${cacheKey}`)
    } catch (error) {
      console.warn(`⚠️ Cache delete error for ${cacheKey}:`, error)
    }
  }

  async clear(prefix?: string): Promise<void> {
    const pattern = prefix ? `${prefix}:*` : '*'

    try {
      if (this.redis) {
        const keys = await this.redis.keys(pattern)
        if (keys.length > 0) {
          await this.redis.del(keys)
          console.log(`🧹 Cleared ${keys.length} Redis cache entries`)
        }
      } else {
        let cleared = 0
        for (const [key] of this.memoryCache) {
          if (!prefix || key.startsWith(`${prefix}:`)) {
            this.memoryCache.delete(key)
            cleared++
          }
        }
        console.log(`🧹 Cleared ${cleared} memory cache entries`)
      }
    } catch (error) {
      console.warn(`⚠️ Cache clear error:`, error)
    }
  }

  // Steam API specific caching methods
  async getSteamApiResponse(endpoint: string, params: Record<string, any>): Promise<any | null> {
    const cacheKey = `steam:${endpoint}:${JSON.stringify(params)}`
    return this.get(cacheKey, 'api')
  }

  async setSteamApiResponse(endpoint: string, params: Record<string, any>, data: any): Promise<void> {
    const cacheKey = `steam:${endpoint}:${JSON.stringify(params)}`
    // Cache Steam API responses for 10 minutes
    await this.set(cacheKey, data, { ttl: 600, prefix: 'api' })
  }

  async invalidateSteamCache(userId?: string): Promise<void> {
    if (userId) {
      // Invalidate user-specific Steam cache
      await this.clear(`api:steam:user:${userId}`)
    } else {
      // Invalidate all Steam cache
      await this.clear('api:steam')
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy', details: any }> {
    try {
      if (this.redis) {
        await this.redis.ping()
        return { status: 'healthy', details: { type: 'redis', connected: true } }
      } else {
        return { status: 'healthy', details: { type: 'memory', entries: this.memoryCache.size } }
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          type: this.redis ? 'redis' : 'memory',
          error: (error as Error).message
        }
      }
    }
  }

  // Cleanup expired entries (for memory cache)
  cleanup(): void {
    if (!this.redis) {
      const now = Date.now()
      for (const [key, entry] of this.memoryCache) {
        if (now - entry.timestamp >= entry.ttl * 1000) {
          this.memoryCache.delete(key)
        }
      }
    }
  }
}

// Singleton instance
export const cacheService = new CacheService()

// Periodic cleanup for memory cache
if (process.env.NODE_ENV !== 'production') {
  setInterval(() => {
    cacheService.cleanup()
  }, 60000) // Clean every minute
}
