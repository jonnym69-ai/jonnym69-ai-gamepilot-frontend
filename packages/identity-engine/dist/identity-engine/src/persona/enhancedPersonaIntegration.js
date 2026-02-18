"use strict";
// GamePilot Enhanced Persona Engine Integration Layer
// Safe integration with existing Persona Engine without breaking changes
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedPersonaEngine = exports.DEFAULT_ENHANCED_CONFIG = void 0;
exports.createEnhancedPersonaEngine = createEnhancedPersonaEngine;
const personaSnapshot_1 = require("./personaSnapshot");
const enhancedPersonaEngine_1 = require("./enhancedPersonaEngine");
// Default configuration - conservative and safe
exports.DEFAULT_ENHANCED_CONFIG = {
    enableTemporalPatterns: true,
    enableSessionTracking: true,
    enableCompoundMoods: true,
    enableFeedbackLoop: true,
    maxHistorySize: 1000
};
// ============================================================================
// ENHANCED PERSONA ENGINE (Safe Wrapper)
// ============================================================================
/**
 * Enhanced Persona Engine with safe, additive improvements
 * Wraps existing persona engine without breaking changes
 */
class EnhancedPersonaEngine {
    constructor(config = {}) {
        this.moodHistory = [];
        this.sessionHistory = [];
        this.feedbackHistory = [];
        this.config = { ...exports.DEFAULT_ENHANCED_CONFIG, ...config };
    }
    /**
     * Builds enhanced persona snapshot with additional insights
     * Fully backwards compatible with existing buildPersonaSnapshot
     *
     * @param input - Same input as existing buildPersonaSnapshot
     * @param enhancedMoodData - Optional enhanced mood data for additional insights
     * @returns EnhancedPersonaSnapshot with existing data + new insights
     */
    buildEnhancedPersonaSnapshot(input, // Same type as PersonaSnapshotInput
    enhancedMoodData) {
        // Build base persona snapshot using existing engine (no changes)
        const baseSnapshot = (0, personaSnapshot_1.buildPersonaSnapshot)(input);
        // Add enhanced insights if enabled and data available
        const enhancedSnapshot = {
            ...baseSnapshot
        };
        // Add temporal insights
        if (this.config.enableTemporalPatterns && enhancedMoodData?.moodEvents) {
            enhancedSnapshot.temporalInsights = (0, enhancedPersonaEngine_1.getTemporalMoodPatterns)(enhancedMoodData.moodEvents);
        }
        // Add session insights
        if (this.config.enableSessionTracking && enhancedMoodData?.sessionEvents) {
            enhancedSnapshot.sessionInsights = (0, enhancedPersonaEngine_1.getSessionMoodDelta)(enhancedMoodData.sessionEvents);
        }
        // Add compound mood suggestions
        if (this.config.enableCompoundMoods && enhancedMoodData?.moodEvents) {
            enhancedSnapshot.compoundMoods = (0, enhancedPersonaEngine_1.getCompoundMoodSuggestions)(enhancedMoodData.moodEvents);
        }
        return enhancedSnapshot;
    }
    /**
     * Records mood event with enhanced features
     * Safe wrapper around recordMoodEvent with history management
     */
    recordMood(moodId, intensity, moodTags = [], context, gameId, sessionContext) {
        const moodEvent = (0, enhancedPersonaEngine_1.recordMoodEvent)(moodId, // Type assertion for compatibility
        intensity, moodTags, context, gameId, sessionContext);
        // Add to history with size limit
        this.moodHistory.push(moodEvent);
        if (this.moodHistory.length > this.config.maxHistorySize) {
            this.moodHistory = this.moodHistory.slice(-this.config.maxHistorySize);
        }
        return moodEvent;
    }
    /**
     * Records session start with tracking
     * Returns session ID for later completion
     */
    startSession(gameId, preMood) {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const sessionEvent = (0, enhancedPersonaEngine_1.recordSessionStart)(sessionId, gameId, preMood);
        this.sessionHistory.push(sessionEvent);
        if (this.sessionHistory.length > this.config.maxHistorySize) {
            this.sessionHistory = this.sessionHistory.slice(-this.config.maxHistorySize);
        }
        return sessionId;
    }
    /**
     * Records session end and calculates mood delta
     */
    endSession(sessionId, postMood) {
        const sessionIndex = this.sessionHistory.findIndex(s => s.sessionId === sessionId);
        if (sessionIndex === -1)
            return null;
        const sessionEvent = this.sessionHistory[sessionIndex];
        const completedSession = (0, enhancedPersonaEngine_1.recordSessionEnd)(sessionEvent, postMood);
        this.sessionHistory[sessionIndex] = completedSession;
        return completedSession;
    }
    /**
     * Records recommendation feedback for learning
     */
    recordFeedback(recommendationId, moodAtTime, feedback, gameId, confidence = 0.5) {
        const feedbackEvent = (0, enhancedPersonaEngine_1.recordRecommendationFeedback)(recommendationId, moodAtTime, feedback, gameId, confidence);
        this.feedbackHistory.push(feedbackEvent);
        if (this.feedbackHistory.length > this.config.maxHistorySize) {
            this.feedbackHistory = this.feedbackHistory.slice(-this.config.maxHistorySize);
        }
        return feedbackEvent;
    }
    /**
     * Gets current mood history
     */
    getMoodHistory() {
        return [...this.moodHistory];
    }
    /**
     * Gets current session history
     */
    getSessionHistory() {
        return [...this.sessionHistory];
    }
    /**
     * Gets current feedback history
     */
    getFeedbackHistory() {
        return [...this.feedbackHistory];
    }
    /**
     * Gets current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Updates configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    /**
     * Clears all history (useful for testing or privacy)
     */
    clearHistory() {
        this.moodHistory = [];
        this.sessionHistory = [];
        this.feedbackHistory = [];
    }
}
exports.EnhancedPersonaEngine = EnhancedPersonaEngine;
// ============================================================================
// LEGACY COMPATIBILITY HELPERS
// ============================================================================
/**
 * Creates enhanced persona engine with sensible defaults
 * Factory function for easy instantiation
 */
function createEnhancedPersonaEngine(config) {
    return new EnhancedPersonaEngine(config);
}
// ============================================================================
// USAGE EXAMPLES (Documentation)
// ============================================================================
/*
USAGE EXAMPLES:

1. BASIC USAGE (Backwards Compatible):
   const engine = new EnhancedPersonaEngine()
   const snapshot = engine.buildEnhancedPersonaSnapshot(input)
   // Works exactly like existing buildPersonaSnapshot

2. WITH ENHANCED DATA:
   const engine = new EnhancedPersonaEngine()
   const enhancedData = {
     moodEvents: engine.getMoodHistory(),
     sessionEvents: engine.getSessionHistory()
   }
   const enhancedSnapshot = engine.buildEnhancedPersonaSnapshot(input, enhancedData)
   // Includes temporal insights, session patterns, compound moods

3. RECORDING ENHANCED MOODS:
   const moodEvent = engine.recordMood(
     'energetic',
     8,
     ['creative'], // Compound mood
     'After work gaming session',
     'game-123',
     { isPostSession: true, sessionId: 'session-456' }
   )

4. SESSION TRACKING:
   const sessionId = engine.startSession('game-123', preMood)
   // ... gaming session ...
   const completedSession = engine.endSession(sessionId, postMood)

5. FEEDBACK LOOP:
   engine.recordFeedback(
     'rec-789',
     currentMood,
     'matched',
     'game-123',
     0.8
   )

6. CONFIGURATION:
   const engine = new EnhancedPersonaEngine({
     enableTemporalPatterns: true,
     enableSessionTracking: false, // Disable if not needed
     maxHistorySize: 500
   })

SAFETY FEATURES:
- All new features are optional and additive
- Existing code continues to work unchanged
- Graceful fallback when enhanced data is missing
- Memory usage controlled with maxHistorySize
- Input validation and type safety throughout

PERFORMANCE CONSIDERATIONS:
- O(n) complexity for all operations
- Memory scales linearly with history size
- Can be easily cached or memoized
- No heavy computations or ML models

*/
