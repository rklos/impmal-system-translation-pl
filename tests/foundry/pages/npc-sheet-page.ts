import type { Locator, Page } from '@playwright/test';

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
    const npc = await this.page.evaluate(async () => {
      const actorClass = (window as unknown as {
        Actor: {
          create(data: {
            name: string;
            type: string;
          }): Promise<{
            id: string;
            sheet: {
              id: string;
              render(force: boolean): unknown;
            };
          } | undefined>;
        };
      }).Actor;
      const actor = await actorClass.create({
        name: 'Polish NPC layout test',
        type: 'npc',
      });
      if (!actor) {
        throw new Error('Foundry did not create the NPC layout test actor');
      }

      actor.sheet.render(true);
      return {
        actorId: actor.id,
        applicationId: actor.sheet.id,
      };
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
