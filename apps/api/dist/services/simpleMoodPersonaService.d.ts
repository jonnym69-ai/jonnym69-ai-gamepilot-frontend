import type { EnhancedMoodId } from '@gamepilot/static-data';
/**
 * Simple Mood-Persona Service (Fallback Implementation)
 *
 * This is a temporary fallback service to provide basic mood-persona functionality
 * while the full identity-engine package build issues are resolved.
 */
export declare class SimpleMoodPersonaService {
    private moodHistory;
    private userProfiles;
    /**
     * Process a mood selection event
     */
    processMoodSelection(userId: string, moodData: {
        primaryMood: EnhancedMoodId;
        secondaryMood?: EnhancedMoodId;
        intensity: number;
        context: any;
    }): Promise<any>;
    /**
     * Process a user action
     */
    processUserAction(userId: string, actionData: {
        type: string;
        gameId: string;
        gameTitle: string;
        moodContext: any;
        metadata: any;
    }): Promise<any>;
    /**
     * Get mood suggestions for a user
     */
    getMoodSuggestions(userId: string, context?: any): Promise<any[]>;
    /**
     * Generate personalized recommendations
     */
    generatePersonalizedRecommendations(userId: string, primaryMood: EnhancedMoodId, secondaryMood?: EnhancedMoodId, limit?: number): Promise<any[]>;
    /**
     * Get user profile
     */
    getUserProfile(userId: string): any;
    /**
     * Update user profile based on mood selection
     */
    private updateUserProfile;
    /**
     * Calculate recommendation score for a game
     */
    private calculateRecommendationScore;
    /**
     * Get mood-game compatibility score
     */
    private getMoodGameScore;
    /**
     * Get history-based score
     */
    private getHistoryScore;
    /**
     * Generate recommendation reasons
     */
    private generateRecommendationReasons;
    /**
     * Estimate playtime
     */
    private estimatePlaytime;
    /**
     * Recommend difficulty
     */
    private recommendDifficulty;
    /**
     * Get available games for a user
     */
    private getAvailableGames;
    /**
     * Get game by ID (placeholder)
     */
    private getGameById;
    /**
     * Get mood statistics for a user
     */
    getMoodStatistics(userId: string): any;
    /**
     * Get user action statistics
     */
    getActionStatistics(userId: string): any;
}
//# sourceMappingURL=simpleMoodPersonaService.d.ts.map