"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertingService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const axios_1 = __importDefault(require("axios"));
/**
 * Alerting service for Slack and email notifications
 */
class AlertingService {
    constructor() {
        this.emailTransporter = null;
        this.alertHistory = new Map();
        this.cooldownPeriod = 300000; // 5 minutes cooldown between same alert type
        this.config = this.loadConfig();
        this.initializeEmailTransporter();
    }
    /**
     * Load alert configuration from environment variables
     */
    loadConfig() {
        return {
            slack: {
                webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
                channel: process.env.SLACK_CHANNEL || '#alerts',
                enabled: process.env.SLACK_ENABLED === 'true'
            },
            email: {
                smtp: {
                    host: process.env.SMTP_HOST || 'localhost',
                    port: parseInt(process.env.SMTP_PORT || '587'),
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                        user: process.env.SMTP_USER || '',
                        pass: process.env.SMTP_PASS || ''
                    }
                },
                from: process.env.EMAIL_FROM || 'alerts@gamepilot.dev',
                to: process.env.EMAIL_TO?.split(',') || [],
                enabled: process.env.EMAIL_ENABLED === 'true'
            },
            thresholds: {
                errorRate: {
                    warning: parseFloat(process.env.ALERT_ERROR_RATE_WARNING || '0.02'),
                    critical: parseFloat(process.env.ALERT_ERROR_RATE_CRITICAL || '0.05')
                },
                responseTime: {
                    warning: parseInt(process.env.ALERT_RESPONSE_TIME_WARNING || '1000'),
                    critical: parseInt(process.env.ALERT_RESPONSE_TIME_CRITICAL || '2000')
                },
                successRate: {
                    warning: parseFloat(process.env.ALERT_SUCCESS_RATE_WARNING || '0.95'),
                    critical: parseFloat(process.env.ALERT_SUCCESS_RATE_CRITICAL || '0.90')
                },
                slowQueries: {
                    warning: parseInt(process.env.ALERT_SLOW_QUERIES_WARNING || '3'),
                    critical: parseInt(process.env.ALERT_SLOW_QUERIES_CRITICAL || '10')
                }
            }
        };
    }
    /**
     * Initialize email transporter
     */
    initializeEmailTransporter() {
        if (this.config.email?.enabled) {
            try {
                this.emailTransporter = nodemailer_1.default.createTransport({
                    host: this.config.email.smtp.host,
                    port: this.config.email.smtp.port,
                    secure: this.config.email.smtp.secure,
                    auth: this.config.email.smtp.auth
                });
                console.log('✅ Email transporter initialized');
            }
            catch (error) {
                console.error('❌ Failed to initialize email transporter:', error);
                this.emailTransporter = null;
            }
        }
    }
    /**
     * Send alert through configured channels
     */
    async sendAlert(alert) {
        const alertKey = `${alert.type}_${alert.severity}`;
        const now = new Date();
        const lastAlert = this.alertHistory.get(alertKey);
        // Check cooldown period
        if (lastAlert && (now.getTime() - lastAlert.getTime()) < this.cooldownPeriod) {
            console.log(`⏸️ Alert cooldown active for ${alertKey}`);
            return;
        }
        // Update alert history
        this.alertHistory.set(alertKey, now);
        // Send to Slack
        if (this.config.slack?.enabled && this.config.slack.webhookUrl) {
            await this.sendSlackAlert(alert);
        }
        // Send email
        if (this.config.email?.enabled && this.emailTransporter) {
            await this.sendEmailAlert(alert);
        }
        // Log alert
        console.log(`🚨 Alert sent: [${alert.severity.toUpperCase()}] ${alert.message}`);
    }
    /**
     * Send alert to Slack
     */
    async sendSlackAlert(alert) {
        try {
            const color = this.getSlackColor(alert.severity);
            const emoji = this.getSlackEmoji(alert.severity);
            const payload = {
                channel: this.config.slack?.channel ?? "#alerts",
                username: 'GamePilot Alerts',
                icon_emoji: ':robot_face:',
                attachments: [
                    {
                        color,
                        title: `${emoji} ${alert.severity.toUpperCase()} Alert`,
                        text: alert.message,
                        fields: [
                            {
                                title: 'Type',
                                value: alert.type,
                                short: true
                            },
                            {
                                title: 'Value',
                                value: alert.value.toString(),
                                short: true
                            },
                            {
                                title: 'Threshold',
                                value: alert.threshold.toString(),
                                short: true
                            },
                            {
                                title: 'Time',
                                value: alert.timestamp.toISOString(),
                                short: true
                            }
                        ],
                        footer: 'GamePilot Monitoring System',
                        ts: Math.floor(alert.timestamp.getTime() / 1000)
                    }
                ]
            };
            await axios_1.default.post(this.config.slack?.webhookUrl ?? "", payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000
            });
            console.log('✅ Slack alert sent successfully');
        }
        catch (error) {
            console.error('❌ Failed to send Slack alert:', error);
        }
    }
    /**
     * Send email alert
     */
    async sendEmailAlert(alert) {
        if (!this.emailTransporter || !this.config.email?.to?.length) {
            return;
        }
        try {
            const subject = `[${alert.severity.toUpperCase()}] GamePilot Alert: ${alert.type}`;
            const html = this.generateEmailHtml(alert);
            await this.emailTransporter.sendMail({
                from: this.config.email?.from ?? "",
                to: this.config.email?.to ?? [],
                subject,
                html
            });
            console.log('✅ Email alert sent successfully');
        }
        catch (error) {
            console.error('❌ Failed to send email alert:', error);
        }
    }
    /**
     * Generate HTML email content
     */
    generateEmailHtml(alert) {
        const color = this.getEmailColor(alert.severity);
        const emoji = this.getEmailEmoji(alert.severity);
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>GamePilot Alert</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: ${color}; color: white; padding: 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 20px; }
          .alert-info { background: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin: 15px 0; }
          .alert-warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
          .alert-critical { background: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 15px 0; }
          .field { margin: 10px 0; }
          .field strong { color: #333; }
          .footer { background: #f8f9fa; padding: 15px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${emoji} GamePilot Alert</h1>
          </div>
          <div class="content">
            <div class="alert-${alert.severity}">
              <h2>${alert.severity.toUpperCase()}</h2>
              <p>${alert.message}</p>
            </div>
            
            <div class="field">
              <strong>Alert Type:</strong> ${alert.type}
            </div>
            <div class="field">
              <strong>Current Value:</strong> ${alert.value}
            </div>
            <div class="field">
              <strong>Threshold:</strong> ${alert.threshold}
            </div>
            <div class="field">
              <strong>Time:</strong> ${alert.timestamp.toISOString()}
            </div>
            
            ${alert.metadata ? `
              <div class="field">
                <strong>Additional Information:</strong>
                <pre>${JSON.stringify(alert.metadata, null, 2)}</pre>
              </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>This alert was generated by the GamePilot Monitoring System</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }
    /**
     * Get Slack color based on severity
     */
    getSlackColor(severity) {
        switch (severity) {
            case 'critical': return '#dc3545';
            case 'warning': return '#ffc107';
            case 'info': return '#17a2b8';
            default: return '#6c757d';
        }
    }
    /**
     * Get Slack emoji based on severity
     */
    getSlackEmoji(severity) {
        switch (severity) {
            case 'critical': return '🚨';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '📢';
        }
    }
    /**
     * Get email color based on severity
     */
    getEmailColor(severity) {
        switch (severity) {
            case 'critical': return '#dc3545';
            case 'warning': return '#ffc107';
            case 'info': return '#17a2b8';
            default: return '#6c757d';
        }
    }
    /**
     * Get email emoji based on severity
     */
    getEmailEmoji(severity) {
        switch (severity) {
            case 'critical': return '🚨';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '📢';
        }
    }
    /**
     * Send system down alert
     */
    async sendSystemDownAlert(error) {
        const alert = {
            type: 'system_down',
            severity: 'critical',
            message: 'GamePilot system is down or unresponsive',
            value: 0,
            threshold: 0,
            timestamp: new Date(),
            metadata: error ? {
                error: error.message,
                stack: error.stack
            } : undefined
        };
        await this.sendAlert(alert);
    }
    /**
     * Send custom alert
     */
    async sendCustomAlert(type, severity, message, value, threshold, metadata) {
        const alert = {
            type: type,
            severity,
            message,
            value,
            threshold,
            timestamp: new Date(),
            metadata
        };
        await this.sendAlert(alert);
    }
    /**
     * Check if alerting is enabled for a channel
     */
    isAlertingEnabled(channel) {
        return this.config[channel]?.enabled || false;
    }
    /**
     * Get alert configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update alert configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        // Reinitialize email transporter if email config changed
        if (newConfig.email) {
            this.initializeEmailTransporter();
        }
    }
    /**
     * Test alert configuration
     */
    async testAlerts() {
        const results = {
            slack: false,
            email: false,
            config: this.config
        };
        // Test Slack
        if (this.isAlertingEnabled('slack')) {
            try {
                await this.sendCustomAlert('test', 'info', 'This is a test alert from GamePilot monitoring system', 1, 0);
                results.slack = true;
                console.log('✅ Slack alert test successful');
            }
            catch (error) {
                console.error('❌ Slack alert test failed:', error);
                results.slack = false;
            }
        }
        // Test Email
        if (this.isAlertingEnabled('email')) {
            try {
                await this.sendCustomAlert('test', 'info', 'This is a test alert from GamePilot monitoring system', 1, 0);
                results.email = true;
                console.log('✅ Email alert test successful');
            }
            catch (error) {
                console.error('❌ Email alert test failed:', error);
                results.email = false;
            }
        }
        return results;
    }
    /**
     * Get alert statistics
     */
    getAlertStats() {
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const recentAlerts = Array.from(this.alertHistory.entries())
            .filter(([_, timestamp]) => timestamp > last24h)
            .map(([key, timestamp]) => {
            const [type, severity] = key.split('_');
            return { type, severity, timestamp };
        });
        const alertsByType = {};
        const alertsBySeverity = {};
        recentAlerts.forEach(alert => {
            alertsByType[alert.type] = (alertsByType[alert.type] || 0) + 1;
            alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;
        });
        return {
            totalAlerts: recentAlerts.length,
            alertsByType,
            alertsBySeverity,
            lastAlerts: recentAlerts.slice(-10)
        };
    }
}
exports.AlertingService = AlertingService;
//# sourceMappingURL=alertingService.js.map