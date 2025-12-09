import * as diff from 'diff';
import * as fs from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import type { Package } from '~/packages';
import { getConstsOfPackage } from '../../../utils/consts';

interface ApplyOptions {
  common?: boolean;
}

interface CommonTranslations {
  scripts: Record<string, string>;
  templates: Record<string, string>;
}

async function getPatchFiles(pkg: Package): Promise<string[]> {
  const { PATCHES_DIR } = getConstsOfPackage(pkg);
  const patchFiles: string[] = [];

  if (!fs.existsSync(PATCHES_DIR)) {
    console.log(chalk.yellow(`No patches directory found for package ${pkg.PACKAGE}`));
    return patchFiles;
  }

  function scanDirectory(dirPath: string, basePath: string = ''): string[] {
    const files: string[] = [];
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      const relativePath = join(basePath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...scanDirectory(fullPath, relativePath));
      } else if (item.endsWith('.diff')) {
        files.push(relativePath);
      }
    }

    return files;
  }

  return scanDirectory(PATCHES_DIR);
}

async function applyPatchForFile(pkg: Package, patchPath: string): Promise<void> {
  const { PATCHES_DIR, TEMP_PATCHES_PL_DIR } = getConstsOfPackage(pkg);
  const FULL_PATCH_PATH = join(PATCHES_DIR, patchPath);

  try {
    // Read patch content
    const patchContent = fs.readFileSync(FULL_PATCH_PATH, 'utf8');

    // Parse the patch to get the target file path
    const patches = diff.parsePatch(patchContent);

    if (!patches || patches.length === 0) {
      console.warn(chalk.yellow(`Could not parse patch for ${patchPath}`));
      return;
    }

    const targetFilePath = patches[0].index!;
    const targetFullPath = join(TEMP_PATCHES_PL_DIR, targetFilePath);

    // Check if target file exists
    if (!fs.existsSync(targetFullPath)) {
      console.error(chalk.red(`Target file does not exist: ${targetFilePath}`));
      process.exit(1);
    }

    // Read the original file content
    const originalContent = fs.readFileSync(targetFullPath, 'utf8');

    // Apply the patch
    const patchedContent = diff.applyPatch(originalContent, patchContent, { fuzzFactor: 10 });

    if (patchedContent === false) {
      console.error(chalk.red(`Failed to apply patch: ${patchPath}`));
      process.exit(1);
    }

    // Write the patched content back to the file
    fs.writeFileSync(targetFullPath, patchedContent);

    console.log(chalk.green(`✓ Applied patch: ${patchPath}`));
  } catch (error) {
    console.error(chalk.red(`Error applying patch ${patchPath}:`), error);
  }
}

function transformKeyToRegex(key: string): RegExp {
  // First, replace "..." with a placeholder to protect it during escaping
  const withPlaceholder = key.replace(/\.\.\./g, '___CAPTURE___');

  // Escape all special regex characters
  const escaped = withPlaceholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Replace placeholder with the capture group pattern
  const pattern = escaped.replace(/___CAPTURE___/g, '([^\\n}"\'`]+)');

  return new RegExp(pattern, 'g');
}

function applyTranslation(content: string, sourcePattern: string, targetPattern: string): string {
  const regex = transformKeyToRegex(sourcePattern);
  let result = content;

  // Find all matches and their captured groups
  const matches = Array.from(content.matchAll(regex));

  if (matches.length === 0) {
    return content;
  }

  // Replace each match
  for (const match of matches) {
    const fullMatch = match[0];
    const capturedGroups = match.slice(1);

    // Build the replacement by substituting "..." with captured groups
    let replacement = targetPattern;
    for (const group of capturedGroups) {
      replacement = replacement.replace('...', group);
    }

    result = result.replace(fullMatch, replacement);
  }

  return result;
}

async function applyCommonTranslations(pkg: Package): Promise<void> {
  const { PACKAGE_DIR, TEMP_PATCHES_PL_DIR } = getConstsOfPackage(pkg);
  const commonTranslationsPath = join(PACKAGE_DIR, 'patches', 'common-translations.json');

  if (!fs.existsSync(commonTranslationsPath)) {
    console.log(chalk.yellow('No common-translations.json found for this package'));
    return;
  }

  // Load common translations
  const commonTranslations: CommonTranslations = JSON.parse(
    fs.readFileSync(commonTranslationsPath, 'utf8'),
  );

  console.log(chalk.cyan('\nApplying common translations...'));

  // Process scripts
  const scriptsDir = join(TEMP_PATCHES_PL_DIR, 'scripts');
  let scriptUpdatedCount = 0;
  if (fs.existsSync(scriptsDir)) {
    const scriptFiles = fs.readdirSync(scriptsDir).filter((f) => f.endsWith('.js'));
    console.log(chalk.blue(`\nProcessing ${scriptFiles.length} script files...`));

    for (const scriptFile of scriptFiles) {
      const filePath = join(scriptsDir, scriptFile);
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      for (const [ sourcePattern, targetPattern ] of Object.entries(commonTranslations.scripts)) {
        // Skip comments
        if (sourcePattern.startsWith('//')) continue;

        const newContent = applyTranslation(content, sourcePattern, targetPattern);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(chalk.green(`  ✓ ${scriptFile}`));
        scriptUpdatedCount++;
      }
    }
  }

  // Process templates
  const templatesDir = join(TEMP_PATCHES_PL_DIR, 'templates');
  let templateUpdatedCount = 0;
  if (fs.existsSync(templatesDir)) {
    const templateFiles = fs.readdirSync(templatesDir).filter((f) => f.endsWith('.hbs'));
    console.log(chalk.blue(`\nProcessing ${templateFiles.length} template files...`));

    for (const templateFile of templateFiles) {
      const filePath = join(templatesDir, templateFile);
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      for (const [ sourcePattern, targetPattern ] of Object.entries(commonTranslations.templates)) {
        // Skip comments
        if (sourcePattern.startsWith('//')) continue;

        const newContent = applyTranslation(content, sourcePattern, targetPattern);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(chalk.green(`  ✓ ${templateFile}`));
        templateUpdatedCount++;
      }
    }
  }

  console.log(chalk.green.bold(`\n✓ Common translations applied successfully`));
  console.log(chalk.cyan(`  Scripts updated: ${scriptUpdatedCount}`));
  console.log(chalk.cyan(`  Templates updated: ${templateUpdatedCount}`));
  console.log(chalk.cyan(`  Total files updated: ${scriptUpdatedCount + templateUpdatedCount}`));
}

export default async function apply(pkg: Package, options: ApplyOptions = {}): Promise<void> {
  if (options.common) {
    console.log(chalk.bold.cyan(`\n📦 Package: ${pkg.PACKAGE}`));
    await applyCommonTranslations(pkg);
    return;
  }

  console.log(chalk.bold.cyan(`\n📦 Applying patches for package: ${pkg.PACKAGE}`));

  // Get the list of patch files
  const patchFiles = await getPatchFiles(pkg);

  if (patchFiles.length === 0) {
    console.log(chalk.yellow('No patch files found'));
    return;
  }

  console.log(chalk.blue(`Found ${patchFiles.length} patch files\n`));

  // Apply each patch
  for (const patchPath of patchFiles) {
    await applyPatchForFile(pkg, patchPath);
  }

  console.log(chalk.green.bold('\n✓ Patch application completed'));
}
