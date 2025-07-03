import fs from 'fs';
import path from 'path';

// Get all directories from src/packages
const packagesDir = path.join(process.cwd(), 'src', 'packages');
const directories = fs.readdirSync(packagesDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

// Generate @use statements
const useStatements = directories.map((dirName) => `@use 'packages/${dirName}/styles/main' as ${dirName};\n`).join('');

// Write to styles.scss
const stylesPath = path.join(process.cwd(), 'src', 'main.scss');
fs.writeFileSync(stylesPath, useStatements);

console.log('Generated @use statements for all packages:');
console.log(useStatements);
