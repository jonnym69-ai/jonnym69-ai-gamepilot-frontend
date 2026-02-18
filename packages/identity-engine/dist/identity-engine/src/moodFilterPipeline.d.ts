import type { Game } from '@gamepilot/types';
import { type EnhancedMoodId, type MoodCombination } from '@gamepilot/static-data';
/**
 * Enhanced Mood Filter Pipeline
 *
 * This system provides sophisticated mood-based filtering that maintains
 * clean separation between moods and genres while enabling hybrid
 * recommendation logic.
 */
export interface MoodFilterContext {
    primaryMood: EnhancedMoodId;
    secondaryMood?: EnhancedMoodId;
    intensity: number;
    userGenreAffinity?: Record<string, number>;
    timeAvailable?: number;
    socialContext?: 'solo' | 'duo' | 'group' | 'any';
    platform?: string;
}
export interface MoodFilterResult {
    games: Game[];
    scores: Record<string, number>;
    reasoning: Record<string, string>;
    moodInfluence: Record<string, {
        primary: number;
        secondary?: number;
        genre: number;
        tags: number;
        platform: number;
        hybrid: number;
    }>;
}
export declare class EnhancedMoodFilter {
    /**
     * Filter games based on mood context with hybrid recommendation logic
     */
    static filterByMood(games: Game[], context: MoodFilterContext): MoodFilterResult;
    /**
     * Calculate mood compatibility score for a game
     */
    private static calculateMoodScore;
    /**
     * Calculate score for a single mood
     */
    private static calculateSingleMoodScore;
    /**
     * Calculate hybrid mood combination bonus
     */
    private static calculateHybridBonus;
    /**
     * Calculate genre compatibility with mood
     */
    private static calculateGenreCompatibility;
    /**
     * Calculate tag compatibility with mood
     */
    private static calculateTagCompatibility;
    /**
     * Calculate platform compatibility with mood
     */
    private static calculatePlatformCompatibility;
    /**
     * Calculate energy level compatibility
     */
    private static calculateEnergyCompatibility;
    /**
     * Calculate social compatibility
     */
    private static calculateSocialCompatibility;
    /**
     * Calculate user genre affinity bonus
     */
    private static calculateGenreAffinityBonus;
    /**
     * Calculate contextual bonus
     */
    private static calculateContextBonus;
    /**
     * Calculate detailed mood influence breakdown
     */
    private static calculateMoodInfluence;
    /**
     * Generate human-readable reasoning for recommendations
     */
    private static generateReasoning;
    /**
     * Get recommended mood combinations based on context
     */
    static getRecommendedCombinations(primaryMood: EnhancedMoodId): MoodCombination[];
    /**
     * Validate mood combination compatibility
     */
    static validateCombination(primaryMood: EnhancedMoodId, secondaryMood: EnhancedMoodId): boolean;
}
