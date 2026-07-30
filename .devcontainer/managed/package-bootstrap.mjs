import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import {
  installRemotePackage,
  linkLocalModule,
  waitForLocalModuleBuild,
} from './package-installer.mjs';

export async function prepareFoundryPackages({
  config,
  dataPath,
  packageCacheRoot,
  fetchImpl = fetch,
}) {
  const packageDataRoot = path.join(dataPath, 'Data');
  await mkdir(packageDataRoot, { recursive: true });

  await installRemotePackage({
    packageType: 'system',
    packageConfig: config.system,
    dataRoot: packageDataRoot,
    cacheRoot: packageCacheRoot,
    fetchImpl,
  });

  for (const moduleConfig of config.modules) {
    if (moduleConfig.source === 'local') {
      await waitForLocalModuleBuild(moduleConfig);
      await linkLocalModule({
        moduleConfig,
        dataRoot: packageDataRoot,
      });
      continue;
    }

    await installRemotePackage({
      packageType: 'module',
      packageConfig: moduleConfig,
      dataRoot: packageDataRoot,
      cacheRoot: packageCacheRoot,
      fetchImpl,
    });
  }
}
