import type { Package } from '~/packages';
import { mkdirSync, existsSync, rmSync, cpSync } from 'fs';
import { join } from 'path';
import { simpleGit } from 'simple-git';
import config from '../../../../tools.config';
import { getConstsOfPackage } from '../../../utils/consts';

export default async function download(pkg: Package) {
  const { TEMP_PATCHES_DOWNLOAD_DIR, TEMP_PATCHES_EN_DIR, TEMP_PATCHES_PL_DIR } = getConstsOfPackage(pkg);

  const fileTypes = config.patch[pkg.PACKAGE as keyof typeof config.patch];
  if (!fileTypes) {
    console.log(`No files to download for package ${pkg.PACKAGE}`);
    return;
  }

  rmSync(TEMP_PATCHES_EN_DIR, { recursive: true, force: true });
  rmSync(TEMP_PATCHES_PL_DIR, { recursive: true, force: true });
  rmSync(TEMP_PATCHES_DOWNLOAD_DIR, { recursive: true, force: true });

  try {
    mkdirSync(TEMP_PATCHES_EN_DIR, { recursive: true });
    mkdirSync(TEMP_PATCHES_PL_DIR, { recursive: true });
    mkdirSync(TEMP_PATCHES_DOWNLOAD_DIR);

    console.log(`Cloning repository: ${pkg.REPO}`);
    await simpleGit().clone(`https://github.com/${pkg.REPO}`, TEMP_PATCHES_DOWNLOAD_DIR);

    fileTypes.forEach((type) => {
      const typeDir = join(TEMP_PATCHES_DOWNLOAD_DIR, type);
      if (existsSync(typeDir)) {
        console.log(`Copying files from ${type}...`);
        cpSync(typeDir, join(TEMP_PATCHES_EN_DIR, type), { recursive: true });
        cpSync(typeDir, join(TEMP_PATCHES_PL_DIR, type), { recursive: true });
      } else {
        console.log(`Warning: ${type} directory not found`);
      }
    });

    // Clean up download directory
    rmSync(TEMP_PATCHES_DOWNLOAD_DIR, { recursive: true, force: true });
    console.log('Download completed successfully');
  } catch (error) {
    console.error('Error downloading files:', error);
    process.exit(1);
  }
}
