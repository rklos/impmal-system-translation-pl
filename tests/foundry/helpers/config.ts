import { readFileSync } from 'node:fs';
import path from 'node:path';

export type RemotePackageConfig = {
  id: string;
  version: string;
  manifest: string;
};

export type LocalModuleConfig = {
  id: string;
  source: 'local';
  path: string;
};

export type FoundryTestConfig = {
  foundry: {
    version: string;
  };
  system: RemotePackageConfig;
  modules: Array<RemotePackageConfig | LocalModuleConfig>;
  world: {
    id: string;
    title: string;
    language: string;
  };
};

export function loadFoundryTestConfig(): FoundryTestConfig {
  const configPath = path.resolve(
    process.cwd(),
    '.devcontainer/foundry-test.config.json',
  );

  return JSON.parse(readFileSync(configPath, 'utf8')) as FoundryTestConfig;
}

export function loadLocalModuleVersion(): string {
  const manifestPath = path.resolve(process.cwd(), 'src/module.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    version: string;
  };

  return manifest.version;
}

export function isRemotePackage(
  packageConfig: RemotePackageConfig | LocalModuleConfig,
): packageConfig is RemotePackageConfig {
  return !('source' in packageConfig);
}
