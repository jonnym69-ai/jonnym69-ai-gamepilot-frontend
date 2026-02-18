"use strict";
// GamePilot Persona Snapshot API
// Orchestrates trait extraction, mood mapping, and narrative generation
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPersonaSnapshot = buildPersonaSnapshot;
exports.createMinimalPersonaSnapshot = createMinimalPersonaSnapshot;
exports.isHighConfidenceSnapshot = isHighConfidenceSnapshot;
exports.getSnapshotSummary = getSnapshotSummary;
const traitExtractor_1 = require("./traitExtractor");
const personaMoodMapping_1 = require("./personaMoodMapping");
const personaNarrative_1 = require("./personaNarrative");
/**
 * Builds a complete persona snapshot from raw signals and mood data
 * Orchestrates the entire persona engine pipeline
 *
 * @param input - Raw player signals and optional mood entry
 * @returns Complete persona snapshot with traits, mood, narrative, and confidence
 * @throws Error if signals are missing or invalid
 */
function buildPersonaSnapshot(input) {
    // Validate input signals
    if (!input.signals) {
        throw new Error("PersonaSnapshotInput.signals is required");
    }
    // Validate signals structure
    validateRawPlayerSignals(input.signals);
    try {
        // Step 1: Extract persona traits from raw signals
        const traits = (0, traitExtractor_1.derivePersonaTraits)(input.signals);
        // Step 2: Map mood entry to mood state within persona context
        const { mood } = (0, personaMoodMapping_1.mapMoodToPersonaContext)(traits, input.moodEntry || undefined);
        // Step 3: Build narrative from traits and mood
        const narrative = (0, personaNarrative_1.buildPersonaNarrative)({ traits, mood });
        // Step 4: Extract confidence from traits
        const confidence = traits.confidence;
        // Step 5: Return unified snapshot
        return {
            traits,
            mood,
            narrative,
            confidence
        };
    }
    catch (error) {
        // Re-throw with additional context
        throw new Error(`Failed to build persona snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Validates RawPlayerSignals structure
 * Ensures required fields are present and valid
 */
function validateRawPlayerSignals(signals) {
    const requiredFields = [
        'playtimeByGenre',
        'averageSessionLengthMinutes',
        'sessionsPerWeek',
        'difficultyPreference',
        'multiplayerRatio',
        'completionRate'
    ];
    // Check required fields exist
    for (const field of requiredFields) {
        if (!(field in signals)) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    // Validate field types and ranges
    if (typeof signals.playtimeByGenre !== 'object' || signals.playtimeByGenre === null) {
        throw new Error('playtimeByGenre must be a valid object');
    }
    if (typeof signals.averageSessionLengthMinutes !== 'number' || signals.averageSessionLengthMinutes < 0) {
        throw new Error('averageSessionLengthMinutes must be a non-negative number');
    }
    if (typeof signals.sessionsPerWeek !== 'number' || signals.sessionsPerWeek < 0) {
        throw new Error('sessionsPerWeek must be a non-negative number');
    }
    const validDifficulties = ["Relaxed", "Normal", "Hard", "Brutal"];
    if (!validDifficulties.includes(signals.difficultyPreference)) {
        throw new Error(`difficultyPreference must be one of: ${validDifficulties.join(', ')}`);
    }
    if (typeof signals.multiplayerRatio !== 'number' || signals.multiplayerRatio < 0 || signals.multiplayerRatio > 1) {
        throw new Error('multiplayerRatio must be a number between 0 and 1');
    }
    if (typeof signals.completionRate !== 'number' || signals.completionRate < 0 || signals.completionRate > 1) {
        throw new Error('completionRate must be a number between 0 and 1');
    }
}
/**
 * Helper function to create a minimal persona snapshot for testing
 * Uses default values for optional fields
 */
function createMinimalPersonaSnapshot(partialSignals) {
    // Create default signals with minimal required data
    const defaultSignals = {
        playtimeByGenre: {},
        averageSessionLengthMinutes: 60,
        sessionsPerWeek: 3,
        difficultyPreference: "Normal",
        multiplayerRatio: 0.3,
        lateNightRatio: 0.2,
        completionRate: 0.5,
        ...partialSignals
    };
    return buildPersonaSnapshot({
        signals: defaultSignals,
        moodEntry: null
    });
}
/**
 * Helper function to check if a persona snapshot is high-confidence
 * Returns true if confidence >= 0.7
 */
function isHighConfidenceSnapshot(snapshot) {
    return snapshot.confidence >= 0.7;
}
/**
 * Helper function to get snapshot summary
 * Returns a concise summary of the persona snapshot
 */
function getSnapshotSummary(snapshot) {
    const { archetypeId, intensity, pacing } = snapshot.traits;
    const moodLabel = snapshot.mood ? snapshot.mood.moodId : 'no mood';
    const confidence = Math.round(snapshot.confidence * 100);
    return `${archetypeId} (${intensity}, ${pacing}) - ${moodLabel} - ${confidence}% confidence`;
}
// All types are already exported above with their declarations
