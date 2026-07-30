import { expect, test } from '../../fixtures';
import { loadImpmalPatchInventory } from '../../helpers/patch-inventory';

test('registers every tracked template and script patch', async ({
  foundryPage,
}) => {
  const inventory = loadImpmalPatchInventory();
  const registration = await foundryPage.evaluate((expected) => {
    const handlebars = (window as unknown as {
      Handlebars: {
        partials: Record<string, unknown>;
      };
    }).Handlebars;
    const game = (window as unknown as {
      game: {
        impmal: {
          config: {
            effectScripts: Record<string, string>;
          };
        };
      };
    }).game;

    return {
      missingAliases: [
        'actorInfluence',
        'actorSlots',
        'slotsDisplay',
      ].filter((alias) => !handlebars.partials[alias]),
      missingScripts: expected.scriptIds.filter(
        (id) => !game.impmal.config.effectScripts[id],
      ),
      missingTemplates: expected.templatePaths.filter(
        (templatePath) => !handlebars.partials[templatePath],
      ),
    };
  }, inventory);

  expect(registration).toEqual({
    missingAliases: [],
    missingScripts: [],
    missingTemplates: [],
  });
});

test('renders the translated influence partial through its named alias', async ({
  foundryPage,
}) => {
  const templateAlias = 'actorInfluence';
  const expectedText = 'Dodaj Źródło';
  const context = {
    factions: {
      test: {
        name: 'Test',
        total: 0,
        hidden: false,
        patron: false,
        notes: '',
        items: [],
        effects: [],
        sources: [],
      },
    },
    factionsExpanded: {},
    path: 'system.influence',
    showNotes: false,
    showVisibility: false,
    isCharacter: false,
  };

  await foundryPage.waitForFunction(
    ({ partialName, partialContext, text }) => {
      const handlebars = (window as unknown as {
        Handlebars: {
          compile(template: string): (context: unknown) => string;
          partials: Record<
            string,
            string | ((context: unknown) => string)
          >;
        };
      }).Handlebars;
      const partial = handlebars.partials[partialName];
      if (!partial) {
        return false;
      }
      const render = typeof partial === 'function'
        ? partial
        : handlebars.compile(partial);
      return render(partialContext).includes(text);
    },
    {
      partialName: templateAlias,
      partialContext: context,
      text: expectedText,
    },
    { timeout: 15_000 },
  );

  const renderedAlias = await foundryPage.evaluate(
    ({ partialName, partialContext }) => {
      const handlebars = (window as unknown as {
        Handlebars: {
          compile(template: string): (context: unknown) => string;
          partials: Record<
            string,
            string | ((context: unknown) => string)
          >;
        };
      }).Handlebars;
      const partial = handlebars.partials[partialName];
      if (!partial) {
        return '';
      }
      const render = typeof partial === 'function'
        ? partial
        : handlebars.compile(partial);
      return render(partialContext);
    },
    {
      partialName: templateAlias,
      partialContext: context,
    },
  );

  expect(renderedAlias).toContain(expectedText);
  expect(renderedAlias).not.toContain('Add Source');
});
