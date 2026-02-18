import { RawPlayerSignals } from "./traitExtractor";
import { MoodState } from "./personaMoodMapping";
import { PersonaNarrativeOutput } from "./personaNarrative";
import { PersonaTraits } from "../../../static-data/src/persona/personaTraits";
import { UserMoodEntry } from "../../../shared/src/models/user";
/**
 * Input for persona snapshot generation
 * Combines raw player signals with optional mood entry
 */
export interface PersonaSnapshotInput {
    signals: RawPlayerSignals;
    moodEntry?: UserMoodEntry | null;
}
/**
 * Complete persona snapshot with all derived information
 * Unified output combining traits, mood, narrative, and confidence
 */
export interface PersonaSnapshot {
    traits: PersonaTraits;
    mood: MoodState | null;
    narrative: PersonaNarrativeOutput;
    confidence: number;
}
/**
 * Builds a complete persona snapshot from raw signals and mood data
 * Orchestrates the entire persona engine pipeline
 *
 * @param input - Raw player signals and optional mood entry
 * @returns Complete persona snapshot with traits, mood, narrative, and confidence
 * @throws Error if signals are missing or invalid
 */
export declare function buildPersonaSnapshot(input: PersonaSnapshotInput): PersonaSnapshot;
/**
 * Helper function to create a minimal persona snapshot for testing
 * Uses default values for optional fields
 */
export declare function createMinimalPersonaSnapshot(partialSignals: Partial<RawPlayerSignals>): PersonaSnapshot;
/**
 * Helper function to check if a persona snapshot is high-confidence
 * Returns true if confidence >= 0.7
 */
export declare function isHighConfidenceSnapshot(snapshot: PersonaSnapshot): boolean;
/**
 * Helper function to get snapshot summary
 * Returns a concise summary of the persona snapshot
 */
export declare function getSnapshotSummary(snapshot: PersonaSnapshot): string;
