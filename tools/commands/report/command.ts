import chalk from 'chalk';
import * as packages from '~/packages';
import type { Package } from '~/packages';
import checkTemplates from './checks/templates';
import checkTranslations from './checks/translations';
import checkScripts from './checks/scripts';
import { getLatestChanges } from './get-latest-changes';
import { sendNotification, reportError } from '../../utils/discord';

async function checkChanges() {
  console.log(chalk.bold.cyan('\n🔍 Checking for changes in packages...\n'));

  for (const pkg of Object.values(packages) as Package[]) {
    if (!('SUPPORTED_VERSION' in pkg)) continue;

    try {
      console.log(chalk.bold.blue(`\n📦 Checking ${pkg.PACKAGE}`));
      const changes = await getLatestChanges(pkg.REPO, pkg.SUPPORTED_VERSION);

      let hasChanges = false;
      hasChanges = await checkTemplates(pkg, changes) || hasChanges;
      hasChanges = await checkTranslations(pkg, changes) || hasChanges;
      hasChanges = await checkScripts(pkg, changes) || hasChanges;

      if (hasChanges) {
        console.log(chalk.yellow(`\n⚠ Changes detected in ${pkg.PACKAGE}`));
        await sendNotification('Changes Check', `Changes found in ${pkg.PACKAGE}`);
      } else {
        console.log(chalk.green(`\n✓ No changes in ${pkg.PACKAGE}`));
      }
    } catch (error) {
      console.error(chalk.red(`\n✗ Error processing ${pkg.PACKAGE}:`), error);
      await reportError('Changes Check', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  console.log(chalk.green.bold('\n✓ Changes check completed for all packages'));
}

checkChanges().catch((error) => {
  console.error(chalk.red('\n✗ Fatal error:'), error);
});
