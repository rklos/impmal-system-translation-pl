import type {
  FoundryRuntimeName,
  StartedFoundryRuntime,
} from './runtime';
import { prepareFoundryRuntime } from './runtime';
import { prepareFoundryWorld } from './world';

export async function bootstrapFoundry(
  runtimeName: FoundryRuntimeName,
): Promise<StartedFoundryRuntime> {
  const runtime = await prepareFoundryRuntime(runtimeName);
  process.env.PLAYWRIGHT_TEST_BASE_URL = runtime.baseURL;

  try {
    await prepareFoundryWorld(runtime.baseURL);
    return runtime;
  } catch (error) {
    await runtime.stop();
    throw error;
  }
}
