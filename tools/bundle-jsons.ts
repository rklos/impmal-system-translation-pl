import fs from 'fs';

const PACKAGES_DIR = 'src/packages';

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
    const fullPath = `${dir}/${item.name}`;

    if (item.isDirectory()) {
      findLangJsons(fullPath, jsons);
    } else if (item.name === 'lang.json') {
      jsons.push(fullPath);
    }
  }

  return jsons;
}

const jsons = findLangJsons(PACKAGES_DIR);

const combinedJson: Record<string, unknown> = {};
for (const json of jsons) {
  const data = JSON.parse(fs.readFileSync(json, 'utf8'));

  // Filter out keys starting with '//'
  const filteredData = Object.fromEntries(
    Object.entries(data).filter(([ key ]) => !key.startsWith('//')),
  );

  deepMerge(combinedJson, filteredData);
}

// Ensure dist/lang directory exists
if (!fs.existsSync('dist/lang')) {
  fs.mkdirSync('dist/lang', { recursive: true });
}

// Write combined JSON to file
fs.writeFileSync('dist/lang/pl.json', JSON.stringify(combinedJson, null, 2));
