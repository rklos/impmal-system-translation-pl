import chalk from 'chalk';
import { TEMPLATES_PATCHES } from '~/packages/impmal/scripts/patch-templates';
import type { Package } from '~/packages';
import type { Changes } from '../types';

export async function checkTemplates(pkg: Package, changes: Changes) {
  const templateChanges = changes.changedFiles
    .filter((file) => file.filename.endsWith('.hbs'))
    .filter((file) => TEMPLATES_PATCHES[file.filename.replace('.hbs', '').replace('static/templates/', '')]);

  const obsoletePatches = [];
  for (const file of templateChanges) {
    const patches = TEMPLATES_PATCHES[file.filename.replace('.hbs', '').replace('static/templates/', '')];
    let patchedContent = file.content;

    for (const [ english, polish ] of Object.entries(patches)) {
      const contentBefore = patchedContent;
      patchedContent = patchedContent.replaceAll(english, polish);
      if (patchedContent === contentBefore) {
        obsoletePatches.push({ filename: file.filename, english, polish });
      }
    }
  }

  if (templateChanges.length > 0) {
    console.log(chalk.yellow('\nModified templates:'));
    templateChanges.forEach((file) => {
      let status = 'D';
      if (file.status === 'modified') status = 'M';
      if (file.status === 'renamed') status = 'R';
      if (file.status === 'added') status = 'A';
      console.log(chalk.yellow(`${status} ${file.filename}`));
    });

    if (obsoletePatches.length > 0) {
      console.log(chalk.yellow('\nObsolete patches:'));
      obsoletePatches.forEach((patch) => {
        console.log(chalk.yellow(`- ${patch.filename}: "${patch.english}" -> "${patch.polish}"`));
      });
    }
  } else {
    console.log(chalk.green('No template changes found'));
  }

  return templateChanges.length > 0;
}