import { expect, test } from '../../fixtures';
import { NpcSheetPage } from '../../pages/npc-sheet-page';

test('uses compact speed text on the NPC sheet', async ({ foundryPage }) => {
  const npcSheet = new NpcSheetPage(foundryPage);
  const npc = await npcSheet.openDisposableNpc();

  try {
    await expect(npcSheet.speedField(npc.applicationId))
      .toHaveCSS('font-size', '12px');
  } finally {
    await npcSheet.closeAndDelete(npc.actorId);
  }
});
