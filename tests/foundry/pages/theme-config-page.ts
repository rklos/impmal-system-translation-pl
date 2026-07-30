import type { Locator, Page } from '@playwright/test';

export class ThemeConfigPage {
  public constructor(public readonly page: Page) {}

  public readonly application = (): Locator => this.page.locator('#theme-config');

  public readonly enabledLabel = (): Locator => this.application()
    .getByText('Włączone', { exact: true });

  public readonly fontLabel = (): Locator => this.application()
    .getByText('Czcionka', { exact: true });

  public readonly effectScanLabel = (): Locator => this.application()
    .getByText('Skan Efektów', { exact: true });

  public async open(): Promise<void> {
    await this.page.evaluate(() => {
      const game = (window as unknown as {
        game: {
          settings: {
            menus: Map<string, {
              type: new () => {
                render(force: boolean): unknown;
              };
            }>;
          };
        };
      }).game;
      const menu = game.settings.menus.get('impmal.themeConfig');
      if (!menu) {
        throw new Error('ImpMal theme configuration menu is not registered');
      }

      new menu.type().render(true);
    });
    await this.application().waitFor({ state: 'visible' });
  }

  public async close(): Promise<void> {
    const closeButton = this.application().locator('[data-action="close"]');
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
    }
  }
}
