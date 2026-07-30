import { expect, test } from '../../fixtures';
import { loadImpmalPatchInventory } from '../../helpers/patch-inventory';

test('applies Polish script-trigger names', async ({ foundryPage }) => {
  const scriptTriggers = await foundryPage.evaluate(() => (
    (window as unknown as {
      game: {
        impmal: {
          config: {
            scriptTriggers: Record<string, string>;
          };
        };
      };
    }).game.impmal.config.scriptTriggers
  ));

  expect(scriptTriggers).toMatchObject({
    computeCharacteristics: 'Oblicz Cechy',
    computeEncumbrance: 'Oblicz Obciążenie',
    computeCombat: 'Oblicz Walkę',
    computeWarpState: 'Oblicz stan Osnowy',
    prepareOwnedItems: 'Przygotuj posiadane Przedmioty',
    prepareOwnedData: 'Przygotuj sosiadane Dane',
  });
});

test('compiles every patched effect script', async ({ foundryPage }) => {
  const { scriptIds } = loadImpmalPatchInventory();
  const invalidScripts = await foundryPage.evaluate((ids) => {
    const effectScripts = (window as unknown as {
      game: {
        impmal: {
          config: {
            effectScripts: Record<string, string>;
          };
        };
      };
    }).game.impmal.config.effectScripts;
    const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

    return ids.flatMap((id) => {
      try {
        new AsyncFunction('args', effectScripts[id]);
        return [];
      } catch (error) {
        return [{
          error: error instanceof Error ? error.message : String(error),
          id,
        }];
      }
    });
  }, scriptIds);

  expect(invalidScripts).toEqual([]);
});

test('executes the translated Unrestrained Power effect script', async ({
  foundryPage,
}) => {
  const tag = await foundryPage.evaluate(() => {
    const game = (window as unknown as {
      game: {
        impmal: {
          config: {
            effectScripts: Record<string, string>;
          };
        };
      };
    }).game;
    const args = {
      context: {
        tags: {} as Record<string, string>,
      },
    };
    const script = new Function(
      'args',
      game.impmal.config.effectScripts.nvng0pO8I3XGxIOj,
    );

    script(args);
    return args.context.tags.unrestrainedPower;
  });

  expect(tag).toBe('Niepohamowana Moc');
});
