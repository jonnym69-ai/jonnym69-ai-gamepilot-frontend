import { PersonaSnapshot } from "./personaSnapshot";
import { MoodEvent, SessionEvent, RecommendationFeedback } from "./enhancedPersonaEngine";
/**
 * Enhanced persona snapshot with additional insights
 * Extends existing PersonaSnapshot without breaking changes
 */
export interface EnhancedPersonaSnapshot extends PersonaSnapshot {
    temporalInsights?: {
        bestHours: number[];
        worstHours: number[];
        dayTrends: Record<string, number>;
    };
    sessionInsights?: {
        averageMoodDelta: number;
        positiveSessionRatio: number;
        sessionDurationImpact: number;
    };
    compoundMoods?: Array<{
        primary: string;
        secondary: string;
        frequency: number;
        averageIntensity: number;
    }>;
}
/**
 * Integration configuration for enhanced features
 * Allows enabling/disabling specific enhancements
 */
export interface EnhancedPersonaConfig {
    enableTemporalPatterns: boolean;
    enableSessionTracking: boolean;
    enableCompoundMoods: boolean;
    enableFeedbackLoop: boolean;
    maxHistorySize: number;
}
export declare const DEFAULT_ENHANCED_CONFIG: EnhancedPersonaConfig;
/**
 * Enhanced Persona Engine with safe, additive improvements
 * Wraps existing persona engine without breaking changes
 */
export declare class EnhancedPersonaEngine {
    private config;
    private moodHistory;
    private sessionHistory;
    private feedbackHistory;
    constructor(config?: Partial<EnhancedPersonaConfig>);
    /**
     * Builds enhanced persona snapshot with additional insights
     * Fully backwards compatible with existing buildPersonaSnapshot
     *
     * @param input - Same input as existing buildPersonaSnapshot
     * @param enhancedMoodData - Optional enhanced mood data for additional insights
     * @returns EnhancedPersonaSnapshot with existing data + new insights
     */
    buildEnhancedPersonaSnapshot(input: any, // Same type as PersonaSnapshotInput
    enhancedMoodData?: {
        moodEvents?: MoodEvent[];
        sessionEvents?: SessionEvent[];
        feedbackEvents?: RecommendationFeedback[];
    }): EnhancedPersonaSnapshot;
    /**
     * Records mood event with enhanced features
     * Safe wrapper around recordMoodEvent with history management
     */
    recordMood(moodId: string, intensity: number, moodTags?: string[], context?: string, gameId?: string, sessionContext?: {
        isPreSession?: boolean;
        isPostSession?: boolean;
        sessionId?: string;
    }): MoodEvent;
    /**
     * Records session start with tracking
     * Returns session ID for later completion
     */
    startSession(gameId?: string, preMood?: MoodEvent): string;
    /**
     * Records session end and calculates mood delta
     */
    endSession(sessionId: string, postMood?: MoodEvent): SessionEvent | null;
    /**
     * Records recommendation feedback for learning
     */
    recordFeedback(recommendationId: string, moodAtTime: MoodEvent, feedback: 'matched' | 'partial' | 'missed' | 'skip', gameId?: string, confidence?: number): RecommendationFeedback;
    /**
     * Gets current mood history
     */
    getMoodHistory(): MoodEvent[];
    /**
     * Gets current session history
     */
    getSessionHistory(): SessionEvent[];
    /**
     * Gets current feedback history
     */
    getFeedbackHistory(): RecommendationFeedback[];
    /**
     * Gets current configuration
     */
    getConfig(): EnhancedPersonaConfig;
    /**
     * Updates configuration
     */
    updateConfig(newConfig: Partial<EnhancedPersonaConfig>): void;
    /**
     * Clears all history (useful for testing or privacy)
     */
    clearHistory(): void;
}
/**
 * Creates enhanced persona engine with sensible defaults
 * Factory function for easy instantiation
 */
export declare function createEnhancedPersonaEngine(config?: Partial<EnhancedPersonaConfig>): EnhancedPersonaEngine;
