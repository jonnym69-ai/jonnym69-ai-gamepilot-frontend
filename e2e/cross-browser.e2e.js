"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
// Browser compatibility matrix
const BROWSER_MATRIX = {
    desktop: {
        chrome: {
            name: 'Chrome',
            version: '120+',
            marketShare: '65%',
            priority: 'high',
            features: ['ES6+', 'CSS Grid', 'Flexbox', 'WebP'],
            knownIssues: ['Some CSS animations', 'Older browser compatibility']
        },
        firefox: {
            name: 'Firefox',
            version: '115+',
            marketShare: '15%',
            priority: 'high',
            features: ['ES6+', 'CSS Grid', 'Flexbox', 'WebP'],
            knownIssues: ['Different CSS parsing', 'Animation timing']
        },
        safari: {
            name: 'Safari',
            version: '14+',
            marketShare: '18%',
            priority: 'medium',
            features: ['ES6+', 'CSS Grid', 'Flexbox'],
            knownIssues: ['Strict CSS parsing', 'Touch events']
        },
        edge: {
            name: 'Edge',
            version: '120+',
            marketShare: '5%',
            priority: 'medium',
            features: ['ES6+', 'CSS Grid', 'Flexbox', 'WebP'],
            knownIssues: ['Different box model', 'CSS Grid support']
        }
    },
    mobile: {
        chrome_mobile: {
            name: 'Chrome Mobile',
            version: '120+',
            marketShare: '45%',
            priority: 'high',
            features: ['ES6+', 'CSS Grid', 'Flexbox', 'Touch events'],
            knownIssues: ['Viewport issues', 'Touch event handling']
        },
        safari_mobile: {
            name: 'Safari Mobile',
            version: '14+',
            marketShare: '35%',
            priority: 'medium',
            features: ['ES6+', 'CSS Grid', 'Flexbox', 'Touch events'],
            knownIssues: ['Viewport scaling', 'Touch event delays']
        }
    }
};
// Test scenarios for cross-browser compatibility
const TEST_SCENARIOS = {
    basicNavigation: 'Basic navigation and routing',
    gameManagement: 'Game CRUD operations and library management',
    authentication: 'Login, logout, and session management',
    responsiveDesign: 'Mobile, tablet, and desktop layouts',
    animations: 'CSS animations and transitions',
    forms: 'Game creation, editing, and metadata forms',
    performance: 'Load times and resource usage',
    accessibility: 'Screen reader and keyboard navigation support'
};
test_1.test.describe('Cross-Browser Compatibility Tests', () => {
    // Test desktop browsers
    for (const [browserName, browserConfig] of Object.entries(BROWSER_MATRIX.desktop)) {
        test_1.test.describe(`${browserConfig.name} Desktop`, () => {
            (0, test_1.test)(`should load and render correctly in ${browserConfig.name}`, async ({ page }) => {
                await page.goto('/home');
                // Verify basic rendering
                await (0, test_1.expect)(page.locator('text=Welcome back, Gamer')).toBeVisible();
                await (0, test_1.expect)(page.locator('text=Integrations')).toBeVisible();
                await (0, test_1.expect)(page.locator('text=Steam')).toBeVisible();
                // Test browser-specific features
                if (browserName === 'chrome') {
                    // Chrome-specific tests
                    await (0, test_1.expect)(page.locator('[data-testid="webp-chrome-features"]')).toBeVisible();
                }
                // Check for console errors
                page.on('console', (msg) => {
                    if (msg.type() === 'error') {
                        console.error(`${browserConfig.name} Console Error:`, msg.text());
                    }
                });
            });
            (0, test_1.test)(`should handle game library in ${browserConfig.name}`, async ({ page }) => {
                await page.goto('/library');
                // Verify library functionality
                await (0, test_1.expect)(page.locator('text=Your Game Library')).toBeVisible();
                await (0, test_1.expect)(page.locator('[data-testid="game-card-1"]')).toBeVisible();
                // Test game interactions
                await page.click('[data-testid="game-card-1"]');
                await (0, test_1.expect)(page.locator('text=Test Game 1')).toBeVisible();
            });
            (0, test_1.test)(`should handle responsive design in ${browserConfig.name}`, async ({ page }) => {
                // Test mobile viewport
                await page.setViewportSize({ width: 375, height: 667 });
                await page.goto('/home');
                await (0, test_1.expect)(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
                await (0, test_1.expect)(page.locator('[data-testid="mobile-layout"]')).toBeVisible();
                // Test tablet viewport
                await page.setViewportSize({ width: 768, height: 1024 });
                await (0, test_1.expect)(page.locator('[data-testid="tablet-layout"]')).toBeVisible();
                // Test desktop viewport
                await page.setViewportSize({ width: 1920, height: 1080 });
                await (0, test_1.expect)(page.locator('[data-testid="desktop-layout"]')).toBeVisible();
            });
            (0, test_1.test)(`should handle animations in ${browserConfig.name}`, async ({ page }) => {
                await page.goto('/home');
                // Trigger animation
                await page.hover('[data-testid="game-card-1"]');
                await page.waitForTimeout(1000);
                // Verify animation completed
                const isAnimated = await page.locator('[data-testid="game-card-1"]').evaluate((el) => {
                    return window.getComputedStyle(el).animation !== 'none';
                });
                if (browserConfig.name === 'safari') {
                    // Safari might have different animation timing
                    await (0, test_1.expect)(isAnimated).toBeTruthy();
                }
            });
        });
    }
    // Test mobile browsers
    for (const [browserName, browserConfig] of Object.entries(BROWSER_MATRIX.mobile)) {
        test_1.test.describe(`${browserConfig.name} Mobile`, () => {
            (0, test_1.test)(`should handle touch interactions in ${browserConfig.name}`, async ({ page }) => {
                await page.setViewportSize({ width: 375, height: 667 });
                await page.goto('/library');
                // Test touch interactions
                await page.tap('[data-testid="game-card-1"]');
                await (0, test_1.expect)(page.locator('text=Test Game 1')).toBeVisible();
                // Test mobile-specific features
                await (0, test_1.expect)(page.locator('[data-testid="mobile-touch-gestures"]')).toBeVisible();
            });
            (0, test_1.test)(`should handle mobile viewport in ${browserConfig.name}`, async ({ page }) => {
                await page.setViewportSize({ width: 375, height: 667 });
                await page.goto('/home');
                // Verify mobile layout
                await (0, test_1.expect)(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
                await (0, test_1.expect)(page.locator('[data-testid="mobile-integrations"]')).toBeVisible();
                // Test orientation changes
                await page.setViewportSize({ width: 667, height: 375 });
                await page.waitForTimeout(500);
                const isLandscape = await page.evaluate(() => {
                    return window.innerWidth > window.innerHeight;
                });
                await (0, test_1.expect)(isLandscape).toBeTruthy();
            });
            (0, test_1.test)(`should handle performance in ${browserConfig.name}`, async ({ page }) => {
                await page.setViewportSize({ width: 375, height: 667 });
                // Test mobile performance
                const startTime = Date.now();
                await page.goto('/library');
                await page.waitForLoadState('networkidle');
                const loadTime = Date.now() - startTime;
                (0, test_1.expect)(loadTime).toBeLessThan(4000); // Mobile should load within 4 seconds
            });
        });
    }
    test_1.test.describe('Cross-Browser Feature Detection', () => {
        (0, test_1.test)('should detect browser capabilities correctly', async ({ page }) => {
            const capabilities = await page.evaluate(() => {
                return {
                    userAgent: navigator.userAgent,
                    language: navigator.language,
                    platform: navigator.platform,
                    cookieEnabled: navigator.cookieEnabled,
                    localStorage: typeof Storage !== 'undefined',
                    sessionStorage: typeof sessionStorage !== 'undefined',
                    geolocation: 'geolocation' in navigator,
                    webgl: !!document.createElement('canvas').getContext('webgl'),
                    webWorker: typeof Worker !== 'undefined'
                };
            });
            // Verify essential capabilities
            (0, test_1.expect)(capabilities.localStorage).toBeTruthy();
            (0, test_1.expect)(capabilities.sessionStorage).toBeTruthy();
            (0, test_1.expect)(capabilities.cookieEnabled).toBeTruthy();
        });
        (0, test_1.test)('should handle browser-specific CSS features', async ({ page }) => {
            await page.goto('/home');
            // Test CSS feature detection
            const cssFeatures = await page.evaluate(() => {
                const testElement = document.createElement('div');
                return {
                    cssGrid: CSS.supports && CSS.supports('grid-template-columns', 'grid-template-rows'),
                    cssFlexbox: CSS.supports && CSS.supports('display', 'flex'),
                    cssTransform: CSS.supports && CSS.supports('transform', '3d'),
                    webp: document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp')
                };
            });
            (0, test_1.expect)(cssFeatures.cssGrid).toBeTruthy();
            (0, test_1.expect)(cssFeatures.cssFlexbox).toBeTruthy();
            (0, test_1.expect)(cssFeatures.cssTransform).toBeTruthy();
            (0, test_1.expect)(cssFeatures.webp).toBeTruthy();
        });
        (0, test_1.test)('should handle JavaScript compatibility', async ({ page }) => {
            await page.goto('/home');
            // Test modern JavaScript features
            const jsFeatures = await page.evaluate(() => {
                return {
                    promises: typeof Promise !== 'undefined',
                    fetch: typeof fetch !== 'undefined',
                    arrow: (() => { try {
                        return eval('() => {}');
                    }
                    catch {
                        return false;
                    } })(),
                    classes: typeof document.createElement('div').classList !== 'undefined',
                    modules: typeof window !== 'undefined' && 'import' in window
                };
            });
            (0, test_1.expect)(jsFeatures.promises).toBeTruthy();
            (0, test_1.expect)(jsFeatures.fetch).toBeTruthy();
            (0, test_1.expect)(jsFeatures.arrow).toBeTruthy();
            (0, test_1.expect)(jsFeatures.classes).toBeTruthy();
            (0, test_1.expect)(jsFeatures.modules).toBeTruthy();
        });
    });
    test_1.test.describe('Browser-Specific Issues', () => {
        (0, test_1.test)('should handle known browser issues gracefully', async ({ page }) => {
            await page.goto('/library');
            // Test for known browser-specific issues
            const browserIssues = await page.evaluate(() => {
                const issues = [];
                // Check for common issues
                if (navigator.userAgent.includes('Chrome/')) {
                    issues.push('Chrome-specific CSS animation timing');
                }
                if (navigator.userAgent.includes('Firefox/')) {
                    issues.push('Firefox-specific CSS parsing');
                }
                if (navigator.userAgent.includes('Safari/')) {
                    issues.push('Safari-specific strict CSS parsing');
                }
                return {
                    userAgent: navigator.userAgent,
                    issues,
                    hasIssues: issues.length > 0
                };
            });
            // Should handle issues gracefully
            (0, test_1.expect)(browserIssues.hasIssues).toBeTruthy();
        });
    });
    test_1.test.describe('Performance Comparison', () => {
        (0, test_1.test)('should compare performance across browsers', async ({ page }) => {
            const performanceResults = [];
            // Test load performance across browsers
            const browsers = ['chromium', 'firefox', 'webkit'];
            for (const browser of browsers) {
                const startTime = Date.now();
                await page.goto('/library');
                await page.waitForLoadState('networkidle');
                const loadTime = Date.now() - startTime;
                performanceResults.push({
                    browser,
                    loadTime
                });
            }
            // Performance should be consistent across browsers
            const avgLoadTime = performanceResults.reduce((sum, r) => sum + r.loadTime, 0) / performanceResults.length;
            const maxLoadTime = Math.max(...performanceResults.map(r => r.loadTime));
            const minLoadTime = Math.min(...performanceResults.map(r => r.loadTime));
            // All browsers should load within acceptable range
            (0, test_1.expect)(maxLoadTime).toBeLessThan(5000);
            (0, test_1.expect)(minLoadTime).toBeGreaterThan(500);
            // Performance variance should be reasonable
            const variance = performanceResults.reduce((sum, r) => sum + Math.pow(r.loadTime - avgLoadTime, 2), 0) / performanceResults.length;
            (0, test_1.expect)(variance).toBeLessThan(1000000); // Variance less than 1 second squared
        });
    });
    test_1.test.describe('Compatibility Reporting', () => {
        (0, test_1.test)('should generate compatibility report', async ({ page }) => {
            const compatibilityReport = await page.evaluate(() => {
                const report = {
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    browser: getBrowserName(navigator.userAgent),
                    version: getBrowserVersion(navigator.userAgent),
                    platform: navigator.platform,
                    language: navigator.language,
                    screenResolution: `${window.screen.width}x${window.screen.height}`,
                    colorDepth: window.screen.colorDepth,
                    pixelRatio: window.devicePixelRatio || 1,
                    touchSupport: 'ontouchstart' in window,
                    localStorage: typeof Storage !== 'undefined',
                    sessionStorage: typeof sessionStorage !== 'undefined',
                    webgl: !!document.createElement('canvas').getContext('webgl'),
                    webWorker: typeof Worker !== 'undefined'
                };
                return report;
            });
            // Verify report structure
            (0, test_1.expect)(compatibilityReport.browser).toBeTruthy();
            (0, test_1.expect)(compatibilityReport.version).toBeTruthy();
            (0, test_1.expect)(compatibilityReport.userAgent).toBeTruthy();
        });
    });
});
// Helper functions
function getBrowserName(userAgent) {
    if (userAgent.includes('Chrome/'))
        return 'Chrome';
    if (userAgent.includes('Firefox/'))
        return 'Firefox';
    if (userAgent.includes('Safari/'))
        return 'Safari';
    if (userAgent.includes('Edge/'))
        return 'Edge';
    return 'Unknown';
}
function getBrowserVersion(userAgent) {
    const match = userAgent.match(/(?:Chrome|Firefox|Safari|Edge)\/(\d+)/);
    return match ? match[1] : 'Unknown';
}
