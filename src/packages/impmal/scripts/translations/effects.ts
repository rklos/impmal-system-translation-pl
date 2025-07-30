/* eslint-disable no-new-func */
import { log } from '~/utils/log';

// TODO: remove when PR is merged: https://github.com/moo-man/ImpMal-FoundryVTT/pull/122
function translateVehicleActions() {
  IMPMAL.vehicleActions.crush.name = 'Rozwałka';
  IMPMAL.vehicleActions.emergencyLanding.name = 'Lądowanie awaryjne';
  IMPMAL.vehicleActions.evasiveManeuvers.name = 'Manewry unikowe';
  IMPMAL.vehicleActions.getInClose.name = 'Jazda na zderzaku';
  IMPMAL.vehicleActions.makeTheJump.name = 'Skok';
  IMPMAL.vehicleActions.ram.name = 'Taranowanie';
  IMPMAL.vehicleActions.takeTheWheel.name = 'Przejęcie sterowania';
  IMPMAL.vehicleActions.threadTheNeedle.name = 'Ciasny manewr';
}

function hackVehicleActionsExecutions() {
  if (IMPMAL.vehicleActions.ram.execute) {
    const functionString = IMPMAL.vehicleActions.ram.execute.toString();
    const patchedFunctionString = functionString
      .replace(' - Ram', ' - Taranowanie')
      .replace('Ram Damage', 'Obrażenia od taranowania');
    // reassign the function
    IMPMAL.vehicleActions.ram.execute = (new Function(`return ${patchedFunctionString}`))();
  }

  if (IMPMAL.vehicleActions.takeTheWheel.execute) {
    const functionString = IMPMAL.vehicleActions.takeTheWheel.execute.toString();
    const patchedFunctionString = functionString.replace(' - Take the Wheel', ' - Przejęcie sterowania');
    // reassign the function
    IMPMAL.vehicleActions.takeTheWheel.execute = (new Function(`return ${patchedFunctionString}`))();
  }
}

const VEHICLE_EFFECTS_TRANSLATIONS = {
  evasiveManeuvers: {
    name: 'Manewry unikowe',
    0: 'Test Pilota',
    1: 'Kara za manewry unikowe',
  },
};

function executeTranslation(type: 'vehicleActions', translations: Record<string, string | Record<number, string>>) {
  Object.entries(translations).forEach(([ key, values ]) => {
    try {
      if (typeof values !== 'object') {
        IMPMAL[type][key].effect!.system.scriptData![0].label = values;
        return;
      }

      Object.entries<string>(values).forEach(([ index, value ]) => {
        if (typeof index === 'number') {
          IMPMAL[type][key].effect!.system.scriptData![index as unknown as number].label = value;
        } else {
          IMPMAL[type][key].effect!.label = value;
          IMPMAL[type][key].effect!.name = value;
        }
      });
    } catch (error) {
      log(`Error translating ${type} ${key}: ${error}`);
    }
  });
}

export function translateEffects() {
  translateVehicleActions();
  executeTranslation('vehicleActions', VEHICLE_EFFECTS_TRANSLATIONS);
  hackVehicleActionsExecutions();
}
