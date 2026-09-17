import type { FullConfig } from '@playwright/test';
import { bootstrapFoundry } from './bootstrap';
import { logFoundry } from './logging';
import { readFoundryRuntimeName } from './runtime';

export default async function globalSetup(
  _config: FullConfig,
): Promise<() => Promise<void>> {
  const runtime = await bootstrapFoundry(readFoundryRuntimeName());
  logFoundry(
    'Playwright global setup completed. Starting the test suite.',
    'success',
  );
  return async () => {
    logFoundry('Playwright test suite completed. Starting global teardown.');
    await runtime.stop();
  };
}
