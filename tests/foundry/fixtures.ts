import {
  expect,
  test as base,
  type Page,
} from '@playwright/test';
import { loadFoundryTestConfig } from './helpers/config';
import { FoundryGamePage } from './pages/game-page';

type FoundryFixtures = {
  foundryPage: Page;
};

const MODULE_ERROR_MARKERS = [
  '/modules/impmal-system-translation-pl/',
  'impmal-pl.js',
];

export const test = base.extend<FoundryFixtures>({
  foundryPage: async ({ page }, use, testInfo) => {
    const config = loadFoundryTestConfig();
    const browserErrors: string[] = [];

    page.on('pageerror', (error) => {
      browserErrors.push(`pageerror: ${error.stack ?? error.message}`);
    });
    page.on('console', (message) => {
      if (message.type() === 'error') {
        const location = message.location();
        const source = location.url
          ? ` (${location.url}:${location.lineNumber}:${location.columnNumber})`
          : '';
        browserErrors.push(`console.error: ${message.text()}${source}`);
      }
    });

    const gamePage = new FoundryGamePage(page);
    await gamePage.open(config);
    await use(page);

    if (browserErrors.length) {
      await testInfo.attach('browser-errors.txt', {
        body: browserErrors.join('\n\n'),
        contentType: 'text/plain',
      });
    }

    if (testInfo.status === testInfo.expectedStatus) {
      const moduleBrowserErrors = browserErrors.filter((error) => (
        MODULE_ERROR_MARKERS.some((marker) => error.includes(marker))
      ));
      expect(
        moduleBrowserErrors,
        'unexpected Polish translation module browser errors',
      ).toEqual([]);
    }
  },
});

export { expect } from '@playwright/test';
