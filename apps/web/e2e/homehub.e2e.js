"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
// Mock data for testing
const mockUser = {
    id: '1',
    username: 'testuser',
    displayName: 'Test User',
    avatar: 'test-avatar.jpg'
};
const mockGames = [
    {
        id: '1',
        title: 'Test Game 1',
        coverImage: '/test-cover-1.jpg',
        genres: [{ id: 'action', name: 'Action', color: '#FF6B6B' }],
        platforms: [{ id: 'steam', name: 'Steam', code: 'steam', isConnected: false }],
        playStatus: 'unplayed',
        hoursPlayed: 0,
        userRating: 0,
        isFavorite: false,
        tags: ['test', 'sample']
    },
    {
        id: '2',
        title: 'Test Game 2',
        coverImage: '/test-cover-2.jpg',
        genres: [{ id: 'rpg', name: 'RPG', color: '#10B981' }],
        platforms: [{ id: 'epic', name: 'Epic', code: 'epic', isConnected: false }],
        playStatus: 'playing',
        hoursPlayed: 25,
        userRating: 4,
        isFavorite: true,
        tags: ['favorite', 'rpg']
    }
];
test_1.test.describe('GamePilot E2E Tests', () => {
    test_1.test.beforeEach(async ({ page }) => {
        // Mock authentication
        await page.goto('/login');
        await page.fill('[data-testid="username-input"]', mockUser.username);
        await page.fill('[data-testid="password-input"]', 'test-password');
        await page.click('[data-testid="login-button"]');
        // Wait for successful login
        await page.waitForURL('**/home');
    });
    (0, test_1.test)('should navigate to home hub', async ({ page }) => {
        await page.goto('/home');
        // Verify user is logged in
        await (0, test_1.expect)(page.locator('[data-testid="user-avatar"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('text=Welcome back, Test User')).toBeVisible();
        // Verify integrations section
        await (0, test_1.expect)(page.locator('text=Integrations')).toBeVisible();
        await (0, test_1.expect)(page.locator('text=Steam')).toBeVisible();
        await (0, test_1.expect)(page.locator('text=Discord')).toBeVisible();
        await (0, test_1.expect)(page.locator('text=YouTube')).toBeVisible();
    });
    (0, test_1.test)('should navigate to library', async ({ page }) => {
        await page.goto('/library');
        // Verify library page loads
        await (0, test_1.expect)(page.locator('text=Your Game Library')).toBeVisible();
        // Verify game cards are displayed
        await (0, test_1.expect)(page.locator('[data-testid="game-card-1"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('[data-testid="game-card-2"]')).toBeVisible();
        // Verify game details
        await page.click('[data-testid="game-card-1"]');
        await (0, test_1.expect)(page.locator('text=Test Game 1')).toBeVisible();
        await (0, test_1.expect)(page.locator('text=Action')).toBeVisible();
        await (0, test_1.expect)(page.locator('text=Unplayed')).toBeVisible();
    });
    (0, test_1.test)('should add a new game', async ({ page }) => {
        await page.goto('/library');
        // Click add game button
        await page.click('[data-testid="add-game-button"]');
        // Wait for modal to open
        await (0, test_1.expect)(page.locator('[data-testid="add-game-modal"]')).toBeVisible();
        // Fill game details
        await page.fill('[data-testid="game-title-input"]', 'New Test Game');
        await page.fill('[data-testid="game-genre-select"]', 'Action');
        await page.click('[data-testid="game-platform-select"]');
        await page.click('[data-testid="platform-steam"]');
        // Submit form
        await page.click('[data-testid="submit-game-button"]');
        // Verify game was added
        await (0, test_1.expect)(page.locator('text=New Test Game')).toBeVisible();
        await (0, test_1.expect)(page.locator('[data-testid="game-card-3"]')).toBeVisible();
    });
    (0, test_1.test)('should update game status', async ({ page }) => {
        await page.goto('/library');
        // Click on first game
        await page.click('[data-testid="game-card-1"]');
        // Update status to playing
        await page.click('[data-testid="status-dropdown"]');
        await page.click('[data-testid="status-playing"]');
        // Verify status update
        await (0, test_1.expect)(page.locator('[data-testid="game-card-1"] [data-testid="game-status"]')).toHaveText('Playing');
    });
    (0, test_1.test)('should search games', async ({ page }) => {
        await page.goto('/library');
        // Enter search term
        await page.fill('[data-testid="search-input"]', 'Test Game');
        // Verify search results
        await (0, test_1.expect)(page.locator('[data-testid="game-card-1"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('text=Test Game 1')).toBeVisible();
    });
    (0, test_1.test)('should navigate to identity section', async ({ page }) => {
        await page.goto('/identity');
        // Verify identity page loads
        await (0, test_1.expect)(page.locator('text=Your Gaming Identity')).toBeVisible();
        // Verify mood tracking
        await (0, test_1.expect)(page.locator('text=Current Mood')).toBeVisible();
        await (0, test_1.expect)(page.locator('text=Mood Tracking')).toBeVisible();
        // Verify playstyle analysis
        await (0, test_1.expect)(page.locator('text=Playstyle Analysis')).toBeVisible();
        // Verify genre affinity
        await (0, test_1.expect)(page.locator('text=Genre Affinity')).toBeVisible();
    });
    (0, test_1.test)('should handle responsive design', async ({ page }) => {
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/home');
        // Verify mobile layout
        await (0, test_1.expect)(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
        await (0, test_1.expect)(page.locator('[data-testid="mobile-integrations"]')).toBeVisible();
        // Test tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 });
        await (0, test_1.expect)(page.locator('[data-testid="tablet-layout"]')).toBeVisible();
        // Test desktop viewport
        await page.setViewportSize({ width: 1920, height: 1080 });
        await (0, test_1.expect)(page.locator('[data-testid="desktop-layout"]')).toBeVisible();
    });
    (0, test_1.test)('should handle error states', async ({ page }) => {
        // Test network error
        await page.route('**/api/games', route => route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Network error' })
        }));
        await page.goto('/library');
        await (0, test_1.expect)(page.locator('text=Network Error')).toBeVisible();
        await (0, test_1.expect)(page.locator('text=Failed to load games')).toBeVisible();
    });
    (0, test_1.test)('should handle authentication flow', async ({ page }) => {
        // Test logout
        await page.goto('/home');
        await page.click('[data-testid="user-menu"]');
        await page.click('[data-testid="logout-button"]');
        // Verify redirect to login
        await (0, test_1.expect)(page).toHaveURL('**/login');
        // Test login with invalid credentials
        await page.goto('/login');
        await page.fill('[data-testid="username-input"]', 'invaliduser');
        await page.fill('[data-testid="password-input"]', 'invalidpass');
        await page.click('[data-testid="login-button"]');
        // Verify error message
        await (0, test_1.expect)(page.locator('text=Invalid credentials')).toBeVisible();
    });
    (0, test_1.test)('should verify accessibility features', async ({ page }) => {
        await page.goto('/home');
        // Test keyboard navigation
        await page.keyboard.press('Tab');
        await (0, test_1.expect)(page.locator('[data-testid="integrations-section"]')).toBeFocused();
        // Test ARIA labels
        const steamButton = page.locator('[data-testid="steam-integration"]');
        await (0, test_1.expect)(steamButton).toHaveAttribute('aria-label', 'Steam integration');
        // Test screen reader compatibility
        await (0, test_1.expect)(page.locator('[data-testid="user-avatar"]')).toHaveAttribute('alt', 'Test User avatar');
    });
    (0, test_1.test)('should measure performance metrics', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/library');
        // Wait for page to fully load
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;
        // Verify load time is reasonable (< 3 seconds)
        (0, test_1.expect)(loadTime).toBeLessThan(3000);
        // Test memory usage (basic check)
        const performanceMetrics = await page.evaluate(() => {
            return {
                memoryUsed: performance.memory?.usedJSHeapSize || 0,
                domNodes: document.querySelectorAll('*').length
            };
        });
        // Verify reasonable memory usage
        (0, test_1.expect)(performanceMetrics.memoryUsed).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
        (0, test_1.expect)(performanceMetrics.domNodes).toBeLessThan(1000); // Less than 1000 DOM nodes
    });
});
