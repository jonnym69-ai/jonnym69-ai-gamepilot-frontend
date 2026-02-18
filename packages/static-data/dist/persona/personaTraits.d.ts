export type PersonaArchetypeId = "Achiever" | "Explorer" | "Socializer" | "Competitor" | "Strategist" | "Creative" | "Casual" | "Specialist";
export type PersonaIntensity = "Low" | "Medium" | "High";
export type PersonaPacing = "Burst" | "Flow" | "Marathon";
export type PersonaRiskProfile = "Comfort" | "Balanced" | "Experimental";
export type PersonaSocialStyle = "Solo" | "Coop" | "Competitive";
export interface PersonaTraits {
    archetypeId: PersonaArchetypeId;
    intensity: PersonaIntensity;
    pacing: PersonaPacing;
    riskProfile: PersonaRiskProfile;
    socialStyle: PersonaSocialStyle;
    confidence: number;
}
export type PersonaTraitUnion = PersonaArchetypeId | PersonaIntensity | PersonaPacing | PersonaRiskProfile | PersonaSocialStyle;
