import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    testMatch: '**/*.e2e.{ts,js}',
    use: {
        headless: true,
        viewport: { width: 1280, height: 720 },
        baseURL: 'http://localhost:3002',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'tablet-safari',
            use: { ...devices['iPad Pro'] },
        },
    ],
    retries: 1,
    reporter: [
        ['list'],
        ['html'],
    ],
    timeout: 30000,
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3002',
        reuseExistingServer: !process.env.CI,
    },
});
