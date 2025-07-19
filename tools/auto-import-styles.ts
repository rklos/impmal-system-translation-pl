import fs from 'fs';
import path from 'path';
import { PACKAGES_DIR, SRC_DIR } from './utils/consts';

// Get all directories from src/packages
const directories = fs.readdirSync(PACKAGES_DIR, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

// Generate @use statements
const useStatements = directories.map((dirName) => `@use 'packages/${dirName}/styles/main' as ${dirName};\n`).join('');

// Write to styles.scss
const stylesPath = path.join(SRC_DIR, 'main.scss');
fs.writeFileSync(stylesPath, useStatements);

console.log('Generated @use statements for all packages:');
console.log(useStatements);
