import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { PACKAGES_DIR, SRC_DIR } from './utils/consts';

console.log(chalk.bold.cyan('\n🎨 Auto-importing styles from packages...\n'));

// Get all directories from src/packages
const directories = fs.readdirSync(PACKAGES_DIR, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

console.log(chalk.blue(`Found ${directories.length} package(s)`));

// Generate @use statements
const useStatements = directories.map((dirName) => `@use 'packages/${dirName}/styles/main' as ${dirName};\n`).join('');

// Write to styles.scss
const stylesPath = path.join(SRC_DIR, 'main.scss');
fs.writeFileSync(stylesPath, useStatements);

console.log(chalk.green('\n✓ Generated @use statements for all packages:'));
console.log(chalk.cyan(useStatements));
console.log(chalk.green.bold('✓ Style imports completed successfully'));
