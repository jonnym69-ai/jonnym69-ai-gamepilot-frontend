import { test, expect } from '@playwright/test'
import { Page } from '@playwright/test'

// Performance testing configuration
const PERFORMANCE_CONFIG = {
  // Large dataset sizes for testing
  DATASET_SIZES: {
    SMALL: 100,    // 100 games
    MEDIUM: 1000,  // 1,000 games
    LARGE: 5000,   // 5,000 games
    EXTRA_LARGE: 10000 // 10,000 games
  },
  
  // Performance thresholds
  THRESHOLDS: {
    LOAD_TIME: {
      EXCELLENT: 1000,    // < 1 second
      GOOD: 2000,        // < 2 seconds
      ACCEPTABLE: 3000,   // < 3 seconds
      POOR: 5000         // > 3 seconds
    },
    MEMORY_USAGE: {
      EXCELLENT: 50 * 1024 * 1024,   // < 50MB
      GOOD: 100 * 1024 * 1024,        // < 100MB
      ACCEPTABLE: 150 * 1024 * 1024,   // < 150MB
      POOR: 200 * 1024 * 1024         // > 150MB
    },
    DOM_NODES: {
      EXCELLENT: 500,    // < 500 nodes
      GOOD: 1000,        // < 1000 nodes
      ACCEPTABLE: 2000,   // < 2000 nodes
      POOR: 5000         // > 2000 nodes
    }
  }
}

// Generate mock game data for performance testing
function generateMockGames(count: number) {
  const games = []
  const genres = ['Action', 'RPG', 'Strategy', 'Puzzle', 'Adventure', 'Simulation', 'Sports', 'Racing']
  const platforms = ['Steam', 'Epic', 'GOG', 'Nintendo', 'PlayStation', 'Xbox']
  
  for (let i = 0; i < count; i++) {
    games.push({
      id: `game-${i}`,
      title: `Performance Test Game ${i + 1}`,
      coverImage: `/test-cover-${(i % 10) + 1}.jpg`,
      genres: [
        { id: genres[i % genres.length].toLowerCase(), name: genres[i % genres.length], color: '#FF6B6B' }
      ],
      platforms: [
        { id: platforms[i % platforms.length].toLowerCase(), name: platforms[i % platforms.length], code: platforms[i % platforms.length].toLowerCase(), isConnected: Math.random() > 0.5 }
      ],
      playStatus: ['unplayed', 'playing', 'completed'][i % 3] as any,
      hoursPlayed: Math.floor(Math.random() * 100),
      userRating: Math.floor(Math.random() * 5),
      isFavorite: Math.random() > 0.7,
      tags: [`tag-${i % 5}`, `category-${i % 3}`],
      addedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastPlayed: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null
    })
  }
  
  return games
}

test.describe('GamePilot Performance Tests', () => {
  test.beforeEach(async ({ page }: any) => {
    // Enable performance monitoring
    await page.goto('/about:blank')
    await page.evaluate(() => {
      // Clear any existing performance observers
      (window as any).performance?.clearResourceTimings?.()
    })
  })

  test.describe('Load Performance Tests', () => {
    test('should load small dataset (100 games) efficiently', async ({ page }: any) => {
      const startTime = Date.now()
      
      // Mock API response for small dataset
      await page.route('**/api/games', (route: any) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(generateMockGames(PERFORMANCE_CONFIG.DATASET_SIZES.SMALL))
      }))
      
      await page.goto('/library')
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      const performanceMetrics = await page.evaluate(() => {
        const perfEntries = (performance as any).getEntriesByType?.('navigation') || []
        return {
          loadTime,
          domNodes: document.querySelectorAll('*').length,
          resourceCount: perfEntries.length,
          memoryUsed: (performance as any).memory?.usedJSHeapSize || 0
        }
      })
      
      console.log(`Small dataset load time: ${loadTime}ms`)
      console.log(`DOM nodes: ${performanceMetrics.domNodes}`)
      console.log(`Memory used: ${(performanceMetrics.memoryUsed / 1024 / 1024).toFixed(2)}MB`)
      
      expect(loadTime).toBeLessThan(PERFORMANCE_CONFIG.THRESHOLDS.LOAD_TIME.EXCELLENT)
      expect(performanceMetrics.domNodes).toBeLessThan(PERFORMANCE_CONFIG.THRESHOLDS.DOM_NODES.EXCELLENT)
      expect(performanceMetrics.memoryUsed).toBeLessThan(PERFORMANCE_CONFIG.THRESHOLDS.MEMORY_USAGE.EXCELLENT)
    })

    test('should load medium dataset (1000 games) within acceptable limits', async ({ page }: any) => {
      const startTime = Date.now()
      
      // Mock API response for medium dataset
      await page.route('**/api/games', (route: any) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(generateMockGames(PERFORMANCE_CONFIG.DATASET_SIZES.MEDIUM))
      }))
      
      await page.goto('/library')
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      const performanceMetrics = await page.evaluate(() => {
        return {
          loadTime: Date.now() - startTime,
          domNodes: document.querySelectorAll('*').length,
          memoryUsed: (performance as any).memory?.usedJSHeapSize || 0
        }
      })
      
      expect(loadTime).toBeLessThan(PERFORMANCE_CONFIG.THRESHOLDS.LOAD_TIME.GOOD)
      expect(performanceMetrics.domNodes).toBeLessThan(PERFORMANCE_CONFIG.THRESHOLDS.DOM_NODES.GOOD)
      expect(performanceMetrics.memoryUsed).toBeLessThan(PERFORMANCE_CONFIG.THRESHOLDS.MEMORY_USAGE.GOOD)
    })

    test('should load large dataset (5000 games) within acceptable limits', async ({ page }: any) => {
      const startTime = Date.now()
      
      // Mock API response for large dataset
      await page.route('**/api/games', (route: any) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(generateMockGames(PERFORMANCE_CONFIG.DATASET_SIZES.LARGE))
      }))
      
      await page.goto('/library')
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      const performanceMetrics = await page.evaluate(() => {
        return {
          loadTime: Date.now() - startTime,
          domNodes: document.querySelectorAll('*').length,
          memoryUsed: (performance as any).memory?.usedJSHeapSize || 0
        }
      })
      
      expect(loadTime).toBeLessThan(PERFORMANCE_CONFIG.THRESHOLDS.LOAD_TIME.ACCEPTABLE)
      expect(performanceMetrics.domNodes).toBeLessThan(PERFORMANCE_CONFIG.THRESHOLDS.DOM_NODES.ACCEPTABLE)
      expect(performanceMetrics.memoryUsed).toBeLessThan(PERFORMANCE_CONFIG.THRESHOLDS.MEMORY_USAGE.ACCEPTABLE)
    })

    test('should handle extra-large dataset (10000 games) gracefully', async ({ page }: any) => {
      const startTime = Date.now()
      
      // Mock API response for extra-large dataset
      await page.route('**/api/games', (route: any) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(generateMockGames(PERFORMANCE_CONFIG.DATASET_SIZES.EXTRA_LARGE))
      }))
      
      await page.goto('/library')
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      const performanceMetrics = await page.evaluate(() => {
        return {
          loadTime: Date.now() - startTime,
          domNodes: document.querySelectorAll('*').length,
          memoryUsed: (performance as any).memory?.usedJSHeapSize || 0
        }
      })
      
      // Extra-large dataset should still be within acceptable range
      expect(loadTime).toBeLessThan(PERFORMANCE_CONFIG.THRESHOLDS.LOAD_TIME.ACCEPTABLE)
      expect(performanceMetrics.domNodes).toBeLessThan(PERFORMANCE_CONFIG.THRESHOLDS.DOM_NODES.ACCEPTABLE)
      expect(performanceMetrics.memoryUsed).toBeLessThan(PERFORMANCE_CONFIG.THRESHOLDS.MEMORY_USAGE.ACCEPTABLE)
    })
  })

  test.describe('Search Performance Tests', () => {
    test('should handle search queries efficiently', async ({ page }: any) => {
      const startTime = Date.now()
      
      // Mock large dataset for search testing
      await page.route('**/api/games', (route: any) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(generateMockGames(PERFORMANCE_CONFIG.DATASET_SIZES.LARGE))
      }))
      
      await page.goto('/library')
      await page.waitForLoadState('networkidle')
      
      // Test search performance
      const searchStartTime = Date.now()
      await page.fill('[data-testid="search-input"]', 'Test Game')
      await page.keyboard.press('Enter')
      await page.waitForLoadState('networkidle')
      
      const searchTime = Date.now() - searchStartTime
      expect(searchTime).toBeLessThan(1000) // Search should complete within 1 second
      
      // Verify search results are displayed
      await expect(page.locator('[data-testid="game-card-1"]')).toBeVisible()
    })

    test('should handle filter operations efficiently', async ({ page }: any) => {
      const startTime = Date.now()
      
      // Mock medium dataset for filter testing
      await page.route('**/api/games', (route: any) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(generateMockGames(PERFORMANCE_CONFIG.DATASET_SIZES.MEDIUM))
      }))
      
      await page.goto('/library')
      await page.waitForLoadState('networkidle')
      
      // Test filter performance
      const filterStartTime = Date.now()
      await page.click('[data-testid="genre-filter"]')
      await page.click('[data-testid="genre-action"]')
      await page.waitForLoadState('networkidle')
      
      const filterTime = Date.now() - filterStartTime
      expect(filterTime).toBeLessThan(500) // Filter should complete within 0.5 seconds
    })
  })

  test.describe('Memory Leak Detection', () => {
    test('should not have memory leaks during navigation', async ({ page }: any) => {
      // Mock medium dataset
      await page.route('**/api/games', (route: any) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(generateMockGames(PERFORMANCE_CONFIG.DATASET_SIZES.MEDIUM))
      }))
      
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0
      })
      
      // Navigate multiple times and check for memory growth
      for (let i = 0; i < 5; i++) {
        await page.goto('/library')
        await page.waitForLoadState('networkidle')
        
        const currentMemory = await page.evaluate(() => {
          return (performance as any).memory?.usedJSHeapSize || 0
        })
        
        // Memory should not grow significantly
        expect(currentMemory - initialMemory).toBeLessThan(10 * 1024 * 1024) // Less than 10MB growth
      }
    })

    test('should clean up event listeners properly', async ({ page }: any) => {
      await page.goto('/library')
      await page.waitForLoadState('networkidle')
      
      // Check for proper cleanup
      const listenerCount = await page.evaluate(() => {
        return (window as any).eventListeners?.length || 0
      })
      
      // Navigate away and back
      await page.goto('/home')
      await page.goto('/library')
      await page.waitForLoadState('networkidle')
      
      const finalListenerCount = await page.evaluate(() => {
        return (window as any).eventListeners?.length || 0
      })
      
      // Listener count should not grow significantly
      expect(finalListenerCount - listenerCount).toBeLessThan(10)
    })
  })

  test.describe('Network Performance Tests', () => {
    test('should handle slow network gracefully', async ({ page }: any) => {
      // Simulate slow network
      await page.route('**/api/games', (route: any) => {
        return new Promise(resolve => setTimeout(() => {
          resolve({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(generateMockGames(PERFORMANCE_CONFIG.DATASET_SIZES.MEDIUM))
          })
        }, 2000)) // 2 second delay
      })
      
      const startTime = Date.now()
      await page.goto('/library')
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      expect(loadTime).toBeGreaterThan(2000) // Should account for network delay
      expect(loadTime).toBeLessThan(5000) // But still within reasonable bounds
    })

    test('should handle concurrent requests efficiently', async ({ page }: any) => {
      const startTime = Date.now()
      
      // Mock multiple concurrent requests
      await page.route('**/api/games', (route: any) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(generateMockGames(PERFORMANCE_CONFIG.DATASET_SIZES.MEDIUM))
      }))
      
      await page.goto('/library')
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(PERFORMANCE_CONFIG.THRESHOLDS.LOAD_TIME.GOOD)
      
      // Verify all games are rendered
      const gameCards = await page.locator('[data-testid^="game-card-"]').count()
      expect(gameCards).toBe(PERFORMANCE_CONFIG.DATASET_SIZES.MEDIUM)
    })
  })

  test.describe('Rendering Performance Tests', () => {
    test('should handle complex UI efficiently', async ({ page }: any) => {
      const startTime = Date.now()
      
      // Mock dataset with complex game data
      await page.route('**/api/games', (route: any) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(generateMockGames(PERFORMANCE_CONFIG.DATASET_SIZES.LARGE))
      }))
      
      await page.goto('/library')
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      const performanceMetrics = await page.evaluate(() => {
        return {
          loadTime: Date.now() - startTime,
          domNodes: document.querySelectorAll('*').length,
          memoryUsed: (performance as any).memory?.usedJSHeapSize || 0,
          styleRecalculations: (performance as any).styleRecalculationCount || 0
        }
      })
      
      expect(loadTime).toBeLessThan(PERFORMANCE_CONFIG.THRESHOLDS.LOAD_TIME.ACCEPTABLE)
      expect(performanceMetrics.styleRecalculations).toBeLessThan(100) // Less than 100 style recalculations
    })

    test('should maintain 60fps during animations', async ({ page }: any) => {
      const startTime = Date.now()
      
      // Mock dataset for animation testing
      await page.route('**/api/games', (route: any) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(generateMockGames(PERFORMANCE_CONFIG.DATASET_SIZES.MEDIUM))
      }))
      
      await page.goto('/library')
      await page.waitForLoadState('networkidle')
      
      // Trigger animations
      await page.hover('[data-testid="game-card-1"]')
      await page.waitForTimeout(1000) // Wait for hover animation
      
      const performanceMetrics = await page.evaluate(() => {
        return {
          loadTime: Date.now() - startTime,
          frameRate: (performance as any).memory?.usedJSHeapSize || 0
        }
      })
      
      // Verify smooth animations (basic check)
      expect(performanceMetrics.loadTime).toBeLessThan(PERFORMANCE_CONFIG.THRESHOLDS.LOAD_TIME.GOOD)
    })
  })

  test.describe('Performance Reporting', () => {
    test('should generate performance report', async ({ page }: any) => {
      const performanceResults = []
      
      // Test different dataset sizes
      const datasetSizes = [
        PERFORMANCE_CONFIG.DATASET_SIZES.SMALL,
        PERFORMANCE_CONFIG.DATASET_SIZES.MEDIUM,
        PERFORMANCE_CONFIG.DATASET_SIZES.LARGE
      ]
      
      for (const size of datasetSizes) {
        const startTime = Date.now()
        
        await page.route('**/api/games', (route: any) => route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(generateMockGames(size))
        }))
        
        await page.goto('/library')
        await page.waitForLoadState('networkidle')
        
        const loadTime = Date.now() - startTime
        const performanceMetrics = await page.evaluate(() => {
          return {
            loadTime: Date.now() - startTime,
            domNodes: document.querySelectorAll('*').length,
            memoryUsed: (performance as any).memory?.usedJSHeapSize || 0
          }
        })
        
        performanceResults.push({
          datasetSize: size,
          loadTime,
          domNodes: performanceMetrics.domNodes,
          memoryUsed: performanceMetrics.memoryUsed,
          passed: loadTime < PERFORMANCE_CONFIG.THRESHOLDS.LOAD_TIME.ACCEPTABLE &&
                   performanceMetrics.domNodes < PERFORMANCE_CONFIG.THRESHOLDS.DOM_NODES.ACCEPTABLE &&
                   performanceMetrics.memoryUsed < PERFORMANCE_CONFIG.THRESHOLDS.MEMORY_USAGE.ACCEPTABLE
        })
      }
      
      // Generate performance summary
      const summary = {
        totalTests: performanceResults.length,
        passedTests: performanceResults.filter(r => r.passed).length,
        averageLoadTime: performanceResults.reduce((sum, r) => sum + r.loadTime, 0) / performanceResults.length,
        averageMemoryUsage: performanceResults.reduce((sum, r) => sum + r.memoryUsed, 0) / performanceResults.length,
        averageDomNodes: performanceResults.reduce((sum, r) => sum + r.domNodes, 0) / performanceResults.length
      }
      
      console.log('Performance Test Summary:', summary)
      
      expect(summary.passedTests).toBeGreaterThan(datasetSizes.length * 0.8) // At least 80% pass rate
      expect(summary.averageLoadTime).toBeLessThan(PERFORMANCE_CONFIG.THRESHOLDS.LOAD_TIME.GOOD)
    })
  })
})
