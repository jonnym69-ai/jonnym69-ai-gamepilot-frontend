"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Performance testing with large datasets
const test_1 = require("@playwright/test");
test_1.test.describe('Performance Testing', () => {
    test_1.test.beforeEach(async ({ page }) => {
        // Navigate to the application
        await page.goto('http://localhost:3000');
    });
    test_1.test.describe('Large Dataset Performance', () => {
        (0, test_1.test)('should handle large game library (1000+ games)', async ({ page }) => {
            // Login first
            await page.click('text=Sign In');
            await page.fill('[data-testid="email-input"]', 'perf-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.click('[data-testid="login-button"]');
            await page.waitForSelector('[data-testid="user-menu"]');
            // Navigate to library
            await page.click('[data-testid="library-nav"]');
            // Measure initial load time
            const startTime = Date.now();
            await page.waitForSelector('[data-testid="game-grid"]');
            const initialLoadTime = Date.now() - startTime;
            // Add large number of games
            const gameCount = 1000;
            for (let i = 0; i < gameCount; i++) {
                await page.click('[data-testid="add-game-button"]');
                await page.fill('[data-testid="game-title-input"]', `Performance Test Game ${i}`);
                await page.selectOption('[data-testid="game-genre-select"]', 'action');
                await page.selectOption('[data-testid="game-platform-select"]', 'steam');
                await page.fill('[data-testid="game-cover-input"]', `https://example.com/cover${i}.jpg`);
                await page.fill('[data-testid="game-description-input"]', `Description for game ${i}`);
                await page.fill('[data-testid="game-developer-input"]', `Developer ${i}`);
                await page.fill('[data-testid="game-publisher-input"]', `Publisher ${i}`);
                await page.fill('[data-testid="game-price-input"]', '29.99');
                await page.click('[data-testid="save-game-button"]');
                // Wait for save to complete
                await page.waitForSelector('text=Game added successfully', { timeout: 5000 });
            }
            // Measure rendering time with large dataset
            const renderStartTime = Date.now();
            await page.waitForSelector('[data-testid="game-grid"]');
            const renderTime = Date.now() - renderStartTime;
            // Verify performance metrics
            (0, test_1.expect)(initialLoadTime).toBeLessThan(2000); // Initial load should be under 2s
            (0, test_1.expect)(renderTime).toBeLessThan(3000); // Large dataset render should be under 3s
            // Test scrolling performance
            const scrollStartTime = Date.now();
            await page.evaluate(() => {
                const grid = document.querySelector('[data-testid="game-grid"]');
                if (grid) {
                    grid.scrollTop = grid.scrollHeight;
                }
            });
            const scrollTime = Date.now() - scrollStartTime;
            (0, test_1.expect)(scrollTime).toBeLessThan(1000); // Scrolling should be under 1s
            // Test search performance
            const searchStartTime = Date.now();
            await page.fill('[data-testid="search-input"]', 'Performance Test');
            await page.waitForSelector('[data-testid="game-grid"]');
            const searchTime = Date.now() - searchStartTime;
            (0, test_1.expect)(searchTime).toBeLessThan(500); // Search should be under 500ms
            // Test filter performance
            const filterStartTime = Date.now();
            await page.selectOption('[data-testid="platform-filter"]', 'steam');
            await page.waitForSelector('[data-testid="game-grid"]');
            const filterTime = Date.now() - filterStartTime;
            (0, test_1.expect)(filterTime).toBeLessThan(500); // Filtering should be under 500ms
            // Test sort performance
            const sortStartTime = Date.now();
            await page.selectOption('[data-testid="sort-select"]', 'title');
            await page.waitForSelector('[data-testid="game-grid"]');
            const sortTime = Date.now() - sortStartTime;
            (0, test_1.expect)(sortTime).toBeLessThan(1000); // Sorting should be under 1s
        });
        (0, test_1.test)('should handle large user lists in mood engine', async ({ page }) => {
            // Login first
            await page.click('text=Sign In');
            await page.fill('[data-testid="email-input"]', 'perf-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.click('[data-testid="login-button"]');
            await page.waitForSelector('[data-testid="user-menu"]');
            // Navigate to mood engine
            await page.click('[data-testid="mood-nav"]');
            // Measure mood selection performance
            const moodStartTime = Date.now();
            await page.click('[data-testid="mood-competitive"]');
            await page.waitForSelector('[data-testid="recommendation-grid"]');
            const moodTime = Date.now() - moodStartTime;
            (0, test_1.expect)(moodTime).toBeLessThan(1000); // Mood selection should be under 1s
            // Test recommendation performance with large dataset
            const recommendationStartTime = Date.now();
            await page.waitForSelector('[data-testid="recommendation-grid"]');
            const recommendationTime = Date.now() - recommendationStartTime;
            (0, test_1.expect)(recommendationTime).toBeLessThan(2000); // Recommendations should be under 2s
        });
        (0, test_1.test)('should handle large integration data', async ({ page }) => {
            // Login first
            await page.click('text=Sign In');
            await page.fill('[data-testid="email-input"]', 'perf-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.click('[data-testid="login-button"]');
            await page.waitForSelector('[data-testid="user-menu"]');
            // Navigate to integrations
            await page.click('[data-testid="integrations-nav"]');
            // Test Steam integration with large library
            const steamIntegrationStartTime = Date.now();
            await page.click('[data-testid="connect-steam"]');
            await page.click('[data-testid="mock-steam-auth"]');
            await page.waitForSelector('[data-testid="steam-status-connected"]');
            const steamIntegrationTime = Date.now() - steamIntegrationStartTime;
            (0, test_1.expect)(steamIntegrationTime).toBeLessThan(2000); // Steam integration should be under 2s
            // Test sync with large library
            const syncStartTime = Date.now();
            await page.click('[data-testid="sync-steam"]');
            await page.waitForSelector('text=Sync completed', { timeout: 30000 });
            const syncTime = Date.now() - syncStartTime;
            (0, test_1.expect)(syncTime).toBeLessThan(10000); // Sync should be under 10s for large dataset
        });
    });
    test_1.test.describe('Memory Usage Testing', () => {
        (0, test_1.test)('should not leak memory during navigation', async ({ page }) => {
            // Login
            await page.click('text=Sign In');
            await page.fill('[data-testid="email-input"]', 'memory-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.click('[data-testid="login-button"]');
            await page.waitForSelector('[data-testid="user-menu"]');
            // Navigate through all main pages multiple times
            for (let i = 0; i < 10; i++) {
                await page.click('[data-testid="library-nav"]');
                await page.waitForSelector('[data-testid="game-grid"]');
                await page.click('[data-testid="mood-nav"]');
                await page.waitForSelector('[data-testid="mood-options"]');
                await page.click('[data-testid="integrations-nav"]');
                await page.waitForSelector('[data-testid="integration-list"]');
                await page.click('[data-testid="user-menu"]');
                await page.click('text=Profile');
                await page.waitForSelector('[data-testid="profile-form"]');
            }
            // Check for memory leaks by monitoring page performance
            const metrics = await page.evaluate(() => {
                const navigation = performance.getEntriesByType('navigation');
                const paint = performance.getEntriesByType('paint');
                // @ts-ignore - performance.memory is not in standard TypeScript types
                const memory = performance.memory;
                return {
                    navigationCount: navigation.length,
                    paintCount: paint.length,
                    usedJSHeapSize: memory?.usedJSHeapSize || 0,
                    totalJSHeapSize: memory?.totalJSHeapSize || 0
                };
            });
            (0, test_1.expect)(metrics.navigationCount).toBeGreaterThan(0);
            (0, test_1.expect)(metrics.paintCount).toBeGreaterThan(0);
            (0, test_1.expect)(metrics.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
        });
        (0, test_1.test)('should handle memory pressure gracefully', async ({ page }) => {
            // Login
            await page.click('text=Sign In');
            await page.fill('[data-testid="email-input"]', 'memory-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.click('[data-testid="login-button"]');
            await page.waitForSelector('[data-testid="user-menu"]');
            // Add many games to create memory pressure
            const gameCount = 500;
            for (let i = 0; i < gameCount; i++) {
                await page.click('[data-testid="add-game-button"]');
                await page.fill('[data-testid="game-title-input"]', `Memory Test Game ${i}`);
                await page.selectOption('[data-testid="game-genre-select"]', 'action');
                await page.selectOption('[data-testid="game-platform-select"]', 'steam');
                await page.fill('[data-testid="game-cover-input"]', `https://example.com/cover${i}.jpg`);
                await page.fill('[data-testid="game-description-input"]', `Description for game ${i}`);
                await page.fill('[data-testid="game-developer-input"]', `Developer ${i}`);
                await page.fill('[data-testid="game-publisher-input"]', `Publisher ${i}`);
                await page.fill('[data-testid="game-price-input"]', '29.99');
                await page.click('[data-testid="save-game-button"]');
                await page.waitForSelector('text=Game added successfully', { timeout: 3000 });
            }
            // Test that app remains responsive
            const responsivenessStartTime = Date.now();
            await page.click('[data-testid="search-input"]');
            await page.fill('[data-testid="search-input"]', 'Memory Test');
            await page.waitForSelector('[data-testid="game-grid"]');
            const responsivenessTime = Date.now() - responsivenessStartTime;
            (0, test_1.expect)(responsivenessTime).toBeLessThan(2000); // Should remain responsive under memory pressure
            // Test that scrolling is smooth
            const scrollStartTime = Date.now();
            await page.evaluate(() => {
                const grid = document.querySelector('[data-testid="game-grid"]');
                if (grid) {
                    grid.scrollTop = grid.scrollHeight / 2;
                }
            });
            await page.waitForTimeout(100); // Wait for scroll animation
            const scrollTime = Date.now() - scrollStartTime;
            (0, test_1.expect)(scrollTime).toBeLessThan(500); // Scrolling should remain smooth
        });
    });
    test_1.test.describe('Network Performance Testing', () => {
        (0, test_1.test)('should handle slow network conditions', async ({ page }) => {
            // Simulate slow network
            await page.route('**/api/**', route => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(route.fulfill({
                            status: 200,
                            contentType: 'application/json',
                            body: JSON.stringify({ success: true })
                        }));
                    }, 1000); // 1 second delay
                });
            });
            // Login with slow network
            const loginStartTime = Date.now();
            await page.click('text=Sign In');
            await page.fill('[data-testid="email-input"]', 'network-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.click('[data-testid="login-button"]');
            await page.waitForSelector('[data-testid="user-menu"]');
            const loginTime = Date.now() - loginStartTime;
            (0, test_1.expect)(loginTime).toBeLessThan(3000); // Should handle slow network gracefully
            // Test loading states
            await (0, test_1.expect)(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
        });
        (0, test_1.test)('should handle network timeouts', async ({ page }) => {
            // Simulate network timeout
            await page.route('**/api/**', route => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(route.fulfill({
                            status: 408,
                            contentType: 'application/json',
                            body: JSON.stringify({ error: 'Request timeout' })
                        }));
                    }, 5000); // 5 second timeout
                });
            });
            // Try login with timeout
            await page.click('text=Sign In');
            await page.fill('[data-testid="email-input"]', 'timeout-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.click('[data-testid="login-button"]');
            // Verify timeout handling
            await (0, test_1.expect)(page.locator('text=Request timeout')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=Please try again')).toBeVisible();
        });
        (0, test_1.test)('should handle network errors', async ({ page }) => {
            // Simulate network error
            await page.route('**/api/**', route => route.abort('failed'));
            // Try login with network error
            await page.click('text=Sign In');
            await page.fill('[data-testid="email-input"]', 'error-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.click('[data-testid="login-button"]');
            // Verify error handling
            await (0, test_1.expect)(page.locator('text=Network error occurred')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=Please try again later')).toBeVisible();
        });
    });
    test_1.test.describe('Concurrent User Performance', () => {
        (0, test_1.test)('should handle multiple concurrent users', async ({ context }) => {
            const userPromises = [];
            // Create 5 concurrent users
            for (let i = 0; i < 5; i++) {
                const userContext = await context.newPage();
                userPromises.push(userContext.goto('http://localhost:3000').then(async () => {
                    // Login
                    await userContext.click('text=Sign In');
                    await userContext.fill('[data-testid="email-input"]', `concurrent${i}@example.com`);
                    await userContext.fill('[data-testid="password-input"]', 'TestPassword123!');
                    await userContext.click('[data-testid="login-button"]');
                    await userContext.waitForSelector('[data-testid="user-menu"]');
                    // Navigate to library
                    await userContext.click('[data-testid="library-nav"]');
                    await userContext.waitForSelector('[data-testid="game-grid"]');
                    // Add some games
                    for (let j = 0; j < 10; j++) {
                        await userContext.click('[data-testid="add-game-button"]');
                        await userContext.fill('[data-testid="game-title-input"]', `Concurrent Game ${i}-${j}`);
                        await userContext.selectOption('[data-testid="game-genre-select"]', 'action');
                        await userContext.selectOption('[data-testid="game-platform-select"]', 'steam');
                        await userContext.fill('[data-testid="game-cover-input"]', 'https://example.com/cover.jpg');
                        await userContext.fill('[data-testid="game-description-input"]', 'Description');
                        await userContext.fill('[data-testid="game-developer-input"]', 'Developer');
                        await userContext.fill('[data-testid="game-publisher-input"]', 'Publisher');
                        await userContext.fill('[data-testid="game-price-input"]', '29.99');
                        await userContext.click('[data-testid="save-game-button"]');
                        await userContext.waitForSelector('text=Game added successfully', { timeout: 3000 });
                    }
                    // Test search performance
                    const searchStartTime = Date.now();
                    await userContext.fill('[data-testid="search-input"]', `Concurrent Game ${i}-5`);
                    await userContext.waitForSelector('[data-testid="game-grid"]');
                    const searchTime = Date.now() - searchStartTime;
                    (0, test_1.expect)(searchTime).toBeLessThan(1000); // Each user's search should be under 1s
                }));
            }
            // Wait for all users to complete
            await Promise.all(userPromises);
        });
    });
    test_1.test.describe('Accessibility Performance', () => {
        (0, test_1.test)('should maintain performance with accessibility features', async ({ page }) => {
            // Login
            await page.click('text=Sign In');
            await page.fill('[data-testid="email-input"]', 'a11y-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.click('[data-testid="login-button"]');
            await page.waitForSelector('[data-testid="user-menu"]');
            // Enable screen reader
            await page.emulateMedia({ reducedMotion: 'reduce' });
            // Navigate to library
            const navigationStartTime = Date.now();
            await page.click('[data-testid="library-nav"]');
            await page.waitForSelector('[data-testid="game-grid"]');
            const navigationTime = Date.now() - navigationStartTime;
            (0, test_1.expect)(navigationTime).toBeLessThan(1500); // Navigation should be fast with reduced motion
            // Test keyboard navigation
            const keyboardStartTime = Date.now();
            await page.keyboard.press('Tab');
            await page.keyboard.press('Enter');
            await page.keyboard.press('Escape');
            const keyboardTime = Date.now() - keyboardStartTime;
            (0, test_1.expect)(keyboardTime).toBeLessThan(500); // Keyboard navigation should be responsive
            // Test screen reader compatibility
            const a11yStartTime = Date.now();
            // @ts-ignore - page.accessibility is not in standard TypeScript types
            const a11yResults = await page.accessibility.snapshot();
            const a11yTime = Date.now() - a11yStartTime;
            (0, test_1.expect)(a11yTime).toBeLessThan(1000); // Accessibility checks should be fast
            (0, test_1.expect)(a11yResults.violations.length).toBeLessThan(10); // Should have minimal accessibility issues
        });
    });
});
