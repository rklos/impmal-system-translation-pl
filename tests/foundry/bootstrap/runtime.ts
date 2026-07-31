import {
  mkdir,
  mkdtemp,
  rm,
} from 'node:fs/promises';
import path from 'node:path';
import {
  type StartedTestContainer,
} from 'testcontainers';
import { loadFoundryTestConfig } from '../helpers/config';
import { runCommand } from './command';

export type FoundryRuntimeName = 'devcontainer' | 'testcontainer';

export type StartedFoundryRuntime = {
  baseURL: string;
  stop(): Promise<void>;
};

const ADMIN_PASSWORD = 'impmal-test-admin';
const COMPOSE_FILE = '.devcontainer/compose.yaml';
const FOUNDRY_IMAGE = 'docker.io/felddy/foundryvtt:14.365.0';
const FOUNDRY_PORT = 30_000;

export function readFoundryRuntimeName(): FoundryRuntimeName {
  const runtimeName = process.env.FOUNDRY_TEST_RUNTIME ?? 'testcontainer';
  if (runtimeName !== 'devcontainer' && runtimeName !== 'testcontainer') {
    throw new Error(
      'FOUNDRY_TEST_RUNTIME must be either "devcontainer" or "testcontainer"',
    );
  }
  return runtimeName;
}

export async function prepareFoundryRuntime(
  runtimeName: FoundryRuntimeName,
): Promise<StartedFoundryRuntime> {
  const repositoryRoot = process.cwd();
  process.env.FOUNDRY_ADMIN_PASSWORD = ADMIN_PASSWORD;
  await runCommand('npm', ['run', 'build']);

  if (runtimeName === 'devcontainer') {
    const dataPath = path.join(repositoryRoot, '.foundry/data');
    await preparePackages(repositoryRoot, dataPath);
    const baseURL = `http://127.0.0.1:${FOUNDRY_PORT}`;
    if (await isFoundryReady(baseURL)) {
      return {
        baseURL,
        stop: async () => {},
      };
    }
    if (!process.env.FOUNDRY_LICENSE_KEY) {
      throw new Error(
        'FOUNDRY_LICENSE_KEY must be set before starting the development Foundry runtime',
      );
    }
    await runCommand('docker', [
      'compose',
      '-f',
      COMPOSE_FILE,
      'up',
      '--detach',
      '--wait',
      'workspace',
      'foundry',
    ]);
    return {
      baseURL,
      stop: async () => {},
    };
  }

  const licenseKey = process.env.FOUNDRY_LICENSE_KEY;
  if (!licenseKey) {
    throw new Error(
      'FOUNDRY_LICENSE_KEY must be set before starting an isolated Foundry runtime',
    );
  }
  return startTestcontainer(repositoryRoot, licenseKey);
}

async function isFoundryReady(baseURL: string): Promise<boolean> {
  try {
    const response = await fetch(baseURL, {
      signal: AbortSignal.timeout(2_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function preparePackages(
  repositoryRoot: string,
  dataPath: string,
): Promise<void> {
  await mkdir(dataPath, { recursive: true });
  await runCommand(process.execPath, [
    '.devcontainer/managed/run-package-bootstrap.mjs',
  ], {
    env: {
      ...process.env,
      FOUNDRY_DATA_PATH: dataPath,
      FOUNDRY_REPOSITORY_ROOT: repositoryRoot,
      FOUNDRY_TEST_CONFIG: path.join(
        repositoryRoot,
        '.devcontainer/foundry-test.config.json',
      ),
    },
  });
}

async function startTestcontainer(
  repositoryRoot: string,
  licenseKey: string,
): Promise<StartedFoundryRuntime> {
  const { GenericContainer, Wait } = await import('testcontainers');
  const config = loadFoundryTestConfig();
  const runsRoot = path.join(repositoryRoot, '.foundry/test-runs');
  await mkdir(runsRoot, { recursive: true });
  const dataPath = await mkdtemp(path.join(runsRoot, 'run-'));

  let container: StartedTestContainer | undefined;
  try {
    await preparePackages(repositoryRoot, dataPath);
    const uid = typeof process.getuid === 'function'
      ? String(process.getuid())
      : '1000';
    const gid = typeof process.getgid === 'function'
      ? String(process.getgid())
      : '1000';
    container = await new GenericContainer(FOUNDRY_IMAGE)
      .withHostname('impmal-foundry-v14-test')
      .withEnvironment({
        CONTAINER_CACHE: '/data/container_cache',
        CONTAINER_PRESERVE_CONFIG: 'false',
        FOUNDRY_ADMIN_KEY: ADMIN_PASSWORD,
        FOUNDRY_GID: gid,
        FOUNDRY_HOT_RELOAD: 'true',
        FOUNDRY_IP_DISCOVERY: 'false',
        FOUNDRY_LICENSE_KEY: licenseKey,
        FOUNDRY_MINIFY_STATIC_FILES: 'false',
        FOUNDRY_TELEMETRY: 'false',
        FOUNDRY_UID: uid,
        FOUNDRY_VERSION: config.foundry.version,
      })
      .withBindMounts([
        {
          source: path.join(repositoryRoot, '.foundry/cache'),
          target: '/data/container_cache',
        },
        {
          source: dataPath,
          target: '/data',
        },
      ])
      .withExposedPorts(FOUNDRY_PORT)
      .withWaitStrategy(Wait.forHttp('/', FOUNDRY_PORT))
      .withStartupTimeout(180_000)
      .start();

    const baseURL = `http://${container.getHost()}:${
      container.getMappedPort(FOUNDRY_PORT)
    }`;
    return {
      baseURL,
      stop: async () => {
        await container?.stop({ timeout: 30_000 });
        await rm(dataPath, { recursive: true, force: true });
      },
    };
  } catch (error) {
    await container?.stop({ timeout: 30_000 }).catch(() => undefined);
    await rm(dataPath, { recursive: true, force: true });
    throw error;
  }
}
