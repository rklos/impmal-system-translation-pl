import * as fs from 'fs';
import * as ts from 'typescript';
import { join } from 'path';
import chalk from 'chalk';
import type { Package } from '~/packages';
import { getConstsOfPackage } from '../../../utils/consts';

function scanScriptsDirectory(dirPath: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dirPath)) {
    return files;
  }

  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...scanScriptsDirectory(fullPath));
    } else if (item.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

function validateFile(filePath: string): { hasErrors: boolean; errors: ts.Diagnostic[] } {
  const content = fs.readFileSync(filePath, 'utf8');

  // Create source file and check for parse errors
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );

  // Check if the source file has parse errors by examining its parseDiagnostics
  // TypeScript's createSourceFile doesn't directly expose parse errors,
  // so we'll use a Program to get diagnostics
  const host: ts.CompilerHost = {
    getSourceFile: (fileName) => {
      if (fileName === filePath) {
        return sourceFile;
      }
      return undefined;
    },
    writeFile: () => {},
    getCurrentDirectory: () => process.cwd(),
    getDirectories: () => [],
    fileExists: (fileName) => fileName === filePath,
    readFile: (fileName) => {
      if (fileName === filePath) {
        return content;
      }
      return undefined;
    },
    getCanonicalFileName: (fileName) => fileName,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
    getDefaultLibFileName: () => 'lib.d.ts',
  };

  const program = ts.createProgram([ filePath ], {
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
    allowJs: true,
    checkJs: false,
    noEmit: true,
    skipLibCheck: true,
  }, host);

  const diagnostics = ts.getPreEmitDiagnostics(program);

  // Filter to only errors from this file
  const fileErrors = diagnostics.filter(
    (diagnostic) => diagnostic.file?.fileName === filePath
      && diagnostic.category === ts.DiagnosticCategory.Error,
  );

  return {
    hasErrors: fileErrors.length > 0,
    errors: fileErrors,
  };
}

export default async function validate(pkg: Package): Promise<void> {
  console.log(chalk.bold.cyan(`\n🔍 Validating patches for package: ${pkg.PACKAGE}\n`));

  const { TEMP_PATCHES_PL_DIR } = getConstsOfPackage(pkg);
  const scriptsDir = join(TEMP_PATCHES_PL_DIR, 'scripts');

  if (!fs.existsSync(scriptsDir)) {
    console.log(chalk.yellow(`No scripts directory found for package ${pkg.PACKAGE}`));
    return;
  }

  const scriptFiles = scanScriptsDirectory(scriptsDir);

  if (scriptFiles.length === 0) {
    console.log(chalk.yellow(`No script files found in ${scriptsDir}`));
    return;
  }

  console.log(chalk.blue(`Validating ${scriptFiles.length} script file(s)...\n`));

  let errorCount = 0;
  const filesWithErrors: Array<{ file: string; errors: ts.Diagnostic[] }> = [];

  for (const filePath of scriptFiles) {
    const { hasErrors, errors } = validateFile(filePath);

    if (hasErrors) {
      errorCount += errors.length;
      const relativePath = filePath.replace(process.cwd(), '').replace(/^\//, '');
      filesWithErrors.push({ file: relativePath, errors });
    }
  }

  if (filesWithErrors.length === 0) {
    console.log(chalk.green.bold(`✓ All ${scriptFiles.length} file(s) passed validation`));
  } else {
    console.error(chalk.red.bold(`\n✗ Found ${errorCount} error(s) in ${filesWithErrors.length} file(s):\n`));

    for (const { file, errors } of filesWithErrors) {
      console.error(chalk.red(`\n📄 ${file}:`));

      for (const error of errors) {
        if (error.file) {
          const { line, character } = error.file.getLineAndCharacterOfPosition(error.start || 0);
          const message = ts.flattenDiagnosticMessageText(error.messageText, '\n');
          console.error(chalk.yellow(`  ⚠ Line ${line + 1}, Column ${character + 1}: ${message}`));
        } else {
          const message = ts.flattenDiagnosticMessageText(error.messageText, '\n');
          console.error(chalk.yellow(`  ⚠ ${message}`));
        }
      }
    }

    console.error(chalk.red.bold('\n✗ Validation failed'));
    process.exitCode = 1;
  }
}
