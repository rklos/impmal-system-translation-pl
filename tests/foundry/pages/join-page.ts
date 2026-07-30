import type { Locator, Page } from '@playwright/test';

type RuntimeUser = {
  id: string;
  role: number;
};

export class FoundryJoinPage {
  public constructor(public readonly page: Page) {}

  public readonly userSelect = (): Locator => this.page
    .locator('[name="userid"]')
    .first();

  public readonly joinButton = (): Locator => this.page
    .locator('button[name="join"]');

  public readonly board = (): Locator => this.page.locator('#board');

  public async isVisible(): Promise<boolean> {
    return this.userSelect().isVisible().catch(() => false);
  }

  public async joinAsGamemaster(): Promise<void> {
    await this.userSelect().waitFor({ state: 'visible', timeout: 30_000 });

    const gamemasterId = await this.page.evaluate(() => {
      const game = (window as unknown as {
        game?: {
          users?: {
            values(): IterableIterator<RuntimeUser>;
          };
        };
      }).game;
      return Array.from(game?.users?.values() ?? [])
        .find((user) => user.role >= 4)?.id ?? null;
    });

    if (!gamemasterId) {
      throw new Error('The disposable Foundry world has no Gamemaster user');
    }

    await this.userSelect().selectOption(gamemasterId);
    await this.joinButton().click();
    await this.board().waitFor({ state: 'visible', timeout: 60_000 });
  }
}
