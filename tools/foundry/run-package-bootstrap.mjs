import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadFoundryTestConfig } from './config.mjs';
import { prepareFoundryPackages } from './package-bootstrap.mjs';

const repositoryRoot = process.env.FOUNDRY_REPOSITORY_ROOT ?? '/workspace';
const configPath = process.env.FOUNDRY_TEST_CONFIG
  ?? path.join(repositoryRoot, 'tools/foundry/foundry-test.config.json');
const dataPath = process.env.FOUNDRY_DATA_PATH ?? '/data';
const packageCacheRoot = path.join(
  repositoryRoot,
  '.foundry/cache/packages',
);

const config = await loadFoundryTestConfig(
  pathToFileURL(configPath),
  repositoryRoot,
);

await prepareFoundryPackages({
  config,
  dataPath,
  packageCacheRoot,
});
