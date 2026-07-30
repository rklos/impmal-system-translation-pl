import { expect, test } from '../../fixtures';
import { CharacterGenerationPage } from '../../pages/character-generation-page';

test('shows the translated base character-generation warning', async ({
  foundryPage,
}) => {
  const characterGeneration = new CharacterGenerationPage(foundryPage);

  try {
    await characterGeneration.open();
    await expect(characterGeneration.appV2Warning()).toBeVisible();
  } finally {
    if (await characterGeneration.application().isVisible().catch(() => false)) {
      await characterGeneration.close();
    }
  }
});
