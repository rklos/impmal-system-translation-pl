import { parseArgs } from 'node:util';
import * as packages from '~/packages';
import type { Package } from '~/packages';
import download from './actions/download';
import create from './actions/create';
import apply from './actions/apply';

const { values: _, positionals } = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
});
// eslint-disable-next-line prefer-const
let [ action ] = positionals;

if (!action) {
  console.error('Error: Action is required');
  process.exit(1);
}

// eslint-disable-next-line no-shadow
async function run(action: string) {
  for (const pkg of Object.values(packages) as Package[]) {
    if (!('REPO' in pkg)) continue;

    if (action === 'download') {
      await download(pkg);
    } else if (action === 'create') {
      await create(pkg);
    } else if (action === 'apply') {
      await apply(pkg);
    } else {
      console.error(`Error: Unknown action '${action}'`);
      process.exit(1);
    }
  }
}

run(action);
