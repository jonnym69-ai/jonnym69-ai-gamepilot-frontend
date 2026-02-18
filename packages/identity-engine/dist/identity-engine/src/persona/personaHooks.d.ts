export interface UsePersonaEngineReturn {
    buildSnapshot: (input: any) => any;
    recordMood: (moodId: string, intensity: number, moodTags?: string[], context?: string, gameId?: string) => void;
    startSession: (gameId?: string, preMood?: any) => string | null;
    endSession: (sessionId: string, postMood?: any) => any;
    recordFeedback: (recommendationId: string, moodAtTime: any, feedback: 'matched' | 'partial' | 'missed' | 'skip', gameId?: string, confidence?: number) => void;
    isEnhanced: boolean;
    engineStatus: any;
    moodHistory: any[];
    sessionHistory: any[];
    feedbackHistory: any[];
}
export interface UsePersonaSnapshotReturn {
    snapshot: any;
    isLoading: boolean;
    error: string | null;
    isEnhanced: boolean;
    enhancedInsights: {
        temporalInsights?: any;
        sessionInsights?: any;
        compoundMoods?: any;
    } | null;
    refresh: () => void;
}
export interface UseSessionTrackingReturn {
    activeSessionId: string | null;
    isTracking: boolean;
    startSession: (gameId?: string, preMood?: any) => string | null;
    endSession: (postMood?: any) => any;
    getSessionHistory: () => any[];
}
/**
 * Main hook for accessing persona engine functionality
 * Provides safe access to both legacy and enhanced features
 */
export declare function usePersonaEngine(): UsePersonaEngineReturn;
/**
 * Hook for building and managing persona snapshots
 * Provides loading states and error handling
 */
export declare function usePersonaSnapshot(input: any, options?: {
    autoRefresh?: boolean;
    refreshInterval?: number;
}): UsePersonaSnapshotReturn;
/**
 * Hook for managing gaming sessions
 * Provides session lifecycle management
 */
export declare function useSessionTracking(): UseSessionTrackingReturn;
/**
 * Hook for detecting enhanced persona engine availability
 * Useful for conditional UI rendering
 */
export declare function useEnhancedPersonaDetection(): {
    isEnhanced: boolean;
    engineStatus: any;
    features: any;
};
/**
 * Combined hook for most common persona engine use cases
 * Provides snapshot, session tracking, and feature detection
 */
export declare function usePersonaEngineFull(input?: any, options?: {
    autoRefreshSnapshot?: boolean;
    snapshotRefreshInterval?: number;
}): {
    isEnhanced: boolean;
    engineStatus: any;
    features: any;
    activeSessionId: string | null;
    isTracking: boolean;
    startSession: (gameId?: string, preMood?: any) => string | null;
    endSession: (postMood?: any) => any;
    getSessionHistory: () => any[];
    snapshot: any;
    isSnapshotLoading: boolean;
    snapshotError: string | null;
    enhancedInsights: {
        temporalInsights?: any;
        sessionInsights?: any;
        compoundMoods?: any;
    } | null;
    refreshSnapshot: () => void;
    buildSnapshot: (input: any) => any;
    recordMood: (moodId: string, intensity: number, moodTags?: string[], context?: string, gameId?: string) => void;
    recordFeedback: (recommendationId: string, moodAtTime: any, feedback: "matched" | "partial" | "missed" | "skip", gameId?: string, confidence?: number) => void;
    moodHistory: any[];
    sessionHistory: any[];
    feedbackHistory: any[];
};
