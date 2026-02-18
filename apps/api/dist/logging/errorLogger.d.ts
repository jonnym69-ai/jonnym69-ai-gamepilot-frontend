import { Request } from 'express';
declare class ErrorLogger {
    private static instance;
    private isProduction;
    private constructor();
    static getInstance(): ErrorLogger;
    private createContext;
    private generateRequestId;
    private formatLogEntry;
    private log;
    logError(message: string, error?: Error, req?: Request, tags?: Record<string, string>, extra?: Record<string, any>): void;
    logWarning(message: string, req?: Request, tags?: Record<string, string>, extra?: Record<string, any>): void;
    logInfo(message: string, req?: Request, tags?: Record<string, string>, extra?: Record<string, any>): void;
    logDebug(message: string, req?: Request, tags?: Record<string, string>, extra?: Record<string, any>): void;
    logSecurityEvent(message: string, req: Request, severity?: 'low' | 'medium' | 'high', details?: Record<string, any>): void;
    logPerformance(message: string, duration: number, req?: Request, details?: Record<string, any>): void;
    logDatabaseError(message: string, error: Error, query?: string, params?: any[]): void;
    logAuthError(message: string, error: Error, req: Request, userId?: string): void;
    private getAuthMethod;
    private isLoginAttempt;
}
export declare const errorLogger: ErrorLogger;
export declare const logError: (message: string, error?: Error, req?: Request, tags?: Record<string, string>, extra?: Record<string, any>) => void;
export declare const logWarning: (message: string, req?: Request, tags?: Record<string, string>, extra?: Record<string, any>) => void;
export declare const logInfo: (message: string, req?: Request, tags?: Record<string, string>, extra?: Record<string, any>) => void;
export declare const logSecurityEvent: (message: string, req: Request, severity?: "low" | "medium" | "high", details?: Record<string, any>) => void;
export declare const logPerformance: (message: string, duration: number, req?: Request, details?: Record<string, any>) => void;
export declare const logDatabaseError: (message: string, error: Error, query?: string, params?: any[]) => void;
export declare const logAuthError: (message: string, error: Error, req: Request, userId?: string) => void;
export {};
//# sourceMappingURL=errorLogger.d.ts.map