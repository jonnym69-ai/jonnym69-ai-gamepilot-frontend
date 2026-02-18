// Zod schemas for validation
import { z } from 'zod'

export const PlatformCodeSchema = z.enum(['steam', 'xbox', 'playstation', 'nintendo', 'epic', 'gog', 'other'])
export const PlayStatusSchema = z.enum(['unplayed', 'playing', 'completed', 'paused', 'abandoned'])
export const TagCategorySchema = z.enum(['memory', 'feeling', 'occasion', 'social'])
export const SessionTypeSchema = z.enum(['main', 'break', 'social', 'achievement'])

export const GenreSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  icon: z.string().optional(),
})

export const SubgenreSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  genre: z.lazy(() => GenreSchema),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional(),
  icon: z.string().optional(),
})

export const MoodSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  gradient: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional(),
  icon: z.string().optional(),
  timeOfDay: z.array(z.enum(['morning', 'afternoon', 'evening', 'night'])),
  energyLevel: z.number().min(1).max(10),
  socialPreference: z.enum(['solo', 'coop', 'competitive', 'any']),
})

export const PlatformSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  code: PlatformCodeSchema,
  logo: z.string().url().optional(),
  apiEndpoint: z.string().url().optional(),
  isConnected: z.boolean(),
  userId: z.string().optional(),
  lastSync: z.date().optional(),
})

export const EmotionalTagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  icon: z.string().optional(),
  category: TagCategorySchema,
  isCustom: z.boolean(),
  createdBy: z.string().uuid().optional(),
})

export const AchievementSchema = z.object({
  id: z.string().uuid(),
  gameId: z.string().uuid(),
  platformCode: PlatformCodeSchema,
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  icon: z.string().url().optional(),
  unlockedAt: z.date().optional(),
  rarity: z.number().min(0).max(100).optional(),
  points: z.number().min(0).optional(),
})

export const PlayHistorySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  gameId: z.string().uuid(),
  platform: PlatformSchema,
  startTime: z.date(),
  endTime: z.date().optional(),
  duration: z.number().min(0).optional(),
  sessionType: SessionTypeSchema,
  mood: MoodSchema.optional(),
  notes: z.string().max(1000).optional(),
  achievements: z.array(AchievementSchema).optional(),
})

export const GameSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  coverImage: z.string().url().optional(),
  backgroundImages: z.array(z.string().url()).optional(),
  releaseDate: z.date().optional(),
  developer: z.string().max(100).optional(),
  publisher: z.string().max(100).optional(),
  genres: z.array(GenreSchema),
  subgenres: z.array(SubgenreSchema),
  platforms: z.array(PlatformSchema),
  emotionalTags: z.array(EmotionalTagSchema),
  userRating: z.number().min(1).max(10).optional(),
  globalRating: z.number().min(1).max(10).optional(),
  playStatus: PlayStatusSchema,
  hoursPlayed: z.number().min(0).optional(),
  lastPlayed: z.date().optional(),
  addedAt: z.date(),
  notes: z.string().max(1000).optional(),
  isFavorite: z.boolean(),
})

export const UserPreferencesSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  favoriteGenres: z.array(GenreSchema),
  playStyle: z.object({
    competitive: z.number().min(0).max(100),
    cooperative: z.number().min(0).max(100),
    casual: z.number().min(0).max(100),
    hardcore: z.number().min(0).max(100),
    explorer: z.number().min(0).max(100),
    completionist: z.number().min(0).max(100),
  }),
  moodPreferences: z.array(z.object({
    mood: MoodSchema,
    gameTypes: z.array(z.string()),
    timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']),
  })),
  notificationSettings: z.object({
    achievements: z.boolean(),
    friendActivity: z.boolean(),
    gameRecommendations: z.boolean(),
    platformUpdates: z.boolean(),
  }),
  privacySettings: z.object({
    profileVisibility: z.enum(['public', 'friends', 'private']),
    activitySharing: z.boolean(),
    gameLibraryVisibility: z.enum(['public', 'friends', 'private']),
  }),
})

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(30),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  displayName: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  timezone: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  preferences: UserPreferencesSchema,
  platforms: z.array(PlatformSchema),
  games: z.array(GameSchema),
  favoriteGenres: z.array(GenreSchema),
  currentMood: MoodSchema.optional(),
  totalPlaytime: z.number().min(0),
  achievementCount: z.number().min(0),
})

export const IntegrationSchema = z.object({
  id: z.string().uuid(),
  platform: z.string().min(1).max(50),
  type: z.enum(['youtube', 'discord', 'spotify', 'twitch']),
  connected: z.boolean(),
  userId: z.string().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresAt: z.date().optional(),
  lastSync: z.date().optional(),
})

export const ActivitySchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(['achievement', 'session_start', 'session_end', 'game_added', 'integration_connected']),
  gameId: z.string().uuid().optional(),
  platform: z.string().optional(),
  data: z.record(z.any()),
  timestamp: z.date(),
})

// Export validation functions
export const validateGame = (data: unknown) => GameSchema.parse(data)
export const validateUserProfile = (data: unknown) => UserProfileSchema.parse(data)
export const validatePlayHistory = (data: unknown) => PlayHistorySchema.parse(data)
export const validateEmotionalTag = (data: unknown) => EmotionalTagSchema.parse(data)
export const validateMood = (data: unknown) => MoodSchema.parse(data)
export const validatePlatform = (data: unknown) => PlatformSchema.parse(data)
