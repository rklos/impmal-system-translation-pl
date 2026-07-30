import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const baseURL = process.env.FOUNDRY_BASE_URL ?? 'http://127.0.0.1:30000';
const authFile = path.join(testDirectory, '.auth/gm.json');

export default defineConfig({
  testDir: testDirectory,
  outputDir: path.resolve(testDirectory, '../../test-results/foundry'),
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: {
    timeout: 15_000,
  },
  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: path.resolve(
          testDirectory,
          '../../playwright-report/foundry',
        ),
        open: 'never',
      },
    ],
  ],
  use: {
    baseURL,
    viewport: {
      width: 1440,
      height: 900,
    },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    launchOptions: {
      args: ['--use-gl=swiftshader'],
    },
  },
  projects: [
    {
      name: 'setup',
      testMatch: /setup\/.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      testMatch: /.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: {
          width: 1440,
          height: 900,
        },
        storageState: authFile,
      },
    },
  ],
});
