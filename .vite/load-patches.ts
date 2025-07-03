import fs from 'fs';
import path from 'path';
import * as diff from 'diff';

export function loadPatches() {
  const patches: Record<string, Record<string, diff.StructuredPatch[]>> = {};

  // Get all package directories
  const packagesDir = path.resolve('src/packages');
  const packageDirs = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  // Load patches for each package
  packageDirs.forEach((pkgName) => {
    const patchesDir = path.join(packagesDir, pkgName, 'patches');

    if (!fs.existsSync(patchesDir)) return;

    patches[pkgName] = {};

    function findDiffFiles(dir: string, relativePath: string = ''): string[] {
      const files: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      entries.forEach((entry) => {
        const fullPath = path.join(dir, entry.name);
        const currentRelativePath = path.join(relativePath, entry.name);

        if (entry.isDirectory()) {
          files.push(...findDiffFiles(fullPath, currentRelativePath));
        } else if (entry.name.endsWith('.diff')) {
          files.push(currentRelativePath);
        }
      });

      return files;
    }

    const diffFiles = findDiffFiles(patchesDir);

    diffFiles.forEach((diffFile) => {
      const fullPath = path.join(patchesDir, diffFile);
      const content = fs.readFileSync(fullPath, 'utf-8');

      const patch = diff.parsePatch(content);
      const index = patch[0]?.index;

      const fileName = (index || diffFile).replace('static/templates/', 'templates/');
      patches[pkgName][fileName] = diff.parsePatch(content);
    });
  });

  return patches;
}

export function injectPatches() {
  const patches = loadPatches();

  return {
    name: 'inject-patches',
    transform(code: string, id: string) {
      if (id.endsWith('apply-patches.ts')) {
        return {
          code: `const INJECTED_PATCHES = ${JSON.stringify(patches)};\n${code}`,
          map: null,
        };
      }
    },
  };
}
