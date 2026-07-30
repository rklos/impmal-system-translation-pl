import { expect, test } from '../../fixtures';

test('applies Polish vehicle-action overrides', async ({ foundryPage }) => {
  const vehicleActions = await foundryPage.evaluate(() => {
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
              ram: {
                execute?: () => unknown;
              };
              takeTheWheel: {
                execute?: () => unknown;
              };
            };
          };
        };
      };
    }).game.impmal.config.vehicleActions;

    return {
      evasiveManeuvers: {
        name: actions.evasiveManeuvers.effect.name,
        scriptLabels: actions.evasiveManeuvers.effect.system.scriptData.map(
          ({ label }) => label,
        ),
      },
      ram: actions.ram.execute?.toString() ?? '',
      takeTheWheel: actions.takeTheWheel.execute?.toString() ?? '',
    };
  });

  expect(vehicleActions.evasiveManeuvers).toEqual({
    name: 'Manewry unikowe',
    scriptLabels: [
      'Test Pilota',
      'Kara za manewry unikowe',
    ],
  });
  expect(vehicleActions.ram).toContain('Taranowanie');
  expect(vehicleActions.ram).toContain('Obrażenia od taranowania');
  expect(vehicleActions.takeTheWheel).toContain('Przejęcie sterowania');
});
