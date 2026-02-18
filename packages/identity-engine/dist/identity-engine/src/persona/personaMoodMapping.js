"use strict";
// GamePilot Persona Mood Integration Layer
// Connects PersonaTraits with the existing mood system
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapMoodToPersonaContext = mapMoodToPersonaContext;
exports.createMoodState = createMoodState;
exports.isMoodRecent = isMoodRecent;
exports.getMoodIntensityCategory = getMoodIntensityCategory;
/**
 * Maps UserMoodEntry to PersonaMoodContext
 * Pure mapping layer with no interpretation logic
 *
 * @param traits - Derived persona traits
 * @param moodEntry - Optional user mood entry from the mood system
 * @returns PersonaMoodContext with traits and mood state
 */
function mapMoodToPersonaContext(traits, moodEntry) {
    // If no mood entry provided, return context with null mood
    if (!moodEntry) {
        return {
            traits,
            mood: null
        };
    }
    // Convert UserMoodEntry to MoodState (lightweight interface)
    const moodState = {
        moodId: moodEntry.moodId,
        intensity: moodEntry.intensity,
        timestamp: moodEntry.timestamp
    };
    return {
        traits,
        mood: moodState
    };
}
/**
 * Helper function to create MoodState directly
 * Useful for testing or when mood data comes from different sources
 */
function createMoodState(moodId, intensity, timestamp = new Date()) {
    return {
        moodId,
        intensity: Math.max(1, Math.min(10, intensity)), // Clamp to 1-10 range
        timestamp
    };
}
/**
 * Helper function to check if mood is recent
 * Determines if mood data is still relevant for persona analysis
 */
function isMoodRecent(moodState, maxAgeHours = 24) {
    const now = new Date();
    const moodAge = now.getTime() - moodState.timestamp.getTime();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
    return moodAge <= maxAgeMs;
}
/**
 * Helper function to get mood intensity category
 * Categorizes intensity into Low/Medium/High for easier analysis
 */
function getMoodIntensityCategory(intensity) {
    if (intensity <= 3)
        return "Low";
    if (intensity <= 7)
        return "Medium";
    return "High";
}
// All types are already exported above with their declarations
