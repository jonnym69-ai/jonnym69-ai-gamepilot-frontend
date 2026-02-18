/**
 * Alert configuration
 */
interface AlertConfig {
    slack?: {
        webhookUrl: string;
        channel: string;
        enabled: boolean;
    };
    email?: {
        smtp: {
            host: string;
            port: number;
            secure: boolean;
            auth: {
                user: string;
                pass: string;
            };
        };
        from: string;
        to: string[];
        enabled: boolean;
    };
    thresholds: {
        errorRate: {
            warning: number;
            critical: number;
        };
        responseTime: {
            warning: number;
            critical: number;
        };
        successRate: {
            warning: number;
            critical: number;
        };
        slowQueries: {
            warning: number;
            critical: number;
        };
    };
}
/**
 * Alert data structure
 */
interface Alert {
    type: 'error_rate' | 'response_time' | 'success_rate' | 'critical_error' | 'slow_queries' | 'system_down';
    severity: 'info' | 'warning' | 'critical';
    message: string;
    value: number;
    threshold: number;
    timestamp: Date;
    metadata?: Record<string, any>;
}
/**
 * Alerting service for Slack and email notifications
 */
export declare class AlertingService {
    private config;
    private emailTransporter;
    private alertHistory;
    private cooldownPeriod;
    constructor();
    /**
     * Load alert configuration from environment variables
     */
    private loadConfig;
    /**
     * Initialize email transporter
     */
    private initializeEmailTransporter;
    /**
     * Send alert through configured channels
     */
    sendAlert(alert: Alert): Promise<void>;
    /**
     * Send alert to Slack
     */
    private sendSlackAlert;
    /**
     * Send email alert
     */
    private sendEmailAlert;
    /**
     * Generate HTML email content
     */
    private generateEmailHtml;
    /**
     * Get Slack color based on severity
     */
    private getSlackColor;
    /**
     * Get Slack emoji based on severity
     */
    private getSlackEmoji;
    /**
     * Get email color based on severity
     */
    private getEmailColor;
    /**
     * Get email emoji based on severity
     */
    private getEmailEmoji;
    /**
     * Send system down alert
     */
    sendSystemDownAlert(error?: Error): Promise<void>;
    /**
     * Send custom alert
     */
    sendCustomAlert(type: string, severity: 'info' | 'warning' | 'critical', message: string, value: number, threshold: number, metadata?: Record<string, any>): Promise<void>;
    /**
     * Check if alerting is enabled for a channel
     */
    isAlertingEnabled(channel: 'slack' | 'email'): boolean;
    /**
     * Get alert configuration
     */
    getConfig(): AlertConfig;
    /**
     * Update alert configuration
     */
    updateConfig(newConfig: Partial<AlertConfig>): void;
    /**
     * Test alert configuration
     */
    testAlerts(): Promise<{
        slack: boolean;
        email: boolean;
        config: AlertConfig;
    }>;
    /**
     * Get alert statistics
     */
    getAlertStats(): {
        totalAlerts: number;
        alertsByType: Record<string, number>;
        alertsBySeverity: Record<string, number>;
        lastAlerts: Array<{
            type: string;
            severity: string;
            timestamp: Date;
        }>;
    };
}
export {};
//# sourceMappingURL=alertingService.d.ts.map