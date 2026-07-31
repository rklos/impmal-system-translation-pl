import type { Page } from '@playwright/test';

export const SEED_ENTITY_IDS = {
  character: 'tplCharacter0001',
  effects: 'tplEffectActor01',
  npc: 'tplNpcActor00001',
  patron: 'tplPatronAct0001',
  protection: 'tplProtectIt0001',
} as const;

type EmbeddedItemData = {
  name: string;
  system?: Record<string, unknown>;
  type: string;
};

type DisposableActor = {
  actorId: string;
  applicationId: string;
};

type DisposableItem = {
  applicationId: string;
  itemId: string;
};

export async function createSeedEntities(page: Page): Promise<void> {
  await page.evaluate(async (ids) => {
    type CreatedActor = {
      createEmbeddedDocuments(
        documentName: string,
        data: Array<Record<string, unknown>>,
      ): Promise<unknown>;
    };
    type DocumentClass = {
      create(
        data: Record<string, unknown>,
        options: { keepId: boolean },
      ): Promise<CreatedActor | undefined>;
    };
    const foundryWindow = window as unknown as {
      Actor: DocumentClass;
      Item: DocumentClass;
    };

    const actorSeeds = [
      {
        _id: ids.character,
        name: 'Character test seed',
        type: 'character',
      },
      {
        _id: ids.effects,
        name: 'Effects test seed',
        type: 'character',
      },
      {
        _id: ids.npc,
        name: 'NPC test seed',
        type: 'npc',
      },
      {
        _id: ids.patron,
        name: 'Patron test seed',
        system: {
          influence: {
            factions: {
              hidden: {
                hidden: true,
                name: 'Ukryta frakcja',
                notes: '',
                sources: [],
              },
              visible: {
                hidden: false,
                name: 'Widoczna frakcja',
                notes: '',
                sources: [],
              },
            },
          },
        },
        type: 'patron',
      },
    ];

    for (const actorSeed of actorSeeds) {
      const actor = await foundryWindow.Actor.create(actorSeed, { keepId: true });
      if (!actor) {
        throw new Error(`Foundry did not create seed actor ${actorSeed._id}`);
      }

      if (actorSeed._id === ids.patron) {
        await actor.createEmbeddedDocuments('Item', [
          {
            name: 'Hidden liability',
            system: {
              category: 'liability',
              visible: false,
            },
            type: 'boonLiability',
          },
          {
            name: 'Visible liability',
            system: {
              category: 'liability',
              visible: true,
            },
            type: 'boonLiability',
          },
        ]);
      }
    }

    const protection = await foundryWindow.Item.create({
      _id: ids.protection,
      name: 'Protection test seed',
      system: {
        armour: 1,
        slots: {
          list: [{ id: null }],
          value: 1,
        },
      },
      type: 'protection',
    }, { keepId: true });
    if (!protection) {
      throw new Error(`Foundry did not create seed item ${ids.protection}`);
    }
  }, SEED_ENTITY_IDS);
}

export async function cloneSeedActor(
  page: Page,
  {
    items = [],
    name,
    render = true,
    seedId,
  }: {
    items?: EmbeddedItemData[];
    name: string;
    render?: boolean;
    seedId: string;
  },
): Promise<DisposableActor> {
  return page.evaluate(async ({
    itemData,
    renderSheet,
    seedActorId,
    testActorName,
  }) => {
    type ActorDocument = {
      clone(
        data: { name: string },
        options: { save: true },
      ): Promise<ActorDocument>;
      createEmbeddedDocuments(
        documentName: string,
        data: Array<Record<string, unknown>>,
      ): Promise<unknown>;
      id: string;
      sheet: {
        id: string;
        render(force: boolean): unknown;
      };
    };
    const game = (window as unknown as {
      game: {
        actors: Map<string, ActorDocument>;
      };
    }).game;
    const seed = game.actors.get(seedActorId);
    if (!seed) {
      throw new Error(`Foundry seed actor is missing: ${seedActorId}`);
    }

    const actor = await seed.clone({ name: testActorName }, { save: true });
    if (itemData.length) {
      await actor.createEmbeddedDocuments('Item', itemData);
    }
    if (renderSheet) {
      actor.sheet.render(true);
    }

    return {
      actorId: actor.id,
      applicationId: actor.sheet.id,
    };
  }, {
    itemData: items,
    renderSheet: render,
    seedActorId: seedId,
    testActorName: name,
  });
}

export async function cloneSeedItem(
  page: Page,
  {
    name,
    seedId,
  }: {
    name: string;
    seedId: string;
  },
): Promise<DisposableItem> {
  return page.evaluate(async ({ seedItemId, testItemName }) => {
    type ItemDocument = {
      clone(
        data: { name: string },
        options: { save: true },
      ): Promise<ItemDocument>;
      id: string;
      sheet: {
        id: string;
        render(force: boolean): unknown;
      };
    };
    const game = (window as unknown as {
      game: {
        items: Map<string, ItemDocument>;
      };
    }).game;
    const seed = game.items.get(seedItemId);
    if (!seed) {
      throw new Error(`Foundry seed item is missing: ${seedItemId}`);
    }

    const item = await seed.clone({ name: testItemName }, { save: true });
    item.sheet.render(true);

    return {
      applicationId: item.sheet.id,
      itemId: item.id,
    };
  }, {
    seedItemId: seedId,
    testItemName: name,
  });
}
