"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAuthError = exports.logDatabaseError = exports.logPerformance = exports.logSecurityEvent = exports.logInfo = exports.logWarning = exports.logError = exports.errorLogger = void 0;
class ErrorLogger {
    constructor() {
        this.isProduction = process.env.NODE_ENV === 'production';
    }
    static getInstance() {
        if (!ErrorLogger.instance) {
            ErrorLogger.instance = new ErrorLogger();
        }
        return ErrorLogger.instance;
    }
    createContext(req) {
        const context = {
            timestamp: new Date().toISOString(),
            level: 'error'
        };
        if (req) {
            context.method = req.method;
            context.url = req.url;
            context.userAgent = req.get('User-Agent');
            context.ip = req.ip || req.connection.remoteAddress;
            context.requestId = req.headers['x-request-id'] || this.generateRequestId();
            // Try to extract user info from request
            if (req.user) {
                context.userId = req.user.id;
            }
        }
        return context;
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    formatLogEntry(entry) {
        const { message, error, context, tags, extra } = entry;
        let logMessage = `[${context.timestamp}] ${context.level?.toUpperCase()} - ${message}`;
        if (context.userId)
            logMessage += ` (User: ${context.userId})`;
        if (context.method && context.url)
            logMessage += ` (${context.method} ${context.url})`;
        if (context.ip)
            logMessage += ` [IP: ${context.ip}]`;
        if (error) {
            logMessage += `\nError: ${error.message}`;
            if (error.stack && !this.isProduction) {
                logMessage += `\nStack: ${error.stack}`;
            }
        }
        if (tags && Object.keys(tags).length > 0) {
            logMessage += `\nTags: ${JSON.stringify(tags)}`;
        }
        if (extra && Object.keys(extra).length > 0) {
            logMessage += `\nExtra: ${JSON.stringify(extra)}`;
        }
        return logMessage;
    }
    log(entry) {
        const formattedMessage = this.formatLogEntry(entry);
        // Log to console (will be replaced by Sentry in production)
        switch (entry.context.level) {
            case 'error':
                console.error(formattedMessage);
                break;
            case 'warning':
                console.warn(formattedMessage);
                break;
            case 'info':
                console.info(formattedMessage);
                break;
            case 'debug':
                if (!this.isProduction) {
                    console.debug(formattedMessage);
                }
                break;
            default:
                console.log(formattedMessage);
        }
        // TODO: Send to Sentry when configured
        // this.sendToSentry(entry)
    }
    logError(message, error, req, tags, extra) {
        const context = this.createContext(req);
        this.log({
            message,
            error,
            context: context,
            tags,
            extra
        });
    }
    logWarning(message, req, tags, extra) {
        const context = this.createContext(req);
        context.level = 'warning';
        this.log({
            message,
            context: context,
            tags,
            extra
        });
    }
    logInfo(message, req, tags, extra) {
        const context = this.createContext(req);
        context.level = 'info';
        this.log({
            message,
            context: context,
            tags,
            extra
        });
    }
    logDebug(message, req, tags, extra) {
        const context = this.createContext(req);
        context.level = 'debug';
        this.log({
            message,
            context: context,
            tags,
            extra
        });
    }
    // Security-specific logging
    logSecurityEvent(message, req, severity = 'medium', details) {
        const tags = {
            security: 'true',
            severity
        };
        const extra = {
            ...details,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress,
            timestamp: new Date().toISOString()
        };
        this.logWarning(`SECURITY: ${message}`, req, tags, extra);
    }
    // Performance logging
    logPerformance(message, duration, req, details) {
        const tags = {
            performance: 'true'
        };
        const extra = {
            duration,
            ...details
        };
        if (duration > 1000) {
            this.logWarning(`SLOW: ${message} (${duration}ms)`, req, tags, extra);
        }
        else {
            this.logInfo(`PERF: ${message} (${duration}ms)`, req, tags, extra);
        }
    }
    // Database error logging
    logDatabaseError(message, error, query, params) {
        const tags = {
            database: 'true',
            error: 'true'
        };
        const extra = {
            query,
            params: params ? JSON.stringify(params) : undefined
        };
        this.logError(`DATABASE: ${message}`, error, undefined, tags, extra);
    }
    // Authentication error logging
    logAuthError(message, error, req, userId) {
        const tags = {
            auth: 'true',
            error: 'true'
        };
        const extra = {
            authMethod: this.getAuthMethod(req),
            loginAttempt: this.isLoginAttempt(req)
        };
        if (userId) {
            extra.userId = userId;
        }
        this.logError(`AUTH: ${message}`, error, req, tags, extra);
    }
    getAuthMethod(req) {
        const authHeader = req.get('Authorization');
        if (authHeader?.startsWith('Bearer '))
            return 'jwt';
        if (req.cookies.token)
            return 'cookie';
        return 'none';
    }
    isLoginAttempt(req) {
        return req.url?.includes('/login') || req.url?.includes('/register');
    }
}
exports.errorLogger = ErrorLogger.getInstance();
// Export convenience functions
const logError = (message, error, req, tags, extra) => {
    exports.errorLogger.logError(message, error, req, tags, extra);
};
exports.logError = logError;
const logWarning = (message, req, tags, extra) => {
    exports.errorLogger.logWarning(message, req, tags, extra);
};
exports.logWarning = logWarning;
const logInfo = (message, req, tags, extra) => {
    exports.errorLogger.logInfo(message, req, tags, extra);
};
exports.logInfo = logInfo;
const logSecurityEvent = (message, req, severity, details) => {
    exports.errorLogger.logSecurityEvent(message, req, severity, details);
};
exports.logSecurityEvent = logSecurityEvent;
const logPerformance = (message, duration, req, details) => {
    exports.errorLogger.logPerformance(message, duration, req, details);
};
exports.logPerformance = logPerformance;
const logDatabaseError = (message, error, query, params) => {
    exports.errorLogger.logDatabaseError(message, error, query, params);
};
exports.logDatabaseError = logDatabaseError;
const logAuthError = (message, error, req, userId) => {
    exports.errorLogger.logAuthError(message, error, req, userId);
};
exports.logAuthError = logAuthError;
//# sourceMappingURL=errorLogger.js.map