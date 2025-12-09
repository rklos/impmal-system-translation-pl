import type { Package } from '~/packages';
import { mkdirSync, existsSync, rmSync, cpSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { simpleGit } from 'simple-git';
import config from '../../../../tools.config';
import { getConstsOfPackage } from '../../../utils/consts';

export default async function download(pkg: Package) {
  console.log(chalk.bold.cyan(`\n⬇️  Downloading files for package: ${pkg.PACKAGE}\n`));

  const { TEMP_PATCHES_DOWNLOAD_DIR, TEMP_PATCHES_EN_DIR, TEMP_PATCHES_PL_DIR } = getConstsOfPackage(pkg);

  const fileTypes = config.patch[pkg.PACKAGE as keyof typeof config.patch];
  if (!fileTypes) {
    console.log(chalk.yellow(`No files to download for package ${pkg.PACKAGE}`));
    return;
  }

  console.log(chalk.blue(`Preparing directories...`));
  rmSync(TEMP_PATCHES_EN_DIR, { recursive: true, force: true });
  rmSync(TEMP_PATCHES_PL_DIR, { recursive: true, force: true });
  rmSync(TEMP_PATCHES_DOWNLOAD_DIR, { recursive: true, force: true });

  try {
    mkdirSync(TEMP_PATCHES_EN_DIR, { recursive: true });
    mkdirSync(TEMP_PATCHES_PL_DIR, { recursive: true });
    mkdirSync(TEMP_PATCHES_DOWNLOAD_DIR);
    console.log(chalk.green('✓ Directories prepared'));

    console.log(chalk.cyan(`\n📦 Cloning repository: ${pkg.REPO}`));
    await simpleGit().clone(`https://github.com/${pkg.REPO}`, TEMP_PATCHES_DOWNLOAD_DIR);
    console.log(chalk.green('✓ Repository cloned'));

    console.log(chalk.blue(`\n📁 Copying file types: ${fileTypes.join(', ')}\n`));
    let copiedCount = 0;
    fileTypes.forEach((type) => {
      const typeDir = join(TEMP_PATCHES_DOWNLOAD_DIR, type);
      if (existsSync(typeDir)) {
        console.log(chalk.green(`✓ Copying files from ${type}...`));
        cpSync(typeDir, join(TEMP_PATCHES_EN_DIR, type), { recursive: true });
        cpSync(typeDir, join(TEMP_PATCHES_PL_DIR, type), { recursive: true });
        copiedCount++;
      } else {
        console.log(chalk.yellow(`⚠ Warning: ${type} directory not found`));
      }
    });

    // Clean up download directory
    console.log(chalk.blue('\n🧹 Cleaning up temporary files...'));
    rmSync(TEMP_PATCHES_DOWNLOAD_DIR, { recursive: true, force: true });
    console.log(chalk.green('✓ Cleanup completed'));

    console.log(chalk.green.bold(`\n✓ Download completed successfully (${copiedCount}/${fileTypes.length} types copied)`));
  } catch (error) {
    console.error(chalk.red('\n✗ Error downloading files:'), error);
    process.exit(1);
  }
}
