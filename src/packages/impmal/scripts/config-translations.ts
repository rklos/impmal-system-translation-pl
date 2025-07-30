// TODO: remove when PR is merged: https://github.com/moo-man/ImpMal-FoundryVTT/pull/121
function translateVehicleTraits() {
  IMPMAL.vehicleCategory = {
    wheeled: 'Kołowy',
    tracked: 'Gąsienicowy',
    flyer: 'Latający',
    walker: 'Kroczący',
  };
}

export function translateConfig() {
  translateVehicleTraits();
}
