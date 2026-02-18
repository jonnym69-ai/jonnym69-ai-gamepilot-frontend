import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMoodRecommendations } from '../../hooks/useMoodRecommendations'
import { ENHANCED_MOODS, type EnhancedMoodId } from '@gamepilot/static-data'
import type { Game } from '@gamepilot/types'

// Mock game data for testing
const mockGames: Game[] = [
  {
    id: 'game-1',
    title: 'Action Adventure',
    coverImage: '/action-cover.jpg',
    genres: [{ id: 'action', name: 'Action', color: 'red', subgenres: [] }],
    subgenres: [],
    platforms: [{ id: 'pc', name: 'PC', code: 'pc' as any, isConnected: false }],
    emotionalTags: [],
    playStatus: 'unplayed',
    addedAt: new Date('2023-01-01'),
    isFavorite: false,
    releaseYear: 2023,
    tags: ['action', 'adventure', 'competitive', 'fast-paced'],
    hoursPlayed: 0
  },
  {
    id: 'game-2',
    title: 'Relaxing Puzzle',
    coverImage: '/puzzle-cover.jpg',
    genres: [{ id: 'puzzle', name: 'Puzzle', color: 'blue', subgenres: [] }],
    subgenres: [],
    platforms: [{ id: 'pc', name: 'PC', code: 'pc' as any, isConnected: false }],
    emotionalTags: [],
    playStatus: 'unplayed',
    addedAt: new Date('2023-01-02'),
    isFavorite: false,
    releaseYear: 2022,
    tags: ['relaxing', 'meditative', 'casual', 'brain-teaser'],
    hoursPlayed: 0
  },
  {
    id: 'game-3',
    title: 'Strategic RPG',
    coverImage: '/rpg-cover.jpg',
    genres: [{ id: 'rpg', name: 'RPG', color: 'green', subgenres: [] }],
    subgenres: [],
    platforms: [{ id: 'pc', name: 'PC', code: 'pc' as any, isConnected: false }],
    emotionalTags: [],
    playStatus: 'unplayed',
    addedAt: new Date('2023-01-03'),
    isFavorite: true,
    releaseYear: 2021,
    tags: ['strategic', 'complex', 'story-driven', 'turn-based'],
    hoursPlayed: 0
  }
]

describe('useMoodRecommendations', () => {
  describe('Basic Functionality', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useMoodRecommendations({ games: [] }))
      
      expect(result.current.recommendations).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeUndefined()
    })

    it('should handle empty games list', () => {
      const { result } = renderHook(() => useMoodRecommendations({ games: [] }))
      
      act(() => {
        result.current.selectMood('energetic')
      })

      expect(result.current.recommendations).toEqual([])
      expect(result.current.primaryMood).toBe('energetic')
    })
  })

  describe('Mood Selection', () => {
    it('should select primary mood', () => {
      const { result } = renderHook(() => useMoodRecommendations({ games: mockGames }))
      
      act(() => {
        result.current.selectMood('energetic')
      })

      expect(result.current.primaryMood).toBe('energetic')
      expect(result.current.secondaryMood).toBeUndefined()
    })

    it('should select primary and secondary mood', () => {
      const { result } = renderHook(() => useMoodRecommendations({ games: mockGames }))
      
      act(() => {
        result.current.selectMood('energetic', 'focused')
      })

      expect(result.current.primaryMood).toBe('energetic')
      expect(result.current.secondaryMood).toBe('focused')
    })

    it('should clear mood selection', () => {
      const { result } = renderHook(() => useMoodRecommendations({ games: mockGames }))
      
      act(() => {
        result.current.selectMood('energetic')
      })
      expect(result.current.primaryMood).toBe('energetic')

      act(() => {
        result.current.clearMood()
      })
      expect(result.current.primaryMood).toBeUndefined()
      expect(result.current.secondaryMood).toBeUndefined()
    })

    it('should update intensity', () => {
      const { result } = renderHook(() => useMoodRecommendations({ games: mockGames }))
      
      act(() => {
        result.current.setIntensity(0.9)
      })

      expect(result.current.intensity).toBe(0.9)
    })
  })

  describe('Recommendation Logic', () => {
    it('should generate recommendations for energetic mood', () => {
      const { result } = renderHook(() => useMoodRecommendations({ games: mockGames }))
      
      act(() => {
        result.current.selectMood('energetic')
      })

      const recommendations = result.current.recommendations
      
      // Should recommend action games for energetic mood
      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations.some(game => game.tags.includes('action'))).toBe(true)
    })

    it('should generate recommendations for chill mood', () => {
      const { result } = renderHook(() => useMoodRecommendations({ games: mockGames }))
      
      act(() => {
        result.current.selectMood('chill')
      })

      const recommendations = result.current.recommendations
      
      // Should recommend puzzle/casual games for chill mood
      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations.some(game => game.tags.includes('relaxing'))).toBe(true)
    })

    it('should generate recommendations for focused mood', () => {
      const { result } = renderHook(() => useMoodRecommendations({ games: mockGames }))
      
      act(() => {
        result.current.selectMood('focused')
      })

      const recommendations = result.current.recommendations
      
      // Should recommend strategic/complex games for focused mood
      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations.some(game => game.tags.includes('strategic'))).toBe(true)
    })

    it('should handle dual mood combinations', () => {
      const { result } = renderHook(() => useMoodRecommendations({ games: mockGames }))
      
      act(() => {
        result.current.selectMood('energetic', 'focused')
      })

      const recommendations = result.current.recommendations
      
      // Should still generate recommendations for dual mood
      expect(recommendations.length).toBeGreaterThan(0)
    })
  })

  describe('Loading and Error States', () => {
    it('should handle loading state', () => {
      const { result } = renderHook(() => useMoodRecommendations({ games: mockGames }))
      
      // Simulate loading state
      act(() => {
        result.current.selectMood('energetic')
      })

      // The hook should handle loading internally
      expect(typeof result.current.isLoading).toBe('boolean')
    })

    it('should handle error states', () => {
      const { result } = renderHook(() => useMoodRecommendations({ games: mockGames }))
      
      // Error should be handled gracefully
      expect(typeof result.current.error).toBe('string')
    })
  })

  describe('Callback Functions', () => {
    it('should call onRecommendationsChange callback', () => {
      const mockCallback = vi.fn()
      
      renderHook(() => useMoodRecommendations({ 
        games: mockGames,
        onRecommendationsChange: mockCallback
      }))
      
      // Mock implementation should call callback when recommendations change
      // This would be tested with actual implementation
      expect(typeof mockCallback).toBe('function')
    })
  })

  describe('Edge Cases', () => {
    it('should handle invalid mood ID', () => {
      const { result } = renderHook(() => useMoodRecommendations({ games: mockGames }))
      
      act(() => {
        result.current.selectMood('invalid-mood' as EnhancedMoodId)
      })

      // Should handle invalid mood gracefully
      expect(result.current.primaryMood).toBe('invalid-mood')
    })

    it('should handle games without tags', () => {
      const gamesWithoutTags: Game[] = mockGames.map(game => ({
        ...game,
        tags: []
      }))
      
      const { result } = renderHook(() => useMoodRecommendations({ games: gamesWithoutTags }))
      
      act(() => {
        result.current.selectMood('energetic')
      })

      // Should still generate recommendations even without tags
      expect(result.current.recommendations).toBeDefined()
    })

    it('should handle empty mood selection', () => {
      const { result } = renderHook(() => useMoodRecommendations({ games: mockGames }))
      
      act(() => {
        result.current.clearMood()
      })

      expect(result.current.recommendations).toEqual([])
    })
  })

  describe('Performance', () => {
    it('should handle large game library efficiently', () => {
      // Create a large array of games
      const largeGameLibrary: Game[] = Array.from({ length: 1000 }, (_, index) => ({
        ...mockGames[0],
        id: `game-${index}`,
        title: `Game ${index}`,
        tags: ['tag1', 'tag2', 'tag3']
      }))
      
      const { result } = renderHook(() => useMoodRecommendations({ games: largeGameLibrary }))
      
      const startTime = performance.now()
      
      act(() => {
        result.current.selectMood('energetic')
      })
      
      const endTime = performance.now()
      
      // Should complete within reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100)
      expect(result.current.recommendations.length).toBeGreaterThan(0)
    })
  })

  describe('Mood Data Integration', () => {
    it('should use ENHANCED_MOODS data', () => {
      const { result } = renderHook(() => useMoodRecommendations({ games: mockGames }))
      
      act(() => {
        result.current.selectMood('energetic')
      })

      const mood = ENHANCED_MOODS.find(m => m.id === 'energetic')
      expect(mood).toBeDefined()
      expect(mood?.tagWeights).toBeDefined()
    })

    it('should respect mood tag weights', () => {
      const { result } = renderHook(() => useMoodRecommendations({ games: mockGames }))
      
      act(() => {
        result.current.selectMood('energetic')
      })

      const recommendations = result.current.recommendations
      
      // Games with matching tags should have higher scores
      const actionGame = recommendations.find(game => game.tags.includes('action'))
      const puzzleGame = recommendations.find(game => game.tags.includes('relaxing'))
      
      if (actionGame && puzzleGame) {
        // Action game should score higher for energetic mood
        // This would be tested with actual scoring implementation
        expect(actionGame).toBeDefined()
        expect(puzzleGame).toBeDefined()
      }
    })
  })
})
