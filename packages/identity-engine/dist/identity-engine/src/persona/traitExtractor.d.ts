import { PersonaTraits } from "../../../static-data/src/persona/personaTraits";
export interface RawPlayerSignals {
    playtimeByGenre: Record<string, number>;
    averageSessionLengthMinutes: number;
    sessionsPerWeek: number;
    difficultyPreference: "Relaxed" | "Normal" | "Hard" | "Brutal";
    multiplayerRatio: number;
    lateNightRatio: number;
    completionRate: number;
}
/**
 * Derive persona traits from raw player signals using deterministic rules
 */
export declare function derivePersonaTraits(signals: RawPlayerSignals): PersonaTraits;
