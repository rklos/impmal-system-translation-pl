import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import {
  ROOT_DIR,
  SRC_DIR,
  FILE_PACKAGE_JSON,
  FILE_PACKAGE_LOCK_JSON,
  FILE_MODULE_JSON,
} from './utils/consts';

function bumpVersion(newVersionArg: string) {
  console.log(chalk.bold.cyan('\n🔢 Bumping version...\n'));

  // Read package.json
  const packageJsonPath = join(ROOT_DIR, FILE_PACKAGE_JSON);
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

  const oldVersion = packageJson.version;
  console.log(chalk.blue(`Current version: ${oldVersion}`));

  // Determine new version
  let newVersion: string;
  if (newVersionArg) {
    // Validate version format
    if (!/^\d+\.\d+\.\d+(-alpha|-beta|-rc\.\d+)?$/.test(newVersionArg)) {
      throw new Error('Version must be in format x.y.z or x.y.z-alpha, x.y.z-beta, x.y.z-rc.N');
    }
    newVersion = newVersionArg;
    console.log(chalk.cyan(`Using specified version: ${newVersion}`));
  } else {
    // Split version into parts and increment patch
    const [ major, minor, patch ] = packageJson.version.split('.').map(Number);
    newVersion = `${major}.${minor}.${patch + 1}`;
    console.log(chalk.cyan(`Auto-incrementing patch version: ${newVersion}`));
  }

  // Update package.json
  packageJson.version = newVersion;
  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
  console.log(chalk.green(`✓ Updated ${FILE_PACKAGE_JSON}`));

  // Update package-lock.json
  const packageLockPath = join(ROOT_DIR, FILE_PACKAGE_LOCK_JSON);
  const packageLock = JSON.parse(readFileSync(packageLockPath, 'utf8'));
  packageLock.version = newVersion;
  packageLock.packages[''].version = newVersion;
  writeFileSync(packageLockPath, `${JSON.stringify(packageLock, null, 2)}\n`);
  console.log(chalk.green(`✓ Updated ${FILE_PACKAGE_LOCK_JSON}`));

  // Update module.json
  const moduleJsonPath = join(SRC_DIR, FILE_MODULE_JSON);
  const moduleJson = JSON.parse(readFileSync(moduleJsonPath, 'utf8'));
  moduleJson.version = newVersion;
  writeFileSync(moduleJsonPath, `${JSON.stringify(moduleJson, null, 2)}\n`);
  console.log(chalk.green(`✓ Updated ${FILE_MODULE_JSON}`));

  console.log(chalk.green.bold(`\n✓ Version successfully bumped: ${oldVersion} → ${newVersion}`));
}

// Get version from CLI argument if provided
const newVersionArg = process.argv[2];

try {
  bumpVersion(newVersionArg);
} catch (error) {
  console.error(chalk.red('Error bumping version:'), error);
  process.exit(1);
}
