import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

function bumpVersion(newVersionArg: string) {
  // Read package.json
  const packageJsonPath = join(ROOT_DIR, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

  // Determine new version
  let newVersion: string;
  if (newVersionArg) {
    // Validate version format
    if (!/^\d+\.\d+\.\d+$/.test(newVersionArg)) {
      throw new Error('Version must be in format x.y.z');
    }
    newVersion = newVersionArg;
  } else {
    // Split version into parts and increment patch
    const [ major, minor, patch ] = packageJson.version.split('.').map(Number);
    newVersion = `${major}.${minor}.${patch + 1}`;
  }

  // Update package.json
  packageJson.version = newVersion;
  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

  // Update package-lock.json
  const packageLockPath = join(ROOT_DIR, 'package-lock.json');
  const packageLock = JSON.parse(readFileSync(packageLockPath, 'utf8'));
  packageLock.version = newVersion;
  packageLock.packages[''].version = newVersion;
  writeFileSync(packageLockPath, `${JSON.stringify(packageLock, null, 2)}\n`);

  // Update module.json
  const moduleJsonPath = join(ROOT_DIR, 'src', 'module.json');
  const moduleJson = JSON.parse(readFileSync(moduleJsonPath, 'utf8'));
  moduleJson.version = newVersion;
  writeFileSync(moduleJsonPath, `${JSON.stringify(moduleJson, null, 2)}\n`);

  console.log(chalk.green(`Version bumped to ${newVersion}`));
}

// Get version from CLI argument if provided
const newVersionArg = process.argv[2];

try {
  bumpVersion(newVersionArg);
} catch (error) {
  console.error(chalk.red('Error bumping version:'), error);
  process.exit(1);
}
