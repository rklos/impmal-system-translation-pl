import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
import {
  BrowserErrorMonitor,
  isModuleBrowserFailure,
} from '../helpers/browser-errors';
import {
  isRemotePackage,
  loadFoundryTestConfig,
} from '../helpers/config';
import { createSeedEntities } from '../helpers/seed-entities';
import { FoundryGamePage } from '../pages/game-page';
import { FoundrySetupPage } from '../pages/setup-page';
import { logFoundry } from './logging';

export async function prepareFoundryWorld(baseURL: string): Promise<void> {
  const config = loadFoundryTestConfig();
  const authFile = path.resolve(process.cwd(), 'tests/foundry/.auth/gm.json');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    baseURL,
    viewport: {
      width: 1440,
      height: 900,
    },
  });
  const page = await context.newPage();
  const monitor = new BrowserErrorMonitor(page);

  try {
    const setupPage = new FoundrySetupPage(page);
    const gamePage = new FoundryGamePage(page);

    logFoundry('Opening Foundry Setup and handling first-run prompts.');
    await setupPage.open();
    logFoundry('Verifying installed Foundry, system, and module versions.');
    const installed = await setupPage.readInstalledPackages(config);
    assert.equal(installed.foundry, config.foundry.version);
    assert.equal(installed.system, config.system.version);
    for (const moduleConfig of config.modules.filter(isRemotePackage)) {
      assert.equal(installed.modules[moduleConfig.id], moduleConfig.version);
    }

    logFoundry(`Recreating the disposable world ${config.world.id}.`);
    await setupPage.deleteWorld(config.world.id);
    await setupPage.createWorld(config);
    await gamePage.open(config);
    logFoundry('Activating required modules and selecting Polish.');
    const runtime = await gamePage.configure(config);
    assert.equal(runtime.world, config.world.id);
    assert.equal(runtime.system, config.system.id);
    assert.equal(runtime.language, config.world.language);
    for (const moduleConfig of config.modules) {
      assert.equal(runtime.activeModules[moduleConfig.id], true);
    }

    logFoundry('Creating deterministic domain seed entities.');
    await createSeedEntities(page);
    await mkdir(path.dirname(authFile), { recursive: true });
    await context.storageState({ path: authFile });

    const moduleFailures = (await monitor.complete())
      .filter(isModuleBrowserFailure);
    assert.deepEqual(
      moduleFailures,
      [],
      `Unexpected Polish translation module browser errors:\n${
        JSON.stringify(moduleFailures, null, 2)
      }`,
    );
    logFoundry('Foundry world is ready for Playwright.', 'success');
  } finally {
    await context.close();
    await browser.close();
  }
}
