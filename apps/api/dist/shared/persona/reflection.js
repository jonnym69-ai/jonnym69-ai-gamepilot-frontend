"use strict";
// Reflection Layer
// Functions for building identity reflection from traits and mood
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildReflection = buildReflection;
/**
 * Build identity reflection from traits and current mood
 * Real narrative logic for persona reflection generation
 */
function buildReflection(traits, currentMood) {
    // Convert traits object to array of [name, value] and sort descending
    const traitEntries = Object.entries(traits).sort(([, a], [, b]) => b - a);
    // Find dominant traits (value > 0.3, take top 2-3)
    const dominantTraits = traitEntries
        .filter(([, value]) => value > 0.3)
        .slice(0, 3)
        .map(([name]) => name);
    // Generate identity summary based on dominant traits
    let identitySummary;
    if (dominantTraits.length === 0) {
        identitySummary = "Your gaming identity is still taking shape.";
    }
    else {
        // Format trait names for readable sentence
        const traitNames = dominantTraits.map(name => name.charAt(0).toUpperCase() + name.slice(1));
        if (traitNames.length === 1) {
            identitySummary = `You play like a ${traitNames[0]}.`;
        }
        else if (traitNames.length === 2) {
            identitySummary = `You play like a ${traitNames[0]} and ${traitNames[1]}.`;
        }
        else {
            identitySummary = `You play like a ${traitNames[0]}, ${traitNames[1]}, and ${traitNames[2]}.`;
        }
    }
    // Set recommendation context based on mood
    const recommendationContext = currentMood === "neutral"
        ? "We'll start with balanced recommendations while we learn more about you."
        : "We'll tune recommendations to match your current mood.";
    return {
        identitySummary,
        dominantTraits,
        currentMood,
        recommendationContext
    };
}
//# sourceMappingURL=reflection.js.map