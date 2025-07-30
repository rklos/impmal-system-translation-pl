import fs from 'fs';
import { join } from 'path';
import { sendNotification, reportError } from '../../../utils/discord';
import { fetchGithubRawContent } from '../../../utils/fetch-github-raw-content';
import { PACKAGES_DIR } from '../../../utils/consts';
import { updateNestedValues, type Change } from '../../../utils/update-nested-values';

const REPO = 'foundryvttpl/wfrp4e-core-pl';
const LANG_FILE = join(PACKAGES_DIR, 'warhammer-library', 'lang.json');

async function reportChanges(changedTranslations: Change[]) {
  if (changedTranslations.length > 0) {
    console.log('\nUpdated translations:');
    changedTranslations.forEach(({ path, old, new: newValue }) => {
      console.log(`\n${path}:`);
      console.log(`  Old: "${old}"`);
      console.log(`  New: "${newValue}"`);
    });
    console.log(`\nTotal translations updated: ${changedTranslations.length}`);
    await sendNotification('Translation Sync', `Updated ${changedTranslations.length} translations`);
  } else {
    console.log('No translations were updated');
  }
}

export default async function updateTranslations() {
  try {
    const localJson = JSON.parse(fs.readFileSync(LANG_FILE, 'utf8'));

    const response = await fetchGithubRawContent(REPO, 'main', 'lang/pl.json');
    const remoteJson = await response.json();

    const changes = updateNestedValues(localJson, remoteJson);
    fs.writeFileSync(LANG_FILE, JSON.stringify(localJson, null, 2));
    await reportChanges(changes);
  } catch (error) {
    console.error('Error updating translations:', error);
    await reportError('Translation Sync', error instanceof Error ? error.message : 'Unknown error');
  }
}
