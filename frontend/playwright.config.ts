import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';

const hasStorageState = fs.existsSync('storageState.json');

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'https://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: true,
    storageState: hasStorageState ? 'storageState.json' : undefined,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      use: { storageState: { cookies: [], origins: [] } },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: hasStorageState ? 'storageState.json' : undefined },
      dependencies: hasStorageState ? [] : ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: hasStorageState ? 'storageState.json' : undefined },
      dependencies: hasStorageState ? [] : ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], storageState: hasStorageState ? 'storageState.json' : undefined },
      dependencies: hasStorageState ? [] : ['setup'],
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'https://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
    env: {
      HTTPS: 'true',
    },
    ignoreHTTPSErrors: true,
  },
});