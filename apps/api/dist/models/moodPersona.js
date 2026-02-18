"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapRowToMoodSelection = mapRowToMoodSelection;
exports.mapRowToPersonaProfile = mapRowToPersonaProfile;
exports.mapRowToUserAction = mapRowToUserAction;
exports.mapRowToRecommendationEvent = mapRowToRecommendationEvent;
exports.mapRowToMoodPrediction = mapRowToMoodPrediction;
exports.mapRowToMoodPattern = mapRowToMoodPattern;
exports.mapRowToLearningMetrics = mapRowToLearningMetrics;
/**
 * Database row mapping functions
 */
function mapRowToMoodSelection(row) {
    return {
        id: row.id,
        userId: row.userId,
        primaryMood: row.primaryMood,
        secondaryMood: row.secondaryMood,
        intensity: row.intensity,
        sessionId: row.sessionId,
        timestamp: new Date(row.timestamp),
        context: JSON.parse(row.context),
        outcomes: JSON.parse(row.outcomes),
        createdAt: new Date(row.createdAt)
    };
}
function mapRowToPersonaProfile(row) {
    return {
        id: row.id,
        userId: row.userId,
        genreWeights: JSON.parse(row.genreWeights),
        tagWeights: JSON.parse(row.tagWeights),
        moodAffinity: JSON.parse(row.moodAffinity),
        sessionPatterns: JSON.parse(row.sessionPatterns),
        hybridSuccess: JSON.parse(row.hybridSuccess),
        platformBiases: JSON.parse(row.platformBiases),
        timePreferences: JSON.parse(row.timePreferences),
        confidence: row.confidence,
        sampleSize: row.sampleSize,
        version: row.version,
        lastUpdated: new Date(row.lastUpdated),
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
    };
}
function mapRowToUserAction(row) {
    return {
        id: row.id,
        userId: row.userId,
        type: row.type,
        gameId: row.gameId,
        gameTitle: row.gameTitle,
        moodContext: row.moodContext ? JSON.parse(row.moodContext) : undefined,
        timestamp: new Date(row.timestamp),
        sessionId: row.sessionId,
        metadata: JSON.parse(row.metadata || '{}'),
        createdAt: new Date(row.createdAt)
    };
}
function mapRowToRecommendationEvent(row) {
    return {
        id: row.id,
        userId: row.userId,
        moodContext: JSON.parse(row.moodContext),
        recommendedGames: JSON.parse(row.recommendedGames),
        clickedGameId: row.clickedGameId,
        successFlag: row.successFlag,
        timestamp: new Date(row.timestamp),
        sessionId: row.sessionId,
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        createdAt: new Date(row.createdAt)
    };
}
function mapRowToMoodPrediction(row) {
    return {
        id: row.id,
        userId: row.userId,
        predictedMood: row.predictedMood,
        confidence: row.confidence,
        reasoning: JSON.parse(row.reasoning || '[]'),
        contextualFactors: JSON.parse(row.contextualFactors || '[]'),
        successProbability: row.successProbability,
        acceptedFlag: row.acceptedFlag,
        timestamp: new Date(row.timestamp),
        sessionId: row.sessionId,
        createdAt: new Date(row.createdAt)
    };
}
function mapRowToMoodPattern(row) {
    return {
        id: row.id,
        userId: row.userId,
        patternType: row.patternType,
        patternKey: row.patternKey,
        moodId: row.moodId,
        frequency: row.frequency,
        successRate: row.successRate,
        lastSeen: new Date(row.lastSeen),
        confidence: row.confidence,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
    };
}
function mapRowToLearningMetrics(row) {
    return {
        id: row.id,
        userId: row.userId,
        metricType: row.metricType,
        metricValue: row.metricValue,
        period: row.period,
        timestamp: new Date(row.timestamp),
        metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
        createdAt: new Date(row.createdAt)
    };
}
//# sourceMappingURL=moodPersona.js.map