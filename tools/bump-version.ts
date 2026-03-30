import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC_DIR = join(ROOT_DIR, 'src');

function bumpVersion(newVersionArg: string) {
  console.log('\nBumping version...\n');

  const packageJsonPath = join(ROOT_DIR, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

  const oldVersion = packageJson.version;
  console.log(`Current version: ${oldVersion}`);

  let newVersion: string;
  if (newVersionArg) {
    if (!/^\d+\.\d+\.\d+(-alpha|-beta|-rc\.\d+)?$/.test(newVersionArg)) {
      throw new Error('Version must be in format x.y.z or x.y.z-alpha, x.y.z-beta, x.y.z-rc.N');
    }
    newVersion = newVersionArg;
    console.log(`Using specified version: ${newVersion}`);
  } else {
    const [ major, minor, patch ] = packageJson.version.split('.').map(Number);
    newVersion = `${major}.${minor}.${patch + 1}`;
    console.log(`Auto-incrementing patch version: ${newVersion}`);
  }

  packageJson.version = newVersion;
  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
  console.log('Updated package.json');

  const packageLockPath = join(ROOT_DIR, 'package-lock.json');
  const packageLock = JSON.parse(readFileSync(packageLockPath, 'utf8'));
  packageLock.version = newVersion;
  packageLock.packages[''].version = newVersion;
  writeFileSync(packageLockPath, `${JSON.stringify(packageLock, null, 2)}\n`);
  console.log('Updated package-lock.json');

  const manifestJsonPath = join(SRC_DIR, 'module.json');
  const manifestJson = JSON.parse(readFileSync(manifestJsonPath, 'utf8'));
  manifestJson.version = newVersion;
  writeFileSync(manifestJsonPath, `${JSON.stringify(manifestJson, null, 2)}\n`);
  console.log('Updated module.json');

  console.log(`\nVersion bumped: ${oldVersion} -> ${newVersion}`);
}

const newVersionArg = process.argv[2];

try {
  bumpVersion(newVersionArg);
} catch (error) {
  console.error('Error bumping version:', error);
  process.exit(1);
}
