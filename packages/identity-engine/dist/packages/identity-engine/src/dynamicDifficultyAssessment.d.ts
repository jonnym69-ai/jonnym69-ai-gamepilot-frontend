import { GameSession } from './types';
import type { Game } from '@gamepilot/types';
/**
 * Dynamic Difficulty Assessment System
 * Analyzes player performance and adjusts difficulty recommendations in real-time
 */
export interface DifficultyProfile {
    userId: string;
    skillLevel: number;
    adaptabilityRate: number;
    preferredDifficulty: string;
    frustrationThreshold: number;
    flowStateZone: {
        min: number;
        max: number;
        optimal: number;
    };
    genreDifficulties: Map<string, number>;
    learningCurve: LearningPoint[];
}
export interface LearningPoint {
    gameId: string;
    timestamp: Date;
    difficulty: number;
    performance: number;
    timeToMaster: number;
    attempts: number;
    success: boolean;
}
export interface DifficultyMetrics {
    currentSkill: number;
    recommendedDifficulty: number;
    adjustmentReason: string;
    confidence: number;
    factors: {
        recentPerformance: number;
        consistency: number;
        improvement: number;
        genreFamiliarity: number;
    };
}
export interface AdaptiveRecommendation {
    gameId: string;
    recommendedDifficulty: string;
    difficultySettings: DifficultySettings;
    reasoning: string[];
    expectedPerformance: number;
    adjustmentStrategy: 'increase' | 'decrease' | 'maintain';
    confidence: number;
}
export interface DifficultySettings {
    baseDifficulty: number;
    dynamicAdjustments: {
        aimAssist: number;
        enemyHealth: number;
        resourceAbundance: number;
        timeLimits: number;
        hints: number;
    };
    accessibilityOptions: {
        colorBlindMode: boolean;
        subtitles: boolean;
        cameraShake: number;
        gameSpeed: number;
    };
}
export interface PerformancePattern {
    timeOfDay: number;
    skillLevel: number;
    focusLevel: number;
    preferredDifficulty: number;
    completionRate: number;
}
export declare class DynamicDifficultyAssessor {
    private difficultyProfiles;
    private performanceHistory;
    private adaptationWindow;
    /**
     * Assess player skill and recommend optimal difficulty
     */
    assessDifficulty(userId: string, game: Game, recentSessions: GameSession[]): DifficultyMetrics;
    /**
     * Generate adaptive difficulty recommendations for a game
     */
    generateAdaptiveRecommendations(userId: string, game: Game, targetDifficulty?: string): AdaptiveRecommendation;
    /**
     * Update difficulty profile with new performance data
     */
    updateDifficultyProfile(userId: string, session: GameSession, performanceMetrics?: {
        accuracy?: number;
        completionTime?: number;
        deaths?: number;
        score?: number;
    }): void;
    /**
     * Get difficulty insights and trends
     */
    getDifficultyInsights(userId: string): {
        skillProgression: number[];
        optimalDifficultyTimes: PerformancePattern[];
        improvementRate: number;
        consistencyScore: number;
        recommendations: string[];
    };
    private createInitialAssessment;
    private calculatePerformanceFactors;
    private calculateCurrentSkill;
    private calculateRecommendedDifficulty;
    private generateAdjustmentReason;
    private calculateConfidence;
    private createInitialProfile;
    private calculatePerformanceScore;
    private updateSkillLevel;
    private updateGenreDifficulty;
    private calculateAdaptabilityRate;
    private calculateFlowStateZone;
    private storeSession;
    private createFallbackRecommendation;
    private calculateBaseDifficulty;
    private calculateDynamicAdjustments;
    private generateDifficultySettings;
    private generateDefaultSettings;
    private mapToDifficultyLevel;
    private determineAdjustmentStrategy;
    private generateRecommendationReasoning;
    private predictPerformance;
    private calculateRecommendationConfidence;
    private calculateSkillProgression;
    private findOptimalDifficultyTimes;
    private calculateImprovementRate;
    private calculateConsistencyScore;
    private generateDifficultyRecommendations;
    private estimateSessionDifficulty;
    private calculateImprovementTrend;
}
export declare const dynamicDifficultyAssessor: DynamicDifficultyAssessor;
