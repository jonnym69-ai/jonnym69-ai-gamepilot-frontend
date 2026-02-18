"use strict";
// GamePilot Enhanced Persona Engine - React Hooks
// Safe React integration for enhanced persona features
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePersonaEngine = usePersonaEngine;
exports.usePersonaSnapshot = usePersonaSnapshot;
exports.useSessionTracking = useSessionTracking;
exports.useEnhancedPersonaDetection = useEnhancedPersonaDetection;
exports.usePersonaEngineFull = usePersonaEngineFull;
const react_1 = require("react");
const safePersonaIntegration_1 = require("./safePersonaIntegration");
// ============================================================================
// MAIN PERSONA ENGINE HOOK
// ============================================================================
/**
 * Main hook for accessing persona engine functionality
 * Provides safe access to both legacy and enhanced features
 */
function usePersonaEngine() {
    const [engineStatus, setEngineStatus] = (0, react_1.useState)((0, safePersonaIntegration_1.getPersonaEngineStatus)());
    const [moodHistory, setMoodHistory] = (0, react_1.useState)([]);
    const [sessionHistory, setSessionHistory] = (0, react_1.useState)([]);
    const [feedbackHistory, setFeedbackHistory] = (0, react_1.useState)([]);
    // Update status on mount and when feature flag changes
    (0, react_1.useEffect)(() => {
        setEngineStatus((0, safePersonaIntegration_1.getPersonaEngineStatus)());
    }, []);
    // Refresh data periodically
    const refreshData = (0, react_1.useCallback)(() => {
        setMoodHistory(safePersonaIntegration_1.personaEngine.getMoodHistory() || []);
        setSessionHistory(safePersonaIntegration_1.personaEngine.getSessionHistory() || []);
        setFeedbackHistory(safePersonaIntegration_1.personaEngine.getFeedbackHistory() || []);
    }, []);
    // Auto-refresh data every 30 seconds if enhanced engine is active
    (0, react_1.useEffect)(() => {
        if (!safePersonaIntegration_1.ENABLE_ENHANCED_PERSONA)
            return;
        const interval = setInterval(refreshData, 30000);
        return () => clearInterval(interval);
    }, [refreshData]);
    // Initial data load
    (0, react_1.useEffect)(() => {
        refreshData();
    }, [refreshData]);
    // Safe wrapper functions
    const buildSnapshot = (0, react_1.useCallback)((input) => {
        return (0, safePersonaIntegration_1.buildPersonaSnapshotSafe)(input);
    }, []);
    const recordMood = (0, react_1.useCallback)((moodId, intensity, moodTags, context, gameId) => {
        (0, safePersonaIntegration_1.recordMoodEventSafe)(moodId, intensity, moodTags, context, gameId);
        refreshData(); // Update local state
    }, [refreshData]);
    const startSession = (0, react_1.useCallback)((gameId, preMood) => {
        const sessionId = (0, safePersonaIntegration_1.startSessionSafe)(gameId, preMood);
        refreshData(); // Update local state
        return sessionId;
    }, [refreshData]);
    const endSession = (0, react_1.useCallback)((sessionId, postMood) => {
        const session = (0, safePersonaIntegration_1.endSessionSafe)(sessionId, postMood);
        refreshData(); // Update local state
        return session;
    }, [refreshData]);
    const recordFeedback = (0, react_1.useCallback)((recommendationId, moodAtTime, feedback, gameId, confidence) => {
        (0, safePersonaIntegration_1.recordFeedbackSafe)(recommendationId, moodAtTime, feedback, gameId, confidence);
        refreshData(); // Update local state
    }, [refreshData]);
    return {
        buildSnapshot,
        recordMood,
        startSession,
        endSession,
        recordFeedback,
        isEnhanced: engineStatus.enhanced,
        engineStatus,
        moodHistory,
        sessionHistory,
        feedbackHistory
    };
}
// ============================================================================
// PERSONA SNAPSHOT HOOK
// ============================================================================
/**
 * Hook for building and managing persona snapshots
 * Provides loading states and error handling
 */
function usePersonaSnapshot(input, options) {
    const [snapshot, setSnapshot] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const buildSnapshotData = (0, react_1.useCallback)(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = (0, safePersonaIntegration_1.buildPersonaSnapshotSafe)(input);
            setSnapshot(result);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to build persona snapshot');
            console.error('Persona snapshot error:', err);
        }
        finally {
            setIsLoading(false);
        }
    }, [input]);
    // Initial build
    (0, react_1.useEffect)(() => {
        if (input) {
            buildSnapshotData();
        }
    }, [input, buildSnapshotData]);
    // Auto-refresh if enabled
    (0, react_1.useEffect)(() => {
        if (!options?.autoRefresh || !safePersonaIntegration_1.ENABLE_ENHANCED_PERSONA)
            return;
        const interval = setInterval(buildSnapshotData, options.refreshInterval || 60000);
        return () => clearInterval(interval);
    }, [options?.autoRefresh, options?.refreshInterval, buildSnapshotData]);
    // Extract enhanced insights
    const enhancedInsights = (0, safePersonaIntegration_1.getEnhancedInsights)(snapshot);
    const isEnhanced = (0, safePersonaIntegration_1.isEnhancedPersonaSnapshot)(snapshot);
    return {
        snapshot,
        isLoading,
        error,
        isEnhanced,
        enhancedInsights,
        refresh: buildSnapshotData
    };
}
// ============================================================================
// SESSION TRACKING HOOK
// ============================================================================
/**
 * Hook for managing gaming sessions
 * Provides session lifecycle management
 */
function useSessionTracking() {
    const [activeSessionId, setActiveSessionId] = (0, react_1.useState)(null);
    const [isTracking, setIsTracking] = (0, react_1.useState)(false);
    const { recordMood, sessionHistory } = usePersonaEngine();
    const startSession = (0, react_1.useCallback)((gameId, preMood) => {
        if (!safePersonaIntegration_1.ENABLE_ENHANCED_PERSONA) {
            console.warn('Enhanced persona engine disabled, session tracking not available');
            return null;
        }
        const sessionId = (0, safePersonaIntegration_1.startSessionSafe)(gameId, preMood);
        if (sessionId) {
            setActiveSessionId(sessionId);
            setIsTracking(true);
            // Record pre-session mood if provided
            if (preMood) {
                recordMood(preMood.moodId, preMood.intensity, preMood.moodTags, 'Pre-session mood', gameId);
            }
        }
        return sessionId;
    }, [recordMood]);
    const endSession = (0, react_1.useCallback)((postMood) => {
        if (!activeSessionId || !safePersonaIntegration_1.ENABLE_ENHANCED_PERSONA) {
            return null;
        }
        const session = (0, safePersonaIntegration_1.endSessionSafe)(activeSessionId, postMood);
        // Record post-session mood if provided
        if (postMood) {
            recordMood(postMood.moodId, postMood.intensity, postMood.moodTags, 'Post-session mood');
        }
        setActiveSessionId(null);
        setIsTracking(false);
        return session;
    }, [activeSessionId, recordMood]);
    const getSessionHistory = (0, react_1.useCallback)(() => {
        return sessionHistory || [];
    }, [sessionHistory]);
    return {
        activeSessionId,
        isTracking,
        startSession,
        endSession,
        getSessionHistory
    };
}
// ============================================================================
// FEATURE DETECTION HOOK
// ============================================================================
/**
 * Hook for detecting enhanced persona engine availability
 * Useful for conditional UI rendering
 */
function useEnhancedPersonaDetection() {
    const [isEnhanced, setIsEnhanced] = (0, react_1.useState)(safePersonaIntegration_1.ENABLE_ENHANCED_PERSONA);
    const [engineStatus, setEngineStatus] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        setIsEnhanced(safePersonaIntegration_1.ENABLE_ENHANCED_PERSONA);
        setEngineStatus((0, safePersonaIntegration_1.getPersonaEngineStatus)());
    }, []);
    return {
        isEnhanced,
        engineStatus,
        features: engineStatus?.features || {
            temporalPatterns: false,
            sessionTracking: false,
            compoundMoods: false,
            feedbackLoop: false
        }
    };
}
// ============================================================================
// CONVENIENCE COMBINED HOOK
// ============================================================================
/**
 * Combined hook for most common persona engine use cases
 * Provides snapshot, session tracking, and feature detection
 */
function usePersonaEngineFull(input, options) {
    const personaEngine = usePersonaEngine();
    const snapshot = usePersonaSnapshot(input, {
        autoRefresh: options?.autoRefreshSnapshot,
        refreshInterval: options?.snapshotRefreshInterval
    });
    const sessionTracking = useSessionTracking();
    const featureDetection = useEnhancedPersonaDetection();
    return {
        // Core persona engine
        ...personaEngine,
        // Snapshot data
        snapshot: snapshot.snapshot,
        isSnapshotLoading: snapshot.isLoading,
        snapshotError: snapshot.error,
        enhancedInsights: snapshot.enhancedInsights,
        refreshSnapshot: snapshot.refresh,
        // Session tracking
        ...sessionTracking,
        // Feature detection
        ...featureDetection
    };
}
// ============================================================================
// USAGE EXAMPLES
// ============================================================================
/*
USAGE EXAMPLES:

1. BASIC PERSONA ENGINE USAGE:
   const { buildSnapshot, recordMood, isEnhanced } = usePersonaEngine()
   
   // Build snapshot (works with both engines)
   const snapshot = buildSnapshot(inputData)
   
   // Record mood (only works if enhanced engine enabled)
   recordMood('energetic', 8, ['creative'], 'After work')

2. SNAPSHOT WITH AUTO-REFRESH:
   const { snapshot, isLoading, enhancedInsights, refresh } = usePersonaSnapshot(input, {
     autoRefresh: true,
     refreshInterval: 30000
   })

3. SESSION TRACKING:
   const { startSession, endSession, isTracking, activeSessionId } = useSessionTracking()
   
   // Start session
   const sessionId = startSession('game-123', preMood)
   
   // End session
   endSession(postMood)

4. FEATURE DETECTION:
   const { isEnhanced, features } = useEnhancedPersonaDetection()
   
   if (isEnhanced && features.temporalPatterns) {
     // Show enhanced features
   }

5. FULL COMBINED USAGE:
   const {
     buildSnapshot,
     snapshot,
     enhancedInsights,
     startSession,
     endSession,
     isEnhanced,
     features
   } = usePersonaEngineFull(input, {
     autoRefreshSnapshot: true,
     snapshotRefreshInterval: 60000
   })

SAFETY FEATURES:
✅ All hooks gracefully fallback when enhanced engine disabled
✅ No errors thrown when enhanced features unavailable
✅ Automatic data refresh with configurable intervals
✅ Loading states and error handling throughout
✅ Memory efficient with proper cleanup

PERFORMANCE:
✅ Memoized callbacks prevent unnecessary re-renders
✅ Configurable refresh intervals
✅ Efficient data updates with local state
✅ Proper cleanup of intervals and subscriptions

*/
