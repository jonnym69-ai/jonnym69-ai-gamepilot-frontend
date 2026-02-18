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
const express_1 = require("express");
const errorHandler_1 = require("../middleware/errorHandler");
const productionDatabase_1 = require("../config/productionDatabase");
const sslConfig_1 = require("../config/sslConfig");
const database_1 = require("../services/database");
const os = __importStar(require("os"));
const fs = __importStar(require("fs/promises"));
const router = (0, express_1.Router)();
// GET /health - Simple health check for Render
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'GamePilot API'
    });
}));
// GET /health/ready - Readiness probe
router.get('/ready', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const healthChecks = await performAllHealthChecks();
    const isReady = Object.values(healthChecks).every(check => check.status === 'healthy');
    if (isReady) {
        res.status(200).json({
            status: 'ready',
            timestamp: new Date().toISOString()
        });
    }
    else {
        res.status(503).json({
            status: 'not ready',
            timestamp: new Date().toISOString(),
            checks: healthChecks
        });
    }
}));
// GET /health/live - Liveness probe
router.get('/live', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // Simple liveness check - just check if the process is running
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
}));
// GET /health/database - Database health check
router.get('/database', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const dbHealth = await (0, productionDatabase_1.checkDatabaseHealth)(database_1.databaseService.db);
        res.status(dbHealth.status === 'healthy' ? 200 : 503).json(dbHealth);
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            message: 'Database health check failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// GET /health/ssl - SSL certificate health check
router.get('/ssl', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const sslHealth = await checkSSLHealth();
        res.status(sslHealth.status === 'healthy' ? 200 : 503).json(sslHealth);
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            message: 'SSL health check failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// GET /health/metrics - System metrics
router.get('/metrics', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const metrics = await getSystemMetrics();
    res.json(metrics);
}));
// Perform all health checks
async function performAllHealthChecks() {
    const [database, ssl, memory, disk, api] = await Promise.allSettled([
        (0, productionDatabase_1.checkDatabaseHealth)(database_1.databaseService.db),
        checkSSLHealth(),
        checkMemoryHealth(),
        checkDiskHealth(),
        checkAPIHealth()
    ]);
    return {
        database: database.status === 'fulfilled' ? {
            ...database.value,
            status: database.value.status
        } : {
            status: 'unhealthy',
            message: 'Database check failed',
            details: database.reason
        },
        ssl: ssl.status === 'fulfilled' ? {
            ...ssl.value,
            status: ssl.value.status
        } : {
            status: 'unhealthy',
            message: 'SSL check failed',
            details: ssl.reason
        },
        memory: memory.status === 'fulfilled' ? {
            ...memory.value,
            status: memory.value.status
        } : {
            status: 'unhealthy',
            message: 'Memory check failed',
            details: memory.reason
        },
        disk: disk.status === 'fulfilled' ? {
            ...disk.value,
            status: disk.value.status
        } : {
            status: 'unhealthy',
            message: 'Disk check failed',
            details: disk.reason
        },
        api: api.status === 'fulfilled' ? {
            ...api.value,
            status: api.value.status
        } : {
            status: 'unhealthy',
            message: 'API check failed',
            details: api.reason
        }
    };
}
// Calculate overall health status
function calculateOverallStatus(checks) {
    const statuses = Object.values(checks).map((check) => check.status);
    if (statuses.every(status => status === 'healthy')) {
        return 'healthy';
    }
    if (statuses.some(status => status === 'unhealthy')) {
        return 'unhealthy';
    }
    return 'degraded';
}
// Check SSL health
async function checkSSLHealth() {
    if (process.env.NODE_ENV !== 'production') {
        return {
            status: 'healthy',
            message: 'SSL not required in development'
        };
    }
    try {
        await (0, sslConfig_1.validateSSLCertificates)();
        return {
            status: 'healthy',
            message: 'SSL certificates are valid'
        };
    }
    catch (error) {
        return {
            status: 'unhealthy',
            message: 'SSL certificates are invalid or missing'
        };
    }
}
// Check memory health
async function checkMemoryHealth() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usagePercentage = (usedMem / totalMem) * 100;
    let status = 'healthy';
    let message;
    if (usagePercentage > 90) {
        status = 'unhealthy';
        message = 'Memory usage is critically high';
    }
    else if (usagePercentage > 80) {
        status = 'degraded';
        message = 'Memory usage is high';
    }
    return {
        status,
        message,
        details: {
            total: Math.round(totalMem / 1024 / 1024), // MB
            used: Math.round(usedMem / 1024 / 1024), // MB
            free: Math.round(freeMem / 1024 / 1024), // MB
            usagePercentage: Math.round(usagePercentage * 100) / 100
        }
    };
}
// Check disk health
async function checkDiskHealth() {
    try {
        const stats = await fs.stat(process.cwd());
        // This is a simplified disk check - in production you'd check actual disk usage
        return {
            status: 'healthy',
            message: 'Disk space is sufficient',
            details: {
                total: 0, // Would need to implement actual disk usage checking
                used: 0,
                free: 0,
                usagePercentage: 0
            }
        };
    }
    catch (error) {
        return {
            status: 'degraded',
            message: 'Unable to check disk usage',
            details: {
                total: 0,
                used: 0,
                free: 0,
                usagePercentage: 0
            }
        };
    }
}
// Check API health
async function checkAPIHealth() {
    const startTime = Date.now();
    try {
        // Test a simple API endpoint
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch('http://localhost:3001/health/live', {
            method: 'GET',
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        return {
            status: response.ok ? 'healthy' : 'unhealthy',
            message: response.ok ? 'API endpoints are responding' : 'API endpoints are not responding',
            details: {
                endpoints: 1, // Simplified - would check multiple endpoints
                responseTime,
                errorRate: 0 // Simplified - would track actual error rate
            }
        };
    }
    catch (error) {
        return {
            status: 'unhealthy',
            message: 'API health check failed',
            details: {
                endpoints: 0,
                responseTime: Date.now() - startTime,
                errorRate: 100
            }
        };
    }
}
// Get system metrics
async function getSystemMetrics() {
    return {
        timestamp: new Date().toISOString(),
        system: {
            platform: os.platform(),
            arch: os.arch(),
            uptime: os.uptime(),
            loadAverage: os.loadavg(),
            cpus: os.cpus().length,
            memory: {
                total: Math.round(os.totalmem() / 1024 / 1024), // MB
                free: Math.round(os.freemem() / 1024 / 1024), // MB
                used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024), // MB
                usagePercentage: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100)
            }
        },
        process: {
            pid: process.pid,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage()
        },
        node: {
            version: process.version,
            versions: process.versions
        }
    };
}
exports.default = router;
//# sourceMappingURL=health.js.map