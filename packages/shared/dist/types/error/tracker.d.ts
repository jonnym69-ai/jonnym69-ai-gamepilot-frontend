export interface ErrorContext {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    userAgent?: string;
    ip?: string;
    url?: string;
    method?: string;
    statusCode?: number;
    timestamp: number;
    environment: string;
    version: string;
    type?: string;
    severity?: string;
    tags?: string[];
    extra?: Record<string, any>;
}
export interface ErrorInfo {
    message: string;
    stack?: string;
    type: string;
    severity: 'error' | 'warning' | 'info' | 'debug';
    context: ErrorContext;
    tags: string[];
    extra?: Record<string, any>;
}
export interface ErrorReport {
    id: string;
    error: ErrorInfo;
    occurrences: number;
    firstSeen: number;
    lastSeen: number;
    resolved: boolean;
    assignedTo?: string;
    comments: ErrorComment[];
}
export interface ErrorComment {
    id: string;
    author: string;
    message: string;
    timestamp: number;
    internal: boolean;
}
export interface ErrorStats {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    errorsByUrl: Record<string, number>;
    errorsByUser: Record<string, number>;
    recentErrors: ErrorInfo[];
    resolvedErrors: number;
    unresolvedErrors: number;
}
export declare class ErrorTracker {
    private errors;
    private stats;
    private maxErrors;
    private maxRecentErrors;
    constructor();
    /**
     * Setup global error handlers
     */
    private setupGlobalErrorHandlers;
    /**
     * Capture an error
     */
    captureError(error: Error | string, context?: Partial<ErrorContext>): string;
    /**
     * Create error info from error or string
     */
    private createErrorInfo;
    /**
     * Generate error ID
     */
    private generateErrorId;
    /**
     * Update error statistics
     */
    private updateStats;
    /**
     * Clean up old errors
     */
    private cleanupOldErrors;
    /**
     * Get error by ID
     */
    getError(errorId: string): ErrorReport | undefined;
    /**
     * Get all errors
     */
    getAllErrors(): ErrorReport[];
    /**
     * Get errors by status
     */
    getErrorsByStatus(resolved: boolean): ErrorReport[];
    /**
     * Get errors by severity
     */
    getErrorsBySeverity(severity: string): ErrorReport[];
    /**
     * Get error statistics
     */
    getStats(): ErrorStats;
    /**
     * Resolve an error
     */
    resolveError(errorId: string, resolvedBy?: string): boolean;
    /**
     * Add comment to error
     */
    addComment(errorId: string, author: string, message: string, internal?: boolean): boolean;
    /**
     * Generate unique ID
     */
    private generateId;
    /**
     * Get errors for dashboard
     */
    getDashboardData(): {
        summary: {
            total: number;
            resolved: number;
            unresolved: number;
            critical: number;
            recent: number;
        };
        topErrors: Array<{
            id: string;
            message: string;
            type: string;
            occurrences: number;
            lastSeen: number;
            resolved: boolean;
        }>;
        recentErrors: ErrorInfo[];
        stats: {
            byType: Record<string, number>;
            bySeverity: Record<string, number>;
            byUrl: Record<string, number>;
        };
    };
    /**
     * Export errors for backup
     */
    exportErrors(): {
        errors: Array<ErrorReport>;
        stats: ErrorStats;
        exportedAt: number;
    };
    /**
     * Import errors from backup
     */
    importErrors(data: {
        errors: Array<ErrorReport>;
        stats: ErrorStats;
    }): void;
    /**
     * Clear all errors
     */
    clearAllErrors(): void;
    /**
     * Get error trends
     */
    getErrorTrends(hours?: number): Array<{
        hour: number;
        errors: number;
        resolved: number;
    }>;
}
export declare function errorTrackingMiddleware(tracker: ErrorTracker): (error: Error, req: any, res: any, next: any) => void;
export declare function trackAsyncErrors(tracker: ErrorTracker): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const errorTracker: ErrorTracker;
//# sourceMappingURL=tracker.d.ts.map