import { expect, test } from '../../fixtures';
import {
  isRemotePackage,
  loadFoundryTestConfig,
  loadLocalModuleVersion,
} from '../../helpers/config';

test('installs and activates the Polish translation module', async ({
  foundryPage,
}) => {
  const config = loadFoundryTestConfig();
  const localModuleConfig = config.modules.find(
    (moduleConfig) => !isRemotePackage(moduleConfig),
  );
  if (!localModuleConfig) {
    throw new Error('Foundry test configuration has no local module');
  }

  const installedModule = await foundryPage.evaluate((moduleId) => {
    const game = (window as unknown as {
      game: {
        modules: Map<string, {
          active: boolean;
          version: string;
        }>;
      };
    }).game;

    const module = game.modules.get(moduleId);
    return module
      ? {
        active: module.active,
        version: module.version,
      }
      : null;
  }, localModuleConfig.id);

  expect(installedModule).toEqual({
    active: true,
    version: loadLocalModuleVersion(),
  });
});

test('resolves ImpMal localization through the Polish module', async ({
  foundryPage,
}) => {
  const aim = await foundryPage.evaluate(() => {
    const game = (window as unknown as {
      game: {
        i18n: {
          localize(key: string): string;
        };
      };
    }).game;

    return game.i18n.localize('IMPMAL.Aim');
  });

  expect(aim).toBe('Celowanie');
});
