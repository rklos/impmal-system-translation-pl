import { parseArgs } from 'node:util';
import wfrp4e from './sources/wfrp4e';

const { values: _, positionals } = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
});
// eslint-disable-next-line prefer-const
let [ source ] = positionals;

if (!source) {
  console.error('Error: Source is required');
  process.exit(1);
}

// eslint-disable-next-line no-shadow
async function run(source: string) {
  if (source === 'wfrp4e') {
    await wfrp4e();
  } else {
    console.error(`Error: Unknown source '${source}'`);
    process.exit(1);
  }
}

run(source);
