import chalk from 'chalk';
import type { Package } from '~/packages';
import * as diff from 'diff';
import { loadPatches } from '../../../.vite/load-patches';
import type { Changes } from '../types';

const PATCHES = loadPatches();

export async function checkTemplates(pkg: Package, changes: Changes) {
  const TEMPLATES_PATCHES = PATCHES[pkg.PACKAGE];

  const templateChanges = changes.changedFiles
    .filter((file) => file.filename.endsWith('.hbs'))
    .filter((file) => TEMPLATES_PATCHES[file.filename.replace('static/', '')]);

  let conflicts = 0;
  templateChanges.forEach((file) => {
    const patches = TEMPLATES_PATCHES[file.filename.replace('static/', '')];
    patches.forEach((patch) => {
      const patchedContent = diff.applyPatch(file.content, patch);
      if (!patchedContent) {
        console.log(chalk.red(`Failed to apply patch: ${file.filename}`));
        conflicts++;
      }
    });
  });

  if (templateChanges.length > 0) {
    console.log(chalk.yellow('\nModified templates:'));
    templateChanges.forEach((file) => {
      let status = 'D';
      if (file.status === 'modified') status = 'M';
      if (file.status === 'renamed') status = 'R';
      if (file.status === 'added') status = 'A';
      console.log(chalk.yellow(`${status} ${file.filename}`));
    });
  } else {
    console.log(chalk.green('No template changes found'));
  }

  if (conflicts > 0) {
    console.log(chalk.red(`${conflicts} conflicts were found`));
  } else {
    console.log(chalk.green('No template conflicts found'));
  }

  return templateChanges.length > 0;
}
