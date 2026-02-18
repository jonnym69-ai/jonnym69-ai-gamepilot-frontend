import { PersonaSnapshot } from "./personaSnapshot";
import { type EnhancedPersonaSnapshot } from "./enhancedPersona";
/**
 * Feature flag for enhanced persona engine
 * Set to false for safety, true to enable enhanced features
 * Can be controlled via environment variables or runtime config
 */
export declare const ENABLE_ENHANCED_PERSONA: boolean;
/**
 * Unified persona engine interface
 * Provides consistent API regardless of which engine is active
 */
export interface UnifiedPersonaEngine {
    buildSnapshot(input: any): PersonaSnapshot | EnhancedPersonaSnapshot;
    recordMood?(moodId: string, intensity: number, moodTags?: string[], context?: string, gameId?: string): void;
    startSession?(gameId?: string, preMood?: any): string | null;
    endSession?(sessionId: string, postMood?: any): any;
    recordFeedback?(recommendationId: string, moodAtTime: any, feedback: string, gameId?: string, confidence?: number): void;
    getMoodHistory?(): any[];
    getSessionHistory?(): any[];
    getFeedbackHistory?(): any[];
}
/**
 * Safe persona engine wrapper
 * Chooses between existing and enhanced engines based on feature flag
 * Ensures 100% backwards compatibility
 */
declare class SafePersonaEngineWrapper implements UnifiedPersonaEngine {
    private enhancedEngine;
    private isEnabled;
    constructor();
    /**
     * Builds persona snapshot using appropriate engine
     * Enhanced engine provides additional insights when enabled
     * Legacy engine provides standard snapshot when disabled
     */
    buildSnapshot(input: any): PersonaSnapshot | EnhancedPersonaSnapshot;
    /**
     * Records mood event with enhanced features if enabled
     * No-op if enhanced engine is disabled
     */
    recordMood(moodId: string, intensity: number, moodTags?: string[], context?: string, gameId?: string): void;
    /**
     * Starts session tracking if enhanced engine enabled
     * Returns session ID if tracking, null if disabled
     */
    startSession(gameId?: string, preMood?: any): string | null;
    /**
     * Ends session tracking if enhanced engine enabled
     * Returns session data if tracking, null if disabled
     */
    endSession(sessionId: string, postMood?: any): any;
    /**
     * Records recommendation feedback if enhanced engine enabled
     * No-op if disabled
     */
    recordFeedback(recommendationId: string, moodAtTime: any, feedback: 'matched' | 'partial' | 'missed' | 'skip', gameId?: string, confidence?: number): void;
    /**
     * Gets mood history if enhanced engine enabled
     * Returns empty array if disabled
     */
    getMoodHistory(): any[];
    /**
     * Gets session history if enhanced engine enabled
     * Returns empty array if disabled
     */
    getSessionHistory(): any[];
    /**
     * Gets feedback history if enhanced engine enabled
     * Returns empty array if disabled
     */
    getFeedbackHistory(): any[];
    /**
     * Gets current engine status
     * Useful for debugging and feature detection
     */
    getEngineStatus(): {
        enhanced: boolean;
        engine: 'legacy' | 'enhanced';
        features: {
            temporalPatterns: boolean;
            sessionTracking: boolean;
            compoundMoods: boolean;
            feedbackLoop: boolean;
        };
    };
}
/**
 * Global persona engine instance
 * Provides consistent access across the application
 */
export declare const personaEngine: SafePersonaEngineWrapper;
/**
 * Builds persona snapshot using safe engine
 * Drop-in replacement for existing buildPersonaSnapshot calls
 */
export declare function buildPersonaSnapshotSafe(input: any): PersonaSnapshot | EnhancedPersonaSnapshot;
/**
 * Records mood event safely
 * Only records if enhanced engine is enabled
 */
export declare function recordMoodEventSafe(moodId: string, intensity: number, moodTags?: string[], context?: string, gameId?: string): void;
/**
 * Starts session tracking safely
 * Returns session ID if enhanced engine enabled
 */
export declare function startSessionSafe(gameId?: string, preMood?: any): string | null;
/**
 * Ends session tracking safely
 * Returns session data if enhanced engine enabled
 */
export declare function endSessionSafe(sessionId: string, postMood?: any): any;
/**
 * Records recommendation feedback safely
 * Only records if enhanced engine is enabled
 */
export declare function recordFeedbackSafe(recommendationId: string, moodAtTime: any, feedback: 'matched' | 'partial' | 'missed' | 'skip', gameId?: string, confidence?: number): void;
/**
 * Gets engine status for debugging
 * Useful for feature detection and troubleshooting
 */
export declare function getPersonaEngineStatus(): {
    enhanced: boolean;
    engine: 'legacy' | 'enhanced';
    features: {
        temporalPatterns: boolean;
        sessionTracking: boolean;
        compoundMoods: boolean;
        feedbackLoop: boolean;
    };
};
/**
 * Type guard to check if snapshot is enhanced
 * Allows safe access to enhanced features
 */
export declare function isEnhancedPersonaSnapshot(snapshot: any): snapshot is EnhancedPersonaSnapshot;
/**
 * Gets enhanced insights safely
 * Returns null if not enhanced or data missing
 */
export declare function getEnhancedInsights(snapshot: any): {
    temporalInsights?: any;
    sessionInsights?: any;
    compoundMoods?: any;
} | null;
/**
 * Migrates legacy mood data to enhanced format
 * Only runs if enhanced engine is enabled
 */
export declare function migrateLegacyMoodData(legacyMoods: any[]): boolean;
export {};
