import type { Locator, Page } from '@playwright/test';
import {
  cloneSeedActor,
  SEED_ENTITY_IDS,
} from '../helpers/seed-entities';

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
    .locator('.script-list .script[data-index="0"] > label')
    .nth(1);

  public readonly advancedConfigButton = (applicationId: string): Locator => this
    .application(applicationId)
    .locator('[data-action="advancedConfig"]');

  public readonly advancedApplication = (): Locator => this.page
    .locator('.advanced-effect.warhammer');

  public readonly zoneTraits = (): Locator => this.advancedApplication()
    .locator('[data-action="zoneConfig"]');

  public async openDisposableZoneEffect(): Promise<DisposableEffect> {
    const actor = await cloneSeedActor(this.page, {
      name: 'Polish effect translation test',
      render: false,
      seedId: SEED_ENTITY_IDS.effects,
    });
    const effect = await this.page.evaluate(async (actorId) => {
      const game = (window as unknown as {
        game: {
          actors: Map<string, {
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
          }>;
        };
      }).game;
      const effectActor = game.actors.get(actorId);
      if (!effectActor) {
        throw new Error('Foundry did not retain the effect test actor');
      }
      const [activeEffect] = await effectActor.createEmbeddedDocuments('ActiveEffect', [{
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
        actorId,
        applicationId: activeEffect.sheet.id,
        effectId: activeEffect.id,
      };
    }, actor.actorId);

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
