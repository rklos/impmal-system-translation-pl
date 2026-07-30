import type { Locator, Page } from '@playwright/test';
import type { FoundryTestConfig } from '../helpers/config';
import { FoundryJoinPage } from './join-page';
import { FoundrySetupPage } from './setup-page';

type RuntimeGame = {
  ready: boolean;
  world?: {
    id: string;
  };
  system?: {
    id: string;
  };
  modules?: Map<string, {
    active: boolean;
  }>;
  settings: {
    get(scope: string, key: string): unknown;
    set(scope: string, key: string, value: unknown): Promise<unknown>;
  };
};

export class FoundryGamePage {
  public readonly joinPage: FoundryJoinPage;

  public readonly setupPage: FoundrySetupPage;

  public constructor(public readonly page: Page) {
    this.joinPage = new FoundryJoinPage(page);
    this.setupPage = new FoundrySetupPage(page);
  }

  public readonly board = (): Locator => this.page.locator('#board');

  public async waitUntilReady(): Promise<void> {
    await this.page.waitForFunction(
      () => (window as unknown as { game?: RuntimeGame }).game?.ready === true,
      undefined,
      { timeout: 60_000 },
    );
  }

  public async open(config: FoundryTestConfig): Promise<void> {
    await this.page.goto('/game');
    await this.page.waitForLoadState('domcontentloaded');

    if (this.page.url().includes('/game')) {
      await this.waitUntilReady();
      return;
    }

    if (await this.joinPage.isVisible()) {
      await this.joinPage.joinAsGamemaster();
      await this.waitUntilReady();
      return;
    }

    if (this.page.url().includes('/setup')) {
      await this.setupPage.open();
      await this.setupPage.launchWorld(config.world.id);
    }

    if (this.page.url().includes('/game')) {
      await this.waitUntilReady();
      return;
    }

    await this.joinPage.joinAsGamemaster();
    await this.waitUntilReady();
  }

  public async configure(config: FoundryTestConfig) {
    const moduleIds = config.modules.map(({ id }) => id);

    await this.page.evaluate(async (ids) => {
      const game = (window as unknown as { game: RuntimeGame }).game;
      const current = game.settings.get(
        'core',
        'moduleConfiguration',
      ) as Record<string, boolean>;
      const next = { ...current };
      for (const id of ids) {
        next[id] = true;
      }
      await game.settings.set('core', 'moduleConfiguration', next);
    }, moduleIds);

    await this.page.reload();
    await this.waitUntilReady();

    const currentLanguage = await this.page.evaluate(() => (
      (window as unknown as {
        game: {
          i18n: {
            lang: string;
          };
        };
      }).game.i18n.lang
    ));

    if (currentLanguage !== config.world.language) {
      await this.page
        .evaluate(async (language) => {
          const game = (window as unknown as { game: RuntimeGame }).game;
          await game.settings.set('core', 'language', language);
        }, config.world.language)
        .catch(() => undefined);
      await this.page.reload();
      await this.waitUntilReady();
    }

    return this.readRuntime(moduleIds);
  }

  public async readRuntime(moduleIds: string[] = []) {
    return this.page.evaluate((ids) => {
      const game = (window as unknown as {
        game: RuntimeGame & {
          i18n: {
            lang: string;
          };
        };
      }).game;
      return {
        world: game.world?.id ?? null,
        system: game.system?.id ?? null,
        language: game.i18n.lang,
        activeModules: Object.fromEntries(
          ids.map((id) => [
            id,
            game.modules?.get(id)?.active ?? false,
          ]),
        ),
      };
    }, moduleIds);
  }
}
