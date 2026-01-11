import * as diff from 'diff';
import * as fs from 'fs';
import { dirname, join, relative } from 'path';
import chalk from 'chalk';
import type { Package } from '~/packages';
import {
  getConstsOfPackage,
  ROOT_DIR,
  EXT_DIFF,
  LANG_EN,
  LANG_PL,
  DIR_PATCHES,
  FILE_COMMON_TRANSLATIONS,
} from '../../../utils/consts';

async function getChangedFiles(pkg: Package): Promise<string[]> {
  const { TEMP_PATCHES_EN_DIR, TEMP_PATCHES_PL_DIR } = getConstsOfPackage(pkg);

  // Get diff between pl and en directories by comparing files directly
  const changedFiles: string[] = [];

  function scanDirectory(dirPath: string, basePath: string = ''): string[] {
    const files: string[] = [];
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      const relativePath = join(basePath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...scanDirectory(fullPath, relativePath));
      } else {
        files.push(relativePath);
      }
    }

    return files;
  }

  // Get all files from both directories
  const enFiles = scanDirectory(TEMP_PATCHES_EN_DIR);
  const plFiles = scanDirectory(TEMP_PATCHES_PL_DIR);

  // Find files that exist in both directories and are different
  for (const file of enFiles) {
    if (plFiles.includes(file)) {
      const enPath = join(TEMP_PATCHES_EN_DIR, file);
      const plPath = join(TEMP_PATCHES_PL_DIR, file);

      try {
        const enContent = fs.readFileSync(enPath, 'utf8');
        const plContent = fs.readFileSync(plPath, 'utf8');

        if (enContent !== plContent) {
          changedFiles.push(file);
        }
      } catch (error) {
        console.warn(chalk.yellow(`⚠ Could not compare file ${file}:`), error);
      }
    }
  }

  return changedFiles;
}

async function createPatchForFile(pkg: Package, filePath: string): Promise<void> {
  const { PATCHES_DIR, TEMP_PATCHES_EN_DIR, TEMP_PATCHES_PL_DIR } = getConstsOfPackage(pkg);

  try {
    const enPath = join(TEMP_PATCHES_EN_DIR, filePath);
    const plPath = join(TEMP_PATCHES_PL_DIR, filePath);

    // Read file contents
    const enContent = fs.readFileSync(enPath, 'utf8');
    const plContent = fs.readFileSync(plPath, 'utf8');

    // Generate unified diff
    const patch = diff.createPatch(
      filePath,
      enContent,
      plContent,
      LANG_EN,
      LANG_PL,
      { context: 3 },
    );

    // Create patches directory structure
    fs.mkdirSync(PATCHES_DIR, { recursive: true });

    // Save patch file
    const patchPath = join(PATCHES_DIR, filePath.replace(/\.(hbs|js)/, EXT_DIFF));
    const patchDir = dirname(patchPath);
    fs.mkdirSync(patchDir, { recursive: true });
    fs.writeFileSync(patchPath, patch);

    console.log(chalk.green(`✓ Created patch: ${pkg.PACKAGE}/${DIR_PATCHES}/${filePath}`));
  } catch (error) {
    console.error(chalk.red(`✗ Error creating patch for ${pkg.PACKAGE}/${DIR_PATCHES}/${filePath}:`), error);
  }
}

export default async function create(pkg: Package): Promise<void> {
  console.log(chalk.bold.cyan(`\n📝 Creating patches for package: ${pkg.PACKAGE}\n`));

  // Remove existing patches directory if it exists, but preserve common-translations.json
  const { PATCHES_DIR } = getConstsOfPackage(pkg);
  let commonTranslationsContent: string | null = null;
  const commonTranslationsPath = join(PATCHES_DIR, FILE_COMMON_TRANSLATIONS);

  // Backup common-translations.json if it exists
  if (fs.existsSync(commonTranslationsPath)) {
    commonTranslationsContent = fs.readFileSync(commonTranslationsPath, 'utf8');
    console.log(chalk.blue(`💾 Backed up ${FILE_COMMON_TRANSLATIONS}`));
  }

  // Remove existing patches directory
  if (fs.existsSync(PATCHES_DIR)) {
    fs.rmSync(PATCHES_DIR, { recursive: true, force: true });
    console.log(chalk.yellow(`🗑️  Removed existing patches directory: ${relative(ROOT_DIR, PATCHES_DIR)}`));
  }

  // Get the list of changed files between pl and en directories
  const changedFiles = await getChangedFiles(pkg);

  if (changedFiles.length === 0) {
    console.log(chalk.yellow('\nNo changed files found'));
    return;
  }

  console.log(chalk.blue(`\nFound ${changedFiles.length} changed file(s)\n`));

  for (const filePath of changedFiles) {
    await createPatchForFile(pkg, filePath);
  }

  // Restore common-translations.json if it was backed up
  if (commonTranslationsContent) {
    fs.writeFileSync(commonTranslationsPath, commonTranslationsContent, 'utf8');
    console.log(chalk.green(`✓ Restored ${FILE_COMMON_TRANSLATIONS}`));
  }

  console.log(chalk.green.bold(`\n✓ Patch creation completed (${changedFiles.length} patches created)`));
}
