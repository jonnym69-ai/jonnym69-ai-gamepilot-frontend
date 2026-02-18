import type { Game } from '@gamepilot/types';
import type { PlayerIdentity, GameRecommendation, RecommendationContext } from './types';
import { type EnhancedMoodId } from '@gamepilot/static-data';
import { type MoodFilterContext } from './moodFilterPipeline';
/**
 * Enhanced Recommendation Engine with Mood-Genre Hybrid Logic
 *
 * This extends the base recommendation engine to support sophisticated
 * mood-based filtering while maintaining clean separation between
 * moods and genres.
 */
export interface EnhancedRecommendationContext extends RecommendationContext {
    moodContext?: MoodFilterContext;
    userGenreAffinity?: Record<string, number>;
    timeAvailable?: number;
    preferredPlatform?: string;
    includeHybridRecommendations?: boolean;
    maxRecommendations?: number;
    minScoreThreshold?: number;
}
export interface EnhancedGameRecommendation extends GameRecommendation {
    moodScore: number;
    hybridScore?: number;
    moodInfluence: {
        primary: number;
        secondary?: number;
        genre: number;
        tags: number;
        platform: number;
        hybrid: number;
    };
    moodCompatibility: {
        energy: number;
        social: number;
        cognitive: number;
        time: number;
    };
    moodCombination?: {
        primary: string;
        secondary?: string;
        synergy: number;
        reasoning: string;
    };
}
export declare class EnhancedRecommendationEngine {
    /**
     * Get enhanced mood-aware recommendations
     */
    static getEnhancedRecommendations(identity: PlayerIdentity, context: EnhancedRecommendationContext, availableGames: Game[]): EnhancedGameRecommendation[];
    /**
     * Create an enhanced recommendation with detailed mood analysis
     */
    private static createEnhancedRecommendation;
    /**
     * Calculate mood compatibility metrics
     */
    private static calculateMoodCompatibility;
    /**
     * Analyze game's characteristic profile
     */
    private static analyzeGameProfile;
    /**
     * Calculate compatibility score between two values
     */
    private static calculateCompatibilityScore;
    /**
     * Analyze mood combination synergy
     */
    private static analyzeMoodCombination;
    /**
     * Calculate how well a game aligns with a mood
     */
    private static calculateMoodAlignment;
    /**
     * Get primary genre from game
     */
    private static getPrimaryGenre;
    /**
     * Calculate playstyle match
     */
    private static calculatePlaystyleMatch;
    /**
     * Calculate social match
     */
    private static calculateSocialMatch;
    /**
     * Estimate playtime
     */
    private static estimatePlaytime;
    /**
     * Calculate standard score (fallback when no mood context)
     */
    private static calculateStandardScore;
    /**
     * Generate standard reasoning
     */
    private static generateStandardReasoning;
    /**
     * Calculate standard mood influence
     */
    private static calculateStandardMoodInfluence;
    /**
     * Get mood-based recommendations for specific scenarios
     */
    static getMoodBasedRecommendations(moodId: EnhancedMoodId, games: Game[], options?: {
        secondaryMood?: EnhancedMoodId;
        intensity?: number;
        limit?: number;
        userContext?: Partial<EnhancedRecommendationContext>;
    }): EnhancedGameRecommendation[];
}
