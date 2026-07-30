import type { Locator, Page } from '@playwright/test';
import type { FoundryTestConfig } from '../helpers/config';
import { isRemotePackage } from '../helpers/config';

type SetupTab = 'worlds' | 'systems' | 'modules';

export class FoundrySetupPage {
  public constructor(public readonly page: Page) {}

  public readonly licenseActivation = (): Locator => this.page
    .getByRole('heading', { name: 'License Key Activation' })
    .or(this.page.getByPlaceholder('XXXX-XXXX-XXXX-XXXX-XXXX-XXXX'))
    .first();

  public readonly eula = (): Locator => this.page
    .locator('#eula-form, #license-title')
    .first();

  public readonly adminPassword = (): Locator => this.page
    .locator('input[name="adminPassword"], input#key')
    .first();

  public readonly returnToSetupButton = (): Locator => this.page
    .getByRole('button', { name: 'Return to Setup' });

  public readonly usageDialog = (): Locator => this.page
    .locator('dialog, .application')
    .filter({ hasText: /Usage Data|Sharing/i })
    .first();

  public readonly usageDeclineButton = (): Locator => this.usageDialog()
    .locator('button[data-action="no"], button:has-text("Decline")')
    .first();

  public readonly setupPackages = (): Locator => this.page
    .locator('#setup-packages');

  public readonly tabSection = (tabName: SetupTab): Locator => this.page
    .locator(`[data-application-part="${tabName}"]`);

  public readonly tab = (tabName: SetupTab): Locator => this.page
    .locator(
      `[data-tab="${tabName}"], [data-action="tab"][data-tab="${tabName}"]`,
    )
    .filter({ visible: true })
    .first();

  public readonly createWorldButton = (): Locator => this.page
    .locator('button[data-action="worldCreate"], button:has-text("Create World")')
    .filter({ visible: true })
    .first();

  public readonly worldConfigSection = (): Locator => this.page.locator(
    'section[data-application-part="config"]',
  );

  public readonly worldTitleInput = (): Locator => this.worldConfigSection()
    .locator('input[name="title"]');

  public readonly worldIdInput = (): Locator => this.worldConfigSection().locator(
    'input[name="world-id"], input[name="id"]',
  );

  public readonly systemGallery = (): Locator => this.page.locator(
    'section.systems[data-application-part="systems"]',
  );

  public readonly systemSearchInput = (): Locator => this.systemGallery()
    .locator('input[type="search"]');

  public readonly createWorldSubmitButton = (): Locator => this.page
    .locator('button[type="submit"].bright, button:has-text("Create World")')
    .filter({ visible: true })
    .first();

  public readonly savePlayersButton = (): Locator => this.page
    .locator(
      'button[type="submit"].bright, button:has-text("Save Configuration")',
    )
    .filter({ visible: true })
    .first();

  public readonly deleteWorldAction = (): Locator => this.page
    .locator('li.context-item')
    .filter({ hasText: /Delete World/i })
    .first();

  public readonly deleteWorldDialog = (): Locator => this.page
    .locator('dialog, .application')
    .filter({ hasText: /Delete World/i })
    .last();

  public readonly deleteConfirmationCode = (): Locator => this.deleteWorldDialog()
    .locator('.reference, .confirm-code')
    .first();

  public readonly deleteConfirmationInput = (): Locator => this.deleteWorldDialog()
    .locator(
      'input#delete-confirm, input[name="confirm"], input[name="world-id"]',
    )
    .first();

  public readonly deleteConfirmationButton = (): Locator => this.deleteWorldDialog()
    .locator('button[data-action="yes"], button:has-text("Yes"), button.bright')
    .first();

  public async open(): Promise<void> {
    await this.page.goto('/setup');
    await this.page.waitForLoadState('domcontentloaded');

    if (
      await this.licenseActivation()
        .isVisible({ timeout: 1_000 })
        .catch(() => false)
    ) {
      throw new Error(
        'Foundry VTT is not activated. Open http://localhost:30000, activate the licensed test instance, complete the EULA, then rerun npm run test:foundry:docker.',
      );
    }

    if (await this.eula().isVisible({ timeout: 1_000 }).catch(() => false)) {
      throw new Error(
        'Foundry VTT requires EULA confirmation. Open http://localhost:30000, complete the first-run screens, then rerun npm run test:foundry:docker.',
      );
    }

    if (
      await this.adminPassword()
        .isVisible({ timeout: 1_000 })
        .catch(() => false)
    ) {
      await this.authenticateAdministrator();
    }

    if (
      await this.usageDialog()
        .isVisible({ timeout: 1_000 })
        .catch(() => false)
    ) {
      await this.usageDeclineButton().click();
    }

    await this.setupPackages().waitFor({ state: 'visible', timeout: 30_000 });
  }

  public async readInstalledPackages(config: FoundryTestConfig) {
    const expectedModules = config.modules
      .filter(isRemotePackage)
      .map(({ id, version }) => ({ id, version }));

    return this.page.evaluate(
      ({ system, modules }) => {
        const foundryGame = (window as unknown as {
          game: {
            version: string;
            systems: Map<string, { version: string }>;
            modules: Map<string, { version: string }>;
          };
        }).game;

        return {
          foundry: foundryGame.version,
          system: foundryGame.systems.get(system.id)?.version ?? null,
          modules: Object.fromEntries(
            modules.map(({ id }) => [
              id,
              foundryGame.modules.get(id)?.version ?? null,
            ]),
          ),
        };
      },
      {
        system: {
          id: config.system.id,
        },
        modules: expectedModules,
      },
    );
  }

  public async switchTab(tabName: SetupTab): Promise<void> {
    const section = this.tabSection(tabName);
    if (
      await section
        .evaluate((element) => (
          element.classList.contains('active')
          && (element as HTMLElement).getClientRects().length > 0
        ))
        .catch(() => false)
    ) {
      return;
    }

    const tab = this.tab(tabName);
    await tab.waitFor({ state: 'visible', timeout: 20_000 });
    await tab.evaluate((element) => (element as HTMLElement).click());
    await section.waitFor({ state: 'visible', timeout: 15_000 });
  }

  public readonly worldCard = (worldId: string): Locator => this.page
    .locator(`[data-package-id="${worldId}"]`)
    .filter({ visible: true })
    .first();

  public readonly systemCard = (systemId: string): Locator => this.systemGallery()
    .locator(`[data-package-id="${systemId}"]`)
    .filter({ visible: true })
    .first();

  public async deleteWorld(worldId: string): Promise<void> {
    if (!worldId.endsWith('-test')) {
      throw new Error(`Refusing to delete non-test world: ${worldId}`);
    }

    await this.switchTab('worlds');
    const worldCard = this.worldCard(worldId);
    if (!(await worldCard.isVisible().catch(() => false))) {
      return;
    }

    const stopButton = worldCard.locator('[data-action="worldStop"]').first();
    if (await stopButton.isVisible().catch(() => false)) {
      await stopButton.evaluate((element) => (element as HTMLElement).click());
      await worldCard
        .locator('[data-action="worldLaunch"]')
        .waitFor({ state: 'visible', timeout: 15_000 });
    }

    await worldCard.dispatchEvent('contextmenu');
    await this.deleteWorldAction().waitFor({ state: 'visible' });
    await this.deleteWorldAction()
      .evaluate((element) => (element as HTMLElement).click());
    await this.deleteWorldDialog().waitFor({ state: 'visible' });

    const confirmationCode = await this.deleteConfirmationCode().innerText();
    await this.deleteConfirmationInput().fill(confirmationCode.trim());
    await this.deleteConfirmationButton()
      .evaluate((element) => (element as HTMLElement).click());
    await worldCard.waitFor({ state: 'hidden', timeout: 15_000 });
  }

  public async createWorld(config: FoundryTestConfig): Promise<void> {
    await this.switchTab('worlds');
    await this.createWorldButton()
      .evaluate((element) => (element as HTMLElement).click());
    await this.worldConfigSection()
      .waitFor({ state: 'visible', timeout: 15_000 });
    await this.worldTitleInput().fill(config.world.title);

    if (await this.worldIdInput().count()) {
      await this.worldIdInput().fill(config.world.id);
    }

    await this.systemSearchInput().fill(config.system.id);
    const systemCard = this.systemCard(config.system.id);
    await systemCard.waitFor({ state: 'visible' });
    await systemCard.evaluate((element) => (element as HTMLElement).click());
    await this.createWorldSubmitButton()
      .evaluate((element) => (element as HTMLElement).click());

    await this.page.waitForURL(
      (url) => (
        url.pathname.includes('/players')
        || url.pathname.includes('/setup')
      ),
      { timeout: 60_000 },
    );

    if (this.page.url().includes('/players')) {
      await this.savePlayersButton()
        .evaluate((element) => (element as HTMLElement).click());
      await this.page.waitForURL(/\/(game|setup)/, { timeout: 30_000 });
    }
  }

  public async launchWorld(worldId: string): Promise<void> {
    await this.switchTab('worlds');
    const worldCard = this.worldCard(worldId);
    await worldCard.waitFor({ state: 'visible', timeout: 15_000 });
    await worldCard
      .locator('[data-action="worldLaunch"]')
      .first()
      .evaluate((element) => (element as HTMLElement).click());
    await this.page.waitForURL(/\/(join|game|players)/, { timeout: 60_000 });
  }

  private async authenticateAdministrator(): Promise<void> {
    const password = process.env.FOUNDRY_ADMIN_PASSWORD ?? '';
    await this.adminPassword().fill(password);
    if (this.page.url().includes('/join')) {
      await this.returnToSetupButton().click();
    } else {
      await this.adminPassword().press('Enter');
    }

    try {
      await this.page.waitForURL(/\/setup/, { timeout: 10_000 });
    } catch (error) {
      if (!password) {
        throw new Error(
          'The Foundry test instance has an admin password. Set FOUNDRY_ADMIN_PASSWORD before running npm run test:foundry:docker, or remove the password from this isolated instance.',
        );
      }
      throw error;
    }
  }
}
