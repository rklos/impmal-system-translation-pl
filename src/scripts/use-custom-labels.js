// Sometimes Polish translation differentiates some words and phrases which are written in the same way in English.
// This script applies custom labels to the system to make the translation more accurate.

// All of the custom labels are stored in the custom.json file.

export function useCustomLabels() {
  // Polish translation differentiates between "power" and "energy" weapons.
  IMPMAL.meleeTypes.power = 'IMPMAL.PowerWeapon';
}