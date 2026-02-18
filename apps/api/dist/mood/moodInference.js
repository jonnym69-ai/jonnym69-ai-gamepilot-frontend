"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoodInference = void 0;
/**
 * Mood Inference Module
 * Uses weighted heuristics to infer mood vectors from normalized features
 */
class MoodInference {
    constructor() {
        this.defaultWeights = {
            engagementVolatility: 0.15,
            challengeSeeking: 0.25,
            socialOpenness: 0.20,
            explorationBias: 0.20,
            focusStability: 0.20
        };
        this.moodMappings = {
            // Calm mood: influenced by low volatility, high focus stability
            calm: {
                engagementVolatility: -0.8,
                challengeSeeking: -0.3,
                socialOpenness: -0.2,
                explorationBias: -0.1,
                focusStability: 0.9
            },
            // Competitive mood: influenced by high challenge seeking, low social openness
            competitive: {
                engagementVolatility: 0.2,
                challengeSeeking: 0.9,
                socialOpenness: -0.4,
                explorationBias: -0.2,
                focusStability: 0.3
            },
            // Curious mood: influenced by high exploration bias, moderate social openness
            curious: {
                engagementVolatility: 0.3,
                challengeSeeking: 0.4,
                socialOpenness: 0.3,
                explorationBias: 0.8,
                focusStability: -0.1
            },
            // Social mood: influenced by high social openness, moderate exploration
            social: {
                engagementVolatility: 0.1,
                challengeSeeking: -0.2,
                socialOpenness: 0.9,
                explorationBias: 0.4,
                focusStability: -0.2
            },
            // Focused mood: influenced by high focus stability, low volatility
            focused: {
                engagementVolatility: -0.6,
                challengeSeeking: 0.3,
                socialOpenness: -0.3,
                explorationBias: -0.4,
                focusStability: 0.8
            }
        };
    }
    /**
     * Infer mood vector from normalized features using weighted heuristics
     */
    inferMood(features, customWeights) {
        const weights = { ...this.defaultWeights, ...customWeights };
        const moodVector = {
            calm: 0,
            competitive: 0,
            curious: 0,
            social: 0,
            focused: 0
        };
        // Calculate each mood component based on feature mappings
        for (const [moodName, moodMapping] of Object.entries(this.moodMappings)) {
            const moodKey = moodName;
            let score = 0;
            // Apply weighted sum of feature contributions
            score += features.engagementVolatility * moodMapping.engagementVolatility * weights.engagementVolatility;
            score += features.challengeSeeking * moodMapping.challengeSeeking * weights.challengeSeeking;
            score += features.socialOpenness * moodMapping.socialOpenness * weights.socialOpenness;
            score += features.explorationBias * moodMapping.explorationBias * weights.explorationBias;
            score += features.focusStability * moodMapping.focusStability * weights.focusStability;
            // Normalize score to 0-1 range using sigmoid function
            moodVector[moodKey] = this.sigmoid(score);
        }
        return moodVector;
    }
    /**
     * Get confidence level for the mood inference
     */
    getInferenceConfidence(features, moodVector) {
        // Calculate confidence based on feature consistency and mood vector clarity
        const moodStrength = Math.max(...Object.values(moodVector));
        const moodAmbiguity = this.calculateMoodAmbiguity(moodVector);
        const featureConsistency = this.calculateFeatureConsistency(features);
        // Higher confidence for strong, unambiguous moods with consistent features
        const confidence = (moodStrength * 0.4) +
            ((1 - moodAmbiguity) * 0.4) +
            (featureConsistency * 0.2);
        return Math.max(0, Math.min(1, confidence));
    }
    /**
     * Get dominant mood from mood vector
     */
    getDominantMood(moodVector) {
        const entries = Object.entries(moodVector);
        const sorted = entries.sort((a, b) => b[1] - a[1]);
        const dominant = sorted[0];
        const secondary = sorted[1];
        const result = {
            mood: dominant[0],
            confidence: dominant[1]
        };
        if (secondary && secondary[1] > 0.3) {
            result.secondaryMood = secondary[0];
            result.secondaryConfidence = secondary[1];
        }
        return result;
    }
    /**
     * Get mood description based on mood vector
     */
    getMoodDescription(moodVector) {
        const dominant = this.getDominantMood(moodVector);
        const descriptions = {
            calm: {
                primary: 'Calm',
                description: 'Relaxed and peaceful state, ideal for low-stress gaming',
                traits: ['Patient', 'Methodical', 'Steady', 'Reflective'],
                recommendations: ['Puzzle games', 'Simulation games', 'Creative sandbox games', 'Story-rich adventures']
            },
            competitive: {
                primary: 'Competitive',
                description: 'Achievement-oriented and challenge-seeking state',
                traits: ['Driven', 'Strategic', 'Goal-focused', 'Performance-minded'],
                recommendations: ['Competitive multiplayer', 'Ranked matches', 'Speedrun challenges', 'Tournament play']
            },
            curious: {
                primary: 'Curious',
                description: 'Exploratory and discovery-oriented state',
                traits: ['Inquisitive', 'Experimental', 'Open-minded', 'Adventurous'],
                recommendations: ['Open-world games', 'New genres', 'Indie titles', 'Creative tools']
            },
            social: {
                primary: 'Social',
                description: 'Community-oriented and interactive state',
                traits: ['Collaborative', 'Communicative', 'Team-player', 'Community-focused'],
                recommendations: ['Co-op campaigns', 'Guild activities', 'Social hubs', 'Party games']
            },
            focused: {
                primary: 'Focused',
                description: 'Concentrated and goal-directed state',
                traits: ['Attentive', 'Determined', 'Methodical', 'Immersed'],
                recommendations: ['Strategy games', 'Complex puzzles', 'Skill-based challenges', 'Deep story experiences']
            }
        };
        return descriptions[dominant.mood] || descriptions.calm;
    }
    /**
     * Adjust mood inference weights based on user feedback
     */
    adjustWeights(currentWeights, feedback) {
        const newWeights = { ...currentWeights };
        const adjustmentRate = 0.1;
        // Increase weight for features that led to correct predictions
        // Decrease weight for features that led to incorrect predictions
        if (feedback.predictedMood === feedback.actualMood) {
            // Reinforce correct prediction
            Object.keys(newWeights).forEach(key => {
                const weightKey = key;
                newWeights[weightKey] = Math.min(1, newWeights[weightKey] + adjustmentRate * feedback.confidence);
            });
        }
        else {
            // Adjust for incorrect prediction
            Object.keys(newWeights).forEach(key => {
                const weightKey = key;
                newWeights[weightKey] = Math.max(0.1, newWeights[weightKey] - adjustmentRate * feedback.confidence);
            });
        }
        // Normalize weights to sum to 1
        const totalWeight = Object.values(newWeights).reduce((sum, w) => sum + w, 0);
        Object.keys(newWeights).forEach(key => {
            const weightKey = key;
            newWeights[weightKey] = newWeights[weightKey] / totalWeight;
        });
        return newWeights;
    }
    /**
     * Sigmoid activation function for normalization
     */
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
    /**
     * Calculate mood ambiguity (how mixed the mood signals are)
     */
    calculateMoodAmbiguity(moodVector) {
        const values = Object.values(moodVector);
        const max = Math.max(...values);
        const secondMax = values.sort((a, b) => b - a)[1] || 0;
        // High ambiguity when top moods are close in value
        return 1 - (max - secondMax);
    }
    /**
     * Calculate feature consistency (how stable the input features are)
     */
    calculateFeatureConsistency(features) {
        const values = Object.values(features);
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        // Lower variance = higher consistency
        return Math.max(0, 1 - variance);
    }
    /**
     * Get current inference weights
     */
    getCurrentWeights() {
        return { ...this.defaultWeights };
    }
    /**
     * Validate mood vector
     */
    validateMoodVector(moodVector) {
        const issues = [];
        // Check if all values are in valid range
        for (const [key, value] of Object.entries(moodVector)) {
            if (value < 0 || value > 1) {
                issues.push(`${key} is out of range [0,1]: ${value}`);
            }
        }
        // Check if at least one mood has significant strength
        const maxMood = Math.max(...Object.values(moodVector));
        if (maxMood < 0.3) {
            issues.push('All mood values are low - possible weak signal');
        }
        return {
            isValid: issues.length === 0,
            issues
        };
    }
}
exports.MoodInference = MoodInference;
//# sourceMappingURL=moodInference.js.map