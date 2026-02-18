"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeRealTimeMonitoring = initializeRealTimeMonitoring;
const express_1 = require("express");
const identityService_1 = require("../identity/identityService");
const realTimeMonitoringService_1 = require("../services/realTimeMonitoringService");
const alertingService_1 = require("../services/alertingService");
const router = (0, express_1.Router)();
// These will be initialized in the main server file
let realTimeService = null;
let alertingService = null;
/**
 * Initialize real-time monitoring service
 */
function initializeRealTimeMonitoring(server, db) {
    if (!realTimeService) {
        realTimeService = new realTimeMonitoringService_1.RealTimeMonitoringService(server, db);
        alertingService = new alertingService_1.AlertingService();
        console.log('✅ Real-time monitoring service initialized');
    }
}
/**
 * GET /api/realtime/status
 * Get real-time monitoring status
 */
router.get('/status', identityService_1.authenticateToken, async (req, res) => {
    try {
        if (!realTimeService) {
            return res.status(503).json({
                success: false,
                error: 'Real-time monitoring not available'
            });
        }
        const status = realTimeService.getMonitoringStatus();
        const alertStats = alertingService?.getAlertStats() || {
            totalAlerts: 0,
            alertsByType: {},
            alertsBySeverity: {},
            lastAlerts: []
        };
        res.json({
            success: true,
            data: {
                monitoring: status,
                alerts: alertStats,
                config: alertingService?.getConfig() || null
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Failed to get real-time status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get real-time status'
        });
    }
});
/**
 * POST /api/realtime/alerts/test
 * Test alert configuration
 */
router.post('/alerts/test', identityService_1.authenticateToken, async (req, res) => {
    try {
        if (!alertingService) {
            return res.status(503).json({
                success: false,
                error: 'Alerting service not available'
            });
        }
        const results = await alertingService.testAlerts();
        res.json({
            success: true,
            data: {
                message: 'Alert test completed',
                results
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Failed to test alerts:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to test alerts'
        });
    }
});
/**
 * POST /api/realtime/alerts/custom
 * Send custom alert
 */
router.post('/alerts/custom', identityService_1.authenticateToken, async (req, res) => {
    try {
        if (!alertingService) {
            return res.status(503).json({
                success: false,
                error: 'Alerting service not available'
            });
        }
        const { type, severity, message, value, threshold, metadata } = req.body;
        if (!type || !severity || !message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: type, severity, message'
            });
        }
        await alertingService.sendCustomAlert(type, severity, message, value || 0, threshold || 0, metadata);
        res.json({
            success: true,
            message: 'Custom alert sent successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Failed to send custom alert:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send custom alert'
        });
    }
});
/**
 * GET /api/realtime/config
 * Get alerting configuration
 */
router.get('/config', identityService_1.authenticateToken, async (req, res) => {
    try {
        if (!alertingService) {
            return res.status(503).json({
                success: false,
                error: 'Alerting service not available'
            });
        }
        const config = alertingService.getConfig();
        // Remove sensitive information
        const safeConfig = {
            ...config,
            email: config.email ? {
                ...config.email,
                smtp: config.email.smtp ? {
                    ...config.email.smtp,
                    auth: config.email.smtp.auth ? {
                        user: config.email.smtp.auth.user,
                        pass: '***'
                    } : undefined
                } : undefined
            } : undefined,
            slack: config.slack ? {
                ...config.slack,
                webhookUrl: config.slack.webhookUrl ? '***' : undefined
            } : undefined
        };
        res.json({
            success: true,
            data: safeConfig,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Failed to get alerting config:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get alerting config'
        });
    }
});
/**
 * PUT /api/realtime/config
 * Update alerting configuration
 */
router.put('/config', identityService_1.authenticateToken, async (req, res) => {
    try {
        if (!alertingService) {
            return res.status(503).json({
                success: false,
                error: 'Alerting service not available'
            });
        }
        const newConfig = req.body;
        // Validate configuration
        if (newConfig.thresholds) {
            const { thresholds } = newConfig;
            if (thresholds.errorRate && (thresholds.errorRate.warning < 0 || thresholds.errorRate.warning > 1)) {
                return res.status(400).json({
                    success: false,
                    error: 'Error rate threshold must be between 0 and 1'
                });
            }
            if (thresholds.responseTime && (thresholds.responseTime.warning < 0 || thresholds.responseTime.critical < thresholds.responseTime.warning)) {
                return res.status(400).json({
                    success: false,
                    error: 'Response time thresholds must be positive and critical > warning'
                });
            }
            if (thresholds.successRate && (thresholds.successRate.warning < 0 || thresholds.successRate.warning > 1)) {
                return res.status(400).json({
                    success: false,
                    error: 'Success rate threshold must be between 0 and 1'
                });
            }
        }
        alertingService.updateConfig(newConfig);
        res.json({
            success: true,
            message: 'Alerting configuration updated',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Failed to update alerting config:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update alerting config'
        });
    }
});
/**
 * GET /api/realtime/clients
 * Get connected WebSocket clients
 */
router.get('/clients', identityService_1.authenticateToken, async (req, res) => {
    try {
        if (!realTimeService) {
            return res.status(503).json({
                success: false,
                error: 'Real-time monitoring not available'
            });
        }
        const clientCount = realTimeService.getConnectedClientsCount();
        res.json({
            success: true,
            data: {
                connectedClients: clientCount,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('❌ Failed to get client count:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get client count'
        });
    }
});
/**
 * POST /api/realtime/broadcast
 * Broadcast message to all connected clients
 */
router.post('/broadcast', identityService_1.authenticateToken, async (req, res) => {
    try {
        if (!realTimeService) {
            return res.status(503).json({
                success: false,
                error: 'Real-time monitoring not available'
            });
        }
        const { event, data } = req.body;
        if (!event) {
            return res.status(400).json({
                success: false,
                error: 'Missing event name'
            });
        }
        realTimeService.broadcastAlert({
            type: 'custom',
            severity: 'info',
            message: `Broadcast: ${event}`,
            value: 0,
            threshold: 0,
            timestamp: new Date(),
            metadata: data
        });
        res.json({
            success: true,
            message: 'Message broadcasted to all clients',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ Failed to broadcast message:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to broadcast message'
        });
    }
});
exports.default = router;
//# sourceMappingURL=realTime.js.map