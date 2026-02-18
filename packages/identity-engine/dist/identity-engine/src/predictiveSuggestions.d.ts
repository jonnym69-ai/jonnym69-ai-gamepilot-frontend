import { GameSession } from './types';
import type { Game } from '@gamepilot/types';
/**
 * Predictive Game Suggestions System
 * Uses behavioral patterns and ML models to predict what games users will want to play next
 */
export interface BehaviorPattern {
    userId: string;
    timePatterns: TimePattern[];
    sessionLengthPatterns: SessionLengthPattern[];
    genreSequences: GenreSequence[];
    moodTransitions: MoodTransition[];
    devicePatterns: DevicePattern[];
}
export interface TimePattern {
    hour: number;
    dayOfWeek: number;
    preferredGenres: string[];
    averageSessionLength: number;
    likelihood: number;
}
export interface SessionLengthPattern {
    duration: number;
    preferredGenres: string[];
    completionRate: number;
    mood: string;
}
export interface GenreSequence {
    sequence: string[];
    frequency: number;
    averageTransitionTime: number;
    commonNextGenres: string[];
}
export interface MoodTransition {
    fromMood: string;
    toMood: string;
    triggerGames: string[];
    averageTime: number;
    probability: number;
}
export interface DevicePattern {
    device: string;
    preferredGenres: string[];
    averageSessionLength: number;
    timeOfDay: number[];
}
export interface PredictiveContext {
    currentTime: Date;
    availableTime?: number;
    currentMood?: string;
    recentSessions: GameSession[];
    device?: string;
    socialContext?: 'solo' | 'coop' | 'pvp';
    energyLevel?: number;
}
export interface PredictiveSuggestion {
    game: Game;
    confidence: number;
    reasoning: string[];
    predictedSatisfaction: number;
    estimatedPlaytime: number;
    fitScore: {
        time: number;
        mood: number;
        energy: number;
        social: number;
        sequence: number;
    };
    alternatives: Game[];
}
export interface PredictiveInsight {
    type: 'pattern' | 'anomaly' | 'trend' | 'recommendation';
    title: string;
    description: string;
    confidence: number;
    actionable: boolean;
    suggestions: string[];
}
export declare class PredictiveSuggestionEngine {
    private behaviorPatterns;
    private predictionCache;
    private cacheTimeout;
    /**
     * Generate predictive game suggestions based on user behavior
     */
    generateSuggestions(userId: string, candidateGames: Game[], context: PredictiveContext): Promise<PredictiveSuggestion[]>;
    /**
     * Analyze user behavior patterns
     */
    analyzeBehaviorPatterns(userId: string, sessions: GameSession[]): void;
    /**
     * Get predictive insights about user behavior
     */
    getPredictiveInsights(userId: string): PredictiveInsight[];
    /**
     * Predict next likely game in sequence
     */
    predictNextGame(userId: string, recentSessions: GameSession[]): {
        game: Game | null;
        confidence: number;
        reasoning: string;
    };
    /**
     * Update behavior patterns with new session data
     */
    updateBehaviorPatterns(userId: string, newSession: GameSession): void;
    private evaluateGameForContext;
    private calculateTimeFit;
    private calculateMoodFit;
    private calculateEnergyFit;
    private calculateSocialFit;
    private calculateSequenceFit;
    private predictSatisfaction;
    private estimatePlaytime;
    private estimateGameIntensity;
    private estimateGameSocialness;
    private generateReasoning;
    private fallbackSuggestions;
    private extractTimePatterns;
    private extractSessionLengthPatterns;
    private extractGenreSequences;
    private extractMoodTransitions;
    private extractDevicePatterns;
    private sequenceMatches;
    private isPositiveTransition;
    private findPeakGamingHours;
    private detectAnomalies;
    private updateTimePatterns;
    private updateSessionLengthPatterns;
    private updateGenreSequences;
    private updateMoodTransitions;
    private updateDevicePatterns;
    private generateCacheKey;
    private isCacheValid;
    private clearUserCache;
}
export declare const predictiveSuggestionEngine: PredictiveSuggestionEngine;
