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
    await expect(advancement.explanation('items')).toHaveText(
      'Wszystkie posiadane Przedmioty, które mają powiązany Koszt XP',
    );

    await advancement.selectTab('log');
    await expect(advancement.explanation('log')).toHaveText(
      'Rejestr wszystkich zmian w sumie PD i powiązanych z nimi powodów.',
    );

    await advancement.selectTab('other');
    await expect(advancement.explanation('other')).toHaveText(
      'Różne modyfikacje ogólnej liczby wydanych XP',
    );
  } finally {
    if (await advancement.application().isVisible().catch(() => false)) {
      await advancement.close();
    }
    await characterSheet.closeAndDelete(character.actorId);
  }
});
