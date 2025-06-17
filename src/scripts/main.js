import { reorderSkills } from './character-sheet/reorder-skills.js';
import { reorderActions } from './character-sheet/reorder-actions.js';
import { useCustomLabels } from './use-custom-labels.js';
import { patchTemplates } from './patch-templates.js';
import '../styles/main.scss';

Hooks.on('init', async () => {
  // Without waiting at the beginning because we need to be faster than the system's init
  reorderSkills();
  reorderActions();
  useCustomLabels();
  patchTemplates();

  // If something needs to wait, we can do it here
  // await wait(250);
});
