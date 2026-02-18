"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorTracker = exports.ErrorTracker = void 0;
exports.errorTrackingMiddleware = errorTrackingMiddleware;
exports.trackAsyncErrors = trackAsyncErrors;
class ErrorTracker {
    constructor() {
        this.errors = new Map();
        this.stats = {
            totalErrors: 0,
            errorsByType: {},
            errorsBySeverity: {},
            errorsByUrl: {},
            errorsByUser: {},
            recentErrors: [],
            resolvedErrors: 0,
            unresolvedErrors: 0
        };
        this.maxErrors = 10000;
        this.maxRecentErrors = 100;
        this.setupGlobalErrorHandlers();
    }
    /**
     * Setup global error handlers
     */
    setupGlobalErrorHandlers() {
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            this.captureError(error, {
                type: 'uncaughtException',
                severity: 'error',
                tags: ['critical', 'uncaught'],
                timestamp: Date.now(),
                environment: process.env.NODE_ENV || 'development',
                version: process.env.npm_package_version || '1.0.0'
            });
        });
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            this.captureError(new Error(`Unhandled Promise Rejection: ${reason}`), {
                type: 'unhandledRejection',
                severity: 'error',
                tags: ['critical', 'promise'],
                timestamp: Date.now(),
                environment: process.env.NODE_ENV || 'development',
                version: process.env.npm_package_version || '1.0.0',
                extra: { reason, promise }
            });
        });
    }
    /**
     * Capture an error
     */
    captureError(error, context = {}) {
        const errorInfo = this.createErrorInfo(error, context);
        const errorId = this.generateErrorId(errorInfo);
        // Update or create error report
        const existingReport = this.errors.get(errorId);
        if (existingReport) {
            existingReport.occurrences++;
            existingReport.lastSeen = Date.now();
        }
        else {
            const report = {
                id: errorId,
                error: errorInfo,
                occurrences: 1,
                firstSeen: Date.now(),
                lastSeen: Date.now(),
                resolved: false,
                comments: []
            };
            this.errors.set(errorId, report);
        }
        // Update statistics
        this.updateStats(errorInfo);
        // Clean up old errors
        this.cleanupOldErrors();
        return errorId;
    }
    /**
     * Create error info from error or string
     */
    createErrorInfo(error, context) {
        const isError = error instanceof Error;
        const message = isError ? error.message : error;
        const stack = isError ? error.stack : undefined;
        return {
            message,
            stack,
            type: isError ? error.constructor.name : 'Error',
            severity: 'error',
            context: {
                timestamp: Date.now(),
                environment: process.env.NODE_ENV || 'development',
                version: process.env.npm_package_version || '1.0.0',
                ...context
            },
            tags: [],
            extra: {}
        };
    }
    /**
     * Generate error ID
     */
    generateErrorId(errorInfo) {
        const base = `${errorInfo.type}-${errorInfo.message}-${errorInfo.context.url || 'unknown'}`;
        return Buffer.from(base).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    }
    /**
     * Update error statistics
     */
    updateStats(errorInfo) {
        this.stats.totalErrors++;
        // Update by type
        this.stats.errorsByType[errorInfo.type] = (this.stats.errorsByType[errorInfo.type] || 0) + 1;
        // Update by severity
        this.stats.errorsBySeverity[errorInfo.severity] = (this.stats.errorsBySeverity[errorInfo.severity] || 0) + 1;
        // Update by URL
        if (errorInfo.context.url) {
            this.stats.errorsByUrl[errorInfo.context.url] = (this.stats.errorsByUrl[errorInfo.context.url] || 0) + 1;
        }
        // Update by user
        if (errorInfo.context.userId) {
            this.stats.errorsByUser[errorInfo.context.userId] = (this.stats.errorsByUser[errorInfo.context.userId] || 0) + 1;
        }
        // Update recent errors
        this.stats.recentErrors.unshift(errorInfo);
        if (this.stats.recentErrors.length > this.maxRecentErrors) {
            this.stats.recentErrors = this.stats.recentErrors.slice(0, this.maxRecentErrors);
        }
        // Update resolved/unresolved counts
        this.stats.unresolvedErrors = Array.from(this.errors.values()).filter(report => !report.resolved).length;
        this.stats.resolvedErrors = Array.from(this.errors.values()).filter(report => report.resolved).length;
    }
    /**
     * Clean up old errors
     */
    cleanupOldErrors() {
        if (this.errors.size > this.maxErrors) {
            const sortedErrors = Array.from(this.errors.entries())
                .sort((a, b) => b[1].lastSeen - a[1].lastSeen);
            // Keep only the most recent errors
            const toKeep = sortedErrors.slice(0, this.maxErrors);
            this.errors = new Map(toKeep);
        }
    }
    /**
     * Get error by ID
     */
    getError(errorId) {
        return this.errors.get(errorId);
    }
    /**
     * Get all errors
     */
    getAllErrors() {
        return Array.from(this.errors.values())
            .sort((a, b) => b.lastSeen - a.lastSeen);
    }
    /**
     * Get errors by status
     */
    getErrorsByStatus(resolved) {
        return Array.from(this.errors.values())
            .filter(report => report.resolved === resolved)
            .sort((a, b) => b.lastSeen - a.lastSeen);
    }
    /**
     * Get errors by severity
     */
    getErrorsBySeverity(severity) {
        return Array.from(this.errors.values())
            .filter(report => report.error.severity === severity)
            .sort((a, b) => b.lastSeen - a.lastSeen);
    }
    /**
     * Get error statistics
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Resolve an error
     */
    resolveError(errorId, resolvedBy) {
        const report = this.errors.get(errorId);
        if (!report)
            return false;
        report.resolved = true;
        report.assignedTo = resolvedBy;
        // Update statistics
        this.stats.unresolvedErrors--;
        this.stats.resolvedErrors++;
        return true;
    }
    /**
     * Add comment to error
     */
    addComment(errorId, author, message, internal = false) {
        const report = this.errors.get(errorId);
        if (!report)
            return false;
        const comment = {
            id: this.generateId(),
            author,
            message,
            timestamp: Date.now(),
            internal
        };
        report.comments.push(comment);
        return true;
    }
    /**
     * Generate unique ID
     */
    generateId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    /**
     * Get errors for dashboard
     */
    getDashboardData() {
        const criticalErrors = this.getErrorsBySeverity('error');
        return {
            summary: {
                total: this.stats.totalErrors,
                resolved: this.stats.resolvedErrors,
                unresolved: this.stats.unresolvedErrors,
                critical: criticalErrors.length,
                recent: this.stats.recentErrors.length
            },
            topErrors: this.getAllErrors()
                .slice(0, 10)
                .map(report => ({
                id: report.id,
                message: report.error.message,
                type: report.error.type,
                occurrences: report.occurrences,
                lastSeen: report.lastSeen,
                resolved: report.resolved
            })),
            recentErrors: this.stats.recentErrors.slice(0, 20),
            stats: {
                byType: this.stats.errorsByType,
                bySeverity: this.stats.errorsBySeverity,
                byUrl: this.stats.errorsByUrl
            }
        };
    }
    /**
     * Export errors for backup
     */
    exportErrors() {
        return {
            errors: this.getAllErrors(),
            stats: this.getStats(),
            exportedAt: Date.now()
        };
    }
    /**
     * Import errors from backup
     */
    importErrors(data) {
        this.errors = new Map(data.errors.map(report => [report.id, report]));
        this.stats = data.stats;
    }
    /**
     * Clear all errors
     */
    clearAllErrors() {
        this.errors.clear();
        this.stats = {
            totalErrors: 0,
            errorsByType: {},
            errorsBySeverity: {},
            errorsByUrl: {},
            errorsByUser: {},
            recentErrors: [],
            resolvedErrors: 0,
            unresolvedErrors: 0
        };
    }
    /**
     * Get error trends
     */
    getErrorTrends(hours = 24) {
        const now = Date.now();
        const hourMs = 60 * 60 * 1000;
        const trends = [];
        for (let i = 0; i < hours; i++) {
            const hourStart = now - (i + 1) * hourMs;
            const hourEnd = now - i * hourMs;
            const errors = Array.from(this.errors.values()).filter(report => report.firstSeen >= hourStart && report.firstSeen < hourEnd).length;
            const resolved = Array.from(this.errors.values()).filter(report => report.resolved && report.lastSeen >= hourStart && report.lastSeen < hourEnd).length;
            trends.unshift({
                hour: i,
                errors,
                resolved
            });
        }
        return trends;
    }
}
exports.ErrorTracker = ErrorTracker;
// Express middleware for error tracking
function errorTrackingMiddleware(tracker) {
    return (error, req, res, next) => {
        const context = {
            userId: req.user?.id,
            sessionId: req.session?.id,
            requestId: req.id,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            url: req.url,
            method: req.method,
            statusCode: res.statusCode,
            timestamp: Date.now(),
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0'
        };
        tracker.captureError(error, context);
        next(error);
    };
}
// Async error wrapper
function trackAsyncErrors(tracker) {
    return (target, propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args) {
            try {
                return await originalMethod.apply(this, args);
            }
            catch (error) {
                tracker.captureError(error, {
                    type: 'asyncError',
                    severity: 'error',
                    tags: ['async', 'function'],
                    timestamp: Date.now(),
                    environment: process.env.NODE_ENV || 'development',
                    version: process.env.npm_package_version || '1.0.0',
                    extra: { functionName: propertyKey, args }
                });
                throw error;
            }
        };
        return descriptor;
    };
}
// Singleton instance
exports.errorTracker = new ErrorTracker();
//# sourceMappingURL=tracker.js.map