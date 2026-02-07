import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Money Keeper E2E tests
 * 
 * Focused on:
 * - Business rule validation
 * - Cross-browser testing
 * - Clean, maintainable architecture
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: 4,

  reporter: 'html',

  use: {
    baseURL: process.env['BASE_URL'] || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: process.env['SKIP_SERVER'] ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env['CI'],
    cwd: '../frontend',
  },
});
