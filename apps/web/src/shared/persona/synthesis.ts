/**
 * Persona synthesis utilities
 * Builds persona signals and traits from user data
 */

export interface PersonaSignals {
  dominantMoods: string[]
  playPatterns: Record<string, number>
  timePreferences: Record<string, number>
  genreAffinities: Record<string, number>
}

export interface PersonaTraits {
  archetypeId: string
  confidence: number
  traits: string[]
  motivations: string[]
}

export function buildPersonaSignals(data: any): PersonaSignals {
  return {
    dominantMoods: data.moods || [],
    playPatterns: data.playPatterns || {},
    timePreferences: data.timePreferences || {},
    genreAffinities: data.genreAffinities || {}
  }
}

export function buildPersonaTraits(data: any): PersonaTraits {
  return {
    archetypeId: data.archetypeId || 'explorer',
    confidence: data.confidence || 0.5,
    traits: data.traits || [],
    motivations: data.motivations || []
  }
}
