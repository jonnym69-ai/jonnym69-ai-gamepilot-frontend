const request = require('supertest') as any
import type { Game } from '@gamepilot/types'
import { PlatformCode } from '@gamepilot/types'

// Declare global server reference for testing
declare global {
  var __SERVER__: any
}

// Mock the library store for testing
jest.mock('../../../stores/useLibraryStore', () => ({
  useLibraryStore: jest.fn(() => ({
    games: [],
    currentSession: null,
    actions: {
      addGame: jest.fn(),
      updateGame: jest.fn(),
      removeGame: jest.fn(),
      updateGameStatus: jest.fn(),
      updateGamePlaytime: jest.fn(),
      setIntelligenceState: jest.fn()
    }
  }))
}))

describe('Games API', () => {
  let authToken: string

  beforeAll(async () => {
    // Mock authentication token for API tests
    authToken = 'mock-jwt-token-for-testing'
    
    // Setup test database with sample games
    const mockGames: Game[] = [
      {
        id: '1',
        title: 'Test Game 1',
        coverImage: '/test-cover-1.jpg',
        genres: [
          { id: 'action', name: 'Action', color: '#FF6B6B', subgenres: [] },
          { id: 'rpg', name: 'RPG', color: '#10B981', subgenres: [] }
        ],
        subgenres: [],
        platforms: [
          { id: 'steam', name: 'Steam', code: PlatformCode.STEAM, isConnected: false }
        ],
        emotionalTags: [],
        playStatus: 'unplayed',
        hoursPlayed: 0,
        userRating: 0,
        isFavorite: false,
        tags: ['test', 'sample'],
        addedAt: new Date('2023-01-01T00:00:00Z'),
        lastPlayed: undefined,
        releaseYear: 2023
      },
      {
        id: '2',
        title: 'Test Game 2',
        coverImage: '/test-cover-2.jpg',
        genres: [
          { id: 'strategy', name: 'Strategy', color: '#3B82F6', subgenres: [] }
        ],
        subgenres: [],
        platforms: [
          { id: 'epic', name: 'Epic', code: PlatformCode.EPIC, isConnected: false }
        ],
        emotionalTags: [],
        playStatus: 'playing',
        hoursPlayed: 25,
        userRating: 4,
        isFavorite: true,
        tags: ['favorite', 'strategy'],
        addedAt: new Date('2023-01-15T00:00:00Z'),
        lastPlayed: new Date('2023-01-10T00:00:00Z'),
        releaseYear: 2023
      },
      {
        id: '3',
        title: 'Test Game 3',
        coverImage: '/test-cover-3.jpg',
        genres: [
          { id: 'puzzle', name: 'Puzzle', color: '#8B5CF6', subgenres: [] }
        ],
        subgenres: [],
        platforms: [
          { id: 'nintendo', name: 'Nintendo', code: PlatformCode.NINTENDO, isConnected: false }
        ],
        emotionalTags: [],
        playStatus: 'completed',
        hoursPlayed: 50,
        userRating: 5,
        isFavorite: false,
        tags: ['completed', 'puzzle'],
        addedAt: new Date('2022-12-01T00:00:00Z'),
        lastPlayed: new Date('2023-01-05T00:00:00Z'),
        releaseYear: 2022
      }
    ]
  })

  afterAll(() => {
    // Clean up test data
    jest.clearAllMocks()
  })

  describe('GET /api/games', () => {
    it('should return 200 and games list', async () => {
      const response = await request(global.__SERVER__)
        .get('/api/games')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      const games = response.body
      expect(games).toHaveLength(3)
      expect(games[0]).toHaveProperty('id')
      expect(games[0]).toHaveProperty('title')
      expect(games[0]).toHaveProperty('coverImage')
      expect(games[0]).toHaveProperty('genres')
      expect(games[0]).toHaveProperty('platforms')
      expect(games[0]).toHaveProperty('playStatus')
    })

    it('should handle authentication errors', async () => {
      const response = await request(global.__SERVER__)
        .get('/api/games')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)

      const errorBody = response.body
      expect(errorBody).toHaveProperty('error')
    })

    it('should return 401 for missing token', async () => {
      const response = await request(global.__SERVER__)
        .get('/api/games')
        .expect(401)

      const errorBody = response.body
      expect(errorBody).toHaveProperty('message')
    })

    it('should handle empty games list', async () => {
      // Mock empty games response
      const { useLibraryStore } = require('../../../stores/useLibraryStore')
      useLibraryStore.mockReturnValueOnce({
        games: [],
        currentSession: null,
        actions: {
          addGame: jest.fn(),
          updateGame: jest.fn(),
          removeGame: jest.fn(),
          updateGameStatus: jest.fn(),
          updateGamePlaytime: jest.fn(),
          setIntelligenceState: jest.fn()
        }
      })

      const response = await request(global.__SERVER__)
        .get('/api/games')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      const games = response.body
      expect(games).toEqual([])
    })
  })

  describe('POST /api/games', () => {
    it('should create a new game', async () => {
      const newGame = {
        id: '4',
        title: 'New Test Game',
        coverImage: '/new-cover.jpg',
        genres: [
          { id: 'adventure', name: 'Adventure', color: '#10B981' }
        ],
        platforms: [
          { id: 'steam', name: 'Steam', code: 'steam', isConnected: false }
        ],
        playStatus: 'unplayed',
        hoursPlayed: 0,
        userRating: 0,
        isFavorite: false,
        tags: ['new'],
        addedAt: new Date(),
        lastPlayed: null
      }

      const response = await request(global.__SERVER__)
        .post('/api/games')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newGame)
        .expect(201)

      const createdGame = response.body
      expect(createdGame).toHaveProperty('id')
      expect(createdGame.title).toBe('New Test Game')
    })

    it('should handle validation errors', async () => {
      const invalidGame = {
        title: '', // Missing required field
        genres: [],
        platforms: []
      }

      const response = await request(global.__SERVER__)
        .post('/api/games')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidGame)
        .expect(400)

      const errorBody = response.body
      expect(errorBody).toHaveProperty('error')
    })

    it('should handle authentication errors on POST', async () => {
      const newGame = {
        id: '5',
        title: 'Unauthorized Game',
        coverImage: '/unauthorized-cover.jpg',
        genres: [],
        platforms: []
      }

      const response = await request(global.__SERVER__)
        .post('/api/games')
        .set('Authorization', 'Bearer invalid-token')
        .send(newGame)
        .expect(401)

      const errorBody = response.body
      expect(errorBody).toHaveProperty('message')
    })
  })

  describe('PUT /api/games/:id', () => {
    it('should update an existing game', async () => {
      const updatedGame = {
        title: 'Updated Test Game 1',
        playStatus: 'completed',
        hoursPlayed: 100,
        userRating: 5,
        isFavorite: true,
        tags: ['updated', 'completed']
      }

      const response = await request(global.__SERVER__)
        .put('/api/games/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedGame)
        .expect(200)

      const updatedGameResponse = response.body
      expect(updatedGameResponse.title).toBe('Updated Test Game 1')
      expect(updatedGameResponse.playStatus).toBe('completed')
    })

    it('should handle non-existent game', async () => {
      const response = await request(global.__SERVER__)
        .put('/api/games/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Game' })
        .expect(404)

      const errorBody = response.body
      expect(errorBody).toHaveProperty('error')
    })

    it('should handle validation errors on PUT', async () => {
      const invalidUpdate = {
        playStatus: 'invalid-status' // Invalid status
      }

      const response = await request(global.__SERVER__)
        .put('/api/games/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUpdate)
        .expect(400)

      const errorBody = response.body
      expect(errorBody).toHaveProperty('error')
    })
  })

  describe('DELETE /api/games/:id', () => {
    it('should delete a game', async () => {
      const response = await request(global.__SERVER__)
        .delete('/api/games/3')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      const deletedGameResponse = response.body
      expect(deletedGameResponse).toHaveProperty('message')
    })

    it('should handle non-existent game deletion', async () => {
      const response = await request(global.__SERVER__)
        .delete('/api/games/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      const errorBody = response.body
      expect(errorBody).toHaveProperty('error')
    })

    it('should handle authentication errors on DELETE', async () => {
      const response = await request(global.__SERVER__)
        .delete('/api/games/1')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)

      const errorBody = response.body
      expect(errorBody).toHaveProperty('message')
    })
  })
})
