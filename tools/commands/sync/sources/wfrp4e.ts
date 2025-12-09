import fs from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { sendNotification, reportError } from '../../../utils/discord';
import { fetchGithubRawContent } from '../../../utils/fetch-github-raw-content';
import { PACKAGES_DIR } from '../../../utils/consts';
import { updateNestedValues, type Change } from '../../../utils/update-nested-values';

const REPO = 'foundryvttpl/wfrp4e-core-pl';
const LANG_FILE = join(PACKAGES_DIR, 'warhammer-library', 'lang.json');

async function reportChanges(changedTranslations: Change[]) {
  if (changedTranslations.length > 0) {
    console.log(chalk.cyan('\n📝 Updated translations:'));
    changedTranslations.forEach(({ path, old, new: newValue }) => {
      console.log(chalk.blue(`\n${path}:`));
      console.log(chalk.gray(`  Old: "${old}"`));
      console.log(chalk.green(`  New: "${newValue}"`));
    });
    console.log(chalk.green.bold(`\n✓ Total translations updated: ${changedTranslations.length}`));
    await sendNotification('Translation Sync', `Updated ${changedTranslations.length} translations`);
  } else {
    console.log(chalk.green('✓ No translations were updated (already up to date)'));
  }
}

export default async function updateTranslations() {
  console.log(chalk.bold.cyan('\n🔄 Syncing WFRP4e translations from source...\n'));

  try {
    console.log(chalk.blue('📖 Reading local translations...'));
    const localJson = JSON.parse(fs.readFileSync(LANG_FILE, 'utf8'));
    console.log(chalk.green('✓ Local translations loaded'));

    console.log(chalk.blue(`\n⬇️  Fetching remote translations from ${REPO}...`));
    const response = await fetchGithubRawContent(REPO, 'main', 'lang/pl.json');
    const remoteJson = await response.json();
    console.log(chalk.green('✓ Remote translations fetched'));

    console.log(chalk.blue('\n🔍 Comparing translations...'));
    const changes = updateNestedValues(localJson, remoteJson);
    fs.writeFileSync(LANG_FILE, JSON.stringify(localJson, null, 2));
    console.log(chalk.green('✓ Local file updated'));

    await reportChanges(changes);
  } catch (error) {
    console.error(chalk.red('\n✗ Error updating translations:'), error);
    await reportError('Translation Sync', error instanceof Error ? error.message : 'Unknown error');
  }
}
