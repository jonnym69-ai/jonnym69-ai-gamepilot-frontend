import * as Sentry from '@sentry/node';
import { Request } from 'express';
export interface SentryConfig {
    dsn: string;
    environment: string;
    release?: string;
    tracesSampleRate?: number;
}
export declare class SentryLogger {
    private static instance;
    private isInitialized;
    private constructor();
    static getInstance(): SentryLogger;
    initialize(config: SentryConfig): void;
    captureException(error: Error, context?: {
        request?: Request;
        userId?: string;
        details?: Record<string, any>;
    }): void;
    captureMessage(message: string, level?: Sentry.SeverityLevel, context?: {
        request?: Request;
        userId?: string;
        details?: Record<string, any>;
    }): void;
    startTransaction(name: string, op?: string): Sentry.Span | null;
    setUser(user: {
        id: string;
        email?: string;
        username?: string;
    }): void;
    setTags(tags: Record<string, string>): void;
    addBreadcrumb(breadcrumb: {
        message?: string;
        category?: string;
        level?: Sentry.SeverityLevel;
        data?: Record<string, any>;
    }): void;
    healthCheck(): {
        initialized: boolean;
        dsnConfigured: boolean;
    };
}
export default SentryLogger;
//# sourceMappingURL=sentryLogger.d.ts.map