export interface AnalyticsEvent {
    event: string;
    category: string;
    action: string;
    label?: string;
    value?: number;
    timestamp: number;
    userId?: string;
    sessionId?: string;
    properties?: Record<string, any>;
    context?: AnalyticsContext;
}
export interface AnalyticsContext {
    userAgent?: string;
    ip?: string;
    url?: string;
    referrer?: string;
    screenResolution?: string;
    viewportSize?: string;
    language?: string;
    timezone?: string;
    platform?: string;
    version?: string;
    environment?: string;
}
export interface AnalyticsContext {
    userAgent?: string;
    ip?: string;
    url?: string;
    referrer?: string;
    screenResolution?: string;
    viewportSize?: string;
    language?: string;
    timezone?: string;
    platform?: string;
    version?: string;
    environment?: string;
}
export interface PageView {
    path: string;
    title: string;
    timestamp: number;
    userId?: string;
    sessionId?: string;
    referrer?: string;
    properties?: Record<string, any>;
    context?: AnalyticsContext;
}
export interface UserSession {
    id: string;
    userId?: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    pageViews: number;
    events: AnalyticsEvent[];
    properties?: Record<string, any>;
    context?: AnalyticsContext;
}
export interface AnalyticsStats {
    totalEvents: number;
    totalPageViews: number;
    totalSessions: number;
    averageSessionDuration: number;
    bounceRate: number;
    uniqueUsers: number;
    topPages: Array<{
        path: string;
        views: number;
        avgDuration: number;
    }>;
    topEvents: Array<{
        event: string;
        count: number;
        category: string;
        action: string;
    }>;
    userRetention: Array<{
        period: string;
        retentionRate: number;
        users: number;
    }>;
}
export declare class AnalyticsEngine {
    private events;
    private pageViews;
    private sessions;
    private stats;
    private maxEvents;
    private maxSessions;
    constructor();
    /**
     * Setup session tracking
     */
    private setupSessionTracking;
    /**
     * Track an event
     */
    track(event: string, category: string, action: string, options?: {
        label?: string;
        value?: number;
        properties?: Record<string, any>;
        userId?: string;
        sessionId?: string;
    }): void;
    /**
     * Track page view
     */
    pageView(path: string, title: string, options?: {
        userId?: string;
        sessionId?: string;
        referrer?: string;
        properties?: Record<string, any>;
    }): void;
    /**
     * Start a session
     */
    startSession(sessionId: string, options?: {
        userId?: string;
        properties?: Record<string, any>;
    }): void;
    /**
     * End a session
     */
    endSession(sessionId: string): void;
    /**
     * Get current context
     */
    private getContext;
    /**
     * Update top pages
     */
    private updateTopPages;
    /**
     * Update top events
     */
    private updateTopEvents;
    /**
     * Update statistics
     */
    private updateStats;
    /**
     * Calculate user retention
     */
    private calculateUserRetention;
    /**
     * Clean up old sessions
     */
    private cleanupOldSessions;
    /**
     * Get analytics data
     */
    getData(): AnalyticsStats;
    /**
     * Get events by category
     */
    getEventsByCategory(category: string): AnalyticsEvent[];
    /**
     * Get events by action
     */
    getEventsByAction(action: string): AnalyticsEvent[];
    /**
     * Get user events
     */
    getUserEvents(userId: string): AnalyticsEvent[];
    /**
     * Get session events
     */
    getSessionEvents(sessionId: string): AnalyticsEvent[];
    /**
     * Get page views by path
     */
    getPageViewsByPath(path: string): PageView[];
    /**
     * Get user sessions
     */
    getUserSessions(userId: string): UserSession[];
    /**
     * Export analytics data
     */
    exportData(): {
        events: AnalyticsEvent[];
        pageViews: PageView[];
        sessions: Array<UserSession>;
        stats: AnalyticsStats;
        exportedAt: number;
    };
    /**
     * Import analytics data
     */
    importData(data: {
        events: AnalyticsEvent[];
        pageViews: PageView[];
        sessions: Array<UserSession>;
    }): void;
    /**
     * Clear all data
     */
    clearData(): void;
    /**
     * Generate analytics report
     */
    generateReport(): {
        summary: {
            totalEvents: number;
            totalPageViews: number;
            totalSessions: number;
            uniqueUsers: number;
            averageSessionDuration: number;
            bounceRate: number;
        };
        topPages: {
            avgDuration: number;
            path: string;
            views: number;
        }[];
        topEvents: {
            event: string;
            count: number;
            category: string;
            action: string;
        }[];
        userRetention: {
            period: string;
            retentionRate: number;
            users: number;
        }[];
        generatedAt: string;
    };
}
export declare function analyticsMiddleware(analytics: AnalyticsEngine): (req: any, res: any, next: any) => void;
export declare const analytics: AnalyticsEngine;
//# sourceMappingURL=engine.d.ts.map