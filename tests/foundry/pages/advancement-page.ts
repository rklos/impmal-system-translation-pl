import type { Locator, Page } from '@playwright/test';

type AdvancementTab = 'items' | 'log' | 'other';

export class AdvancementPage {
  public constructor(public readonly page: Page) {}

  public readonly application = (): Locator => this.page.locator('.impmal.advancement');

  public readonly tab = (tabName: AdvancementTab): Locator => this.application()
    .locator(`[data-group="sheet"][data-tab="${tabName}"]`)
    .filter({ visible: true })
    .first();

  public readonly explanation = (tabName: AdvancementTab): Locator => this
    .application()
    .locator(`section[data-group="sheet"][data-tab="${tabName}"]`)
    .locator('.advancement-list > p')
    .first();

  public async waitUntilOpen(): Promise<void> {
    await this.application().waitFor({ state: 'visible' });
  }

  public async selectTab(tabName: AdvancementTab): Promise<void> {
    await this.tab(tabName).click();
  }

  public async close(): Promise<void> {
    await this.application().locator('[data-action="close"]').click();
  }
}
