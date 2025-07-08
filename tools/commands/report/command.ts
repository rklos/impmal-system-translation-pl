import chalk from 'chalk';
import * as packages from '~/packages';
import type { Package } from '~/packages';
import checkTemplates from './checks/templates';
import checkTranslations from './checks/translations';
import { getLatestChanges } from './get-latest-changes';
import { sendNotification, reportError } from '../../utils/discord';

async function checkChanges() {
  for (const pkg of Object.values(packages) as Package[]) {
    if (!('SUPPORTED_VERSION' in pkg)) continue;

    try {
      console.log(chalk.blue(`\n=== Checking ${pkg.PACKAGE} ===`));
      const changes = await getLatestChanges(pkg.REPO, pkg.SUPPORTED_VERSION);

      let hasChanges = false;
      hasChanges = await checkTemplates(pkg, changes) || hasChanges;
      hasChanges = await checkTranslations(pkg, changes) || hasChanges;

      if (hasChanges) await sendNotification('Changes Check', `Changes found in ${pkg.PACKAGE}`);
    } catch (error) {
      console.error(chalk.red(`Error processing ${pkg.PACKAGE}:`), error);
      await reportError('Changes Check', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

checkChanges().catch(console.error);
