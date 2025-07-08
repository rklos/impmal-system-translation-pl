import fs from 'fs';
import { sendNotification, reportError } from '../../../utils/discord';
import { fetchGithubRawContent } from '../../../utils/fetch-github-raw-content';

const REPO = 'foundryvttpl/wfrp4e-core-pl';
const LANG_FILE = 'src/packages/warhammer-library/lang.json';

interface Change {
  path: string;
  old: unknown;
  new: unknown;
}

function updateNestedValues(
  localObj: Record<string, unknown>,
  remoteObj: Record<string, unknown>,
  path = '',
  changedTranslations: Change[] = [],
): Change[] {
  for (const key in localObj) {
    const currentPath = path ? `${path}.${key}` : key;

    if (typeof localObj[key] === 'object' && localObj[key] !== null) {
      if (remoteObj[key]) {
        updateNestedValues(
          localObj[key] as Record<string, unknown>,
          remoteObj[key] as Record<string, unknown>,
          currentPath,
          changedTranslations,
        );
      }
    } else if (typeof localObj[key] === 'string' && remoteObj[key]) {
      if (localObj[key] !== remoteObj[key]) {
        changedTranslations.push({
          path: currentPath,
          old: localObj[key],
          new: remoteObj[key],
        });
        // eslint-disable-next-line no-param-reassign
        localObj[key] = remoteObj[key];
      }
    }
  }

  return changedTranslations;
}

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
