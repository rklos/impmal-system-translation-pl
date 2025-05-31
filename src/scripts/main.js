import { reorderSkills } from './reorder-skills.js';
import { reorderActions } from './reorder-actions.js';

Hooks.on('init', async () => {
  // Without waiting at the beginning because we need to be faster than the system's init
  reorderSkills();
  reorderActions();

  // If something needs to wait, we can do it here
  // await wait(250);
});
