"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityEngine = void 0;
const playstyleModel_1 = require("./playstyleModel");
const recommendations_1 = require("./recommendations");
class IdentityEngine {
    constructor() {
        this.moodModel = {}; // Simple placeholder
        this.playstyleModel = new playstyleModel_1.PlaystyleModel();
        this.recommendationEngine = new recommendations_1.RecommendationEngine();
    }
    /**
     * Compute player identity from gaming history
     */
    computeIdentity(userId, sessions, options = {}) {
        const opts = {
            recentSessionWeight: 0.7,
            moodDecayDays: 30,
            minSessionsForComputation: 5,
            includeNegativeSessions: true,
            ...options
        };
        // Filter sessions based on options
        const relevantSessions = this.filterRelevantSessions(sessions, opts);
        if (relevantSessions.length < opts.minSessionsForComputation) {
            return this.createDefaultIdentity(userId, sessions);
        }
        // Compute mood preferences
        const moods = this.computeMoodPreferences(relevantSessions, opts);
        // Compute playstyle
        const playstyle = this.playstyleModel.computePlaystyle(relevantSessions);
        // Compute genre affinities
        const genreAffinities = this.computeGenreAffinities(relevantSessions);
        // Compute current mood (simplified)
        const computedMood = 'neutral'; // Simple fallback
        return {
            id: `identity-${userId}`,
            userId,
            moods,
            playstyle,
            sessions: relevantSessions,
            genreAffinities,
            computedMood,
            lastUpdated: new Date(),
            version: '1.0.0'
        };
    }
    /**
     * Update identity with new gaming session
     */
    updateIdentity(identity, newSession) {
        // Add new session
        const updatedSessions = [...identity.sessions, newSession];
        // Update mood preferences (simplified)
        const updatedMoods = identity.moods; // Simple fallback
        // Recompute playstyle (could be optimized to incremental updates)
        const updatedPlaystyle = this.playstyleModel.computePlaystyle(updatedSessions);
        // Recompute genre affinities
        const updatedGenreAffinities = this.computeGenreAffinities(updatedSessions);
        // Update computed mood (simplified)
        const computedMood = 'neutral'; // Simple fallback
        return {
            ...identity,
            moods: updatedMoods,
            playstyle: updatedPlaystyle,
            sessions: updatedSessions,
            genreAffinities: updatedGenreAffinities,
            computedMood,
            lastUpdated: new Date()
        };
    }
    /**
     * Get current mood from identity
     */
    getCurrentMood(identity) {
        return identity.computedMood;
    }
    /**
     * Update mood preference
     */
    updateMoodPreference(identity, moodId, preference) {
        const updatedMoods = identity.moods.map(mood => mood.id === moodId ? { ...mood, preference } : mood);
        return {
            ...identity,
            moods: updatedMoods,
            lastUpdated: new Date()
        };
    }
    /**
     * Get playstyle from identity
     */
    getPlaystyle(identity) {
        return identity.playstyle;
    }
    /**
     * Get recommendations for identity
     */
    getRecommendations(identity, context, availableGames) {
        return this.recommendationEngine.getRecommendations(identity, context, availableGames);
    }
    /**
     * Filter sessions based on computation options
     */
    filterRelevantSessions(sessions, options) {
        let filtered = [...sessions];
        // Filter by recency
        if (options.moodDecayDays) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - options.moodDecayDays);
            filtered = filtered.filter(session => new Date(session.startTime) >= cutoffDate);
        }
        // Filter out negative sessions if option is disabled
        if (!options.includeNegativeSessions) {
            filtered = filtered.filter(session => session.rating && session.rating >= 2);
        }
        // Sort by recency and limit weight
        filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        return filtered;
    }
    /**
     * Compute mood preferences from sessions
     */
    computeMoodPreferences(sessions, opts) {
        // Simplified mood computation
        return {
            currentMood: 'neutral',
            moodHistory: [],
            moodPreferences: {}
        };
    }
    /**
     * Compute genre affinities from sessions
     */
    computeGenreAffinities(sessions) {
        const genreCounts = {};
        const genreRatings = {};
        // Count sessions and ratings per genre
        sessions.forEach(session => {
            genreCounts[session.genre] = (genreCounts[session.genre] || 0) + 1;
            if (session.rating) {
                if (!genreRatings[session.genre]) {
                    genreRatings[session.genre] = [];
                }
                genreRatings[session.genre].push(session.rating);
            }
        });
        // Calculate affinity scores
        const affinities = {};
        const totalSessions = sessions.length;
        Object.entries(genreCounts).forEach(([genre, count]) => {
            let affinity = (count / totalSessions) * 100; // Base affinity from play frequency
            // Boost affinity based on ratings
            const ratings = genreRatings[genre];
            if (ratings && ratings.length > 0) {
                const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
                affinity += (avgRating - 3) * 10; // Rating adjustment
            }
            affinities[genre] = Math.max(0, Math.min(100, affinity));
        });
        return affinities;
    }
    /**
     * Create default identity for new users
     */
    createDefaultIdentity(userId, sessions) {
        return {
            id: `identity-${userId}`,
            userId,
            moods: [],
            playstyle: this.playstyleModel.computePlaystyle([]),
            sessions,
            genreAffinities: {},
            lastUpdated: new Date(),
            version: '1.0.0'
        };
    }
}
exports.IdentityEngine = IdentityEngine;
