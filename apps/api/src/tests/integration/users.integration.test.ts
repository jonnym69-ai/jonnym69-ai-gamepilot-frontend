// Integration tests for user API endpoints
const request = require('supertest') as any
import { app } from '../../index'

describe('User API Integration Tests', () => {
  let testUserId: string
  let testUserToken: string

  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const newUser = {
        email: 'integration-test@example.com',
        username: 'integrationtest',
        password: 'TestPassword123!',
        displayName: 'Integration Test User',
        timezone: 'UTC'
      }

      const response = await request(app)
        .post('/api/users/register')
        .send(newUser)
        .expect(201)
      
      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('token')
      expect(response.body.user.email).toBe(newUser.email)
      expect(response.body.user.username).toBe(newUser.username)
      expect(response.body.user.displayName).toBe(newUser.displayName)
      expect(response.body.user.timezone).toBe(newUser.timezone)
      expect(response.body.user).not.toHaveProperty('password')
      
      testUserId = response.body.user.id
      testUserToken = response.body.token
    })

    it('should return 400 for duplicate email', async () => {
      const duplicateUser = {
        email: 'integration-test@example.com',
        username: 'differentuser',
        password: 'TestPassword123!',
        displayName: 'Different User',
        timezone: 'UTC'
      }

      const response = await request(app)
        .post('/api/users/register')
        .send(duplicateUser)
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('email')
    })

    it('should return 400 for duplicate username', async () => {
      const duplicateUser = {
        email: 'different@example.com',
        username: 'integrationtest',
        password: 'TestPassword123!',
        displayName: 'Different User',
        timezone: 'UTC'
      }

      const response = await request(app)
        .post('/api/users/register')
        .send(duplicateUser)
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('username')
    })

    it('should return 400 for invalid email format', async () => {
      const invalidUser = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'TestPassword123!',
        displayName: 'Test User',
        timezone: 'UTC'
      }

      const response = await request(app)
        .post('/api/users/register')
        .send(invalidUser)
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should return 400 for weak password', async () => {
      const weakUser = {
        email: 'weak@example.com',
        username: 'weakuser',
        password: '123',
        displayName: 'Weak User',
        timezone: 'UTC'
      }

      const response = await request(app)
        .post('/api/users/register')
        .send(weakUser)
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/users/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'integration-test@example.com',
        password: 'TestPassword123!'
      }

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(200)
      
      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('token')
      expect(response.body.user.email).toBe(loginData.email)
      expect(response.body.user).not.toHaveProperty('password')
    })

    it('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'TestPassword123!'
      }

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(401)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should return 401 for invalid password', async () => {
      const loginData = {
        email: 'integration-test@example.com',
        password: 'WrongPassword123!'
      }

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(401)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({})
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/users/profile', () => {
    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200)
      
      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('email')
      expect(response.body).toHaveProperty('username')
      expect(response.body).toHaveProperty('displayName')
      expect(response.body).toHaveProperty('gamingProfile')
      expect(response.body).toHaveProperty('integrations')
      expect(response.body).toHaveProperty('privacy')
      expect(response.body).toHaveProperty('preferences')
      expect(response.body).toHaveProperty('social')
      expect(response.body).not.toHaveProperty('password')
    })

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
      
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PUT /api/users/profile', () => {
    it('should update user profile with valid token', async () => {
      const updateData = {
        displayName: 'Updated Integration Test User',
        bio: 'Updated bio for integration testing',
        location: 'Updated Location',
        website: 'https://updated-example.com'
      }

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(updateData)
        .expect(200)
      
      expect(response.body.displayName).toBe(updateData.displayName)
      expect(response.body.bio).toBe(updateData.bio)
      expect(response.body.location).toBe(updateData.location)
      expect(response.body.website).toBe(updateData.website)
    })

    it('should return 401 without token', async () => {
      const updateData = {
        displayName: 'Updated User'
      }

      const response = await request(app)
        .put('/api/users/profile')
        .send(updateData)
        .expect(401)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should return 400 for invalid update data', async () => {
      const invalidUpdate = {
        displayName: '',
        email: 'invalid-email'
      }

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(invalidUpdate)
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PUT /api/users/preferences', () => {
    it('should update user preferences with valid token', async () => {
      const preferences = {
        theme: 'dark',
        language: 'en',
        notifications: {
          email: false,
          push: true,
          achievements: true,
          recommendations: false,
          friendActivity: true,
          platformUpdates: false
        },
        display: {
          compactMode: true,
          showGameCovers: false,
          animateTransitions: false,
          showRatings: true
        }
      }

      const response = await request(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(preferences)
        .expect(200)
      
      expect(response.body.theme).toBe(preferences.theme)
      expect(response.body.language).toBe(preferences.language)
      expect(response.body.notifications).toEqual(preferences.notifications)
      expect(response.body.display).toEqual(preferences.display)
    })

    it('should return 401 without token', async () => {
      const preferences = {
        theme: 'light'
      }

      const response = await request(app)
        .put('/api/users/preferences')
        .send(preferences)
        .expect(401)
      
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PUT /api/users/privacy', () => {
    it('should update user privacy settings with valid token', async () => {
      const privacy = {
        profileVisibility: 'friends',
        sharePlaytime: false,
        shareAchievements: false,
        shareGameLibrary: false,
        allowFriendRequests: false,
        showOnlineStatus: false
      }

      const response = await request(app)
        .put('/api/users/privacy')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(privacy)
        .expect(200)
      
      expect(response.body.profileVisibility).toBe(privacy.profileVisibility)
      expect(response.body.sharePlaytime).toBe(privacy.sharePlaytime)
      expect(response.body.shareAchievements).toBe(privacy.shareAchievements)
      expect(response.body.shareGameLibrary).toBe(privacy.shareGameLibrary)
      expect(response.body.allowFriendRequests).toBe(privacy.allowFriendRequests)
      expect(response.body.showOnlineStatus).toBe(privacy.showOnlineStatus)
    })

    it('should return 401 without token', async () => {
      const privacy = {
        profileVisibility: 'public'
      }

      const response = await request(app)
        .put('/api/users/privacy')
        .send(privacy)
        .expect(401)
      
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/users/stats', () => {
    it('should return user statistics with valid token', async () => {
      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200)
      
      expect(response.body).toHaveProperty('totalPlaytime')
      expect(response.body).toHaveProperty('gamesPlayed')
      expect(response.body).toHaveProperty('gamesCompleted')
      expect(response.body).toHaveProperty('achievementsCount')
      expect(response.body).toHaveProperty('averageRating')
      expect(response.body).toHaveProperty('currentStreak')
      expect(response.body).toHaveProperty('longestStreak')
      expect(typeof response.body.totalPlaytime).toBe('number')
      expect(typeof response.body.gamesPlayed).toBe('number')
      expect(typeof response.body.gamesCompleted).toBe('number')
      expect(typeof response.body.achievementsCount).toBe('number')
    })

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/users/stats')
        .expect(401)
      
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('POST /api/users/logout', () => {
    it('should logout with valid token', async () => {
      const response = await request(app)
        .post('/api/users/logout')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200)
      
      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toContain('logged out')
    })

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/users/logout')
        .expect(401)
      
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('DELETE /api/users/account', () => {
    it('should delete user account with valid token', async () => {
      // Login again to get a fresh token
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: 'integration-test@example.com',
          password: 'TestPassword123!'
        })
        .expect(200)
      
      const freshToken = loginResponse.body.token

      const response = await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${freshToken}`)
        .expect(200)
      
      expect(response.body).toHaveProperty('message')
      expect(response.body.message).toContain('deleted')
    })

    it('should return 401 without token', async () => {
      const response = await request(app)
        .delete('/api/users/account')
        .expect(401)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should return 404 for deleted user', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(401)
      
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('User API Error Handling', () => {
    it('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should handle missing content-type', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send('some data')
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })

    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({})
        .expect(400)
      
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('User API Security', () => {
    it('should sanitize input to prevent XSS', async () => {
      const maliciousUser = {
        email: 'xss-test@example.com',
        username: 'xsstest',
        password: 'TestPassword123!',
        displayName: '<script>alert("xss")</script>',
        bio: '<script>alert("xss")</script>',
        timezone: 'UTC'
      }

      const response = await request(app)
        .post('/api/users/register')
        .send(maliciousUser)
        .expect(201)
      
      // Check that script tags are not present in response
      expect(response.body.user.displayName).not.toContain('<script>')
      
      // Clean up
      await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${response.body.token}`)
        .expect(200)
    })

    it('should handle SQL injection attempts', async () => {
      const sqlInjectionUser = {
        email: 'sql-test@example.com',
        username: 'sqltest',
        password: 'TestPassword123!',
        displayName: "'; DROP TABLE users; --",
        timezone: 'UTC'
      }

      const response = await request(app)
        .post('/api/users/register')
        .send(sqlInjectionUser)
        .expect(201)
      
      // Check that the user was created with the literal string, not executed as SQL
      expect(response.body.user.displayName).toBe("'; DROP TABLE users; --")
      
      // Clean up
      await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${response.body.token}`)
        .expect(200)
    })

    it('should enforce rate limiting', async () => {
      const loginData = {
        email: 'integration-test@example.com',
        password: 'TestPassword123!'
      }

      // Make multiple rapid login attempts
      const promises = Array(10).fill(null).map(() => 
        request(app)
          .post('/api/users/login')
          .send(loginData)
      )
      
      const responses = await Promise.all(promises)
      
      // Some requests should succeed, others should be rate limited
      const successCount = responses.filter(r => r.status === 200).length
      const rateLimitedCount = responses.filter(r => r.status === 429).length
      
      expect(successCount + rateLimitedCount).toBe(10)
      expect(rateLimitedCount).toBeGreaterThan(0)
    })
  })

  describe('User API Performance', () => {
    it('should respond within reasonable time for registration', async () => {
      const newUser = {
        email: 'perf-test@example.com',
        username: 'perftest',
        password: 'TestPassword123!',
        displayName: 'Performance Test User',
        timezone: 'UTC'
      }

      const startTime = Date.now()
      const response = await request(app)
        .post('/api/users/register')
        .send(newUser)
        .expect(201)
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeLessThan(500) // Should respond within 500ms
      
      // Clean up
      await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${response.body.token}`)
        .expect(200)
    })

    it('should respond within reasonable time for login', async () => {
      // First register a user
      const newUser = {
        email: 'perf-login-test@example.com',
        username: 'perflogintest',
        password: 'TestPassword123!',
        displayName: 'Performance Login Test User',
        timezone: 'UTC'
      }

      const registerResponse = await request(app)
        .post('/api/users/register')
        .send(newUser)
        .expect(201)

      const loginData = {
        email: newUser.email,
        password: newUser.password
      }

      const startTime = Date.now()
      await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(200)
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeLessThan(300) // Should respond within 300ms
      
      // Clean up
      await request(app)
        .delete('/api/users/account')
        .set('Authorization', `Bearer ${registerResponse.body.token}`)
        .expect(200)
    })

    it('should handle concurrent requests', async () => {
      const promises = Array(5).fill(null).map((_, index) => 
        request(app)
          .post('/api/users/register')
          .send({
            email: `concurrent-test-${index}@example.com`,
            username: `concurrenttest${index}`,
            password: 'TestPassword123!',
            displayName: `Concurrent Test User ${index}`,
            timezone: 'UTC'
          })
      )
      
      const responses = await Promise.all(promises)
      responses.forEach(response => {
        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty('user')
        expect(response.body).toHaveProperty('token')
      })
      
      // Clean up all created users
      for (const response of responses) {
        await request(app)
          .delete('/api/users/account')
          .set('Authorization', `Bearer ${response.body.token}`)
          .expect(200)
      }
    })
  })
})
