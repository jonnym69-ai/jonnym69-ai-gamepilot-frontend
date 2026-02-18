import { EventEmitter } from 'events';
/**
 * Load testing configuration
 */
interface LoadTestConfig {
    concurrentClients: number;
    testDuration: number;
    rampUpTime: number;
    apiEndpoint: string;
    wsEndpoint: string;
    authToken: string;
    scenarios: LoadTestScenario[];
}
/**
 * Load test scenario
 */
interface LoadTestScenario {
    name: string;
    weight: number;
    actions: LoadTestAction[];
}
/**
 * Load test action
 */
interface LoadTestAction {
    type: 'websocket' | 'api' | 'delay';
    weight: number;
    config: {
        endpoint?: string;
        method?: 'GET' | 'POST' | 'PUT' | 'PATCH';
        payload?: any;
        delay?: number;
        socketEvent?: string;
        socketData?: any;
    };
}
/**
 * Load test metrics
 */
interface LoadTestMetrics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    requestsPerSecond: number;
    errorsByType: Record<string, number>;
    websocketConnections: number;
    websocketMessages: number;
    websocketErrors: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: number;
}
/**
 * Comprehensive load testing suite for GamePilot mood-persona system
 */
export declare class LoadTestSuite extends EventEmitter {
    private config;
    private clients;
    private metrics;
    private startTime;
    private isRunning;
    private metricsInterval;
    constructor(config: LoadTestConfig);
    /**
     * Initialize metrics
     */
    private initializeMetrics;
    /**
     * Run comprehensive load test
     */
    runLoadTest(): Promise<LoadTestMetrics>;
    /**
     * Ramp up clients gradually
     */
    private rampUpClients;
    /**
     * Execute load scenarios
     */
    private executeLoadScenarios;
    /**
     * Assign scenarios to clients based on weights
     */
    private assignScenariosToClients;
    /**
     * Ramp down clients
     */
    private rampDownClients;
    /**
     * Start metrics collection
     */
    private startMetricsCollection;
    /**
     * Stop metrics collection
     */
    private stopMetricsCollection;
    /**
     * Collect system metrics
     */
    private collectSystemMetrics;
    /**
     * Generate final report
     */
    private generateFinalReport;
    /**
     * Delay helper
     */
    private delay;
}
export {};
//# sourceMappingURL=loadTestSuite.d.ts.map