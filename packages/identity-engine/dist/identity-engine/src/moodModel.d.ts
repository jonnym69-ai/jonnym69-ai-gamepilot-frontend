export declare const GAMING_MOODS: {
    id: string;
    name: string;
    description: string;
    color: string;
    icon: string;
    energyLevel: number;
    socialPreference: string;
    timeOfDay: string[];
    genreAffinities: never[];
    category: string;
}[];
import type { UserMood } from './types';
export interface Mood {
    id: string;
    name: string;
    description: string;
    color: string;
    icon: string;
    energyLevel: number;
    socialPreference: 'solo' | 'cooperative' | 'competitive' | 'flexible';
    timeOfDay: ('morning' | 'afternoon' | 'evening' | 'night')[];
    genreAffinities: string[];
    category: 'energy' | 'exploration' | 'challenge' | 'social' | 'creative' | 'immersion' | 'action' | 'vibe';
}
export type { Mood as MoodModel };
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
