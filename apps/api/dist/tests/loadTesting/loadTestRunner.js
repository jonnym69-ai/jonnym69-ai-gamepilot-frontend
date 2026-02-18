"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadTestRunner = void 0;
const loadTestSuite_1 = require("./loadTestSuite");
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * Load test runner with predefined scenarios for GamePilot beta testing
 */
class LoadTestRunner {
    constructor() {
        this.results = [];
    }
    /**
     * Run comprehensive load test suite
     */
    async runComprehensiveLoadTest() {
        console.log('🚀 Starting Comprehensive GamePilot Load Test Suite');
        console.log('='.repeat(60));
        const testConfigs = this.getTestConfigurations();
        for (let i = 0; i < testConfigs.length; i++) {
            const config = testConfigs[i];
            console.log(`\n📊 Test ${i + 1}/${testConfigs.length}: ${config.name}`);
            console.log(`   Clients: ${config.concurrentClients}, Duration: ${config.testDuration}s`);
            try {
                const suite = new loadTestSuite_1.LoadTestSuite(config.config);
                const results = await this.runSingleTest(suite, config.name);
                this.results.push(results);
                // Wait between tests
                if (i < testConfigs.length - 1) {
                    console.log('⏳ Waiting 30 seconds before next test...');
                    await this.delay(30000);
                }
            }
            catch (error) {
                console.error(`❌ Test ${config.name} failed:`, error);
                this.results.push({
                    testName: config.name,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }
        // Generate comprehensive report
        await this.generateComprehensiveReport();
    }
    /**
     * Run single load test
     */
    async runSingleTest(suite, testName) {
        return new Promise((resolve, reject) => {
            suite.on('metrics', (metrics) => {
                // Log progress every 10 seconds
                if (Date.now() % 10000 < 1000) {
                    console.log(`   📈 RPS: ${metrics.requestsPerSecond.toFixed(1)}, ` +
                        `Errors: ${metrics.failedRequests}, ` +
                        `Memory: ${(metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(1)}MB`);
                }
            });
            suite.on('complete', (results) => {
                console.log(`✅ Test ${testName} completed`);
                console.log(`   📊 Total Requests: ${results.totalRequests}`);
                console.log(`   ⚡ Avg Response Time: ${results.averageResponseTime.toFixed(2)}ms`);
                console.log(`   🎯 P95 Response Time: ${results.p95ResponseTime.toFixed(2)}ms`);
                console.log(`   📈 Requests/sec: ${results.requestsPerSecond.toFixed(1)}`);
                console.log(`   ❌ Error Rate: ${((results.failedRequests / results.totalRequests) * 100).toFixed(2)}%`);
                resolve({
                    testName,
                    timestamp: new Date().toISOString(),
                    ...results
                });
            });
            suite.on('error', (error) => {
                console.error(`❌ Test ${testName} failed:`, error);
                reject(error);
            });
            suite.runLoadTest();
        });
    }
    /**
     * Get predefined test configurations
     */
    getTestConfigurations() {
        const baseConfig = {
            apiEndpoint: process.env.API_ENDPOINT || 'http://localhost:3001',
            wsEndpoint: process.env.WS_ENDPOINT || 'http://localhost:3001',
            authToken: process.env.TEST_AUTH_TOKEN || 'test-token',
            scenarios: this.getRealisticScenarios()
        };
        return [
            {
                name: 'Light Load - 100 Clients',
                config: {
                    ...baseConfig,
                    concurrentClients: 100,
                    testDuration: 300, // 5 minutes
                    rampUpTime: 60 // 1 minute ramp up
                }
            },
            {
                name: 'Medium Load - 500 Clients',
                config: {
                    ...baseConfig,
                    concurrentClients: 500,
                    testDuration: 600, // 10 minutes
                    rampUpTime: 120 // 2 minutes ramp up
                }
            },
            {
                name: 'Heavy Load - 1000 Clients',
                config: {
                    ...baseConfig,
                    concurrentClients: 1000,
                    testDuration: 900, // 15 minutes
                    rampUpTime: 180 // 3 minutes ramp up
                }
            },
            {
                name: 'Stress Test - 1500 Clients',
                config: {
                    ...baseConfig,
                    concurrentClients: 1500,
                    testDuration: 600, // 10 minutes
                    rampUpTime: 240 // 4 minutes ramp up
                }
            }
        ];
    }
    /**
     * Get realistic beta testing scenarios
     */
    getRealisticScenarios() {
        return [
            {
                name: 'Active User - Mood Selection',
                weight: 25, // 25% of users
                actions: [
                    {
                        type: 'api',
                        weight: 40,
                        config: {
                            method: 'POST',
                            endpoint: '/api/mood/selection',
                            payload: {
                                primaryMood: 'energetic',
                                secondaryMood: 'competitive',
                                intensity: 0.8,
                                context: {
                                    timeOfDay: 'afternoon',
                                    dayOfWeek: 2,
                                    trigger: 'manual'
                                },
                                outcomes: {
                                    gamesRecommended: 5,
                                    gamesLaunched: 2,
                                    ignoredRecommendations: 1
                                }
                            }
                        }
                    },
                    {
                        type: 'websocket',
                        weight: 30,
                        config: {
                            socketEvent: 'request:health'
                        }
                    },
                    {
                        type: 'websocket',
                        weight: 20,
                        config: {
                            socketEvent: 'subscribe:mood-persona'
                        }
                    },
                    {
                        type: 'delay',
                        weight: 10,
                        config: {
                            delay: 2000
                        }
                    }
                ]
            },
            {
                name: 'Casual Browser - Dashboard Viewing',
                weight: 30, // 30% of users
                actions: [
                    {
                        type: 'websocket',
                        weight: 50,
                        config: {
                            socketEvent: 'request:health'
                        }
                    },
                    {
                        type: 'websocket',
                        weight: 30,
                        config: {
                            socketEvent: 'request:performance'
                        }
                    },
                    {
                        type: 'api',
                        weight: 15,
                        config: {
                            method: 'GET',
                            endpoint: '/api/diagnostics/health'
                        }
                    },
                    {
                        type: 'delay',
                        weight: 5,
                        config: {
                            delay: 5000
                        }
                    }
                ]
            },
            {
                name: 'Power User - Recommendations',
                weight: 20, // 20% of users
                actions: [
                    {
                        type: 'api',
                        weight: 35,
                        config: {
                            method: 'POST',
                            endpoint: '/api/mood/recommendations/generate',
                            payload: {
                                primaryMood: 'focused',
                                secondaryMood: 'strategic',
                                limit: 10
                            }
                        }
                    },
                    {
                        type: 'api',
                        weight: 25,
                        config: {
                            method: 'POST',
                            endpoint: '/api/mood/action',
                            payload: {
                                type: 'launch',
                                gameId: 'test-game-123',
                                gameTitle: 'Test Game',
                                moodContext: {
                                    primaryMood: 'focused',
                                    secondaryMood: 'strategic'
                                },
                                metadata: {
                                    sessionDuration: 45,
                                    rating: 4
                                }
                            }
                        }
                    },
                    {
                        type: 'websocket',
                        weight: 25,
                        config: {
                            socketEvent: 'request:mood-persona'
                        }
                    },
                    {
                        type: 'delay',
                        weight: 15,
                        config: {
                            delay: 1500
                        }
                    }
                ]
            },
            {
                name: 'Monitoring User - Analytics',
                weight: 15, // 15% of users
                actions: [
                    {
                        type: 'api',
                        weight: 40,
                        config: {
                            method: 'GET',
                            endpoint: '/api/diagnostics/analytics'
                        }
                    },
                    {
                        type: 'api',
                        weight: 30,
                        config: {
                            method: 'GET',
                            endpoint: '/api/diagnostics/errors'
                        }
                    },
                    {
                        type: 'websocket',
                        weight: 20,
                        config: {
                            socketEvent: 'subscribe:alerts'
                        }
                    },
                    {
                        type: 'delay',
                        weight: 10,
                        config: {
                            delay: 3000
                        }
                    }
                ]
            },
            {
                name: 'Background User - Minimal Activity',
                weight: 10, // 10% of users
                actions: [
                    {
                        type: 'websocket',
                        weight: 60,
                        config: {
                            socketEvent: 'subscribe:health'
                        }
                    },
                    {
                        type: 'delay',
                        weight: 40,
                        config: {
                            delay: 10000
                        }
                    }
                ]
            }
        ];
    }
    /**
     * Generate comprehensive report
     */
    async generateComprehensiveReport() {
        console.log('\n📊 Generating Comprehensive Load Test Report...');
        const report = {
            timestamp: new Date().toISOString(),
            summary: this.generateSummary(),
            detailedResults: this.results,
            performanceAnalysis: this.analyzePerformance(),
            bottlenecks: this.identifyBottlenecks(),
            recommendations: this.generateRecommendations()
        };
        // Save report to file
        const reportPath = (0, path_1.join)(__dirname, `load-test-report-${Date.now()}.json`);
        (0, fs_1.writeFileSync)(reportPath, JSON.stringify(report, null, 2));
        // Generate human-readable report
        const readableReport = this.generateReadableReport(report);
        const readableReportPath = (0, path_1.join)(__dirname, `load-test-report-${Date.now()}.md`);
        (0, fs_1.writeFileSync)(readableReportPath, readableReport);
        console.log(`📄 Report saved to: ${reportPath}`);
        console.log(`📄 Readable report saved to: ${readableReportPath}`);
        // Print summary
        this.printSummary(report.summary);
    }
    /**
     * Generate summary statistics
     */
    generateSummary() {
        const successfulTests = this.results.filter(r => !r.error);
        const failedTests = this.results.filter(r => r.error);
        if (successfulTests.length === 0) {
            return {
                totalTests: this.results.length,
                successfulTests: 0,
                failedTests: failedTests.length,
                status: 'FAILED'
            };
        }
        const totalRequests = successfulTests.reduce((sum, test) => sum + test.totalRequests, 0);
        const totalErrors = successfulTests.reduce((sum, test) => sum + test.failedRequests, 0);
        const avgResponseTime = successfulTests.reduce((sum, test) => sum + test.averageResponseTime, 0) / successfulTests.length;
        const maxClients = Math.max(...successfulTests.map(test => test.concurrentClients || 0));
        const maxRPS = Math.max(...successfulTests.map(test => test.requestsPerSecond || 0));
        return {
            totalTests: this.results.length,
            successfulTests: successfulTests.length,
            failedTests: failedTests.length,
            totalRequests,
            totalErrors,
            overallErrorRate: (totalErrors / totalRequests) * 100,
            avgResponseTime,
            maxClients,
            maxRPS,
            status: failedTests.length === 0 ? 'PASSED' : 'PARTIAL'
        };
    }
    /**
     * Analyze performance trends
     */
    analyzePerformance() {
        const successfulTests = this.results.filter(r => !r.error);
        return {
            responseTimeTrend: successfulTests.map(test => ({
                clients: test.concurrentClients,
                avgResponseTime: test.averageResponseTime,
                p95ResponseTime: test.p95ResponseTime,
                p99ResponseTime: test.p99ResponseTime
            })),
            throughputTrend: successfulTests.map(test => ({
                clients: test.concurrentClients,
                requestsPerSecond: test.requestsPerSecond,
                errorRate: (test.failedRequests / test.totalRequests) * 100
            })),
            resourceUsage: successfulTests.map(test => ({
                clients: test.concurrentClients,
                memoryUsage: test.memoryUsage ? test.memoryUsage.heapUsed / 1024 / 1024 : 0,
                websocketErrors: test.websocketErrors || 0
            }))
        };
    }
    /**
     * Identify performance bottlenecks
     */
    identifyBottlenecks() {
        const successfulTests = this.results.filter(r => !r.error);
        const bottlenecks = [];
        // Check response time degradation
        const responseTimeIncrease = this.calculateResponseTimeIncrease(successfulTests);
        if (responseTimeIncrease > 50) {
            bottlenecks.push({
                type: 'response_time_degradation',
                severity: 'high',
                description: `Response time increased by ${responseTimeIncrease.toFixed(1)}% under load`,
                recommendation: 'Optimize database queries and implement caching'
            });
        }
        // Check error rate increase
        const errorRateIncrease = this.calculateErrorRateIncrease(successfulTests);
        if (errorRateIncrease > 5) {
            bottlenecks.push({
                type: 'error_rate_increase',
                severity: 'high',
                description: `Error rate increased by ${errorRateIncrease.toFixed(1)}% under load`,
                recommendation: 'Implement better error handling and retry mechanisms'
            });
        }
        // Check memory usage
        const maxMemoryUsage = Math.max(...successfulTests.map(test => test.memoryUsage ? test.memoryUsage.heapUsed / 1024 / 1024 : 0));
        if (maxMemoryUsage > 512) {
            bottlenecks.push({
                type: 'memory_usage',
                severity: 'medium',
                description: `Memory usage peaked at ${maxMemoryUsage.toFixed(1)}MB`,
                recommendation: 'Implement memory optimization and garbage collection tuning'
            });
        }
        // Check WebSocket errors
        const totalWebSocketErrors = successfulTests.reduce((sum, test) => sum + (test.websocketErrors || 0), 0);
        if (totalWebSocketErrors > 100) {
            bottlenecks.push({
                type: 'websocket_errors',
                severity: 'medium',
                description: `${totalWebSocketErrors} WebSocket errors detected`,
                recommendation: 'Improve WebSocket connection handling and implement reconnection logic'
            });
        }
        return bottlenecks;
    }
    /**
     * Generate optimization recommendations
     */
    generateRecommendations() {
        const recommendations = [];
        // Database optimization
        recommendations.push({
            priority: 'high',
            category: 'database',
            title: 'Implement Database Connection Pooling',
            description: 'Use connection pooling to handle concurrent database requests efficiently',
            estimatedImpact: '30-50% improvement in response times',
            implementation: 'Configure pgpool or similar connection pooling solution'
        });
        // Caching strategy
        recommendations.push({
            priority: 'high',
            category: 'caching',
            title: 'Implement Redis Caching Layer',
            description: 'Cache frequently accessed data like mood suggestions and recommendations',
            estimatedImpact: '40-60% reduction in database load',
            implementation: 'Add Redis for caching with TTL-based invalidation'
        });
        // WebSocket optimization
        recommendations.push({
            priority: 'medium',
            category: 'websocket',
            title: 'Optimize WebSocket Message Broadcasting',
            description: 'Implement efficient message broadcasting and connection management',
            estimatedImpact: '20-30% improvement in WebSocket performance',
            implementation: 'Use message queuing and batch broadcasting'
        });
        // API optimization
        recommendations.push({
            priority: 'medium',
            category: 'api',
            title: 'Implement API Rate Limiting and Request Deduplication',
            description: 'Prevent API abuse and optimize duplicate requests',
            estimatedImpact: '15-25% improvement in API performance',
            implementation: 'Add rate limiting middleware and request deduplication'
        });
        // Memory optimization
        recommendations.push({
            priority: 'low',
            category: 'memory',
            title: 'Implement Memory Monitoring and Garbage Collection',
            description: 'Monitor memory usage and optimize garbage collection',
            estimatedImpact: '10-20% reduction in memory usage',
            implementation: 'Add memory monitoring and tune GC settings'
        });
        return recommendations;
    }
    /**
     * Calculate response time increase percentage
     */
    calculateResponseTimeIncrease(tests) {
        if (tests.length < 2)
            return 0;
        const baseline = tests[0].averageResponseTime;
        const peak = tests[tests.length - 1].averageResponseTime;
        return ((peak - baseline) / baseline) * 100;
    }
    /**
     * Calculate error rate increase percentage
     */
    calculateErrorRateIncrease(tests) {
        if (tests.length < 2)
            return 0;
        const baselineErrorRate = (tests[0].failedRequests / tests[0].totalRequests) * 100;
        const peakErrorRate = (tests[tests.length - 1].failedRequests / tests[tests.length - 1].totalRequests) * 100;
        return peakErrorRate - baselineErrorRate;
    }
    /**
     * Generate human-readable report
     */
    generateReadableReport(report) {
        return `# GamePilot Load Test Report

## Executive Summary

**Test Status:** ${report.summary.status}
**Date:** ${report.timestamp}
**Total Tests:** ${report.summary.totalTests}
**Successful Tests:** ${report.summary.successfulTests}
**Failed Tests:** ${report.summary.failedTests}

## Key Metrics

- **Total Requests:** ${report.summary.totalRequests.toLocaleString()}
- **Total Errors:** ${report.summary.totalErrors.toLocaleString()}
- **Overall Error Rate:** ${report.summary.overallErrorRate.toFixed(2)}%
- **Average Response Time:** ${report.summary.avgResponseTime.toFixed(2)}ms
- **Max Concurrent Clients:** ${report.summary.maxClients}
- **Max Requests/sec:** ${report.summary.maxRPS.toFixed(1)}

## Performance Analysis

### Response Time Trends
${report.performanceAnalysis.responseTimeTrend.map(trend => `- ${trend.clients} clients: ${trend.avgResponseTime.toFixed(2)}ms avg, ${trend.p95ResponseTime.toFixed(2)}ms p95`).join('\n')}

### Throughput Trends
${report.performanceAnalysis.throughputTrend.map(trend => `- ${trend.clients} clients: ${trend.requestsPerSecond.toFixed(1)} RPS, ${trend.errorRate.toFixed(2)}% error rate`).join('\n')}

## Identified Bottlenecks

${report.bottlenecks.map(bottleneck => `### ${bottleneck.type.replace(/_/g, ' ').toUpperCase()}
**Severity:** ${bottleneck.severity}
**Description:** ${bottleneck.description}
**Recommendation:** ${bottleneck.recommendation}`).join('\n\n')}

## Optimization Recommendations

${report.recommendations.map(rec => `### ${rec.title} (${rec.priority})
**Category:** ${rec.category}
**Description:** ${rec.description}
**Estimated Impact:** ${rec.estimatedImpact}
**Implementation:** ${rec.implementation}`).join('\n\n')}

## Detailed Test Results

${report.detailedResults.map(test => `### ${test.testName}
${test.error ? `**Status:** FAILED\n**Error:** ${test.error}` : `
**Status:** PASSED
**Clients:** ${test.concurrentClients}
**Duration:** ${test.testDuration}s
**Requests:** ${test.totalRequests}
**Errors:** ${test.failedRequests}
**Avg Response Time:** ${test.averageResponseTime.toFixed(2)}ms
**P95 Response Time:** ${test.p95ResponseTime.toFixed(2)}ms
**Requests/sec:** ${test.requestsPerSecond.toFixed(1)}
**Memory Usage:** ${test.memoryUsage ? (test.memoryUsage.heapUsed / 1024 / 1024).toFixed(1) + 'MB' : 'N/A'}
**WebSocket Errors:** ${test.websocketErrors || 0}` `).join('\n\n')}

## Conclusion

${report.summary.status === 'PASSED' ?
            '✅ All load tests passed successfully. The system is ready for beta testing.' :
            '⚠️ Some load tests failed. Review the bottlenecks and recommendations before proceeding.'}

---
*Report generated on ${new Date().toISOString()}*
`}

  /**
   * Print summary to console
   */
  private printSummary(summary: any): void {
    console.log('\n' + '=' .repeat(60))
    console.log('📊 LOAD TEST SUMMARY')
    console.log('=' .repeat(60))
    console.log(`, Status, $, { summary, : .status } `)
    console.log(`, Tests, $, { summary, : .successfulTests } / $, { summary, : .totalTests }, passed `)
    console.log(`, Requests, $, { summary, : .totalRequests.toLocaleString() } `)
    console.log(`, Errors, $, { summary, : .totalErrors.toLocaleString() } `)
    console.log(`, Error, Rate, $, { summary, : .overallErrorRate.toFixed(2) } % `)
    console.log(`, Avg, Response, Time, $, { summary, : .avgResponseTime.toFixed(2) }, ms `)
    console.log(`, Max, Clients, $, { summary, : .maxClients } `)
    console.log(`, Max, RPS, $, { summary, : .maxRPS.toFixed(1) } `)
    console.log('=' .repeat(60))
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Run load tests if this file is executed directly
if (require.main === module) {
  const runner = new LoadTestRunner()
  runner.runComprehensiveLoadTest()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
        );
    }
}
exports.LoadTestRunner = LoadTestRunner;
//# sourceMappingURL=loadTestRunner.js.map