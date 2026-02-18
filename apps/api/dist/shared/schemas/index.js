"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePlatform = exports.validateMood = exports.validateEmotionalTag = exports.validatePlayHistory = exports.validateUserProfile = exports.validateGame = exports.ActivitySchema = exports.IntegrationSchema = exports.UserProfileSchema = exports.UserPreferencesSchema = exports.GameSchema = exports.PlayHistorySchema = exports.AchievementSchema = exports.EmotionalTagSchema = exports.PlatformSchema = exports.MoodSchema = exports.SubgenreSchema = exports.GenreSchema = exports.SessionTypeSchema = exports.TagCategorySchema = exports.PlayStatusSchema = exports.PlatformCodeSchema = void 0;
// Zod schemas for validation
const zod_1 = require("zod");
exports.PlatformCodeSchema = zod_1.z.enum(['steam', 'xbox', 'playstation', 'nintendo', 'epic', 'gog', 'other']);
exports.PlayStatusSchema = zod_1.z.enum(['unplayed', 'playing', 'completed', 'paused', 'abandoned']);
exports.TagCategorySchema = zod_1.z.enum(['memory', 'feeling', 'occasion', 'social']);
exports.SessionTypeSchema = zod_1.z.enum(['main', 'break', 'social', 'achievement']);
exports.GenreSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().optional(),
    color: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
    icon: zod_1.z.string().optional(),
});
exports.SubgenreSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().optional(),
    genre: zod_1.z.lazy(() => exports.GenreSchema),
    color: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional(),
    icon: zod_1.z.string().optional(),
});
exports.MoodSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(50),
    description: zod_1.z.string().optional(),
    color: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
    gradient: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').optional(),
    icon: zod_1.z.string().optional(),
    timeOfDay: zod_1.z.array(zod_1.z.enum(['morning', 'afternoon', 'evening', 'night'])),
    energyLevel: zod_1.z.number().min(1).max(10),
    socialPreference: zod_1.z.enum(['solo', 'coop', 'competitive', 'any']),
});
exports.PlatformSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(100),
    code: exports.PlatformCodeSchema,
    logo: zod_1.z.string().url().optional(),
    apiEndpoint: zod_1.z.string().url().optional(),
    isConnected: zod_1.z.boolean(),
    userId: zod_1.z.string().optional(),
    lastSync: zod_1.z.date().optional(),
});
exports.EmotionalTagSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(50),
    description: zod_1.z.string().optional(),
    color: zod_1.z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
    icon: zod_1.z.string().optional(),
    category: exports.TagCategorySchema,
    isCustom: zod_1.z.boolean(),
    createdBy: zod_1.z.string().uuid().optional(),
});
exports.AchievementSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    gameId: zod_1.z.string().uuid(),
    platformCode: exports.PlatformCodeSchema,
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().optional(),
    icon: zod_1.z.string().url().optional(),
    unlockedAt: zod_1.z.date().optional(),
    rarity: zod_1.z.number().min(0).max(100).optional(),
    points: zod_1.z.number().min(0).optional(),
});
exports.PlayHistorySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    gameId: zod_1.z.string().uuid(),
    platform: exports.PlatformSchema,
    startTime: zod_1.z.date(),
    endTime: zod_1.z.date().optional(),
    duration: zod_1.z.number().min(0).optional(),
    sessionType: exports.SessionTypeSchema,
    mood: exports.MoodSchema.optional(),
    notes: zod_1.z.string().max(1000).optional(),
    achievements: zod_1.z.array(exports.AchievementSchema).optional(),
});
exports.GameSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().max(2000).optional(),
    coverImage: zod_1.z.string().url().optional(),
    backgroundImages: zod_1.z.array(zod_1.z.string().url()).optional(),
    releaseDate: zod_1.z.date().optional(),
    developer: zod_1.z.string().max(100).optional(),
    publisher: zod_1.z.string().max(100).optional(),
    genres: zod_1.z.array(exports.GenreSchema),
    subgenres: zod_1.z.array(exports.SubgenreSchema),
    platforms: zod_1.z.array(exports.PlatformSchema),
    emotionalTags: zod_1.z.array(exports.EmotionalTagSchema),
    userRating: zod_1.z.number().min(1).max(10).optional(),
    globalRating: zod_1.z.number().min(1).max(10).optional(),
    playStatus: exports.PlayStatusSchema,
    hoursPlayed: zod_1.z.number().min(0).optional(),
    lastPlayed: zod_1.z.date().optional(),
    addedAt: zod_1.z.date(),
    notes: zod_1.z.string().max(1000).optional(),
    isFavorite: zod_1.z.boolean(),
});
exports.UserPreferencesSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    favoriteGenres: zod_1.z.array(exports.GenreSchema),
    playStyle: zod_1.z.object({
        competitive: zod_1.z.number().min(0).max(100),
        cooperative: zod_1.z.number().min(0).max(100),
        casual: zod_1.z.number().min(0).max(100),
        hardcore: zod_1.z.number().min(0).max(100),
        explorer: zod_1.z.number().min(0).max(100),
        completionist: zod_1.z.number().min(0).max(100),
    }),
    moodPreferences: zod_1.z.array(zod_1.z.object({
        mood: exports.MoodSchema,
        gameTypes: zod_1.z.array(zod_1.z.string()),
        timeOfDay: zod_1.z.enum(['morning', 'afternoon', 'evening', 'night']),
    })),
    notificationSettings: zod_1.z.object({
        achievements: zod_1.z.boolean(),
        friendActivity: zod_1.z.boolean(),
        gameRecommendations: zod_1.z.boolean(),
        platformUpdates: zod_1.z.boolean(),
    }),
    privacySettings: zod_1.z.object({
        profileVisibility: zod_1.z.enum(['public', 'friends', 'private']),
        activitySharing: zod_1.z.boolean(),
        gameLibraryVisibility: zod_1.z.enum(['public', 'friends', 'private']),
    }),
});
exports.UserProfileSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    username: zod_1.z.string().min(3).max(30),
    email: zod_1.z.string().email(),
    avatar: zod_1.z.string().url().optional(),
    displayName: zod_1.z.string().max(50).optional(),
    bio: zod_1.z.string().max(500).optional(),
    location: zod_1.z.string().max(100).optional(),
    timezone: zod_1.z.string(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    preferences: exports.UserPreferencesSchema,
    platforms: zod_1.z.array(exports.PlatformSchema),
    games: zod_1.z.array(exports.GameSchema),
    favoriteGenres: zod_1.z.array(exports.GenreSchema),
    currentMood: exports.MoodSchema.optional(),
    totalPlaytime: zod_1.z.number().min(0),
    achievementCount: zod_1.z.number().min(0),
});
exports.IntegrationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    platform: zod_1.z.string().min(1).max(50),
    type: zod_1.z.enum(['youtube', 'discord', 'spotify', 'twitch']),
    connected: zod_1.z.boolean(),
    userId: zod_1.z.string().optional(),
    accessToken: zod_1.z.string().optional(),
    refreshToken: zod_1.z.string().optional(),
    expiresAt: zod_1.z.date().optional(),
    lastSync: zod_1.z.date().optional(),
});
exports.ActivitySchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    userId: zod_1.z.string().uuid(),
    type: zod_1.z.enum(['achievement', 'session_start', 'session_end', 'game_added', 'integration_connected']),
    gameId: zod_1.z.string().uuid().optional(),
    platform: zod_1.z.string().optional(),
    data: zod_1.z.record(zod_1.z.any()),
    timestamp: zod_1.z.date(),
});
// Export validation functions
const validateGame = (data) => exports.GameSchema.parse(data);
exports.validateGame = validateGame;
const validateUserProfile = (data) => exports.UserProfileSchema.parse(data);
exports.validateUserProfile = validateUserProfile;
const validatePlayHistory = (data) => exports.PlayHistorySchema.parse(data);
exports.validatePlayHistory = validatePlayHistory;
const validateEmotionalTag = (data) => exports.EmotionalTagSchema.parse(data);
exports.validateEmotionalTag = validateEmotionalTag;
const validateMood = (data) => exports.MoodSchema.parse(data);
exports.validateMood = validateMood;
const validatePlatform = (data) => exports.PlatformSchema.parse(data);
exports.validatePlatform = validatePlatform;
//# sourceMappingURL=index.js.map