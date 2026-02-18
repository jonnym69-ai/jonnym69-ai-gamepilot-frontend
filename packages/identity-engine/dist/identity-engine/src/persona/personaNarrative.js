"use strict";
// GamePilot Persona Narrative Layer
// Transforms PersonaTraits + MoodState into narrative identity summaries
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPersonaNarrative = buildPersonaNarrative;
exports.getNarrativeStyle = getNarrativeStyle;
/**
 * Builds a narrative summary from persona traits and mood state
 * Uses deterministic template assembly - no AI or randomness
 */
function buildPersonaNarrative(input) {
    const { traits, mood } = input;
    // Determine narrative tone based on mood
    const tone = determineNarrativeTone(mood);
    // Generate narrative summary using templates
    const summary = generateNarrativeSummary(traits, mood);
    return {
        summary,
        tone
    };
}
/**
 * Determines narrative tone based on current mood
 */
function determineNarrativeTone(mood) {
    if (!mood) {
        return "Reflective";
    }
    const { moodId } = mood;
    // Map mood IDs to narrative tones
    if (["chill", "story", "creative"].includes(moodId)) {
        return "Calm";
    }
    if (["energetic", "social", "exploratory"].includes(moodId)) {
        return "Hyped";
    }
    if (["competitive", "focused"].includes(moodId)) {
        return "Competitive";
    }
    // Default to comfort for other moods or unknown moods
    return "Comfort";
}
/**
 * Generates narrative summary using template assembly
 */
function generateNarrativeSummary(traits, mood) {
    const { archetypeId, pacing, riskProfile } = traits;
    // Get human-readable descriptions
    const archetypeDesc = getArchetypeDescription(archetypeId);
    const pacingDesc = getPacingDescription(pacing);
    const riskDesc = getRiskDescription(riskProfile);
    const moodDesc = mood ? getMoodDescription(mood.moodId) : null;
    // Build narrative template based on tone
    if (moodDesc) {
        // Template with mood: "You're a {archetype} who prefers {pacing} sessions. 
        // Currently feeling {mood}, you lean toward {risk} choices."
        return `You're a ${archetypeDesc} who prefers ${pacingDesc} sessions. Currently feeling ${moodDesc}, you lean toward ${riskDesc} choices.`;
    }
    else {
        // Template without mood: "You're a {archetype} who thrives in {pacing} sessions 
        // with a {risk} approach to gaming."
        return `You're a ${archetypeDesc} who thrives in ${pacingDesc} sessions with a ${riskDesc} approach to gaming.`;
    }
}
/**
 * Gets human-readable archetype description
 */
function getArchetypeDescription(archetypeId) {
    const descriptions = {
        "Achiever": "goal-oriented achiever",
        "Explorer": "curious explorer",
        "Socializer": "social gamer",
        "Competitor": "competitive player",
        "Strategist": "strategic thinker",
        "Creative": "creative builder",
        "Casual": "relaxed gamer",
        "Specialist": "dedicated specialist"
    };
    return descriptions[archetypeId] || "versatile player";
}
/**
 * Gets human-readable pacing description
 */
function getPacingDescription(pacing) {
    const descriptions = {
        "Burst": "short, intense",
        "Flow": "steady, balanced",
        "Marathon": "long, immersive"
    };
    return descriptions[pacing] || "moderate";
}
/**
 * Gets human-readable risk profile description
 */
function getRiskDescription(riskProfile) {
    const descriptions = {
        "Comfort": "comfortable and familiar",
        "Balanced": "balanced and varied",
        "Experimental": "experimental and bold"
    };
    return descriptions[riskProfile] || "thoughtful";
}
/**
 * Gets human-readable mood description
 */
function getMoodDescription(moodId) {
    const descriptions = {
        "chill": "chill and relaxed",
        "competitive": "competitive and driven",
        "story": "story-focused and immersed",
        "creative": "creative and inspired",
        "social": "social and connected",
        "focused": "focused and determined",
        "energetic": "energetic and excited",
        "exploratory": "exploratory and curious"
    };
    return descriptions[moodId] || "in a thoughtful mood";
}
/**
 * Helper function to get narrative style based on intensity
 */
function getNarrativeStyle(intensity) {
    switch (intensity) {
        case "Low":
            return "concise";
        case "Medium":
            return "detailed";
        case "High":
            return "elaborate";
        default:
            return "detailed";
    }
}
// All types are already exported above with their declarations
