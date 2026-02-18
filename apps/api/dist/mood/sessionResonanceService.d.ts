import { MoodForecastingResult } from '@gamepilot/identity-engine';
import { type SessionResonance, type SessionResonanceAnalysis } from '@gamepilot/identity-engine';
/**
 * Session Resonance Service
 * Tracks and analyzes the alignment between predicted moods and actual gaming sessions
 */
export declare class SessionResonanceService {
    private resonanceData;
    /**
     * Record a new gaming session and calculate resonance
     */
    recordSessionResonance(userId: string, sessionId: string, forecastResult: MoodForecastingResult, sessionData: {
        duration: number;
        engagement: number;
        satisfaction: number;
        gameIds: string[];
    }, actualMood: string): Promise<SessionResonance>;
    /**
     * Get resonance analysis for a user
     */
    getUserResonanceAnalysis(userId: string): Promise<SessionResonanceAnalysis>;
    /**
     * Get overall system resonance analysis
     */
    getSystemResonanceAnalysis(): Promise<SessionResonanceAnalysis>;
    /**
     * Get recent resonance sessions for a user
     */
    getRecentResonanceSessions(userId: string, limit?: number): Promise<SessionResonance[]>;
    /**
     * Get resonance data for mood forecasting improvement
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
     * Clear resonance data (for testing)
     */
    clearResonanceData(): void;
    /**
     * Get resonance statistics
     */
    getResonanceStats(): {
        totalSessions: number;
        averageResonance: number;
        sessionsByMood: Record<string, number>;
    };
}
//# sourceMappingURL=sessionResonanceService.d.ts.map