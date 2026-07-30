import {
  expect,
  test as base,
  type Page,
} from '@playwright/test';
import {
  BrowserErrorMonitor,
  isModuleBrowserFailure,
} from './helpers/browser-errors';
import { loadFoundryTestConfig } from './helpers/config';
import { FoundryGamePage } from './pages/game-page';

type FoundryFixtures = {
  browserErrorMonitor: void;
  foundryPage: Page;
};

export const test = base.extend<FoundryFixtures>({
  browserErrorMonitor: [async ({ page }, use, testInfo) => {
    const monitor = new BrowserErrorMonitor(page);

    await use();

    const diagnostics = await monitor.complete();
    if (diagnostics.length) {
      await testInfo.attach('browser-errors.json', {
        body: JSON.stringify(diagnostics, null, 2),
        contentType: 'application/json',
      });
    }

    if (testInfo.status === testInfo.expectedStatus) {
      const moduleFailures = diagnostics.filter(isModuleBrowserFailure);
      expect(
        moduleFailures,
        'unexpected Polish translation module browser errors',
      ).toEqual([]);
    }
  }, { auto: true }],
  foundryPage: async ({ page }, use) => {
    const config = loadFoundryTestConfig();

    const gamePage = new FoundryGamePage(page);
    await gamePage.open(config);
    await use(page);
  },
});

export { expect } from '@playwright/test';
