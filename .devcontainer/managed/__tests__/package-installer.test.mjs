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
import { promisify } from 'node:util';
import { expect, test } from 'vitest';
import {
  assertPackageManifest,
  installRemotePackage,
  linkLocalModule,
  waitForLocalModuleBuild,
} from '../package-installer.mjs';

const execFileAsync = promisify(execFile);

test('rejects a manifest whose package ID does not match the config', () => {
  expect(
    () => assertPackageManifest(
      {
        id: 'different-system',
        version: '4.0.1',
        download: 'https://example.com/impmal.zip',
      },
      {
        id: 'impmal',
        version: '4.0.1',
      },
      'system',
    ),
  ).toThrow(/expected package ID impmal, received different-system/);
});

test('rejects a manifest whose version does not match the config', () => {
  expect(
    () => assertPackageManifest(
      {
        id: 'impmal',
        version: '4.1.0',
        download: 'https://example.com/impmal.zip',
      },
      {
        id: 'impmal',
        version: '4.0.1',
      },
      'system',
    ),
  ).toThrow(/expected impmal version 4.0.1, received 4.1.0/);
});

test('rejects a manifest without an HTTPS download URL', () => {
  expect(
    () => assertPackageManifest(
      {
        id: 'impmal',
        version: '4.0.1',
        download: 'http://example.com/impmal.zip',
      },
      {
        id: 'impmal',
        version: '4.0.1',
      },
      'system',
    ),
  ).toThrow(/download URL must use HTTPS/);
});

test('installs the exact remote package into its Foundry data directory', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'foundry-package-'));
  const sourceRoot = path.join(root, 'source');
  const sourceDirectory = path.join(sourceRoot, 'module');
  const archivePath = path.join(root, 'impmal.zip');
  const dataRoot = path.join(root, 'data');
  const cacheRoot = path.join(root, 'cache');
  const manifest = {
    id: 'impmal',
    version: '4.0.1',
    download: 'https://packages.example/impmal.zip',
  };

  await mkdir(sourceDirectory, { recursive: true });
  await writeFile(
    path.join(sourceDirectory, 'system.json'),
    JSON.stringify(manifest),
  );
  await writeFile(path.join(sourceDirectory, 'marker.txt'), 'installed');
  await execFileAsync(
    'zip',
    ['-q', '-r', archivePath, 'module'],
    { cwd: sourceRoot },
  );

  const archive = await readFile(archivePath);
  const fetchPackage = async (url) => {
    if (url === 'https://packages.example/system.json') {
      return new Response(JSON.stringify(manifest), {
        headers: { 'content-type': 'application/json' },
      });
    }

    if (url === manifest.download) {
      return new Response(archive);
    }

    return new Response('Not found', { status: 404 });
  };

  try {
    await installRemotePackage({
      packageType: 'system',
      packageConfig: {
        id: 'impmal',
        version: '4.0.1',
        manifest: 'https://packages.example/system.json',
      },
      dataRoot,
      cacheRoot,
      fetchImpl: fetchPackage,
    });

    expect(
      await readFile(path.join(dataRoot, 'systems/impmal/marker.txt'), 'utf8'),
    ).toBe('installed');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('links the built local module into the Foundry data directory', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'foundry-module-'));
  const localPath = path.join(root, 'dist');
  const dataRoot = path.join(root, 'data');
  const targetPath = path.join(
    dataRoot,
    'modules/impmal-system-translation-pl',
  );

  await mkdir(localPath);
  await writeFile(
    path.join(localPath, 'module.json'),
    JSON.stringify({
      id: 'impmal-system-translation-pl',
      version: '3.0.0-alpha',
    }),
  );

  try {
    await linkLocalModule({
      moduleConfig: {
        id: 'impmal-system-translation-pl',
        localPath,
      },
      dataRoot,
    });

    expect((await lstat(targetPath)).isSymbolicLink()).toBe(true);
    expect(await readlink(targetPath)).toBe(localPath);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('reports which local module did not finish building', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'foundry-module-'));

  try {
    await expect(
      waitForLocalModuleBuild(
        {
          id: 'impmal-system-translation-pl',
          localPath: path.join(root, 'dist'),
        },
        {
          timeoutMs: 0,
          pollIntervalMs: 1,
        },
      ),
    ).rejects.toThrow(
      /Timed out waiting for local module impmal-system-translation-pl/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
