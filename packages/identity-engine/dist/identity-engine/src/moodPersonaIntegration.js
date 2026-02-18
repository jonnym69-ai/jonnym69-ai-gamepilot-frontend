"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoodPersonaIntegration = void 0;
const computeIdentity_1 = require("./computeIdentity");
const static_data_1 = require("@gamepilot/static-data");
/**
 * Integration service connecting Enhanced Mood System with Persona Engine
 */
class MoodPersonaIntegration {
    constructor() {
        this.moodHistory = new Map();
        this.dynamicWeights = new Map();
        this.identityEngine = new computeIdentity_1.IdentityEngine();
    }
    /**
     * Process mood selection and update persona with learning
     */
    async processMoodSelection(userId, moodEvent) {
        // Store mood event
        const history = this.moodHistory.get(userId) || [];
        history.push(moodEvent);
        this.moodHistory.set(userId, history);
        // Get or create enhanced identity
        const identity = await this.getEnhancedIdentity(userId);
        // Update mood patterns
        const updatedPatterns = this.updateMoodPatterns(identity, moodEvent);
        // Update dynamic weights based on outcomes
        const updatedWeights = await this.updateDynamicWeights(identity, moodEvent.primaryMood, moodEvent.outcomes);
        // Create enhanced identity
        const enhancedIdentity = {
            ...identity,
            moodHistory: history,
            dynamicMoodWeights: updatedWeights,
            moodPatterns: updatedPatterns,
            hybridMoodPreferences: this.calculateHybridMoodPreferences(history),
            adaptationMetrics: this.calculateAdaptationMetrics(history)
        };
        return enhancedIdentity;
    }
    /**
     * Learn from user actions and update persona
     */
    async learnFromUserAction(userId, action) {
        const history = this.moodHistory.get(userId) || [];
        if (action.type === 'launch' && action.moodContext) {
            // Update the most recent mood selection with positive outcome
            const recentMoodEvent = history[history.length - 1];
            if (recentMoodEvent) {
                recentMoodEvent.outcomes.gamesLaunched++;
                if (action.metadata.sessionDuration) {
                    recentMoodEvent.outcomes.averageSessionDuration = action.metadata.sessionDuration;
                }
                if (action.metadata.rating) {
                    recentMoodEvent.outcomes.userRating = action.metadata.rating;
                }
            }
        }
        else if (action.type === 'ignore' && action.moodContext) {
            // Update with negative outcome
            const recentMoodEvent = history[history.length - 1];
            if (recentMoodEvent) {
                recentMoodEvent.outcomes.ignoredRecommendations++;
            }
        }
        // Re-process the mood selection with updated outcomes
        if (history.length > 0) {
            await this.processMoodSelection(userId, history[history.length - 1]);
        }
    }
    /**
     * Generate mood suggestions based on patterns and context
     */
    async generateMoodSuggestions(userId, context) {
        const identity = await this.getEnhancedIdentity(userId);
        const suggestions = [];
        // Time-based suggestions
        const timeOfDay = this.getTimeOfDay(context.currentTime);
        const timeBasedMoods = identity.moodPatterns.dailyRhythms[timeOfDay] || [];
        timeBasedMoods.forEach(moodId => {
            const confidence = this.calculateMoodConfidence(identity, moodId, context);
            suggestions.push({
                moodId,
                confidence,
                reasoning: `Based on your patterns, you often feel ${moodId} in the ${timeOfDay}`,
                contextualFactors: [timeOfDay],
                successProbability: confidence
            });
        });
        // Context-based suggestions
        if (context.socialContext) {
            const socialMoods = this.getMoodsForSocialContext(context.socialContext);
            socialMoods.forEach(moodId => {
                const confidence = this.calculateMoodConfidence(identity, moodId, context);
                suggestions.push({
                    moodId,
                    confidence,
                    reasoning: `Good match for ${context.socialContext} gaming`,
                    contextualFactors: [context.socialContext || 'unknown'],
                    successProbability: confidence
                });
            });
        }
        // Sort by confidence and return top suggestions
        return suggestions
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 3);
    }
    /**
     * Generate personalized recommendations using learned weights
     */
    async generatePersonalizedRecommendations(identity, mood, context, availableGames) {
        const recommendations = [];
        const dynamicWeights = identity.dynamicMoodWeights[mood];
        if (!dynamicWeights) {
            // Fallback to static weights if no dynamic weights available
            return this.generateStaticRecommendations(mood, availableGames);
        }
        availableGames.forEach(game => {
            let score = 50; // Base score
            // Apply learned genre weights
            if (game.genres && game.genres.length > 0) {
                let genreScore = 0;
                game.genres.forEach((genre) => {
                    const genreName = typeof genre === 'string' ? genre : genre.name;
                    const weight = dynamicWeights.genreWeights[genreName] || 0;
                    genreScore += weight * 100;
                });
                genreScore = genreScore / game.genres.length;
                score += genreScore * 0.4;
            }
            // Apply learned tag weights
            if (game.tags && game.tags.length > 0) {
                let tagScore = 0;
                game.tags.forEach((tag) => {
                    const tagName = typeof tag === 'string' ? tag : tag.name;
                    const weight = dynamicWeights.tagWeights[tagName] || 0;
                    tagScore += weight * 100;
                });
                tagScore = tagScore / game.tags.length;
                score += tagScore * 0.3;
            }
            // Apply confidence factor
            score = 50 + (score - 50) * dynamicWeights.confidence;
            if (score > 60) { // Only include recommendations with good scores
                recommendations.push({
                    gameId: game.id,
                    name: game.title,
                    genre: String(game.genres?.[0] || 'unknown'),
                    score,
                    reasons: [`Matches your learned preferences for ${mood}`],
                    moodMatch: score,
                    playstyleMatch: 75, // Placeholder
                    socialMatch: 75, // Placeholder
                    estimatedPlaytime: 60, // Placeholder
                    difficulty: 'normal', // Placeholder
                    tags: game.tags?.map((tag) => typeof tag === 'string' ? tag : tag.name) || []
                });
            }
        });
        return recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }
    /**
     * Get enhanced player identity with mood learning
     */
    async getEnhancedIdentity(userId) {
        // For now, create a basic identity
        // In a real implementation, this would load from database
        const basicIdentity = {
            id: `identity-${userId}`,
            userId,
            moods: [],
            playstyle: {
                primary: {
                    id: 'casual',
                    name: 'Casual Gamer',
                    description: 'Plays for fun and relaxation',
                    icon: '🎮',
                    color: 'blue',
                    traits: ['relaxed', 'exploratory']
                },
                preferences: {
                    sessionLength: 'medium',
                    difficulty: 'normal',
                    socialPreference: 'solo',
                    storyFocus: 50,
                    graphicsFocus: 50,
                    gameplayFocus: 50
                },
                traits: []
            },
            sessions: [],
            genreAffinities: {},
            computedMood: undefined,
            lastUpdated: new Date(),
            version: '2.0.0'
        };
        return {
            ...basicIdentity,
            moodHistory: this.moodHistory.get(userId) || [],
            dynamicMoodWeights: this.dynamicWeights.get(userId) || this.initializeDynamicWeights(),
            moodPatterns: {
                dailyRhythms: {},
                weeklyPatterns: {},
                contextualTriggers: {}
            },
            hybridMoodPreferences: {},
            adaptationMetrics: {
                learningRate: 0.1,
                predictionAccuracy: 0.5,
                userSatisfactionScore: 0.7
            }
        };
    }
    /**
     * Initialize dynamic weights for all moods
     */
    initializeDynamicWeights() {
        const weights = {};
        static_data_1.ENHANCED_MOODS.forEach(mood => {
            weights[mood.id] = {
                moodId: mood.id,
                genreWeights: { ...mood.genreWeights },
                tagWeights: { ...mood.tagWeights },
                platformBiases: mood.platformBias || {},
                timePreferences: {
                    morning: 0.5,
                    afternoon: 0.5,
                    evening: 0.5,
                    night: 0.5
                },
                confidence: 0.1, // Start with low confidence
                lastUpdated: new Date(),
                sampleSize: 0
            };
        });
        return weights;
    }
    /**
     * Update mood patterns based on new selection
     */
    updateMoodPatterns(identity, moodEvent) {
        const patterns = { ...identity.moodPatterns };
        const timeOfDay = this.getTimeOfDay(moodEvent.timestamp);
        // Update daily rhythms
        if (!patterns.dailyRhythms[timeOfDay]) {
            patterns.dailyRhythms[timeOfDay] = [];
        }
        patterns.dailyRhythms[timeOfDay].push(moodEvent.primaryMood);
        // Update weekly patterns
        const dayOfWeek = moodEvent.timestamp.getDay();
        if (!patterns.weeklyPatterns[dayOfWeek]) {
            patterns.weeklyPatterns[dayOfWeek] = [];
        }
        patterns.weeklyPatterns[dayOfWeek].push(moodEvent.primaryMood);
        return patterns;
    }
    /**
     * Update dynamic weights based on mood outcomes
     */
    async updateDynamicWeights(identity, moodId, outcomes) {
        const weights = { ...identity.dynamicMoodWeights };
        const currentWeight = weights[moodId];
        if (!currentWeight)
            return weights;
        // Calculate success metrics
        const launchRate = outcomes.gamesLaunched / Math.max(outcomes.gamesRecommended, 1);
        const satisfactionScore = (outcomes.userRating || 3) / 5;
        // Update confidence based on sample size
        const newSampleSize = currentWeight.sampleSize + 1;
        const newConfidence = Math.min(0.9, 0.1 + (newSampleSize / 100));
        // Adjust weights based on success
        const adjustmentFactor = (launchRate * 0.6 + satisfactionScore * 0.4) - 0.5;
        // Apply learning rate
        const learningRate = identity.adaptationMetrics.learningRate;
        const weightAdjustment = adjustmentFactor * learningRate;
        // Update genre weights (simplified - would need actual game data)
        Object.keys(currentWeight.genreWeights).forEach(genre => {
            currentWeight.genreWeights[genre] = Math.max(-1, Math.min(1, currentWeight.genreWeights[genre] + weightAdjustment));
        });
        // Update metadata
        currentWeight.confidence = newConfidence;
        currentWeight.sampleSize = newSampleSize;
        currentWeight.lastUpdated = new Date();
        weights[moodId] = currentWeight;
        return weights;
    }
    /**
     * Calculate hybrid mood preferences
     */
    calculateHybridMoodPreferences(history) {
        const preferences = {};
        history.forEach(event => {
            if (event.secondaryMood) {
                const key = `${event.primaryMood}+${event.secondaryMood}`;
                const success = event.outcomes.gamesLaunched / Math.max(event.outcomes.gamesRecommended, 1);
                preferences[key] = (preferences[key] || 0) + success;
            }
        });
        return preferences;
    }
    /**
     * Calculate adaptation metrics
     */
    calculateAdaptationMetrics(history) {
        if (history.length === 0) {
            return {
                learningRate: 0.1,
                predictionAccuracy: 0.5,
                userSatisfactionScore: 0.7
            };
        }
        const recentHistory = history.slice(-10); // Last 10 selections
        const avgSatisfaction = recentHistory.reduce((sum, event) => sum + (event.outcomes.userRating || 3), 0) / recentHistory.length / 5;
        return {
            learningRate: Math.min(0.3, 0.05 + (history.length / 200)),
            predictionAccuracy: Math.min(0.9, 0.3 + (recentHistory.length / 20)),
            userSatisfactionScore: avgSatisfaction
        };
    }
    /**
     * Calculate mood confidence for suggestions
     */
    calculateMoodConfidence(identity, moodId, context) {
        const weights = identity.dynamicMoodWeights[moodId];
        if (!weights)
            return 0.5;
        let confidence = weights.confidence;
        // Boost confidence if mood matches time preference
        const timeOfDay = this.getTimeOfDay(context.currentTime);
        const timePreference = weights.timePreferences[timeOfDay];
        confidence += (timePreference - 0.5) * 0.3;
        return Math.max(0, Math.min(1, confidence));
    }
    /**
     * Get time of day from Date
     */
    getTimeOfDay(date) {
        const hour = date.getHours();
        if (hour >= 6 && hour < 12)
            return 'morning';
        if (hour >= 12 && hour < 18)
            return 'afternoon';
        if (hour >= 18 && hour < 22)
            return 'evening';
        return 'night';
    }
    /**
     * Get moods suitable for social context
     */
    getMoodsForSocialContext(context) {
        switch (context) {
            case 'solo':
                return ['focused', 'relaxed', 'exploratory', 'creative'];
            case 'co-op':
                return ['social', 'energetic', 'creative'];
            case 'pvp':
                return ['competitive', 'energetic', 'focused'];
            default:
                return [];
        }
    }
    /**
     * Generate static recommendations as fallback
     */
    generateStaticRecommendations(mood, availableGames) {
        // Fallback implementation using static mood data
        const moodData = static_data_1.ENHANCED_MOODS.find(m => m.id === mood);
        if (!moodData)
            return [];
        return availableGames.slice(0, 5).map(game => ({
            gameId: game.id,
            name: game.title,
            genre: String(game.genres?.[0] || 'unknown'),
            score: 75,
            reasons: [`Matches ${moodData.name} mood`],
            moodMatch: 75,
            playstyleMatch: 70,
            socialMatch: 70,
            estimatedPlaytime: 60,
            difficulty: 'normal',
            tags: game.tags || []
        }));
    }
}
exports.MoodPersonaIntegration = MoodPersonaIntegration;
