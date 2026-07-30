import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { loadFoundryTestConfig } from './config.mjs';

test('loads a valid config and resolves repository-relative paths', async () => {
  const repositoryRoot = await mkdtemp(path.join(os.tmpdir(), 'foundry-config-'));
  const configPath = path.join(repositoryRoot, 'foundry-test.config.json');

  await writeFile(configPath, JSON.stringify({
    foundry: {
      version: '14.365',
    },
    system: {
      id: 'impmal',
      version: '4.0.1',
      manifest: 'https://example.com/impmal/system.json',
    },
    modules: [
      {
        id: 'impmal-system-translation-pl',
        source: 'local',
        path: 'dist',
      },
    ],
    world: {
      id: 'impmal-translation-test',
      title: 'ImpMal Translation Test',
      language: 'pl',
    },
  }));

  try {
    const config = await loadFoundryTestConfig(
      pathToFileURL(configPath),
      repositoryRoot,
    );

    assert.equal(
      config.modules[0].localPath,
      path.join(repositoryRoot, 'dist'),
    );
  } finally {
    await rm(repositoryRoot, { recursive: true, force: true });
  }
});

test('rejects paths that escape the repository', async () => {
  const repositoryRoot = await mkdtemp(path.join(os.tmpdir(), 'foundry-config-'));
  const configPath = path.join(repositoryRoot, 'foundry-test.config.json');

  await writeFile(configPath, JSON.stringify({
    foundry: {
      version: '14.365',
    },
    system: {
      id: 'impmal',
      version: '4.0.1',
      manifest: 'https://example.com/impmal/system.json',
    },
    modules: [
      {
        id: 'impmal-system-translation-pl',
        source: 'local',
        path: '../dist',
      },
    ],
    world: {
      id: 'impmal-translation-test',
      title: 'ImpMal Translation Test',
      language: 'pl',
    },
  }));

  try {
    await assert.rejects(
      loadFoundryTestConfig(pathToFileURL(configPath), repositoryRoot),
      /must stay inside the repository/,
    );
  } finally {
    await rm(repositoryRoot, { recursive: true, force: true });
  }
});

test('rejects unsafe package and world identifiers', async () => {
  const repositoryRoot = await mkdtemp(path.join(os.tmpdir(), 'foundry-config-'));
  const configPath = path.join(repositoryRoot, 'foundry-test.config.json');

  await writeFile(configPath, JSON.stringify({
    foundry: {
      version: '14.365',
    },
    system: {
      id: '../impmal',
      version: '4.0.1',
      manifest: 'https://example.com/impmal/system.json',
    },
    modules: [],
    world: {
      id: '../production-world',
      title: 'ImpMal Translation Test',
      language: 'pl',
    },
  }));

  try {
    await assert.rejects(
      loadFoundryTestConfig(pathToFileURL(configPath), repositoryRoot),
      /system.id must contain only/,
    );
  } finally {
    await rm(repositoryRoot, { recursive: true, force: true });
  }
});

test('rejects a world ID that is not explicitly marked as disposable', async () => {
  const repositoryRoot = await mkdtemp(path.join(os.tmpdir(), 'foundry-config-'));
  const configPath = path.join(repositoryRoot, 'foundry-test.config.json');

  await writeFile(configPath, JSON.stringify({
    foundry: {
      version: '14.365',
    },
    system: {
      id: 'impmal',
      version: '4.0.1',
      manifest: 'https://example.com/impmal/system.json',
    },
    modules: [],
    world: {
      id: 'production-world',
      title: 'ImpMal Translation Test',
      language: 'pl',
    },
  }));

  try {
    await assert.rejects(
      loadFoundryTestConfig(pathToFileURL(configPath), repositoryRoot),
      /world.id must end with -test/,
    );
  } finally {
    await rm(repositoryRoot, { recursive: true, force: true });
  }
});

test('rejects duplicate package IDs', async () => {
  const repositoryRoot = await mkdtemp(path.join(os.tmpdir(), 'foundry-config-'));
  const configPath = path.join(repositoryRoot, 'foundry-test.config.json');

  await writeFile(configPath, JSON.stringify({
    foundry: {
      version: '14.365',
    },
    system: {
      id: 'impmal',
      version: '4.0.1',
      manifest: 'https://example.com/impmal/system.json',
    },
    modules: [
      {
        id: 'babele',
        version: '2.9.1',
        manifest: 'https://example.com/babele/module.json',
      },
      {
        id: 'babele',
        version: '2.9.1',
        manifest: 'https://example.com/babele/module.json',
      },
    ],
    world: {
      id: 'impmal-translation-test',
      title: 'ImpMal Translation Test',
      language: 'pl',
    },
  }));

  try {
    await assert.rejects(
      loadFoundryTestConfig(pathToFileURL(configPath), repositoryRoot),
      /duplicate package ID: babele/,
    );
  } finally {
    await rm(repositoryRoot, { recursive: true, force: true });
  }
});
