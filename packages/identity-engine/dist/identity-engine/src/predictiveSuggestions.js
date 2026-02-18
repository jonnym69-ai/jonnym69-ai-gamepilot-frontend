"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictiveSuggestionEngine = exports.PredictiveSuggestionEngine = void 0;
const mlRecommendations_1 = require("./mlRecommendations");
class PredictiveSuggestionEngine {
    constructor() {
        this.behaviorPatterns = new Map();
        this.predictionCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }
    /**
     * Generate predictive game suggestions based on user behavior
     */
    async generateSuggestions(userId, candidateGames, context) {
        const cacheKey = this.generateCacheKey(userId, context);
        const cached = this.predictionCache.get(cacheKey);
        if (cached && this.isCacheValid(cached)) {
            return cached;
        }
        const behaviorPattern = this.behaviorPatterns.get(userId);
        if (!behaviorPattern) {
            return this.fallbackSuggestions(candidateGames, context);
        }
        const suggestions = [];
        for (const game of candidateGames) {
            const suggestion = await this.evaluateGameForContext(game, context, behaviorPattern);
            if (suggestion.confidence > 0.3) {
                suggestions.push(suggestion);
            }
        }
        const sortedSuggestions = suggestions
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 10);
        this.predictionCache.set(cacheKey, sortedSuggestions);
        return sortedSuggestions;
    }
    /**
     * Analyze user behavior patterns
     */
    analyzeBehaviorPatterns(userId, sessions) {
        const pattern = {
            userId,
            timePatterns: this.extractTimePatterns(sessions),
            sessionLengthPatterns: this.extractSessionLengthPatterns(sessions),
            genreSequences: this.extractGenreSequences(sessions),
            moodTransitions: this.extractMoodTransitions(sessions),
            devicePatterns: this.extractDevicePatterns(sessions)
        };
        this.behaviorPatterns.set(userId, pattern);
    }
    /**
     * Get predictive insights about user behavior
     */
    getPredictiveInsights(userId) {
        const pattern = this.behaviorPatterns.get(userId);
        if (!pattern) {
            return [];
        }
        const insights = [];
        // Time-based insights
        const peakHours = this.findPeakGamingHours(pattern.timePatterns);
        if (peakHours.length > 0) {
            insights.push({
                type: 'pattern',
                title: 'Peak Gaming Time Detected',
                description: `You're most active around ${peakHours.join(' and ')} o'clock`,
                confidence: 0.8,
                actionable: true,
                suggestions: ['Schedule important gaming sessions during these times', 'Set reminders for game events']
            });
        }
        // Genre sequence insights
        const commonSequences = pattern.genreSequences
            .filter(seq => seq.frequency > 0.3)
            .slice(0, 3);
        if (commonSequences.length > 0) {
            insights.push({
                type: 'pattern',
                title: 'Gaming Flow Patterns',
                description: `You often follow specific genre sequences in your gaming sessions`,
                confidence: 0.7,
                actionable: true,
                suggestions: ['Embrace your natural gaming flow', 'Try games that fit these sequences']
            });
        }
        // Mood transition insights
        const positiveTransitions = pattern.moodTransitions
            .filter(t => this.isPositiveTransition(t.fromMood, t.toMood));
        if (positiveTransitions.length > 0) {
            insights.push({
                type: 'recommendation',
                title: 'Mood Enhancement Opportunities',
                description: 'Certain games help improve your mood during gaming',
                confidence: 0.6,
                actionable: true,
                suggestions: ['Keep these mood-boosting games accessible', 'Use them when feeling down']
            });
        }
        // Anomaly detection
        const anomalies = this.detectAnomalies(pattern);
        insights.push(...anomalies);
        return insights;
    }
    /**
     * Predict next likely game in sequence
     */
    predictNextGame(userId, recentSessions) {
        const pattern = this.behaviorPatterns.get(userId);
        if (!pattern || recentSessions.length === 0) {
            return {
                game: null,
                confidence: 0,
                reasoning: 'Insufficient data for prediction'
            };
        }
        const recentGenres = recentSessions.slice(0, 3).map(s => s.game.genres[0]?.id || '').filter(Boolean);
        const matchingSequences = pattern.genreSequences.filter(seq => this.sequenceMatches(recentGenres, seq.sequence));
        if (matchingSequences.length === 0) {
            return {
                game: null,
                confidence: 0,
                reasoning: 'No matching patterns found'
            };
        }
        const bestSequence = matchingSequences.sort((a, b) => b.frequency - a.frequency)[0];
        const nextGenre = bestSequence.commonNextGenres[0];
        return {
            game: null, // Would need game database to find actual game
            confidence: bestSequence.frequency,
            reasoning: `Based on your pattern of playing ${recentGenres.join(' → ')}`
        };
    }
    /**
     * Update behavior patterns with new session data
     */
    updateBehaviorPatterns(userId, newSession) {
        let pattern = this.behaviorPatterns.get(userId);
        if (!pattern) {
            pattern = {
                userId,
                timePatterns: [],
                sessionLengthPatterns: [],
                genreSequences: [],
                moodTransitions: [],
                devicePatterns: []
            };
            this.behaviorPatterns.set(userId, pattern);
        }
        // Update time patterns
        this.updateTimePatterns(pattern, newSession);
        // Update session length patterns
        this.updateSessionLengthPatterns(pattern, newSession);
        // Update genre sequences
        this.updateGenreSequences(pattern, newSession);
        // Update mood transitions
        this.updateMoodTransitions(pattern, newSession);
        // Update device patterns
        this.updateDevicePatterns(pattern, newSession);
        // Clear cache for this user
        this.clearUserCache(userId);
    }
    async evaluateGameForContext(game, context, pattern) {
        const fitScore = {
            time: this.calculateTimeFit(game, context, pattern),
            mood: this.calculateMoodFit(game, context, pattern),
            energy: this.calculateEnergyFit(game, context, pattern),
            social: this.calculateSocialFit(game, context, pattern),
            sequence: this.calculateSequenceFit(game, context, pattern)
        };
        const confidence = Object.values(fitScore).reduce((sum, score) => sum + score, 0) / 5;
        const predictedSatisfaction = this.predictSatisfaction(game, context, pattern);
        const estimatedPlaytime = this.estimatePlaytime(game, pattern);
        return {
            game,
            confidence,
            reasoning: this.generateReasoning(game, context, fitScore),
            predictedSatisfaction,
            estimatedPlaytime,
            fitScore,
            alternatives: [] // Would be populated with similar games
        };
    }
    calculateTimeFit(game, context, pattern) {
        const currentHour = context.currentTime.getHours();
        const currentDay = context.currentTime.getDay();
        const matchingPatterns = pattern.timePatterns.filter(p => Math.abs(p.hour - currentHour) <= 2 && p.dayOfWeek === currentDay);
        if (matchingPatterns.length === 0)
            return 0.5;
        const genreMatch = matchingPatterns.some(p => p.preferredGenres.some(genre => game.genres.some(g => g.id === genre)));
        return genreMatch ? 0.9 : 0.6;
    }
    calculateMoodFit(game, context, pattern) {
        if (!context.currentMood)
            return 0.5;
        const moodTransitions = pattern.moodTransitions.filter(t => t.fromMood === context.currentMood);
        if (moodTransitions.length === 0)
            return 0.5;
        const gameInTransitions = moodTransitions.some(t => t.triggerGames.includes(game.id));
        return gameInTransitions ? 0.9 : 0.4;
    }
    calculateEnergyFit(game, context, pattern) {
        if (!context.energyLevel)
            return 0.5;
        const gameIntensity = this.estimateGameIntensity(game);
        const energyMatch = 1 - Math.abs(context.energyLevel / 100 - gameIntensity);
        return energyMatch;
    }
    calculateSocialFit(game, context, pattern) {
        if (!context.socialContext)
            return 0.5;
        const gameSocialness = this.estimateGameSocialness(game);
        const socialFit = context.socialContext === 'solo' ?
            1 - gameSocialness : gameSocialness;
        return socialFit;
    }
    calculateSequenceFit(game, context, pattern) {
        const recentGenres = context.recentSessions
            .slice(0, 3)
            .map(s => s.game.genres[0]?.id || '')
            .filter(Boolean);
        if (recentGenres.length === 0)
            return 0.5;
        const matchingSequences = pattern.genreSequences.filter(seq => this.sequenceMatches(recentGenres, seq.sequence));
        if (matchingSequences.length === 0)
            return 0.3;
        const gameInSequence = matchingSequences.some(seq => seq.commonNextGenres.includes(game.genres[0]?.id || ''));
        return gameInSequence ? 0.9 : 0.5;
    }
    predictSatisfaction(game, context, pattern) {
        // Use ML recommendation engine for satisfaction prediction
        const mlScore = mlRecommendations_1.mlRecommendationEngine.predictRating(pattern.userId, game.id);
        // Adjust based on context
        let contextMultiplier = 1;
        if (context.availableTime) {
            const estimatedTime = this.estimatePlaytime(game, pattern);
            contextMultiplier *= Math.min(1, context.availableTime / estimatedTime);
        }
        return Math.min(1, mlScore * contextMultiplier);
    }
    estimatePlaytime(game, pattern) {
        const gameGenre = game.genres[0]?.id;
        if (!gameGenre)
            return 60; // Default 1 hour
        const genreSessions = pattern.sessionLengthPatterns.filter(p => p.preferredGenres.includes(gameGenre));
        if (genreSessions.length === 0)
            return 60;
        return genreSessions.reduce((sum, p) => sum + p.duration, 0) / genreSessions.length;
    }
    estimateGameIntensity(game) {
        const intensityMap = {
            'action': 0.8,
            'racing': 0.7,
            'sports': 0.6,
            'rpg': 0.5,
            'strategy': 0.4,
            'adventure': 0.3,
            'puzzle': 0.2,
            'simulation': 0.3
        };
        const gameGenre = game.genres[0]?.id;
        return gameGenre ? (intensityMap[gameGenre] || 0.5) : 0.5;
    }
    estimateGameSocialness(game) {
        const socialMap = {
            'sports': 0.9,
            'racing': 0.8,
            'action': 0.7,
            'rpg': 0.6,
            'strategy': 0.5,
            'adventure': 0.4,
            'puzzle': 0.2,
            'simulation': 0.3
        };
        const gameGenre = game.genres[0]?.id;
        return gameGenre ? (socialMap[gameGenre] || 0.5) : 0.5;
    }
    generateReasoning(game, context, fitScore) {
        const reasoning = [];
        if (fitScore.time > 0.7) {
            reasoning.push('Perfect timing for this game');
        }
        if (fitScore.mood > 0.7) {
            reasoning.push('Matches your current mood');
        }
        if (fitScore.energy > 0.7) {
            reasoning.push('Energy level aligns with game intensity');
        }
        if (fitScore.social > 0.7) {
            reasoning.push('Fits your social context');
        }
        if (fitScore.sequence > 0.7) {
            reasoning.push('Follows your natural gaming flow');
        }
        return reasoning;
    }
    fallbackSuggestions(candidateGames, context) {
        return candidateGames.slice(0, 5).map(game => ({
            game,
            confidence: 0.5,
            reasoning: ['General recommendation'],
            predictedSatisfaction: 0.5,
            estimatedPlaytime: 60,
            fitScore: {
                time: 0.5,
                mood: 0.5,
                energy: 0.5,
                social: 0.5,
                sequence: 0.5
            },
            alternatives: []
        }));
    }
    extractTimePatterns(sessions) {
        const patterns = [];
        for (const session of sessions) {
            const hour = session.startTime.getHours();
            const dayOfWeek = session.startTime.getDay();
            let existingPattern = patterns.find(p => p.hour === hour && p.dayOfWeek === dayOfWeek);
            if (!existingPattern) {
                existingPattern = {
                    hour,
                    dayOfWeek,
                    preferredGenres: [],
                    averageSessionLength: 0,
                    likelihood: 0
                };
                patterns.push(existingPattern);
            }
            existingPattern.likelihood += 1 / sessions.length;
            existingPattern.averageSessionLength += (session.duration || 0) / sessions.length;
            const genre = session.game.genres[0]?.id;
            if (genre && !existingPattern.preferredGenres.includes(genre)) {
                existingPattern.preferredGenres.push(genre);
            }
        }
        return patterns;
    }
    extractSessionLengthPatterns(sessions) {
        const patterns = [];
        for (const session of sessions) {
            const duration = session.duration || 60;
            const genre = session.game.genres[0]?.id;
            let existingPattern = patterns.find(p => Math.abs(p.duration - duration) < 30 && p.mood === session.mood);
            if (!existingPattern) {
                existingPattern = {
                    duration,
                    preferredGenres: [],
                    completionRate: 0,
                    mood: session.mood
                };
                patterns.push(existingPattern);
            }
            if (genre && !existingPattern.preferredGenres.includes(genre)) {
                existingPattern.preferredGenres.push(genre);
            }
            existingPattern.completionRate += (session.completed ? 1 : 0) / sessions.length;
        }
        return patterns;
    }
    extractGenreSequences(sessions) {
        const sequences = [];
        const maxSequenceLength = 3;
        for (let i = 0; i < sessions.length - maxSequenceLength; i++) {
            const sequence = sessions.slice(i, i + maxSequenceLength)
                .map(s => s.game.genres[0]?.id || '')
                .filter(Boolean);
            if (sequence.length < 2)
                continue;
            let existingSequence = sequences.find(seq => this.sequenceMatches(sequence, seq.sequence));
            if (!existingSequence) {
                existingSequence = {
                    sequence,
                    frequency: 0,
                    averageTransitionTime: 0,
                    commonNextGenres: []
                };
                sequences.push(existingSequence);
            }
            existingSequence.frequency += 1 / sessions.length;
            const nextSession = sessions[i + maxSequenceLength];
            if (nextSession) {
                const nextGenre = nextSession.game.genres[0]?.id;
                if (nextGenre && !existingSequence.commonNextGenres.includes(nextGenre)) {
                    existingSequence.commonNextGenres.push(nextGenre);
                }
            }
        }
        return sequences;
    }
    extractMoodTransitions(sessions) {
        const transitions = [];
        for (let i = 1; i < sessions.length; i++) {
            const prevSession = sessions[i - 1];
            const currSession = sessions[i];
            let existingTransition = transitions.find(t => t.fromMood === prevSession.mood && t.toMood === currSession.mood);
            if (!existingTransition) {
                existingTransition = {
                    fromMood: prevSession.mood,
                    toMood: currSession.mood,
                    triggerGames: [],
                    averageTime: 0,
                    probability: 0
                };
                transitions.push(existingTransition);
            }
            existingTransition.probability += 1 / sessions.length;
            if (!existingTransition.triggerGames.includes(currSession.gameId)) {
                existingTransition.triggerGames.push(currSession.gameId);
            }
            const timeDiff = (currSession.startTime.getTime() - (prevSession.endTime?.getTime() || 0)) / (1000 * 60);
            existingTransition.averageTime += timeDiff / sessions.length;
        }
        return transitions;
    }
    extractDevicePatterns(sessions) {
        const patterns = [];
        for (const session of sessions) {
            const device = session.platform;
            let existingPattern = patterns.find(p => p.device === device);
            if (!existingPattern) {
                existingPattern = {
                    device,
                    preferredGenres: [],
                    averageSessionLength: 0,
                    timeOfDay: []
                };
                patterns.push(existingPattern);
            }
            existingPattern.averageSessionLength += (session.duration || 0) / sessions.length;
            existingPattern.timeOfDay.push(session.startTime.getHours());
            const genre = session.game.genres[0]?.id;
            if (genre && !existingPattern.preferredGenres.includes(genre)) {
                existingPattern.preferredGenres.push(genre);
            }
        }
        return patterns;
    }
    sequenceMatches(recent, sequence) {
        if (recent.length < sequence.length)
            return false;
        for (let i = 0; i <= recent.length - sequence.length; i++) {
            let matches = true;
            for (let j = 0; j < sequence.length; j++) {
                if (recent[i + j] !== sequence[j]) {
                    matches = false;
                    break;
                }
            }
            if (matches)
                return true;
        }
        return false;
    }
    isPositiveTransition(fromMood, toMood) {
        const positiveMoods = ['energetic', 'focused', 'creative'];
        const negativeMoods = ['frustrated', 'bored', 'tired'];
        return negativeMoods.includes(fromMood) && positiveMoods.includes(toMood);
    }
    findPeakGamingHours(patterns) {
        const hourlyFrequency = new Array(24).fill(0);
        for (const pattern of patterns) {
            hourlyFrequency[pattern.hour] += pattern.likelihood;
        }
        const maxFrequency = Math.max(...hourlyFrequency);
        const threshold = maxFrequency * 0.7;
        return hourlyFrequency
            .map((freq, hour) => ({ hour, frequency: freq }))
            .filter(({ frequency }) => frequency >= threshold)
            .map(({ hour }) => hour);
    }
    detectAnomalies(pattern) {
        const insights = [];
        // Detect unusual gaming times
        const unusualHours = pattern.timePatterns.filter(p => p.likelihood < 0.05);
        if (unusualHours.length > 0) {
            insights.push({
                type: 'anomaly',
                title: 'Unusual Gaming Pattern Detected',
                description: 'Some gaming sessions occur at unusual times',
                confidence: 0.6,
                actionable: false,
                suggestions: ['Monitor if this pattern continues', 'Consider if it affects sleep']
            });
        }
        return insights;
    }
    updateTimePatterns(pattern, newSession) {
        const hour = newSession.startTime.getHours();
        const dayOfWeek = newSession.startTime.getDay();
        let existingPattern = pattern.timePatterns.find(p => p.hour === hour && p.dayOfWeek === dayOfWeek);
        if (!existingPattern) {
            existingPattern = {
                hour,
                dayOfWeek,
                preferredGenres: [],
                averageSessionLength: 0,
                likelihood: 0
            };
            pattern.timePatterns.push(existingPattern);
        }
        existingPattern.likelihood = Math.min(1, existingPattern.likelihood + 0.01);
    }
    updateSessionLengthPatterns(pattern, newSession) {
        const duration = newSession.duration || 60;
        let existingPattern = pattern.sessionLengthPatterns.find(p => Math.abs(p.duration - duration) < 30 && p.mood === newSession.mood);
        if (!existingPattern) {
            existingPattern = {
                duration,
                preferredGenres: [],
                completionRate: 0,
                mood: newSession.mood
            };
            pattern.sessionLengthPatterns.push(existingPattern);
        }
    }
    updateGenreSequences(pattern, newSession) {
        // Implementation for updating genre sequences with new session
        // This would involve finding and updating relevant sequences
    }
    updateMoodTransitions(pattern, newSession) {
        // Implementation for updating mood transitions with new session
        // This would involve finding and updating relevant transitions
    }
    updateDevicePatterns(pattern, newSession) {
        // Implementation for updating device patterns with new session
        // This would involve finding and updating relevant device patterns
    }
    generateCacheKey(userId, context) {
        return `${userId}-${context.currentTime.getTime()}-${context.currentMood || 'none'}-${context.device || 'none'}`;
    }
    isCacheValid(cached) {
        return cached.length > 0; // Simplified - would check timestamp in real implementation
    }
    clearUserCache(userId) {
        const keysToDelete = [];
        for (const [key] of this.predictionCache) {
            if (key.startsWith(userId)) {
                keysToDelete.push(key);
            }
        }
        for (const key of keysToDelete) {
            this.predictionCache.delete(key);
        }
    }
}
exports.PredictiveSuggestionEngine = PredictiveSuggestionEngine;
// Singleton instance for the application
exports.predictiveSuggestionEngine = new PredictiveSuggestionEngine();
