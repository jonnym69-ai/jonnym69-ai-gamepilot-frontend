import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useLibraryStore } from '../../stores/useLibraryStore'
import type { Game, PlayStatus } from '@gamepilot/types'

// Mock game data
const mockGames: Game[] = [
  {
    id: 'game-1',
    title: 'Test Game 1',
    coverImage: '/test-cover-1.jpg',
    genres: [{ id: 'action', name: 'Action', color: 'red', subgenres: [] }],
    subgenres: [],
    platforms: [{ id: 'pc', name: 'PC', code: 'pc' as any, isConnected: false }],
    emotionalTags: [],
    playStatus: 'unplayed' as PlayStatus,
    addedAt: new Date('2023-01-01'),
    isFavorite: false,
    releaseYear: 2023,
    tags: ['action', 'adventure'],
    hoursPlayed: 0,
    moods: [],
    playHistory: []
  },
  {
    id: 'game-2',
    title: 'Test Game 2',
    coverImage: '/test-cover-2.jpg',
    genres: [{ id: 'rpg', name: 'RPG', color: 'blue', subgenres: [] }],
    subgenres: [],
    platforms: [{ id: 'pc', name: 'PC', code: 'pc' as any, isConnected: false }],
    emotionalTags: [],
    playStatus: 'playing' as PlayStatus,
    addedAt: new Date('2023-01-02'),
    isFavorite: true,
    releaseYear: 2022,
    tags: ['rpg', 'story'],
    hoursPlayed: 25,
    moods: [],
    playHistory: []
  }
]

describe('useLibraryStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { actions } = useLibraryStore.getState()
    actions.clearGames()
  })

  describe('Game Management', () => {
    it('should add a new game', () => {
      const { result } = renderHook(() => useLibraryStore())
      
      act(() => {
        result.current.actions.addGame(mockGames[0])
      })

      const games = result.current.games
      expect(games).toHaveLength(1)
      expect(games[0]).toEqual(mockGames[0])
    })

    it('should update an existing game', () => {
      const { result } = renderHook(() => useLibraryStore())
      
      // Add a game first
      act(() => {
        result.current.actions.addGame(mockGames[0])
      })

      // Update the game
      act(() => {
        result.current.actions.updateGame(mockGames[0].id, {
          title: 'Updated Game Title',
          hoursPlayed: 10
        })
      })

      const games = result.current.games
      expect(games[0].title).toBe('Updated Game Title')
      expect(games[0].hoursPlayed).toBe(10)
    })

    it('should remove a game', () => {
      const { result } = renderHook(() => useLibraryStore())
      
      // Add games first
      act(() => {
        result.current.actions.addGame(mockGames[0])
        result.current.actions.addGame(mockGames[1])
      })

      expect(result.current.games).toHaveLength(2)

      // Remove one game
      act(() => {
        result.current.actions.removeGame(mockGames[0].id)
      })

      const games = result.current.games
      expect(games).toHaveLength(1)
      expect(games[0].id).toBe(mockGames[1].id)
    })

    it('should clear all games', () => {
      const { result } = renderHook(() => useLibraryStore())
      
      // Add games first
      act(() => {
        result.current.actions.addGame(mockGames[0])
        result.current.actions.addGame(mockGames[1])
      })

      expect(result.current.games).toHaveLength(2)

      // Clear all games
      act(() => {
        result.current.actions.clearGames()
      })

      expect(result.current.games).toHaveLength(0)
    })
  })

  describe('Game Status Management', () => {
    it('should update game status', () => {
      const { result } = renderHook(() => useLibraryStore())
      
      act(() => {
        result.current.actions.addGame(mockGames[0])
      })

      act(() => {
        result.current.actions.updateGameStatus(mockGames[0].id, 'completed')
      })

      const games = result.current.games
      expect(games[0].playStatus).toBe('completed')
    })

    it('should update game playtime', () => {
      const { result } = renderHook(() => useLibraryStore())
      
      act(() => {
        result.current.actions.addGame(mockGames[0])
      })

      act(() => {
        result.current.actions.updateGamePlaytime(mockGames[0].id, 15)
      })

      const games = result.current.games
      expect(games[0].hoursPlayed).toBe(15)
    })

    it('should toggle favorite status', () => {
      const { result } = renderHook(() => useLibraryStore())
      
      act(() => {
        result.current.actions.addGame(mockGames[0])
      })

      expect(result.current.games[0].isFavorite).toBe(false)

      act(() => {
        result.current.actions.toggleFavorite(mockGames[0].id)
      })

      expect(result.current.games[0].isFavorite).toBe(true)

      act(() => {
        result.current.actions.toggleFavorite(mockGames[0].id)
      })

      expect(result.current.games[0].isFavorite).toBe(false)
    })
  })

  describe('Game Search and Filtering', () => {
    beforeEach(() => {
      const { actions } = useLibraryStore.getState()
      mockGames.forEach(game => actions.addGame(game))
    })

    it('should search games by title', () => {
      const { result } = renderHook(() => useLibraryStore())
      
      act(() => {
        result.current.actions.searchGames('Test Game 1')
      })

      const searchResults = result.current.searchResults
      expect(searchResults).toHaveLength(1)
      expect(searchResults[0].title).toBe('Test Game 1')
    })

    it('should filter games by genre', () => {
      const { result } = renderHook(() => useLibraryStore())
      
      act(() => {
        result.current.actions.filterByGenres(['action'])
      })

      const filteredGames = result.current.filteredGames
      expect(filteredGames).toHaveLength(1)
      expect(filteredGames[0].genres[0].name).toBe('Action')
    })

    it('should filter games by status', () => {
      const { result } = renderHook(() => useLibraryStore())
      
      act(() => {
        result.current.actions.filterByStatus(['playing'])
      })

      const filteredGames = result.current.filteredGames
      expect(filteredGames).toHaveLength(1)
      expect(filteredGames[0].playStatus).toBe('playing')
    })

    it('should filter games by favorite status', () => {
      const { result } = renderHook(() => useLibraryStore())
      
      act(() => {
        result.current.actions.filterByFavorites(true)
      })

      const filteredGames = result.current.filteredGames
      expect(filteredGames).toHaveLength(1)
      expect(filteredGames[0].isFavorite).toBe(true)
    })
  })

  describe('Statistics and Analytics', () => {
    beforeEach(() => {
      const { actions } = useLibraryStore.getState()
      mockGames.forEach(game => actions.addGame(game))
    })

    it('should calculate total games count', () => {
      const { result } = renderHook(() => useLibraryStore())
      
      const stats = result.current.getStatistics()
      expect(stats.totalGames).toBe(2)
    })

    it('should calculate total playtime', () => {
      const { result } = renderHook(() => useLibraryStore())
      
      const stats = result.current.getStatistics()
      expect(stats.totalPlaytime).toBe(25) // 0 + 25
    })

    it('should calculate completion rate', () => {
      const { result } = renderHook(() => useLibraryStore())
      
      const stats = result.current.getStatistics()
      expect(stats.completionRate).toBe(0) // 0 completed out of 2
    })

    it('should calculate favorite count', () => {
      const { result } = renderHook(() => useLibraryStore())
      
      const stats = result.current.getStatistics()
      expect(stats.favoriteCount).toBe(1)
    })

    it('should get genre distribution', () => {
      const { result } = renderHook(() => useLibraryStore())
      
      const genreDistribution = result.current.getGenreDistribution()
      expect(genreDistribution['Action']).toBe(1)
      expect(genreDistribution['RPG']).toBe(1)
    })

    it('should get status distribution', () => {
      const { result } = renderHook(() => useLibraryStore())
      
      const statusDistribution = result.current.getStatusDistribution()
      expect(statusDistribution['unplayed']).toBe(1)
      expect(statusDistribution['playing']).toBe(1)
    })
  })

  describe('Bulk Operations', () => {
    beforeEach(() => {
      const { actions } = useLibraryStore.getState()
      mockGames.forEach(game => actions.addGame(game))
    })

    it('should update multiple games', () => {
      const { result } = renderHook(() => useLibraryStore())
      
      act(() => {
        result.current.actions.updateMultipleGames(
          [mockGames[0].id, mockGames[1].id],
          { isFavorite: true }
        )
      })

      const games = result.current.games
      expect(games[0].isFavorite).toBe(true)
      expect(games[1].isFavorite).toBe(true)
    })

    it('should remove multiple games', () => {
      const { result } = renderHook(() => useLibraryStore())
      
      act(() => {
        result.current.actions.removeMultipleGames([mockGames[0].id])
      })

      const games = result.current.games
      expect(games).toHaveLength(1)
      expect(games[0].id).toBe(mockGames[1].id)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid game ID gracefully', () => {
      const { result } = renderHook(() => useLibraryStore())
      
      // Try to update non-existent game
      expect(() => {
        result.current.actions.updateGame('invalid-id', { title: 'Updated' })
      }).not.toThrow()

      // Try to remove non-existent game
      expect(() => {
        result.current.actions.removeGame('invalid-id')
      }).not.toThrow()

      // Try to toggle favorite on non-existent game
      expect(() => {
        result.current.actions.toggleFavorite('invalid-id')
      }).not.toThrow()
    })

    it('should handle empty game list operations', () => {
      const { result } = renderHook(() => useLibraryStore())
      
      // Operations on empty list should not throw
      expect(() => {
        result.current.actions.searchGames('test')
        result.current.actions.filterByGenres(['action'])
        result.current.actions.filterByStatus(['playing'])
        result.current.actions.filterByFavorites(true)
      }).not.toThrow()

      expect(result.current.searchResults).toHaveLength(0)
      expect(result.current.filteredGames).toHaveLength(0)
    })
  })

  describe('Store Persistence', () => {
    it('should persist games across hook instances', () => {
      // Add games in first instance
      const { result: result1 } = renderHook(() => useLibraryStore())
      act(() => {
        result1.current.actions.addGame(mockGames[0])
      })

      // Create second instance and check if games are still there
      const { result: result2 } = renderHook(() => useLibraryStore())
      expect(result2.current.games).toHaveLength(1)
      expect(result2.current.games[0].id).toBe(mockGames[0].id)
    })
  })
})
