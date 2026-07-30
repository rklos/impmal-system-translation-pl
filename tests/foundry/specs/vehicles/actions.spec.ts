import { expect, test } from '../../fixtures';
import { ChatPage } from '../../pages/chat-page';

test('applies Polish labels to evasive maneuvers', async ({ foundryPage }) => {
  const evasiveManeuvers = await foundryPage.evaluate(() => {
    const actions = (window as unknown as {
      game: {
        impmal: {
          config: {
            vehicleActions: {
              evasiveManeuvers: {
                effect: {
                  name: string;
                  system: {
                    scriptData: Array<{
                      label: string;
                    }>;
                  };
                };
              };
            };
          };
        };
      };
    }).game.impmal.config.vehicleActions;

    return {
      name: actions.evasiveManeuvers.effect.name,
      scriptLabels: actions.evasiveManeuvers.effect.system.scriptData.map(
        ({ label }) => label,
      ),
    };
  });

  expect(evasiveManeuvers).toEqual({
    name: 'Manewry unikowe',
    scriptLabels: [
      'Test Pilota',
      'Kara za manewry unikowe',
    ],
  });
});

test('uses Polish text when ramming a vehicle', async ({ foundryPage }) => {
  const chat = new ChatPage(foundryPage);
  const appendTitle = await foundryPage.evaluate(async () => {
    const actions = (window as unknown as {
      game: {
        impmal: {
          config: {
            vehicleActions: {
              ram: {
                execute(vehicle: unknown): Promise<void>;
              };
            };
          };
        };
      };
    }).game.impmal.config.vehicleActions;
    let title = '';
    const vehicle = {
      name: 'Base profile vehicle',
      system: {
        combat: {
          size: 'small',
        },
        driver: {
          setupSkillTest: async (
            _test: unknown,
            options: { appendTitle: string },
          ) => {
            title = options.appendTitle;
            return {
              result: {
                SL: 0,
              },
            };
          },
        },
      },
    };

    await actions.ram.execute(vehicle);
    return title;
  });

  expect(appendTitle).toBe(' - Taranowanie');
  await expect(chat.ramDamage()).toBeVisible();
});

test('uses Polish text when taking the wheel', async ({ foundryPage }) => {
  const result = await foundryPage.evaluate(async () => {
    const actions = (window as unknown as {
      game: {
        impmal: {
          config: {
            vehicleActions: {
              takeTheWheel: {
                execute(vehicle: unknown): Promise<void>;
              };
            };
          };
        };
      };
    }).game.impmal.config.vehicleActions;
    let appendTitle = '';
    let assignedDriver = '';
    const passenger = {
      setupSkillTest: async (
        _test: unknown,
        options: { appendTitle: string },
      ) => {
        appendTitle = options.appendTitle;
        return {
          succeeded: true,
        };
      },
      uuid: 'Actor.base-profile-driver',
    };
    const vehicle = {
      system: {
        assignDriver: (uuid: string) => {
          assignedDriver = uuid;
        },
        choose: async () => passenger,
      },
    };

    await actions.takeTheWheel.execute(vehicle);
    return {
      appendTitle,
      assignedDriver,
    };
  });

  expect(result).toEqual({
    appendTitle: ' - Przejęcie sterowania',
    assignedDriver: 'Actor.base-profile-driver',
  });
});
