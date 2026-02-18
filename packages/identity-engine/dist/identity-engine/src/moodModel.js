"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeSessionResonance = exports.calculateSessionResonance = exports.calculateMoodForecast = exports.GAMING_MOODS = void 0;
exports.calculateMoodTrend = calculateMoodTrend;
// Simple moods export for build compatibility
exports.GAMING_MOODS = [
    {
        id: 'neutral',
        name: 'Neutral',
        description: 'Balanced gaming mood',
        color: '#6B7280',
        icon: '😊',
        energyLevel: 5,
        socialPreference: 'flexible',
        timeOfDay: ['morning', 'afternoon', 'evening', 'night'],
        genreAffinities: [],
        category: 'vibe'
    }
];
/**
 * Calculate mood trends from user mood history
 */
function calculateMoodTrend(moodHistory, timeframe = 'month') {
    // Group moods by ID for trend calculation
    const moodGroups = moodHistory.reduce((groups, mood) => {
        if (!groups[mood.id]) {
            groups[mood.id] = [];
        }
        groups[mood.id].push(mood);
        return groups;
    }, {});
    // Calculate trends for each mood
    const trends = Object.entries(moodGroups).map(([moodId, moods]) => {
        const sortedMoods = moods.sort((a, b) => (a.lastExperienced?.getTime() || 0) - (b.lastExperienced?.getTime() || 0));
        if (sortedMoods.length < 2) {
            return {
                moodId,
                trend: 'stable',
                changeRate: 0,
                confidence: 0,
                timeframe
            };
        }
        // Calculate trend based on preference changes
        const firstPref = sortedMoods[0].preference;
        const lastPref = sortedMoods[sortedMoods.length - 1].preference;
        const changeRate = (lastPref - firstPref) / 100;
        let trend;
        if (Math.abs(changeRate) < 0.1) {
            trend = 'stable';
        }
        else if (changeRate > 0) {
            trend = 'increasing';
        }
        else {
            trend = 'decreasing';
        }
        // Calculate confidence based on data points and consistency
        const confidence = Math.min(1, sortedMoods.length / 5) * (1 - Math.abs(changeRate - 0.5));
        return {
            moodId,
            trend,
            changeRate,
            confidence,
            timeframe
        };
    });
    // Find dominant trend (highest confidence * absolute change rate)
    const dominantTrend = trends.reduce((dominant, current) => {
        const dominantScore = dominant.confidence * Math.abs(dominant.changeRate);
        const currentScore = current.confidence * Math.abs(current.changeRate);
        return currentScore > dominantScore ? current : dominant;
    }, trends[0] || {
        moodId: '',
        trend: 'stable',
        changeRate: 0,
        confidence: 0,
        timeframe
    });
    // Calculate volatility (standard deviation of change rates)
    const changeRates = trends.map(t => t.changeRate);
    const avgChangeRate = changeRates.reduce((sum, rate) => sum + rate, 0) / changeRates.length;
    const variance = changeRates.reduce((sum, rate) => sum + Math.pow(rate - avgChangeRate, 2), 0) / changeRates.length;
    const volatility = Math.sqrt(variance);
    return {
        trends,
        dominantTrend,
        volatility: Math.min(1, volatility * 2), // Normalize to 0-1
        lastAnalyzed: new Date()
    };
}
// Export mood forecasting analysis
var moodForecast_1 = require("./mood/moodForecast");
Object.defineProperty(exports, "calculateMoodForecast", { enumerable: true, get: function () { return moodForecast_1.calculateMoodForecast; } });
// Export session resonance tracking
var sessionResonance_1 = require("./mood/sessionResonance");
Object.defineProperty(exports, "calculateSessionResonance", { enumerable: true, get: function () { return sessionResonance_1.calculateSessionResonance; } });
Object.defineProperty(exports, "analyzeSessionResonance", { enumerable: true, get: function () { return sessionResonance_1.analyzeSessionResonance; } });
