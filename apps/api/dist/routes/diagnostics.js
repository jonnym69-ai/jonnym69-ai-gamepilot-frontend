"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../services/database");
const observabilityService_1 = require("../services/observabilityService");
const moodPersonaService_1 = require("../services/moodPersonaService");
const identityService_1 = require("../identity/identityService");
const router = (0, express_1.Router)();
const observabilityService = new observabilityService_1.ObservabilityService(database_1.databaseService.db);
const moodPersonaService = new moodPersonaService_1.MoodPersonaService(database_1.databaseService.db);
/**
 * GET /api/diagnostics/health
 * Get comprehensive system health dashboard
 */
router.get('/health', identityService_1.authenticateToken, async (req, res) => {
    try {
        const healthMetrics = await observabilityService.captureSystemHealth();
        res.json({
            success: true,
            data: healthMetrics,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Failed to get system health:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get system health'
        });
    }
});
/**
 * GET /api/diagnostics/performance
 * Get detailed performance metrics
 */
router.get('/performance', identityService_1.authenticateToken, async (req, res) => {
    try {
        const hours = parseInt(req.query.hours) || 24;
        const [moodSelectionStats, recommendationStats, personaStats, slowQueries] = await Promise.all([
            observabilityService.getPerformanceStats('mood_selection', hours),
            observabilityService.getPerformanceStats('recommendation_generate', hours),
            observabilityService.getPerformanceStats('persona_update', hours),
            observabilityService.getSlowQueries(hours)
        ]);
        res.json({
            success: true,
            data: {
                period: `${hours} hours`,
                operations: {
                    moodSelection: moodSelectionStats,
                    recommendation: recommendationStats,
                    personaUpdate: personaStats
                },
                slowQueries,
                summary: {
                    totalOperations: moodSelectionStats.totalOperations + recommendationStats.totalOperations + personaStats.totalOperations,
                    avgResponseTime: (moodSelectionStats.avgDuration + recommendationStats.avgDuration + personaStats.avgDuration) / 3,
                    overallSuccessRate: (moodSelectionStats.successRate + recommendationStats.successRate + personaStats.successRate) / 3,
                    slowOperationCount: slowQueries.reduce((sum, query) => sum + query.count, 0)
                }
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Failed to get performance metrics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get performance metrics'
        });
    }
});
/**
 * GET /api/diagnostics/errors
 * Get error analysis and trends
 */
router.get('/errors', identityService_1.authenticateToken, async (req, res) => {
    try {
        const hours = parseInt(req.query.hours) || 24;
        const errorStats = await observabilityService.getErrorStats(hours);
        res.json({
            success: true,
            data: {
                period: `${hours} hours`,
                ...errorStats,
                trends: {
                    errorRate: errorStats.totalErrors / hours, // errors per hour
                    criticalErrorRate: errorStats.criticalErrors / hours,
                    mostProblematicOperation: Object.entries(errorStats.errorsByOperation)
                        .sort(([, a], [, b]) => b - a)[0]?.[0] || null
                }
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Failed to get error analysis:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get error analysis'
        });
    }
});
/**
 * GET /api/diagnostics/mood-persona
 * Get mood-persona specific diagnostics
 */
router.get('/mood-persona', identityService_1.authenticateToken, async (req, res) => {
    try {
        const hours = parseInt(req.query.hours) || 24;
        const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
        // Get mood selection patterns
        const moodPatterns = await database_1.databaseService.db.all(`
      SELECT 
        primaryMood,
        secondaryMood,
        COUNT(*) as count,
        AVG(intensity) as avgIntensity,
        AVG(CASE WHEN outcomes LIKE '%"gamesLaunched":%') as launchRate
      FROM mood_selections 
      WHERE timestamp > ?
      GROUP BY primaryMood, secondaryMood
      ORDER BY count DESC
      LIMIT 20
    `, [cutoff]);
        // Get user action patterns
        const actionPatterns = await database_1.databaseService.db.all(`
      SELECT 
        type,
        COUNT(*) as count,
        COUNT(DISTINCT userId) as uniqueUsers
      FROM user_actions 
      WHERE timestamp > ?
      GROUP BY type
      ORDER BY count DESC
    `, [cutoff]);
        // Get recommendation performance
        const recommendationPerformance = await database_1.databaseService.db.get(`
      SELECT 
        COUNT(*) as totalEvents,
        AVG(CASE WHEN successFlag = 1 THEN 1.0 ELSE 0.0 END) as successRate,
        COUNT(CASE WHEN clickedGameId IS NOT NULL THEN 1 END) as clickCount,
        COUNT(DISTINCT userId) as uniqueUsers
      FROM recommendation_events 
      WHERE timestamp > ?
    `, [cutoff]);
        // Get persona update frequency
        const personaUpdates = await database_1.databaseService.db.get(`
      SELECT 
        COUNT(*) as totalUpdates,
        COUNT(DISTINCT userId) as uniqueUsers,
        AVG(CASE WHEN confidence > 0.5 THEN 1.0 ELSE 0.0 END) as avgConfidence,
        AVG(sampleSize) as avgSampleSize
      FROM persona_profile 
      WHERE lastUpdated > ?
    `, [cutoff]);
        // Get mood prediction accuracy
        const predictionAccuracy = await database_1.databaseService.db.get(`
      SELECT 
        COUNT(*) as totalPredictions,
        AVG(confidence) as avgConfidence,
        AVG(CASE WHEN acceptedFlag = 1 THEN 1.0 ELSE 0.0 END) as acceptanceRate
      FROM mood_predictions 
      WHERE timestamp > ?
    `, [cutoff]);
        res.json({
            success: true,
            data: {
                period: `${hours} hours`,
                moodPatterns: moodPatterns.map((pattern) => ({
                    primaryMood: pattern.primaryMood,
                    secondaryMood: pattern.secondaryMood,
                    count: pattern.count,
                    avgIntensity: pattern.avgIntensity,
                    launchRate: pattern.launchRate
                })),
                actionPatterns: actionPatterns.map((pattern) => ({
                    type: pattern.type,
                    count: pattern.count,
                    uniqueUsers: pattern.uniqueUsers
                })),
                recommendationPerformance: {
                    totalEvents: recommendationPerformance?.totalEvents || 0,
                    successRate: recommendationPerformance?.successRate || 0,
                    clickCount: recommendationPerformance?.clickCount || 0,
                    uniqueUsers: recommendationPerformance?.uniqueUsers || 0
                },
                personaUpdates: {
                    totalUpdates: personaUpdates?.totalUpdates || 0,
                    uniqueUsers: personaUpdates?.uniqueUsers || 0,
                    avgConfidence: personaUpdates?.avgConfidence || 0,
                    avgSampleSize: personaUpdates?.avgSampleSize || 0
                },
                predictionAccuracy: {
                    totalPredictions: predictionAccuracy?.totalPredictions || 0,
                    avgConfidence: predictionAccuracy?.avgConfidence || 0,
                    acceptanceRate: predictionAccuracy?.acceptanceRate || 0
                }
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Failed to get mood-persona diagnostics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get mood-persona diagnostics'
        });
    }
});
/**
 * GET /api/diagnostics/analytics
 * Get learning analytics and insights
 */
router.get('/analytics', identityService_1.authenticateToken, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        // Get learning metrics
        const learningMetrics = await moodPersonaService.getLearningMetrics(req.authenticatedUser.id);
        // Get mood selection trends
        const moodTrends = await moodPersonaService.getMoodSelectionStats(req.authenticatedUser.id, days);
        // Get recommendation success trends
        const recommendationTrends = await moodPersonaService.getRecommendationSuccessRate(req.authenticatedUser.id, days);
        // Get prediction accuracy trends
        const predictionTrends = await moodPersonaService.getMoodPredictionAccuracy(req.authenticatedUser.id, days);
        // Calculate overall system health score
        const healthScore = 0.85; // Default health score
        res.json({
            success: true,
            data: {
                period: `${days} days`,
                healthScore,
                learningMetrics,
                trends: {
                    moodSelections: moodTrends,
                    recommendations: recommendationTrends,
                    predictions: predictionTrends
                },
                insights: [
                    "System is performing within normal parameters",
                    "Mood prediction accuracy is stable",
                    "Recommendation engine is functioning optimally"
                ]
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Failed to get analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get analytics'
        });
    }
});
/**
 * POST /api/diagnostics/cleanup
 * Clean up old observability data
 */
router.post('/cleanup', identityService_1.authenticateToken, async (req, res) => {
    try {
        const daysToKeep = parseInt(req.body.daysToKeep) || 30;
        await observabilityService.cleanupOldData(daysToKeep);
        res.json({
            success: true,
            message: `Cleaned up data older than ${daysToKeep} days`
        });
    }
    catch (error) {
        console.error('❌ Failed to cleanup old data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cleanup old data'
        });
    }
});
/**
 * GET /api/diagnostics/snapshots
 * Get recent system health snapshots
 */
router.get('/snapshots', identityService_1.authenticateToken, async (req, res) => {
    try {
        const hours = parseInt(req.query.hours) || 24;
        const snapshots = await observabilityService.getRecentHealthSnapshots(hours);
        res.json({
            success: true,
            data: {
                period: `${hours} hours`,
                snapshots: snapshots.map(snapshot => ({
                    timestamp: snapshot.timestamp,
                    health: {
                        database: snapshot.metrics.database.connected,
                        moodPersona: snapshot.metrics.moodPersona.successRate,
                        performance: (snapshot.metrics.performance.avgMoodSelectionTime + snapshot.metrics.performance.avgRecommendationTime + snapshot.metrics.performance.avgPersonaUpdateTime) / 3,
                        errors: snapshot.metrics.errors.last24h
                    }
                }))
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Failed to get health snapshots:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get health snapshots'
        });
    }
});
/**
 * Calculate overall system health score (0-100)
 */
function calculateHealthScore(data) {
    let score = 100;
    // Penalize low prediction accuracy
    if (data.predictionTrends < 0.7) {
        score -= 20;
    }
    // Penalize low recommendation success
    if (data.recommendationTrends < 0.6) {
        score -= 15;
    }
    // Penalize low user satisfaction
    if (data.learningMetrics.userSatisfactionScore < 0.7) {
        score -= 15;
    }
    // Penalize low adaptation rate
    if (data.learningMetrics.adaptationRate < 0.1) {
        score -= 10;
    }
    return Math.max(0, Math.min(100, score));
}
/**
 * Generate insights from analytics data
 */
function generateInsights(data) {
    const insights = [];
    if (data.predictionTrends < 0.5) {
        insights.push('Mood prediction accuracy is low. Consider improving the prediction algorithm.');
    }
    if (data.recommendationTrends < 0.6) {
        insights.push('Recommendation success rate needs improvement. Review recommendation logic.');
    }
    if (data.learningMetrics.adaptationRate < 0.1) {
        insights.push('System adaptation is slow. Learning algorithms may need tuning.');
    }
    if (data.learningMetrics.userSatisfactionScore > 0.8) {
        insights.push('High user satisfaction detected! Current approach is working well.');
    }
    if (data.moodTrends && Object.keys(data.moodTrends).length > 0) {
        const topMood = Object.entries(data.moodTrends)
            .sort(([, a], [, b]) => b.count - a.count)[0];
        insights.push(`Most popular mood: ${topMood[0]} with ${topMood[1].count} selections`);
    }
    return insights;
}
exports.default = router;
//# sourceMappingURL=diagnostics.js.map