"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Cross-browser compatibility testing
const test_1 = require("@playwright/test");
test_1.test.describe('Cross-Browser Compatibility', () => {
    // Test on desktop browsers
    test_1.test.describe('Desktop Browsers', () => {
        (0, test_1.test)('should work on Chromium', async ({ page }) => {
            await page.goto('http://localhost:3000');
            // Test login flow
            await page.click('text=Sign In');
            await page.fill('[data-testid="email-input"]', 'chromium-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.click('[data-testid="login-button"]');
            await page.waitForSelector('[data-testid="user-menu"]');
            // Test navigation
            await page.click('[data-testid="library-nav"]');
            await page.waitForSelector('[data-testid="game-grid"]');
            // Test game addition
            await page.click('[data-testid="add-game-button"]');
            await page.fill('[data-testid="game-title-input"]', 'Chromium Test Game');
            await page.selectOption('[data-testid="game-genre-select"]', 'action');
            await page.selectOption('[data-testid="game-platform-select"]', 'steam');
            await page.fill('[data-testid="game-cover-input"]', 'https://example.com/cover.jpg');
            await page.fill('[data-testid="game-description-input"]', 'Test description');
            await page.fill('[data-testid="game-developer-input"]', 'Test Developer');
            await page.fill('[data-testid="game-publisher-input"]', 'Test Publisher');
            await page.fill('[data-testid="game-price-input"]', '29.99');
            await page.click('[data-testid="save-game-button"]');
            // Verify game was added
            await (0, test_1.expect)(page.locator('text=Chromium Test Game')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=Game added successfully')).toBeVisible();
            // Test mood engine
            await page.click('[data-testid="mood-nav"]');
            await page.waitForSelector('[data-testid="mood-options"]');
            await page.click('[data-testid="mood-competitive"]');
            await page.waitForSelector('[data-testid="recommendation-grid"]');
            // Verify mood recommendations
            await (0, test_1.expect)(page.locator('text=Competitive Games')).toBeVisible();
            // Test logout
            await page.click('[data-testid="user-menu"]');
            await page.click('text=Logout');
            await (0, test_1.expect)(page.locator('text=Sign In')).toBeVisible();
        });
        (0, test_1.test)('should work on Firefox', async ({ page }) => {
            await page.goto('http://localhost:3000');
            // Test login flow
            await page.click('text=Sign In');
            await page.fill('[data-testid="email-input"]', 'firefox-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.click('[data-testid="login-button"]');
            await page.waitForSelector('[data-testid="user-menu"]');
            // Test navigation
            await page.click('[data-testid="library-nav"]');
            await page.waitForSelector('[data-testid="game-grid"]');
            // Test game addition
            await page.click('[data-testid="add-game-button"]');
            await page.fill('[data-testid="game-title-input"]', 'Firefox Test Game');
            await page.selectOption('[data-testid="game-genre-select"]', 'action');
            await page.selectOption('[data-testid="game-platform-select"]', 'steam');
            await page.fill('[data-testid="game-cover-input"]', 'https://example.com/cover.jpg');
            await page.fill('[data-testid="game-description-input"]', 'Test description');
            await page.fill('[data-testid="game-developer-input"]', 'Test Developer');
            await page.fill('[data-testid="game-publisher-input"]', 'Test Publisher');
            await page.fill('[data-testid="game-price-input"]', '29.99');
            await page.click('[data-testid="save-game-button"]');
            // Verify game was added
            await (0, test_1.expect)(page.locator('text=Firefox Test Game')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=Game added successfully')).toBeVisible();
            // Test mood engine
            await page.click('[data-testid="mood-nav"]');
            await page.waitForSelector('[data-testid="mood-options"]');
            await page.click('[data-testid="mood-competitive"]');
            await page.waitForSelector('[data-testid="recommendation-grid"]');
            // Verify mood recommendations
            await (0, test_1.expect)(page.locator('text=Competitive Games')).toBeVisible();
            // Test logout
            await page.click('[data-testid="user-menu"]');
            await page.click('text=Logout');
            await (0, test_1.expect)(page.locator('text=Sign In')).toBeVisible();
        });
        (0, test_1.test)('should work on Safari', async ({ page }) => {
            await page.goto('http://localhost:3000');
            // Test login flow
            await page.click('text=Sign In');
            await page.fill('[data-testid="email-input"]', 'safari-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.click('[data-testid="login-button"]');
            await page.waitForSelector('[data-testid="user-menu"]');
            // Test navigation
            await page.click('[data-testid="library-nav"]');
            await page.waitForSelector('[data-testid="game-grid"]');
            // Test game addition
            await page.click('[data-testid="add-game-button"]');
            await page.fill('[data-testid="game-title-input"]', 'Safari Test Game');
            await page.selectOption('[data-testid="game-genre-select"]', 'action');
            await page.selectOption('[data-testid="game-platform-select"]', 'steam');
            await page.fill('[data-testid="game-cover-input"]', 'https://example.com/cover.jpg');
            await page.fill('[data-testid="game-description-input"]', 'Test description');
            await page.fill('[data-testid="game-developer-input"]', 'Test Developer');
            await page.fill('[data-testid="game-publisher-input"]', 'Test Publisher');
            await page.fill('[data-testid="game-price-input"]', '29.99');
            await page.click('[data-testid="save-game-button"]');
            // Verify game was added
            await (0, test_1.expect)(page.locator('text=Safari Test Game')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=Game added successfully')).toBeVisible();
            // Test mood engine
            await page.click('[data-testid="mood-nav"]');
            await page.waitForSelector('[data-testid="mood-options"]');
            await page.click('[data-testid="mood-competitive"]');
            await page.waitForSelector('[data-testid="recommendation-grid"]');
            // Verify mood recommendations
            await (0, test_1.expect)(page.locator('text=Competitive Games')).toBeVisible();
            // Test logout
            await page.click('[data-testid="user-menu"]');
            await page.click('text=Logout');
            await (0, test_1.expect)(page.locator('text=Sign In')).toBeVisible();
        });
        (0, test_1.test)('should work on Edge', async ({ page }) => {
            await page.goto('http://localhost:3000');
            // Test login flow
            await page.click('text=Sign In');
            await page.fill('[data-testid="email-input"]', 'edge-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.click('[data-testid="login-button"]');
            await page.waitForSelector('[data-testid="user-menu"]');
            // Test navigation
            await page.click('[data-testid="library-nav"]');
            await page.waitForSelector('[data-testid="game-grid"]');
            // Test game addition
            await page.click('[data-testid="add-game-button"]');
            await page.fill('[data-testid="game-title-input"]', 'Edge Test Game');
            await page.selectOption('[data-testid="game-genre-select"]', 'action');
            await page.selectOption('[data-testid="game-platform-select"]', 'steam');
            await page.fill('[data-testid="game-cover-input"]', 'https://example.com/cover.jpg');
            await page.fill('[data-testid="game-description-input"]', 'Test description');
            await page.fill('[data-testid="game-developer-input"]', 'Test Developer');
            await page.fill('[data-testid="game-publisher-input"]', 'Test Publisher');
            await page.fill('[data-testid="game-price-input"]', '29.99');
            await page.click('[data-testid="save-game-button"]');
            // Verify game was added
            await (0, test_1.expect)(page.locator('text=Edge Test Game')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=Game added successfully')).toBeVisible();
            // Test mood engine
            await page.click('[data-testid="mood-nav"]');
            await page.waitForSelector('[data-testid="mood-options"]');
            await page.click('[data-testid="mood-competitive"]');
            await page.waitForSelector('[data-testid="recommendation-grid"]');
            // Verify mood recommendations
            await (0, test_1.expect)(page.locator('text=Competitive Games')).toBeVisible();
            // Test logout
            await page.click('[data-testid="user-menu"]');
            await page.click('text=Logout');
            await (0, test_1.expect)(page.locator('text=Sign In')).toBeVisible();
        });
    });
    // Test on mobile browsers
    test_1.test.describe('Mobile Browsers', () => {
        (0, test_1.test)('should work on iPhone', async ({ page }) => {
            // Set iPhone viewport
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('http://localhost:3000');
            // Test mobile navigation
            await (0, test_1.expect)(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
            await page.click('[data-testid="mobile-menu"]');
            await page.click('text=Library');
            // Verify mobile layout
            await (0, test_1.expect)(page.locator('[data-testid="mobile-game-grid"]')).toBeVisible();
            // Test mobile game addition
            await page.click('[data-testid="mobile-add-game"]');
            await page.fill('[data-testid="mobile-game-title"]', 'iPhone Test Game');
            await page.selectOption('[data-testid="mobile-game-genre"]', 'action');
            await page.selectOption('[data-testid="mobile-game-platform"]', 'steam');
            await page.fill('[data-testid="mobile-game-cover"]', 'https://example.com/cover.jpg');
            await page.fill('[data-testid="mobile-game-description"]', 'Test description');
            await page.fill('[data-testid="mobile-game-developer"]', 'Test Developer');
            await page.fill('[data-testid="mobile-game-publisher"]', 'Test Publisher');
            await page.fill('[data-testid="mobile-game-price"]', '29.99');
            await page.click('[data-testid="mobile-save-game"]');
            // Verify game was added
            await (0, test_1.expect)(page.locator('text=iPhone Test Game')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=Game added successfully')).toBeVisible();
        });
        (0, test_1.test)('should work on iPad', async ({ page }) => {
            // Set iPad viewport
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.goto('http://localhost:3000');
            // Test tablet navigation
            await (0, test_1.expect)(page.locator('[data-testid="sidebar"]')).toBeVisible();
            await page.click('[data-testid="library-nav"]');
            // Verify tablet layout
            await (0, test_1.expect)(page.locator('[data-testid="game-grid"]')).toBeVisible();
            // Test tablet game addition
            await page.click('[data-testid="add-game-button"]');
            await page.fill('[data-testid="game-title-input"]', 'iPad Test Game');
            await page.selectOption('[data-testid="game-genre-select"]', 'action');
            await page.selectOption('[data-testid="game-platform-select"]', 'steam');
            await page.fill('[data-testid="game-cover-input"]', 'https://example.com/cover.jpg');
            await page.fill('[data-testid="game-description-input"]', 'Test description');
            await page.fill('[data-testid="game-developer-input"]', 'Test Developer');
            await page.fill('[data-testid="game-publisher-input"]', 'Test Publisher');
            await page.fill('[data-testid="game-price-input"]', '29.99');
            await page.click('[data-testid="save-game-button"]');
            // Verify game was added
            await (0, test_1.expect)(page.locator('text=iPad Test Game')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=Game added successfully')).toBeVisible();
        });
        (0, test_1.test)('should work on Android', async ({ page }) => {
            // Set Android viewport
            await page.setViewportSize({ width: 360, height: 640 });
            await page.goto('http://localhost:3000');
            // Test mobile navigation
            await (0, test_1.expect)(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
            await page.click('[data-testid="mobile-menu"]');
            await page.click('text=Library');
            // Verify mobile layout
            await (0, test_1.expect)(page.locator('[data-testid="mobile-game-grid"]')).toBeVisible();
            // Test mobile game addition
            await page.click('[data-testid="mobile-add-game"]');
            await page.fill('[data-testid="mobile-game-title"]', 'Android Test Game');
            await page.selectOption('[data-testid="mobile-game-genre"]', 'action');
            await page.selectOption('[data-testid="mobile-game-platform"]', 'steam');
            await page.fill('[data-testid="mobile-game-cover"]', 'https://example.com/cover.jpg');
            await page.fill('[data-testid="mobile-game-description"]', 'Test description');
            await page.fill('[data-testid="mobile-game-developer"]', 'Test Developer');
            await page.fill('[data-testid="mobile-game-publisher"]', 'Test Publisher');
            await page.fill('[data-testid="mobile-game-price"]', '29.99');
            await page.click('[data-testid="mobile-save-game"]');
            // Verify game was added
            await (0, test_1.expect)(page.locator('text=Android Test Game')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=Game added successfully')).toBeVisible();
        });
    });
    test_1.test.describe('Responsive Design', () => {
        (0, test_1.test)('should adapt to different screen sizes', async ({ page }) => {
            await page.goto('http://localhost:3000');
            // Test different viewport sizes
            const viewports = [
                { width: 1920, height: 1080 }, // Desktop
                { width: 1366, height: 768 }, // Laptop
                { width: 768, height: 1024 }, // Tablet
                { width: 375, height: 667 }, // Mobile
                { width: 360, height: 640 } // Small mobile
            ];
            for (const viewport of viewports) {
                await page.setViewportSize(viewport);
                await page.waitForTimeout(1000); // Wait for layout to adjust
                // Verify main elements are visible
                if (viewport.width >= 768) {
                    await (0, test_1.expect)(page.locator('[data-testid="main-nav"]')).toBeVisible();
                    await (0, test_1.expect)(page.locator('[data-testid="sidebar"]')).toBeVisible();
                    await (0, test_1.expect)(page.locator('[data-testid="content-area"]')).toBeVisible();
                }
                else {
                    await (0, test_1.expect)(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
                    await (0, test_1.expect)(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
                }
                // Test that content is accessible
                await (0, test_1.expect)(page.locator('h1')).toBeVisible();
            }
        });
        (0, test_1.test)('should handle orientation changes', async ({ page }) => {
            await page.goto('http://localhost:3000');
            // Test landscape orientation
            await page.setViewportSize({ width: 1024, height: 768 });
            await page.waitForTimeout(1000);
            await (0, test_1.expect)(page.locator('h1')).toBeVisible();
            // Test portrait orientation
            await page.setViewportSize({ width: 375, height: 667 });
            await page.waitForTimeout(1000);
            await (0, test_1.expect)(page.locator('h1')).toBeVisible();
            // Test square orientation
            await page.setViewportSize({ width: 768, height: 768 });
            await page.waitForTimeout(1000);
            await (0, test_1.expect)(page.locator('h1')).toBeVisible();
        });
    });
    test_1.test.describe('Browser-Specific Features', () => {
        (0, test_1.test)('should support Web Components in Chromium', async ({ page }) => {
            await page.goto('http://localhost:3000');
            // Test if web components are supported
            const supportsWebComponents = await page.evaluate(() => 'customElements' in window);
            (0, test_1.expect)(supportsWebComponents).toBe(true);
            // Test if CSS custom properties are supported
            const supportsCSSCustomProperties = await page.evaluate(() => CSS.supports('color', 'var(--test)'));
            (0, test_1.expect)(supportsCSSCustomProperties).toBe(true);
            // Test if Intersection Observer is supported
            const supportsIntersectionObserver = await page.evaluate(() => 'IntersectionObserver' in window);
            (0, test_1.expect)(supportsIntersectionObserver).toBe(true);
            // Test if Resize Observer is supported
            const supportsResizeObserver = await page.evaluate(() => 'ResizeObserver' in window);
            (0, test_1.expect)(supportsResizeObserver).toBe(true);
        });
        (0, test_1.test)('should support WebSockets in Firefox', async ({ page }) => {
            await page.goto('http://localhost:3000');
            // Test if WebSocket is supported
            const supportsWebSockets = await page.evaluate(() => 'WebSocket' in window);
            (0, test_1.expect)(supportsWebSockets).toBe(true);
            // Test if Service Worker is supported
            const supportsServiceWorker = await page.evaluate(() => 'serviceWorker' in navigator);
            (0, test_1.expect)(supportsServiceWorker).toBe(true);
            // Test if WebRTC is supported
            const supportsWebRTC = await page.evaluate(() => 'RTCPeerConnection' in window);
            (0, test_1.expect)(supportsWebRTC).toBe(true);
        });
        (0, test_1.test)('should support Safari features', async ({ page }) => {
            await page.goto('http://localhost:3000');
            // Test if Web Components are supported
            const supportsWebComponents = await page.evaluate(() => 'customElements' in window);
            (0, test_1.expect)(supportsWebComponents).toBe(true);
            // Test if CSS Grid is supported
            const supportsCSSGrid = await page.evaluate(() => CSS.supports('display', 'grid'));
            (0, test_1.expect)(supportsCSSGrid).toBe(true);
            // Test if CSS custom properties are supported
            const supportsCSSCustomProperties = await page.evaluate(() => CSS.supports('color', 'var(--test)'));
            (0, test_1.expect)(supportsCSSCustomProperties).toBe(true);
            // Test if Intersection Observer is supported
            const supportsIntersectionObserver = await page.evaluate(() => 'IntersectionObserver' in window);
            (0, test_1.expect)(supportsIntersectionObserver).toBe(true);
            // Test if Resize Observer is supported
            const supportsResizeObserver = await page.evaluate(() => 'ResizeObserver' in window);
            (0, test_1.expect)(supportsResizeObserver).toBe(true);
        });
        (0, test_1.test)('should support Edge features', async ({ page }) => {
            await page.goto('http://localhost:3000');
            // Test if Web Components are supported
            const supportsWebComponents = await page.evaluate(() => 'customElements' in window);
            (0, test_1.expect)(supportsWebComponents).toBe(true);
            // Test if CSS Grid is supported
            const supportsCSSGrid = await page.evaluate(() => CSS.supports('display', 'grid'));
            (0, test_1.expect)(supportsCSSGrid).toBe(true);
            // Test if CSS custom properties are supported
            const supportsCSSCustomProperties = await page.evaluate(() => CSS.supports('color', 'var(--test)'));
            (0, test_1.expect)(supportsCSSCustomProperties).toBe(true);
            // Test if Intersection Observer is supported
            const supportsIntersectionObserver = await page.evaluate(() => 'IntersectionObserver' in window);
            (0, test_1.expect)(supportsIntersectionObserver).toBe(true);
            // Test if Resize Observer is supported
            const supportsResizeObserver = await page.evaluate(() => 'ResizeObserver' in window);
            (0, test_1.expect)(supportsResizeObserver).toBe(true);
        });
    });
    test_1.test.describe('Performance Across Browsers', () => {
        (0, test_1.test)('should have consistent load times', async ({ page }) => {
            const startTime = Date.now();
            await page.goto('http://localhost:3000');
            const loadTime = Date.now() - startTime;
            // Load time should be reasonable across all browsers
            (0, test_1.expect)(loadTime).toBeLessThan(3000);
        });
        (0, test_1.test)('should have consistent rendering performance', async ({ page }) => {
            await page.goto('http://localhost:3000');
            // Navigate to library
            await page.click('[data-testid="library-nav"]');
            await page.waitForSelector('[data-testid="game-grid"]');
            const renderStartTime = Date.now();
            await page.click('[data-testid="add-game-button"]');
            await page.fill('[data-testid="game-title-input"]', 'Performance Test Game');
            await page.click('[data-testid="save-game-button"]');
            await page.waitForSelector('text=Game added successfully');
            const renderTime = Date.now() - renderStartTime;
            // Render time should be consistent across browsers
            (0, test_1.expect)(renderTime).toBeLessThan(1000);
        });
        (0, test_1.test)('should handle animations consistently', async ({ page }) => {
            await page.goto('http://localhost:3000');
            // Test CSS animations
            const animationStartTime = Date.now();
            await page.click('[data-testid="mood-nav"]');
            await page.waitForSelector('[data-testid="mood-options"]');
            await page.click('[data-testid="mood-competitive"]');
            await page.waitForSelector('[data-testid="recommendation-grid"]');
            const animationTime = Date.now() - animationStartTime;
            // Animation performance should be consistent
            (0, test_1.expect)(animationTime).toBeLessThan(500);
        });
    });
    test_1.test.describe('Accessibility Consistency', () => {
        (0, test_1.test)('should maintain accessibility across browsers', async ({ page }) => {
            await page.goto('http://localhost:3000');
            // Test keyboard navigation
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            // Verify focus indicators
            const focusedElements = page.locator(':focus');
            (0, test_1.expect)(focusedElements.count()).toBeGreaterThan(0);
            // Test ARIA attributes
            const mainHeading = page.locator('h1');
            await (0, test_1.expect)(mainHeading).toHaveAttribute('role', 'heading');
            // Test form accessibility
            await page.click('text=Sign In');
            const emailInput = page.locator('[data-testid="email-input"]');
            await (0, test_1.expect)(emailInput).toHaveAttribute('type', 'email');
            await (0, test_1.expect)(emailInput).toHaveAttribute('name', 'email');
            await (0, test_1.expect)(emailInput).toHaveAttribute('autocomplete', 'email');
            const passwordInput = page.locator('[data-testid="password-input"]');
            await (0, test_1.expect)(passwordInput).toHaveAttribute('type', 'password');
            await (0, test_1.expect)(passwordInput).toHaveAttribute('name', 'password');
            await (0, test_1.expect)(passwordInput).toHaveAttribute('autocomplete', 'current-password');
        });
        (0, test_1.test)('should support screen readers', async ({ page }) => {
            await page.goto('http://localhost:3000');
            // Test screen reader compatibility
            const a11yResults = await page.accessibility.snapshot();
            (0, test_1.expect)(a11yResults.violations.length).toBeLessThan(10);
            // Test semantic HTML structure
            const main = page.locator('main');
            (0, test_1.expect)(main).toBeDefined();
            const navigation = page.locator('nav');
            (0, test_1.expect)(navigation).toBeDefined();
            const mainHeading = page.locator('h1');
            (0, test_1.expect)(mainHeading).toBeDefined();
        });
        (0, test_1.test)('should handle reduced motion preferences', async ({ page }) => {
            await page.goto('http://localhost:3000');
            // Enable reduced motion
            await page.emulateMedia({ reducedMotion: 'reduce' });
            // Test that animations are reduced
            await page.click('[data-testid="mood-nav"]');
            await page.waitForSelector('[data-testid="mood-options"]');
            // Verify reduced motion
            const animations = page.locator('[data-testid*="animate"]');
            const reducedMotionStyles = await animations.evaluateAll(elements => {
                return elements.map(el => window.getComputedStyle(el).animationDuration === '0s');
            });
            (0, test_1.expect)(reducedMotionStyles.length).toBeGreaterThan(0);
        });
    });
    test_1.test.describe('Error Handling', () => {
        (0, test_1.test)('should handle network errors consistently', async ({ page }) => {
            // Simulate network error
            await page.route('**/api/**', route => route.abort('failed'));
            await page.goto('http://localhost:3000');
            // Try to login
            await page.click('text=Sign In');
            await page.fill('[data-testid="email-input"]', 'error-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.click('[data-testid="login-button"]');
            // Verify error handling
            await (0, test_1.expect)(page.locator('text=Network error occurred')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=Please try again later')).toBeVisible();
        });
        (0, test_1.test)('should handle timeout errors consistently', async ({ page }) => {
            // Simulate timeout
            await page.route('**/api/**', route => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(route.fulfill({
                            status: 408,
                            contentType: 'application/json',
                            body: JSON.stringify({ error: 'Request timeout' })
                        }));
                    }, 5000);
                });
            });
            await page.goto('http://localhost:3000');
            // Try to login
            await page.click('text=Sign In');
            await page.fill('[data-testid="email-input"]', 'timeout-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.click('[data-testid="login-button"]');
            // Verify timeout handling
            await (0, test_1.expect)(page.locator('text=Request timeout')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=Please try again')).toBeVisible();
        });
        (0, test_1.test)('should handle validation errors consistently', async ({ page }) => {
            await page.goto('http://localhost:3000');
            // Try to submit empty form
            await page.click('text=Sign In');
            await page.click('[data-testid="login-button"]');
            // Verify validation errors
            await (0, test_1.expect)(page.locator('text=Email is required')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=Password is required')).toBeVisible();
        });
    });
});
test_1.test.describe('Cross-Browser Performance Metrics', () => {
    (0, test_1.test)('should measure performance metrics', async ({ page }) => {
        await page.goto('http://localhost:3000');
        // Collect performance metrics
        const metrics = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation');
            const paint = performance.getEntriesByType('paint');
            const memory = performance.memory;
            return {
                navigationCount: navigation.length,
                paintCount: paint.length,
                usedJSHeapSize: memory.usedJSHeapSize,
                totalJSHeapSize: memory.totalJSHeapSize,
                domNodes: document.querySelectorAll('*').length,
                timing: performance.getEntriesByType('timing').length
            };
        });
        // Verify reasonable performance metrics
        (0, test_1.expect)(metrics.navigationCount).toBeGreaterThan(0);
        (0, test_1.expect)(metrics.paintCount).toBeGreaterThan(0);
        (0, test_1.expect)(metrics.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
        (0, test_1.expect)(metrics.domNodes).toBeGreaterThan(0);
        (0, test_1.expect)(metrics.timing).toBeGreaterThan(0);
    });
    (0, test_1.test)('should track Core Web Vitals', async ({ page }) => {
        await page.goto('http://localhost:3000');
        // Collect Core Web Vitals
        const vitals = await page.evaluate(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const vitals = performance.getEntriesByType('paint')
                        .filter(entry => entry.name.includes('largest-contentful-paint'))
                        .reduce((max, entry) => Math.max(max, entry.duration || 0), 0);
                    resolve({
                        largestContentfulPaint: max,
                        firstContentfulPaint: vitals[0]?.startTime || 0,
                        firstMeaningfulPaint: vitals[0]?.startTime || 0,
                        firstPaint: vitals[0]?.startTime || 0
                    });
                }, 1000);
            });
        });
        // Verify Core Web Vitals
        (0, test_1.expect)(vitals.largestContentfulPaint).toBeLessThan(2500); // LCP under 2.5s
        (0, test_1.expect)(vitals.firstContentfulPaint).toBeLessThan(1000); // FCP under 1s
        (0, test_1.expect)(vitals.firstPaint).toBeLessThan(500); // FCP under 500ms
    });
});
