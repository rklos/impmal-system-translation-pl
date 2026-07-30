import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readlink,
  rm,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';
import { prepareFoundryPackages } from './package-bootstrap.mjs';

const execFileAsync = promisify(execFile);

test('prepares every configured Foundry package', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'foundry-bootstrap-'));
  const sourceDirectory = path.join(root, 'source');
  const moduleSourceDirectory = path.join(root, 'module-source');
  const archivePath = path.join(root, 'impmal.zip');
  const moduleArchivePath = path.join(root, 'warhammer-lib.zip');
  const dataPath = path.join(root, 'data');
  const packageCacheRoot = path.join(root, 'cache');
  const localPath = path.join(root, 'dist');
  const remoteManifest = {
    id: 'impmal',
    version: '4.0.1',
    download: 'https://packages.example/impmal.zip',
  };
  const remoteModuleManifest = {
    id: 'warhammer-lib',
    version: '3.3.2',
    download: 'https://packages.example/warhammer-lib.zip',
  };

  await mkdir(sourceDirectory);
  await mkdir(moduleSourceDirectory);
  await mkdir(localPath);
  await writeFile(
    path.join(sourceDirectory, 'system.json'),
    JSON.stringify(remoteManifest),
  );
  await writeFile(path.join(sourceDirectory, 'marker.txt'), 'installed');
  await execFileAsync(
    'zip',
    ['-q', archivePath, 'system.json', 'marker.txt'],
    { cwd: sourceDirectory },
  );
  await writeFile(
    path.join(moduleSourceDirectory, 'module.json'),
    JSON.stringify(remoteModuleManifest),
  );
  await writeFile(
    path.join(moduleSourceDirectory, 'module-marker.txt'),
    'module installed',
  );
  await execFileAsync(
    'zip',
    ['-q', moduleArchivePath, 'module.json', 'module-marker.txt'],
    { cwd: moduleSourceDirectory },
  );
  await writeFile(
    path.join(localPath, 'module.json'),
    JSON.stringify({ id: 'impmal-system-translation-pl' }),
  );

  const archive = await readFile(archivePath);
  const moduleArchive = await readFile(moduleArchivePath);
  const fetchPackage = async (url) => {
    if (url === 'https://packages.example/system.json') {
      return new Response(JSON.stringify(remoteManifest));
    }
    if (url === remoteManifest.download) {
      return new Response(archive);
    }
    if (url === 'https://packages.example/module.json') {
      return new Response(JSON.stringify(remoteModuleManifest));
    }
    if (url === remoteModuleManifest.download) {
      return new Response(moduleArchive);
    }
    return new Response('Not found', { status: 404 });
  };

  try {
    await prepareFoundryPackages({
      config: {
        system: {
          id: 'impmal',
          version: '4.0.1',
          manifest: 'https://packages.example/system.json',
        },
        modules: [
          {
            id: 'warhammer-lib',
            version: '3.3.2',
            manifest: 'https://packages.example/module.json',
          },
          {
            id: 'impmal-system-translation-pl',
            source: 'local',
            localPath,
          },
        ],
      },
      dataPath,
      packageCacheRoot,
      fetchImpl: fetchPackage,
    });

    assert.equal(
      await readFile(path.join(dataPath, 'Data/systems/impmal/marker.txt'), 'utf8'),
      'installed',
    );
    assert.equal(
      await readFile(
        path.join(
          dataPath,
          'Data/modules/warhammer-lib/module-marker.txt',
        ),
        'utf8',
      ),
      'module installed',
    );
    const localModulePath = path.join(
      dataPath,
      'Data/modules/impmal-system-translation-pl',
    );
    assert.equal((await lstat(localModulePath)).isSymbolicLink(), true);
    assert.equal(await readlink(localModulePath), localPath);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
