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
exports.SentryMonitor = exports.sentryConfig = void 0;
// Sentry Error Tracking Configuration
const Sentry = __importStar(require("@sentry/node"));
const tracing_1 = require("@sentry/tracing");
// Sentry Configuration for GamePilot Production
exports.sentryConfig = {
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',
    release: process.env.GAMEPILOT_VERSION || '1.0.0',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),
    debug: process.env.NODE_ENV === 'development',
    integrations: [
        new tracing_1.Integrations.Http({ tracing: true }),
        new tracing_1.Integrations.Express({ app: undefined }),
        new tracing_1.Integrations.Mongo(),
        new tracing_1.Integrations.Postgres(),
        new tracing_1.Integrations.Redis(),
        new tracing_1.Integrations.Dedupe(),
        new tracing_1.Integrations.InboundFilters(),
        new tracing_1.Integrations.FunctionToString(),
        new tracing_1.Integrations.LinkedErrors(),
        new tracing_1.Integrations.RequestData(),
        new tracing_1.Integrations.Modules(),
        new tracing_1.Integrations.OnUnhandledRejection({ mode: 'warn' }),
        new tracing_1.Integrations.LocalVariables(),
        new tracing_1.Integrations.Console(),
    ],
    beforeSend: (event) => {
        // Filter out sensitive information
        if (event.request) {
            // Remove headers that might contain sensitive data
            if (event.request.headers) {
                delete event.request.headers.authorization;
                delete event.request.headers.cookie;
                delete event.request.headers['x-api-key'];
            }
            // Remove query parameters that might contain sensitive data
            if (event.request.query_string) {
                const queryString = event.request.query_string;
                const url = new URL(`http://localhost${queryString}`)
                // Remove sensitive query params
                ['password', 'token', 'key', 'secret', 'auth'].forEach(param => {
                    url.searchParams.delete(param);
                });
                event.request.query_string = url.search;
            }
        }
        // Filter out PII from user data
        if (event.user) {
            delete event.user.email;
            delete event.user.ip_address;
        }
        return event;
    },
    ignoreErrors: [
        // Ignore common non-critical errors
        'ResizeObserver loop limit exceeded',
        'Network request failed',
        'AbortError',
        'ChunkLoadError',
        'Loading chunk',
        'Non-Error promise rejection captured',
    ],
    denyUrls: [
        // Ignore errors from third-party scripts
        /extensions\//i,
        /^chrome:\/\//i,
        /^chrome-extension:\/\//i,
        /^moz-extension:\/\//i,
        /^safari-extension:\/\//i,
        /^webapp:\/\//i,
        /cdn\.segment\.com/i,
        /analytics\.google\.com/i,
        /googletagmanager\.com/i,
        /googletagservices\.com/i,
        /google-analytics\.com/i,
        /connect\.facebook\.net/i,
        /platform\.twitter\.com/i,
        /api\.instagram\.com/i,
        /cdn\.jsdelivr\.net/i,
        /cdnjs\.cloudflare\.com/i,
    ]
};
// Initialize Sentry if DSN is provided
if (process.env.SENTRY_DSN && process.env.NODE_ENV === 'production') {
    Sentry.init(exports.sentryConfig);
}
// Custom Sentry error tracking utilities
class SentryMonitor {
    // Track custom errors
    static trackError(error, context) {
        Sentry.captureException(error, context);
    }
    // Track custom messages
    static trackMessage(message, level = 'info', context) {
        Sentry.captureMessage(message, level, context);
    }
    // Track user context
    static setUser(user) {
        Sentry.setUser(user);
    }
    // Clear user context
    static clearUser() {
        Sentry.setUser(null);
    }
    // Track tags
    static setTags(tags) {
        Sentry.setTags(tags);
    }
    // Track extra context
    static setExtras(extras) {
        Sentry.setExtras(extras);
    }
    // Track breadcrumbs
    static addBreadcrumb(breadcrumb) {
        Sentry.addBreadcrumb(breadcrumb);
    }
    // Track custom transaction
    static startTransaction(name, op) {
        return Sentry.startTransaction({
            name,
            op,
            tags: {
                environment: process.env.NODE_ENV || 'development',
                version: process.env.GAMEPILOT_VERSION || '1.0.0'
            }
        });
    }
    // Track API errors
    static trackAPIError(error, endpoint, method, statusCode, userId) {
        const context = {
            tags: {
                endpoint,
                method,
                statusCode: statusCode?.toString() || 'unknown',
                userId: userId || 'anonymous'
            },
            extra: {
                timestamp: new Date().toISOString(),
                userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
            }
        };
        Sentry.captureException(error, context);
    }
    // Track database errors
    static trackDatabaseError(error, query, database, userId) {
        const context = {
            tags: {
                database,
                query: query.substring(0, 100), // Limit query length
                userId: userId || 'anonymous'
            },
            extra: {
                timestamp: new Date().toISOString(),
                queryLength: query.length
            }
        };
        Sentry.captureException(error, context);
    }
    // Track integration errors
    static trackIntegrationError(error, platform, operation, userId) {
        const context = {
            tags: {
                platform,
                operation,
                userId: userId || 'anonymous'
            },
            extra: {
                timestamp: new Date().toISOString(),
                errorType: error.constructor.name
            }
        };
        Sentry.captureException(error, context);
    }
    // Track authentication errors
    static trackAuthError(error, authMethod, userId) {
        const context = {
            tags: {
                authMethod,
                userId: userId || 'anonymous',
                errorType: error.constructor.name
            },
            extra: {
                timestamp: new Date().toISOString(),
                sensitive: true
            }
        };
        Sentry.captureException(error, context);
    }
    // Track validation errors
    static trackValidationError(error, field, value, userId) {
        const context = {
            tags: {
                field,
                userId: userId || 'anonymous',
                errorType: 'ValidationError'
            },
            extra: {
                timestamp: new Date().toISOString(),
                valueType: typeof value,
                valueLength: typeof value === 'string' ? value.length : undefined
            }
        };
        Sentry.captureException(error, context);
    }
    // Track performance issues
    static trackPerformanceIssue(operation, duration, threshold, userId) {
        const context = {
            tags: {
                operation,
                userId: userId || 'anonymous',
                performanceIssue: 'true'
            },
            extra: {
                timestamp: new Date().toISOString(),
                duration,
                threshold,
                exceededBy: duration - threshold
            }
        };
        Sentry.captureMessage(`Performance issue: ${operation} took ${duration}ms (threshold: ${threshold}ms)`, 'warning', context);
    }
    // Track memory issues
    static trackMemoryIssue(heapUsed, heapTotal, threshold, userId) {
        const usagePercent = (heapUsed / heapTotal) * 100;
        const context = {
            tags: {
                userId: userId || 'anonymous',
                memoryIssue: 'true'
            },
            extra: {
                timestamp: new Date().toISOString(),
                heapUsed,
                heapTotal,
                usagePercent,
                threshold,
                exceededBy: usagePercent - threshold
            }
        };
        Sentry.captureMessage(`Memory issue: ${usagePercent.toFixed(2)}% used (threshold: ${threshold}%)`, 'warning', context);
    }
    // Track security issues
    static trackSecurityIssue(issue, details, userId) {
        const context = {
            tags: {
                securityIssue: 'true',
                userId: userId || 'anonymous'
            },
            extra: {
                timestamp: new Date().toISOString(),
                ...details
            }
        };
        Sentry.captureMessage(`Security issue: ${issue}`, 'error', context);
    }
    // Track business logic errors
    static trackBusinessError(error, operation, context, userId) {
        const captureContext = {
            tags: {
                operation,
                userId: userId || 'anonymous',
                businessError: 'true'
            },
            extra: {
                timestamp: new Date().toISOString(),
                ...context
            }
        };
        Sentry.captureException(error, captureContext);
    }
    // Track user feedback
    static trackUserFeedback(feedback, rating, userId) {
        const context = {
            tags: {
                userId: userId || 'anonymous',
                userFeedback: 'true',
                rating: rating.toString()
            },
            extra: {
                timestamp: new Date().toISOString(),
                feedbackLength: feedback.length
            }
        };
        Sentry.captureMessage(`User feedback: ${rating}/5 - ${feedback.substring(0, 100)}...`, 'info', context);
    }
    // Track feature usage
    static trackFeatureUsage(feature, action, userId) {
        const context = {
            tags: {
                feature,
                action,
                userId: userId || 'anonymous',
                featureUsage: 'true'
            },
            extra: {
                timestamp: new Date().toISOString()
            }
        };
        Sentry.captureMessage(`Feature usage: ${feature} - ${action}`, 'info', context);
    }
    // Track A/B test events
    static trackABTest(testName, variation, userId) {
        const context = {
            tags: {
                testName,
                variation,
                userId: userId || 'anonymous',
                abTest: 'true'
            },
            extra: {
                timestamp: new Date().toISOString()
            }
        };
        Sentry.captureMessage(`A/B test: ${testName} - ${variation}`, 'info', context);
    }
    // Track search errors
    static trackSearchError(error, query, results, userId) {
        const context = {
            tags: {
                query: query.substring(0, 50),
                results: results?.toString() || '0',
                userId: userId || 'anonymous',
                searchError: 'true'
            },
            extra: {
                timestamp: new Date().toISOString(),
                queryLength: query.length
            }
        };
        Sentry.captureException(error, context);
    }
    // Track file upload errors
    static trackFileUploadError(error, fileName, fileSize, userId) {
        const context = {
            tags: {
                fileName,
                fileSize: fileSize.toString(),
                userId: userId || 'anonymous',
                fileUploadError: 'true'
            },
            extra: {
                timestamp: new Date().toISOString(),
                fileType: fileName.split('.').pop()
            }
        };
        Sentry.captureException(error, context);
    }
    // Track WebSocket errors
    static trackWebSocketError(error, event, userId) {
        const context = {
            tags: {
                event,
                userId: userId || 'anonymous',
                webSocketError: 'true'
            },
            extra: {
                timestamp: new Date().toISOString(),
                errorType: error.constructor.name
            }
        };
        Sentry.captureException(error, context);
    }
    // Track cache errors
    static trackCacheError(error, cacheKey, operation, userId) {
        const context = {
            tags: {
                cacheKey: cacheKey.substring(0, 50),
                operation,
                userId: userId || 'anonymous',
                cacheError: 'true'
            },
            extra: {
                timestamp: new Date().toISOString(),
                keyLength: cacheKey.length
            }
        };
        Sentry.captureException(error, context);
    }
    // Track rate limiting errors
    static trackRateLimitError(error, endpoint, limit, userId) {
        const context = {
            tags: {
                endpoint,
                limit: limit.toString(),
                userId: userId || 'anonymous',
                rateLimitError: 'true'
            },
            extra: {
                timestamp: new Date().toISOString(),
                errorType: error.constructor.name
            }
        };
        Sentry.captureException(error, context);
    }
    // Track third-party service errors
    static trackThirdPartyError(error, service, operation, userId) {
        const context = {
            tags: {
                service,
                operation,
                userId: userId || 'anonymous',
                thirdPartyError: 'true'
            },
            extra: {
                timestamp: new Date().toISOString(),
                errorType: error.constructor.name
            }
        };
        Sentry.captureException(error, context);
    }
    // Track configuration errors
    static trackConfigError(error, configKey, environment) {
        const context = {
            tags: {
                configKey,
                environment,
                configError: 'true'
            },
            extra: {
                timestamp: new Date().toISOString(),
                errorType: error.constructor.name
            }
        };
        Sentry.captureException(error, context);
    }
    // Track deployment errors
    static trackDeploymentError(error, version, environment) {
        const context = {
            tags: {
                version,
                environment,
                deploymentError: 'true'
            },
            extra: {
                timestamp: new Date().toISOString(),
                errorType: error.constructor.name
            }
        };
        Sentry.captureException(error, context);
    }
    // Get Sentry client for advanced usage
    static getClient() {
        return Sentry.getCurrentHub().getClient();
    }
    // Get current scope
    static getScope() {
        return Sentry.getCurrentHub().getScope();
    }
    // Flush pending events
    static flush(timeout) {
        return Sentry.flush(timeout);
    }
    // Close Sentry client
    static close(timeout) {
        return Sentry.close(timeout);
    }
}
exports.SentryMonitor = SentryMonitor;
// Export default for easy import
exports.default = SentryMonitor;
