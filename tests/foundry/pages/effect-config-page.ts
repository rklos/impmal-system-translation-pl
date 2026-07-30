import type { Locator, Page } from '@playwright/test';

type DisposableEffect = {
  actorId: string;
  applicationId: string;
  effectId: string;
};

export class EffectConfigPage {
  public constructor(public readonly page: Page) {}

  public readonly application = (applicationId: string): Locator => this.page
    .locator(`[id="${applicationId}"]`);

  public readonly tab = (
    applicationId: string,
    tabName: 'details' | 'scripts',
  ): Locator => this.application(applicationId)
    .locator(`[data-group="sheet"][data-tab="${tabName}"]`)
    .filter({ visible: true })
    .first();

  public readonly scriptTrigger = (applicationId: string): Locator => this
    .application(applicationId)
    .getByText('Oblicz Cechy', { exact: true });

  public readonly advancedConfigButton = (applicationId: string): Locator => this
    .application(applicationId)
    .locator('[data-action="advancedConfig"]');

  public readonly advancedApplication = (): Locator => this.page
    .locator('.advanced-effect.warhammer');

  public readonly zoneTraits = (): Locator => this.advancedApplication()
    .getByText('Cechy Strefy', { exact: true });

  public async openDisposableZoneEffect(): Promise<DisposableEffect> {
    const effect = await this.page.evaluate(async () => {
      const actorClass = (window as unknown as {
        Actor: {
          create(data: {
            name: string;
            type: string;
          }): Promise<{
            createEmbeddedDocuments(
              documentName: string,
              data: Array<Record<string, unknown>>,
            ): Promise<Array<{
              id: string;
              sheet: {
                id: string;
                render(options: { force: boolean }): unknown;
              };
            }>>;
            id: string;
          } | undefined>;
        };
      }).Actor;
      const actor = await actorClass.create({
        name: 'Polish effect translation test',
        type: 'character',
      });
      if (!actor) {
        throw new Error('Foundry did not create the effect test actor');
      }

      const [activeEffect] = await actor.createEmbeddedDocuments('ActiveEffect', [{
        name: 'Polish effect translation test',
        system: {
          scriptData: [{
            label: 'Polish script trigger test',
            script: '',
            trigger: 'computeCharacteristics',
          }],
          transferData: {
            type: 'zone',
            zone: {
              traits: {},
              type: 'zone',
            },
          },
        },
      }]);
      if (!activeEffect) {
        throw new Error('Foundry did not create the effect test document');
      }

      activeEffect.sheet.render({ force: true });
      return {
        actorId: actor.id,
        applicationId: activeEffect.sheet.id,
        effectId: activeEffect.id,
      };
    });

    await this.application(effect.applicationId).waitFor({ state: 'visible' });
    return effect;
  }

  public async selectScripts(applicationId: string): Promise<void> {
    await this.tab(applicationId, 'scripts').click();
  }

  public async openAdvancedConfig(applicationId: string): Promise<void> {
    await this.tab(applicationId, 'details').click();
    await this.advancedConfigButton(applicationId).click();
    await this.advancedApplication().waitFor({ state: 'visible' });
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
