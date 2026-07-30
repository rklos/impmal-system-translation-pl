import { expect, test } from '../../fixtures';
import { CharacterSheetPage } from '../../pages/character-sheet-page';

test('shows character skills in the Polish order', async ({ foundryPage }) => {
  const characterSheet = new CharacterSheetPage(foundryPage);
  const character = await characterSheet.openDisposableCharacter();

  try {
    await characterSheet.selectTab(character.applicationId, 'skills');

    expect(
      await characterSheet.readSkillRows(character.applicationId),
    ).toEqual([
      { key: 'athletics', label: 'Atletyka' },
      { key: 'presence', label: 'Autorytet' },
      { key: 'dexterity', label: 'Finezja' },
      { key: 'fortitude', label: 'Hart' },
      { key: 'intuition', label: 'Intuicja' },
      { key: 'linguistics', label: 'Język' },
      { key: 'tech', label: 'Korzystanie z Technologii' },
      { key: 'stealth', label: 'Krycie się' },
      { key: 'logic', label: 'Logika' },
      { key: 'medicae', label: 'Medycyna' },
      { key: 'psychic', label: 'Mistrzostwo Psioniczne' },
      { key: 'navigation', label: 'Nawigacja' },
      { key: 'discipline', label: 'Opanowanie' },
      { key: 'rapport', label: 'Perswazja' },
      { key: 'piloting', label: 'Pilotaż' },
      { key: 'reflexes', label: 'Refleks' },
      { key: 'awareness', label: 'Spostrzegawczość' },
      { key: 'melee', label: 'Sztuki Walki' },
      { key: 'ranged', label: 'Walka Dystansowa' },
      { key: 'lore', label: 'Wiedza' },
    ]);
  } finally {
    await characterSheet.closeAndDelete(character.actorId);
  }
});
