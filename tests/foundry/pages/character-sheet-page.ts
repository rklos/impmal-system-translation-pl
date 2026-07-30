import type { Locator, Page } from '@playwright/test';

type DisposableCharacter = {
  actorId: string;
  applicationId: string;
};

type CharacterItemData = {
  name: string;
  system?: Record<string, unknown>;
  type: string;
};

type CharacterTab = 'combat' | 'equipment' | 'powers' | 'skills';

type SkillRow = {
  key: string;
  label: string;
};

export class CharacterSheetPage {
  public constructor(public readonly page: Page) {}

  public readonly application = (applicationId: string): Locator => this.page
    .locator(`[id="${applicationId}"]`);

  public readonly tab = (
    applicationId: string,
    tabName: CharacterTab,
  ): Locator => this.application(applicationId)
    .locator(`[data-group="primary"][data-tab="${tabName}"]`)
    .filter({ visible: true })
    .first();

  public readonly emptySlot = (applicationId: string): Locator => this
    .application(applicationId)
    .getByText('Pusty', { exact: true });

  public readonly sustainedPowers = (applicationId: string): Locator => this
    .application(applicationId)
    .getByText('Podtrzymywane Moce', { exact: true });

  public readonly aimAction = (applicationId: string): Locator => this
    .application(applicationId)
    .getByRole('button', { name: 'Celowanie', exact: true });

  public readonly skillRows = (applicationId: string): Locator => this
    .application(applicationId)
    .locator('[data-group="primary"][data-tab="skills"] [data-key]');

  public async openDisposableCharacter(
    items: CharacterItemData[] = [],
  ): Promise<DisposableCharacter> {
    const character = await this.page.evaluate(async (itemData) => {
      const actorClass = (window as unknown as {
        Actor: {
          create(data: {
            name: string;
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
        name: 'Polish UI translation test',
        type: 'character',
      });
      if (!actor) {
        throw new Error('Foundry did not create the UI test actor');
      }

      if (itemData.length) {
        await actor.createEmbeddedDocuments('Item', itemData);
      }
      actor.sheet.render(true);

      return {
        actorId: actor.id,
        applicationId: actor.sheet.id,
      };
    }, items);

    await this.application(character.applicationId)
      .waitFor({ state: 'visible' });
    return character;
  }

  public async selectTab(
    applicationId: string,
    tabName: CharacterTab,
  ): Promise<void> {
    await this.tab(applicationId, tabName).click();
  }

  public async readSkillRows(applicationId: string): Promise<SkillRow[]> {
    return this.skillRows(applicationId).evaluateAll((rows) => rows.map((row) => ({
      key: (row as HTMLElement).dataset.key ?? '',
      label: row
        .querySelector('[data-action="rollTest"][data-type="skill"]')
        ?.textContent
        ?.trim() ?? '',
    })));
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
