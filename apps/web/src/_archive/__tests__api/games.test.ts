// Unit tests for games API endpoints
const request = require('supertest') as any
import express from 'express'
import app from '../app'

describe('Games API Endpoints', () => {
  describe('GET /api/games', () => {
    it('should return all games', async () => {
      const response = await request(app)
        .get('/api/games')
        .expect(200)
      
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)
    })

    it('should return games with correct structure', async () => {
      const response = await request(app)
        .get('/api/games')
        .expect(200)
      
      if (response.body.length > 0) {
        const game = response.body[0]
        expect(game).toHaveProperty('id')
        expect(game).toHaveProperty('title')
        expect(game).toHaveProperty('genre')
        expect(game).toHaveProperty('platform')
        expect(game).toHaveProperty('coverImage')
        expect(game).toHaveProperty('description')
        expect(game).toHaveProperty('releaseDate')
        expect(game).toHaveProperty('developer')
        expect(game).toHaveProperty('publisher')
        expect(game).toHaveProperty('price')
        expect(game).toHaveProperty('tags')
      }
    })

    it('should filter games by platform', async () => {
      const response = await request(app)
        .get('/api/games?platform=steam')
        .expect(200)
      
      expect(Array.isArray(response.body)).toBe(true)
      response.body.forEach((game: any) => {
        expect(game.platform).toBe('steam')
      })
    })

    it('should filter games by genre', async () => {
      const response = await request(app)
        .get('/api/games?genre=action')
        .expect(200)
      
      expect(Array.isArray(response.body)).toBe(true)
      response.body.forEach((game: any) => {
        expect(game.genre).toBe('action')
      })
    })

    it('should filter games by platform and genre', async () => {
      const response = await request(app)
        .get('/api/games?platform=steam&genre=action')
        .expect(200)
      
      expect(Array.isArray(response.body)).toBe(true)
      response.body.forEach((game: any) => {
        expect(game.platform).toBe('steam')
        expect(game.genre).toBe('action')
      })
    })

    it('should search games by title', async () => {
      const response = await request(app)
        .get('/api/games?search=action')
        .expect(200)
      
      expect(Array.isArray(response.body)).toBe(true)
      response.body.forEach((game: any) => {
        expect(game.title.toLowerCase()).toContain('action')
      })
    })

    it('should sort games by title', async () => {
      const response = await request(app)
        .get('/api/games?sort=title')
        .expect(200)
      
      expect(Array.isArray(response.body)).toBe(true)
      if (response.body.length > 1) {
        for (let i = 0; i < response.body.length - 1; i++) {
          expect(response.body[i].title.toLowerCase()).toBeLessThanOrEqual(response.body[i + 1].title.toLowerCase())
        }
      }
    })

    it('should sort games by release date', async () => {
      const response = await request(app)
        .get('/api/games?sort=releaseDate')
        .expect(200)
      
      expect(Array.isArray(response.body)).toBe(true)
      if (response.body.length > 1) {
        for (let i = 0; i < response.body.length - 1; i++) {
          expect(new Date(response.body[i].releaseDate).getTime()).toBeLessThanOrEqual(new Date(response.body[i + 1].releaseDate).getTime())
        }
      }
    })

    it('should sort games by rating', async () => {
      const response = await request(app)
        .get('/api/games?sort=rating')
        .expect(200)
      
      expect(Array.isArray(response.body)).toBe(true)
      if (response.body.length > 1) {
        for (let i = 0; i < response.body.length - 1; i++) {
          expect(response.body[i].rating).toBeGreaterThanOrEqual(response.body[i + 1].rating)
        }
      }
    })

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=10')
        .expect(200)
      
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeLessThanOrEqual(10)
    })

    it('should include pagination metadata', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=10')
        .expect(200)
      
      expect(response.body).toHaveProperty('data')
      expect(response.body).toHaveProperty('pagination')
      expect(response.body.pagination).toHaveProperty('page')
      expect(response.body.pagination).toHaveProperty('limit')
      expect(response.body.pagination).toHaveProperty('total')
      expect(response.body.pagination).toHaveProperty('totalPages')
    })

    it('should handle invalid platform filter gracefully', async () => {
      const response = await request(app)
        .get('/api/games?platform=invalid')
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should handle invalid genre filter gracefully', async () => {
      const response = await request(app)
        .get('/api/games?genre=invalid')
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should handle invalid sort parameter gracefully', async () => {
      const response = await request(app)
        .get('/api/games?sort=invalid')
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should handle invalid pagination parameters gracefully', async () => {
      const response = await request(app)
        .get('/api/games?page=-1')
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/games/:id', () => {
    it('should return a specific game by ID', async () => {
      // First get all games to find a valid ID
      const gamesResponse = await request(app)
        .get('/api/games')
        .expect(200)
      
      if (gamesResponse.body.length > 0) {
        const gameId = gamesResponse.body[0].id
        const response = await request(app)
          .get(`/api/games/${gameId}`)
          .expect(200)
        
        expect(response.body).toHaveProperty('id')
        expect(response.body.id).toBe(gameId)
        expect(response.body).toHaveProperty('title')
        expect(response.body).toHaveProperty('genre')
        expect(response.body).toHaveProperty('platform')
      }
    })

    it('should return 404 for non-existent game ID', async () => {
      const response = await request(app)
        .get('/api/games/non-existent-id')
        .expect(404)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should return game with all required fields', async () => {
      const gamesResponse = await request(app)
        .get('/api/games')
        .expect(200)
      
      if (gamesResponse.body.length > 0) {
        const gameId = gamesResponse.body[0].id
        const response = await request(app)
          .get(`/api/games/${gameId}`)
          .expect(200)
        
        const game = response.body
        expect(game).toHaveProperty('id')
        expect(game).toHaveProperty('title')
        expect(game).toHaveProperty('genre')
        expect(game).toHaveProperty('platform')
        expect(game).toHaveProperty('coverImage')
        expect(game).toHaveProperty('description')
        expect(game).toHaveProperty('releaseDate')
        expect(game).toHaveProperty('developer')
        expect(game).toHaveProperty('publisher')
        expect(game).toHaveProperty('price')
        expect(game).toHaveProperty('tags')
        expect(Array.isArray(game.tags)).toBe(true)
      }
    })
  })

  describe('POST /api/games', () => {
    it('should create a new game', async () => {
      const newGame = {
        title: 'Test Game',
        genre: 'action',
        platform: 'steam',
        coverImage: 'https://example.com/cover.jpg',
        description: 'A test game for unit testing',
        releaseDate: '2023-01-01',
        developer: 'Test Developer',
        publisher: 'Test Publisher',
        price: 29.99,
        tags: ['test', 'action', 'steam']
      }

      const response = await request(app)
        .post('/api/games')
        .send(newGame)
        .expect(201)
      
      expect(response.body).toHaveProperty('id')
      expect(response.body.title).toBe(newGame.title)
      expect(response.body.genre).toBe(newGame.genre)
      expect(response.body.platform).toBe(newGame.platform)
      expect(response.body.description).toBe(newGame.description)
      expect(response.body.developer).toBe(newGame.developer)
      expect(response.body.publisher).toBe(newGame.publisher)
      expect(response.body.price).toBe(newGame.price)
      expect(response.body.tags).toEqual(newGame.tags)
    })

    it('should validate required fields', async () => {
      const invalidGame = {
        // Missing required fields
        genre: 'action',
        platform: 'steam'
      }

      const response = await request(app)
        .post('/api/games')
        .send(invalidGame)
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should validate title field', async () => {
      const invalidGame = {
        title: '',
        genre: 'action',
        platform: 'steam',
        coverImage: 'https://example.com/cover.jpg',
        description: 'A test game',
        releaseDate: '2023-01-01',
        developer: 'Test Developer',
        publisher: 'Test Publisher',
        price: 29.99,
        tags: []
      }

      const response = await request(app)
        .post('/api/games')
        .send(invalidGame)
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should validate genre field', async () => {
      const invalidGame = {
        title: 'Test Game',
        genre: '',
        platform: 'steam',
        coverImage: 'https://example.com/cover.jpg',
        description: 'A test game',
        releaseDate: '2023-01-01',
        developer: 'Test Developer',
        publisher: 'Test Publisher',
        price: 29.99,
        tags: []
      }

      const response = await request(app)
        .post('/api/games')
        .send(invalidGame)
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should validate platform field', async () => {
      const invalidGame = {
        title: 'Test Game',
        genre: 'action',
        platform: '',
        coverImage: 'https://example.com/cover.jpg',
        description: 'A test game',
        releaseDate: '2023-01-01',
        developer: 'Test Developer',
        publisher: 'Test Publisher',
        price: 29.99,
        tags: []
      }

      const response = await request(app)
        .post('/api/games')
        .send(invalidGame)
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should validate price field', async () => {
      const invalidGame = {
        title: 'Test Game',
        genre: 'action',
        platform: 'steam',
        coverImage: 'https://example.com/cover.jpg',
        description: 'A test game',
        releaseDate: '2023-01-01',
        developer: 'Test Developer',
        publisher: 'Test Publisher',
        price: -10, // Invalid negative price
        tags: []
      }

      const response = await request(app)
        .post('/api/games')
        .send(invalidGame)
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should validate tags array', async () => {
      const invalidGame = {
        title: 'Test Game',
        genre: 'action',
        platform: 'steam',
        coverImage: 'https://example.com/cover.jpg',
        description: 'A test game',
        releaseDate: '2023-01-01',
        developer: 'Test Developer',
        publisher: 'Test Publisher',
        price: 29.99,
        tags: 'invalid-tag' // Should be array
      }

      const response = await request(app)
        .post('/api/games')
        .send(invalidGame)
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should validate release date format', async () => {
      const invalidGame = {
        title: 'Test Game',
        genre: 'action',
        platform: 'steam',
        coverImage: 'https://example.com/cover.jpg',
        description: 'A test game',
        releaseDate: 'invalid-date',
        developer: 'Test Developer',
        publisher: 'Test Publisher',
        price: 29.99,
        tags: []
      }

      const response = await request(app)
        .post('/api/games')
        .send(invalidGame)
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should validate URL format for cover image', async () => {
      const invalidGame = {
        title: 'Test Game',
        genre: 'action',
        platform: 'steam',
        coverImage: 'invalid-url',
        description: 'A test game',
        releaseDate: '2023-01-01',
        developer: 'Test Developer',
        publisher: 'Test Publisher',
        price: 29.99,
        tags: []
      }

      const response = await request(app)
        .post('/api/games')
        .send(invalidGame)
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PUT /api/games/:id', () => {
    it('should update an existing game', async () => {
      // First create a game
      const newGame = {
        title: 'Test Game',
        genre: 'action',
        platform: 'steam',
        coverImage: 'https://example.com/cover.jpg',
        description: 'A test game for unit testing',
        releaseDate: '2023-01-01',
        developer: 'Test Developer',
        publisher: 'Test Publisher',
        price: 29.99,
        tags: ['test', 'action']
      }

      const createResponse = await request(app)
        .post('/api/games')
        .send(newGame)
        .expect(201)

      const gameId = createResponse.body.id

      // Update the game
      const updatedGame = {
        title: 'Updated Test Game',
        description: 'Updated description',
        price: 39.99
      }

      const updateResponse = await request(app)
        .put(`/api/games/${gameId}`)
        .send(updatedGame)
        .expect(200)

      expect(updateResponse.body.title).toBe(updatedGame.title)
      expect(updateResponse.body.description).toBe(updatedGame.description)
      expect(updateResponse.body.price).toBe(updatedGame.price)
      expect(updateResponse.body.genre).toBe(newGame.genre) // Unchanged field
      expect(updateResponse.body.platform).toBe(newGame.platform) // Unchanged field
    })

    it('should return 404 for non-existent game ID', async () => {
      const updatedGame = {
        title: 'Updated Game',
        description: 'Updated description'
      }

      const response = await request(app)
        .put('/api/games/non-existent-id')
        .send(updatedGame)
        .expect(404)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should validate update fields', async () => {
      // First create a game
      const newGame = {
        title: 'Test Game',
        genre: 'action',
        platform: 'steam',
        coverImage: 'https://example.com/cover.jpg',
        description: 'A test game for unit testing',
        releaseDate: '2023-01-01',
        developer: 'Test Developer',
        publisher: 'Test Publisher',
        price: 29.99,
        tags: []
      }

      const createResponse = await request(app)
        .post('/api/games')
        .send(newGame)
        .expect(201)

      const gameId = createResponse.body.id

      // Try to update with invalid data
      const invalidUpdate = {
        title: '', // Invalid empty title
        price: -10 // Invalid negative price
      }

      const response = await request(app)
        .put(`/api/games/${gameId}`)
        .send(invalidUpdate)
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('DELETE /api/games/:id', () => {
    it('should delete an existing game', async () => {
      // First create a game
      const newGame = {
        title: 'Test Game',
        genre: 'action',
        platform: 'steam',
        coverImage: 'https://example.com/cover.jpg',
        description: 'A test game for unit testing',
        releaseDate: '2023-01-01',
        developer: 'Test Developer',
        publisher: 'Test Publisher',
        price: 29.99,
        tags: []
      }

      const createResponse = await request(app)
        .post('/api/games')
        .send(newGame)
        .expect(201)

      const gameId = createResponse.body.id

      // Delete the game
      const deleteResponse = await request(app)
        .delete(`/api/games/${gameId}`)
        .expect(200)
      
      expect(deleteResponse.body).toHaveProperty('message')
      expect(deleteResponse.body.message).toContain('deleted')
    })

    it('should return 404 for non-existent game ID', async () => {
      const response = await request(app)
        .delete('/api/games/non-existent-id')
        .expect(404)
      
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/games/:id/stats', () => {
    it('should return game statistics', async () => {
      // First create a game
      const newGame = {
        title: 'Test Game',
        genre: 'action',
        platform: 'steam',
        coverImage: 'https://example.com/cover.jpg',
        description: 'A test game for unit testing',
        releaseDate: '2023-01-01',
        developer: 'Test Developer',
        publisher: 'Test Publisher',
        price: 29.99,
        tags: ['test', 'action']
      }

      const createResponse = await request(app)
        .post('/api/games')
        .send(newGame)
        .expect(201)

      const gameId = createResponse.body.id

      // Get game stats
      const response = await request(app)
        .get(`/api/games/${gameId}/stats`)
        .expect(200)
      
      expect(response.body).toHaveProperty('gameId')
      expect(response.body.gameId).toBe(gameId)
      expect(response.body).toHaveProperty('totalPlaytime')
      expect(response.body).toHaveProperty('sessionsPlayed')
      expect(response.body).toHaveProperty('averageSessionDuration')
      expect(response.body).toHaveProperty('completionRate')
      expect(response.body).toHaveProperty('lastPlayed')
      expect(typeof response.body.totalPlaytime).toBe('number')
      expect(typeof response.body.sessionsPlayed).toBe('number')
      expect(typeof response.body.averageSessionDuration).toBe('number')
      expect(typeof response.body.completionRate).toBe('number')
    })

    it('should return 404 for non-existent game ID', async () => {
      const response = await request(app)
        .get('/api/games/non-existent-id/stats')
        .expect(404)
      
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/games/:id/play', () => {
    it('should record a play session', async () => {
      // First create a game
      const newGame = {
        title: 'Test Game',
        genre: 'action',
        platform: 'steam',
        coverImage: 'https://example.com/cover.jpg',
        description: 'A test game for unit testing',
        releaseDate: '2023-01-01',
        developer: 'Test Developer',
        publisher: 'Test Publisher',
        price: 29.99,
        tags: ['test', 'action']
      }

      const createResponse = await request(app)
        .post('/api/games')
        .send(newGame)
        .expect(201)

      const gameId = createResponse.body.id

      // Record a play session
      const playSession = {
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        duration: 60,
        achievements: ['first_win'],
        playerActions: ['kill', 'explore'],
        mood: 'competitive',
        completionRate: 75
      }

      const response = await request(app)
        .post(`/api/games/${gameId}/play`)
        .send(playSession)
        .expect(201)
      
      expect(response.body).toHaveProperty('sessionId')
      expect(response.body).toHaveProperty('gameId')
      expect(response.body.gameId).toBe(gameId)
      expect(response.body).toHaveProperty('startTime')
      expect(response.body).toHaveProperty('endTime')
      expect(response.body).toHaveProperty('duration')
      expect(response.body).toHaveProperty('achievements')
      expect(response.body).toHaveProperty('playerActions')
      expect(response.body).toHaveProperty('mood')
      expect(response.body).toHaveProperty('completionRate')
    })

    it('should return 404 for non-existent game ID', async () => {
      const playSession = {
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        duration: 60,
        achievements: [],
        playerActions: [],
        mood: 'chill',
        completionRate: 50
      }

      const response = await request(app)
        .post('/api/games/non-existent-id/play')
        .send(playSession)
        .expect(404)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should validate play session data', async () => {
      // First create a game
      const newGame = {
        title: 'Test Game',
        genre: 'action',
        platform: 'steam',
        coverImage: 'https://example.com/cover.jpg',
        description: 'A test game for unit testing',
        releaseDate: '2023-01-01',
        developer: 'Test Developer',
        publisher: 'Test Publisher',
        price: 29.99,
        tags: []
      }

      const createResponse = await request(app)
        .post('/api/games')
        .send(newGame)
        .expect(201)

      const gameId = createResponse.body.id

      // Try to record invalid play session
      const invalidSession = {
        startTime: 'invalid-date',
        endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        duration: 60,
        achievements: [],
        playerActions: [],
        mood: 'chill',
        completionRate: 50
      }

      const response = await request(app)
        .post(`/api/games/${gameId}/play`)
        .send(invalidSession)
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })
  })
})
