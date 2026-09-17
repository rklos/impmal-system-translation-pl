import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, expect, test, vi } from 'vitest';
import { loadFoundryEnvironment } from '../environment';

afterEach(() => {
  vi.unstubAllEnvs();
});

test('loads the Foundry license key from an environment file', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'impmal-pl-'));
  const environmentPath = path.join(directory, '.env');
  await writeFile(environmentPath, 'FOUNDRY_LICENSE_KEY=from-env-file\n');
  vi.stubEnv('FOUNDRY_LICENSE_KEY', '');

  try {
    loadFoundryEnvironment(environmentPath);

    expect(process.env.FOUNDRY_LICENSE_KEY).toBe('from-env-file');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('keeps a Foundry license key supplied by the shell', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'impmal-pl-'));
  const environmentPath = path.join(directory, '.env');
  await writeFile(environmentPath, 'FOUNDRY_LICENSE_KEY=from-env-file\n');
  vi.stubEnv('FOUNDRY_LICENSE_KEY', 'from-shell');

  try {
    loadFoundryEnvironment(environmentPath);

    expect(process.env.FOUNDRY_LICENSE_KEY).toBe('from-shell');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
