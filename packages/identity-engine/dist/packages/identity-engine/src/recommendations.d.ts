import type { PlayerIdentity, GameRecommendation, RecommendationContext } from './types';
export declare class RecommendationEngine {
    /**
     * Get personalized game recommendations
     */
    getRecommendations(identity: PlayerIdentity, context: RecommendationContext, availableGames: any[]): GameRecommendation[];
    /**
     * Calculate overall recommendation score
     */
    private calculateRecommendationScore;
    /**
     * Calculate how well game matches current mood
     */
    private calculateMoodMatch;
    /**
     * Calculate how well game matches user's playstyle
     */
    private calculatePlaystyleMatch;
    /**
     * Calculate genre affinity score
     */
    private calculateGenreMatch;
    /**
     * Calculate social context match
     */
    private calculateSocialMatch;
    /**
     * Calculate time availability match
     */
    private calculateTimeMatch;
    /**
     * Generate reasons for recommendation
     */
    private generateReasons;
    /**
     * Estimate playtime for a game based on user patterns
     */
    private estimatePlaytime;
    /**
     * Get tags associated with a mood
     */
    private getMoodTags;
    /**
     * Check if game matches a specific trait
     */
    private gameMatchesTrait;
}
