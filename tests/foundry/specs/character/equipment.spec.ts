import { expect, test } from '../../fixtures';
import { CharacterSheetPage } from '../../pages/character-sheet-page';

test('shows the translated empty equipment slot', async ({ foundryPage }) => {
  const characterSheet = new CharacterSheetPage(foundryPage);
  const character = await characterSheet.openDisposableCharacter([
    {
      name: 'UI test equipment',
      type: 'equipment',
      system: {
        slots: {
          list: [{ id: null }],
          value: 1,
        },
      },
    },
  ]);

  try {
    await characterSheet.selectTab(character.applicationId, 'equipment');
    await expect(
      characterSheet.emptySlot(character.applicationId),
    ).toHaveText('Pusty');
  } finally {
    await characterSheet.closeAndDelete(character.actorId);
  }
});
