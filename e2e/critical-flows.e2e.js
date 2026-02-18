"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// E2E tests for critical user flows
const test_1 = require("@playwright/test");
test_1.test.describe('Critical User Flows', () => {
    test_1.test.beforeEach(async ({ page }) => {
        // Navigate to the application
        await page.goto('http://localhost:3000');
    });
    test_1.test.describe('User Registration Flow', () => {
        (0, test_1.test)('should register a new user successfully', async ({ page }) => {
            // Navigate to registration page
            await page.click('text=Sign Up');
            // Fill registration form
            await page.fill('[data-testid="email-input"]', 'e2e-test@example.com');
            await page.fill('[data-testid="username-input"]', 'e2euser');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.fill('[data-testid="display-name-input"]', 'E2E Test User');
            await page.selectOption('[data-testid="timezone-select"]', 'UTC');
            // Submit registration
            await page.click('[data-testid="register-button"]');
            // Verify successful registration
            await (0, test_1.expect)(page.locator('text=Welcome to GamePilot!')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=E2E Test User')).toBeVisible();
            // Verify user is logged in
            await (0, test_1.expect)(page.locator('[data-testid="user-menu"]')).toBeVisible();
        });
        (0, test_1.test)('should show validation errors for invalid registration', async ({ page }) => {
            // Navigate to registration page
            await page.click('text=Sign Up');
            // Submit empty form
            await page.click('[data-testid="register-button"]');
            // Verify validation errors
            await (0, test_1.expect)(page.locator('text=Email is required')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=Username is required')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=Password is required')).toBeVisible();
            // Fill with invalid data
            await page.fill('[data-testid="email-input"]', 'invalid-email');
            await page.fill('[data-testid="username-input"]', 'ab');
            await page.fill('[data-testid="password-input"]', '123');
            // Submit form
            await page.click('[data-testid="register-button"]');
            // Verify specific validation errors
            await (0, test_1.expect)(page.locator('text=Please enter a valid email')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=Username must be at least 3 characters')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=Password must be at least 8 characters')).toBeVisible();
        });
        (0, test_1.test)('should handle duplicate registration gracefully', async ({ page }) => {
            // First register a user
            await page.click('text=Sign Up');
            await page.fill('[data-testid="email-input"]', 'duplicate@example.com');
            await page.fill('[data-testid="username-input"]', 'duplicateuser');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.fill('[data-testid="display-name-input"]', 'Duplicate User');
            await page.selectOption('[data-testid="timezone-select"]', 'UTC');
            await page.click('[data-testid="register-button"]');
            // Logout
            await page.click('[data-testid="user-menu"]');
            await page.click('text=Logout');
            // Try to register with same email
            await page.click('text=Sign Up');
            await page.fill('[data-testid="email-input"]', 'duplicate@example.com');
            await page.fill('[data-testid="username-input"]', 'differentuser');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.fill('[data-testid="display-name-input"]', 'Different User');
            await page.selectOption('[data-testid="timezone-select"]', 'UTC');
            await page.click('[data-testid="register-button"]');
            // Verify duplicate error
            await (0, test_1.expect)(page.locator('text=Email already exists')).toBeVisible();
        });
    });
    test_1.test.describe('User Login Flow', () => {
        (0, test_1.test)('should login with valid credentials', async ({ page }) => {
            // Navigate to login page
            await page.click('text=Sign In');
            // Fill login form
            await page.fill('[data-testid="email-input"]', 'e2e-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            // Submit login
            await page.click('[data-testid="login-button"]');
            // Verify successful login
            await (0, test_1.expect)(page.locator('[data-testid="user-menu"]')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=E2E Test User')).toBeVisible();
        });
        (0, test_1.test)('should show error for invalid credentials', async ({ page }) => {
            // Navigate to login page
            await page.click('text=Sign In');
            // Fill with invalid credentials
            await page.fill('[data-testid="email-input"]', 'e2e-test@example.com');
            await page.fill('[data-testid="password-input"]', 'WrongPassword');
            // Submit login
            await page.click('[data-testid="login-button"]');
            // Verify error message
            await (0, test_1.expect)(page.locator('text=Invalid email or password')).toBeVisible();
        });
        (0, test_1.test)('should handle forgot password flow', async ({ page }) => {
            // Navigate to login page
            await page.click('text=Sign In');
            // Click forgot password
            await page.click('text=Forgot Password?');
            // Fill email for password reset
            await page.fill('[data-testid="email-input"]', 'e2e-test@example.com');
            // Submit password reset
            await page.click('[data-testid="reset-button"]');
            // Verify success message
            await (0, test_1.expect)(page.locator('text=Password reset email sent')).toBeVisible();
        });
    });
    test_1.test.describe('Game Library Flow', () => {
        test_1.test.beforeEach(async ({ page }) => {
            // Login before each test
            await page.click('text=Sign In');
            await page.fill('[data-testid="email-input"]', 'e2e-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.click('[data-testid="login-button"]');
            await page.waitForSelector('[data-testid="user-menu"]');
        });
        (0, test_1.test)('should display game library', async ({ page }) => {
            // Navigate to library
            await page.click('[data-testid="library-nav"]');
            // Verify library page
            await (0, test_1.expect)(page.locator('h1:has-text("My Game Library")')).toBeVisible();
            await (0, test_1.expect)(page.locator('[data-testid="game-grid"]')).toBeVisible();
        });
        (0, test_1.test)('should add a game to library', async ({ page }) => {
            // Navigate to library
            await page.click('[data-testid="library-nav"]');
            // Click add game button
            await page.click('[data-testid="add-game-button"]');
            // Fill game details
            await page.fill('[data-testid="game-title-input"]', 'E2E Test Game');
            await page.selectOption('[data-testid="game-genre-select"]', 'action');
            await page.selectOption('[data-testid="game-platform-select"]', 'steam');
            await page.fill('[data-testid="game-cover-input"]', 'https://example.com/cover.jpg');
            await page.fill('[data-testid="game-description-input"]', 'A game for E2E testing');
            await page.fill('[data-testid="game-developer-input"]', 'E2E Developer');
            await page.fill('[data-testid="game-publisher-input"]', 'E2E Publisher');
            await page.fill('[data-testid="game-price-input"]', '29.99');
            // Submit game
            await page.click('[data-testid="save-game-button"]');
            // Verify game was added
            await (0, test_1.expect)(page.locator('text=E2E Test Game')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=Game added successfully')).toBeVisible();
        });
        (0, test_1.test)('should search games', async ({ page }) => {
            // Navigate to library
            await page.click('[data-testid="library-nav"]');
            // Use search
            await page.fill('[data-testid="search-input"]', 'action');
            // Verify search results
            await (0, test_1.expect)(page.locator('[data-testid="game-grid"]')).toBeVisible();
            const gameCards = page.locator('[data-testid="game-card"]');
            await (0, test_1.expect)(gameCards.first()).toBeVisible();
        });
        (0, test_1.test)('should filter games by platform', async ({ page }) => {
            // Navigate to library
            await page.click('[data-testid="library-nav"]');
            // Use platform filter
            await page.selectOption('[data-testid="platform-filter"]', 'steam');
            // Verify filtered results
            await (0, test_1.expect)(page.locator('[data-testid="game-grid"]')).toBeVisible();
        });
        (0, test_1.test)('should sort games', async ({ page }) => {
            // Navigate to library
            await page.click('[data-testid="library-nav"]');
            // Use sort
            await page.selectOption('[data-testid="sort-select"]', 'title');
            // Verify sorted results
            await (0, test_1.expect)(page.locator('[data-testid="game-grid"]')).toBeVisible();
        });
        (0, test_1.test)('should edit game details', async ({ page }) => {
            // Navigate to library
            await page.click('[data-testid="library-nav"]');
            // Find a game and click edit
            const gameCard = page.locator('[data-testid="game-card"]').first();
            await gameCard.hover();
            await gameCard.locator('[data-testid="edit-game-button"]').click();
            // Update game details
            await page.fill('[data-testid="game-title-input"]', 'Updated E2E Test Game');
            // Save changes
            await page.click('[data-testid="save-game-button"]');
            // Verify game was updated
            await (0, test_1.expect)(page.locator('text=Updated E2E Test Game')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=Game updated successfully')).toBeVisible();
        });
        (0, test_1.test)('should delete game from library', async ({ page }) => {
            // Navigate to library
            await page.click('[data-testid="library-nav"]');
            // Find a game and click delete
            const gameCard = page.locator('[data-testid="game-card"]').first();
            await gameCard.hover();
            await gameCard.locator('[data-testid="delete-game-button"]').click();
            // Confirm deletion
            await page.click('[data-testid="confirm-delete-button"]');
            // Verify game was deleted
            await (0, test_1.expect)(page.locator('text=Game deleted successfully')).toBeVisible();
        });
    });
    test_1.test.describe('Mood Engine Flow', () => {
        test_1.test.beforeEach(async ({ page }) => {
            // Login before each test
            await page.click('text=Sign In');
            await page.fill('[data-testid="email-input"]', 'e2e-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.click('[data-testid="login-button"]');
            await page.waitForSelector('[data-testid="user-menu"]');
        });
        (0, test_1.test)('should display mood selection', async ({ page }) => {
            // Navigate to mood engine
            await page.click('[data-testid="mood-nav"]');
            // Verify mood selection page
            await (0, test_1.expect)(page.locator('h1:has-text("How are you feeling?")')).toBeVisible();
            await (0, test_1.expect)(page.locator('[data-testid="mood-options"]')).toBeVisible();
        });
        (0, test_1.test)('should select mood and get recommendations', async ({ page }) => {
            // Navigate to mood engine
            await page.click('[data-testid="mood-nav"]');
            // Select competitive mood
            await page.click('[data-testid="mood-competitive"]');
            // Verify recommendations
            await (0, test_1.expect)(page.locator('text=Competitive Games')).toBeVisible();
            await (0, test_1.expect)(page.locator('[data-testid="recommendation-grid"]')).toBeVisible();
        });
        (0, test_1.test)('should show mood history', async ({ page }) => {
            // Navigate to mood engine
            await page.click('[data-testid="mood-nav"]');
            // Click mood history
            await page.click('[data-testid="mood-history-button"]');
            // Verify mood history
            await (0, test_1.expect)(page.locator('text=Mood History')).toBeVisible();
            await (0, test_1.expect)(page.locator('[data-testid="mood-timeline"]')).toBeVisible();
        });
        (0, test_1.test)('should update mood preferences', async ({ page }) => {
            // Navigate to mood engine
            await page.click('[data-testid="mood-nav"]');
            // Click settings
            await page.click('[data-testid="mood-settings-button"]');
            // Update preferences
            await page.check('[data-testid="prefer-competitive"]');
            await page.check('[data-testid="prefer-focused"]');
            // Save preferences
            await page.click('[data-testid="save-preferences-button"]');
            // Verify preferences saved
            await (0, test_1.expect)(page.locator('text=Mood preferences updated')).toBeVisible();
        });
    });
    test_1.test.describe('Integration Flow', () => {
        test_1.test.beforeEach(async ({ page }) => {
            // Login before each test
            await page.click('text=Sign In');
            await page.fill('[data-testid="email-input"]', 'e2e-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.click('[data-testid="login-button"]');
            await page.waitForSelector('[data-testid="user-menu"]');
        });
        (0, test_1.test)('should connect Steam integration', async ({ page }) => {
            // Navigate to integrations
            await page.click('[data-testid="integrations-nav"]');
            // Click connect Steam
            await page.click('[data-testid="connect-steam"]');
            // Verify Steam OAuth flow (mock for E2E)
            await (0, test_1.expect)(page.locator('text=Connect to Steam')).toBeVisible();
            await page.click('[data-testid="mock-steam-auth"]');
            // Verify successful connection
            await (0, test_1.expect)(page.locator('text=Steam connected successfully')).toBeVisible();
            await (0, test_1.expect)(page.locator('[data-testid="steam-status-connected"]')).toBeVisible();
        });
        (0, test_1.test)('should sync Steam library', async ({ page }) => {
            // Navigate to integrations
            await page.click('[data-testid="integrations-nav"]');
            // Click sync Steam library
            await page.click('[data-testid="sync-steam"]');
            // Verify sync process
            await (0, test_1.expect)(page.locator('text=Syncing Steam library...')).toBeVisible();
            // Wait for sync to complete
            await page.waitForSelector('text=Sync completed', { timeout: 10000 });
            // Verify games were imported
            await (0, test_1.expect)(page.locator('text=Steam games imported')).toBeVisible();
        });
        (0, test_1.test)('should disconnect integration', async ({ page }) => {
            // Navigate to integrations
            await page.click('[data-testid="integrations-nav"]');
            // Click disconnect Steam
            await page.click('[data-testid="disconnect-steam"]');
            // Confirm disconnection
            await page.click('[data-testid="confirm-disconnect"]');
            // Verify disconnection
            await (0, test_1.expect)(page.locator('text=Steam disconnected')).toBeVisible();
            await (0, test_1.expect)(page.locator('[data-testid="steam-status-disconnected"]')).toBeVisible();
        });
    });
    test_1.test.describe('User Profile Flow', () => {
        test_1.test.beforeEach(async ({ page }) => {
            // Login before each test
            await page.click('text=Sign In');
            await page.fill('[data-testid="email-input"]', 'e2e-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.click('[data-testid="login-button"]');
            await page.waitForSelector('[data-testid="user-menu"]');
        });
        (0, test_1.test)('should view and edit profile', async ({ page }) => {
            // Navigate to profile
            await page.click('[data-testid="user-menu"]');
            await page.click('text=Profile');
            // Verify profile page
            await (0, test_1.expect)(page.locator('h1:has-text("Profile")')).toBeVisible();
            await (0, test_1.expect)(page.locator('[data-testid="profile-form"]')).toBeVisible();
            // Edit profile
            await page.click('[data-testid="edit-profile-button"]');
            await page.fill('[data-testid="display-name-input"]', 'Updated E2E User');
            await page.fill('[data-testid="bio-input"]', 'Updated bio for E2E testing');
            // Save changes
            await page.click('[data-testid="save-profile-button"]');
            // Verify changes saved
            await (0, test_1.expect)(page.locator('text=Profile updated successfully')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=Updated E2E User')).toBeVisible();
        });
        (0, test_1.test)('should update preferences', async ({ page }) => {
            // Navigate to profile
            await page.click('[data-testid="user-menu"]');
            await page.click('text=Profile');
            // Click preferences tab
            await page.click('[data-testid="preferences-tab"]');
            // Update preferences
            await page.selectOption('[data-testid="theme-select"]', 'dark');
            await page.check('[data-testid="email-notifications"]');
            await page.uncheck('[data-testid="push-notifications"]');
            // Save preferences
            await page.click('[data-testid="save-preferences-button"]');
            // Verify preferences saved
            await (0, test_1.expect)(page.locator('text=Preferences updated successfully')).toBeVisible();
        });
        (0, test_1.test)('should update privacy settings', async ({ page }) => {
            // Navigate to profile
            await page.click('[data-testid="user-menu"]');
            await page.click('text=Profile');
            // Click privacy tab
            await page.click('[data-testid="privacy-tab"]');
            // Update privacy settings
            await page.selectOption('[data-testid="profile-visibility"]', 'friends');
            await page.uncheck('[data-testid="share-playtime"]');
            await page.check('[data-testid="share-achievements"]');
            // Save privacy settings
            await page.click('[data-testid="save-privacy-button"]');
            // Verify settings saved
            await (0, test_1.expect)(page.locator('text=Privacy settings updated successfully')).toBeVisible();
        });
    });
    test_1.test.describe('Logout Flow', () => {
        (0, test_1.test)('should logout successfully', async ({ page }) => {
            // Login first
            await page.click('text=Sign In');
            await page.fill('[data-testid="email-input"]', 'e2e-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.click('[data-testid="login-button"]');
            await page.waitForSelector('[data-testid="user-menu"]');
            // Logout
            await page.click('[data-testid="user-menu"]');
            await page.click('text=Logout');
            // Verify logout
            await (0, test_1.expect)(page.locator('text=Sign In')).toBeVisible();
            await (0, test_1.expect)(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
        });
    });
    test_1.test.describe('Responsive Design', () => {
        (0, test_1.test)('should work on mobile devices', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            // Navigate to app
            await page.goto('http://localhost:3000');
            // Verify mobile layout
            await (0, test_1.expect)(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
            await (0, test_1.expect)(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
            // Test mobile navigation
            await page.click('[data-testid="mobile-menu"]');
            await (0, test_1.expect)(page.locator('[data-testid="mobile-menu-items"]')).toBeVisible();
        });
        (0, test_1.test)('should work on tablet devices', async ({ page }) => {
            // Set tablet viewport
            await page.setViewportSize({ width: 768, height: 1024 });
            // Navigate to app
            await page.goto('http://localhost:3000');
            // Verify tablet layout
            await (0, test_1.expect)(page.locator('[data-testid="main-nav"]')).toBeVisible();
            await (0, test_1.expect)(page.locator('[data-testid="sidebar"]')).toBeVisible();
        });
        (0, test_1.test)('should work on desktop devices', async ({ page }) => {
            // Set desktop viewport
            await page.setViewportSize({ width: 1920, height: 1080 });
            // Navigate to app
            await page.goto('http://localhost:3000');
            // Verify desktop layout
            await (0, test_1.expect)(page.locator('[data-testid="main-nav"]')).toBeVisible();
            await (0, test_1.expect)(page.locator('[data-testid="sidebar"]')).toBeVisible();
            await (0, test_1.expect)(page.locator('[data-testid="content-area"]')).toBeVisible();
        });
    });
    test_1.test.describe('Error Handling', () => {
        (0, test_1.test)('should handle network errors gracefully', async ({ page }) => {
            // Simulate network error
            await page.route('**/api/**', (route) => route.abort('failed'));
            // Try to login
            await page.click('text=Sign In');
            await page.fill('[data-testid="email-input"]', 'e2e-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.click('[data-testid="login-button"]');
            // Verify error handling
            await (0, test_1.expect)(page.locator('text=Network error occurred')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=Please try again later')).toBeVisible();
        });
        (0, test_1.test)('should handle server errors gracefully', async ({ page }) => {
            // Simulate server error
            await page.route('**/api/**', (route) => route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Internal server error' })
            }));
            // Try to login
            await page.click('text=Sign In');
            await page.fill('[data-testid="email-input"]', 'e2e-test@example.com');
            await page.fill('[data-testid="password-input"]', 'TestPassword123!');
            await page.click('[data-testid="login-button"]');
            // Verify error handling
            await (0, test_1.expect)(page.locator('text=Server error occurred')).toBeVisible();
            await (0, test_1.expect)(page.locator('text=Please try again later')).toBeVisible();
        });
    });
});
