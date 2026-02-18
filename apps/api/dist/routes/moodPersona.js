"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const identityService_1 = require("../identity/identityService");
const database_1 = require("../services/database");
const moodPersonaService_1 = require("../services/moodPersonaService");
const simpleMoodPersonaService_1 = require("../services/simpleMoodPersonaService");
const identity_engine_1 = require("@gamepilot/identity-engine");
const observabilityService_1 = require("../services/observabilityService");
const router = (0, express_1.Router)();
const moodPersonaService = new moodPersonaService_1.MoodPersonaService(database_1.databaseService.db);
const simpleMoodPersonaService = new simpleMoodPersonaService_1.SimpleMoodPersonaService();
const moodPersonaIntegration = new identity_engine_1.MoodPersonaIntegration();
const observabilityService = new observabilityService_1.ObservabilityService(database_1.databaseService.db);
// Validation schemas
const MoodSelectionSchema = zod_1.z.object({
    primaryMood: zod_1.z.string(),
    secondaryMood: zod_1.z.string().optional(),
    intensity: zod_1.z.number().min(0).max(1),
    sessionId: zod_1.z.string().optional(),
    context: zod_1.z.object({
        timeOfDay: zod_1.z.enum(['morning', 'afternoon', 'evening', 'night']),
        dayOfWeek: zod_1.z.number().min(0).max(6),
        trigger: zod_1.z.enum(['manual', 'suggested', 'auto']),
        previousMood: zod_1.z.string().optional(),
        sessionLength: zod_1.z.number().optional()
    }),
    outcomes: zod_1.z.object({
        gamesRecommended: zod_1.z.number(),
        gamesLaunched: zod_1.z.number(),
        averageSessionDuration: zod_1.z.number().optional(),
        userRating: zod_1.z.number().min(1).max(5).optional(),
        ignoredRecommendations: zod_1.z.number()
    })
});
const UserActionSchema = zod_1.z.object({
    type: zod_1.z.enum(['launch', 'ignore', 'rate', 'switch_mood', 'session_complete']),
    gameId: zod_1.z.string().optional(),
    gameTitle: zod_1.z.string().optional(),
    moodContext: zod_1.z.object({
        primaryMood: zod_1.z.string(),
        secondaryMood: zod_1.z.string().optional()
    }).optional(),
    sessionId: zod_1.z.string().optional(),
    metadata: zod_1.z.object({
        sessionDuration: zod_1.z.number().optional(),
        rating: zod_1.z.number().min(1).max(5).optional(),
        reason: zod_1.z.string().optional(),
        previousMood: zod_1.z.string().optional()
    })
});
const RecommendationEventSchema = zod_1.z.object({
    moodContext: zod_1.z.object({
        primaryMood: zod_1.z.string(),
        secondaryMood: zod_1.z.string().optional(),
        intensity: zod_1.z.number()
    }),
    recommendedGames: zod_1.z.array(zod_1.z.object({
        gameId: zod_1.z.string(),
        name: zod_1.z.string(),
        score: zod_1.z.number(),
        reasoning: zod_1.z.array(zod_1.z.string())
    })),
    clickedGameId: zod_1.z.string().optional(),
    successFlag: zod_1.z.boolean().optional(),
    sessionId: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
const MoodPredictionSchema = zod_1.z.object({
    predictedMood: zod_1.z.string(),
    confidence: zod_1.z.number().min(0).max(1),
    reasoning: zod_1.z.array(zod_1.z.string()),
    contextualFactors: zod_1.z.array(zod_1.z.string()),
    successProbability: zod_1.z.number().min(0).max(1),
    sessionId: zod_1.z.string().optional()
});
/**
 * POST /api/mood/selection
 * Log a mood selection event
 */
router.post('/selection', identityService_1.authenticateToken, async (req, res) => {
    const startTime = Date.now();
    const userId = req.authenticatedUser.id;
    try {
        const validatedData = MoodSelectionSchema.parse(req.body);
        // Create mood selection record
        const moodSelection = await moodPersonaService.createMoodSelection({
            userId,
            primaryMood: validatedData.primaryMood,
            secondaryMood: validatedData.secondaryMood,
            intensity: validatedData.intensity,
            sessionId: validatedData.sessionId,
            timestamp: new Date(),
            context: validatedData.context,
            outcomes: validatedData.outcomes
        });
        // Process with persona integration
        const enhancedIdentity = await moodPersonaIntegration.processMoodSelection(userId, moodSelection);
        // Update persona profile
        const existingProfile = await moodPersonaService.getPersonaProfile(userId);
        if (existingProfile) {
            await moodPersonaService.updatePersonaProfile(userId, {
                genreWeights: enhancedIdentity.dynamicMoodWeights[moodSelection.primaryMood]?.genreWeights || existingProfile.genreWeights,
                tagWeights: enhancedIdentity.dynamicMoodWeights[moodSelection.primaryMood]?.tagWeights || existingProfile.tagWeights,
                moodAffinity: enhancedIdentity.dynamicMoodWeights[moodSelection.primaryMood] ? {
                    ...existingProfile.moodAffinity,
                    [moodSelection.primaryMood]: enhancedIdentity.dynamicMoodWeights[moodSelection.primaryMood].confidence
                } : existingProfile.moodAffinity,
                confidence: enhancedIdentity.dynamicMoodWeights[moodSelection.primaryMood]?.confidence || existingProfile.confidence,
                sampleSize: enhancedIdentity.dynamicMoodWeights[moodSelection.primaryMood]?.sampleSize || existingProfile.sampleSize
            });
        }
        const duration = Date.now() - startTime;
        await observabilityService.logPerformance('mood_selection', duration, true, userId, {
            primaryMood: validatedData.primaryMood,
            hasSecondaryMood: !!validatedData.secondaryMood,
            intensity: validatedData.intensity
        });
        res.json({
            success: true,
            data: {
                moodSelection,
                personaUpdated: !!existingProfile
            }
        });
    }
    catch (error) {
        const duration = Date.now() - startTime;
        await observabilityService.logPerformance('mood_selection', duration, false, userId);
        await observabilityService.logError('mood_selection', error, userId, {
            body: req.body
        });
        console.error('❌ Failed to log mood selection:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to log mood selection'
        });
    }
});
/**
 * GET /api/mood/selections
 * Get mood selection history for user
 */
router.get('/selections', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.authenticatedUser.id;
        const limit = parseInt(req.query.limit) || 50;
        const selections = await moodPersonaService.getMoodSelections(userId, limit);
        res.json({
            success: true,
            data: selections
        });
    }
    catch (error) {
        console.error('Error getting mood selections:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get mood selections'
        });
    }
});
/**
 * POST /api/mood/action
 * Log a user action for learning
 */
router.post('/action', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.authenticatedUser.id;
        const validatedData = UserActionSchema.parse(req.body);
        // Create user action record
        const userAction = await moodPersonaService.createUserAction({
            userId,
            type: validatedData.type,
            gameId: validatedData.gameId,
            gameTitle: validatedData.gameTitle,
            moodContext: validatedData.moodContext,
            timestamp: new Date(),
            sessionId: validatedData.sessionId,
            metadata: validatedData.metadata
        });
        // Learn from user action
        await moodPersonaIntegration.learnFromUserAction(userId, userAction);
        res.json({
            success: true,
            data: userAction
        });
    }
    catch (error) {
        console.error('Error logging user action:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to log user action'
        });
    }
});
/**
 * GET /api/mood/actions
 * Get user action history
 */
router.get('/actions', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.authenticatedUser.id;
        const limit = parseInt(req.query.limit) || 100;
        const type = req.query.type;
        const actions = type
            ? await moodPersonaService.getUserActionsByType(userId, type, limit)
            : await moodPersonaService.getUserActions(userId, limit);
        res.json({
            success: true,
            data: actions
        });
    }
    catch (error) {
        console.error('Error getting user actions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user actions'
        });
    }
});
/**
 * POST /api/mood/recommendation
 * Log a recommendation event
 */
router.post('/recommendation', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.authenticatedUser.id;
        const validatedData = RecommendationEventSchema.parse(req.body);
        const recommendationEvent = await moodPersonaService.createRecommendationEvent({
            userId,
            moodContext: validatedData.moodContext,
            recommendedGames: validatedData.recommendedGames,
            clickedGameId: validatedData.clickedGameId,
            successFlag: validatedData.successFlag,
            timestamp: new Date(),
            sessionId: validatedData.sessionId,
            metadata: validatedData.metadata
        });
        res.json({
            success: true,
            data: recommendationEvent
        });
    }
    catch (error) {
        console.error('Error logging recommendation event:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to log recommendation event'
        });
    }
});
/**
 * GET /api/mood/recommendations
 * Get recommendation history
 */
router.get('/recommendations', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.authenticatedUser.id;
        const limit = parseInt(req.query.limit) || 50;
        const recommendations = await moodPersonaService.getRecommendationEvents(userId, limit);
        res.json({
            success: true,
            data: recommendations
        });
    }
    catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get recommendations'
        });
    }
});
/**
 * POST /api/mood/prediction
 * Log a mood prediction
 */
router.post('/prediction', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.authenticatedUser.id;
        const validatedData = MoodPredictionSchema.parse(req.body);
        const moodPrediction = await moodPersonaService.createMoodPrediction({
            userId,
            predictedMood: validatedData.predictedMood,
            confidence: validatedData.confidence,
            reasoning: validatedData.reasoning,
            contextualFactors: validatedData.contextualFactors,
            successProbability: validatedData.successProbability,
            timestamp: new Date(),
            sessionId: validatedData.sessionId
        });
        res.json({
            success: true,
            data: moodPrediction
        });
    }
    catch (error) {
        console.error('Error logging mood prediction:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to log mood prediction'
        });
    }
});
/**

/**
 * GET /api/mood/predictions
 * Get mood prediction history
 */
router.get('/predictions', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.authenticatedUser.id;
        const limit = parseInt(req.query.limit) || 50;
        const predictions = await moodPersonaService.getMoodPredictions(userId, limit);
        res.json({
            success: true,
            data: predictions
        });
    }
    catch (error) {
        console.error('Error getting mood predictions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get mood predictions'
        });
    }
});
/**
 * GET /api/mood/persona
 * Get user's persona profile
 */
router.get('/persona', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.authenticatedUser.id;
        let profile = await moodPersonaService.getPersonaProfile(userId);
        // Create default profile if none exists
        if (!profile) {
            profile = await moodPersonaService.createPersonaProfile({
                userId,
                genreWeights: {},
                tagWeights: {},
                moodAffinity: {},
                sessionPatterns: {
                    dailyRhythms: {},
                    weeklyPatterns: {},
                    contextualTriggers: {}
                },
                hybridSuccess: {},
                platformBiases: {},
                timePreferences: {
                    morning: 0.5,
                    afternoon: 0.5,
                    evening: 0.5,
                    night: 0.5
                },
                confidence: 0.1,
                sampleSize: 0,
                version: '2.0.0',
                lastUpdated: new Date()
            });
        }
        res.json({
            success: true,
            data: profile
        });
    }
    catch (error) {
        console.error('Error getting persona profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get persona profile'
        });
    }
});
/**
 * PUT /api/mood/persona
 * Update user's persona profile
 */
router.put('/persona', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.authenticatedUser.id;
        const updates = req.body;
        const profile = await moodPersonaService.updatePersonaProfile(userId, updates);
        res.json({
            success: true,
            data: profile
        });
    }
    catch (error) {
        console.error('Error updating persona profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update persona profile'
        });
    }
});
/**
 * GET /api/mood/patterns
 * Get mood patterns for user
 */
router.get('/patterns', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.authenticatedUser.id;
        const patternType = req.query.type;
        const patterns = await moodPersonaService.getMoodPatterns(userId, patternType);
        res.json({
            success: true,
            data: patterns
        });
    }
    catch (error) {
        console.error('Error getting mood patterns:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get mood patterns'
        });
    }
});
/**
 * GET /api/mood/analytics
 * Get mood analytics and metrics
 */
router.get('/analytics', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.authenticatedUser.id;
        const days = parseInt(req.query.days) || 30;
        const [moodStats, recommendationSuccess, predictionAccuracy] = await Promise.all([
            moodPersonaService.getMoodSelectionStats(userId, days),
            moodPersonaService.getRecommendationSuccessRate(userId, days),
            moodPersonaService.getMoodPredictionAccuracy(userId, days)
        ]);
        res.json({
            success: true,
            data: {
                moodStats,
                recommendationSuccess,
                predictionAccuracy,
                period: `${days} days`
            }
        });
    }
    catch (error) {
        console.error('Error getting mood analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get mood analytics'
        });
    }
});
exports.default = router;
//# sourceMappingURL=moodPersona.js.map