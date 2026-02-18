import { MoodVector, MoodAnalysisResult } from './types';
import { PlayHistory, Game, Activity } from '@gamepilot/types';
import { type MoodForecastingResult, type MoodTrendAnalysis } from '@gamepilot/identity-engine';
/**
 * Main Mood Analysis Service
 * Coordinates signal collection, feature extraction, and mood inference
 */
export declare class MoodService {
    private signalCollector;
    private featureExtractor;
    private moodInference;
    private sessionResonanceService;
    constructor();
    /**
     * Analyze mood for a user based on their gaming history
     */
    analyzeUserMood(userId: string, sessions: PlayHistory[], games: Game[], activities?: Activity[]): Promise<MoodAnalysisResult>;
    /**
     * Get current mood vector for a user
     */
    getCurrentMood(userId: string): Promise<MoodAnalysisResult | null>;
    /**
     * Update mood analysis with new session data
     */
    updateMoodAnalysis(userId: string, newSession: PlayHistory, games: Game[]): Promise<void>;
    /**
     * Get mood analysis statistics
     */
    getMoodAnalysisStats(userId: string): {
        totalSignals: number;
        signalsBySource: Record<string, number>;
        averageConfidence: number;
        lastAnalysis: Date | null;
    };
    /**
     * Validate mood analysis result
     */
    validateMoodAnalysis(result: MoodAnalysisResult): {
        isValid: boolean;
        issues: string[];
    };
    /**
     * Get mood description and recommendations
     */
    getMoodInsights(moodVector: MoodVector): {
        dominant: string;
        description: string;
        traits: string[];
        recommendations: string[];
        confidence: number;
    };
    /**
     * Reset mood analysis data for a user
     */
    resetUserMoodData(userId: string): void;
    /**
     * Export mood analysis data
     */
    exportMoodData(userId: string): {
        signals: any[];
        features: any;
        moodVector: any;
        timestamp: string;
    } | null;
    /**
     * Health check for the mood analysis service
     */
    healthCheck(): {
        status: 'healthy' | 'degraded' | 'unhealthy';
        checks: {
            signalCollector: boolean;
            featureExtractor: boolean;
            moodInference: boolean;
        };
        timestamp: string;
    };
    /**
     * Analyze mood trends over time for a user
     */
    analyzeMoodTrends(userId: string, timeframe?: 'week' | 'month' | 'quarter'): Promise<MoodTrendAnalysis>;
    /**
     * Helper method to get user mood history
     */
    private getUserMoodHistory;
    /**
     * Record a gaming session and calculate resonance
     */
    recordSessionResonance(userId: string, sessionId: string, sessionData: {
        duration: number;
        engagement: number;
        satisfaction: number;
        gameIds: string[];
    }, actualMood: string): Promise<import("@gamepilot/identity-engine").SessionResonance>;
    /**
     * Get user's resonance analysis
     */
    getUserResonanceAnalysis(userId: string): Promise<import("@gamepilot/identity-engine").SessionResonanceAnalysis>;
    /**
     * Get system-wide resonance analysis
     */
    getSystemResonanceAnalysis(): Promise<import("@gamepilot/identity-engine").SessionResonanceAnalysis>;
    /**
     * Get resonance data to improve forecasting
     */
    getResonanceDataForForecasting(userId: string): Promise<{
        moodAccuracy: Record<string, number>;
        confidenceAdjustments: Record<string, number>;
        sessionPatterns: Record<string, {
            avgDuration: number;
            avgEngagement: number;
        }>;
    }>;
    /**
     * Get recent resonance sessions
     */
    getRecentResonanceSessions(userId: string, limit?: number): Promise<import("@gamepilot/identity-engine").SessionResonance[]>;
    /**
     * Generate mood forecasts based on historical trends
     */
    analyzeMoodForecast(userId: string, forecastPeriod?: 'next_week' | 'next_month' | 'next_quarter'): Promise<MoodForecastingResult>;
}
//# sourceMappingURL=moodService.d.ts.map