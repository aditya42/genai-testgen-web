import { defineConfig } from '@playwright/test';
import { loadEnvironment } from './config/environment';

const environment = loadEnvironment();

export default defineConfig({
  testDir: './specs',
  testMatch: '**/*.spec.ts',
  timeout: environment.timeoutMs,
  retries: environment.retries,
  ...(environment.workers ? { workers: environment.workers } : {}),
  outputDir: 'test-results',
  use: {
    baseURL: environment.baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  reporter: [
    ['list'],
    ['json', { outputFile: 'reports/playwright-results.json' }],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
  ],
});
