"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockRateLimiter = exports.setupMockDatabase = exports.createMockResponse = exports.createMockRequest = exports.mockEnvVars = exports.mockSteamGames = exports.mockDiscordGuilds = exports.mockYouTubeVideos = exports.mockSteamIntegration = exports.mockDiscordIntegration = exports.mockYouTubeIntegration = exports.mockUser = exports.mockExpiredToken = exports.mockValidToken = void 0;
const globals_1 = require("@jest/globals");
const types_1 = require("@gamepilot/types");
const integration_1 = require("@gamepilot/shared/models/integration");
// Mock JWT token for testing
exports.mockValidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImlhdCI6MTY5NDg4NjQwMCwiZXhwIjoxNjk0ODkwMDAwLCJhdWQiOiJnYW1lcGlsb3QtYXBpIiwiaXNzIjoiZ2FtZXBpbG90LWF1dGgiLCJzY29wZSI6WyJnYW1lczpyZWFkIiwiaW50ZWdyYXRpb25zOnJlYWQiXX0.test-signature';
exports.mockExpiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImlhdCI6MTY5NDgwMDAwMCwiZXhwIjoxNjk0ODAzNjAwLCJhdWQiOiJnYW1lcGlsb3QtYXBpIiwiaXNzIjoiZ2FtZXBpbG90LWF1dGgifQ.expired-signature';
// Mock user data
exports.mockUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-16T15:45:00Z')
};
// Mock integration data
exports.mockYouTubeIntegration = {
    id: 'integration-youtube-123',
    userId: 'user-123',
    platform: types_1.PlatformCode.CUSTOM,
    externalUserId: 'UC1234567890',
    externalUsername: 'TestChannel',
    accessToken: 'ya29.test-access-token',
    refreshToken: 'test-refresh-token',
    expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
    status: integration_1.IntegrationStatus.ACTIVE,
    isActive: true,
    isConnected: true,
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2022024-01-16T15:45:00Z'),
    lastSyncAt: new Date('2024-01-16T14:00:00Z'),
    lastUsedAt: new Date('2024-01-16T15:00:00Z'),
    metadata: {
        channelTitle: 'Test Gaming Channel',
        subscriberCount: 10000,
        videoCount: 150,
        viewCount: 500000
    },
    syncConfig: {
        autoSync: true,
        syncFrequency: 12,
        lastSyncAt: new Date('2024-01-16T14:00:00Z'),
        errorCount: 0,
        maxRetries: 3
    }
};
exports.mockDiscordIntegration = {
    id: 'integration-discord-123',
    userId: 'user-123',
    platform: types_1.PlatformCode.DISCORD,
    externalUserId: '123456789012345678',
    externalUsername: 'TestUser#1234',
    accessToken: 'discord-test-access-token',
    refreshToken: 'discord-test-refresh-token',
    expiresAt: new Date(Date.now() + 3600000),
    scopes: ['identify', 'guilds', 'guilds.read'],
    status: integration_1.IntegrationStatus.ACTIVE,
    isActive: true,
    isConnected: true,
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-16T15:45:00Z'),
    lastSyncAt: new Date('2024-01-16T14:00:00Z'),
    lastUsedAt: new Date('2024-01-16T15:00:00Z'),
    metadata: {
        id: '123456789012345678',
        username: 'TestUser',
        discriminator: '1234',
        avatar: 'avatar_hash',
        bot: false,
        verified: true,
        email: 'test@example.com',
        flags: 0,
        globalName: 'Test User',
        avatarUrl: 'https://cdn.discordapp.com/avatars/123456789012345678/avatar_hash.png'
    },
    syncConfig: {
        autoSync: true,
        syncFrequency: 6,
        lastSyncAt: new Date('2024-01-16T14:00:00Z'),
        errorCount: 0,
        maxRetries: 3
    }
};
exports.mockSteamIntegration = {
    id: 'integration-steam-123',
    userId: 'user-123',
    platform: types_1.PlatformCode.STEAM,
    externalUserId: '76561198000000000',
    externalUsername: 'TestSteamUser',
    accessToken: 'steam-test-access-token',
    refreshToken: 'steam-test-refresh-token',
    expiresAt: new Date(Date.now() + 3600000),
    scopes: ['read_profile', 'read_library'],
    status: integration_1.IntegrationStatus.ACTIVE,
    isActive: true,
    isConnected: true,
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-16T15:45:00Z'),
    lastSyncAt: new Date('2024-01-16T14:00:00Z'),
    lastUsedAt: new Date('2024-01-16T15:00:00Z'),
    metadata: {
        steamId: '76561198000000000',
        personaName: 'TestSteamUser',
        profileUrl: 'https://steamcommunity.com/profiles/76561198000000000',
        avatar: 'https://avatars.steamstatic.com/avatar_hash.jpg',
        personaState: 1,
        gameExtraInfo: 'Test Game',
        gameId: '12345'
    },
    syncConfig: {
        autoSync: true,
        syncFrequency: 24,
        lastSyncAt: new Date('2024-01-16T14:00:00Z'),
        errorCount: 0,
        maxRetries: 3
    }
};
// Mock API responses
exports.mockYouTubeVideos = [
    {
        videoId: 'test-video-1',
        title: 'Test Gaming Video 1',
        description: 'A test gaming video',
        thumbnailUrl: 'https://img.youtube.com/vi/test-video-1/mqdefault.jpg',
        publishedAt: '2024-01-15T10:00:00Z',
        viewCount: 1000,
        likeCount: 50
    },
    {
        videoId: 'test-video-2',
        title: 'Test Gaming Video 2',
        description: 'Another test gaming video',
        thumbnailUrl: 'https://img.youtube.com/vi/test-video-2/mqdefault.jpg',
        publishedAt: '2024-01-14T15:30:00Z',
        viewCount: 500,
        likeCount: 25
    }
];
exports.mockDiscordGuilds = [
    {
        id: 'guild-1',
        name: 'Test Gaming Server',
        icon: 'guild-icon-hash',
        memberCount: 1000,
        onlineCount: 150,
        ownerId: 'owner-id',
        features: ['COMMUNITY', 'NEWS']
    },
    {
        id: 'guild-2',
        name: 'Another Test Server',
        icon: 'guild-icon-hash-2',
        memberCount: 500,
        onlineCount: 75,
        ownerId: 'owner-id-2',
        features: ['COMMUNITY']
    }
];
exports.mockSteamGames = [
    {
        appId: 12345,
        name: 'Test Game 1',
        headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/12345/header.jpg',
        shortDescription: 'A test game',
        genres: ['Action', 'Adventure'],
        platforms: ['Windows', 'Linux', 'Mac'],
        releaseDate: '2024-01-01',
        priceOverview: {
            currency: 'USD',
            initial: 1999,
            final: 1999,
            discountPercent: 0
        }
    },
    {
        appId: 67890,
        name: 'Test Game 2',
        headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/67890/header.jpg',
        shortDescription: 'Another test game',
        genres: ['RPG', 'Strategy'],
        platforms: ['Windows'],
        releaseDate: '2023-12-15',
        priceOverview: {
            currency: 'USD',
            initial: 2999,
            final: 1499,
            discountPercent: 50
        }
    }
];
// Mock environment variables
exports.mockEnvVars = {
    JWT_SECRET: 'test-jwt-secret',
    STEAM_API_KEY: 'test-steam-api-key',
    YOUTUBE_API_KEY: 'test-youtube-api-key',
    DISCORD_BOT_TOKEN: 'test-discord-bot-token',
    NODE_ENV: 'test'
};
// Test utilities
const createMockRequest = (overrides = {}) => ({
    user: exports.mockUser,
    headers: {
        authorization: `Bearer ${exports.mockValidToken}`,
        ...overrides.headers
    },
    query: {},
    body: {},
    params: {},
    ...overrides
});
exports.createMockRequest = createMockRequest;
const createMockResponse = () => {
    const res = {};
    res.status = globals_1.jest.fn().mockReturnValue(res);
    res.json = globals_1.jest.fn().mockReturnValue(res);
    res.send = globals_1.jest.fn().mockReturnValue(res);
    res.cookie = globals_1.jest.fn().mockReturnValue(res);
    res.clearCookie = globals_1.jest.fn().mockReturnValue(res);
    return res;
};
exports.createMockResponse = createMockResponse;
// Database mock helpers
const setupMockDatabase = () => {
    const mockDb = new Map();
    return {
        get: (key) => mockDb.get(key),
        set: (key, value) => mockDb.set(key, value),
        delete: (key) => mockDb.delete(key),
        clear: () => mockDb.clear(),
        has: (key) => mockDb.has(key),
        size: () => mockDb.size
    };
};
exports.setupMockDatabase = setupMockDatabase;
// Rate limiting mock
const createMockRateLimiter = () => {
    const requests = new Map();
    return {
        checkLimit: (key, limit, windowMs) => {
            const now = Date.now();
            const windowStart = now - windowMs;
            if (!requests.has(key)) {
                requests.set(key, []);
            }
            const userRequests = requests.get(key);
            const validRequests = userRequests.filter((time) => time > windowStart);
            if (validRequests.length >= limit) {
                return false;
            }
            validRequests.push(now);
            requests.set(key, validRequests);
            return true;
        },
        clear: () => requests.clear()
    };
};
exports.createMockRateLimiter = createMockRateLimiter;
// Global test setup
beforeAll(() => {
    // Set mock environment variables
    Object.entries(exports.mockEnvVars).forEach(([key, value]) => {
        process.env[key] = value;
    });
});
afterAll(() => {
    // Clean up environment variables
    Object.keys(exports.mockEnvVars).forEach(key => {
        delete process.env[key];
    });
});
// Reset mocks before each test
beforeEach(() => {
    globals_1.jest.clearAllMocks();
});
//# sourceMappingURL=setup.js.map