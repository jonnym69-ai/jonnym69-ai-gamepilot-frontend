import type { PlayerIdentity, GameSession, RecommendationContext, GameRecommendation } from './types';
import { type EnhancedMoodId } from '@gamepilot/static-data';
import type { Game } from '@gamepilot/types';
/**
 * Enhanced mood selection event for tracking user behavior
 */
export interface MoodSelectionEvent {
    id: string;
    userId: string;
    primaryMood: EnhancedMoodId;
    secondaryMood?: EnhancedMoodId;
    intensity: number;
    timestamp: Date;
    context: {
        timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
        dayOfWeek: number;
        sessionLength?: number;
        previousMood?: EnhancedMoodId;
        trigger: 'manual' | 'suggested' | 'auto';
    };
    outcomes: {
        gamesRecommended: number;
        gamesLaunched: number;
        averageSessionDuration?: number;
        userRating?: number;
        ignoredRecommendations: number;
    };
}
/**
 * Dynamic mood weights that adapt based on user behavior
 */
export interface DynamicMoodWeights {
    moodId: EnhancedMoodId;
    genreWeights: Record<string, number>;
    tagWeights: Record<string, number>;
    platformBiases: Record<string, number>;
    timePreferences: {
        morning: number;
        afternoon: number;
        evening: number;
        night: number;
    };
    confidence: number;
    lastUpdated: Date;
    sampleSize: number;
}
/**
 * Enhanced player identity with mood learning capabilities
 */
export interface EnhancedPlayerIdentity extends PlayerIdentity {
    moodHistory: MoodSelectionEvent[];
    dynamicMoodWeights: Record<EnhancedMoodId, DynamicMoodWeights>;
    moodPatterns: {
        dailyRhythms: Record<string, EnhancedMoodId[]>;
        weeklyPatterns: Record<number, EnhancedMoodId[]>;
        contextualTriggers: Record<string, EnhancedMoodId>;
    };
    hybridMoodPreferences: Record<string, number>;
    adaptationMetrics: {
        learningRate: number;
        predictionAccuracy: number;
        userSatisfactionScore: number;
    };
}
/**
 * User action for learning feedback loop
 */
export interface UserAction {
    id: string;
    userId: string;
    type: 'launch' | 'ignore' | 'rate' | 'switch_mood' | 'session_complete';
    gameId?: string;
    gameTitle?: string;
    moodContext?: {
        primaryMood: EnhancedMoodId;
        secondaryMood?: EnhancedMoodId;
    };
    timestamp: Date;
    metadata: {
        sessionDuration?: number;
        rating?: number;
        reason?: string;
        previousMood?: EnhancedMoodId;
    };
}
/**
 * Mood suggestion with confidence score
 */
export interface MoodSuggestion {
    moodId: EnhancedMoodId;
    confidence: number;
    reasoning: string;
    contextualFactors: string[];
    successProbability: number;
}
/**
 * Context for mood suggestions
 */
export interface MoodSuggestionContext {
    currentTime: Date;
    recentSessions?: GameSession[];
    previousMood?: EnhancedMoodId;
    availableTime?: number;
    socialContext?: 'solo' | 'co-op' | 'pvp';
}
/**
 * Integration service connecting Enhanced Mood System with Persona Engine
 */
export declare class MoodPersonaIntegration {
    private identityEngine;
    private moodHistory;
    private dynamicWeights;
    constructor();
    /**
     * Process mood selection and update persona with learning
     */
    processMoodSelection(userId: string, moodEvent: MoodSelectionEvent): Promise<EnhancedPlayerIdentity>;
    /**
     * Learn from user actions and update persona
     */
    learnFromUserAction(userId: string, action: UserAction): Promise<void>;
    /**
     * Generate mood suggestions based on patterns and context
     */
    generateMoodSuggestions(userId: string, context: MoodSuggestionContext): Promise<MoodSuggestion[]>;
    /**
     * Generate personalized recommendations using learned weights
     */
    generatePersonalizedRecommendations(identity: EnhancedPlayerIdentity, mood: EnhancedMoodId, context: RecommendationContext, availableGames: Game[]): Promise<GameRecommendation[]>;
    /**
     * Get enhanced player identity with mood learning
     */
    private getEnhancedIdentity;
    /**
     * Initialize dynamic weights for all moods
     */
    private initializeDynamicWeights;
    /**
     * Update mood patterns based on new selection
     */
    private updateMoodPatterns;
    /**
     * Update dynamic weights based on mood outcomes
     */
    private updateDynamicWeights;
    /**
     * Calculate hybrid mood preferences
     */
    private calculateHybridMoodPreferences;
    /**
     * Calculate adaptation metrics
     */
    private calculateAdaptationMetrics;
    /**
     * Calculate mood confidence for suggestions
     */
    private calculateMoodConfidence;
    /**
     * Get time of day from Date
     */
    private getTimeOfDay;
    /**
     * Get moods suitable for social context
     */
    private getMoodsForSocialContext;
    /**
     * Generate static recommendations as fallback
     */
    private generateStaticRecommendations;
}
