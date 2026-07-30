import { expect, test } from '../../fixtures';
import { CharacterSheetPage } from '../../pages/character-sheet-page';

test('shows the translated add-effect option', async ({ foundryPage }) => {
  const characterSheet = new CharacterSheetPage(foundryPage);
  const character = await characterSheet.openDisposableCharacter();

  try {
    await characterSheet.selectTab(character.applicationId, 'effects');
    await expect(characterSheet.addEffectOption(character.applicationId))
      .toHaveText('Dodaj Efekt');
  } finally {
    await characterSheet.closeAndDelete(character.actorId);
  }
});
