"use strict";
// GamePilot Enhanced Persona Engine
// Safe, additive improvements to the existing Persona Engine
// Adds temporal patterns, session context, compound moods, and feedback loops
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordMoodEvent = recordMoodEvent;
exports.recordSessionStart = recordSessionStart;
exports.recordSessionEnd = recordSessionEnd;
exports.recordRecommendationFeedback = recordRecommendationFeedback;
exports.getTemporalMoodPatterns = getTemporalMoodPatterns;
exports.getCompoundMoodSuggestions = getCompoundMoodSuggestions;
exports.getSessionMoodDelta = getSessionMoodDelta;
exports.moodEventToUserMoodEntry = moodEventToUserMoodEntry;
exports.userMoodEntryToMoodEvent = userMoodEntryToMoodEvent;
exports.migrateMoodHistory = migrateMoodHistory;
exports.demigrateMoodHistory = demigrateMoodHistory;
exports.validateMoodEvent = validateMoodEvent;
// ============================================================================
// HELPER FUNCTIONS (Safe, Non-Destructive)
// ============================================================================
/**
 * Records a mood event with enhanced temporal and context data
 * Safe wrapper around existing mood recording
 *
 * @param moodId - Primary mood identifier
 * @param intensity - Mood intensity (1-10)
 * @param moodTags - Additional mood tags for compound moods (max 2)
 * @param context - Optional context description
 * @param gameId - Optional game being played
 * @param sessionContext - Optional session context
 * @returns MoodEvent object with full temporal data
 */
function recordMoodEvent(moodId, intensity, moodTags = [], context, gameId, sessionContext) {
    const now = new Date();
    return {
        // Core mood data (compatible with UserMoodEntry)
        moodId,
        intensity: Math.max(1, Math.min(10, intensity)), // Clamp to valid range
        timestamp: now,
        context,
        gameId,
        // Enhanced features
        moodTags: moodTags.slice(0, 2), // Limit to 2 tags max
        temporalContext: {
            hourOfDay: now.getHours(),
            dayOfWeek: now.getDay(),
            weekOfYear: getWeekOfYear(now)
        },
        sessionContext: sessionContext ? {
            sessionId: sessionContext.sessionId,
            isPreSession: sessionContext.isPreSession || false,
            isPostSession: sessionContext.isPostSession || false
        } : undefined
    };
}
/**
 * Records the start of a gaming session with mood capture
 * Creates a session event that can be completed later
 *
 * @param sessionId - Unique session identifier
 * @param gameId - Optional game being played
 * @param preMood - Mood before starting the session
 * @returns SessionEvent object for tracking
 */
function recordSessionStart(sessionId, gameId, preMood) {
    return {
        sessionId,
        startTime: new Date(),
        gameId,
        preMood: preMood || null,
        postMood: null,
        sessionDuration: undefined,
        moodDelta: undefined
    };
}
/**
 * Records the end of a gaming session and calculates mood delta
 * Completes the session event started in recordSessionStart
 *
 * @param sessionEvent - Existing session event from recordSessionStart
 * @param postMood - Mood after ending the session
 * @returns Completed SessionEvent with mood delta calculated
 */
function recordSessionEnd(sessionEvent, postMood) {
    const endTime = new Date();
    const duration = sessionEvent.startTime ?
        Math.round((endTime.getTime() - sessionEvent.startTime.getTime()) / (1000 * 60)) :
        undefined;
    const moodDelta = (sessionEvent.preMood && postMood) ?
        postMood.intensity - sessionEvent.preMood.intensity :
        undefined;
    return {
        ...sessionEvent,
        endTime,
        postMood: postMood || null,
        sessionDuration: duration,
        moodDelta
    };
}
/**
 * Records user feedback on mood-based recommendations
 * Creates feedback data for learning and improvement
 *
 * @param recommendationId - Unique recommendation identifier
 * @param moodAtTime - Mood state when recommendation was made
 * @param feedback - User feedback on recommendation accuracy
 * @param gameId - Optional game that was recommended
 * @param confidence - System confidence in the recommendation
 * @returns RecommendationFeedback object
 */
function recordRecommendationFeedback(recommendationId, moodAtTime, feedback, gameId, confidence = 0.5) {
    return {
        recommendationId,
        moodAtTime,
        feedback,
        gameId,
        timestamp: new Date(),
        confidence: Math.max(0, Math.min(1, confidence)) // Clamp to 0-1 range
    };
}
// ============================================================================
// DERIVED INSIGHTS FUNCTIONS (No ML, Simple Analytics)
// ============================================================================
/**
 * Analyzes temporal mood patterns from mood events
 * Identifies best/worst hours and day trends
 *
 * @param moodEvents - Array of mood events to analyze
 * @returns Temporal mood patterns and insights
 */
function getTemporalMoodPatterns(moodEvents) {
    if (!moodEvents || moodEvents.length === 0) {
        return { bestHours: [], worstHours: [], dayTrends: {} };
    }
    // Group by hour of day
    const hourlyMoods = {};
    moodEvents.forEach(event => {
        const hour = event.temporalContext.hourOfDay;
        if (!hourlyMoods[hour])
            hourlyMoods[hour] = [];
        hourlyMoods[hour].push(event.intensity);
    });
    // Calculate average intensity by hour
    const hourlyAverages = {};
    Object.entries(hourlyMoods).forEach(([hour, intensities]) => {
        hourlyAverages[parseInt(hour)] = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    });
    // Find best and worst hours
    const sortedHours = Object.entries(hourlyAverages)
        .sort(([, a], [, b]) => b - a)
        .map(([hour]) => parseInt(hour));
    const bestHours = sortedHours.slice(0, 3); // Top 3 hours
    const worstHours = sortedHours.slice(-3); // Bottom 3 hours
    // Group by day of week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dailyMoods = {};
    moodEvents.forEach(event => {
        const dayName = dayNames[event.temporalContext.dayOfWeek];
        if (!dailyMoods[dayName])
            dailyMoods[dayName] = [];
        dailyMoods[dayName].push(event.intensity);
    });
    // Calculate average by day
    const dayTrends = {};
    Object.entries(dailyMoods).forEach(([day, intensities]) => {
        dayTrends[day] = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    });
    return { bestHours, worstHours, dayTrends };
}
/**
 * Suggests compound mood combinations based on frequency
 * Identifies common mood pairings from user history
 *
 * @param moodEvents - Array of mood events to analyze
 * @returns Array of compound mood suggestions with frequency data
 */
function getCompoundMoodSuggestions(moodEvents) {
    if (!moodEvents || moodEvents.length === 0) {
        return [];
    }
    // Count compound mood combinations
    const combinations = {};
    moodEvents.forEach(event => {
        if (event.moodTags.length > 0) {
            const key = `${event.moodId}+${event.moodTags[0]}`;
            if (!combinations[key]) {
                combinations[key] = { count: 0, intensities: [] };
            }
            combinations[key].count++;
            combinations[key].intensities.push(event.intensity);
        }
    });
    // Convert to suggestions with frequency and intensity
    const suggestions = Object.entries(combinations)
        .map(([combination, data]) => {
        const [primary, secondary] = combination.split('+');
        const avgIntensity = data.intensities.reduce((a, b) => a + b, 0) / data.intensities.length;
        const frequency = data.count / moodEvents.length;
        return {
            primary: primary,
            secondary,
            frequency,
            averageIntensity: avgIntensity
        };
    })
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5); // Top 5 combinations
    return suggestions;
}
/**
 * Calculates mood delta from gaming sessions
 * Analyzes how gaming sessions affect user mood
 *
 * @param sessionEvents - Array of completed session events
 * @returns Session mood analysis with deltas and patterns
 */
function getSessionMoodDelta(sessionEvents) {
    const completedSessions = sessionEvents.filter(session => session.preMood && session.postMood && session.sessionDuration);
    if (completedSessions.length === 0) {
        return { averageMoodDelta: 0, positiveSessionRatio: 0, sessionDurationImpact: 0 };
    }
    // Calculate mood deltas
    const moodDeltas = completedSessions.map(session => session.moodDelta || 0);
    const averageMoodDelta = moodDeltas.reduce((a, b) => a + b, 0) / moodDeltas.length;
    // Calculate positive session ratio
    const positiveSessions = moodDeltas.filter(delta => delta > 0).length;
    const positiveSessionRatio = positiveSessions / completedSessions.length;
    // Calculate session duration impact (simple correlation)
    const durations = completedSessions.map(session => session.sessionDuration || 0);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    // Simple correlation: longer sessions = more mood change (positive or negative)
    const sessionDurationImpact = Math.abs(averageMoodDelta) / Math.max(avgDuration, 1);
    return {
        averageMoodDelta,
        positiveSessionRatio,
        sessionDurationImpact
    };
}
// ============================================================================
// UTILITY FUNCTIONS (Safe Helpers)
// ============================================================================
/**
 * Gets week of year from date (1-52)
 * Utility function for temporal context
 */
function getWeekOfYear(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
/**
 * Converts MoodEvent to UserMoodEntry for backwards compatibility
 * Allows seamless integration with existing mood system
 */
function moodEventToUserMoodEntry(moodEvent) {
    return {
        moodId: moodEvent.moodId,
        intensity: moodEvent.intensity,
        timestamp: moodEvent.timestamp,
        context: moodEvent.context,
        gameId: moodEvent.gameId
    };
}
/**
 * Converts UserMoodEntry to MoodEvent with enhanced temporal data
 * Allows existing mood data to benefit from new features
 */
function userMoodEntryToMoodEvent(moodEntry) {
    return recordMoodEvent(moodEntry.moodId, moodEntry.intensity, [], // No compound moods in legacy data
    moodEntry.context, moodEntry.gameId);
}
/**
 * Converts existing UserMoodEntry array to enhanced MoodEvent array
 * Allows legacy data to benefit from new features
 */
function migrateMoodHistory(legacyMoods) {
    return legacyMoods.map(mood => userMoodEntryToMoodEvent(mood));
}
/**
 * Converts enhanced MoodEvent array back to UserMoodEntry array
 * Allows enhanced data to work with existing systems
 */
function demigrateMoodHistory(enhancedMoods) {
    return enhancedMoods.map(mood => moodEventToUserMoodEntry(mood));
}
/**
 * Validates mood event data structure
 * Ensures data integrity before processing
 */
function validateMoodEvent(moodEvent) {
    return (moodEvent &&
        typeof moodEvent.moodId === 'string' &&
        typeof moodEvent.intensity === 'number' &&
        moodEvent.intensity >= 1 &&
        moodEvent.intensity <= 10 &&
        moodEvent.timestamp instanceof Date &&
        Array.isArray(moodEvent.moodTags) &&
        moodEvent.moodTags.length <= 2 &&
        typeof moodEvent.temporalContext === 'object' &&
        typeof moodEvent.temporalContext.hourOfDay === 'number' &&
        moodEvent.temporalContext.hourOfDay >= 0 &&
        moodEvent.temporalContext.hourOfDay <= 23);
}
// ============================================================================
// INTEGRATION NOTES
// ============================================================================
/*
INTEGRATION WITH EXISTING PERSONA ENGINE:

1. BACKWARDS COMPATIBILITY:
   - All existing UserMoodEntry data can be converted to MoodEvent
   - Existing persona analysis functions continue to work unchanged
   - New features are optional and additive

2. SAFE EXTENSION POINTS:
   - Use moodEventToUserMoodEntry() when passing to existing persona functions
   - Use userMoodEntryToMoodEvent() to enhance legacy data with new features
   - All new functions fail gracefully with empty/null inputs

3. DATA FLOW RECOMMENDATIONS:
   - Record mood events using recordMoodEvent() instead of direct UserMoodEntry
   - Track sessions with recordSessionStart()/recordSessionEnd()
   - Collect feedback with recordRecommendationFeedback()
   - Analyze patterns with the get* functions

4. FUTURE EXPANSION:
   - Add more temporal patterns (seasonal, monthly)
   - Enhance compound mood logic (3+ mood combinations)
   - Add environmental context (weather, events)
   - Implement simple prediction based on patterns

5. PERFORMANCE CONSIDERATIONS:
   - All functions are O(n) or better complexity
   - No heavy ML or complex computations
   - Can be easily cached or memoized if needed
   - Memory usage scales linearly with data volume

*/
