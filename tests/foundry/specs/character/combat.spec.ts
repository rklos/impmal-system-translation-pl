import { expect, test } from '../../fixtures';
import { CharacterSheetPage } from '../../pages/character-sheet-page';

test('applies Polish combat configuration', async ({ foundryPage }) => {
  const combat = await foundryPage.evaluate(() => {
    const game = (window as unknown as {
      game: {
        i18n: {
          localize(key: string): string;
        };
        impmal: {
          config: {
            actions: Record<string, unknown>;
            meleeTypes: Record<string, string>;
          };
        };
      };
    }).game;

    return {
      actions: Object.keys(game.impmal.config.actions).slice(0, 14),
      powerWeapon: game.i18n.localize(
        game.impmal.config.meleeTypes.power,
      ),
    };
  });

  expect(combat.actions).toEqual([
    'run',
    'aim',
    'flee',
    'cover',
    'shove',
    'disengage',
    'grapple',
    'help',
    'defend',
    'seize',
    'search',
    'charge',
    'hide',
    'dodge',
  ]);
  expect(combat.powerWeapon).toBe('Energetyczna');
});

test('shows the translated Aim action on the character sheet', async ({
  foundryPage,
}) => {
  const characterSheet = new CharacterSheetPage(foundryPage);
  const character = await characterSheet.openDisposableCharacter();

  try {
    await characterSheet.selectTab(character.applicationId, 'combat');
    await expect(
      characterSheet.aimAction(character.applicationId),
    ).toBeVisible();
  } finally {
    await characterSheet.closeAndDelete(character.actorId);
  }
});
