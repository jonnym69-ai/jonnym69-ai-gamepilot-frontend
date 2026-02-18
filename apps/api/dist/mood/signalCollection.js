"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalCollector = void 0;
/**
 * Signal Collection Module
 * Gathers behavioral signals from existing data sources
 */
class SignalCollector {
    constructor() {
        this.signals = [];
        this.maxSignalAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    }
    /**
     * Collect signals from session history
     */
    collectFromSessionHistory(sessions, games) {
        const signals = [];
        const gameMap = new Map(games.map(g => [g.id, g]));
        for (const session of sessions) {
            const game = gameMap.get(session.gameId);
            // Session completion signal
            signals.push({
                timestamp: session.endTime || session.startTime,
                source: 'session',
                data: {
                    duration: session.duration,
                    completed: session.endTime !== undefined,
                    mood: session.mood?.id,
                    sessionType: session.sessionType,
                    gameGenre: game?.genres[0]?.id
                },
                weight: 0.8
            });
            // Achievement signal if present
            if (session.achievements && session.achievements.length > 0) {
                signals.push({
                    timestamp: session.endTime || session.startTime,
                    source: 'session',
                    data: {
                        achievementCount: session.achievements.length,
                        achievementTypes: session.achievements.map(a => a.title)
                    },
                    weight: 0.6
                });
            }
        }
        return signals;
    }
    /**
     * Collect signals from genre transitions
     */
    collectFromGenreTransitions(sessions, games) {
        const signals = [];
        const gameMap = new Map(games.map(g => [g.id, g]));
        const sortedSessions = sessions.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        for (let i = 1; i < sortedSessions.length; i++) {
            const prevSession = sortedSessions[i - 1];
            const currSession = sortedSessions[i];
            const prevGame = gameMap.get(prevSession.gameId);
            const currGame = gameMap.get(currSession.gameId);
            const prevGenre = prevGame?.genres[0]?.id;
            const currGenre = currGame?.genres[0]?.id;
            if (prevGenre && currGenre && prevGenre !== currGenre) {
                signals.push({
                    timestamp: currSession.startTime,
                    source: 'genre',
                    data: {
                        fromGenre: prevGenre,
                        toGenre: currGenre,
                        transitionTime: currSession.startTime.getTime() - (prevSession.endTime || prevSession.startTime).getTime()
                    },
                    weight: 0.7
                });
            }
        }
        return signals;
    }
    /**
     * Collect signals from playtime patterns
     */
    collectFromPlaytimePatterns(sessions) {
        const signals = [];
        // Group sessions by day of week
        const sessionsByDay = new Map();
        for (const session of sessions) {
            const dayOfWeek = session.startTime.getDay();
            const daySessions = sessionsByDay.get(dayOfWeek) || [];
            daySessions.push(session);
            sessionsByDay.set(dayOfWeek, daySessions);
        }
        // Analyze patterns for each day
        for (const [dayOfWeek, daySessions] of sessionsByDay) {
            if (daySessions.length < 2)
                continue;
            const totalPlaytime = daySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
            const averageSessionLength = totalPlaytime / daySessions.length;
            const variance = daySessions.reduce((sum, s) => {
                const diff = (s.duration || 0) - averageSessionLength;
                return sum + diff * diff;
            }, 0) / daySessions.length;
            signals.push({
                timestamp: new Date(),
                source: 'playtime',
                data: {
                    dayOfWeek,
                    totalPlaytime,
                    averageSessionLength,
                    variance,
                    sessionCount: daySessions.length,
                    consistency: 1 - (variance / (averageSessionLength * averageSessionLength))
                },
                weight: 0.5
            });
        }
        return signals;
    }
    /**
     * Collect signals from platform switching
     */
    collectFromPlatformSwitching(sessions) {
        const signals = [];
        const sortedSessions = sessions.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        for (let i = 1; i < sortedSessions.length; i++) {
            const prevSession = sortedSessions[i - 1];
            const currSession = sortedSessions[i];
            const prevPlatform = prevSession.platform.code;
            const currPlatform = currSession.platform.code;
            if (prevPlatform !== currPlatform) {
                signals.push({
                    timestamp: currSession.startTime,
                    source: 'platform',
                    data: {
                        fromPlatform: prevPlatform,
                        toPlatform: currPlatform,
                        switchTime: currSession.startTime.getTime() - (prevSession.endTime || prevSession.startTime).getTime(),
                        platformPreference: this.calculatePlatformPreference(sessions, currPlatform)
                    },
                    weight: 0.4
                });
            }
        }
        return signals;
    }
    /**
     * Collect signals from integration activity
     */
    collectFromIntegrationActivity(activities) {
        const signals = [];
        for (const activity of activities) {
            signals.push({
                timestamp: activity.timestamp,
                source: 'integration',
                data: {
                    type: activity.type,
                    platform: activity.platform,
                    gameId: activity.gameId,
                    socialInteraction: activity.type === 'achievement' || activity.type === 'session_start',
                    communityEngagement: activity.type === 'integration_connected'
                },
                weight: 0.3
            });
        }
        return signals;
    }
    /**
     * Get all recent signals for a user
     */
    getRecentSignals(userId, maxAge = this.maxSignalAge) {
        const cutoffTime = new Date(Date.now() - maxAge);
        return this.signals
            .filter(signal => signal.timestamp >= cutoffTime)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    /**
     * Add new signal to collection
     */
    addSignal(signal) {
        this.signals.push(signal);
        // Clean up old signals
        const cutoffTime = new Date(Date.now() - this.maxSignalAge);
        this.signals = this.signals.filter(s => s.timestamp >= cutoffTime);
    }
    /**
     * Get signal statistics
     */
    getSignalStats() {
        const signalsBySource = {};
        let totalWeight = 0;
        for (const signal of this.signals) {
            signalsBySource[signal.source] = (signalsBySource[signal.source] || 0) + 1;
            totalWeight += signal.weight;
        }
        const sortedSignals = [...this.signals].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        return {
            totalSignals: this.signals.length,
            signalsBySource,
            averageWeight: this.signals.length > 0 ? totalWeight / this.signals.length : 0,
            oldestSignal: sortedSignals.length > 0 ? sortedSignals[0].timestamp : null,
            newestSignal: sortedSignals.length > 0 ? sortedSignals[sortedSignals.length - 1].timestamp : null
        };
    }
    /**
     * Clear all signals
     */
    clearSignals() {
        this.signals = [];
    }
    calculatePlatformPreference(sessions, platform) {
        const platformSessions = sessions.filter(s => s.platform.code === platform);
        if (sessions.length === 0)
            return 0;
        return platformSessions.length / sessions.length;
    }
}
exports.SignalCollector = SignalCollector;
//# sourceMappingURL=signalCollection.js.map