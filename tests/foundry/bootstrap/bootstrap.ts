import type {
  FoundryRuntimeName,
  StartedFoundryRuntime,
} from './runtime';
import { logFoundry } from './logging';
import { prepareFoundryRuntime } from './runtime';
import { prepareFoundryWorld } from './world';

export async function bootstrapFoundry(
  runtimeName: FoundryRuntimeName,
): Promise<StartedFoundryRuntime> {
  const runtime = await prepareFoundryRuntime(runtimeName);
  process.env.PLAYWRIGHT_TEST_BASE_URL = runtime.baseURL;

  try {
    logFoundry('Starting the shared Foundry world bootstrap.');
    await prepareFoundryWorld(runtime.baseURL);
    logFoundry('Shared Foundry world bootstrap completed.', 'success');
    return runtime;
  } catch (error) {
    logFoundry(
      'Foundry world bootstrap failed. Starting runtime cleanup.',
      'error',
    );
    await runtime.stop();
    throw error;
  }
}
