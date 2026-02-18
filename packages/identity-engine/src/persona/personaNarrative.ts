// GamePilot Persona Narrative Layer
// Transforms PersonaTraits + MoodState into narrative identity summaries

import { PersonaTraits } from "../../../static-data/src/persona/personaTraits"
import { MoodState } from "./personaMoodMapping"
import { MoodId } from "../../../static-data/src/moods"

/**
 * Narrative tone categories for persona summaries
 */
export type NarrativeTone =
  | "Calm"
  | "Hyped"
  | "Reflective"
  | "Competitive"
  | "Comfort"

/**
 * Input for narrative generation
 */
export interface PersonaNarrativeInput {
  traits: PersonaTraits
  mood: MoodState | null
}

/**
 * Output of narrative generation
 */
export interface PersonaNarrativeOutput {
  summary: string
  tone: NarrativeTone
}

/**
 * Builds a narrative summary from persona traits and mood state
 * Uses deterministic template assembly - no AI or randomness
 */
export function buildPersonaNarrative(
  input: PersonaNarrativeInput
): PersonaNarrativeOutput {
  const { traits, mood } = input
  
  // Determine narrative tone based on mood
  const tone = determineNarrativeTone(mood)
  
  // Generate narrative summary using templates
  const summary = generateNarrativeSummary(traits, mood)
  
  return {
    summary,
    tone
  }
}

/**
 * Determines narrative tone based on current mood
 */
function determineNarrativeTone(mood: MoodState | null): NarrativeTone {
  if (!mood) {
    return "Reflective"
  }
  
  const { moodId } = mood
  
  // Map mood IDs to narrative tones
  if (["chill", "story", "creative"].includes(moodId)) {
    return "Calm"
  }
  
  if (["energetic", "social", "exploratory"].includes(moodId)) {
    return "Hyped"
  }
  
  if (["competitive", "focused"].includes(moodId)) {
    return "Competitive"
  }
  
  // Default to comfort for other moods or unknown moods
  return "Comfort"
}

/**
 * Generates narrative summary using template assembly
 */
function generateNarrativeSummary(
  traits: PersonaTraits,
  mood: MoodState | null
): string {
  const { archetypeId, pacing, riskProfile } = traits
  
  // Get human-readable descriptions
  const archetypeDesc = getArchetypeDescription(archetypeId)
  const pacingDesc = getPacingDescription(pacing)
  const riskDesc = getRiskDescription(riskProfile)
  const moodDesc = mood ? getMoodDescription(mood.moodId) : null
  
  // Build narrative template based on tone
  if (moodDesc) {
    // Template with mood: "You're a {archetype} who prefers {pacing} sessions. 
    // Currently feeling {mood}, you lean toward {risk} choices."
    return `You're a ${archetypeDesc} who prefers ${pacingDesc} sessions. Currently feeling ${moodDesc}, you lean toward ${riskDesc} choices.`
  } else {
    // Template without mood: "You're a {archetype} who thrives in {pacing} sessions 
    // with a {risk} approach to gaming."
    return `You're a ${archetypeDesc} who thrives in ${pacingDesc} sessions with a ${riskDesc} approach to gaming.`
  }
}

/**
 * Gets human-readable archetype description
 */
function getArchetypeDescription(archetypeId: string): string {
  const descriptions: Record<string, string> = {
    "Achiever": "goal-oriented achiever",
    "Explorer": "curious explorer",
    "Socializer": "social gamer",
    "Competitor": "competitive player",
    "Strategist": "strategic thinker",
    "Creative": "creative builder",
    "Casual": "relaxed gamer",
    "Specialist": "dedicated specialist"
  }
  
  return descriptions[archetypeId] || "versatile player"
}

/**
 * Gets human-readable pacing description
 */
function getPacingDescription(pacing: string): string {
  const descriptions: Record<string, string> = {
    "Burst": "short, intense",
    "Flow": "steady, balanced",
    "Marathon": "long, immersive"
  }
  
  return descriptions[pacing] || "moderate"
}

/**
 * Gets human-readable risk profile description
 */
function getRiskDescription(riskProfile: string): string {
  const descriptions: Record<string, string> = {
    "Comfort": "comfortable and familiar",
    "Balanced": "balanced and varied",
    "Experimental": "experimental and bold"
  }
  
  return descriptions[riskProfile] || "thoughtful"
}

/**
 * Gets human-readable mood description
 */
function getMoodDescription(moodId: MoodId): string {
  const descriptions: Record<string, string> = {
    "chill": "chill and relaxed",
    "competitive": "competitive and driven",
    "story": "story-focused and immersed",
    "creative": "creative and inspired",
    "social": "social and connected",
    "focused": "focused and determined",
    "energetic": "energetic and excited",
    "exploratory": "exploratory and curious"
  }
  
  return descriptions[moodId] || "in a thoughtful mood"
}

/**
 * Helper function to get narrative style based on intensity
 */
export function getNarrativeStyle(intensity: string): "concise" | "detailed" | "elaborate" {
  switch (intensity) {
    case "Low":
      return "concise"
    case "Medium":
      return "detailed"
    case "High":
      return "elaborate"
    default:
      return "detailed"
  }
}

// All types are already exported above with their declarations
