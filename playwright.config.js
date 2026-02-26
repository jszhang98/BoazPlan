import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  use: {
    headless: true,
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry'
  }
  // Remove webServer section; start frontend+API manually with `npm run dev`
});
