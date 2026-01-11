import chalk from 'chalk';
import type { Package } from '~/packages';
import * as diff from 'diff';
import { loadPatches } from '../../../../.vite/load-patches';
import type { Changes } from '../types';
import { EXT_HBS, PATH_STATIC } from '../../../utils/consts';

const PATCHES = loadPatches();

export default async function checkTemplates(pkg: Package, changes: Changes) {
  const TEMPLATES_PATCHES = PATCHES[pkg.PACKAGE] || {};

  const templateChanges = changes.changedFiles
    .filter((file) => file.filename.endsWith(EXT_HBS))
    .filter((file) => TEMPLATES_PATCHES[file.filename.replace(`${PATH_STATIC}/`, '')]);

  let conflicts = 0;
  templateChanges.forEach((file) => {
    const patches = TEMPLATES_PATCHES[file.filename.replace(`${PATH_STATIC}/`, '')];
    patches.forEach((patch) => {
      const patchedContent = diff.applyPatch(file.content, patch, { fuzzFactor: 10 });
      if (!patchedContent) {
        console.log(chalk.red(`  ✗ Failed to apply patch: ${file.filename}`));
        conflicts++;
      }
    });
  });

  if (templateChanges.length > 0) {
    console.log(chalk.cyan('\n📄 Modified templates:'));
    templateChanges.forEach((file) => {
      let status = 'D';
      let emoji = '🗑️';
      if (file.status === 'modified') { status = 'M'; emoji = '✏️'; }
      if (file.status === 'renamed') { status = 'R'; emoji = '🔄'; }
      if (file.status === 'added') { status = 'A'; emoji = '➕'; }
      console.log(chalk.yellow(`  ${emoji} ${status} ${file.filename}`));
    });
  } else {
    console.log(chalk.green('✓ No template changes found'));
  }

  if (conflicts > 0) {
    console.log(chalk.red(`\n⚠ ${conflicts} conflict(s) were found`));
  } else {
    console.log(chalk.green('✓ No template conflicts found'));
  }

  return templateChanges.length > 0;
}
