export interface Mood {
    id: string;
    name: string;
    description: string;
    emoji: string;
    icon: string;
    color: string;
    intensity: number;
    associatedGenres: string[];
}
/**
 * Enhanced Mood System - User-Selectable Moods
 *
 * These moods are distinct from genres and represent emotional/mental states
 * that influence game preferences and recommendation scoring.
 */
export interface EnhancedMood extends Mood {
    energyLevel: number;
    socialRequirement: number;
    cognitiveLoad: number;
    timeCommitment: number;
    genreWeights: Record<string, number>;
    tagWeights: Record<string, number>;
    platformBias: Record<string, number>;
    compatibleMoods: string[];
    conflictingMoods: string[];
    sessionPatterns: {
        preferredSessionLength: number;
        likelihoodOfMultiplayer: number;
        toleranceForDifficulty: number;
        desireForNovelty: number;
    };
}
export declare const ENHANCED_MOODS: readonly EnhancedMood[];
export type EnhancedMoodId = typeof ENHANCED_MOODS[number]['id'];
/**
 * Hybrid mood combinations for sophisticated recommendations
 */
export interface MoodCombination {
    primaryMood: EnhancedMoodId;
    secondaryMood?: EnhancedMoodId;
    intensity: number;
    context: string;
}
/**
 * Pre-defined mood combinations that work well together
 */
export declare const MOOD_COMBINATIONS: readonly MoodCombination[];
