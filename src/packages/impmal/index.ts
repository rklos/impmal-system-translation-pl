import module from '~/module.json';
import { applyPatches } from '~/utils/apply-patches';
import { reorderSkills } from './scripts/character-sheet/reorder-skills';
import { reorderActions } from './scripts/character-sheet/reorder-actions';

export const PACKAGE = 'impmal';
export const REPO = 'moo-man/ImpMal-FoundryVTT';
export const SUPPORTED_VERSION = module.relationships.systems[0].compatibility.verified;

export function init() {
  reorderSkills();
  reorderActions();
  applyPatches(PACKAGE);
}
