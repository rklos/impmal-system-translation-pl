import * as fs from 'fs';
import * as ts from 'typescript';
import { join } from 'path';
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
  const { TEMP_PATCHES_PL_DIR } = getConstsOfPackage(pkg);
  const scriptsDir = join(TEMP_PATCHES_PL_DIR, 'scripts');

  if (!fs.existsSync(scriptsDir)) {
    console.log(`No scripts directory found for package ${pkg.PACKAGE}`);
    return;
  }

  const scriptFiles = scanScriptsDirectory(scriptsDir);

  if (scriptFiles.length === 0) {
    console.log(`No script files found in ${scriptsDir}`);
    return;
  }

  console.log(`\nValidating ${scriptFiles.length} script files in ${pkg.PACKAGE}...`);

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
    console.log(`✓ All ${scriptFiles.length} files passed validation`);
  } else {
    console.error(`\n✗ Found ${errorCount} error(s) in ${filesWithErrors.length} file(s):\n`);

    for (const { file, errors } of filesWithErrors) {
      console.error(`\n${file}:`);

      for (const error of errors) {
        if (error.file) {
          const { line, character } = error.file.getLineAndCharacterOfPosition(error.start || 0);
          const message = ts.flattenDiagnosticMessageText(error.messageText, '\n');
          console.error(`  Line ${line + 1}, Column ${character + 1}: ${message}`);
        } else {
          const message = ts.flattenDiagnosticMessageText(error.messageText, '\n');
          console.error(`  ${message}`);
        }
      }
    }

    process.exitCode = 1;
  }
}
