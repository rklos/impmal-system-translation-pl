import type { Package } from '~/packages';
import {
  mkdirSync,
  existsSync,
  rmSync,
  cpSync,
  readdirSync,
  statSync,
  unlinkSync,
  readFileSync,
} from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { simpleGit } from 'simple-git';
import * as ts from 'typescript';
import config from '../../../../tools.config';
import { getConstsOfPackage } from '../../../utils/consts';
import { hasStringLiteral } from '../../../utils/has-string-literal';

function findJsFiles(dirPath: string, basePath: string = ''): string[] {
  const files: string[] = [];
  const items = readdirSync(dirPath);

  for (const item of items) {
    const fullPath = join(dirPath, item);
    const relativePath = join(basePath, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findJsFiles(fullPath, relativePath));
    } else if (item.endsWith('.js')) {
      files.push(relativePath);
    }
  }

  return files;
}

function tidyUpFiles(tempPatchesDir: string): void {
  console.log(chalk.blue('\n🧹 Tidying up files (removing JS files without strings)...'));

  if (!statSync(tempPatchesDir, { throwIfNoEntry: false })?.isDirectory()) {
    console.log(chalk.yellow('No temp patches directory found'));
    return;
  }

  const jsFiles = findJsFiles(tempPatchesDir);

  if (jsFiles.length === 0) {
    console.log(chalk.yellow('✓ No JavaScript files found'));
    return;
  }

  console.log(chalk.blue(`Analyzing ${jsFiles.length} JavaScript file(s)...`));

  let deletedCount = 0;

  for (const file of jsFiles) {
    const filePath = join(tempPatchesDir, file);

    try {
      const content = readFileSync(filePath, 'utf8');
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true,
      );

      if (!hasStringLiteral(sourceFile)) {
        unlinkSync(filePath);
        deletedCount++;
        console.log(chalk.gray(`  🗑️  Deleted: ${file}`));
      }
    } catch (error) {
      console.warn(chalk.yellow(`  ⚠ Error processing file ${file}:`), error);
    }
  }

  if (deletedCount > 0) {
    console.log(chalk.green(`✓ Deleted ${deletedCount} file(s) without strings`));
  } else {
    console.log(chalk.green('✓ No files to delete (all files contain strings)'));
  }
}

export default async function download(pkg: Package) {
  console.log(chalk.bold.cyan(`\n⬇️  Downloading files for package: ${pkg.PACKAGE}\n`));

  const { TEMP_PATCHES_DOWNLOAD_DIR, TEMP_PATCHES_EN_DIR, TEMP_PATCHES_PL_DIR } = getConstsOfPackage(pkg);

  const fileTypes = config.patch[pkg.PACKAGE as keyof typeof config.patch];
  if (!fileTypes) {
    console.log(chalk.yellow(`No files to download for package ${pkg.PACKAGE}`));
    return;
  }

  console.log(chalk.blue('Preparing directories...'));
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

    // Tidy up files by removing JS files without strings
    const { TEMP_PATCHES_DIR } = getConstsOfPackage(pkg);
    tidyUpFiles(TEMP_PATCHES_DIR);

    // Clean up download directory
    console.log(chalk.blue('\n🧹 Cleaning up temporary files...'));
    rmSync(TEMP_PATCHES_DOWNLOAD_DIR, { recursive: true, force: true });
    console.log(chalk.green('✓ Cleanup completed'));

    console.log(
      chalk.green.bold(`\n✓ Download completed successfully (${copiedCount}/${fileTypes.length} types copied)`),
    );
  } catch (error) {
    console.error(chalk.red('\n✗ Error downloading files:'), error);
    process.exit(1);
  }
}
