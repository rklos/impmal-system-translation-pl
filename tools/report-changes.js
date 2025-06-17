import fs from 'fs';
import chalk from 'chalk';
import { getLatestChanges } from './get-latest-changes.js';
import { TEMPLATES_PATCHES } from '../src/scripts/patch-templates.js';
import { sendNotification, reportError } from './discord.js';

const modules = [
  {
    lang: 'system',
    repo: 'moo-man/ImpMal-FoundryVTT',
  },
  {
    lang: 'warhammer-library',
    repo: 'moo-man/WarhammerLibrary-FVTT',
    version: '2.1.0',
  },
];

async function checkTemplates(changes, repoName) {
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
    templateChanges.forEach((file) => console.log(chalk.yellow(`${file.status === 'modified' ? 'M' : 'D'} ${file.filename}`)));

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

async function checkTranslations(changes, name, repo) {
  const translationChanges = changes.changedFiles.filter((file) => file.filename.startsWith('lang/') && file.filename.endsWith('.json'));

  if (translationChanges.length > 0) {
    console.log(chalk.blue('\nModified translation files:'));
    translationChanges.forEach((file) => console.log(chalk.yellow(`${file.status === 'modified' ? 'M' : 'D'} ${file.filename}`)));
  }

  const response = await fetch(
    `https://raw.githubusercontent.com/${repo}/refs/tags/${changes.tagName}/static/lang/en.json`,
  );
  const remoteJson = await response.json();

  let localJson = {};
  try {
    localJson = JSON.parse(fs.readFileSync(`src/lang/${name}.json`, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const missingKeys = [];
  const extraKeys = [];

  function findDifferences(localObj, remoteObj, path = '') {
    for (const key in remoteObj) {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof remoteObj[key] === 'object' && remoteObj[key] != null) {
        if (localObj[key] == null) {
          missingKeys.push(currentPath);
        } else {
          findDifferences(localObj[key], remoteObj[key], currentPath);
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
    console.log(chalk.red('\nMissing translations:'));
    missingKeys.forEach((key) => console.log(chalk.red(`- ${key}`)));
  }
  if (extraKeys.length > 0) {
    console.log(chalk.yellow('\nExtra translations:'));
    extraKeys.forEach((key) => console.log(chalk.yellow(`+ ${key}`)));
  }
  if (missingKeys.length === 0 && extraKeys.length === 0) {
    console.log(chalk.green('\nNo translation differences found'));
  }

  return missingKeys.length > 0 || extraKeys.length > 0;
}

async function checkChanges() {
  for (const module of modules) {
    try {
      console.log(chalk.blue(`\n=== Checking ${module.lang} ===`));
      const changes = await getLatestChanges(module.repo, module.version);

      let hasChanges = false;
      hasChanges = await checkTemplates(changes, module.lang) || hasChanges;
      hasChanges = await checkTranslations(changes, module.lang, module.repo) || hasChanges;

      if (hasChanges) await sendNotification('Changes Check', `Changes found in ${module.lang}`);
    } catch (error) {
      console.error(chalk.red(`Error processing ${module.lang}:`), error);
      await reportError('Changes Check', error.message);
    }
  }
}

checkChanges().catch(console.error);
