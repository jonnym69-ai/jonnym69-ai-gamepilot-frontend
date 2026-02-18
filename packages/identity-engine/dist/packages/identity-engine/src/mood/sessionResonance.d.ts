import { MoodForecastingResult } from './moodForecast';
/**
 * Session Resonance Tracking Interfaces
 */
export interface SessionResonance {
    sessionId: string;
    userId: string;
    predictedMood: string;
    actualMood: string;
    resonanceScore: number;
    confidenceDelta: number;
    sessionData: {
        duration: number;
        engagement: number;
        satisfaction: number;
        gameIds: string[];
    };
    factors: {
        moodAlignment: number;
        durationFit: number;
        engagementCorrelation: number;
    };
    timestamp: Date;
}
export interface SessionResonanceAnalysis {
    totalSessions: number;
    averageResonance: number;
    moodAccuracy: Record<string, number>;
    improvementTrend: 'improving' | 'stable' | 'declining';
    insights: {
        strongestPredictions: string[];
        weakestPredictions: string[];
        optimalSessionLength: Record<string, number>;
        engagementPatterns: Record<string, number>;
    };
    lastUpdated: Date;
}
/**
 * Calculate session resonance based on predicted vs actual mood
 */
export declare function calculateSessionResonance(sessionId: string, userId: string, forecastResult: MoodForecastingResult, actualMood: string, sessionData: {
    duration: number;
    engagement: number;
    satisfaction: number;
    gameIds: string[];
}): SessionResonance;
/**
 * Analyze session resonance patterns over time
 */
export declare function analyzeSessionResonance(resonanceData: SessionResonance[]): SessionResonanceAnalysis;
