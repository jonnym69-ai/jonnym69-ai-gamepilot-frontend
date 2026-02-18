"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeatureExtractor = void 0;
/**
 * Feature Extraction Module
 * Converts raw signals into normalized features for mood analysis
 */
class FeatureExtractor {
    constructor() {
        this.featureWeights = {
            engagementVolatility: 0.25,
            challengeSeeking: 0.20,
            socialOpenness: 0.20,
            explorationBias: 0.20,
            focusStability: 0.15
        };
    }
    /**
     * Extract normalized features from behavioral signals
     */
    extractFeatures(signals) {
        if (signals.length === 0) {
            return this.getDefaultFeatures();
        }
        const sessionSignals = signals.filter(s => s.source === 'session');
        const genreSignals = signals.filter(s => s.source === 'genre');
        const playtimeSignals = signals.filter(s => s.source === 'playtime');
        const platformSignals = signals.filter(s => s.source === 'platform');
        const integrationSignals = signals.filter(s => s.source === 'integration');
        return {
            engagementVolatility: this.calculateEngagementVolatility(sessionSignals),
            challengeSeeking: this.calculateChallengeSeeking(sessionSignals, genreSignals),
            socialOpenness: this.calculateSocialOpenness(sessionSignals, integrationSignals),
            explorationBias: this.calculateExplorationBias(genreSignals, platformSignals),
            focusStability: this.calculateFocusStability(sessionSignals, playtimeSignals)
        };
    }
    /**
     * Calculate engagement volatility based on session patterns
     */
    calculateEngagementVolatility(sessionSignals) {
        if (sessionSignals.length < 3)
            return 0.5;
        const durations = sessionSignals
            .map(s => s.data.duration || 0)
            .filter(d => d > 0);
        if (durations.length === 0)
            return 0.5;
        const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length;
        const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length;
        const standardDeviation = Math.sqrt(variance);
        // Normalize to 0-1 range (higher volatility = higher value)
        return Math.min(1, standardDeviation / mean);
    }
    /**
     * Calculate challenge seeking preference
     */
    calculateChallengeSeeking(sessionSignals, genreSignals) {
        let challengeScore = 0.5; // Default to neutral
        // From session signals: look for difficult games and high intensity
        const difficultSessions = sessionSignals.filter(s => s.data.sessionType === 'main' && (s.data.intensity || 5) > 7);
        if (sessionSignals.length > 0) {
            challengeScore += (difficultSessions.length / sessionSignals.length) * 0.3;
        }
        // From genre signals: look for challenging genres
        const challengingGenres = ['strategy', 'puzzle', 'rpg', 'action'];
        const challengingTransitions = genreSignals.filter(s => challengingGenres.includes(s.data.toGenre) ||
            challengingGenres.includes(s.data.fromGenre));
        if (genreSignals.length > 0) {
            challengeScore += (challengingTransitions.length / genreSignals.length) * 0.2;
        }
        return Math.min(1, Math.max(0, challengeScore));
    }
    /**
     * Calculate social openness from session and integration signals
     */
    calculateSocialOpenness(sessionSignals, integrationSignals) {
        let socialScore = 0.5;
        // From session signals: look for social session types
        const socialSessions = sessionSignals.filter(s => s.data.sessionType === 'social' || s.data.sessionType === 'coop');
        if (sessionSignals.length > 0) {
            socialScore += (socialSessions.length / sessionSignals.length) * 0.4;
        }
        // From integration signals: look for social interactions
        const socialInteractions = integrationSignals.filter(s => s.data.socialInteraction === true);
        if (integrationSignals.length > 0) {
            socialScore += (socialInteractions.length / integrationSignals.length) * 0.3;
        }
        return Math.min(1, Math.max(0, socialScore));
    }
    /**
     * Calculate exploration bias from genre and platform signals
     */
    calculateExplorationBias(genreSignals, platformSignals) {
        let explorationScore = 0.5;
        // From genre signals: look for variety in genre transitions
        const uniqueGenres = new Set();
        genreSignals.forEach(s => {
            uniqueGenres.add(s.data.fromGenre);
            uniqueGenres.add(s.data.toGenre);
        });
        if (genreSignals.length > 0) {
            explorationScore += (uniqueGenres.size / (genreSignals.length * 2)) * 0.3;
        }
        // From platform signals: look for platform switching
        const platformSwitches = platformSignals.length;
        if (platformSwitches > 0) {
            explorationScore += Math.min(0.3, platformSwitches / 10) * 0.3;
        }
        return Math.min(1, Math.max(0, explorationScore));
    }
    /**
     * Calculate focus stability from session and playtime patterns
     */
    calculateFocusStability(sessionSignals, playtimeSignals) {
        let focusScore = 0.5;
        // From session signals: look for completion rates and consistent session types
        const completedSessions = sessionSignals.filter(s => s.data.completed === true);
        if (sessionSignals.length > 0) {
            const completionRate = completedSessions.length / sessionSignals.length;
            focusScore += completionRate * 0.3;
        }
        // From playtime signals: look for consistency in daily patterns
        if (playtimeSignals.length > 0) {
            const consistencies = playtimeSignals.map(s => s.data.consistency || 0.5);
            const averageConsistency = consistencies.reduce((sum, c) => sum + c, 0) / consistencies.length;
            focusScore += averageConsistency * 0.4;
        }
        // Look for main session types (indicative of focus)
        const mainSessions = sessionSignals.filter(s => s.data.sessionType === 'main');
        if (sessionSignals.length > 0) {
            const mainSessionRatio = mainSessions.length / sessionSignals.length;
            focusScore += mainSessionRatio * 0.3;
        }
        return Math.min(1, Math.max(0, focusScore));
    }
    /**
     * Get default features when no signals are available
     */
    getDefaultFeatures() {
        return {
            engagementVolatility: 0.5,
            challengeSeeking: 0.5,
            socialOpenness: 0.5,
            explorationBias: 0.5,
            focusStability: 0.5
        };
    }
    /**
     * Get feature importance weights
     */
    getFeatureWeights() {
        return {
            engagementVolatility: this.featureWeights.engagementVolatility,
            challengeSeeking: this.featureWeights.challengeSeeking,
            socialOpenness: this.featureWeights.socialOpenness,
            explorationBias: this.featureWeights.explorationBias,
            focusStability: this.featureWeights.focusStability
        };
    }
    /**
     * Calculate feature confidence based on signal quality and quantity
     */
    calculateFeatureConfidence(signals) {
        const totalSignals = signals.length;
        const weightedSignals = signals.reduce((sum, s) => sum + s.weight, 0);
        const averageWeight = totalSignals > 0 ? weightedSignals / totalSignals : 0;
        const overallConfidence = Math.min(1, (totalSignals / 10) * averageWeight);
        const byFeature = {
            engagementVolatility: Math.min(1, signals.filter(s => s.source === 'session').length / 5),
            challengeSeeking: Math.min(1, (signals.filter(s => s.source === 'session' || s.source === 'genre').length) / 8),
            socialOpenness: Math.min(1, (signals.filter(s => s.source === 'session' || s.source === 'integration').length) / 8),
            explorationBias: Math.min(1, (signals.filter(s => s.source === 'genre' || s.source === 'platform').length) / 8),
            focusStability: Math.min(1, (signals.filter(s => s.source === 'session' || s.source === 'playtime').length) / 8)
        };
        return { overall: overallConfidence, byFeature };
    }
    /**
     * Validate extracted features
     */
    validateFeatures(features) {
        const issues = [];
        // Check if all features are in valid range
        for (const [key, value] of Object.entries(features)) {
            if (value < 0 || value > 1) {
                issues.push(`${key} is out of range [0,1]: ${value}`);
            }
        }
        // Check for extreme values that might indicate data issues
        if (features.engagementVolatility > 0.9) {
            issues.push('Engagement volatility is extremely high - possible data inconsistency');
        }
        if (features.challengeSeeking > 0.9 && features.focusStability < 0.2) {
            issues.push('High challenge seeking with low focus stability - unusual pattern');
        }
        return {
            isValid: issues.length === 0,
            issues
        };
    }
}
exports.FeatureExtractor = FeatureExtractor;
//# sourceMappingURL=featureExtraction.js.map