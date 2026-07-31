import { expect, test } from '../../fixtures';
import { CharacterSheetPage } from '../../pages/character-sheet-page';

test('shows the translated sustained powers heading', async ({
  foundryPage,
}) => {
  const characterSheet = new CharacterSheetPage(foundryPage);
  const character = await characterSheet.openDisposableCharacter([
    {
      name: 'UI test power',
      type: 'power',
    },
  ]);

  try {
    await characterSheet.selectTab(character.applicationId, 'powers');
    await expect(
      characterSheet.sustainedPowers(character.applicationId),
    ).toHaveText('Podtrzymywane Moce');
  } finally {
    await characterSheet.closeAndDelete(character.actorId);
  }
});
