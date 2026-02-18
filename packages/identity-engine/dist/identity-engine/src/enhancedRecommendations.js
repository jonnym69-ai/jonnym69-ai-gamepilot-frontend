"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedRecommendationEngine = void 0;
const static_data_1 = require("@gamepilot/static-data");
const moodFilterPipeline_1 = require("./moodFilterPipeline");
class EnhancedRecommendationEngine {
    /**
     * Get enhanced mood-aware recommendations
     */
    static getEnhancedRecommendations(identity, context, availableGames) {
        const recommendations = [];
        const maxRecs = context.maxRecommendations || 20;
        const minThreshold = context.minScoreThreshold || 30;
        // If mood context is provided, use enhanced mood filtering
        if (context.moodContext) {
            const moodResults = moodFilterPipeline_1.EnhancedMoodFilter.filterByMood(availableGames, context.moodContext);
            // Convert mood filter results to enhanced recommendations
            moodResults.games.forEach(game => {
                const enhancedRec = this.createEnhancedRecommendation(game, identity, context, moodResults.scores[game.id], moodResults.reasoning[game.id], moodResults.moodInfluence[game.id]);
                if (enhancedRec.score >= minThreshold) {
                    recommendations.push(enhancedRec);
                }
            });
        }
        else {
            // Fall back to standard recommendation logic
            availableGames.forEach(game => {
                const score = this.calculateStandardScore(game, identity, context);
                if (score >= minThreshold) {
                    const enhancedRec = this.createEnhancedRecommendation(game, identity, context, score, this.generateStandardReasoning(game, identity, context, score), this.calculateStandardMoodInfluence(game, context));
                    recommendations.push(enhancedRec);
                }
            });
        }
        // Sort by score and return top recommendations
        return recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, maxRecs);
    }
    /**
     * Create an enhanced recommendation with detailed mood analysis
     */
    static createEnhancedRecommendation(game, identity, context, moodScore, reasoning, moodInfluence) {
        const baseRec = {
            gameId: game.id,
            name: game.title,
            genre: this.getPrimaryGenre(game),
            score: moodScore,
            reasons: [reasoning],
            moodMatch: moodScore,
            playstyleMatch: this.calculatePlaystyleMatch(game, identity),
            socialMatch: this.calculateSocialMatch(game, context),
            estimatedPlaytime: this.estimatePlaytime(game, identity),
            difficulty: 'medium', // Default difficulty since Game interface doesn't have difficulty
            tags: game.tags || []
        };
        // Enhanced mood-specific analysis
        const moodCompatibility = this.calculateMoodCompatibility(game, context.moodContext);
        // Hybrid combination analysis
        const moodCombination = context.moodContext?.secondaryMood
            ? this.analyzeMoodCombination(context.moodContext, game)
            : undefined;
        return {
            ...baseRec,
            moodScore,
            hybridScore: moodInfluence.hybrid,
            moodInfluence,
            moodCompatibility,
            moodCombination
        };
    }
    /**
     * Calculate mood compatibility metrics
     */
    static calculateMoodCompatibility(game, moodContext) {
        if (!moodContext) {
            return {
                energy: 50,
                social: 50,
                cognitive: 50,
                time: 50
            };
        }
        const primaryMood = static_data_1.ENHANCED_MOODS.find(m => m.id === moodContext.primaryMood);
        if (!primaryMood) {
            return {
                energy: 50,
                social: 50,
                cognitive: 50,
                time: 50
            };
        }
        // Calculate game's characteristics
        const gameProfile = this.analyzeGameProfile(game);
        return {
            energy: this.calculateCompatibilityScore(gameProfile.energy, primaryMood.energyLevel),
            social: this.calculateCompatibilityScore(gameProfile.social, primaryMood.socialRequirement),
            cognitive: this.calculateCompatibilityScore(gameProfile.cognitive, primaryMood.cognitiveLoad),
            time: this.calculateCompatibilityScore(gameProfile.timeCommitment, primaryMood.timeCommitment)
        };
    }
    /**
     * Analyze game's characteristic profile
     */
    static analyzeGameProfile(game) {
        let energy = 5, social = 5, cognitive = 5, timeCommitment = 5;
        // Analyze genres
        if (game.genres) {
            game.genres.forEach(genre => {
                const genreName = typeof genre === 'string' ? genre : genre.name;
                // Energy analysis
                if (['action', 'racing', 'sports'].includes(genreName))
                    energy += 2;
                if (['puzzle', 'casual', 'simulation'].includes(genreName))
                    energy -= 1;
                // Social analysis
                if (['multiplayer', 'sports'].includes(genreName))
                    social += 2;
                if (['puzzle', 'rpg'].includes(genreName))
                    social -= 1;
                // Cognitive analysis
                if (['strategy', 'puzzle', 'rpg'].includes(genreName))
                    cognitive += 2;
                if (['action', 'casual'].includes(genreName))
                    cognitive -= 1;
                // Time commitment analysis
                if (['rpg', 'strategy', 'simulation'].includes(genreName))
                    timeCommitment += 2;
                if (['puzzle', 'casual'].includes(genreName))
                    timeCommitment -= 1;
            });
        }
        // Analyze tags
        if (game.tags) {
            game.tags.forEach(tag => {
                const tagName = tag;
                if (['intense', 'fast-paced'].includes(tagName))
                    energy += 1;
                if (['relaxing', 'meditative'].includes(tagName))
                    energy -= 1;
                if (['multiplayer', 'cooperative'].includes(tagName))
                    social += 2;
                if (['single-player', 'solo'].includes(tagName))
                    social -= 1;
                if (['strategic', 'complex'].includes(tagName))
                    cognitive += 1;
                if (['simple', 'casual'].includes(tagName))
                    cognitive -= 1;
                if (['epic', 'lengthy'].includes(tagName))
                    timeCommitment += 1;
                if (['quick', 'short'].includes(tagName))
                    timeCommitment -= 1;
            });
        }
        return {
            energy: Math.max(1, Math.min(10, energy)),
            social: Math.max(1, Math.min(10, social)),
            cognitive: Math.max(1, Math.min(10, cognitive)),
            timeCommitment: Math.max(1, Math.min(10, timeCommitment))
        };
    }
    /**
     * Calculate compatibility score between two values
     */
    static calculateCompatibilityScore(gameValue, moodValue) {
        const diff = Math.abs(gameValue - moodValue);
        return Math.max(0, 100 - (diff * 10));
    }
    /**
     * Analyze mood combination synergy
     */
    static analyzeMoodCombination(moodContext, game) {
        if (!moodContext.secondaryMood)
            return undefined;
        const primaryMood = static_data_1.ENHANCED_MOODS.find(m => m.id === moodContext.primaryMood);
        const secondaryMood = static_data_1.ENHANCED_MOODS.find(m => m.id === moodContext.secondaryMood);
        if (!primaryMood || !secondaryMood)
            return undefined;
        // Calculate synergy between moods for this specific game
        const primaryScore = this.calculateMoodAlignment(game, primaryMood);
        const secondaryScore = this.calculateMoodAlignment(game, secondaryMood);
        const synergy = (primaryScore + secondaryScore) / 2 * moodContext.intensity;
        return {
            primary: primaryMood.name,
            secondary: secondaryMood.name,
            synergy,
            reasoning: `Strong ${primaryMood.name.toLowerCase()} + ${secondaryMood.name.toLowerCase()} combination with ${Math.round(synergy)}% compatibility`
        };
    }
    /**
     * Calculate how well a game aligns with a mood
     */
    static calculateMoodAlignment(game, mood) {
        let score = 50;
        // Genre alignment
        if (game.genres) {
            game.genres.forEach(genre => {
                const genreName = typeof genre === 'string' ? genre : genre.name;
                const weight = mood.genreWeights[genreName] || 0.5;
                score += (weight - 0.5) * 20;
            });
        }
        // Tag alignment
        if (game.tags) {
            game.tags.forEach(tag => {
                const tagName = tag;
                const weight = mood.tagWeights[tagName] || 0.5;
                score += (weight - 0.5) * 15;
            });
        }
        return Math.max(0, Math.min(100, score));
    }
    /**
     * Get primary genre from game
     */
    static getPrimaryGenre(game) {
        if (!game.genres || game.genres.length === 0)
            return 'Unknown';
        const firstGenre = game.genres[0];
        return typeof firstGenre === 'string' ? firstGenre : firstGenre.name;
    }
    /**
     * Calculate playstyle match
     */
    static calculatePlaystyleMatch(game, identity) {
        // Simplified playstyle calculation
        return 70; // Placeholder
    }
    /**
     * Calculate social match
     */
    static calculateSocialMatch(game, context) {
        if (!context.socialContext)
            return 70;
        const gameProfile = this.analyzeGameProfile(game);
        switch (context.socialContext) {
            case 'solo':
                return gameProfile.social <= 5 ? 85 : 45;
            case 'co-op':
                return gameProfile.social >= 7 ? 85 : 45;
            default:
                return 70;
        }
    }
    /**
     * Estimate playtime
     */
    static estimatePlaytime(game, identity) {
        return game.hoursPlayed || 10; // Placeholder
    }
    /**
     * Calculate standard score (fallback when no mood context)
     */
    static calculateStandardScore(game, identity, context) {
        let score = 50;
        // Genre affinity
        if (context.userGenreAffinity && game.genres) {
            game.genres.forEach(genre => {
                const genreName = typeof genre === 'string' ? genre : genre.name;
                const affinity = context.userGenreAffinity[genreName] || 0;
                score += affinity * 30;
            });
        }
        return Math.max(0, Math.min(100, score));
    }
    /**
     * Generate standard reasoning
     */
    static generateStandardReasoning(game, identity, context, score) {
        const reasons = [];
        if (score > 70) {
            reasons.push('Strong match for your preferences');
        }
        else if (score > 50) {
            reasons.push('Good match for your preferences');
        }
        else {
            reasons.push('Potential match for your preferences');
        }
        return reasons.join('. ');
    }
    /**
     * Calculate standard mood influence
     */
    static calculateStandardMoodInfluence(game, context) {
        return {
            primary: 50,
            genre: 50,
            tags: 50,
            platform: 50,
            hybrid: 0
        };
    }
    /**
     * Get mood-based recommendations for specific scenarios
     */
    static getMoodBasedRecommendations(moodId, games, options = {}) {
        const moodContext = {
            primaryMood: moodId,
            secondaryMood: options.secondaryMood,
            intensity: options.intensity || 0.8,
            userGenreAffinity: options.userContext?.userGenreAffinity,
            timeAvailable: options.userContext?.timeAvailable,
            socialContext: options.userContext?.socialContext, // Type override for compatibility
            platform: options.userContext?.preferredPlatform
        };
        const mockIdentity = {
            id: 'mock',
            userId: 'mock',
            moods: [],
            playstyle: {
                primary: {
                    id: 'balanced',
                    name: 'Balanced',
                    description: 'Balanced playstyle',
                    icon: 'balance',
                    color: 'gray',
                    traits: ['versatile', 'adaptive']
                },
                traits: ['versatile', 'adaptive'],
                preferences: {
                    sessionLength: 'medium',
                    difficulty: 'normal',
                    socialPreference: 'solo',
                    storyFocus: 50,
                    graphicsFocus: 50,
                    gameplayFocus: 50
                }
            },
            genreAffinities: options.userContext?.userGenreAffinity || {},
            sessions: [],
            lastUpdated: new Date(),
            version: '1.0'
        };
        const context = {
            moodContext,
            maxRecommendations: options.limit || 10,
            minScoreThreshold: 30,
            ...options.userContext
        };
        return this.getEnhancedRecommendations(mockIdentity, context, games);
    }
}
exports.EnhancedRecommendationEngine = EnhancedRecommendationEngine;
