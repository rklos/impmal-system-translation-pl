import { test, expect } from './fixtures';
import {
  isRemotePackage,
  loadFoundryTestConfig,
  loadLocalModuleVersion,
} from './helpers/config';

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

test('registers the translated influence partial under its named alias', async ({
  foundryPage,
}) => {
  const templateAlias = 'actorInfluence';
  const expectedText = 'Dodaj Źródło';
  const context = {
    factions: {
      test: {
        name: 'Test',
        total: 0,
        hidden: false,
        patron: false,
        notes: '',
        items: [],
        effects: [],
        sources: [],
      },
    },
    factionsExpanded: {},
    path: 'system.influence',
    showNotes: false,
    showVisibility: false,
    isCharacter: false,
  };

  await foundryPage.waitForFunction(
    ({ partialName, partialContext, text }) => {
      const handlebars = (window as unknown as {
        Handlebars: {
          compile(template: string): (context: unknown) => string;
          partials: Record<
            string,
            string | ((context: unknown) => string)
          >;
        };
      }).Handlebars;
      const partial = handlebars.partials[partialName];
      if (!partial) {
        return false;
      }
      const render = typeof partial === 'function'
        ? partial
        : handlebars.compile(partial);
      return render(partialContext).includes(text);
    },
    {
      partialName: templateAlias,
      partialContext: context,
      text: expectedText,
    },
    { timeout: 15_000 },
  );

  const renderedAlias = await foundryPage.evaluate(
    ({ partialName, partialContext }) => {
      const handlebars = (window as unknown as {
        Handlebars: {
          compile(template: string): (context: unknown) => string;
          partials: Record<
            string,
            string | ((context: unknown) => string)
          >;
        };
      }).Handlebars;
      const partial = handlebars.partials[partialName];
      if (!partial) {
        return '';
      }
      const render = typeof partial === 'function'
        ? partial
        : handlebars.compile(partial);
      return render(partialContext);
    },
    {
      partialName: templateAlias,
      partialContext: context,
    },
  );

  expect(renderedAlias).toContain(expectedText);
  expect(renderedAlias).not.toContain('Add Source');
});

test('loads the translated Unrestrained Power effect script', async ({
  foundryPage,
}) => {
  const script = await foundryPage.evaluate(() => {
    const game = (window as unknown as {
      game: {
        impmal: {
          config: {
            effectScripts: Record<string, string>;
          };
        };
      };
    }).game;

    return game.impmal.config.effectScripts.nvng0pO8I3XGxIOj;
  });

  expect(script).toContain('Niepohamowana Moc');
  expect(script).not.toContain('Unrestrained Power');
});
