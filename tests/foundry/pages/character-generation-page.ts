import type { Locator, Page } from '@playwright/test';

export class CharacterGenerationPage {
  public constructor(public readonly page: Page) {}

  public readonly actorDirectoryTab = (): Locator => this.page
    .locator('#sidebar-tabs [data-tab="actors"]');

  public readonly launchButton = (): Locator => this.page
    .locator('#actors .character-creation');

  public readonly application = (): Locator => this.page.locator('#chargen');

  public readonly appV2Warning = (): Locator => this.application().getByText(
    'Tworzenie Postaci nie zostało jeszcze zaktualizowane do AppV2, '
      + 'możesz napotykać problemy z wyświetlaniem!',
    { exact: true },
  );

  public async open(): Promise<void> {
    await this.actorDirectoryTab().click();
    await this.launchButton().click();
    await this.application().waitFor({ state: 'visible' });
  }

  public async close(): Promise<void> {
    await this.application().locator('.header-button.close').click();
  }
}
