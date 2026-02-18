import { MoodId } from "@gamepilot/static-data";
interface UserMoodEntry {
    moodId: MoodId;
    intensity: number;
    timestamp: Date;
    context?: string;
    gameId?: string;
}
/**
 * Enhanced mood event with temporal and compound mood support
 * Extends existing UserMoodEntry with additional metadata
 */
export interface MoodEvent {
    moodId: MoodId;
    intensity: number;
    timestamp: Date;
    context?: string;
    gameId?: string;
    moodTags: string[];
    temporalContext: {
        hourOfDay: number;
        dayOfWeek: number;
        weekOfYear: number;
    };
    sessionContext?: {
        sessionId?: string;
        isPreSession: boolean;
        isPostSession: boolean;
    };
}
/**
 * Session tracking for mood delta analysis
 * Captures mood changes before/after gaming sessions
 */
export interface SessionEvent {
    sessionId: string;
    startTime: Date;
    endTime?: Date;
    gameId?: string;
    preMood: MoodEvent | null;
    postMood: MoodEvent | null;
    sessionDuration?: number;
    moodDelta?: number;
}
/**
 * Recommendation feedback for learning loop
 * Captures user feedback on mood-based recommendations
 */
export interface RecommendationFeedback {
    recommendationId: string;
    moodAtTime: MoodEvent;
    feedback: 'matched' | 'partial' | 'missed' | 'skip';
    gameId?: string;
    timestamp: Date;
    confidence: number;
}
/**
 * Enhanced mood pattern insights
 * Derived from temporal and session data without heavy ML
 */
export interface MoodPatternInsights {
    temporalPatterns: {
        bestHours: number[];
        worstHours: number[];
        dayTrends: Record<string, number>;
    };
    sessionPatterns: {
        averageMoodDelta: number;
        positiveSessionRatio: number;
        sessionDurationImpact: number;
    };
    compoundMoods: {
        frequentCombinations: Array<{
            primary: MoodId;
            secondary: MoodId;
            frequency: number;
            averageIntensity: number;
        }>;
    };
}
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
export declare function recordMoodEvent(moodId: MoodId, intensity: number, moodTags?: string[], context?: string, gameId?: string, sessionContext?: {
    isPreSession?: boolean;
    isPostSession?: boolean;
    sessionId?: string;
}): MoodEvent;
/**
 * Records the start of a gaming session with mood capture
 * Creates a session event that can be completed later
 *
 * @param sessionId - Unique session identifier
 * @param gameId - Optional game being played
 * @param preMood - Mood before starting the session
 * @returns SessionEvent object for tracking
 */
export declare function recordSessionStart(sessionId: string, gameId?: string, preMood?: MoodEvent): SessionEvent;
/**
 * Records the end of a gaming session and calculates mood delta
 * Completes the session event started in recordSessionStart
 *
 * @param sessionEvent - Existing session event from recordSessionStart
 * @param postMood - Mood after ending the session
 * @returns Completed SessionEvent with mood delta calculated
 */
export declare function recordSessionEnd(sessionEvent: SessionEvent, postMood?: MoodEvent): SessionEvent;
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
export declare function recordRecommendationFeedback(recommendationId: string, moodAtTime: MoodEvent, feedback: 'matched' | 'partial' | 'missed' | 'skip', gameId?: string, confidence?: number): RecommendationFeedback;
/**
 * Analyzes temporal mood patterns from mood events
 * Identifies best/worst hours and day trends
 *
 * @param moodEvents - Array of mood events to analyze
 * @returns Temporal mood patterns and insights
 */
export declare function getTemporalMoodPatterns(moodEvents: MoodEvent[]): {
    bestHours: number[];
    worstHours: number[];
    dayTrends: Record<string, number>;
};
/**
 * Suggests compound mood combinations based on frequency
 * Identifies common mood pairings from user history
 *
 * @param moodEvents - Array of mood events to analyze
 * @returns Array of compound mood suggestions with frequency data
 */
export declare function getCompoundMoodSuggestions(moodEvents: MoodEvent[]): Array<{
    primary: MoodId;
    secondary: string;
    frequency: number;
    averageIntensity: number;
}>;
/**
 * Calculates mood delta from gaming sessions
 * Analyzes how gaming sessions affect user mood
 *
 * @param sessionEvents - Array of completed session events
 * @returns Session mood analysis with deltas and patterns
 */
export declare function getSessionMoodDelta(sessionEvents: SessionEvent[]): {
    averageMoodDelta: number;
    positiveSessionRatio: number;
    sessionDurationImpact: number;
};
/**
 * Converts MoodEvent to UserMoodEntry for backwards compatibility
 * Allows seamless integration with existing mood system
 */
export declare function moodEventToUserMoodEntry(moodEvent: MoodEvent): UserMoodEntry;
/**
 * Converts UserMoodEntry to MoodEvent with enhanced temporal data
 * Allows existing mood data to benefit from new features
 */
export declare function userMoodEntryToMoodEvent(moodEntry: UserMoodEntry): MoodEvent;
/**
 * Converts existing UserMoodEntry array to enhanced MoodEvent array
 * Allows legacy data to benefit from new features
 */
export declare function migrateMoodHistory(legacyMoods: UserMoodEntry[]): MoodEvent[];
/**
 * Converts enhanced MoodEvent array back to UserMoodEntry array
 * Allows enhanced data to work with existing systems
 */
export declare function demigrateMoodHistory(enhancedMoods: MoodEvent[]): UserMoodEntry[];
/**
 * Validates mood event data structure
 * Ensures data integrity before processing
 */
export declare function validateMoodEvent(moodEvent: MoodEvent): boolean;
export {};
