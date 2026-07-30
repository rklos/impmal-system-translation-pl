import type { Locator, Page } from '@playwright/test';

type AdvancementTab = 'items' | 'log' | 'other';

export class AdvancementPage {
  public constructor(public readonly page: Page) {}

  public readonly application = (): Locator => this.page.locator('.impmal.advancement');

  public readonly tab = (tabName: AdvancementTab): Locator => this.application()
    .locator(`[data-group="sheet"][data-tab="${tabName}"]`)
    .filter({ visible: true })
    .first();

  public readonly itemExplanation = (): Locator => this.application()
    .getByText(
      'Wszystkie posiadane Przedmioty, które mają powiązany Koszt XP',
      { exact: true },
    );

  public readonly logExplanation = (): Locator => this.application()
    .getByText(
      'Rejestr wszystkich zmian w sumie PD i powiązanych z nimi powodów.',
      { exact: true },
    );

  public readonly otherExplanation = (): Locator => this.application()
    .getByText('Różne modyfikacje ogólnej liczby wydanych XP', { exact: true });

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
