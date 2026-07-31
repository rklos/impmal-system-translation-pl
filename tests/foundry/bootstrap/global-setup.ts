import type { FullConfig } from '@playwright/test';
import { bootstrapFoundry } from './bootstrap';
import { readFoundryRuntimeName } from './runtime';

export default async function globalSetup(
  _config: FullConfig,
): Promise<() => Promise<void>> {
  const runtime = await bootstrapFoundry(readFoundryRuntimeName());
  return async () => runtime.stop();
}
