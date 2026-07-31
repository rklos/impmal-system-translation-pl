import type { Locator, Page } from '@playwright/test';
import {
  cloneSeedActor,
  SEED_ENTITY_IDS,
} from '../helpers/seed-entities';

type DisposableNpc = {
  actorId: string;
  applicationId: string;
};

export class NpcSheetPage {
  public constructor(public readonly page: Page) {}

  public readonly application = (applicationId: string): Locator => this.page
    .locator(`[id="${applicationId}"]`);

  public readonly speedField = (applicationId: string): Locator => this
    .application(applicationId)
    .locator(
      '.npc-header .attribute-row:last-child '
      + '.attribute-box:nth-child(2) .field',
    );

  public async openDisposableNpc(): Promise<DisposableNpc> {
    const npc = await cloneSeedActor(this.page, {
      name: 'Polish NPC layout test',
      seedId: SEED_ENTITY_IDS.npc,
    });

    await this.application(npc.applicationId).waitFor({ state: 'visible' });
    return npc;
  }

  public async closeAndDelete(actorId: string): Promise<void> {
    await this.page.evaluate(async (id) => {
      const game = (window as unknown as {
        game: {
          actors: Map<string, {
            delete(): Promise<unknown>;
            sheet: {
              close(): Promise<unknown>;
            };
          }>;
        };
      }).game;
      const actor = game.actors.get(id);
      if (!actor) return;

      await actor.sheet.close();
      await actor.delete();
    }, actorId);
  }
}
