import { Database } from 'sqlite';
/**
 * Real-time monitoring service for live dashboard updates
 */
export declare class RealTimeMonitoringService {
    private io;
    private observabilityService;
    private alertingService;
    private monitoringInterval;
    private connectedClients;
    private lastHealthMetrics;
    constructor(server: any, db: Database);
    /**
     * Setup WebSocket event handlers
     */
    private setupSocketHandlers;
    /**
     * Start real-time monitoring
     */
    private startMonitoring;
    /**
     * Check for alert conditions
     */
    private checkAlerts;
    /**
     * Broadcast performance updates
     */
    private broadcastPerformanceUpdates;
    /**
     * Broadcast mood-persona updates
     */
    private broadcastMoodPersonaUpdates;
    /**
     * Send health update to specific client
     */
    private sendHealthUpdate;
    /**
     * Broadcast system-wide alert
     */
    broadcastAlert(alert: any): void;
    /**
     * Get connected clients count
     */
    getConnectedClientsCount(): number;
    /**
     * Get monitoring status
     */
    getMonitoringStatus(): {
        isActive: boolean;
        connectedClients: number;
        lastUpdate: Date | null;
        uptime: number;
    };
    /**
     * Stop monitoring
     */
    stopMonitoring(): void;
    /**
     * Graceful shutdown
     */
    shutdown(): Promise<void>;
}
//# sourceMappingURL=realTimeMonitoringService.d.ts.map