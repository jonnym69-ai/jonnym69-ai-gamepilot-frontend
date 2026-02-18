export interface PerformanceMetrics {
    timestamp: number;
    requestDuration: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
    heapUsed: number;
    heapTotal: number;
    external: number;
    arrayBuffers: number;
}
export interface RequestMetrics {
    method: string;
    url: string;
    statusCode: number;
    duration: number;
    timestamp: number;
    userAgent?: string;
    ip?: string;
    userId?: string;
}
export interface BusinessMetrics {
    activeUsers: number;
    totalGames: number;
    totalSessions: number;
    averageSessionDuration: number;
    recommendationsGenerated: number;
    moodAnalysisCount: number;
    apiCalls: number;
    errorRate: number;
    cacheHitRate: number;
}
export declare class PerformanceMonitor {
    private metrics;
    private requestMetrics;
    private businessMetrics;
    private startTime;
    /**
     * Start performance monitoring
     */
    startMonitoring(): void;
    /**
     * Collect system performance metrics
     */
    private collectMetrics;
    /**
     * Record request metrics
     */
    recordRequest(request: RequestMetrics): void;
    /**
     * Update business metrics
     */
    updateBusinessMetrics(metrics: Partial<BusinessMetrics>): void;
    /**
     * Get current performance metrics
     */
    getCurrentMetrics(): PerformanceMetrics;
    /**
     * Get metrics for Prometheus
     */
    getPrometheusMetrics(): string;
    /**
     * Calculate error rate
     */
    private calculateErrorRate;
    /**
     * Get average request duration
     */
    private getAverageRequestDuration;
    /**
     * Get performance summary
     */
    getPerformanceSummary(): {
        uptime: number;
        memoryUsage: NodeJS.MemoryUsage;
        averageRequestDuration: number;
        errorRate: number;
        totalRequests: number;
        activeUsers: number;
    };
    /**
     * Check if performance is healthy
     */
    isHealthy(): boolean;
    /**
     * Get performance alerts
     */
    getPerformanceAlerts(): string[];
    /**
     * Export metrics for external monitoring
     */
    exportMetrics(): {
        performance: PerformanceMetrics[];
        requests: RequestMetrics[];
        business: BusinessMetrics;
        summary: any;
    };
    /**
     * Reset metrics
     */
    resetMetrics(): void;
}
export declare function performanceMiddleware(monitor: PerformanceMonitor): (req: any, res: any, next: any) => void;
export declare const performanceMonitor: PerformanceMonitor;
//# sourceMappingURL=monitor.d.ts.map