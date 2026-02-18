"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataDogMonitor = exports.datadogConfig = void 0;
// DataDog Performance Monitoring Configuration
const datadog_metrics_1 = require("datadog-metrics");
const datadog_tracer_1 = require("datadog-tracer");
// DataDog Configuration for GamePilot Production
exports.datadogConfig = {
    apiKey: process.env.DATADOG_API_KEY || '',
    appKey: process.env.DATADOG_APP_KEY || '',
    site: process.env.DATADOG_SITE || 'gamepilot-prod',
    env: process.env.NODE_ENV || 'development',
    service: 'gamepilot-api',
    version: process.env.GAMEPILOT_VERSION || '1.0.0',
    tags: {
        env: process.env.NODE_ENV || 'development',
        service: 'gamepilot-api',
        version: process.env.GAMEPILOT_VERSION || '1.0.0'
    }
};
// Initialize DataDog metrics and tracing
let statsd = null;
let tracerInstance = null;
if (process.env.DATADOG_API_KEY && process.env.NODE_ENV === 'production') {
    // Initialize StatsD for custom metrics
    statsd = new datadog_metrics_1.StatsD({
        host: process.env.DATADOG_HOST || 'localhost',
        port: parseInt(process.env.DATADOG_PORT || '8125'),
        prefix: process.env.DATADOG_PREFIX || 'gamepilot.',
        globalTags: {
            env: process.env.NODE_ENV || 'development',
            service: 'gamepilot-api',
            version: process.env.GAMEPILOT_VERSION || '1.0.0'
        }
    });
    // Initialize tracer for distributed tracing
    tracerInstance = datadog_tracer_1.tracer.init({
        service: 'gamepilot-api',
        env: process.env.NODE_ENV || 'development',
        version: process.env.GAMEPILOT_VERSION || '1.0.0',
        apiKey: process.env.DATADOG_API_KEY,
        site: process.env.DATADOG_SITE || 'gamepilot-prod',
        logInjection: true,
        runtimeMetrics: true,
        experimental: {
        // Additional experimental features
        }
    });
}
// Custom DataDog monitoring utilities
class DataDogMonitor {
    // Track custom metrics
    static trackMetric(name, value, tags) {
        if (statsd) {
            const metricTags = { ...exports.datadogConfig.tags, ...tags };
            statsd.gauge(name, value, metricTags);
        }
    }
    // Track counters
    static incrementCounter(name, value = 1, tags) {
        if (statsd) {
            const metricTags = { ...exports.datadogConfig.tags, ...tags };
            statsd.increment(name, value, metricTags);
        }
    }
    // Track histograms
    static trackHistogram(name, value, tags) {
        if (statsd) {
            const metricTags = { ...datadConfig.tags, ...tags };
            statsd.histogram(name, value, metricTags);
        }
    }
    // Track API response time
    static trackApiResponse(endpoint, duration, tags) {
        DataDogMonitor.trackHistogram(`api.response_time.${endpoint}`, duration, {
            endpoint,
            ...tags
        });
    }
    // Track database query performance
    static trackDatabaseQuery(query, duration, tags) {
        DataDogMonitor.trackHistogram(`database.query.${query}`, duration, {
            query,
            ...tags
        });
    }
    // Track cache performance
    static trackCacheHit(key, hit, tags) {
        DataDogMonitor.incrementCounter(`cache.${key}.${hit ? 'hit' : 'miss'}`, 1, {
            key,
            ...tags
        });
    }
    // Track user actions
    static trackUserAction(action, userId, tags) {
        const metricName = userId ? `user.action.${userId}.${action}` : `user.action.${action}`;
        DataDogMonitor.incrementCounter(metricName, 1, {
            action,
            userId: userId || 'anonymous',
            ...tags
        });
    }
    // Track game operations
    static trackGameOperation(operation, gameId, tags) {
        const metricName = gameId ? `game.operation.${gameId}.${operation}` : `game.operation.${operation}`;
        DataDogMonitor.incrementCounter(metricName, 1, {
            operation,
            gameId: gameId || 'unknown',
            ...tags
        });
    }
    // Track integration performance
    static trackIntegrationPerformance(platform, operation, duration, tags) {
        DataDogMonitor.trackHistogram(`integration.${platform}.${operation}`, duration, {
            platform,
            operation,
            ...tags
        });
    }
    // Track mood engine performance
    static trackMoodEnginePerformance(operation, duration, tags) {
        DataDogMonitor.trackHistogram(`mood_engine.${operation}`, duration, {
            operation,
            ...tags
        });
    }
    // Track recommendation performance
    static trackRecommendationPerformance(duration, count, tags) {
        DataDogMonitor.trackHistogram('recommendation.duration', duration, {
            ...tags
        });
        DataDogMonitor.trackMetric('recommendation.count', count, {
            ...tags
        });
    }
    // Track search performance
    static trackSearchPerformance(query, duration, results, tags) {
        DataDogMonitor.trackHistogram(`search.duration.${query}`, duration, {
            query,
            results,
            ...tags
        });
        DataDogMonitor.trackMetric('search.results', results, {
            query,
            ...tags
        });
    }
    // Track file upload performance
    static trackFileUpload(fileSize, duration, tags) {
        DataDogMonitor.trackHistogram('file_upload.size', fileSize, {
            ...tags
        });
        DataDog.trackHistogram('file_upload.duration', duration, {
            ...tags
        });
    }
    // Track WebSocket connections
    static trackWebSocketConnection(action, tags) {
        DataDogMonitor.incrementCounter(`websocket.${action}`, 1, {
            action,
            ...tags
        });
    }
    // Track background jobs
    static trackBackgroundJob(jobName, duration, success, tags) {
        DataDogMonitor.trackHistogram(`background_job.${jobName}.duration`, duration, {
            jobName,
            success,
            ...tags
        });
        DataDogMonitor.incrementCounter(`background_job.${jobName}.${success ? 'success' : 'failure'}`, 1, {
            jobName,
            ...tags
        });
    }
    // Track memory usage
    static trackMemoryUsage(heapUsed, heapTotal, tags) {
        DataDogMonitor.trackMetric('memory.heap_used', heapUsed, {
            ...tags
        });
        DataDog.trackMetric('memory.heap_total', heapTotal, {
            ...tags
        });
        DataDog.trackMetric('memory.heap_usage_percent', (heapUsed / heapTotal) * 100, {
            ...tags
        });
    }
    // Track CPU usage
    static trackCPUUsage(usage, tags) {
        DataDog.trackMetric('cpu.usage', usage, {
            ...tags
        });
    }
    // Track active users
    static trackActiveUsers(count, tags) {
        DataDog.trackMetric('users.active', count, {
            ...tags
        });
    }
    // Track concurrent requests
    static trackConcurrentRequests(count, tags) {
        DataDog.trackMetric('requests.concurrent', count, {
            ...tags
        });
    }
    // Track error rates
    static trackErrorRate(rate, tags) {
        DataDog.trackMetric('errors.rate', rate, {
            ...tags
        });
    }
    // Track response times
    static trackResponseTimes(p50, p95, p99, tags) {
        DataDog.trackHistogram('response_time.p50', p50, {
            ...tags
        });
        DataDog.trackHistogram('response_time.p95', p95, {
            ...tags
        });
        DataDog.trackHistogram('response_time.p99', p99, {
            ...tags
        });
    }
    // Track throughput
    static trackThroughput(requestsPerSecond, tags) {
        DataDog.trackMetric('throughput.requests_per_second', requestsPerSecond, {
            ...tags
        });
    }
    // Custom error tracking
    static trackError(error, context, tags) {
        if (tracerInstance) {
            const span = tracerInstance.startSpan({
                name: error.name || 'Error',
                resource: 'error',
                tags: { ...exports.datadogConfig.tags, ...tags }
            });
            span.setTag('error.message', error.message);
            span.setTag('error.stack', error.stack);
            if (context) {
                Object.entries(context).forEach(([key, value]) => {
                    span.setTag(key, String(value));
                });
            }
            span.finish({ status: 'error' });
        }
    }
    // Custom span tracking
    static startSpan(name, resource, tags) {
        if (tracerInstance) {
            return tracerInstance.startSpan({
                name,
                resource,
                tags: { ...exports.datadogConfig.tags, ...tags }
            });
        }
        return null;
    }
    static finishSpan(span, error) {
        if (span) {
            if (error) {
                span.setTag('error.message', error.message);
                span.setTag('error.stack', error.stack);
                span.finish({ status: 'error' });
            }
            else {
                span.finish();
            }
        }
    }
    // Add tags to span
    static addSpanTag(span, key, value) {
        if (span) {
            span.setTag(key, value);
        }
    }
    // Track database connection pool metrics
    static trackDatabasePoolMetrics(pool, tags) {
        DataDogMonitor.trackMetric('database.pool.total', pool.total, {
            ...tags
        });
        DataDogMonitor.trackMetric('database.pool.idle', pool.idle, {
            ...tags
        });
        DataDog.trackMetric('database.pool.active', pool.active, {
            ...tags
        });
        DataDog.trackMetric('database.pool.waiting', pool.waiting, {
            ...tags
        });
    }
    // Track Redis connection metrics
    static trackRedisMetrics(metrics, tags) {
        DataDogMonitor.trackMetric('redis.connected', metrics.connected, {
            ...tags
        });
        DataDogMonitor.trackMetric('redis.disconnected', metrics.disconnected, {
            ...tags
        });
        DataDog.trackMetric('redis.memory', metrics.memory, {
            ...tags
        });
        DataDog.trackMetric('redis.commands', metrics.commands, {
            ...tags
        });
        DataDog.trackMetric('redis.hits', metrics.hits, {
            ...tags
        });
        DataDog.trackMetric('redis.misses', metrics.misses, {
            ...tags
        });
    }
    // Track WebSocket metrics
    static trackWebSocketMetrics(metrics, tags) {
        DataDogMonitor.trackMetric('websocket.connections', metrics.connections, {
            ...tags
        });
        DataDog.trackMetric('websocket.messages', metrics.messages, {
            ...tags
        });
        DataDogMonitor.trackMetric('websocket.errors', metrics.errors, {
            ...tags
        });
        DataDog.trackMetric('websocket.bytes_received', metrics.bytesReceived, {
            ...tags
        });
        DataDog.trackMetric('websocket.bytes_sent', metrics.bytesSent, {
            ...tags
        });
    }
    // Track integration metrics
    static trackIntegrationMetrics(platform, metrics, tags) {
        DataDogMonitor.incrementCounter(`integration.${platform}.requests`, metrics.requests, {
            platform,
            ...tags
        });
        DataDogMonitor.incrementCounter(`integration.${platform}.errors`, metrics.errors, {
            platform,
            ...tags
        });
        DataDog.trackHistogram(`integration.${platform}.response_time`, metrics.responseTime, {
            platform,
            ...tags
        });
        DataDogMonitor.incrementCounter(`integration.${platform}.cache_hits`, metrics.cacheHits, {
            platform,
            ...tags
        });
        DataDog.incrementCounter(`integration.${platform}.cache_misses`, metrics.cacheMisses, {
            platform,
            ...tags
        });
    }
    // Track user engagement metrics
    static trackUserEngagement(metrics, tags) {
        DataDogMonitor.trackMetric('user_engagement.active_users', metrics.activeUsers, {
            ...tags
        });
        DataDogMonitor.trackMetric('user_engagement.page_views', metrics.pageViews, {
            ...tags
        });
        DataDogMonitor.trackMetric('user_engagement.session_duration', metrics.sessionDuration, {
            ...tags
        });
        DataDog.trackMetric('user_engagement.bounce_rate', metrics.bounceRate, {
            ...tags
        });
        DataDog.trackMetric('user_engagement.retention_rate', metrics.retentionRate, {
            ...tags
        });
    }
    // Track game library metrics
    static trackGameLibraryMetrics(metrics, tags) {
        DataDogMonitor.trackMetric('game_library.total', metrics.totalGames, {
            ...tags
        });
        DataDogMonitor.incrementCounter('game_library.added', metrics.addedGames, {
            ...tags
        });
        DataDogMonitor.incrementCounter('game_library.removed', metrics.removedGames, {
            ...tags
        });
        DataDogMonitor.incrementCounter('game_library.played', metrics.playedGames, {
            ...tags
        });
        DataDogMonitor.incrementCounter('game_library.completed', metrics.completedGames, {
            ...tags
        });
        DataDog.trackMetric('game_library.average_rating', metrics.averageRating, {
            ...tags
        });
    }
    // Track mood engine metrics
    static trackMoodEngineMetrics(metrics, tags) {
        DataDogMonitor.incrementCounter('mood_engine.analyses', metrics.moodAnalyses, {
            ...tags
        });
        DataDogMonitor.incrementCounter('mood_engine.recommendations', metrics.recommendations, {
            ...tags
        });
        DataDog.trackMetric('mood_engine.accuracy', metrics.accuracy, {
            ...tags
        });
        DataDog.trackHistogram('mood_engine.processing_time', metrics.processingTime, {
            ...tags
        });
        DataDog.trackMetric('mood_engine.cache_hit_rate', metrics.cacheHitRate, {
            ...tags
        });
    }
    // Track performance alerts
    static trackPerformanceAlert(alert, tags) {
        DataDogMonitor.trackMetric(`performance_alert.${alert.type}`, alert.currentValue, {
            threshold: alert.threshold,
            severity: alert.severity,
            message: alert.message,
            ...tags
        });
    }
    // Track business metrics
    static trackBusinessMetrics(metrics, tags) {
        DataDogMonitor.incrementCounter('business.new_users', metrics.newUsers, {
            ...tags
        });
        DataDog.incrementCounter('business.returning_users', metrics.returningUsers, {
            ...tags
        });
        DataDog.incrementCounter('business.premium_users', metrics.premiumUsers, {
            ...tags
        });
        DataDogMonitor.trackMetric('business.total_revenue', metrics.totalRevenue, {
            ...tags
        });
        DataDog.trackMetric('business.average_revenue_per_user', metrics.averageRevenuePerUser, {
            ...tags
        });
    }
    // Track security metrics
    static trackSecurityMetrics(metrics, tags) {
        DataDogMonitor.incrementCounter('security.login_attempts', metrics.loginAttempts, {
            ...tags
        });
        DataDogMonitor.incrementCounter('security.failed_logins', metrics.failedLogins, {
            ...tags
        });
        DataDog.incrementCounter('security.suspicious_activity', metrics.suspiciousActivity, {
            ...tags
        });
        DataDog.incrementCounter('security.blocked_requests', metrics.blockedRequests, {
            ...tags
        });
        DataDog.incrementCounter('security.security_events', metrics.securityEvents, {
            ...tags
        });
    }
    // Track API health metrics
    static trackAPIHealthMetrics(metrics, tags) {
        DataDog.trackMetric('api.uptime', metrics.uptime, {
            ...tags
        });
        DataDog.trackHistogram('api.response_time', metrics.responseTime, {
            ...tags
        });
        DataDog.trackMetric('api.error_rate', metrics.errorRate, {
            ...tags
        });
        DataDog.trackMetric('api.request_count', metrics.requestCount, {
            ...tags
        });
        DataDog.trackMetric('api.success_rate', metrics.successRate, {
            ...tags
        });
    }
}
exports.DataDogMonitor = DataDogMonitor;
// Export default for easy import
exports.default = DataDogMonitor;
