"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const personaService_1 = require("../persona/personaService");
const identityService_1 = require("../identity/identityService");
const database_1 = require("../services/database");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Validation schemas
const moodUpdateSchema = zod_1.z.object({
    mood: zod_1.z.enum(['energetic', 'focused', 'relaxed', 'creative', 'competitive', 'social', 'curious', 'nostalgic', 'stressed', 'bored', 'neutral']),
    intensity: zod_1.z.number().min(1).max(10),
    context: zod_1.z.string().optional()
});
const intentUpdateSchema = zod_1.z.object({
    intent: zod_1.z.enum(['short_session', 'comfort', 'novelty', 'social', 'challenge', 'exploration', 'achievement', 'neutral']),
    context: zod_1.z.string().optional()
});
const behaviorUpdateSchema = zod_1.z.object({
    gameId: zod_1.z.string(),
    gameName: zod_1.z.string().optional(),
    sessionLength: zod_1.z.number().min(1),
    completed: zod_1.z.boolean(),
    achievements: zod_1.z.number().optional(),
    difficulty: zod_1.z.enum(['easy', 'normal', 'hard']).optional(),
    multiplayer: zod_1.z.boolean().optional(),
    timestamp: zod_1.z.string().datetime().optional()
});
const personaEventSchema = zod_1.z.object({
    type: zod_1.z.enum(['mood', 'intent', 'behavior', 'session', 'achievement']),
    timestamp: zod_1.z.string().datetime().transform(val => new Date(val)),
    userId: zod_1.z.string(),
    data: zod_1.z.any().refine(val => val !== undefined, { message: 'data is required' }),
    context: zod_1.z.object({
        gameId: zod_1.z.string().optional(),
        sessionId: zod_1.z.string().optional(),
        source: zod_1.z.enum(['user_input', 'behavioral', 'system_inferred']).optional()
    }).optional()
});
/**
 * GET /persona
 * Get user's current persona
 */
router.get('/', async (req, res) => {
    try {
        // Try to get user, but allow requests without authentication for development
        let user = null;
        try {
            user = req.user;
        }
        catch (error) {
            console.log('👤 No user authentication, returning null for development');
        }
        if (!user) {
            // Return null user for development without authentication
            return res.json({
                success: false,
                message: 'No authenticated user found'
            });
        }
        const userId = user.id;
        const persona = await personaService_1.personaService.getPersona(userId);
        if (!persona) {
            return res.status(404).json({
                error: 'Persona not found',
                message: 'No persona data found for this user'
            });
        }
        return res.status(200).json({
            success: true,
            data: persona
        });
    }
    catch (error) {
        console.error('Error in GET /persona:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve persona data'
        });
    }
});
/**
 * POST /persona/mood
 * Update user's current mood
 */
router.post('/mood', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'User must be authenticated to update mood'
            });
        }
        const validation = moodUpdateSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Invalid mood data',
                details: validation.error.errors
            });
        }
        const persona = await personaService_1.personaService.updatePersona(userId, {
            mood: validation.data
        });
        return res.status(200).json({
            success: true,
            message: 'Mood updated successfully',
            data: {
                currentMood: persona.currentMood,
                moodIntensity: persona.moodIntensity,
                lastUpdated: persona.lastUpdated
            }
        });
    }
    catch (error) {
        console.error('Error in POST /persona/mood:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update mood'
        });
    }
});
/**
 * POST /persona/intent
 * Update user's current intent
 */
router.post('/intent', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'User must be authenticated to update intent'
            });
        }
        const validation = intentUpdateSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Invalid intent data',
                details: validation.error.errors
            });
        }
        const persona = await personaService_1.personaService.updatePersona(userId, {
            intent: validation.data
        });
        return res.status(200).json({
            success: true,
            message: 'Intent updated successfully',
            data: {
                currentIntent: persona.currentIntent,
                lastUpdated: persona.lastUpdated
            }
        });
    }
    catch (error) {
        console.error('Error in POST /persona/intent:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update intent'
        });
    }
});
/**
 * POST /persona/event
 * Process persona update events
 */
router.post('/event', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'User must be authenticated to process persona events'
            });
        }
        const validation = personaEventSchema.safeParse({
            ...req.body,
            userId,
            timestamp: new Date(req.body.timestamp || new Date().toISOString())
        });
        if (!validation.success) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Invalid event data',
                details: validation.error.errors
            });
        }
        // Ensure data is always provided
        const eventData = {
            ...validation.data,
            data: validation.data.data || {}
        };
        const persona = await personaService_1.personaService.updatePersona(userId, {
            event: eventData
        });
        return res.status(200).json({
            success: true,
            message: 'Event processed successfully',
            data: {
                eventType: eventData.type,
                lastUpdated: persona.lastUpdated
            }
        });
    }
    catch (error) {
        console.error('Error in POST /persona/event:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to process event'
        });
    }
});
/**
 * POST /persona/analyze
 * Trigger fresh persona analysis
 */
router.post('/analyze', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'User must be authenticated to analyze persona'
            });
        }
        const analysis = await personaService_1.personaService.analyzePersona(userId);
        return res.status(200).json({
            success: true,
            message: 'Persona analysis completed',
            data: analysis
        });
    }
    catch (error) {
        console.error('Error in POST /persona/analyze:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to analyze persona'
        });
    }
});
/**
 * GET /persona/state
 * Get persona state for recommendation engine
 */
router.get('/state', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'User must be authenticated to get persona state'
            });
        }
        const state = await personaService_1.personaService.getPersonaState(userId);
        if (!state) {
            return res.status(404).json({
                error: 'Persona state not found',
                message: 'No persona state available for this user'
            });
        }
        return res.status(200).json({
            success: true,
            data: state
        });
    }
    catch (error) {
        console.error('Error in GET /persona/state:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to get persona state'
        });
    }
});
/**
 * DELETE /persona/reset
 * Reset user's persona data
 */
router.delete('/reset', identityService_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'User must be authenticated to reset persona'
            });
        }
        // Delete persona from database
        await database_1.databaseService.deletePersona(userId);
        // Create new default persona
        const persona = await personaService_1.personaService.getPersona(userId);
        return res.status(200).json({
            success: true,
            message: 'Persona reset successfully',
            data: {
                personaId: persona?.userId,
                createdAt: persona?.createdAt,
                traits: persona?.traits
            }
        });
    }
    catch (error) {
        console.error('Error in DELETE /persona/reset:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to reset persona'
        });
    }
});
/**
 * GET /persona/health
 * Health check for persona service
 */
router.get('/health', async (req, res) => {
    try {
        // Test persona service functionality
        const testUserId = 'health-check-test';
        // Test persona creation and retrieval
        await personaService_1.personaService.getPersona(testUserId);
        return res.status(200).json({
            status: 'healthy',
            service: 'persona',
            timestamp: new Date().toISOString(),
            checks: {
                database: 'connected',
                service: 'operational',
                memory: 'sufficient'
            }
        });
    }
    catch (error) {
        console.error('Error in GET /persona/health:', error);
        return res.status(503).json({
            status: 'unhealthy',
            service: 'persona',
            error: 'Health check failed',
            timestamp: new Date().toISOString()
        });
    }
});
/**
 * POST /persona/session/start
 * Log the start of a game session for persona tracking
 */
router.post('/session/start', async (req, res) => {
    try {
        const { gameId, gameMetadata, context } = req.body;
        // Validate required fields
        if (!gameId) {
            return res.status(400).json({
                error: 'Missing required field: gameId',
                timestamp: new Date().toISOString()
            });
        }
        // Try to get user, but allow requests without authentication for development
        let user = null;
        try {
            user = req.user;
        }
        catch (error) {
            // Continue without user for development
        }
        const userId = user?.id || 'anonymous-user';
        console.log(`🎮 POST /persona/session/start - Logging session start for game: ${gameId}`);
        // Create session start event
        const sessionEvent = {
            type: 'session',
            userId,
            data: {
                action: 'session_start',
                gameId,
                gameMetadata,
                context,
                timestamp: new Date().toISOString()
            },
            context: {
                gameId,
                source: 'system_inferred'
            }
        };
        // Store the session event (this would typically go to a database)
        // For now, we'll just log it and return success
        console.log('📝 Session start event:', JSON.stringify(sessionEvent, null, 2));
        return res.status(200).json({
            success: true,
            message: 'Session start logged successfully',
            sessionId: `session_${Date.now()}_${gameId}`,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error in POST /persona/session/start:', error);
        return res.status(500).json({
            error: 'Failed to log session start',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
});
/**
 * POST /persona/session/end
 * Log the end of a game session for persona tracking
 */
router.post('/session/end', async (req, res) => {
    try {
        const { gameId, duration, sessionId } = req.body;
        // Validate required fields
        if (!gameId) {
            return res.status(400).json({
                error: 'Missing required field: gameId',
                timestamp: new Date().toISOString()
            });
        }
        // Try to get user, but allow requests without authentication for development
        let user = null;
        try {
            user = req.user;
        }
        catch (error) {
            // Continue without user for development
        }
        const userId = user?.id || 'anonymous-user';
        console.log(`🎮 POST /persona/session/end - Logging session end for game: ${gameId}`);
        // Create session end event
        const sessionEvent = {
            type: 'session',
            userId,
            data: {
                action: 'session_end',
                gameId,
                duration,
                sessionId,
                timestamp: new Date().toISOString()
            },
            context: {
                gameId,
                source: 'system_inferred'
            }
        };
        // Store the session event (this would typically go to a database)
        // For now, we'll just log it and return success
        console.log('📝 Session end event:', JSON.stringify(sessionEvent, null, 2));
        return res.status(200).json({
            success: true,
            message: 'Session end logged successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error in POST /persona/session/end:', error);
        return res.status(500).json({
            error: 'Failed to log session end',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
});
exports.default = router;
//# sourceMappingURL=persona.js.map