import { type MoodId } from '@gamepilot/static-data'

/**
 * Mood engine for persona system
 * Builds mood state from various inputs
 */

export interface MoodState {
  currentMood?: MoodId
  intensity: number
  secondaryMood?: MoodId
  history: Array<{
    mood: MoodId
    timestamp: Date
    intensity: number
  }>
}

export function buildMoodState(data: any): MoodState {
  return {
    currentMood: data.currentMood,
    intensity: data.intensity || 50,
    secondaryMood: data.secondaryMood,
    history: data.history || []
  }
}
