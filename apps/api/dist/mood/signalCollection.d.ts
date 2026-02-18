import { BehavioralSignal } from './types';
import { PlayHistory, Game } from '@gamepilot/types';
/**
 * Signal Collection Module
 * Gathers behavioral signals from existing data sources
 */
export declare class SignalCollector {
    private signals;
    private maxSignalAge;
    /**
     * Collect signals from session history
     */
    collectFromSessionHistory(sessions: PlayHistory[], games: Game[]): BehavioralSignal[];
    /**
     * Collect signals from genre transitions
     */
    collectFromGenreTransitions(sessions: PlayHistory[], games: Game[]): BehavioralSignal[];
    /**
     * Collect signals from playtime patterns
     */
    collectFromPlaytimePatterns(sessions: PlayHistory[]): BehavioralSignal[];
    /**
     * Collect signals from platform switching
     */
    collectFromPlatformSwitching(sessions: PlayHistory[]): BehavioralSignal[];
    /**
     * Collect signals from integration activity
     */
    collectFromIntegrationActivity(activities: any[]): BehavioralSignal[];
    /**
     * Get all recent signals for a user
     */
    getRecentSignals(userId: string, maxAge?: number): BehavioralSignal[];
    /**
     * Add new signal to collection
     */
    addSignal(signal: BehavioralSignal): void;
    /**
     * Get signal statistics
     */
    getSignalStats(): {
        totalSignals: number;
        signalsBySource: Record<string, number>;
        averageWeight: number;
        oldestSignal: Date | null;
        newestSignal: Date | null;
    };
    /**
     * Clear all signals
     */
    clearSignals(): void;
    private calculatePlatformPreference;
}
//# sourceMappingURL=signalCollection.d.ts.map