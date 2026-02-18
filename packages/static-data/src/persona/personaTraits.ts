// GamePilot Persona Trait Schema
// Canonical trait definitions for player personality analysis

// Persona Archetype IDs - aligned with existing PlaystyleModel archetypes
export type PersonaArchetypeId = 
  | "Achiever" 
  | "Explorer" 
  | "Socializer" 
  | "Competitor" 
  | "Strategist" 
  | "Creative" 
  | "Casual" 
  | "Specialist"

// Persona intensity levels - describes energy and engagement
export type PersonaIntensity = 
  | "Low" 
  | "Medium" 
  | "High"

// Persona pacing preferences - describes session patterns
export type PersonaPacing = 
  | "Burst"    // Short, intense sessions
  | "Flow"     // Moderate, steady sessions  
  | "Marathon" // Long, extended sessions

// Persona risk profile - describes approach to new challenges
export type PersonaRiskProfile = 
  | "Comfort"       // Prefers familiar experiences
  | "Balanced"      // Mix of familiar and new
  | "Experimental"  // Seeks novel experiences

// Persona social style - describes multiplayer preferences
export type PersonaSocialStyle = 
  | "Solo"          // Prefers single-player experiences
  | "Coop"          // Prefers cooperative multiplayer
  | "Competitive"   // Prefers competitive multiplayer

// Complete persona traits interface
export interface PersonaTraits {
  // Core archetype identification
  archetypeId: PersonaArchetypeId
  
  // Behavioral dimensions
  intensity: PersonaIntensity
  pacing: PersonaPacing
  riskProfile: PersonaRiskProfile
  socialStyle: PersonaSocialStyle
  
  // Confidence score for trait reliability
  confidence: number // 0–1 scale
}

// Helper type for all persona trait unions
export type PersonaTraitUnion = 
  | PersonaArchetypeId
  | PersonaIntensity
  | PersonaPacing
  | PersonaRiskProfile
  | PersonaSocialStyle

// All types are already exported above with their declarations
