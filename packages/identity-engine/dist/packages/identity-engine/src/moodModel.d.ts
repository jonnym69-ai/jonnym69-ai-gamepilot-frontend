export { MoodStrategy, moodStrategy } from '../../../src/core/mood/moodStrategy';
export type { Mood, GameMoodMapping } from '../../../src/core/mood/moodStrategy';
import type { UserMood } from './types';
export { MoodStrategy as MoodModel } from '../../../src/core/mood/moodStrategy';
export interface MoodTrend {
    moodId: string;
    trend: 'increasing' | 'decreasing' | 'stable';
    changeRate: number;
    confidence: number;
    timeframe: 'week' | 'month' | 'quarter';
}
export interface MoodTrendAnalysis {
    trends: MoodTrend[];
    dominantTrend: MoodTrend;
    volatility: number;
    lastAnalyzed: Date;
}
/**
 * Calculate mood trends from user mood history
 */
export declare function calculateMoodTrend(moodHistory: UserMood[], timeframe?: 'week' | 'month' | 'quarter'): MoodTrendAnalysis;
export { type MoodForecast, type MoodForecastingResult, calculateMoodForecast } from './mood/moodForecast';
export { type SessionResonance, type SessionResonanceAnalysis, calculateSessionResonance, analyzeSessionResonance } from './mood/sessionResonance';
