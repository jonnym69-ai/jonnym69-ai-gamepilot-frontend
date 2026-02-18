"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicDifficultyAssessor = exports.DynamicDifficultyAssessor = void 0;
class DynamicDifficultyAssessor {
    constructor() {
        this.difficultyProfiles = new Map();
        this.performanceHistory = new Map();
        this.adaptationWindow = 10; // Number of sessions to consider for adaptation
    }
    /**
     * Assess player skill and recommend optimal difficulty
     */
    assessDifficulty(userId, game, recentSessions) {
        const profile = this.difficultyProfiles.get(userId);
        if (!profile) {
            return this.createInitialAssessment(game, recentSessions);
        }
        const factors = this.calculatePerformanceFactors(userId, game, recentSessions);
        const currentSkill = this.calculateCurrentSkill(profile, recentSessions);
        const recommendedDifficulty = this.calculateRecommendedDifficulty(currentSkill, factors, profile, game);
        return {
            currentSkill,
            recommendedDifficulty,
            adjustmentReason: this.generateAdjustmentReason(factors, profile),
            confidence: this.calculateConfidence(factors, recentSessions.length),
            factors
        };
    }
    /**
     * Generate adaptive difficulty recommendations for a game
     */
    generateAdaptiveRecommendations(userId, game, targetDifficulty) {
        const profile = this.difficultyProfiles.get(userId);
        if (!profile) {
            return this.createFallbackRecommendation(game);
        }
        const baseDifficulty = this.calculateBaseDifficulty(profile, game);
        const adjustments = this.calculateDynamicAdjustments(profile, game);
        const settings = this.generateDifficultySettings(baseDifficulty, adjustments);
        const recommendedDifficulty = targetDifficulty || this.mapToDifficultyLevel(baseDifficulty);
        const strategy = this.determineAdjustmentStrategy(profile, baseDifficulty, targetDifficulty);
        return {
            gameId: game.id,
            recommendedDifficulty,
            difficultySettings: settings,
            reasoning: this.generateRecommendationReasoning(profile, game, adjustments),
            expectedPerformance: this.predictPerformance(baseDifficulty, profile),
            adjustmentStrategy: strategy,
            confidence: this.calculateRecommendationConfidence(profile, game)
        };
    }
    /**
     * Update difficulty profile with new performance data
     */
    updateDifficultyProfile(userId, session, performanceMetrics) {
        let profile = this.difficultyProfiles.get(userId);
        if (!profile) {
            profile = this.createInitialProfile(userId);
            this.difficultyProfiles.set(userId, profile);
        }
        // Update skill level based on performance
        const performanceScore = this.calculatePerformanceScore(session, performanceMetrics);
        profile.skillLevel = this.updateSkillLevel(profile.skillLevel, performanceScore);
        // Update genre-specific difficulties
        const genre = session.game.genres[0]?.id;
        if (genre) {
            const currentGenreDifficulty = profile.genreDifficulties.get(genre) || 50;
            profile.genreDifficulties.set(genre, this.updateGenreDifficulty(currentGenreDifficulty, performanceScore));
        }
        // Add learning point
        const learningPoint = {
            gameId: session.gameId,
            timestamp: session.startTime,
            difficulty: this.estimateSessionDifficulty(session),
            performance: performanceScore,
            timeToMaster: session.duration || 0,
            attempts: 1,
            success: session.completed || false
        };
        profile.learningCurve.push(learningPoint);
        // Update adaptability rate
        profile.adaptabilityRate = this.calculateAdaptabilityRate(profile.learningCurve);
        // Update flow state zone
        profile.flowStateZone = this.calculateFlowStateZone(profile.learningCurve);
        // Store session for future analysis
        this.storeSession(userId, session);
    }
    /**
     * Get difficulty insights and trends
     */
    getDifficultyInsights(userId) {
        const profile = this.difficultyProfiles.get(userId);
        if (!profile) {
            return {
                skillProgression: [],
                optimalDifficultyTimes: [],
                improvementRate: 0,
                consistencyScore: 0,
                recommendations: ['Play more games to generate insights']
            };
        }
        const skillProgression = this.calculateSkillProgression(profile);
        const optimalTimes = this.findOptimalDifficultyTimes(userId);
        const improvementRate = this.calculateImprovementRate(profile);
        const consistencyScore = this.calculateConsistencyScore(profile);
        return {
            skillProgression,
            optimalDifficultyTimes: optimalTimes,
            improvementRate,
            consistencyScore,
            recommendations: this.generateDifficultyRecommendations(profile)
        };
    }
    createInitialAssessment(game, recentSessions) {
        const completionRate = recentSessions.filter(s => s.completed).length / Math.max(1, recentSessions.length);
        const averageIntensity = recentSessions.reduce((sum, s) => sum + s.intensity, 0) / Math.max(1, recentSessions.length);
        return {
            currentSkill: 50, // Default to medium skill
            recommendedDifficulty: 50,
            adjustmentReason: 'Initial assessment based on limited data',
            confidence: 0.3,
            factors: {
                recentPerformance: completionRate,
                consistency: 0.5,
                improvement: 0,
                genreFamiliarity: 0.5
            }
        };
    }
    calculatePerformanceFactors(userId, game, recentSessions) {
        const completionRate = recentSessions.filter(s => s.completed).length / Math.max(1, recentSessions.length);
        const averageRating = recentSessions.reduce((sum, s) => sum + (s.rating || 3), 0) / Math.max(1, recentSessions.length);
        // Calculate consistency
        const ratings = recentSessions.map(s => s.rating || 3);
        const variance = ratings.reduce((sum, rating) => sum + Math.pow(rating - averageRating, 2), 0) / ratings.length;
        const consistency = Math.max(0, 1 - variance / 4); // Normalize to 0-1
        // Calculate improvement trend
        const improvement = this.calculateImprovementTrend(recentSessions);
        // Calculate genre familiarity
        const genre = game.genres[0]?.id;
        const genreSessions = recentSessions.filter(s => s.game.genres.some(g => g.id === genre));
        const genreFamiliarity = Math.min(1, genreSessions.length / 5);
        return {
            recentPerformance: completionRate,
            consistency,
            improvement,
            genreFamiliarity
        };
    }
    calculateCurrentSkill(profile, recentSessions) {
        if (recentSessions.length === 0)
            return profile.skillLevel;
        const recentPerformance = recentSessions.slice(-this.adaptationWindow);
        const performanceScores = recentPerformance.map(session => this.calculatePerformanceScore(session));
        const averageRecentPerformance = performanceScores.reduce((sum, score) => sum + score, 0) / performanceScores.length;
        // Weight current skill level with recent performance
        return (profile.skillLevel * 0.7) + (averageRecentPerformance * 0.3);
    }
    calculateRecommendedDifficulty(currentSkill, factors, profile, game) {
        let recommendedDifficulty = currentSkill;
        // Adjust based on recent performance
        if (factors.recentPerformance > 0.8) {
            recommendedDifficulty += 10; // Increase difficulty if doing well
        }
        else if (factors.recentPerformance < 0.4) {
            recommendedDifficulty -= 15; // Decrease difficulty if struggling
        }
        // Adjust based on consistency
        if (factors.consistency > 0.8) {
            recommendedDifficulty += 5; // Consistent players can handle more challenge
        }
        else if (factors.consistency < 0.4) {
            recommendedDifficulty -= 5; // Inconsistent players need stability
        }
        // Adjust based on genre familiarity
        const genre = game.genres[0]?.id;
        if (genre) {
            const genreDifficulty = profile.genreDifficulties.get(genre) || 50;
            recommendedDifficulty = (recommendedDifficulty + genreDifficulty) / 2;
        }
        // Ensure within flow state zone
        recommendedDifficulty = Math.max(profile.flowStateZone.min, Math.min(profile.flowStateZone.max, recommendedDifficulty));
        return Math.max(0, Math.min(100, recommendedDifficulty));
    }
    generateAdjustmentReason(factors, profile) {
        const reasons = [];
        if (factors.recentPerformance > 0.8) {
            reasons.push('Recent high performance suggests you can handle more challenge');
        }
        else if (factors.recentPerformance < 0.4) {
            reasons.push('Recent struggles indicate need for easier difficulty');
        }
        if (factors.consistency > 0.8) {
            reasons.push('Consistent performance shows readiness for progression');
        }
        if (factors.improvement > 0.1) {
            reasons.push('Clear improvement trend detected');
        }
        return reasons.join('. ') || 'Based on your skill level and recent performance';
    }
    calculateConfidence(factors, sessionCount) {
        let confidence = 0.3; // Base confidence
        // Increase confidence with more data
        confidence += Math.min(0.4, sessionCount / 20);
        // Increase confidence with consistent performance
        confidence += factors.consistency * 0.2;
        // Increase confidence with clear trends
        confidence += Math.abs(factors.improvement) * 0.1;
        return Math.min(1, confidence);
    }
    createInitialProfile(userId) {
        return {
            userId,
            skillLevel: 50,
            adaptabilityRate: 0.5,
            preferredDifficulty: 'medium',
            frustrationThreshold: 0.3,
            flowStateZone: {
                min: 40,
                max: 70,
                optimal: 55
            },
            genreDifficulties: new Map(),
            learningCurve: []
        };
    }
    calculatePerformanceScore(session, metrics) {
        let score = 50; // Base score
        // Session completion
        if (session.completed) {
            score += 20;
        }
        // Session rating
        if (session.rating) {
            score += (session.rating - 3) * 10; // Scale rating to -20 to +20
        }
        // Session intensity
        score += (session.intensity - 5) * 2; // Scale intensity
        // Additional metrics if available
        if (metrics) {
            if (metrics.accuracy) {
                score += (metrics.accuracy - 50) * 0.5;
            }
            if (metrics.deaths !== undefined) {
                score -= metrics.deaths * 2;
            }
            if (metrics.score) {
                score += Math.min(20, metrics.score / 1000);
            }
        }
        return Math.max(0, Math.min(100, score));
    }
    updateSkillLevel(currentSkill, performanceScore) {
        const learningRate = 0.1; // How quickly skill level adapts
        const targetSkill = performanceScore;
        return currentSkill + (targetSkill - currentSkill) * learningRate;
    }
    updateGenreDifficulty(currentDifficulty, performanceScore) {
        const adaptationRate = 0.05;
        const targetDifficulty = performanceScore;
        return currentDifficulty + (targetDifficulty - currentDifficulty) * adaptationRate;
    }
    calculateAdaptabilityRate(learningCurve) {
        if (learningCurve.length < 5)
            return 0.5;
        const recentPoints = learningCurve.slice(-10);
        const improvements = [];
        for (let i = 1; i < recentPoints.length; i++) {
            const improvement = recentPoints[i].performance - recentPoints[i - 1].performance;
            improvements.push(Math.abs(improvement));
        }
        const averageImprovement = improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;
        return Math.min(1, averageImprovement / 20); // Normalize to 0-1
    }
    calculateFlowStateZone(learningCurve) {
        if (learningCurve.length < 5) {
            return { min: 40, max: 70, optimal: 55 };
        }
        // Find difficulty range where performance is highest
        const performanceByDifficulty = new Map();
        for (const point of learningCurve) {
            const difficulties = performanceByDifficulty.get(point.difficulty) || [];
            difficulties.push(point.performance);
            performanceByDifficulty.set(point.difficulty, difficulties);
        }
        let bestMin = 40, bestMax = 70, bestOptimal = 55;
        let bestAveragePerformance = 0;
        for (const [difficulty, performances] of performanceByDifficulty) {
            const averagePerformance = performances.reduce((sum, p) => sum + p, 0) / performances.length;
            if (averagePerformance > bestAveragePerformance) {
                bestAveragePerformance = averagePerformance;
                bestOptimal = difficulty;
                bestMin = Math.max(20, difficulty - 15);
                bestMax = Math.min(80, difficulty + 15);
            }
        }
        return { min: bestMin, max: bestMax, optimal: bestOptimal };
    }
    storeSession(userId, session) {
        const sessions = this.performanceHistory.get(userId) || [];
        sessions.push(session);
        // Keep only recent sessions
        if (sessions.length > 50) {
            sessions.splice(0, sessions.length - 50);
        }
        this.performanceHistory.set(userId, sessions);
    }
    createFallbackRecommendation(game) {
        return {
            gameId: game.id,
            recommendedDifficulty: 'medium',
            difficultySettings: this.generateDefaultSettings(),
            reasoning: ['Default recommendation - more data needed'],
            expectedPerformance: 50,
            adjustmentStrategy: 'maintain',
            confidence: 0.3
        };
    }
    calculateBaseDifficulty(profile, game) {
        const genre = game.genres[0]?.id;
        const genreDifficulty = genre ? profile.genreDifficulties.get(genre) || 50 : 50;
        // Weight genre difficulty with overall skill level
        return (profile.skillLevel * 0.6) + (genreDifficulty * 0.4);
    }
    calculateDynamicAdjustments(profile, game) {
        const adjustments = [];
        // Time-based adjustment
        const currentHour = new Date().getHours();
        if (currentHour < 8 || currentHour > 22) {
            adjustments.push(-5); // Easier during late night/early morning
        }
        // Fatigue-based adjustment
        const recentSessions = this.performanceHistory.get(profile.userId) || [];
        if (recentSessions.length > 3) {
            const recentPerformance = recentSessions.slice(-3).map(s => this.calculatePerformanceScore(s));
            const averageRecent = recentPerformance.reduce((sum, p) => sum + p, 0) / recentPerformance.length;
            if (averageRecent < 40) {
                adjustments.push(-10); // Reduce difficulty if struggling recently
            }
        }
        return adjustments;
    }
    generateDifficultySettings(baseDifficulty, adjustments) {
        const adjustedDifficulty = Math.max(0, Math.min(100, baseDifficulty + adjustments.reduce((sum, adj) => sum + adj, 0)));
        return {
            baseDifficulty: adjustedDifficulty,
            dynamicAdjustments: {
                aimAssist: Math.max(0, 50 - adjustedDifficulty),
                enemyHealth: 100 + (50 - adjustedDifficulty),
                resourceAbundance: 100 + (50 - adjustedDifficulty),
                timeLimits: 100 + (adjustedDifficulty - 50),
                hints: Math.max(0, 100 - adjustedDifficulty)
            },
            accessibilityOptions: {
                colorBlindMode: false,
                subtitles: true,
                cameraShake: Math.max(0, 100 - adjustedDifficulty),
                gameSpeed: 1.0
            }
        };
    }
    generateDefaultSettings() {
        return {
            baseDifficulty: 50,
            dynamicAdjustments: {
                aimAssist: 25,
                enemyHealth: 100,
                resourceAbundance: 100,
                timeLimits: 100,
                hints: 50
            },
            accessibilityOptions: {
                colorBlindMode: false,
                subtitles: true,
                cameraShake: 50,
                gameSpeed: 1.0
            }
        };
    }
    mapToDifficultyLevel(difficulty) {
        if (difficulty < 30)
            return 'easy';
        if (difficulty < 70)
            return 'medium';
        return 'hard';
    }
    determineAdjustmentStrategy(profile, recommendedDifficulty, targetDifficulty) {
        if (!targetDifficulty)
            return 'maintain';
        const targetNumeric = targetDifficulty === 'easy' ? 25 :
            targetDifficulty === 'medium' ? 50 : 75;
        if (recommendedDifficulty > targetNumeric + 10)
            return 'decrease';
        if (recommendedDifficulty < targetNumeric - 10)
            return 'increase';
        return 'maintain';
    }
    generateRecommendationReasoning(profile, game, adjustments) {
        const reasoning = [];
        reasoning.push(`Based on your skill level of ${Math.round(profile.skillLevel)}`);
        const genre = game.genres[0]?.id;
        if (genre && profile.genreDifficulties.has(genre)) {
            const genreSkill = profile.genreDifficulties.get(genre);
            reasoning.push(`Your experience with ${genre} games suggests this difficulty`);
        }
        if (adjustments.length > 0) {
            reasoning.push('Adjusted based on recent performance patterns');
        }
        return reasoning;
    }
    predictPerformance(difficulty, profile) {
        // Simple linear prediction based on skill level and difficulty
        const skillDifference = Math.abs(profile.skillLevel - difficulty);
        const basePerformance = 100 - (skillDifference * 0.8);
        // Adjust for adaptability
        const adaptabilityBonus = profile.adaptabilityRate * 10;
        return Math.max(0, Math.min(100, basePerformance + adaptabilityBonus));
    }
    calculateRecommendationConfidence(profile, game) {
        let confidence = 0.5; // Base confidence
        // Increase confidence with more learning points
        confidence += Math.min(0.3, profile.learningCurve.length / 20);
        // Increase confidence with genre familiarity
        const genre = game.genres[0]?.id;
        if (genre && profile.genreDifficulties.has(genre)) {
            confidence += 0.2;
        }
        return Math.min(1, confidence);
    }
    calculateSkillProgression(profile) {
        return profile.learningCurve.map(point => point.performance);
    }
    findOptimalDifficultyTimes(userId) {
        const sessions = this.performanceHistory.get(userId) || [];
        const patterns = [];
        // Group sessions by time of day
        const timeGroups = new Map();
        for (const session of sessions) {
            const hour = session.startTime.getHours();
            const group = timeGroups.get(hour) || [];
            group.push(session);
            timeGroups.set(hour, group);
        }
        for (const [hour, hourSessions] of timeGroups) {
            if (hourSessions.length < 3)
                continue; // Skip if not enough data
            const averagePerformance = hourSessions.reduce((sum, s) => sum + this.calculatePerformanceScore(s), 0) / hourSessions.length;
            const completionRate = hourSessions.filter(s => s.completed).length / hourSessions.length;
            patterns.push({
                timeOfDay: hour,
                skillLevel: averagePerformance,
                focusLevel: completionRate,
                preferredDifficulty: 50, // Would be calculated from actual difficulty data
                completionRate
            });
        }
        return patterns.sort((a, b) => b.skillLevel - a.skillLevel).slice(0, 3);
    }
    calculateImprovementRate(profile) {
        if (profile.learningCurve.length < 10)
            return 0;
        const recentPoints = profile.learningCurve.slice(-10);
        const olderPoints = profile.learningCurve.slice(-20, -10);
        if (olderPoints.length === 0)
            return 0;
        const recentAverage = recentPoints.reduce((sum, p) => sum + p.performance, 0) / recentPoints.length;
        const olderAverage = olderPoints.reduce((sum, p) => sum + p.performance, 0) / olderPoints.length;
        return (recentAverage - olderAverage) / olderAverage;
    }
    calculateConsistencyScore(profile) {
        if (profile.learningCurve.length < 5)
            return 0.5;
        const performances = profile.learningCurve.map(p => p.performance);
        const average = performances.reduce((sum, p) => sum + p, 0) / performances.length;
        const variance = performances.reduce((sum, p) => sum + Math.pow(p - average, 2), 0) / performances.length;
        return Math.max(0, 1 - variance / 100); // Normalize to 0-1
    }
    generateDifficultyRecommendations(profile) {
        const recommendations = [];
        if (profile.skillLevel < 30) {
            recommendations.push('Consider tutorial modes to build fundamental skills');
        }
        else if (profile.skillLevel > 80) {
            recommendations.push('Try harder difficulties or competitive modes for challenge');
        }
        if (profile.adaptabilityRate < 0.3) {
            recommendations.push('Gradual difficulty changes work best for your playstyle');
        }
        if (profile.learningCurve.length > 20) {
            recommendations.push('Excellent progress tracking! Consider exploring new genres');
        }
        return recommendations;
    }
    estimateSessionDifficulty(session) {
        // Estimate difficulty based on session metrics
        let difficulty = 50; // Base difficulty
        if (session.completed) {
            difficulty += 10;
        }
        if (session.rating && session.rating > 4) {
            difficulty += 15;
        }
        else if (session.rating && session.rating < 2) {
            difficulty -= 15;
        }
        difficulty += (session.intensity - 5) * 3;
        return Math.max(0, Math.min(100, difficulty));
    }
    calculateImprovementTrend(sessions) {
        if (sessions.length < 5)
            return 0;
        const recentSessions = sessions.slice(-5);
        const olderSessions = sessions.slice(-10, -5);
        if (olderSessions.length === 0)
            return 0;
        const recentPerformance = recentSessions.reduce((sum, s) => sum + this.calculatePerformanceScore(s), 0) / recentSessions.length;
        const olderPerformance = olderSessions.reduce((sum, s) => sum + this.calculatePerformanceScore(s), 0) / olderSessions.length;
        return (recentPerformance - olderPerformance) / 50; // Normalize to roughly -1 to 1
    }
}
exports.DynamicDifficultyAssessor = DynamicDifficultyAssessor;
// Singleton instance for the application
exports.dynamicDifficultyAssessor = new DynamicDifficultyAssessor();
