import type { Locator, Page } from '@playwright/test';
import {
  cloneSeedActor,
  SEED_ENTITY_IDS,
} from '../helpers/seed-entities';

type DisposablePatron = {
  actorId: string;
  applicationId: string;
};

export class PatronSheetPage {
  public constructor(public readonly page: Page) {}

  public readonly application = (applicationId: string): Locator => this.page
    .locator(`[id="${applicationId}"]`);

  public readonly hiddenLiability = (applicationId: string): Locator => this
    .application(applicationId)
    .locator('.list-row[data-item-id] [data-action="toggleProperty"]')
    .filter({ has: this.page.locator('.fa-eye-slash') });

  public readonly visibleLiability = (applicationId: string): Locator => this
    .application(applicationId)
    .locator('.list-row[data-item-id] [data-action="toggleProperty"]')
    .filter({ has: this.page.locator('.fa-eye') });

  public readonly factionVisibility = (
    applicationId: string,
    factionKey: string,
  ): Locator => this
    .application(applicationId)
    .locator(`.influence .list-row[data-key="${factionKey}"]`)
    .locator('[data-action="toggleFactionVisibility"]');

  public readonly faction = (
    applicationId: string,
    factionKey: string,
  ): Locator => this.application(applicationId)
    .locator(`.influence .list-row[data-key="${factionKey}"]`)
    .locator('[data-action="expandFaction"]');

  public readonly addSource = (
    applicationId: string,
    factionKey: string,
  ): Locator => this.application(applicationId)
    .locator(`.influence .list-row[data-key="${factionKey}"]`)
    .locator('button[data-action="createSource"]');

  public async openDisposablePatron(): Promise<DisposablePatron> {
    const patron = await cloneSeedActor(this.page, {
      name: 'Polish patron translation test',
      seedId: SEED_ENTITY_IDS.patron,
    });

    await this.application(patron.applicationId).waitFor({ state: 'visible' });
    return patron;
  }

  public async expandFaction(
    applicationId: string,
    factionKey: string,
  ): Promise<void> {
    await this.faction(applicationId, factionKey).click();
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
