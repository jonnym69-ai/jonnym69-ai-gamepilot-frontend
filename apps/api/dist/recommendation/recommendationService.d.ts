import { MoodForecastingResult } from '@gamepilot/identity-engine';
import { Game } from '@gamepilot/types';
import { type MoodBasedRecommendationResult } from '@gamepilot/identity-engine';
import type { PersonaState } from '../persona/personaModel';
/**
 * Recommendation Service
 * Provides mood-based game recommendations using forecasting data
 */
export declare class RecommendationService {
    private recommendationEngine;
    constructor();
    /**
     * Get mood-based game recommendations for a user
     */
    getMoodBasedRecommendations(userId: string, forecastResult: MoodForecastingResult, userGames?: Game[], maxRecommendations?: number): Promise<MoodBasedRecommendationResult>;
    /**
     * Get personalized recommendations combining mood forecast with user preferences
     */
    getPersonalizedRecommendations(userId: string, forecastPeriod?: 'next_week' | 'next_month' | 'next_quarter', maxRecommendations?: number): Promise<MoodBasedRecommendationResult>;
    /**
     * Helper method to get user's game library
     */
    private getUserGameLibrary;
    /**
     * Get persona-driven recommendations
     */
    getPersonaBasedRecommendations(userId: string, personaState: PersonaState, userGames?: Game[], options?: {
        maxRecommendations: number;
        context?: {
            timeAvailable?: number;
            socialContext?: 'solo' | 'co-op' | 'pvp';
            intensity?: 'low' | 'medium' | 'high';
            excludeRecentlyPlayed?: boolean;
        };
    }): Promise<{
        recommendations: any[];
        generatedAt: Date;
        totalGames: number;
    }>;
    /**
     * Generate persona-specific explanation for recommendations
     */
    private generatePersonaExplanation;
    /**
     * Calculate how well recommendation matches user's intent
     */
    private calculateIntentMatch;
    /**
     * Calculate how well recommendation matches user's behavioral patterns
     */
    private calculateBehaviorMatch;
}
//# sourceMappingURL=recommendationService.d.ts.map