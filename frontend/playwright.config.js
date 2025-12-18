import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run tests sequentially to avoid conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Run one test at a time
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run local dev servers before tests
  webServer: [
    {
      command: 'cd ../backend && PYTHONPATH=$(pwd) uvicorn app.main:app --port 8001',
      url: 'http://localhost:8001/docs',
      timeout: 120000,
      reuseExistingServer: true,
    },
    {
      command: 'npm start',
      url: 'http://localhost:3000',
      timeout: 120000,
      reuseExistingServer: true,
    },
  ],
});
