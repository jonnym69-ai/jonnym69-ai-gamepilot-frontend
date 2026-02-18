import { PersonaTraits } from "../../../static-data/src/persona/personaTraits";
import { MoodState } from "./personaMoodMapping";
/**
 * Narrative tone categories for persona summaries
 */
export type NarrativeTone = "Calm" | "Hyped" | "Reflective" | "Competitive" | "Comfort";
/**
 * Input for narrative generation
 */
export interface PersonaNarrativeInput {
    traits: PersonaTraits;
    mood: MoodState | null;
}
/**
 * Output of narrative generation
 */
export interface PersonaNarrativeOutput {
    summary: string;
    tone: NarrativeTone;
}
/**
 * Builds a narrative summary from persona traits and mood state
 * Uses deterministic template assembly - no AI or randomness
 */
export declare function buildPersonaNarrative(input: PersonaNarrativeInput): PersonaNarrativeOutput;
/**
 * Helper function to get narrative style based on intensity
 */
export declare function getNarrativeStyle(intensity: string): "concise" | "detailed" | "elaborate";
