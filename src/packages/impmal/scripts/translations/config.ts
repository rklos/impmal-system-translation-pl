// TODO: remove when PR is merged: https://github.com/moo-man/ImpMal-FoundryVTT/pull/121
function translateVehicleTraits() {
  IMPMAL.vehicleCategory = {
    wheeled: 'Kołowy',
    tracked: 'Gąsienicowy',
    flyer: 'Latający',
    walker: 'Kroczący',
  };
}

function translateScriptTriggers() {
  IMPMAL.scriptTriggers.computeCharacteristics = 'Oblicz Cechy';
  IMPMAL.scriptTriggers.computeEncumbrance = 'Oblicz Obciążenie';
  IMPMAL.scriptTriggers.computeCombat = 'Oblicz Walkę';
  IMPMAL.scriptTriggers.computeWarpState = 'Oblicz stan Osnowy';
  IMPMAL.scriptTriggers.prepareOwnedItems = 'Przygotuj posiadane Przedmioty';
  IMPMAL.scriptTriggers.prepareOwnedData = 'Przygotuj sosiadane Dane';
}

export function translateConfig() {
  translateVehicleTraits();
  translateScriptTriggers();
}
