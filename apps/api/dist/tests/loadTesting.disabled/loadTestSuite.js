"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadTestSuite = void 0;
const socket_io_client_1 = require("socket.io-client");
const axios_1 = __importDefault(require("axios"));
const perf_hooks_1 = require("perf_hooks");
const events_1 = require("events");
/**
 * Comprehensive load testing suite for GamePilot mood-persona system
 */
class LoadTestSuite extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.clients = [];
        this.startTime = 0;
        this.isRunning = false;
        this.metricsInterval = null;
        this.config = config;
        this.metrics = this.initializeMetrics();
    }
    /**
     * Initialize metrics
     */
    initializeMetrics() {
        return {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            minResponseTime: Infinity,
            maxResponseTime: 0,
            p95ResponseTime: 0,
            p99ResponseTime: 0,
            requestsPerSecond: 0,
            errorsByType: {},
            websocketConnections: 0,
            websocketMessages: 0,
            websocketErrors: 0,
            memoryUsage: process.memoryUsage(),
            cpuUsage: 0
        };
    }
    /**
     * Run comprehensive load test
     */
    async runLoadTest() {
        console.log('🚀 Starting GamePilot Load Test Suite');
        console.log(`📊 Configuration: ${this.config.concurrentClients} concurrent clients, ${this.config.testDuration}s duration`);
        this.startTime = Date.now();
        this.isRunning = true;
        this.metrics = this.initializeMetrics();
        // Start metrics collection
        this.startMetricsCollection();
        try {
            // Phase 1: Ramp up clients
            await this.rampUpClients();
            // Phase 2: Execute load scenarios
            await this.executeLoadScenarios();
            // Phase 3: Ramp down and cleanup
            await this.rampDownClients();
        }
        catch (error) {
            console.error('❌ Load test failed:', error);
            this.emit('error', error);
        }
        finally {
            this.isRunning = false;
            this.stopMetricsCollection();
        }
        // Generate final report
        const finalMetrics = await this.generateFinalReport();
        this.emit('complete', finalMetrics);
        return finalMetrics;
    }
    /**
     * Ramp up clients gradually
     */
    async rampUpClients() {
        console.log('📈 Ramping up clients...');
        const rampUpInterval = this.config.rampUpTime * 1000 / this.config.concurrentClients;
        for (let i = 0; i < this.config.concurrentClients; i++) {
            const client = new LoadTestClient(i, this.config);
            this.clients.push(client);
            // Connect client
            await client.connect();
            this.metrics.websocketConnections++;
            // Wait before next client
            if (i < this.config.concurrentClients - 1) {
                await this.delay(rampUpInterval);
            }
            // Progress logging
            if ((i + 1) % 100 === 0) {
                console.log(`📊 Connected ${i + 1}/${this.config.concurrentClients} clients`);
            }
        }
        console.log('✅ All clients connected');
    }
    /**
     * Execute load scenarios
     */
    async executeLoadScenarios() {
        console.log('🎯 Executing load scenarios...');
        // Assign scenarios to clients based on weights
        this.assignScenariosToClients();
        // Start all clients
        const clientPromises = this.clients.map(client => client.start());
        // Wait for test duration
        await this.delay(this.config.testDuration * 1000);
        // Stop all clients
        this.clients.forEach(client => client.stop());
        // Wait for all clients to finish
        await Promise.allSettled(clientPromises);
        console.log('✅ Load scenarios completed');
    }
    /**
     * Assign scenarios to clients based on weights
     */
    assignScenariosToClients() {
        const scenarios = [];
        this.config.scenarios.forEach(scenario => {
            const count = Math.floor((scenario.weight / 100) * this.config.concurrentClients);
            for (let i = 0; i < count; i++) {
                scenarios.push({ ...scenario });
            }
        });
        // Shuffle and assign to clients
        scenarios.sort(() => Math.random() - 0.5);
        this.clients.forEach((client, index) => {
            if (index < scenarios.length) {
                client.setScenario(scenarios[index]);
            }
        });
    }
    /**
     * Ramp down clients
     */
    async rampDownClients() {
        console.log('📉 Ramping down clients...');
        const disconnectPromises = this.clients.map(client => client.disconnect());
        await Promise.allSettled(disconnectPromises);
        this.clients = [];
        console.log('✅ All clients disconnected');
    }
    /**
     * Start metrics collection
     */
    startMetricsCollection() {
        this.metricsInterval = setInterval(() => {
            this.collectSystemMetrics();
            this.emit('metrics', this.metrics);
        }, 1000); // Collect metrics every second
    }
    /**
     * Stop metrics collection
     */
    stopMetricsCollection() {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
            this.metricsInterval = null;
        }
    }
    /**
     * Collect system metrics
     */
    collectSystemMetrics() {
        this.metrics.memoryUsage = process.memoryUsage();
        // Calculate requests per second
        const elapsedSeconds = (Date.now() - this.startTime) / 1000;
        this.metrics.requestsPerSecond = this.metrics.totalRequests / elapsedSeconds;
    }
    /**
     * Generate final report
     */
    async generateFinalReport() {
        console.log('📊 Generating final load test report...');
        // Collect final metrics from all clients
        const clientMetrics = this.clients.map(client => client.getMetrics());
        // Aggregate metrics
        const allResponseTimes = clientMetrics.flatMap(m => m.responseTimes);
        const allErrors = clientMetrics.flatMap(m => m.errors);
        if (allResponseTimes.length > 0) {
            allResponseTimes.sort((a, b) => a - b);
            this.metrics.minResponseTime = allResponseTimes[0];
            this.metrics.maxResponseTime = allResponseTimes[allResponseTimes.length - 1];
            this.metrics.averageResponseTime = allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length;
            this.metrics.p95ResponseTime = allResponseTimes[Math.floor(allResponseTimes.length * 0.95)];
            this.metrics.p99ResponseTime = allResponseTimes[Math.floor(allResponseTimes.length * 0.99)];
        }
        // Aggregate errors
        allErrors.forEach(error => {
            this.metrics.errorsByType[error.type] = (this.metrics.errorsByType[error.type] || 0) + 1;
        });
        // Aggregate websocket metrics
        clientMetrics.forEach(clientMetric => {
            this.metrics.websocketMessages += clientMetric.websocketMessages;
            this.metrics.websocketErrors += clientMetric.websocketErrors;
        });
        return this.metrics;
    }
    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.LoadTestSuite = LoadTestSuite;
/**
 * Individual load test client
 */
class LoadTestClient {
    constructor(id, config) {
        this.socket = null;
        this.scenario = null;
        this.isRunning = false;
        this.actionInterval = null;
        this.id = id;
        this.config = config;
        this.metrics = {
            responseTimes: [],
            errors: [],
            websocketMessages: 0,
            websocketErrors: 0
        };
    }
    /**
     * Connect to WebSocket server
     */
    async connect() {
        return new Promise((resolve, reject) => {
            this.socket = (0, socket_io_client_1.io)(this.config.wsEndpoint, {
                auth: {
                    token: this.config.authToken
                },
                transports: ['websocket']
            });
            this.socket.on('connect', () => {
                console.log(`🔌 Client ${this.id} connected`);
                resolve();
            });
            this.socket.on('connect_error', (error) => {
                this.metrics.websocketErrors++;
                this.metrics.errors.push({
                    type: 'websocket_connect_error',
                    message: error.message,
                    timestamp: Date.now()
                });
                reject(error);
            });
            this.socket.on('disconnect', () => {
                console.log(`🔌 Client ${this.id} disconnected`);
            });
            this.socket.on('error', (error) => {
                this.metrics.websocketErrors++;
                this.metrics.errors.push({
                    type: 'websocket_error',
                    message: error.message,
                    timestamp: Date.now()
                });
            });
            // Subscribe to real-time updates
            this.socket.on('connect', () => {
                this.socket?.emit('subscribe:health');
                this.socket?.emit('subscribe:performance');
                this.socket?.emit('subscribe:alerts');
                this.socket?.emit('subscribe:mood-persona');
            });
            // Handle real-time updates
            this.socket.on('health:update', () => {
                this.metrics.websocketMessages++;
            });
            this.socket.on('performance:update', () => {
                this.metrics.websocketMessages++;
            });
            this.socket.on('alert:new', () => {
                this.metrics.websocketMessages++;
            });
            this.socket.on('mood-persona:update', () => {
                this.metrics.websocketMessages++;
            });
        });
    }
    /**
     * Set load test scenario
     */
    setScenario(scenario) {
        this.scenario = scenario;
    }
    /**
     * Start executing actions
     */
    async start() {
        if (!this.scenario) {
            throw new Error('No scenario assigned to client');
        }
        this.isRunning = true;
        console.log(`🎯 Client ${this.id} starting scenario: ${this.scenario.name}`);
        // Start action execution loop
        this.executeActions();
    }
    /**
     * Stop executing actions
     */
    stop() {
        this.isRunning = false;
        if (this.actionInterval) {
            clearInterval(this.actionInterval);
            this.actionInterval = null;
        }
        console.log(`⏹️ Client ${this.id} stopped`);
    }
    /**
     * Execute actions based on scenario
     */
    executeActions() {
        if (!this.scenario || !this.isRunning)
            return;
        const action = this.selectRandomAction();
        this.executeAction(action)
            .then(() => {
            // Schedule next action
            const delay = Math.random() * 1000 + 500; // 500-1500ms between actions
            this.actionInterval = setTimeout(() => this.executeActions(), delay);
        })
            .catch(error => {
            console.error(`❌ Client ${this.id} action failed:`, error);
            // Continue with next action
            this.actionInterval = setTimeout(() => this.executeActions(), 1000);
        });
    }
    /**
     * Select random action based on weights
     */
    selectRandomAction() {
        if (!this.scenario)
            throw new Error('No scenario assigned');
        const totalWeight = this.scenario.actions.reduce((sum, action) => sum + action.weight, 0);
        let random = Math.random() * totalWeight;
        for (const action of this.scenario.actions) {
            random -= action.weight;
            if (random <= 0) {
                return action;
            }
        }
        return this.scenario.actions[0];
    }
    /**
     * Execute individual action
     */
    async executeAction(action) {
        switch (action.type) {
            case 'websocket':
                await this.executeWebSocketAction(action);
                break;
            case 'api':
                await this.executeAPIAction(action);
                break;
            case 'delay':
                await this.delay(action.config.delay || 1000);
                break;
        }
    }
    /**
     * Execute WebSocket action
     */
    async executeWebSocketAction(action) {
        if (!this.socket || !this.socket.connected) {
            throw new Error('WebSocket not connected');
        }
        const startTime = perf_hooks_1.performance.now();
        try {
            switch (action.config.socketEvent) {
                case 'request:health':
                    this.socket.emit('request:health');
                    break;
                case 'request:performance':
                    this.socket.emit('request:performance', { hours: 1 });
                    break;
                case 'request:errors':
                    this.socket.emit('request:errors', { hours: 1 });
                    break;
                default:
                    if (action.config.socketEvent) {
                        this.socket.emit(action.config.socketEvent, action.config.socketData);
                    }
            }
            const responseTime = perf_hooks_1.performance.now() - startTime;
            this.metrics.responseTimes.push(responseTime);
            this.metrics.websocketMessages++;
        }
        catch (error) {
            const responseTime = perf_hooks_1.performance.now() - startTime;
            this.metrics.responseTimes.push(responseTime);
            this.metrics.websocketErrors++;
            this.metrics.errors.push({
                type: 'websocket_action_error',
                message: error.message,
                timestamp: Date.now()
            });
        }
    }
    /**
     * Execute API action
     */
    async executeAPIAction(action) {
        const startTime = perf_hooks_1.performance.now();
        try {
            const config = {
                method: action.config.method || 'GET',
                url: `${this.config.apiEndpoint}${action.config.endpoint}`,
                headers: {
                    'Authorization': `Bearer ${this.config.authToken}`,
                    'Content-Type': 'application/json'
                },
                ...(action.config.method && action.config.method !== 'GET' && {
                    data: action.config.payload
                })
            };
            const response = await (0, axios_1.default)(config);
            const responseTime = perf_hooks_1.performance.now() - startTime;
            this.metrics.responseTimes.push(responseTime);
        }
        catch (error) {
            const responseTime = perf_hooks_1.performance.now() - startTime;
            this.metrics.responseTimes.push(responseTime);
            this.metrics.errors.push({
                type: 'api_error',
                message: error.message,
                timestamp: Date.now()
            });
        }
    }
    /**
     * Disconnect from WebSocket server
     */
    async disconnect() {
        this.stop();
        if (this.socket) {
            return new Promise((resolve) => {
                this.socket.disconnect();
                this.socket.on('disconnect', () => {
                    resolve();
                });
                setTimeout(resolve, 5000); // Force resolve after 5s
            });
        }
    }
    /**
     * Get client metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
//# sourceMappingURL=loadTestSuite.js.map