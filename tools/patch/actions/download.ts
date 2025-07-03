import type { Package } from '~/packages';
import { mkdirSync, existsSync, rmSync, cpSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { simpleGit } from 'simple-git';
import config from '../../../tools.config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..', '..', '..');
const PATCHES_DIR = join(ROOT_DIR, 'patches');

export default async function download(pkg: Package) {
  const fileTypes = config.patch[pkg.PACKAGE as keyof typeof config.patch];
  if (!fileTypes) {
    console.log(`No files to download for package ${pkg.PACKAGE}`);
    return;
  }

  const EN_DIR = join(PATCHES_DIR, pkg.PACKAGE, 'en');
  const PL_DIR = join(PATCHES_DIR, pkg.PACKAGE, 'pl');
  const TEMP_DIR = join(PATCHES_DIR, pkg.PACKAGE, 'temp');

  rmSync(EN_DIR, { recursive: true, force: true });
  rmSync(PL_DIR, { recursive: true, force: true });
  rmSync(TEMP_DIR, { recursive: true, force: true });

  try {
    mkdirSync(EN_DIR, { recursive: true });
    mkdirSync(PL_DIR, { recursive: true });
    mkdirSync(TEMP_DIR);

    console.log(`Cloning repository: ${pkg.REPO}`);
    await simpleGit().clone(`https://github.com/${pkg.REPO}`, TEMP_DIR);

    fileTypes.forEach((type) => {
      const typeDir = join(TEMP_DIR, type);
      if (existsSync(typeDir)) {
        console.log(`Copying files from ${type}...`);
        cpSync(typeDir, join(EN_DIR, type), { recursive: true });
        cpSync(typeDir, join(PL_DIR, type), { recursive: true });
      } else {
        console.log(`Warning: ${type} directory not found`);
      }
    });

    // Clean up temporary directory
    rmSync(TEMP_DIR, { recursive: true, force: true });
    console.log('Download completed successfully');
  } catch (error) {
    console.error('Error downloading files:', error);
    process.exit(1);
  }
}
