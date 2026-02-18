"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionResonanceService = void 0;
const identity_engine_1 = require("@gamepilot/identity-engine");
/**
 * Session Resonance Service
 * Tracks and analyzes the alignment between predicted moods and actual gaming sessions
 */
class SessionResonanceService {
    constructor() {
        this.resonanceData = [];
    }
    /**
     * Record a new gaming session and calculate resonance
     */
    async recordSessionResonance(userId, sessionId, forecastResult, sessionData, actualMood) {
        try {
            const resonance = (0, identity_engine_1.calculateSessionResonance)(sessionId, userId, forecastResult, actualMood, sessionData);
            // Store resonance data (in production, this would go to database)
            this.resonanceData.push(resonance);
            console.log(`Session resonance recorded: ${resonance.resonanceScore.toFixed(3)} for mood ${resonance.predictedMood}`);
            return resonance;
        }
        catch (error) {
            console.error('Failed to record session resonance:', error);
            throw new Error('Session resonance recording failed');
        }
    }
    /**
     * Get resonance analysis for a user
     */
    async getUserResonanceAnalysis(userId) {
        try {
            // Filter resonance data by user
            const userResonanceData = this.resonanceData.filter(session => session.userId === userId);
            // Analyze resonance patterns
            const analysis = (0, identity_engine_1.analyzeSessionResonance)(userResonanceData);
            return analysis;
        }
        catch (error) {
            console.error('Failed to get user resonance analysis:', error);
            throw new Error('Resonance analysis failed');
        }
    }
    /**
     * Get overall system resonance analysis
     */
    async getSystemResonanceAnalysis() {
        try {
            const analysis = (0, identity_engine_1.analyzeSessionResonance)(this.resonanceData);
            return analysis;
        }
        catch (error) {
            console.error('Failed to get system resonance analysis:', error);
            throw new Error('System resonance analysis failed');
        }
    }
    /**
     * Get recent resonance sessions for a user
     */
    async getRecentResonanceSessions(userId, limit = 10) {
        try {
            const userSessions = this.resonanceData
                .filter(session => session.userId === userId)
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .slice(0, limit);
            return userSessions;
        }
        catch (error) {
            console.error('Failed to get recent resonance sessions:', error);
            throw new Error('Failed to retrieve recent sessions');
        }
    }
    /**
     * Get resonance data for mood forecasting improvement
     */
    async getResonanceDataForForecasting(userId) {
        try {
            const userSessions = this.resonanceData.filter(session => session.userId === userId);
            const analysis = (0, identity_engine_1.analyzeSessionResonance)(userSessions);
            // Calculate confidence adjustments based on accuracy
            const confidenceAdjustments = {};
            Object.entries(analysis.moodAccuracy).forEach(([mood, accuracy]) => {
                // Reduce confidence for moods with poor accuracy
                confidenceAdjustments[mood] = Math.max(0.3, accuracy);
            });
            // Calculate session patterns
            const sessionPatterns = {};
            const moodGroups = {};
            userSessions.forEach(session => {
                if (!moodGroups[session.predictedMood]) {
                    moodGroups[session.predictedMood] = [];
                }
                moodGroups[session.predictedMood].push(session);
            });
            Object.entries(moodGroups).forEach(([mood, sessions]) => {
                const avgDuration = sessions.reduce((sum, s) => sum + s.sessionData.duration, 0) / sessions.length;
                const avgEngagement = sessions.reduce((sum, s) => sum + s.sessionData.engagement, 0) / sessions.length;
                sessionPatterns[mood] = {
                    avgDuration: Math.round(avgDuration),
                    avgEngagement: Math.round(avgEngagement)
                };
            });
            return {
                moodAccuracy: analysis.moodAccuracy,
                confidenceAdjustments,
                sessionPatterns
            };
        }
        catch (error) {
            console.error('Failed to get resonance data for forecasting:', error);
            throw new Error('Failed to retrieve forecasting data');
        }
    }
    /**
     * Clear resonance data (for testing)
     */
    clearResonanceData() {
        this.resonanceData = [];
    }
    /**
     * Get resonance statistics
     */
    getResonanceStats() {
        const totalSessions = this.resonanceData.length;
        const averageResonance = totalSessions > 0
            ? this.resonanceData.reduce((sum, session) => sum + session.resonanceScore, 0) / totalSessions
            : 0;
        const sessionsByMood = {};
        this.resonanceData.forEach(session => {
            sessionsByMood[session.predictedMood] = (sessionsByMood[session.predictedMood] || 0) + 1;
        });
        return {
            totalSessions,
            averageResonance,
            sessionsByMood
        };
    }
}
exports.SessionResonanceService = SessionResonanceService;
//# sourceMappingURL=sessionResonanceService.js.map