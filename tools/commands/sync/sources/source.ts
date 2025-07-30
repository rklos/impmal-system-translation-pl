import fs from 'fs';
import chalk from 'chalk';
import * as packages from '~/packages';
import type { Package } from '~/packages';
import { fetchGithubRawContent } from '../../../utils/fetch-github-raw-content';
import { updateNestedValues } from '../../../utils/update-nested-values';

export default async function syncWithSource() {
  for (const pkg of Object.values(packages) as Package[]) {
    if (!('SUPPORTED_VERSION' in pkg)) continue;

    try {
      console.log(chalk.blue(`\n=== Syncing ${pkg.PACKAGE} ===`));
      const langFile = `src/packages/${pkg.PACKAGE}/lang.json`;
      const langJson = JSON.parse(fs.readFileSync(langFile, 'utf8'));

      const response = await fetchGithubRawContent(pkg.REPO, 'master', 'static/lang/en.json');
      const langJsonRemote = await response.json();

      updateNestedValues(langJsonRemote, langJson);
      fs.writeFileSync(langFile, JSON.stringify(langJsonRemote, null, 2));
    } catch (error) {
      console.error(chalk.red(`Error syncing ${pkg.PACKAGE}:`), error);
    }
  }
}
