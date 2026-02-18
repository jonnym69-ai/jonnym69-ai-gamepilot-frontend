const request = require('supertest') as any
import { app } from '../index'
import { PlatformCode } from '@gamepilot/types'
import { IntegrationStatus } from '@gamepilot/shared/models/integration'

describe('API Integration Tests', () => {
  describe('Platform Integration Endpoints', () => {
    describe('YouTube Integration', () => {
      it('should return YouTube profile when authenticated', async () => {
        const response = await request(app)
          .get('/api/youtube/profile')
          .set('Authorization', 'Bearer valid-test-token')
          .expect(200)

        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('profile')
        expect(response.body).toHaveProperty('integration')
      })

      it('should return 401 when not authenticated', async () => {
        await request(app)
          .get('/api/youtube/profile')
          .expect(401)
      })

      it('should return 403 when YouTube integration not connected', async () => {
        const response = await request(app)
          .get('/api/youtube/videos')
          .set('Authorization', 'Bearer valid-test-token')
          .expect(403)

        expect(response.body).toHaveProperty('error', 'YouTube integration required')
      })

      it('should search YouTube videos when integration is active', async () => {
        // Mock active YouTube integration
        const response = await request(app)
          .get('/api/youtube/search?q=gaming')
          .set('Authorization', 'Bearer valid-test-token')
          .expect(200)

        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('results')
        expect(Array.isArray(response.body.results)).toBe(true)
      })
    })

    describe('Discord Integration', () => {
      it('should return Discord profile when authenticated', async () => {
        const response = await request(app)
          .get('/api/discord/profile')
          .set('Authorization', 'Bearer valid-test-token')
          .expect(200)

        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('profile')
        expect(response.body).toHaveProperty('integration')
      })

      it('should fetch Discord guilds when integration is active', async () => {
        const response = await request(app)
          .get('/api/discord/guilds')
          .set('Authorization', 'Bearer valid-test-token')
          .expect(200)

        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('guilds')
        expect(Array.isArray(response.body.guilds)).toBe(true)
      })

      it('should return Discord activity when integration is active', async () => {
        const response = await request(app)
          .get('/api/discord/activity')
          .set('Authorization', 'Bearer valid-test-token')
          .expect(200)

        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('activity')
      })
    })

    describe('Steam Integration', () => {
      it('should return Steam profile when authenticated', async () => {
        const response = await request(app)
          .get('/api/steam/profile')
          .set('Authorization', 'Bearer valid-test-token')
          .expect(200)

        expect(response.body).toHaveProperty('success', true)
        expect(response.body).toHaveProperty('profile')
        expect(response.body).toHaveProperty('integration')
      })

      it('should fetch featured games', async () => {
        const response = await request(app)
          .get('/api/steam/featured')
          .expect(200)

        expect(response.body).toHaveProperty('games')
        expect(Array.isArray(response.body.games)).toBe(true)
      })

      it('should fetch user library when integration is active', async () => {
        const response = await request(app)
          .get('/api/steam/library/76561198000000000')
          .set('Authorization', 'Bearer valid-test-token')
          .expect(200)

        expect(response.body).toHaveProperty('steamId')
        expect(response.body).toHaveProperty('gameCount')
        expect(response.body).toHaveProperty('games')
      })
    })
  })

  describe('Integration Management', () => {
    it('should connect YouTube integration', async () => {
      const response = await request(app)
        .post('/api/youtube/connect')
        .set('Authorization', 'Bearer valid-test-token')
        .send({
          code: 'test-auth-code',
          redirectUri: 'http://localhost:3000/auth/youtube/callback'
        })
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('integration')
      expect(response.body.integration.platform).toBe(PlatformCode.CUSTOM)
    })

    it('should disconnect integration', async () => {
      const response = await request(app)
        .post('/api/youtube/disconnect')
        .set('Authorization', 'Bearer valid-test-token')
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('message')
    })

    it('should refresh integration tokens', async () => {
      const response = await request(app)
        .post('/api/youtube/refresh')
        .set('Authorization', 'Bearer valid-test-token')
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('integration')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid platform codes', async () => {
      const response = await request(app)
        .get('/api/invalid-platform/profile')
        .expect(404)

      expect(response.body).toHaveProperty('error')
    })

    it('should handle expired tokens gracefully', async () => {
      const response = await request(app)
        .get('/api/youtube/profile')
        .set('Authorization', 'Bearer expired-token')
        .expect(401)

      expect(response.body).toHaveProperty('error', 'Authentication required')
    })

    it('should handle API rate limits', async () => {
      // Mock rate limit scenario
      const response = await request(app)
        .get('/api/youtube/search')
        .set('Authorization', 'Bearer valid-test-token')
        .query({ q: 'test' })
        .expect(429)

      expect(response.body).toHaveProperty('error', 'Rate limit exceeded')
    })
  })

  describe('Data Consistency', () => {
    it('should maintain consistent UserIntegration structure across platforms', async () => {
      const platforms = ['youtube', 'discord', 'steam']
      
      for (const platform of platforms) {
        const response = await request(app)
          .get(`/api/${platform}/profile`)
          .set('Authorization', 'Bearer valid-test-token')
          .expect(200)

        const integration = response.body.integration
        expect(integration).toHaveProperty('id')
        expect(integration).toHaveProperty('platform')
        expect(integration).toHaveProperty('status')
        expect(integration).toHaveProperty('isActive')
        expect(integration).toHaveProperty('isConnected')
        expect(integration).toHaveProperty('scopes')
        expect(integration).toHaveProperty('createdAt')
        expect(integration).toHaveProperty('updatedAt')
        expect(integration).toHaveProperty('syncConfig')
      }
    })

    it('should validate PlatformCode enum usage', async () => {
      const response = await request(app)
        .get('/api/youtube/profile')
        .set('Authorization', 'Bearer valid-test-token')
        .expect(200)

      const integration = response.body.integration
      expect(Object.values(PlatformCode)).toContain(integration.platform)
    })

    it('should validate IntegrationStatus enum usage', async () => {
      const response = await request(app)
        .get('/api/youtube/profile')
        .set('Authorization', 'Bearer valid-test-token')
        .expect(200)

      const integration = response.body.integration
      expect(Object.values(IntegrationStatus)).toContain(integration.status)
    })
  })
})

describe('API Performance Tests', () => {
  it('should respond within acceptable time limits', async () => {
    const start = Date.now()
    
    await request(app)
      .get('/api/steam/featured')
      .expect(200)
    
    const duration = Date.now() - start
    expect(duration).toBeLessThan(2000) // 2 seconds max
  })

  it('should handle concurrent requests', async () => {
    const promises = Array(10).fill(null).map(() =>
      request(app)
        .get('/api/steam/featured')
        .expect(200)
    )

    const responses = await Promise.all(promises)
    expect(responses).toHaveLength(10)
    
    responses.forEach(response => {
      expect(response.body).toHaveProperty('games')
    })
  })
})

describe('API Security Tests', () => {
  it('should reject requests without authentication', async () => {
    const endpoints = [
      '/api/youtube/profile',
      '/api/discord/profile', 
      '/api/steam/profile',
      '/api/youtube/videos',
      '/api/discord/guilds',
      '/api/steam/library/76561198000000000'
    ]

    for (const endpoint of endpoints) {
      await request(app)
        .get(endpoint)
        .expect(401)
    }
  })

  it('should reject malformed JWT tokens', async () => {
    const malformedTokens = [
      'invalid-token',
      'Bearer invalid-token',
      'Bearer malformed.jwt.token',
      'Bearer '
    ]

    for (const token of malformedTokens) {
      await request(app)
        .get('/api/youtube/profile')
        .set('Authorization', token)
        .expect(401)
    }
  })

  it('should prevent access to other users\' data', async () => {
    // Test with user A's token trying to access user B's data
    const response = await request(app)
      .get('/api/steam/library/76561198000000001') // Different Steam ID
      .set('Authorization', 'Bearer user-a-token')
      .expect(403)

    expect(response.body).toHaveProperty('error', 'Access denied')
  })
})
