import { describe, it, expect, vi } from 'vitest'
import { cacheService } from '../services/cacheService'

// Mock Redis for testing
vi.mock('redis', () => ({
  createClient: vi.fn(() => ({
    connect: vi.fn(),
    get: vi.fn(),
    setEx: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
    ping: vi.fn()
  }))
}))

describe('CacheService', () => {
  beforeEach(() => {
    // Reset cache before each test
    vi.clearAllMocks()
  })

  it('should cache and retrieve data in memory', async () => {
    const testData = { message: 'Hello World' }
    const cacheKey = 'test-key'

    // Set data in cache
    await cacheService.set(cacheKey, testData, { ttl: 300 })

    // Retrieve data from cache
    const cachedData = await cacheService.get(cacheKey)

    expect(cachedData).toEqual(testData)
  })

  it('should return null for non-existent cache keys', async () => {
    const cachedData = await cacheService.get('non-existent-key')
    expect(cachedData).toBeNull()
  })

  it('should delete cached data', async () => {
    const testData = { message: 'Test' }
    const cacheKey = 'delete-test'

    // Set data
    await cacheService.set(cacheKey, testData)

    // Delete data
    await cacheService.del(cacheKey)

    // Verify it's gone
    const cachedData = await cacheService.get(cacheKey)
    expect(cachedData).toBeNull()
  })

  it('should handle Steam API specific caching methods', async () => {
    const endpoint = 'games/featured'
    const params = { limit: 10 }
    const responseData = [{ id: '1', name: 'Test Game' }]

    // Test setting Steam API response
    await cacheService.setSteamApiResponse(endpoint, params, responseData)

    // Test getting Steam API response
    const cachedResponse = await cacheService.getSteamApiResponse(endpoint, params)
    expect(cachedResponse).toEqual(responseData)
  })

  it('should perform health check', async () => {
    const health = await cacheService.healthCheck()
    expect(health).toHaveProperty('status')
    expect(['healthy', 'unhealthy']).toContain(health.status)
  })
})
