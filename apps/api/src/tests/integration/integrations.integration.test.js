"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Integration tests for integration API endpoints
const request = require('supertest');
const index_1 = require("../../index");
describe('Integration API Integration Tests', () => {
    let testUserId;
    let testUserToken;
    let testIntegrationId;
    beforeAll(async () => {
        // Create a test user for integration tests
        const newUser = {
            email: 'integration-api-test@example.com',
            username: 'integrationapitest',
            password: 'TestPassword123!',
            displayName: 'Integration API Test User',
            timezone: 'UTC'
        };
        const registerResponse = await request(index_1.app)
            .post('/api/users/register')
            .send(newUser)
            .expect(201);
        testUserId = registerResponse.body.user.id;
        testUserToken = registerResponse.body.token;
    });
    afterAll(async () => {
        // Clean up test user
        await request(index_1.app)
            .delete('/api/users/account')
            .set('Authorization', `Bearer ${testUserToken}`)
            .expect(200);
    });
    describe('POST /api/integrations/steam', () => {
        it('should create Steam integration with valid data', async () => {
            const steamIntegration = {
                steamId: '76561198000000000',
                username: 'TestSteamUser',
                profileUrl: 'https://steamcommunity.com/id/TestSteamUser',
                avatarUrl: 'https://example.com/avatar.jpg',
                country: 'US',
                personaState: 1,
                visibilityState: 3
            };
            const response = await request(index_1.app)
                .post('/api/integrations/steam')
                .set('Authorization', `Bearer ${testUserToken}`)
                .send(steamIntegration)
                .expect(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('platform');
            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('data');
            expect(response.body.platform).toBe('steam');
            expect(response.body.status).toBe('connected');
            expect(response.body.data.steamId).toBe(steamIntegration.steamId);
            expect(response.body.data.username).toBe(steamIntegration.username);
            expect(response.body.data.profileUrl).toBe(steamIntegration.profileUrl);
            testIntegrationId = response.body.id;
        });
        it('should return 400 for invalid steam data', async () => {
            const invalidIntegration = {
                steamId: 'invalid-steam-id',
                username: '',
                profileUrl: 'invalid-url',
                avatarUrl: 'invalid-url',
                country: '',
                personaState: -1,
                visibilityState: -1
            };
            const response = await request(index_1.app)
                .post('/api/integrations/steam')
                .set('Authorization', `Bearer ${testUserToken}`)
                .send(invalidIntegration)
                .expect(400);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 401 without authentication', async () => {
            const steamIntegration = {
                steamId: '76561198000000001',
                username: 'TestSteamUser2',
                profileUrl: 'https://steamcommunity.com/id/TestSteamUser2',
                avatarUrl: 'https://example.com/avatar2.jpg',
                country: 'US',
                personaState: 1,
                visibilityState: 3
            };
            const response = await request(index_1.app)
                .post('/api/integrations/steam')
                .send(steamIntegration)
                .expect(401);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 409 for duplicate Steam integration', async () => {
            const duplicateIntegration = {
                steamId: '76561198000000000', // Same steamId
                username: 'TestSteamUser3',
                profileUrl: 'https://steamcommunity.com/id/TestSteamUser3',
                avatarUrl: 'https://example.com/avatar3.jpg',
                country: 'US',
                personaState: 1,
                visibilityState: 3
            };
            const response = await request(index_1.app)
                .post('/api/integrations/steam')
                .set('Authorization', `Bearer ${testUserToken}`)
                .send(duplicateIntegration)
                .expect(409);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('GET /api/integrations', () => {
        it('should return all user integrations', async () => {
            const response = await request(index_1.app)
                .get('/api/integrations')
                .set('Authorization', `Bearer ${testUserToken}`)
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThanOrEqual(1);
            const steamIntegration = response.body.find((integration) => integration.platform === 'steam');
            expect(steamIntegration).toBeDefined();
            expect(steamIntegration.id).toBe(testIntegrationId);
            expect(steamIntegration.status).toBe('connected');
        });
        it('should return 401 without authentication', async () => {
            const response = await request(index_1.app)
                .get('/api/integrations')
                .expect(401);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('GET /api/integrations/:id', () => {
        it('should return specific integration by ID', async () => {
            const response = await request(index_1.app)
                .get(`/api/integrations/${testIntegrationId}`)
                .set('Authorization', `Bearer ${testUserToken}`)
                .expect(200);
            expect(response.body.id).toBe(testIntegrationId);
            expect(response.body.platform).toBe('steam');
            expect(response.body.status).toBe('connected');
            expect(response.body.data).toHaveProperty('steamId');
            expect(response.body.data).toHaveProperty('username');
        });
        it('should return 404 for non-existent integration', async () => {
            const response = await request(index_1.app)
                .get('/api/integrations/non-existent-id')
                .set('Authorization', `Bearer ${testUserToken}`)
                .expect(404);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 401 without authentication', async () => {
            const response = await request(index_1.app)
                .get(`/api/integrations/${testIntegrationId}`)
                .expect(401);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('PUT /api/integrations/:id', () => {
        it('should update integration status', async () => {
            const updateData = {
                status: 'disconnected',
                lastSync: new Date().toISOString()
            };
            const response = await request(index_1.app)
                .put(`/api/integrations/${testIntegrationId}`)
                .set('Authorization', `Bearer ${testUserToken}`)
                .send(updateData)
                .expect(200);
            expect(response.body.id).toBe(testIntegrationId);
            expect(response.body.status).toBe('disconnected');
            expect(response.body.lastSync).toBe(updateData.lastSync);
        });
        it('should return 404 for non-existent integration', async () => {
            const updateData = {
                status: 'disconnected'
            };
            const response = await request(index_1.app)
                .put('/api/integrations/non-existent-id')
                .set('Authorization', `Bearer ${testUserToken}`)
                .send(updateData)
                .expect(404);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 401 without authentication', async () => {
            const updateData = {
                status: 'disconnected'
            };
            const response = await request(index_1.app)
                .put(`/api/integrations/${testIntegrationId}`)
                .send(updateData)
                .expect(401);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('POST /api/integrations/:id/sync', () => {
        it('should sync integration data', async () => {
            const response = await request(index_1.app)
                .post(`/api/integrations/${testIntegrationId}/sync`)
                .set('Authorization', `Bearer ${testUserToken}`)
                .expect(200);
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('syncTime');
            expect(response.body).toHaveProperty('updatedFields');
            expect(response.body.message).toContain('synced');
        });
        it('should return 404 for non-existent integration', async () => {
            const response = await request(index_1.app)
                .post('/api/integrations/non-existent-id/sync')
                .set('Authorization', `Bearer ${testUserToken}`)
                .expect(404);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 401 without authentication', async () => {
            const response = await request(index_1.app)
                .post(`/api/integrations/${testIntegrationId}/sync`)
                .expect(401);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('DELETE /api/integrations/:id', () => {
        it('should delete integration', async () => {
            const response = await request(index_1.app)
                .delete(`/api/integrations/${testIntegrationId}`)
                .set('Authorization', `Bearer ${testUserToken}`)
                .expect(200);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('deleted');
        });
        it('should return 404 for non-existent integration', async () => {
            const response = await request(index_1.app)
                .delete('/api/integrations/non-existent-id')
                .set('Authorization', `Bearer ${testUserToken}`)
                .expect(404);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 401 without authentication', async () => {
            const response = await request(index_1.app)
                .delete(`/api/integrations/${testIntegrationId}`)
                .expect(401);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('POST /api/integrations/discord', () => {
        let discordIntegrationId;
        it('should create Discord integration with valid data', async () => {
            const discordIntegration = {
                discordId: '123456789012345678',
                username: 'TestDiscordUser',
                discriminator: '1234',
                avatarUrl: 'https://example.com/discord-avatar.jpg',
                email: 'discord@example.com',
                verified: true,
                flags: 0
            };
            const response = await request(index_1.app)
                .post('/api/integrations/discord')
                .set('Authorization', `Bearer ${testUserToken}`)
                .send(discordIntegration)
                .expect(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.platform).toBe('discord');
            expect(response.body.status).toBe('connected');
            expect(response.body.data.discordId).toBe(discordIntegration.discordId);
            expect(response.body.data.username).toBe(discordIntegration.username);
            discordIntegrationId = response.body.id;
        });
        it('should return 400 for invalid Discord data', async () => {
            const invalidIntegration = {
                discordId: 'invalid-discord-id',
                username: '',
                discriminator: '',
                avatarUrl: 'invalid-url',
                email: 'invalid-email',
                verified: false,
                flags: -1
            };
            const response = await request(index_1.app)
                .post('/api/integrations/discord')
                .set('Authorization', `Bearer ${testUserToken}`)
                .send(invalidIntegration)
                .expect(400);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 409 for duplicate Discord integration', async () => {
            const duplicateIntegration = {
                discordId: '123456789012345678', // Same discordId
                username: 'TestDiscordUser2',
                discriminator: '5678',
                avatarUrl: 'https://example.com/discord-avatar2.jpg',
                email: 'discord2@example.com',
                verified: true,
                flags: 0
            };
            const response = await request(index_1.app)
                .post('/api/integrations/discord')
                .set('Authorization', `Bearer ${testUserToken}`)
                .send(duplicateIntegration)
                .expect(409);
            expect(response.body).toHaveProperty('error');
        });
        afterAll(async () => {
            // Clean up Discord integration
            await request(index_1.app)
                .delete(`/api/integrations/${discordIntegrationId}`)
                .set('Authorization', `Bearer ${testUserToken}`)
                .expect(200);
        });
    });
    describe('POST /api/integrations/youtube', () => {
        let youtubeIntegrationId;
        it('should create YouTube integration with valid data', async () => {
            const youtubeIntegration = {
                channelId: 'UC1234567890',
                channelTitle: 'Test YouTube Channel',
                channelUrl: 'https://youtube.com/channel/UC1234567890',
                subscriberCount: 1000,
                videoCount: 100,
                thumbnailUrl: 'https://example.com/youtube-thumbnail.jpg'
            };
            const response = await request(index_1.app)
                .post('/api/integrations/youtube')
                .set('Authorization', `Bearer ${testUserToken}`)
                .send(youtubeIntegration)
                .expect(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.platform).toBe('youtube');
            expect(response.body.status).toBe('connected');
            expect(response.body.data.channelId).toBe(youtubeIntegration.channelId);
            expect(response.body.data.channelTitle).toBe(youtubeIntegration.channelTitle);
            youtubeIntegrationId = response.body.id;
        });
        it('should return 400 for invalid YouTube data', async () => {
            const invalidIntegration = {
                channelId: '',
                channelTitle: '',
                channelUrl: 'invalid-url',
                subscriberCount: -1,
                videoCount: -1,
                thumbnailUrl: 'invalid-url'
            };
            const response = await request(index_1.app)
                .post('/api/integrations/youtube')
                .set('Authorization', `Bearer ${testUserToken}`)
                .send(invalidIntegration)
                .expect(400);
            expect(response.body).toHaveProperty('error');
        });
        afterAll(async () => {
            // Clean up YouTube integration
            await request(index_1.app)
                .delete(`/api/integrations/${youtubeIntegrationId}`)
                .set('Authorization', `Bearer ${testUserToken}`)
                .expect(200);
        });
    });
    describe('Integration API Error Handling', () => {
        it('should handle malformed JSON requests', async () => {
            const response = await request(index_1.app)
                .post('/api/integrations/steam')
                .set('Authorization', `Bearer ${testUserToken}`)
                .set('Content-Type', 'application/json')
                .send('{"invalid": json}')
                .expect(400);
            expect(response.body).toHaveProperty('error');
        });
        it('should handle missing content-type', async () => {
            const response = await request(index_1.app)
                .post('/api/integrations/steam')
                .set('Authorization', `Bearer ${testUserToken}`)
                .send('some data')
                .expect(400);
            expect(response.body).toHaveProperty('error');
        });
        it('should handle empty request body', async () => {
            const response = await request(index_1.app)
                .post('/api/integrations/steam')
                .set('Authorization', `Bearer ${testUserToken}`)
                .send({})
                .expect(400);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('Integration API Security', () => {
        it('should sanitize input to prevent XSS', async () => {
            const maliciousIntegration = {
                steamId: '76561198000000002',
                username: '<script>alert("xss")</script>',
                profileUrl: 'https://steamcommunity.com/id/XSSUser',
                avatarUrl: 'https://example.com/avatar.jpg',
                country: 'US',
                personaState: 1,
                visibilityState: 3
            };
            const response = await request(index_1.app)
                .post('/api/integrations/steam')
                .set('Authorization', `Bearer ${testUserToken}`)
                .send(maliciousIntegration)
                .expect(201);
            // Check that script tags are not present in response
            expect(response.body.data.username).not.toContain('<script>');
            // Clean up
            await request(index_1.app)
                .delete(`/api/integrations/${response.body.id}`)
                .set('Authorization', `Bearer ${testUserToken}`)
                .expect(200);
        });
        it('should handle SQL injection attempts', async () => {
            const sqlInjectionIntegration = {
                steamId: "'; DROP TABLE integrations; --",
                username: 'SQLInjectionUser',
                profileUrl: 'https://steamcommunity.com/id/SQLUser',
                avatarUrl: 'https://example.com/avatar.jpg',
                country: 'US',
                personaState: 1,
                visibilityState: 3
            };
            const response = await request(index_1.app)
                .post('/api/integrations/steam')
                .set('Authorization', `Bearer ${testUserToken}`)
                .send(sqlInjectionIntegration)
                .expect(201);
            // Check that the integration was created with the literal string, not executed as SQL
            expect(response.body.data.steamId).toBe("'; DROP TABLE integrations; --");
            // Clean up
            await request(index_1.app)
                .delete(`/api/integrations/${response.body.id}`)
                .set('Authorization', `Bearer ${testUserToken}`)
                .expect(200);
        });
        it('should enforce rate limiting', async () => {
            const steamIntegration = {
                steamId: '76561198000000003',
                username: 'RateLimitTest',
                profileUrl: 'https://steamcommunity.com/id/RateLimitTest',
                avatarUrl: 'https://example.com/avatar.jpg',
                country: 'US',
                personaState: 1,
                visibilityState: 3
            };
            // Make multiple rapid requests
            const promises = Array(10).fill(null).map(() => request(index_1.app)
                .post('/api/integrations/steam')
                .set('Authorization', `Bearer ${testUserToken}`)
                .send(steamIntegration));
            const responses = await Promise.all(promises);
            // Some requests should succeed, others should be rate limited
            const successCount = responses.filter(r => r.status === 201).length;
            const rateLimitedCount = responses.filter(r => r.status === 429).length;
            expect(successCount + rateLimitedCount).toBe(10);
            expect(rateLimitedCount).toBeGreaterThan(0);
        });
    });
    describe('Integration API Performance', () => {
        it('should respond within reasonable time for integration creation', async () => {
            const steamIntegration = {
                steamId: '76561198000000004',
                username: 'PerformanceTest',
                profileUrl: 'https://steamcommunity.com/id/PerformanceTest',
                avatarUrl: 'https://example.com/avatar.jpg',
                country: 'US',
                personaState: 1,
                visibilityState: 3
            };
            const startTime = Date.now();
            const response = await request(index_1.app)
                .post('/api/integrations/steam')
                .set('Authorization', `Bearer ${testUserToken}`)
                .send(steamIntegration)
                .expect(201);
            const endTime = Date.now();
            expect(endTime - startTime).toBeLessThan(500); // Should respond within 500ms
            // Clean up
            await request(index_1.app)
                .delete(`/api/integrations/${response.body.id}`)
                .set('Authorization', `Bearer ${testUserToken}`)
                .expect(200);
        });
        it('should handle concurrent integration requests', async () => {
            const promises = Array(3).fill(null).map((_, index) => request(index_1.app)
                .post('/api/integrations/steam')
                .set('Authorization', `Bearer ${testUserToken}`)
                .send({
                steamId: `7656119800000000${index}`,
                username: `ConcurrentTest${index}`,
                profileUrl: `https://steamcommunity.com/id/ConcurrentTest${index}`,
                avatarUrl: 'https://example.com/avatar.jpg',
                country: 'US',
                personaState: 1,
                visibilityState: 3
            }));
            const responses = await Promise.all(promises);
            responses.forEach(response => {
                expect(response.status).toBe(201);
                expect(response.body).toHaveProperty('id');
                expect(response.body).toHaveProperty('platform');
                expect(response.body).toHaveProperty('status');
            });
            // Clean up all created integrations
            for (const response of responses) {
                await request(index_1.app)
                    .delete(`/api/integrations/${response.body.id}`)
                    .set('Authorization', `Bearer ${testUserToken}`)
                    .expect(200);
            }
        });
    });
});
