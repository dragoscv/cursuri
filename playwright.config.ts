import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Test Configuration
 *
 * Configuration for E2E testing with Playwright.
 * Tests run against local development server (localhost:33990).
 *
 * Key Features:
 * - Chromium, Firefox, and WebKit browsers
 * - Automatic retries for flaky tests
 * - HTML reporter for test results
 * - Screenshots and videos on failure
 * - Environment variables for admin credentials
 */

export default defineConfig({
  // Test directory
  testDir: './__tests__/e2e',

  // Timeout for each test (30 seconds)
  timeout: 30000,

  // Expect timeout (5 seconds for assertions)
  expect: {
    timeout: 5000,
  },

  // Test execution settings
  fullyParallel: true, // Run tests in parallel
  forbidOnly: !!process.env.CI, // Fail if test.only is used in CI
  retries: process.env.CI ? 2 : 1, // Retry failed tests in CI
  workers: process.env.CI ? 1 : undefined, // Limit workers in CI

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],

  // Shared settings for all projects
  use: {
    // Base URL for navigation
    baseURL: process.env.BASE_URL || 'http://localhost:33990',

    // Screenshots and videos
    trace: 'on-first-retry', // Capture trace on first retry
    screenshot: 'only-on-failure', // Screenshots only on failures
    video: 'retain-on-failure', // Videos only on failures

    // Browser context settings
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10000, // 10 seconds for actions
    navigationTimeout: 15000, // 15 seconds for navigation
  },

  // Projects for different browsers
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

    // Mobile viewports (optional, can be enabled for mobile testing)
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // Web server configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:33990',
    reuseExistingServer: !process.env.CI, // Reuse server in local development
    timeout: 120000, // 2 minutes to start server
    stdout: 'ignore',
    stderr: 'pipe',
  },

  // Global setup/teardown
  // globalSetup: require.resolve('./tests/global-setup.ts'),
  // globalTeardown: require.resolve('./tests/global-teardown.ts'),
});
