import * as ts from 'typescript';
import { readdirSync, statSync, unlinkSync, readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import type { Package } from '~/packages';
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

async function tidyUpPackage(pkg: Package): Promise<void> {
  const { TEMP_PATCHES_DIR } = getConstsOfPackage(pkg);

  if (!statSync(TEMP_PATCHES_DIR, { throwIfNoEntry: false })?.isDirectory()) {
    console.log(chalk.yellow(`No temp patches directory found for ${pkg.PACKAGE}`));
    return;
  }

  const jsFiles = findJsFiles(TEMP_PATCHES_DIR);
  
  if (jsFiles.length === 0) {
    console.log(chalk.yellow('No JavaScript files found'));
    return;
  }

  console.log(chalk.blue(`Analyzing ${jsFiles.length} JavaScript file(s)...`));

  let deletedCount = 0;

  for (const file of jsFiles) {
    const filePath = join(TEMP_PATCHES_DIR, file);

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
        console.log(chalk.yellow(`🗑️  Deleted file without strings: ${file}`));
      }
    } catch (error) {
      console.warn(chalk.yellow(`⚠ Error processing file ${file}:`), error);
    }
  }

  if (deletedCount > 0) {
    console.log(chalk.green.bold(`\n✓ Deleted ${deletedCount} file(s) without strings`));
  } else {
    console.log(chalk.green('\n✓ No files to delete (all files contain strings)'));
  }
}

export default async function tidyUp(pkg: Package): Promise<void> {
  console.log(chalk.bold.cyan(`\n🧹 Tidying up package: ${pkg.PACKAGE}\n`));
  await tidyUpPackage(pkg);
}
