// Integration tests for games API endpoints
const request = require('supertest') as any
import { app } from '../../index'

// Declare global server reference for testing
declare global {
  var __SERVER__: any
}

describe('Games API Integration Tests', () => {
  let testGameId: string

  describe('POST /api/games', () => {
    it('should create a new game', async () => {
      const newGame = {
        title: 'Integration Test Game',
        genre: 'action',
        platform: 'steam',
        coverImage: 'https://example.com/cover.jpg',
        description: 'A game created for integration testing',
        releaseDate: '2023-01-01',
        developer: 'Test Developer',
        publisher: 'Test Publisher',
        price: 29.99,
        tags: ['test', 'action', 'integration']
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
      
      testGameId = response.body.id
    })

    it('should return 400 for invalid game data', async () => {
      const invalidGame = {
        title: '',
        genre: 'action',
        platform: 'steam',
        coverImage: 'invalid-url',
        description: 'A test game',
        releaseDate: 'invalid-date',
        developer: 'Test Developer',
        publisher: 'Test Publisher',
        price: -10,
        tags: 'invalid-tag'
      }

      const response = await request(app)
        .post('/api/games')
        .send(invalidGame)
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('validation')
    })
  })

  describe('GET /api/games', () => {
    it('should return all games including the test game', async () => {
      const response = await request(app)
        .get('/api/games')
        .expect(200)
      
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeGreaterThan(0)
      
      const testGame = response.body.find((game: any) => game.id === testGameId)
      expect(testGame).toBeDefined()
      expect(testGame.title).toBe('Integration Test Game')
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

    it('should search games by title', async () => {
      const response = await request(app)
        .get('/api/games?search=integration')
        .expect(200)
      
      expect(Array.isArray(response.body)).toBe(true)
      const testGame = response.body.find((game: any) => game.id === testGameId)
      expect(testGame).toBeDefined()
    })

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=5')
        .expect(200)
      
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeLessThanOrEqual(5)
    })
  })

  describe('GET /api/games/:id', () => {
    it('should return the test game by ID', async () => {
      const response = await request(app)
        .get(`/api/games/${testGameId}`)
        .expect(200)
      
      expect(response.body.id).toBe(testGameId)
      expect(response.body.title).toBe('Integration Test Game')
      expect(response.body.genre).toBe('action')
      expect(response.body.platform).toBe('steam')
    })

    it('should return 404 for non-existent game', async () => {
      const response = await request(app)
        .get('/api/games/non-existent-id')
        .expect(404)
      
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PUT /api/games/:id', () => {
    it('should update the test game', async () => {
      const updateData = {
        title: 'Updated Integration Test Game',
        description: 'Updated description',
        price: 39.99
      }

      const response = await request(app)
        .put(`/api/games/${testGameId}`)
        .send(updateData)
        .expect(200)
      
      expect(response.body.id).toBe(testGameId)
      expect(response.body.title).toBe(updateData.title)
      expect(response.body.description).toBe(updateData.description)
      expect(response.body.price).toBe(updateData.price)
      expect(response.body.genre).toBe('action') // Unchanged
      expect(response.body.platform).toBe('steam') // Unchanged
    })

    it('should return 404 for non-existent game', async () => {
      const updateData = {
        title: 'Updated Game',
        description: 'Updated description'
      }

      const response = await request(app)
        .put('/api/games/non-existent-id')
        .send(updateData)
        .expect(404)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should return 400 for invalid update data', async () => {
      const invalidUpdate = {
        title: '',
        price: -10
      }

      const response = await request(app)
        .put(`/api/games/${testGameId}`)
        .send(invalidUpdate)
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/games/:id/play', () => {
    it('should record a play session for the test game', async () => {
      const playSession = {
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        duration: 60,
        achievements: ['integration_test_achievement'],
        playerActions: ['test_action', 'integration_action'],
        mood: 'competitive',
        completionRate: 75
      }

      const response = await request(app)
        .post(`/api/games/${testGameId}/play`)
        .send(playSession)
        .expect(201)
      
      expect(response.body).toHaveProperty('sessionId')
      expect(response.body.gameId).toBe(testGameId)
      expect(response.body.startTime).toBe(playSession.startTime)
      expect(response.body.endTime).toBe(playSession.endTime)
      expect(response.body.duration).toBe(playSession.duration)
      expect(response.body.achievements).toEqual(playSession.achievements)
      expect(response.body.playerActions).toEqual(playSession.playerActions)
      expect(response.body.mood).toBe(playSession.mood)
      expect(response.body.completionRate).toBe(playSession.completionRate)
    })

    it('should return 404 for non-existent game', async () => {
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

    it('should return 400 for invalid play session data', async () => {
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
        .post(`/api/games/${testGameId}/play`)
        .send(invalidSession)
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/games/:id/stats', () => {
    it('should return game statistics for the test game', async () => {
      const response = await request(app)
        .get(`/api/games/${testGameId}/stats`)
        .expect(200)
      
      expect(response.body).toHaveProperty('gameId')
      expect(response.body.gameId).toBe(testGameId)
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

    it('should return 404 for non-existent game', async () => {
      const response = await request(app)
        .get('/api/games/non-existent-id/stats')
        .expect(404)
      
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('DELETE /api/games/:id', () => {
    it('should delete the test game', async () => {
      const response = await request(app)
        .delete(`/api/games/${testGameId}`)
        .expect(200)
      
      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toContain('deleted')
    })

    it('should return 404 when trying to delete the deleted game', async () => {
      const response = await request(app)
        .delete(`/api/games/${testGameId}`)
        .expect(404)
      
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('API Error Handling', () => {
    it('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/api/games')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should handle missing content-type', async () => {
      const response = await request(app)
        .post('/api/games')
        .send('some data')
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({})
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should handle very large request body', async () => {
      const largeGame = {
        title: 'x'.repeat(10000), // Very long title
        genre: 'action',
        platform: 'steam',
        coverImage: 'https://example.com/cover.jpg',
        description: 'x'.repeat(50000), // Very long description
        releaseDate: '2023-01-01',
        developer: 'Test Developer',
        publisher: 'Test Publisher',
        price: 29.99,
        tags: Array(1000).fill('tag') // Many tags
      }

      const response = await request(app)
        .post('/api/games')
        .send(largeGame)
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('API Performance', () => {
    it('should respond within reasonable time for GET requests', async () => {
      const startTime = Date.now()
      await request(app)
        .get('/api/games')
        .expect(200)
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeLessThan(1000) // Should respond within 1 second
    })

    it('should respond within reasonable time for POST requests', async () => {
      const newGame = {
        title: 'Performance Test Game',
        genre: 'action',
        platform: 'steam',
        coverImage: 'https://example.com/cover.jpg',
        description: 'A game for performance testing',
        releaseDate: '2023-01-01',
        developer: 'Test Developer',
        publisher: 'Test Publisher',
        price: 29.99,
        tags: ['test', 'performance']
      }

      const startTime = Date.now()
      const response = await request(app)
        .post('/api/games')
        .send(newGame)
        .expect(201)
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeLessThan(500) // Should respond within 500ms
      
      // Clean up
      await request(app)
        .delete(`/api/games/${response.body.id}`)
        .expect(200)
    })

    it('should handle concurrent requests', async () => {
      const promises = Array(10).fill(null).map(() => 
        request(app).get('/api/games')
      )
      
      const responses = await Promise.all(promises)
      responses.forEach((response: any) => {
        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
      })
    })
  })

  describe('API Security', () => {
    it('should sanitize input to prevent XSS', async () => {
      const maliciousGame = {
        title: '<script>alert("xss")</script>',
        genre: 'action',
        platform: 'steam',
        coverImage: 'https://example.com/cover.jpg',
        description: '<script>alert("xss")</script>',
        releaseDate: '2023-01-01',
        developer: 'Test Developer',
        publisher: 'Test Publisher',
        price: 29.99,
        tags: ['<script>alert("xss")</script>']
      }

      const response = await request(app)
        .post('/api/games')
        .send(maliciousGame)
        .expect(201)
      
      // Check that script tags are not present in response
      expect(response.body.title).not.toContain('<script>')
      expect(response.body.description).not.toContain('<script>')
      expect(response.body.tags[0]).not.toContain('<script>')
      
      // Clean up
      await request(app)
        .delete(`/api/games/${response.body.id}`)
        .expect(200)
    })

    it('should handle SQL injection attempts', async () => {
      const sqlInjectionGame = {
        title: "'; DROP TABLE games; --",
        genre: 'action',
        platform: 'steam',
        coverImage: 'https://example.com/cover.jpg',
        description: "'; DROP TABLE games; --",
        releaseDate: '2023-01-01',
        developer: 'Test Developer',
        publisher: 'Test Publisher',
        price: 29.99,
        tags: ["'; DROP TABLE games; --"]
      }

      const response = await request(app)
        .post('/api/games')
        .send(sqlInjectionGame)
        .expect(201)
      
      // Check that the game was created with the literal string, not executed as SQL
      expect(response.body.title).toBe("'; DROP TABLE games; --")
      
      // Clean up
      await request(app)
        .delete(`/api/games/${response.body.id}`)
        .expect(200)
    })
  })
})
