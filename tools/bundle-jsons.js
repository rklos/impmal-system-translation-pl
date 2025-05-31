import fs from 'fs';

const jsons = fs.readdirSync('src/lang')
  .filter((file) => file.endsWith('.json'))
  .map((file) => `src/lang/${file}`);

async function processJsons() {
  const combinedJson = {};

  for (const json of jsons) {
    const data = JSON.parse(fs.readFileSync(json, 'utf8'));

    // Filter out keys starting with '//'
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([ key ]) => !key.startsWith('//')),
    );

    // Deep merge objects instead of simple assign
    function deepMerge(target, source) {
      for (const key in source) {
        if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
          deepMerge(target[key], source[key]);
        } else {
          // eslint-disable-next-line no-param-reassign
          target[key] = source[key];
        }
      }
    }

    deepMerge(combinedJson, filteredData);
  }

  // Ensure dist/lang directory exists
  if (!fs.existsSync('dist/lang')) {
    fs.mkdirSync('dist/lang', { recursive: true });
  }

  // Write combined JSON to file
  fs.writeFileSync('dist/lang/pl.json', JSON.stringify(combinedJson, null, 2));
}

processJsons().catch(console.error);
