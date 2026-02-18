// GamePilot Persona Trait Extractor
// Deterministic trait extraction from raw player signals

import { PersonaTraits, PersonaArchetypeId } from "../../../static-data/src/persona/personaTraits"

// Raw player signals interface - input data for trait extraction
export interface RawPlayerSignals {
  playtimeByGenre: Record<string, number> // hours per genre
  averageSessionLengthMinutes: number
  sessionsPerWeek: number
  difficultyPreference: "Relaxed" | "Normal" | "Hard" | "Brutal"
  multiplayerRatio: number // 0–1
  lateNightRatio: number // 0–1
  completionRate: number // 0–1
}

/**
 * Derive persona traits from raw player signals using deterministic rules
 */
export function derivePersonaTraits(signals: RawPlayerSignals): PersonaTraits {
  // Extract each trait dimension using explainable rules
  const archetypeId = deriveArchetype(signals)
  const intensity = deriveIntensity(signals)
  const pacing = derivePacing(signals)
  const riskProfile = deriveRiskProfile(signals)
  const socialStyle = deriveSocialStyle(signals)
  const confidence = deriveConfidence(signals)

  return {
    archetypeId,
    intensity,
    pacing,
    riskProfile,
    socialStyle,
    confidence
  }
}

/**
 * Derive archetype based on completion patterns, genre preferences, and social behavior
 */
function deriveArchetype(signals: RawPlayerSignals): PersonaArchetypeId {
  const { completionRate, playtimeByGenre, multiplayerRatio, difficultyPreference } = signals

  // High completion rate -> Specialist (completionist behavior)
  if (completionRate > 0.7) {
    return "Specialist"
  }

  // Strategy genre dominance -> Strategist
  const strategyHours = playtimeByGenre["Strategy"] || 0
  const totalHours = Object.values(playtimeByGenre).reduce((sum, hours) => sum + hours, 0)
  if (totalHours > 0 && strategyHours / totalHours > 0.4) {
    return "Strategist"
  }

  // High multiplayer ratio -> Socializer
  if (multiplayerRatio > 0.6) {
    return "Socializer"
  }

  // Adventure/Open World dominance -> Explorer
  const adventureHours = (playtimeByGenre["Adventure"] || 0) + (playtimeByGenre["Open World"] || 0)
  if (totalHours > 0 && adventureHours / totalHours > 0.4) {
    return "Explorer"
  }

  // Brutal difficulty preference -> Competitor
  if (difficultyPreference === "Brutal") {
    return "Competitor"
  }

  // Default fallback -> Achiever
  return "Achiever"
}

/**
 * Derive intensity based on session frequency and duration
 */
function deriveIntensity(signals: RawPlayerSignals): "Low" | "Medium" | "High" {
  const { sessionsPerWeek, averageSessionLengthMinutes } = signals

  // High frequency OR long sessions -> High intensity
  if (sessionsPerWeek >= 5 || averageSessionLengthMinutes >= 120) {
    return "High"
  }

  // Low frequency AND short sessions -> Low intensity
  if (sessionsPerWeek <= 2 && averageSessionLengthMinutes < 60) {
    return "Low"
  }

  // Middle ground -> Medium intensity
  return "Medium"
}

/**
 * Derive pacing based on average session length
 */
function derivePacing(signals: RawPlayerSignals): "Burst" | "Flow" | "Marathon" {
  const { averageSessionLengthMinutes } = signals

  if (averageSessionLengthMinutes < 45) {
    return "Burst"    // Short, intense sessions
  } else if (averageSessionLengthMinutes > 120) {
    return "Marathon" // Long, extended sessions
  } else {
    return "Flow"     // Moderate, steady sessions
  }
}

/**
 * Derive risk profile based on difficulty preference
 */
function deriveRiskProfile(signals: RawPlayerSignals): "Comfort" | "Balanced" | "Experimental" {
  const { difficultyPreference } = signals

  switch (difficultyPreference) {
    case "Relaxed":
      return "Comfort"
    case "Normal":
      return "Balanced"
    case "Hard":
    case "Brutal":
      return "Experimental"
    default:
      return "Balanced"
  }
}

/**
 * Derive social style based on multiplayer ratio
 */
function deriveSocialStyle(signals: RawPlayerSignals): "Solo" | "Coop" | "Competitive" {
  const { multiplayerRatio } = signals

  if (multiplayerRatio < 0.2) {
    return "Solo"
  } else if (multiplayerRatio > 0.7) {
    return "Competitive"
  } else {
    return "Coop"
  }
}

/**
 * Derive confidence score based on data completeness
 */
function deriveConfidence(signals: RawPlayerSignals): number {
  // Check for null/undefined values in critical fields
  const fields = [
    signals.playtimeByGenre,
    signals.averageSessionLengthMinutes,
    signals.sessionsPerWeek,
    signals.difficultyPreference,
    signals.multiplayerRatio,
    signals.completionRate
  ]

  const nonNullFields = fields.filter(field => 
    field !== null && field !== undefined && 
    (typeof field !== 'object' || Object.keys(field).length > 0)
  ).length

  const completeness = nonNullFields / fields.length
  
  // Clamp confidence between 0.3 and 1.0
  return Math.max(0.3, Math.min(1.0, completeness))
}

// RawPlayerSignals is already exported above with the interface declaration
