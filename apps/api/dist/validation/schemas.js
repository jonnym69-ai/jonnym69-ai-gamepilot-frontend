"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameFilterSchema = exports.paginationSchema = exports.steamConnectSchema = exports.recommendationRequestSchema = exports.personaUpdateSchema = exports.moodEntrySchema = exports.deleteGameSchema = exports.updateGameSchema = exports.addGameSchema = exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = void 0;
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
exports.validateParams = validateParams;
const zod_1 = require("zod");
// Common validation patterns
const emailSchema = zod_1.z.string().email('Invalid email format').max(255, 'Email too long');
const passwordSchema = zod_1.z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long');
const usernameSchema = zod_1.z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username too long').regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens');
const idSchema = zod_1.z.string().uuid('Invalid ID format');
// Authentication schemas
exports.registerSchema = zod_1.z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    displayName: zod_1.z.string().min(1, 'Display name is required').max(100, 'Display name too long'),
    timezone: zod_1.z.string().optional().default('UTC')
});
exports.loginSchema = zod_1.z.object({
    username: usernameSchema,
    password: zod_1.z.string().min(1, 'Password is required')
});
exports.updateProfileSchema = zod_1.z.object({
    displayName: zod_1.z.string().min(1, 'Display name is required').max(100, 'Display name too long').optional(),
    bio: zod_1.z.string().max(500, 'Bio too long').optional(),
    location: zod_1.z.string().max(100, 'Location too long').optional(),
    website: zod_1.z.string().url('Invalid website URL').optional().or(zod_1.z.literal('')),
    timezone: zod_1.z.string().optional(),
    avatar: zod_1.z.string().url('Invalid avatar URL').optional().or(zod_1.z.literal(''))
});
// Game schemas
exports.addGameSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Game title is required').max(200, 'Title too long'),
    genres: zod_1.z.array(zod_1.z.string()).max(10, 'Too many genres').optional(),
    platforms: zod_1.z.array(zod_1.z.string()).max(5, 'Too many platforms').optional(),
    tags: zod_1.z.array(zod_1.z.string()).max(20, 'Too many tags').optional(),
    rating: zod_1.z.number().min(0, 'Rating must be between 0 and 5').max(5, 'Rating must be between 0 and 5').optional(),
    status: zod_1.z.enum(['unplayed', 'playing', 'completed', 'paused', 'abandoned']).optional(),
    notes: zod_1.z.string().max(1000, 'Notes too long').optional()
});
exports.updateGameSchema = zod_1.z.object({
    id: idSchema,
    title: zod_1.z.string().min(1, 'Game title is required').max(200, 'Title too long').optional(),
    genres: zod_1.z.array(zod_1.z.string()).max(10, 'Too many genres').optional(),
    platforms: zod_1.z.array(zod_1.z.string()).max(5, 'Too many platforms').optional(),
    tags: zod_1.z.array(zod_1.z.string()).max(20, 'Too many tags').optional(),
    rating: zod_1.z.number().min(0, 'Rating must be between 0 and 5').max(5, 'Rating must be between 0 and 5').optional(),
    status: zod_1.z.enum(['unplayed', 'playing', 'completed', 'paused', 'abandoned']).optional(),
    notes: zod_1.z.string().max(1000, 'Notes too long').optional(),
    playtime: zod_1.z.number().min(0, 'Playtime cannot be negative').optional()
});
exports.deleteGameSchema = zod_1.z.object({
    id: idSchema
});
// Mood and persona schemas
exports.moodEntrySchema = zod_1.z.object({
    mood: zod_1.z.string().min(1, 'Mood is required').max(50, 'Mood too long'),
    intensity: zod_1.z.number().min(1, 'Intensity must be between 1 and 10').max(10, 'Intensity must be between 1 and 10'),
    triggers: zod_1.z.array(zod_1.z.string()).max(10, 'Too many triggers').optional(),
    activities: zod_1.z.array(zod_1.z.string()).max(10, 'Too many activities').optional(),
    notes: zod_1.z.string().max(500, 'Notes too long').optional()
});
exports.personaUpdateSchema = zod_1.z.object({
    traits: zod_1.z.array(zod_1.z.string()).max(20, 'Too many traits').optional(),
    preferences: zod_1.z.object({
        genres: zod_1.z.array(zod_1.z.string()).max(10, 'Too many genre preferences').optional(),
        playtimes: zod_1.z.array(zod_1.z.string()).max(5, 'Too many preferred playtimes').optional(),
        socialLevel: zod_1.z.enum(['solo', 'small', 'large']).optional(),
        competitiveness: zod_1.z.enum(['casual', 'moderate', 'competitive']).optional()
    }).optional()
});
// Recommendation schemas
exports.recommendationRequestSchema = zod_1.z.object({
    mood: zod_1.z.string().optional(),
    genres: zod_1.z.array(zod_1.z.string()).max(5, 'Too many genres').optional(),
    platforms: zod_1.z.array(zod_1.z.string()).max(3, 'Too many platforms').optional(),
    playtime: zod_1.z.object({
        min: zod_1.z.number().min(0, 'Minimum playtime cannot be negative').optional(),
        max: zod_1.z.number().min(0, 'Maximum playtime cannot be negative').optional()
    }).optional(),
    limit: zod_1.z.number().min(1, 'Limit must be at least 1').max(50, 'Limit cannot exceed 50').optional().default(10)
});
// Integration schemas
exports.steamConnectSchema = zod_1.z.object({
    steamId: zod_1.z.string().regex(/^7656119\d{9,}$/, 'Invalid Steam ID format'),
    username: zod_1.z.string().min(1, 'Steam username is required').max(50, 'Steam username too long')
});
// Query parameter schemas
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1, 'Page must be at least 1').optional().default(1),
    limit: zod_1.z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional().default(20)
});
exports.gameFilterSchema = zod_1.z.object({
    genre: zod_1.z.string().optional(),
    platform: zod_1.z.string().optional(),
    status: zod_1.z.enum(['unplayed', 'playing', 'completed', 'paused', 'abandoned']).optional(),
    rating: zod_1.z.coerce.number().min(0, 'Rating must be between 0 and 5').max(5, 'Rating must be between 0 and 5').optional(),
    search: zod_1.z.string().max(100, 'Search term too long').optional()
}).merge(exports.paginationSchema);
// Export validation middleware factory
function validateBody(schema) {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                return res.status(400).json({
                    error: 'Validation failed',
                    message: 'Invalid input data',
                    details: errors
                });
            }
            return res.status(500).json({
                error: 'Internal server error',
                message: 'Validation error occurred'
            });
        }
    };
}
function validateQuery(schema) {
    return (req, res, next) => {
        try {
            schema.parse(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                return res.status(400).json({
                    error: 'Validation failed',
                    message: 'Invalid query parameters',
                    details: errors
                });
            }
            return res.status(500).json({
                error: 'Internal server error',
                message: 'Query validation error occurred'
            });
        }
    };
}
function validateParams(schema) {
    return (req, res, next) => {
        try {
            schema.parse(req.params);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                return res.status(400).json({
                    error: 'Validation failed',
                    message: 'Invalid path parameters',
                    details: errors
                });
            }
            return res.status(500).json({
                error: 'Internal server error',
                message: 'Parameter validation error occurred'
            });
        }
    };
}
//# sourceMappingURL=schemas.js.map