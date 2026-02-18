"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SentryLogger = void 0;
const Sentry = __importStar(require("@sentry/node"));
class SentryLogger {
    constructor() {
        this.isInitialized = false;
    }
    static getInstance() {
        if (!SentryLogger.instance) {
            SentryLogger.instance = new SentryLogger();
        }
        return SentryLogger.instance;
    }
    initialize(config) {
        if (this.isInitialized) {
            return;
        }
        if (!config.dsn) {
            console.warn('Sentry DSN not provided, skipping initialization');
            return;
        }
        Sentry.init({
            dsn: config.dsn,
            environment: config.environment || process.env.NODE_ENV || 'development',
            release: config.release || process.env.npm_package_version || '1.0.0',
            tracesSampleRate: config.tracesSampleRate || 0.1,
            beforeSend(event) {
                // Filter out certain errors in development
                if (process.env.NODE_ENV === 'development') {
                    // Don't send certain errors in development
                    if (event.exception?.values?.[0]?.value?.includes('EADDRINUSE')) {
                        return null;
                    }
                }
                return event;
            },
        });
        this.isInitialized = true;
        console.log('✅ Sentry initialized');
    }
    captureException(error, context) {
        if (!this.isInitialized) {
            console.error('Sentry not initialized, falling back to console:', error);
            return;
        }
        const scope = new Sentry.Scope();
        // Add request context
        if (context?.request) {
            scope.setUser({
                id: context.userId || 'anonymous',
                ip: context.request.ip,
                userAgent: context.request.get('User-Agent')
            });
            scope.setTags({
                method: context.request.method,
                url: context.request.url,
                requestId: context.request.requestId || 'unknown'
            });
            scope.setExtra('headers', context.request.headers);
            scope.setExtra('query', context.request.query);
            scope.setExtra('params', context.request.params);
        }
        // Add custom details
        if (context?.details) {
            Object.keys(context.details).forEach(key => {
                scope.setExtra(key, context.details[key]);
            });
        }
        Sentry.captureException(error);
    }
    captureMessage(message, level = 'info', context) {
        if (!this.isInitialized) {
            console.log(`Sentry not initialized, falling back to console: [${level}] ${message}`);
            return;
        }
        Sentry.captureMessage(message, level);
    }
    // Performance monitoring
    startTransaction(name, op = 'http') {
        if (!this.isInitialized) {
            return null;
        }
        return Sentry.startSpan({
            name,
            op,
        }, () => null) || null;
    }
    // User tracking
    setUser(user) {
        if (!this.isInitialized) {
            return;
        }
        Sentry.setUser(user);
    }
    // Tagging
    setTags(tags) {
        if (!this.isInitialized) {
            return;
        }
        Sentry.setTags(tags);
    }
    // Breadcrumbs
    addBreadcrumb(breadcrumb) {
        if (!this.isInitialized) {
            return;
        }
        Sentry.addBreadcrumb(breadcrumb);
    }
    // Health check
    healthCheck() {
        return {
            initialized: this.isInitialized,
            dsnConfigured: !!process.env.SENTRY_DSN
        };
    }
}
exports.SentryLogger = SentryLogger;
exports.default = SentryLogger;
//# sourceMappingURL=sentryLogger.js.map