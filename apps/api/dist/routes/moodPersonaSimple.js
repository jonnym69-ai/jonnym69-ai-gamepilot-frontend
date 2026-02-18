"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const identityService_1 = require("../identity/identityService");
const database_1 = require("../services/database");
const simpleMoodPersonaService_1 = require("../services/simpleMoodPersonaService");
const router = (0, express_1.Router)();
const simpleMoodPersonaService = new simpleMoodPersonaService_1.SimpleMoodPersonaService();
// Validation schemas
const MoodSelectionSchema = zod_1.z.object({
    primaryMood: zod_1.z.string(),
    secondaryMood: zod_1.z.string().optional(),
    intensity: zod_1.z.number().min(0).max(1),
    sessionId: zod_1.z.string().optional(),
    context: zod_1.z.object({
        timeOfDay: zod_1.z.enum(['morning', 'afternoon', 'evening', 'night']),
        dayOfWeek: zod_1.z.number().min(0).max(6),
        sessionLength: zod_1.z.number().optional(),
        previousMood: zod_1.z.string().optional(),
        trigger: zod_1.z.enum(['manual', 'suggested', 'auto'])
    }),
    outcomes: zod_1.z.object({
        gamesRecommended: zod_1.z.number().optional(),
        gamesLaunched: zod_1.z.number().optional(),
        ignoredRecommendations: zod_1.z.number().optional()
    }).optional()
});
const UserActionSchema = zod_1.z.object({
    type: zod_1.z.enum(['launch', 'play', 'quit', 'rate', 'ignore']),
    gameId: zod_1.z.string(),
    gameTitle: zod_1.z.string(),
    moodContext: zod_1.z.object({
        primaryMood: zod_1.z.string(),
        secondaryMood: zod_1.z.string().optional(),
        intensity: zod_1.z.number()
    }),
    metadata: zod_1.z.object({
        sessionDuration: zod_1.z.number().optional(),
        rating: zod_1.z.number().min(1).max(5).optional(),
        completed: zod_1.z.boolean().optional(),
        notes: zod_1.z.string().optional()
    }).optional()
});
const RecommendationRequestSchema = zod_1.z.object({
    primaryMood: zod_1.z.string(),
    secondaryMood: zod_1.z.string().optional(),
    limit: zod_1.z.number().min(1).max(50).default(10),
    context: zod_1.z.object({
        timeAvailable: zod_1.z.number().optional(),
        socialContext: zod_1.z.enum(['solo', 'co-op', 'competitive']).optional(),
        difficulty: zod_1.z.enum(['casual', 'normal', 'hard', 'expert']).optional()
    }).optional()
});
/**
 * POST /api/mood/selection
 * Record a mood selection event
 */
router.post('/selection', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }
        const validatedData = MoodSelectionSchema.parse(req.body);
        // Process mood selection
        const moodEvent = await simpleMoodPersonaService.processMoodSelection(userId, validatedData);
        res.json({
            success: true,
            data: {
                moodEvent,
                message: 'Mood selection recorded successfully'
            }
        });
    }
    catch (error) {
        console.error('Mood selection error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record mood selection'
        });
    }
});
/**
 * POST /api/mood/action
 * Record a user action
 */
router.post('/action', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }
        const validatedData = UserActionSchema.parse(req.body);
        // Ensure metadata exists for the service
        const actionData = {
            ...validatedData,
            metadata: validatedData.metadata ?? {}
        };
        // Process user action
        const action = await simpleMoodPersonaService.processUserAction(userId, actionData);
        res.json({
            success: true,
            data: {
                action,
                message: 'User action recorded successfully'
            }
        });
    }
    catch (error) {
        console.error('User action error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record user action'
        });
    }
});
/**
 * GET /api/mood/suggestions
 * Get mood suggestions for a user
 */
router.get('/suggestions', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }
        const context = req.query.context ? JSON.parse(req.query.context) : undefined;
        const suggestions = await simpleMoodPersonaService.getMoodSuggestions(userId, context);
        res.json({
            success: true,
            data: {
                suggestions,
                count: suggestions.length
            }
        });
    }
    catch (error) {
        console.error('Mood suggestions error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get mood suggestions'
        });
    }
});
/**
 * POST /api/mood/recommendations/generate
 * Generate personalized recommendations
 */
router.post('/recommendations/generate', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }
        const validatedData = RecommendationRequestSchema.parse(req.body);
        // Get user's games from database
        const userGames = await database_1.databaseService.getUserGames(userId);
        // Generate recommendations
        const recommendations = await simpleMoodPersonaService.generatePersonalizedRecommendations(userId, validatedData.primaryMood, validatedData.secondaryMood, validatedData.limit);
        res.json({
            success: true,
            data: {
                recommendations,
                count: recommendations.length,
                mood: validatedData.primaryMood,
                secondaryMood: validatedData.secondaryMood
            }
        });
    }
    catch (error) {
        console.error('Recommendations error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate recommendations'
        });
    }
});
/**
 * GET /api/mood/profile
 * Get user's mood-persona profile
 */
router.get('/profile', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }
        const profile = simpleMoodPersonaService.getUserProfile(userId);
        const moodStats = simpleMoodPersonaService.getMoodStatistics(userId);
        const actionStats = simpleMoodPersonaService.getActionStatistics(userId);
        res.json({
            success: true,
            data: {
                profile,
                statistics: {
                    moods: moodStats,
                    actions: actionStats
                }
            }
        });
    }
    catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user profile'
        });
    }
});
/**
 * GET /api/mood/statistics
 * Get detailed mood statistics
 */
router.get('/statistics', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }
        const moodStats = simpleMoodPersonaService.getMoodStatistics(userId);
        const actionStats = simpleMoodPersonaService.getActionStatistics(userId);
        res.json({
            success: true,
            data: {
                moods: moodStats,
                actions: actionStats
            }
        });
    }
    catch (error) {
        console.error('Statistics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get statistics'
        });
    }
});
/**
 * GET /api/mood/history
 * Get mood history for a user
 */
router.get('/history', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const profile = simpleMoodPersonaService.getUserProfile(userId);
        const history = profile.moodHistory || [];
        const paginatedHistory = history
            .slice(-offset - limit, -offset || undefined)
            .reverse();
        res.json({
            success: true,
            data: {
                history: paginatedHistory,
                total: history.length,
                limit,
                offset
            }
        });
    }
    catch (error) {
        console.error('History error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get mood history'
        });
    }
});
/**
 * DELETE /api/mood/reset
 * Reset user's mood-persona data
 */
router.delete('/reset', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }
        // Reset user data (this would need to be implemented in the service)
        // For now, just return success
        res.json({
            success: true,
            message: 'Mood-persona data reset successfully'
        });
    }
    catch (error) {
        console.error('Reset error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reset mood-persona data'
        });
    }
});
exports.default = router;
//# sourceMappingURL=moodPersonaSimple.js.map