import { jest } from '@jest/globals'
import { PlatformCode } from '@gamepilot/types'
import { IntegrationStatus } from '@gamepilot/shared/models/integration'

// Mock JWT token for testing
export const mockValidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImlhdCI6MTY5NDg4NjQwMCwiZXhwIjoxNjk0ODkwMDAwLCJhdWQiOiJnYW1lcGlsb3QtYXBpIiwiaXNzIjoiZ2FtZXBpbG90LWF1dGgiLCJzY29wZSI6WyJnYW1lczpyZWFkIiwiaW50ZWdyYXRpb25zOnJlYWQiXX0.test-signature'

export const mockExpiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImlhdCI6MTY5NDgwMDAwMCwiZXhwIjoxNjk0ODAzNjAwLCJhdWQiOiJnYW1lcGlsb3QtYXBpIiwiaXNzIjoiZ2FtZXBpbG90LWF1dGgifQ.expired-signature'

// Mock user data
export const mockUser = {
  id: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  createdAt: new Date('2024-01-15T10:30:00Z'),
  updatedAt: new Date('2024-01-16T15:45:00Z')
}

// Mock integration data
export const mockYouTubeIntegration = {
  id: 'integration-youtube-123',
  userId: 'user-123',
  platform: PlatformCode.CUSTOM,
  externalUserId: 'UC1234567890',
  externalUsername: 'TestChannel',
  accessToken: 'ya29.test-access-token',
  refreshToken: 'test-refresh-token',
  expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
  scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
  status: IntegrationStatus.ACTIVE,
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
}

export const mockDiscordIntegration = {
  id: 'integration-discord-123',
  userId: 'user-123',
  platform: PlatformCode.DISCORD,
  externalUserId: '123456789012345678',
  externalUsername: 'TestUser#1234',
  accessToken: 'discord-test-access-token',
  refreshToken: 'discord-test-refresh-token',
  expiresAt: new Date(Date.now() + 3600000),
  scopes: ['identify', 'guilds', 'guilds.read'],
  status: IntegrationStatus.ACTIVE,
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
}

export const mockSteamIntegration = {
  id: 'integration-steam-123',
  userId: 'user-123',
  platform: PlatformCode.STEAM,
  externalUserId: '76561198000000000',
  externalUsername: 'TestSteamUser',
  accessToken: 'steam-test-access-token',
  refreshToken: 'steam-test-refresh-token',
  expiresAt: new Date(Date.now() + 3600000),
  scopes: ['read_profile', 'read_library'],
  status: IntegrationStatus.ACTIVE,
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
}

// Mock API responses
export const mockYouTubeVideos = [
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
]

export const mockDiscordGuilds = [
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
]

export const mockSteamGames = [
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
]

// Mock environment variables
export const mockEnvVars = {
  JWT_SECRET: 'test-jwt-secret',
  STEAM_API_KEY: 'test-steam-api-key',
  YOUTUBE_API_KEY: 'test-youtube-api-key',
  DISCORD_BOT_TOKEN: 'test-discord-bot-token',
  NODE_ENV: 'test'
}

// Test utilities
export const createMockRequest = (overrides: any = {}) => ({
  user: mockUser,
  headers: {
    authorization: `Bearer ${mockValidToken}`,
    ...overrides.headers
  },
  query: {},
  body: {},
  params: {},
  ...overrides
})

export const createMockResponse = () => {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  res.cookie = jest.fn().mockReturnValue(res)
  res.clearCookie = jest.fn().mockReturnValue(res)
  return res
}

// Database mock helpers
export const setupMockDatabase = () => {
  const mockDb = new Map()
  
  return {
    get: (key: string) => mockDb.get(key),
    set: (key: string, value: any) => mockDb.set(key, value),
    delete: (key: string) => mockDb.delete(key),
    clear: () => mockDb.clear(),
    has: (key: string) => mockDb.has(key),
    size: () => mockDb.size
  }
}

// Rate limiting mock
export const createMockRateLimiter = () => {
  const requests = new Map()
  
  return {
    checkLimit: (key: string, limit: number, windowMs: number) => {
      const now = Date.now()
      const windowStart = now - windowMs
      
      if (!requests.has(key)) {
        requests.set(key, [])
      }
      
      const userRequests = requests.get(key)
      const validRequests = userRequests.filter((time: number) => time > windowStart)
      
      if (validRequests.length >= limit) {
        return false
      }
      
      validRequests.push(now)
      requests.set(key, validRequests)
      return true
    },
    clear: () => requests.clear()
  }
}

// Global test setup
beforeAll(() => {
  // Set mock environment variables
  Object.entries(mockEnvVars).forEach(([key, value]) => {
    process.env[key] = value
  })
})

afterAll(() => {
  // Clean up environment variables
  Object.keys(mockEnvVars).forEach(key => {
    delete process.env[key]
  })
})

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
})
