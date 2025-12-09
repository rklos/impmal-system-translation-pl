import fs from 'fs';
import chalk from 'chalk';
import type { Package } from '~/packages';
import { join } from 'path';
import { fetchGithubRawContent } from '../../../utils/fetch-github-raw-content';
import type { Changes } from '../types';
import { getConstsOfPackage } from '../../../utils/consts';

export default async function checkTranslations(pkg: Package, changes: Changes) {
  const { PACKAGE_DIR } = getConstsOfPackage(pkg);

  const translationChanges = changes.changedFiles.filter((file) => file.filename.startsWith('lang/') && file.filename.endsWith('.json'));

  if (translationChanges.length > 0) {
    console.log(chalk.cyan('\n🌐 Modified translation files:'));
    translationChanges.forEach((file) => {
      const emoji = file.status === 'modified' ? '✏️' : '🗑️';
      const status = file.status === 'modified' ? 'M' : 'D';
      console.log(chalk.yellow(`  ${emoji} ${status} ${file.filename}`));
    });
  }

  const response = await fetchGithubRawContent(pkg.REPO, `refs/tags/${changes.tagName}`, 'static/lang/en.json');
  const remoteJson = await response.json();

  const localJson = JSON.parse(fs.readFileSync(join(PACKAGE_DIR, 'lang.json'), 'utf8'));

  const missingKeys: string[] = [];
  const extraKeys: string[] = [];

  function findDifferences(localObj: Record<string, unknown>, remoteObj: Record<string, unknown>, path = '') {
    for (const key in remoteObj) {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof remoteObj[key] === 'object' && remoteObj[key] != null) {
        if (localObj[key] == null) {
          missingKeys.push(currentPath);
        } else {
          findDifferences(
            localObj[key] as Record<string, unknown>,
            remoteObj[key] as Record<string, unknown>,
            currentPath,
          );
        }
      } else if (localObj[key] == null) {
        missingKeys.push(currentPath);
      }
    }

    for (const key in localObj) {
      if (key.startsWith('//')) continue;
      const currentPath = path ? `${path}.${key}` : key;
      if (remoteObj[key] == null) extraKeys.push(currentPath);
    }
  }

  findDifferences(localJson, remoteJson);

  if (missingKeys.length > 0) {
    console.log(chalk.red('\n❌ Missing translations:'));
    missingKeys.forEach((key) => console.log(chalk.red(`  - ${key}`)));
  }
  if (extraKeys.length > 0) {
    console.log(chalk.yellow('\n➕ Extra translations:'));
    extraKeys.forEach((key) => console.log(chalk.yellow(`  + ${key}`)));
  }
  if (missingKeys.length === 0 && extraKeys.length === 0) {
    console.log(chalk.green('\n✓ No translation differences found'));
  }

  return missingKeys.length > 0 || extraKeys.length > 0;
}
