import { expect, test } from '../../fixtures';

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
