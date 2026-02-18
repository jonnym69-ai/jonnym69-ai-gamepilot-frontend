import { MoodTrendAnalysis } from '../moodModel';
import { UserMood } from '../types';
/**
 * Mood Forecasting Interfaces
 */
export interface MoodForecast {
    predictedMood: string;
    confidence: number;
    timeframe: 'next_week' | 'next_month' | 'next_quarter';
    factors: {
        trendInfluence: number;
        seasonalityInfluence: number;
        volatilityAdjustment: number;
    };
    reasoning: string[];
}
export interface MoodForecastingResult {
    primaryForecast: MoodForecast;
    alternativeForecasts: MoodForecast[];
    forecastAccuracy: number;
    dataQuality: 'high' | 'medium' | 'low';
    generatedAt: Date;
}
/**
 * Generate mood forecasts based on historical trend analysis
 */
export declare function calculateMoodForecast(trendAnalysis: MoodTrendAnalysis, historicalData: UserMood[], forecastPeriod?: 'next_week' | 'next_month' | 'next_quarter'): MoodForecastingResult;
