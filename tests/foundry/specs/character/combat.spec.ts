import { expect, test } from '../../fixtures';
import { CharacterSheetPage } from '../../pages/character-sheet-page';

test('uses the distinct Polish power-weapon label', async ({ foundryPage }) => {
  const powerWeapon = await foundryPage.evaluate(() => {
    const game = (window as unknown as {
      game: {
        i18n: {
          localize(key: string): string;
        };
        impmal: {
          config: {
            meleeTypes: Record<string, string>;
          };
        };
      };
    }).game;

    return game.i18n.localize(game.impmal.config.meleeTypes.power);
  });

  expect(powerWeapon).toBe('Energetyczna');
});

test('shows combat actions in the Polish order', async ({
  foundryPage,
}) => {
  const characterSheet = new CharacterSheetPage(foundryPage);
  const character = await characterSheet.openDisposableCharacter();

  try {
    await characterSheet.selectTab(character.applicationId, 'combat');
    await expect(characterSheet.actionButtons(character.applicationId)).toHaveCount(14);
    expect(await characterSheet.readActionRows(character.applicationId)).toEqual([
      { key: 'run', label: 'Bieg' },
      { key: 'aim', label: 'Celowanie' },
      { key: 'flee', label: 'Chodu!' },
      { key: 'cover', label: 'Korzystanie z osłony' },
      { key: 'shove', label: 'Odepchnięcie' },
      { key: 'disengage', label: 'Oderwanie' },
      { key: 'grapple', label: 'Pochwycenie' },
      { key: 'help', label: 'Pomoc' },
      { key: 'defend', label: 'Postawa obronna' },
      { key: 'seize', label: 'Przejęcie Inicjatywy' },
      { key: 'search', label: 'Przeszukiwanie' },
      { key: 'charge', label: 'Szarża' },
      { key: 'hide', label: 'Ukrycie się' },
      { key: 'dodge', label: 'Unik' },
    ]);
  } finally {
    await characterSheet.closeAndDelete(character.actorId);
  }
});

test('shows translated destroyed protection and compact speed text', async ({
  foundryPage,
}) => {
  const characterSheet = new CharacterSheetPage(foundryPage);
  const character = await characterSheet.openDisposableCharacter([{
    name: 'Destroyed base profile armour',
    system: {
      armour: 2,
      destroyed: {
        body: true,
      },
      equipped: {
        value: true,
      },
      locations: {
        label: 'Body',
        list: ['body'],
      },
    },
    type: 'protection',
  }]);

  try {
    await characterSheet.selectTab(character.applicationId, 'combat');
    await characterSheet.expandProtectionLocation(character.applicationId, 'body');
    await expect(characterSheet.destroyedProtection(character.applicationId))
      .toBeVisible();
    await expect(characterSheet.combatSpeedField(character.applicationId))
      .toHaveCSS('font-size', '12px');
    await expect(characterSheet.combatSpeedField(character.applicationId))
      .toHaveCSS('line-height', '12px');
  } finally {
    await characterSheet.closeAndDelete(character.actorId);
  }
});
