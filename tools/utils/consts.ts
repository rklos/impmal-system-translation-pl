import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { Package } from '~/packages';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const ROOT_DIR = join(__dirname, '..', '..');
export const PACKAGES_DIR = join(ROOT_DIR, 'src', 'packages');

export function getConstsOfPackage(pkg: Package) {
  const PACKAGE_DIR = join(PACKAGES_DIR, pkg.PACKAGE);
  const PATCHES_DIR = join(PACKAGE_DIR, 'patches');

  const TEMP_DIR = join(PACKAGE_DIR, 'temp');
  const TEMP_PATCHES_DIR = join(TEMP_DIR, 'patches');
  const TEMP_PATCHES_DOWNLOAD_DIR = join(TEMP_PATCHES_DIR, 'download');
  const TEMP_PATCHES_EN_DIR = join(TEMP_PATCHES_DIR, 'en');
  const TEMP_PATCHES_PL_DIR = join(TEMP_PATCHES_DIR, 'pl');

  return {
    PACKAGE_DIR,
    PATCHES_DIR,

    TEMP_DIR,
    TEMP_PATCHES_DIR,
    TEMP_PATCHES_DOWNLOAD_DIR,
    TEMP_PATCHES_EN_DIR,
    TEMP_PATCHES_PL_DIR,
  };
}
