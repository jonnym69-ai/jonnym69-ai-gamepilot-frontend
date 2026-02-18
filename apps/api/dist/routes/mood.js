"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const moodService_1 = require("../mood/moodService");
const router = (0, express_1.Router)();
const moodService = new moodService_1.MoodService();
/**
 * GET /mood
 * Returns the current MoodVector for the authenticated user
 */
router.get('/', async (req, res) => {
    try {
        // Get user ID from authenticated session (would come from JWT middleware)
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'User must be authenticated to access mood analysis'
            });
        }
        // Get current mood analysis
        const moodAnalysis = await moodService.getCurrentMood(userId);
        if (!moodAnalysis) {
            return res.status(404).json({
                error: 'Mood analysis not found',
                message: 'No mood analysis data available for this user'
            });
        }
        // Validate the analysis before returning
        const validation = moodService.validateMoodAnalysis(moodAnalysis);
        if (!validation.isValid) {
            console.warn('Mood analysis validation failed:', validation.issues);
        }
        // Get additional insights
        const insights = moodService.getMoodInsights(moodAnalysis.moodVector);
        return res.status(200).json({
            success: true,
            data: {
                moodVector: moodAnalysis.moodVector,
                confidence: moodAnalysis.confidence,
                lastUpdated: moodAnalysis.lastUpdated,
                signalCount: moodAnalysis.signalCount,
                features: moodAnalysis.features,
                insights: {
                    dominant: insights.dominant,
                    description: insights.description,
                    traits: insights.traits,
                    recommendations: insights.recommendations,
                    confidence: insights.confidence
                },
                validation: {
                    isValid: validation.isValid,
                    issues: validation.issues
                }
            }
        });
    }
    catch (error) {
        console.error('Error in GET /mood:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve mood analysis'
        });
    }
});
/**
 * POST /mood/analyze
 * Triggers a fresh mood analysis for the user
 */
router.post('/analyze', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'User must be authenticated to analyze mood'
            });
        }
        // In a real implementation, this would fetch user data from database
        // For now, return a placeholder response
        const mockSessions = []; // Would fetch from database
        const mockGames = []; // Would fetch from database
        const mockActivities = []; // Would fetch from database
        // Perform mood analysis
        const moodAnalysis = await moodService.analyzeUserMood(userId, mockSessions, mockGames, mockActivities);
        return res.status(200).json({
            success: true,
            data: moodAnalysis,
            message: 'Mood analysis completed successfully'
        });
    }
    catch (error) {
        console.error('Error in POST /mood/analyze:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to analyze mood'
        });
    }
});
/**
 * POST /mood/update
 * Updates mood analysis with new session data
 */
router.post('/update', async (req, res) => {
    try {
        const userId = req.user?.id;
        const { sessionData, gameData } = req.body;
        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'User must be authenticated to update mood analysis'
            });
        }
        if (!sessionData || !gameData) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Session data and game data are required'
            });
        }
        // Update mood analysis with new session
        await moodService.updateMoodAnalysis(userId, sessionData, gameData);
        return res.status(200).json({
            success: true,
            message: 'Mood analysis updated successfully'
        });
    }
    catch (error) {
        console.error('Error in POST /mood/update:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to update mood analysis'
        });
    }
});
/**
 * GET /mood/stats
 * Returns mood analysis statistics for the user
 */
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'User must be authenticated to access mood statistics'
            });
        }
        const stats = moodService.getMoodAnalysisStats(userId);
        return res.status(200).json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Error in GET /mood/stats:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve mood statistics'
        });
    }
});
/**
 * DELETE /mood/reset
 * Resets mood analysis data for the user
 */
router.delete('/reset', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'User must be authenticated to reset mood data'
            });
        }
        moodService.resetUserMoodData(userId);
        return res.status(200).json({
            success: true,
            message: 'Mood analysis data reset successfully'
        });
    }
    catch (error) {
        console.error('Error in DELETE /mood/reset:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to reset mood data'
        });
    }
});
/**
 * GET /mood/health
 * Health check endpoint for mood analysis service
 */
router.get('/health', async (req, res) => {
    try {
        const health = moodService.healthCheck();
        return res.status(health.status === 'healthy' ? 200 : 503).json({
            status: health.status,
            checks: health.checks,
            timestamp: health.timestamp
        });
    }
    catch (error) {
        console.error('Error in GET /mood/health:', error);
        return res.status(500).json({
            status: 'unhealthy',
            error: 'Health check failed',
            timestamp: new Date().toISOString()
        });
    }
});
exports.default = router;
//# sourceMappingURL=mood.js.map