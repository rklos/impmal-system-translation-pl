import * as diff from 'diff';
import * as fs from 'fs';
import * as path from 'path';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { Package } from '~/packages';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..', '..', '..');
const PATCHES_DIR = join(ROOT_DIR, 'patches');

async function getChangedFiles(pkg: Package): Promise<string[]> {
  const EN_DIR = join(PATCHES_DIR, pkg.PACKAGE, 'en');
  const PL_DIR = join(PATCHES_DIR, pkg.PACKAGE, 'pl');

  // Get diff between pl and en directories by comparing files directly
  const changedFiles: string[] = [];

  function scanDirectory(dirPath: string, basePath: string = ''): string[] {
    const files: string[] = [];
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativePath = path.join(basePath, item);
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
  const enFiles = scanDirectory(EN_DIR);
  const plFiles = scanDirectory(PL_DIR);

  // Find files that exist in both directories and are different
  for (const file of enFiles) {
    if (plFiles.includes(file)) {
      const enPath = path.join(EN_DIR, file);
      const plPath = path.join(PL_DIR, file);

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
  const EN_DIR = join(PATCHES_DIR, pkg.PACKAGE, 'en');
  const PL_DIR = join(PATCHES_DIR, pkg.PACKAGE, 'pl');

  try {
    const enPath = path.join(EN_DIR, filePath);
    const plPath = path.join(PL_DIR, filePath);

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
    const SRC_PATCHES_DIR = path.join(ROOT_DIR, 'src', 'packages', pkg.PACKAGE, 'patches');
    fs.mkdirSync(SRC_PATCHES_DIR, { recursive: true });

    // Save patch file
    const patchPath = path.join(SRC_PATCHES_DIR, filePath.replace('.hbs', '.diff'));
    const patchDir = path.dirname(patchPath);
    fs.mkdirSync(patchDir, { recursive: true });
    fs.writeFileSync(patchPath, patch);

    console.log(`Created patch: ${pkg.PACKAGE}/patches/${filePath}`);
  } catch (error) {
    console.error(`Error creating patch for ${pkg.PACKAGE}/patches/${filePath}:`, error);
  }
}

export default async function create(pkg: Package): Promise<void> {
  // Remove existing patches directory if it exists
  const SRC_PATCHES_DIR = path.join(ROOT_DIR, 'src', 'packages', pkg.PACKAGE, 'patches');
  if (fs.existsSync(SRC_PATCHES_DIR)) {
    fs.rmSync(SRC_PATCHES_DIR, { recursive: true, force: true });
    console.log(`Removed existing patches directory: ${path.relative(ROOT_DIR, SRC_PATCHES_DIR)}`);
  }

  // Get the list of changed files between pl and en directories
  const changedFiles = await getChangedFiles(pkg);

  for (const filePath of changedFiles) {
    await createPatchForFile(pkg, filePath);
  }
}
