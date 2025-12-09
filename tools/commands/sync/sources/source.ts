import fs from 'fs';
import chalk from 'chalk';
import * as packages from '~/packages';
import type { Package } from '~/packages';
import { fetchGithubRawContent } from '../../../utils/fetch-github-raw-content';
import { updateNestedValues } from '../../../utils/update-nested-values';
import {
  PATH_SRC_PACKAGES,
  FILE_LANG_JSON,
  GIT_REF_MASTER,
  PATH_STATIC_LANG,
  FILE_EN_JSON,
} from '../../../utils/consts';

export default async function syncWithSource() {
  console.log(chalk.bold.cyan('\n🔄 Syncing packages with source...\n'));

  for (const pkg of Object.values(packages) as Package[]) {
    if (!('SUPPORTED_VERSION' in pkg)) continue;

    try {
      console.log(chalk.bold.blue(`\n📦 Syncing ${pkg.PACKAGE}`));
      const langFile = `${PATH_SRC_PACKAGES}/${pkg.PACKAGE}/${FILE_LANG_JSON}`;
      const langJson = JSON.parse(fs.readFileSync(langFile, 'utf8'));

      console.log(chalk.cyan('  ⬇️  Fetching remote translations...'));
      const response = await fetchGithubRawContent(pkg.REPO, GIT_REF_MASTER, `${PATH_STATIC_LANG}/${FILE_EN_JSON}`);
      const langJsonRemote = await response.json();

      updateNestedValues(langJsonRemote, langJson);
      fs.writeFileSync(langFile, JSON.stringify(langJsonRemote, null, 2));
      console.log(chalk.green('  ✓ Synced successfully'));
    } catch (error) {
      console.error(chalk.red(`  ✗ Error syncing ${pkg.PACKAGE}:`), error);
    }
  }

  console.log(chalk.green.bold('\n✓ Sync completed for all packages'));
}
