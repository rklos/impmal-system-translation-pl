import type { Locator, Page } from '@playwright/test';

type DisposableItem = {
  applicationId: string;
  itemId: string;
};

export class ItemSheetPage {
  public constructor(public readonly page: Page) {}

  public readonly application = (applicationId: string): Locator => this.page
    .locator(`[id="${applicationId}"]`);

  public readonly detailsTab = (applicationId: string): Locator => this
    .application(applicationId)
    .locator('[data-group="primary"][data-tab="details"]')
    .filter({ visible: true })
    .first();

  public readonly emptySlot = (applicationId: string): Locator => this
    .application(applicationId)
    .getByText('Pusty', { exact: true });

  public readonly editTraits = (applicationId: string): Locator => this
    .application(applicationId)
    .locator('[data-action="editTraits"]');

  public readonly traitsApplication = (): Locator => this.page
    .locator('.impmal.item-traits');

  public readonly traitLabel = (): Locator => this.traitsApplication().locator('label');

  public readonly traitValueInput = (): Locator => this.traitsApplication()
    .locator('input[type="text"]');

  public async openDisposableProtection(): Promise<DisposableItem> {
    const item = await this.page.evaluate(async () => {
      const itemClass = (window as unknown as {
        Item: {
          create(data: {
            name: string;
            system: Record<string, unknown>;
            type: string;
          }): Promise<{
            id: string;
            sheet: {
              id: string;
              render(force: boolean): unknown;
            };
          } | undefined>;
        };
      }).Item;
      const document = await itemClass.create({
        name: 'Polish item translation test',
        system: {
          armour: 1,
          slots: {
            list: [{ id: null }],
            value: 1,
          },
        },
        type: 'protection',
      });
      if (!document) {
        throw new Error('Foundry did not create the item sheet test document');
      }

      document.sheet.render(true);
      return {
        applicationId: document.sheet.id,
        itemId: document.id,
      };
    });

    await this.application(item.applicationId).waitFor({ state: 'visible' });
    await this.detailsTab(item.applicationId).click();
    return item;
  }

  public async openTraits(applicationId: string): Promise<void> {
    await this.editTraits(applicationId).click();
    await this.traitsApplication().waitFor({ state: 'visible' });
  }

  public async closeAndDelete(itemId: string): Promise<void> {
    await this.page.evaluate(async (id) => {
      const game = (window as unknown as {
        game: {
          items: Map<string, {
            delete(): Promise<unknown>;
            sheet: {
              close(): Promise<unknown>;
            };
          }>;
        };
      }).game;
      const item = game.items.get(id);
      if (!item) return;

      await item.sheet.close();
      await item.delete();
    }, itemId);
  }
}
