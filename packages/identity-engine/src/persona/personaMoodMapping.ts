// GamePilot Persona Mood Integration Layer
// Connects PersonaTraits with the existing mood system

import { MoodId } from "../../../static-data/src/moods"
import { UserMoodEntry } from "../../../shared/src/models/user"
import { PersonaTraits } from "../../../static-data/src/persona/personaTraits"

/**
 * Lightweight mood state interface for Persona Engine
 * Mirrors UserMoodEntry but keeps Persona Engine decoupled from user models
 */
export interface MoodState {
  moodId: MoodId
  intensity: number // 1–10 scale
  timestamp: Date
}

/**
 * Combines persona traits with current mood state
 * Used for mood-aware persona analysis and recommendations
 */
export interface PersonaMoodContext {
  traits: PersonaTraits
  mood: MoodState | null
}

/**
 * Maps UserMoodEntry to PersonaMoodContext
 * Pure mapping layer with no interpretation logic
 * 
 * @param traits - Derived persona traits
 * @param moodEntry - Optional user mood entry from the mood system
 * @returns PersonaMoodContext with traits and mood state
 */
export function mapMoodToPersonaContext(
  traits: PersonaTraits,
  moodEntry?: UserMoodEntry
): PersonaMoodContext {
  // If no mood entry provided, return context with null mood
  if (!moodEntry) {
    return {
      traits,
      mood: null
    }
  }

  // Convert UserMoodEntry to MoodState (lightweight interface)
  const moodState: MoodState = {
    moodId: moodEntry.moodId,
    intensity: moodEntry.intensity,
    timestamp: moodEntry.timestamp
  }

  return {
    traits,
    mood: moodState
  }
}

/**
 * Helper function to create MoodState directly
 * Useful for testing or when mood data comes from different sources
 */
export function createMoodState(
  moodId: MoodId,
  intensity: number,
  timestamp: Date = new Date()
): MoodState {
  return {
    moodId,
    intensity: Math.max(1, Math.min(10, intensity)), // Clamp to 1-10 range
    timestamp
  }
}

/**
 * Helper function to check if mood is recent
 * Determines if mood data is still relevant for persona analysis
 */
export function isMoodRecent(
  moodState: MoodState,
  maxAgeHours: number = 24
): boolean {
  const now = new Date()
  const moodAge = now.getTime() - moodState.timestamp.getTime()
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000
  return moodAge <= maxAgeMs
}

/**
 * Helper function to get mood intensity category
 * Categorizes intensity into Low/Medium/High for easier analysis
 */
export function getMoodIntensityCategory(intensity: number): "Low" | "Medium" | "High" {
  if (intensity <= 3) return "Low"
  if (intensity <= 7) return "Medium"
  return "High"
}

// All types are already exported above with their declarations
