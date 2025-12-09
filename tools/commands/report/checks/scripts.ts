import chalk from 'chalk';
import type { Package } from '~/packages';
import * as diff from 'diff';
import { loadPatches } from '../../../../.vite/load-patches';
import type { Changes } from '../types';
import { hasStringLiteralInContent } from '../../../utils/has-string-literal';
import { PATH_STATIC_SCRIPTS, PATH_STATIC, EXT_JS } from '../../../utils/consts';

const PATCHES = loadPatches();

export default async function checkScripts(pkg: Package, changes: Changes) {
  const SCRIPTS_PATCHES = PATCHES[pkg.PACKAGE] || {};

  const scriptChanges = changes.changedFiles
    .filter((file) => file.filename.startsWith(`${PATH_STATIC_SCRIPTS}/`) && file.filename.endsWith(EXT_JS))
    .filter((file) => hasStringLiteralInContent(file.content, file.filename));

  let conflicts = 0;
  const scriptsWithPatches: string[] = [];
  const scriptsWithoutPatches: string[] = [];

  scriptChanges.forEach((file) => {
    const normalizedFilename = file.filename.replace(`${PATH_STATIC}/`, '');
    const patches = SCRIPTS_PATCHES[normalizedFilename];

    if (patches) {
      scriptsWithPatches.push(file.filename);
      patches.forEach((patch) => {
        const patchedContent = diff.applyPatch(file.content, patch, { fuzzFactor: 10 });
        if (!patchedContent) {
          console.log(chalk.red(`  ✗ Failed to apply patch: ${file.filename}`));
          conflicts++;
        }
      });
    } else {
      scriptsWithoutPatches.push(file.filename);
    }
  });

  if (scriptChanges.length > 0) {
    console.log(chalk.cyan('\n📜 Modified scripts:'));
    scriptChanges.forEach((file) => {
      let status = 'D';
      let emoji = '🗑️';
      if (file.status === 'modified') { status = 'M'; emoji = '✏️'; }
      if (file.status === 'renamed') { status = 'R'; emoji = '🔄'; }
      if (file.status === 'added') { status = 'A'; emoji = '➕'; }

      const normalizedFilename = file.filename.replace(`${PATH_STATIC}/`, '');
      const hasPatch = SCRIPTS_PATCHES[normalizedFilename];
      const patchInfo = hasPatch ? chalk.green(' [patched]') : chalk.gray(' [no patch]');

      console.log(chalk.yellow(`  ${emoji} ${status} ${file.filename}`) + patchInfo);
    });
  } else {
    console.log(chalk.green('✓ No script changes found'));
  }

  if (scriptsWithoutPatches.length > 0) {
    console.log(chalk.yellow(`\n⚠ ${scriptsWithoutPatches.length} script(s) without patches`));
  }

  if (conflicts > 0) {
    console.log(chalk.red(`\n⚠ ${conflicts} conflict(s) were found`));
  } else if (scriptsWithPatches.length > 0) {
    console.log(chalk.green('✓ No script conflicts found'));
  }

  return scriptChanges.length > 0;
}
