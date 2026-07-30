import type { Locator, Page } from '@playwright/test';

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
    .locator(
      '.list-row[data-item-id] [data-tooltip="Niewidoczne dla Graczy"]',
    );

  public readonly visibleLiability = (applicationId: string): Locator => this
    .application(applicationId)
    .locator(
      '.list-row[data-item-id] [data-tooltip="Widoczne dla Graczy"]',
    );

  public readonly hiddenFaction = (applicationId: string): Locator => this
    .application(applicationId)
    .locator('.influence [data-tooltip="Niewidoczne dla Graczy"]');

  public readonly visibleFaction = (applicationId: string): Locator => this
    .application(applicationId)
    .locator('.influence [data-tooltip="Widoczne dla Graczy"]');

  public readonly faction = (
    applicationId: string,
    factionName: string,
  ): Locator => this.application(applicationId)
    .locator('.influence [data-action="expandFaction"]')
    .getByText(factionName, { exact: true });

  public readonly addSource = (
    applicationId: string,
    factionKey: string,
  ): Locator => this.application(applicationId)
    .locator(`.influence .list-row[data-key="${factionKey}"]`)
    .getByRole('button', { name: 'Dodaj Źródło', exact: true });

  public async openDisposablePatron(): Promise<DisposablePatron> {
    const patron = await this.page.evaluate(async () => {
      const actorClass = (window as unknown as {
        Actor: {
          create(data: {
            name: string;
            system: Record<string, unknown>;
            type: string;
          }): Promise<{
            createEmbeddedDocuments(
              documentName: string,
              data: Array<Record<string, unknown>>,
            ): Promise<unknown>;
            id: string;
            sheet: {
              id: string;
              render(force: boolean): unknown;
            };
          } | undefined>;
        };
      }).Actor;
      const actor = await actorClass.create({
        name: 'Polish patron translation test',
        system: {
          influence: {
            factions: {
              hidden: {
                hidden: true,
                name: 'Ukryta frakcja',
                notes: '',
                sources: [],
              },
              visible: {
                hidden: false,
                name: 'Widoczna frakcja',
                notes: '',
                sources: [],
              },
            },
          },
        },
        type: 'patron',
      });
      if (!actor) {
        throw new Error('Foundry did not create the patron test actor');
      }

      await actor.createEmbeddedDocuments('Item', [
        {
          name: 'Hidden liability',
          system: {
            category: 'liability',
            visible: false,
          },
          type: 'boonLiability',
        },
        {
          name: 'Visible liability',
          system: {
            category: 'liability',
            visible: true,
          },
          type: 'boonLiability',
        },
      ]);
      actor.sheet.render(true);
      return {
        actorId: actor.id,
        applicationId: actor.sheet.id,
      };
    });

    await this.application(patron.applicationId).waitFor({ state: 'visible' });
    return patron;
  }

  public async expandFaction(
    applicationId: string,
    factionName: string,
  ): Promise<void> {
    await this.faction(applicationId, factionName).click();
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
