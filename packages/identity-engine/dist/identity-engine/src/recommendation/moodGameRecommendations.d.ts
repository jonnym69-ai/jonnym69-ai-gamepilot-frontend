import { MoodForecastingResult } from '../mood/moodForecast';
import { Game } from '@gamepilot/types';
/**
 * Mood-Based Game Recommendation Interfaces
 */
export interface MoodGameRecommendation {
    game: Game;
    score: number;
    reasons: string[];
    moodMatch: number;
}
export interface MoodBasedRecommendationResult {
    recommendations: MoodGameRecommendation[];
    predictedMood: string;
    confidence: number;
    totalGames: number;
    generatedAt: Date;
}
/**
 * Generate mood-based game recommendations using mood forecast
 */
export declare function generateMoodBasedRecommendations(forecastResult: MoodForecastingResult, availableGames: Game[], maxRecommendations?: number): MoodBasedRecommendationResult;
