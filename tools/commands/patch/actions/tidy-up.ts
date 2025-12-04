import * as ts from 'typescript';
import { readdirSync, statSync, unlinkSync, readFileSync } from 'fs';
import { join } from 'path';
import type { Package } from '~/packages';
import { getConstsOfPackage } from '../../../utils/consts';

function hasStringLiteral(sourceFile: ts.SourceFile): boolean {
  let hasString = false;

  function visit(node: ts.Node) {
    if (hasString) return;

    if (ts.isStringLiteral(node) || ts.isTemplateExpression(node)) {
      hasString = true;
      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return hasString;
}

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
    return;
  }

  const jsFiles = findJsFiles(TEMP_PATCHES_DIR);
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
        console.log(`Deleted file without strings: ${file}`);
      }
    } catch (error) {
      console.warn(`Error processing file ${file}:`, error);
    }
  }

  if (deletedCount > 0) {
    console.log(`Package ${pkg.PACKAGE}: Deleted ${deletedCount} file(s) without strings`);
  } else {
    console.log(`Package ${pkg.PACKAGE}: No files to delete`);
  }
}

export default async function tidyUp(pkg: Package): Promise<void> {
  await tidyUpPackage(pkg);
}
