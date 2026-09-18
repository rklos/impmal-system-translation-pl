import { afterEach, expect, test, vi } from 'vitest';
import { readComposePort, readFoundryRuntimeName } from '../runtime';

afterEach(() => {
  vi.unstubAllEnvs();
});

test('uses the Compose runtime when requested', () => {
  vi.stubEnv('FOUNDRY_TEST_RUNTIME', 'compose');

  expect(readFoundryRuntimeName()).toBe('compose');
});

test('rejects the removed devcontainer runtime name', () => {
  vi.stubEnv('FOUNDRY_TEST_RUNTIME', 'devcontainer');

  expect(() => readFoundryRuntimeName()).toThrow(
    'FOUNDRY_TEST_RUNTIME must be either "compose" or "testcontainer"',
  );
});

test('uses a configured host port for the Compose runtime', () => {
  vi.stubEnv('FOUNDRY_COMPOSE_PORT', '30001');

  expect(readComposePort()).toBe(30001);
});

test('rejects an invalid Compose host port', () => {
  vi.stubEnv('FOUNDRY_COMPOSE_PORT', 'not-a-port');

  expect(() => readComposePort()).toThrow(
    'FOUNDRY_COMPOSE_PORT must be a valid TCP port',
  );
});
