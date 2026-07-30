import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test as setup } from '../fixtures';
import { isRemotePackage, loadFoundryTestConfig } from '../helpers/config';
import { FoundryGamePage } from '../pages/game-page';
import { FoundrySetupPage } from '../pages/setup-page';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.resolve(testDirectory, '../.auth/gm.json');

setup('create and configure the disposable ImpMal world', async ({ page }) => {
  setup.setTimeout(180_000);
  const config = loadFoundryTestConfig();
  const setupPage = new FoundrySetupPage(page);
  const gamePage = new FoundryGamePage(page);

  await setupPage.open();
  const installed = await setupPage.readInstalledPackages(config);
  expect(installed.foundry).toBe(config.foundry.version);
  expect(installed.system).toBe(config.system.version);
  for (const moduleConfig of config.modules.filter(isRemotePackage)) {
    expect(installed.modules[moduleConfig.id]).toBe(moduleConfig.version);
  }

  await setupPage.deleteWorld(config.world.id);
  await setupPage.createWorld(config);
  await gamePage.open(config);
  const runtime = await gamePage.configure(config);
  expect(runtime.world).toBe(config.world.id);
  expect(runtime.system).toBe(config.system.id);
  expect(runtime.language).toBe(config.world.language);
  for (const moduleConfig of config.modules) {
    expect(runtime.activeModules[moduleConfig.id]).toBe(true);
  }

  await mkdir(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
