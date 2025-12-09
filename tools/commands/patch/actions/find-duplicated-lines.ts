import * as ts from 'typescript';
import { readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import type { Package } from '~/packages';
import { getConstsOfPackage } from '../../../utils/consts';

interface LineLocation {
  file: string;
  lineNumber: number;
  lineContent: string;
}

interface CommonLineReport {
  lineContent: string;
  count: number;
  locations: LineLocation[];
}

function lineContainsString(lineContent: string): boolean {
  try {
    // Create a temporary source file to parse the line
    const sourceFile = ts.createSourceFile(
      'temp.js',
      lineContent,
      ts.ScriptTarget.Latest,
      true,
    );

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
  } catch {
    // If parsing fails, use a simple regex as fallback
    return /["'`]/.test(lineContent);
  }
}

function extractLinesFromJs(filePath: string, relativePath: string): LineLocation[] {
  const locations: LineLocation[] = [];
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const lineContent = lines[i].trim();

    // Skip empty lines and comments
    if (lineContent.length === 0 || lineContent.startsWith('//') || lineContent.startsWith('/*')) {
      continue;
    }

    // Check if the line contains at least one string
    if (lineContainsString(lineContent)) {
      locations.push({
        file: relativePath,
        lineNumber: i + 1, // Convert to 1-based line numbers
        lineContent,
      });
    }
  }

  return locations;
}

function findJsFiles(dirPath: string, basePath: string = ''): string[] {
  const files: string[] = [];

  if (!statSync(dirPath, { throwIfNoEntry: false })?.isDirectory()) {
    return files;
  }

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

async function findDuplicatedLinesInPackage(pkg: Package): Promise<void> {
  const { TEMP_PATCHES_EN_DIR } = getConstsOfPackage(pkg);

  if (!statSync(TEMP_PATCHES_EN_DIR, { throwIfNoEntry: false })?.isDirectory()) {
    console.log(`Package ${pkg.PACKAGE}: No temp/patches/en directory found`);
    return;
  }

  const scriptsDir = join(TEMP_PATCHES_EN_DIR, 'scripts');

  if (!statSync(scriptsDir, { throwIfNoEntry: false })?.isDirectory()) {
    console.log(`Package ${pkg.PACKAGE}: No scripts directory found in temp/patches/en`);
    return;
  }

  const jsFiles = findJsFiles(scriptsDir);

  if (jsFiles.length === 0) {
    console.log(`Package ${pkg.PACKAGE}: No JavaScript files found`);
    return;
  }

  console.log(chalk.bold.blue(`\n=== Analyzing ${pkg.PACKAGE} ===`));
  console.log(chalk.gray(`Found ${jsFiles.length} JavaScript files in temp/patches/en/scripts`));

  // Collect all lines and their locations
  const lineMap = new Map<string, LineLocation[]>();

  for (const file of jsFiles) {
    const filePath = join(scriptsDir, file);
    const locations = extractLinesFromJs(filePath, file);

    for (const location of locations) {
      const existing = lineMap.get(location.lineContent) || [];
      existing.push(location);
      lineMap.set(location.lineContent, existing);
    }
  }

  // Find common lines (lines that appear at least twice)
  const commonLines: CommonLineReport[] = [];

  for (const [ lineContent, locations ] of lineMap.entries()) {
    if (locations.length >= 2) {
      commonLines.push({
        lineContent,
        count: locations.length,
        locations: locations.sort((a, b) => {
          const fileCompare = a.file.localeCompare(b.file);
          return fileCompare !== 0 ? fileCompare : a.lineNumber - b.lineNumber;
        }),
      });
    }
  }

  // Sort common lines by count (descending)
  commonLines.sort((a, b) => b.count - a.count);

  // Report results
  if (commonLines.length === 0) {
    console.log(`Package ${pkg.PACKAGE}: No common lines found`);
    return;
  }

  console.log(chalk.bold.green(`\nPackage ${pkg.PACKAGE}: Found ${commonLines.length} common lines of code\n`));

  for (const common of commonLines) {
    console.log(chalk.cyan(`\n${common.lineContent}`));
    console.log(chalk.yellow(`(${common.count} occurrences):`));
    for (const location of common.locations) {
      console.log(
        chalk.dim(`  - ./src/packages/${pkg.PACKAGE}/temp/patches/en/scripts/${location.file}:${location.lineNumber}`),
      );
    }
  }

  // Summary statistics
  const totalOccurrences = commonLines.reduce((sum, d) => sum + d.count, 0);
  console.log(chalk.bold.green('\n--- Summary ---'));
  console.log(chalk.green(`Total unique common lines: ${commonLines.length}`));
  console.log(chalk.green(`Total occurrences: ${totalOccurrences}`));
}

export default async function findDuplicatedLines(pkg: Package): Promise<void> {
  await findDuplicatedLinesInPackage(pkg);
}
