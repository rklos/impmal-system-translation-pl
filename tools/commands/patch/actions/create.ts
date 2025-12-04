import * as diff from 'diff';
import * as fs from 'fs';
import { dirname, join, relative } from 'path';
import type { Package } from '~/packages';
import { getConstsOfPackage, ROOT_DIR } from '../../../utils/consts';

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
        console.warn(`Could not compare file ${file}:`, error);
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
      'en',
      'pl',
      { context: 3 },
    );

    // Create patches directory structure
    fs.mkdirSync(PATCHES_DIR, { recursive: true });

    // Save patch file
    const patchPath = join(PATCHES_DIR, filePath.replace(/\.(hbs|js)/, '.diff'));
    const patchDir = dirname(patchPath);
    fs.mkdirSync(patchDir, { recursive: true });
    fs.writeFileSync(patchPath, patch);

    console.log(`Created patch: ${pkg.PACKAGE}/patches/${filePath}`);
  } catch (error) {
    console.error(`Error creating patch for ${pkg.PACKAGE}/patches/${filePath}:`, error);
  }
}

export default async function create(pkg: Package): Promise<void> {
  // Remove existing patches directory if it exists
  const { PATCHES_DIR } = getConstsOfPackage(pkg);
  if (fs.existsSync(PATCHES_DIR)) {
    fs.rmSync(PATCHES_DIR, { recursive: true, force: true });
    console.log(`Removed existing patches directory: ${relative(ROOT_DIR, PATCHES_DIR)}`);
  }

  // Get the list of changed files between pl and en directories
  const changedFiles = await getChangedFiles(pkg);

  for (const filePath of changedFiles) {
    await createPatchForFile(pkg, filePath);
  }
}
