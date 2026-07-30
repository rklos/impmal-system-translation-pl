import { expect, test } from '../../fixtures';
import { AdvancementPage } from '../../pages/advancement-page';
import { CharacterSheetPage } from '../../pages/character-sheet-page';

test('shows translated advancement explanations', async ({ foundryPage }) => {
  const characterSheet = new CharacterSheetPage(foundryPage);
  const advancement = new AdvancementPage(foundryPage);
  const character = await characterSheet.openDisposableCharacter();

  try {
    await characterSheet.openAdvancement(character.actorId);
    await advancement.waitUntilOpen();

    await advancement.selectTab('items');
    await expect(advancement.itemExplanation()).toBeVisible();

    await advancement.selectTab('log');
    await expect(advancement.logExplanation()).toBeVisible();

    await advancement.selectTab('other');
    await expect(advancement.otherExplanation()).toBeVisible();
  } finally {
    if (await advancement.application().isVisible().catch(() => false)) {
      await advancement.close();
    }
    await characterSheet.closeAndDelete(character.actorId);
  }
});
