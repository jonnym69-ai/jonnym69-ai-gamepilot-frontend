"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedMoodFilter = void 0;
const static_data_1 = require("@gamepilot/static-data");
class EnhancedMoodFilter {
    /**
     * Filter games based on mood context with hybrid recommendation logic
     */
    static filterByMood(games, context) {
        const primaryMood = static_data_1.ENHANCED_MOODS.find(m => m.id === context.primaryMood);
        if (!primaryMood) {
            throw new Error(`Primary mood not found: ${context.primaryMood}`);
        }
        const secondaryMood = context.secondaryMood
            ? static_data_1.ENHANCED_MOODS.find(m => m.id === context.secondaryMood)
            : undefined;
        const results = {
            games: [],
            scores: {},
            reasoning: {},
            moodInfluence: {}
        };
        // Process each game
        games.forEach(game => {
            const score = this.calculateMoodScore(game, primaryMood, secondaryMood, context);
            const influence = this.calculateMoodInfluence(game, primaryMood, secondaryMood, context);
            const reasoning = this.generateReasoning(game, primaryMood, score, influence, secondaryMood);
            // Only include games with meaningful mood compatibility
            if (score >= 30) { // Minimum threshold for mood compatibility
                results.games.push(game);
                results.scores[game.id] = score;
                results.reasoning[game.id] = reasoning;
                results.moodInfluence[game.id] = influence;
            }
        });
        // Sort by mood compatibility score
        results.games.sort((a, b) => results.scores[b.id] - results.scores[a.id]);
        return results;
    }
    /**
     * Calculate mood compatibility score for a game
     */
    static calculateMoodScore(game, primaryMood, secondaryMood, context) {
        let score = 50; // Base score
        // Primary mood influence (40% weight)
        const primaryScore = this.calculateSingleMoodScore(game, primaryMood, context);
        score += (primaryScore - 50) * 0.4;
        // Secondary mood influence (25% weight)
        if (secondaryMood) {
            const secondaryScore = this.calculateSingleMoodScore(game, secondaryMood, context);
            score += (secondaryScore - 50) * 0.25;
        }
        // Hybrid mood combination bonus (15% weight)
        if (secondaryMood) {
            const hybridBonus = this.calculateHybridBonus(game, primaryMood, secondaryMood);
            score += hybridBonus * 0.15;
        }
        // User genre affinity adjustment (10% weight)
        if (context?.userGenreAffinity) {
            const affinityBonus = this.calculateGenreAffinityBonus(game, context.userGenreAffinity);
            score += affinityBonus * 0.1;
        }
        // Contextual adjustments (10% weight)
        const contextBonus = this.calculateContextBonus(game, primaryMood, context);
        score += contextBonus * 0.1;
        return Math.max(0, Math.min(100, score));
    }
    /**
     * Calculate score for a single mood
     */
    static calculateSingleMoodScore(game, mood, context) {
        let score = 50;
        // Genre compatibility (30%)
        const genreScore = this.calculateGenreCompatibility(game, mood);
        score += (genreScore - 50) * 0.3;
        // Tag compatibility (25%)
        const tagScore = this.calculateTagCompatibility(game, mood);
        score += (tagScore - 50) * 0.25;
        // Platform preference (15%)
        const platformScore = this.calculatePlatformCompatibility(game, mood, context?.platform);
        score += (platformScore - 50) * 0.15;
        // Energy level matching (15%)
        const energyScore = this.calculateEnergyCompatibility(game, mood);
        score += (energyScore - 50) * 0.15;
        // Social requirement matching (15%)
        const socialScore = this.calculateSocialCompatibility(game, mood, context?.socialContext);
        score += (socialScore - 50) * 0.15;
        return score;
    }
    /**
     * Calculate hybrid mood combination bonus
     */
    static calculateHybridBonus(game, primaryMood, secondaryMood) {
        // Check if this mood combination is pre-defined and compatible
        const combination = static_data_1.MOOD_COMBINATIONS.find(c => (c.primaryMood === primaryMood.id && c.secondaryMood === secondaryMood.id) ||
            (c.primaryMood === secondaryMood.id && c.secondaryMood === primaryMood.id));
        if (!combination) {
            // Check compatibility dynamically
            if (primaryMood.compatibleMoods.includes(secondaryMood.id)) {
                return 20; // Compatible combination bonus
            }
            else if (primaryMood.conflictingMoods.includes(secondaryMood.id)) {
                return -10; // Conflicting combination penalty
            }
            else {
                return 5; // Neutral combination
            }
        }
        // Pre-defined combination bonus based on intensity
        return combination.intensity * 25;
    }
    /**
     * Calculate genre compatibility with mood
     */
    static calculateGenreCompatibility(game, mood) {
        if (!game.genres || game.genres.length === 0)
            return 50;
        let totalScore = 0;
        let genreCount = 0;
        game.genres.forEach(genre => {
            const genreName = typeof genre === 'string' ? genre : genre.name;
            const weight = mood.genreWeights[genreName] || 0.5; // Default neutral weight
            totalScore += weight * 100;
            genreCount++;
        });
        return genreCount > 0 ? totalScore / genreCount : 50;
    }
    /**
     * Calculate tag compatibility with mood
     */
    static calculateTagCompatibility(game, mood) {
        if (!game.tags || game.tags.length === 0)
            return 50;
        let totalScore = 0;
        let tagCount = 0;
        game.tags.forEach(tag => {
            const tagName = tag;
            const weight = mood.tagWeights[tagName] || 0.5; // Default neutral weight
            totalScore += weight * 100;
            tagCount++;
        });
        return tagCount > 0 ? totalScore / tagCount : 50;
    }
    /**
     * Calculate platform compatibility with mood
     */
    static calculatePlatformCompatibility(game, mood, preferredPlatform) {
        if (!game.platforms || game.platforms.length === 0)
            return 50;
        // If user has platform preference, factor that in
        if (preferredPlatform) {
            const hasPreferredPlatform = game.platforms.some(p => typeof p === 'string' ? p === preferredPlatform : p.name === preferredPlatform);
            if (hasPreferredPlatform) {
                return 80;
            }
            else {
                return 30;
            }
        }
        // Otherwise, use mood's platform bias
        let totalScore = 0;
        let platformCount = 0;
        game.platforms.forEach(platform => {
            const platformName = typeof platform === 'string' ? platform : platform.name;
            const bias = mood.platformBias[platformName] || 0.5;
            totalScore += bias * 100;
            platformCount++;
        });
        return platformCount > 0 ? totalScore / platformCount : 50;
    }
    /**
     * Calculate energy level compatibility
     */
    static calculateEnergyCompatibility(game, mood) {
        // Estimate game's energy level from genres and tags
        let gameEnergy = 5; // Default medium energy
        // Energy from genres
        if (game.genres) {
            game.genres.forEach(genre => {
                const genreName = typeof genre === 'string' ? genre : genre.name;
                if (['action', 'racing', 'sports'].includes(genreName)) {
                    gameEnergy += 2;
                }
                else if (['puzzle', 'casual', 'simulation'].includes(genreName)) {
                    gameEnergy -= 1;
                }
            });
        }
        // Energy from tags
        if (game.tags) {
            game.tags.forEach(tag => {
                const tagName = tag;
                if (['intense', 'fast-paced', 'competitive'].includes(tagName)) {
                    gameEnergy += 2;
                }
                else if (['relaxing', 'meditative', 'cozy'].includes(tagName)) {
                    gameEnergy -= 1;
                }
            });
        }
        // Compare with mood's energy level
        const energyDiff = Math.abs(gameEnergy - mood.energyLevel);
        return Math.max(0, 100 - (energyDiff * 10));
    }
    /**
     * Calculate social compatibility
     */
    static calculateSocialCompatibility(game, mood, socialContext) {
        let gameSocial = 5; // Default medium social
        // Determine game's social requirement from tags and genres
        if (game.tags) {
            game.tags.forEach(tag => {
                const tagName = tag;
                if (['multiplayer', 'cooperative', 'team-based'].includes(tagName)) {
                    gameSocial += 3;
                }
                else if (['single-player', 'solo'].includes(tagName)) {
                    gameSocial -= 2;
                }
            });
        }
        // Factor in user's social context
        if (socialContext === 'solo') {
            return gameSocial <= 5 ? 80 : 30;
        }
        else if (socialContext === 'group') {
            return gameSocial >= 7 ? 80 : 40;
        }
        // Compare with mood's social requirement
        const socialDiff = Math.abs(gameSocial - mood.socialRequirement);
        return Math.max(0, 100 - (socialDiff * 8));
    }
    /**
     * Calculate user genre affinity bonus
     */
    static calculateGenreAffinityBonus(game, userGenreAffinity) {
        if (!game.genres || game.genres.length === 0)
            return 0;
        let totalAffinity = 0;
        let genreCount = 0;
        game.genres.forEach(genre => {
            const genreName = typeof genre === 'string' ? genre : genre.name;
            const affinity = userGenreAffinity[genreName] || 0;
            totalAffinity += affinity;
            genreCount++;
        });
        return genreCount > 0 ? (totalAffinity / genreCount) * 100 : 0;
    }
    /**
     * Calculate contextual bonus
     */
    static calculateContextBonus(game, mood, context) {
        let bonus = 0;
        // Time availability matching
        if (context?.timeAvailable && mood.sessionPatterns) {
            const preferredLength = mood.sessionPatterns.preferredSessionLength;
            const timeDiff = Math.abs(context.timeAvailable - preferredLength);
            const timeMatch = Math.max(0, 100 - (timeDiff / 2));
            bonus += (timeMatch - 50) * 0.5;
        }
        return bonus;
    }
    /**
     * Calculate detailed mood influence breakdown
     */
    static calculateMoodInfluence(game, primaryMood, secondaryMood, context) {
        const influence = {
            primary: this.calculateSingleMoodScore(game, primaryMood, context),
            secondary: secondaryMood ? this.calculateSingleMoodScore(game, secondaryMood, context) : 0,
            genre: this.calculateGenreCompatibility(game, primaryMood),
            tags: this.calculateTagCompatibility(game, primaryMood),
            platform: this.calculatePlatformCompatibility(game, primaryMood, context?.platform),
            hybrid: 0
        };
        if (secondaryMood) {
            influence.hybrid = this.calculateHybridBonus(game, primaryMood, secondaryMood);
        }
        return influence;
    }
    /**
     * Generate human-readable reasoning for recommendations
     */
    static generateReasoning(game, primaryMood, score, influence, secondaryMood) {
        const reasons = [];
        // Primary mood reasoning
        if (influence.genre > 70) {
            const topGenres = game.genres?.slice(0, 2).map(g => g.name).join(', ') || '';
            reasons.push(`Perfect ${primaryMood.name.toLowerCase()} mood match with ${topGenres} genres`);
        }
        if (influence.tags > 70) {
            const matchingTags = game.tags?.filter(tag => {
                return primaryMood.tagWeights[tag] && primaryMood.tagWeights[tag] > 0.7;
            }).slice(0, 2).join(', ') || '';
            if (matchingTags) {
                reasons.push(`Matches your ${primaryMood.name.toLowerCase()} mood with ${matchingTags} gameplay`);
            }
        }
        // Hybrid reasoning
        if (secondaryMood && influence.hybrid > 15) {
            reasons.push(`Excellent combination of ${primaryMood.name.toLowerCase()} and ${secondaryMood.name.toLowerCase()} moods`);
        }
        // Context reasoning
        if (influence.energy > 70) {
            reasons.push(`Energy level matches your ${primaryMood.name.toLowerCase()} mood`);
        }
        if (influence.social > 70) {
            reasons.push(`Social aspect fits your current mood`);
        }
        return reasons.length > 0 ? reasons.join('. ') : `Good match for ${primaryMood.name.toLowerCase()} mood`;
    }
    /**
     * Get recommended mood combinations based on context
     */
    static getRecommendedCombinations(primaryMood) {
        const primary = static_data_1.ENHANCED_MOODS.find(m => m.id === primaryMood);
        if (!primary)
            return [];
        return static_data_1.MOOD_COMBINATIONS
            .filter(combo => combo.primaryMood === primaryMood)
            .sort((a, b) => b.intensity - a.intensity)
            .slice(0, 3);
    }
    /**
     * Validate mood combination compatibility
     */
    static validateCombination(primaryMood, secondaryMood) {
        const primary = static_data_1.ENHANCED_MOODS.find(m => m.id === primaryMood);
        const secondary = static_data_1.ENHANCED_MOODS.find(m => m.id === secondaryMood);
        if (!primary || !secondary)
            return false;
        // Check if explicitly compatible
        if (primary.compatibleMoods.includes(secondaryMood))
            return true;
        // Check if explicitly conflicting
        if (primary.conflictingMoods.includes(secondaryMood))
            return false;
        // Check if there's a pre-defined combination
        const hasCombination = static_data_1.MOOD_COMBINATIONS.some(combo => (combo.primaryMood === primaryMood && combo.secondaryMood === secondaryMood) ||
            (combo.primaryMood === secondaryMood && combo.secondaryMood === primaryMood));
        return hasCombination;
    }
}
exports.EnhancedMoodFilter = EnhancedMoodFilter;
