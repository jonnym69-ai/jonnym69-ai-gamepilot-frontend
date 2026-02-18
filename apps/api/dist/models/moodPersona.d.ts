import type { EnhancedMoodId } from '@gamepilot/static-data';
/**
 * Mood Selection Event - tracks every mood choice with context and outcomes
 */
export interface MoodSelection {
    id: string;
    userId: string;
    primaryMood: EnhancedMoodId;
    secondaryMood?: EnhancedMoodId;
    intensity: number;
    sessionId?: string;
    timestamp: Date;
    context: {
        timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
        dayOfWeek: number;
        trigger: 'manual' | 'suggested' | 'auto';
        previousMood?: EnhancedMoodId;
        sessionLength?: number;
    };
    outcomes: {
        gamesRecommended: number;
        gamesLaunched: number;
        averageSessionDuration?: number;
        userRating?: number;
        ignoredRecommendations: number;
    };
    createdAt: Date;
}
/**
 * Persona Profile - stores learned preferences and weights for each user
 */
export interface PersonaProfile {
    id: string;
    userId: string;
    genreWeights: Record<string, number>;
    tagWeights: Record<string, number>;
    moodAffinity: Record<EnhancedMoodId, number>;
    sessionPatterns: {
        dailyRhythms: Record<string, EnhancedMoodId[]>;
        weeklyPatterns: Record<number, EnhancedMoodId[]>;
        contextualTriggers: Record<string, EnhancedMoodId>;
    };
    hybridSuccess: Record<string, number>;
    platformBiases: Record<string, number>;
    timePreferences: {
        morning: number;
        afternoon: number;
        evening: number;
        night: number;
    };
    confidence: number;
    sampleSize: number;
    version: string;
    lastUpdated: Date;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * User Action - tracks all user interactions for learning
 */
export interface UserAction {
    id: string;
    userId: string;
    type: 'launch' | 'ignore' | 'view' | 'wishlist' | 'rate' | 'switch_mood' | 'session_complete';
    gameId?: string;
    gameTitle?: string;
    moodContext?: {
        primaryMood: EnhancedMoodId;
        secondaryMood?: EnhancedMoodId;
    };
    timestamp: Date;
    sessionId?: string;
    metadata: {
        sessionDuration?: number;
        rating?: number;
        reason?: string;
        previousMood?: EnhancedMoodId;
    };
    createdAt: Date;
}
/**
 * Recommendation Event - tracks recommendation performance
 */
export interface RecommendationEvent {
    id: string;
    userId: string;
    moodContext: {
        primaryMood: EnhancedMoodId;
        secondaryMood?: EnhancedMoodId;
        intensity: number;
    };
    recommendedGames: Array<{
        gameId: string;
        name: string;
        score: number;
        reasoning: string[];
    }>;
    clickedGameId?: string;
    successFlag?: boolean;
    timestamp: Date;
    sessionId?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
}
/**
 * Mood Prediction - tracks mood suggestion accuracy
 */
export interface MoodPrediction {
    id: string;
    userId: string;
    predictedMood: EnhancedMoodId;
    confidence: number;
    reasoning: string[];
    contextualFactors: string[];
    successProbability: number;
    acceptedFlag?: boolean;
    timestamp: Date;
    sessionId?: string;
    createdAt: Date;
}
/**
 * Mood Pattern - stores detected patterns for predictions
 */
export interface MoodPattern {
    id: string;
    userId: string;
    patternType: 'daily_rhythm' | 'weekly_pattern' | 'contextual_trigger';
    patternKey: string;
    moodId: EnhancedMoodId;
    frequency: number;
    successRate: number;
    lastSeen: Date;
    confidence: number;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Learning Metrics - tracks system performance over time
 */
export interface LearningMetrics {
    id: string;
    userId: string;
    metricType: 'prediction_accuracy' | 'user_satisfaction' | 'adaptation_rate' | 'recommendation_success';
    metricValue: number;
    period: 'daily' | 'weekly' | 'monthly';
    timestamp: Date;
    metadata?: Record<string, any>;
    createdAt: Date;
}
/**
 * Database row mapping functions
 */
export declare function mapRowToMoodSelection(row: any): MoodSelection;
export declare function mapRowToPersonaProfile(row: any): PersonaProfile;
export declare function mapRowToUserAction(row: any): UserAction;
export declare function mapRowToRecommendationEvent(row: any): RecommendationEvent;
export declare function mapRowToMoodPrediction(row: any): MoodPrediction;
export declare function mapRowToMoodPattern(row: any): MoodPattern;
export declare function mapRowToLearningMetrics(row: any): LearningMetrics;
//# sourceMappingURL=moodPersona.d.ts.map