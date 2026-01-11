import fs from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { DIST_DIR, PACKAGES_DIR, DIR_LANG, FILE_LANG_JSON, FILE_PL_JSON } from './utils/consts';

console.log(chalk.bold.cyan('\n📦 Bundling language JSON files...\n'));

// Deep merge objects instead of simple assign
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>) {
  for (const key in source) {
    if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
      deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
    } else {
      // eslint-disable-next-line no-param-reassign
      target[key] = source[key];
    }
  }
}

function findLangJsons(dir: string, jsons: string[] = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = join(dir, item.name);

    if (item.isDirectory()) {
      findLangJsons(fullPath, jsons);
    } else if (item.name === FILE_LANG_JSON) {
      jsons.push(fullPath);
    }
  }

  return jsons;
}

const jsons = findLangJsons(PACKAGES_DIR);
console.log(chalk.blue(`Found ${jsons.length} ${FILE_LANG_JSON} file(s) to merge`));

const combinedJson: Record<string, unknown> = {};
let totalKeys = 0;
for (const json of jsons) {
  const data = JSON.parse(fs.readFileSync(json, 'utf8'));

  // Filter out keys starting with '//'
  const filteredData = Object.fromEntries(
    Object.entries(data).filter(([ key ]) => !key.startsWith('//')),
  );

  const keyCount = Object.keys(filteredData).length;
  totalKeys += keyCount;
  console.log(chalk.green(`✓ Merged ${json.replace(PACKAGES_DIR, '').replace(/^\//, '')} (${keyCount} keys)`));

  deepMerge(combinedJson, filteredData);
}

// Ensure dist/lang directory exists
const distLangDir = join(DIST_DIR, DIR_LANG);
if (!fs.existsSync(distLangDir)) {
  fs.mkdirSync(distLangDir, { recursive: true });
  console.log(chalk.cyan(`\nCreated ${DIST_DIR}/${DIR_LANG} directory`));
}

// Write combined JSON to file
const outputPath = join(DIST_DIR, DIR_LANG, FILE_PL_JSON);
fs.writeFileSync(outputPath, JSON.stringify(combinedJson, null, 2));

console.log(chalk.green.bold(`\n✓ Bundle completed successfully`));
console.log(chalk.cyan(`  Output: ${outputPath}`));
console.log(chalk.cyan(`  Total translations: ${totalKeys}`));
