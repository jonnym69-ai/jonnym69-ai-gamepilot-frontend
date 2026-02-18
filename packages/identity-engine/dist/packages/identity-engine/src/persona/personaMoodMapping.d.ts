import { MoodId } from "../../../static-data/src/moods";
import { UserMoodEntry } from "../../../shared/src/models/user";
import { PersonaTraits } from "../../../static-data/src/persona/personaTraits";
/**
 * Lightweight mood state interface for Persona Engine
 * Mirrors UserMoodEntry but keeps Persona Engine decoupled from user models
 */
export interface MoodState {
    moodId: MoodId;
    intensity: number;
    timestamp: Date;
}
/**
 * Combines persona traits with current mood state
 * Used for mood-aware persona analysis and recommendations
 */
export interface PersonaMoodContext {
    traits: PersonaTraits;
    mood: MoodState | null;
}
/**
 * Maps UserMoodEntry to PersonaMoodContext
 * Pure mapping layer with no interpretation logic
 *
 * @param traits - Derived persona traits
 * @param moodEntry - Optional user mood entry from the mood system
 * @returns PersonaMoodContext with traits and mood state
 */
export declare function mapMoodToPersonaContext(traits: PersonaTraits, moodEntry?: UserMoodEntry): PersonaMoodContext;
/**
 * Helper function to create MoodState directly
 * Useful for testing or when mood data comes from different sources
 */
export declare function createMoodState(moodId: MoodId, intensity: number, timestamp?: Date): MoodState;
/**
 * Helper function to check if mood is recent
 * Determines if mood data is still relevant for persona analysis
 */
export declare function isMoodRecent(moodState: MoodState, maxAgeHours?: number): boolean;
/**
 * Helper function to get mood intensity category
 * Categorizes intensity into Low/Medium/High for easier analysis
 */
export declare function getMoodIntensityCategory(intensity: number): "Low" | "Medium" | "High";
