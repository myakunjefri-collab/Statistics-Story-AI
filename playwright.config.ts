import { defineConfig, devices } from 'playwright/test'

/**
 * Playwright Multi-Browser Configuration
 * NFR07 Desktop Browser Verification:
 * - Google Chrome (Chromium engine with chrome channel / installed binary)
 * - Microsoft Edge (Chromium engine with msedge channel / installed binary)
 * - Mozilla Firefox (Gecko engine / installed binary)
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'docs/cross-browser-results.json' }]],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3099',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 800 },
  },
  projects: [
    {
      name: 'Google Chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
    {
      name: 'Microsoft Edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
      },
    },
    {
      name: 'Mozilla Firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
  ],
  webServer: {
    command: 'node ./node_modules/next/dist/bin/next start -p 3099',
    url: 'http://localhost:3099',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
})
