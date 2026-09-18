import { execFile } from 'node:child_process';
import {
  access,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const PACKAGE_DIRECTORIES = {
  module: {
    directory: 'modules',
    manifest: 'module.json',
  },
  system: {
    directory: 'systems',
    manifest: 'system.json',
  },
};

export function assertPackageManifest(manifest, expectedPackage, packageType) {
  if (manifest.id !== expectedPackage.id) {
    throw new Error(
      `${packageType}: expected package ID ${expectedPackage.id}, received ${manifest.id}`,
    );
  }

  if (manifest.version !== expectedPackage.version) {
    throw new Error(
      `${packageType}: expected ${expectedPackage.id} version ${expectedPackage.version}, received ${manifest.version}`,
    );
  }

  let downloadUrl;
  try {
    downloadUrl = new URL(manifest.download);
  } catch {
    throw new Error(`${packageType}: download URL must use HTTPS`);
  }

  if (downloadUrl.protocol !== 'https:') {
    throw new Error(`${packageType}: download URL must use HTTPS`);
  }
}

async function fetchRequired(fetchImpl, url, description) {
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(
      `Failed to download ${description}: HTTP ${response.status} ${response.statusText}`,
    );
  }
  return response;
}

async function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return undefined;
    }
    throw error;
  }
}

async function findExtractedPackage(
  extractionRoot,
  packageId,
  manifestName,
) {
  const directManifest = path.join(extractionRoot, manifestName);
  try {
    await access(directManifest);
    return extractionRoot;
  } catch {
    const entries = await readdir(extractionRoot, { withFileTypes: true });
    const candidateNames = [
      packageId,
      ...entries
        .filter((entry) => entry.isDirectory() && entry.name !== packageId)
        .map((entry) => entry.name),
    ];

    for (const candidateName of candidateNames) {
      const candidateRoot = path.join(extractionRoot, candidateName);
      try {
        await access(path.join(candidateRoot, manifestName));
        return candidateRoot;
      } catch {
        continue;
      }
    }

    throw new Error(
      `Archive for ${packageId} does not contain ${manifestName} at its root or in a top-level directory`,
    );
  }
}

export async function installRemotePackage({
  packageType,
  packageConfig,
  dataRoot,
  cacheRoot,
  fetchImpl = fetch,
}) {
  const layout = PACKAGE_DIRECTORIES[packageType];
  if (!layout) {
    throw new Error(`Unsupported Foundry package type: ${packageType}`);
  }

  const packageRoot = path.join(dataRoot, layout.directory);
  const targetDirectory = path.join(packageRoot, packageConfig.id);
  const targetManifestPath = path.join(targetDirectory, layout.manifest);
  const installedManifest = await readJsonIfPresent(targetManifestPath);

  if (installedManifest?.version === packageConfig.version) {
    assertPackageManifest(installedManifest, packageConfig, packageType);
    return;
  }

  const manifestResponse = await fetchRequired(
    fetchImpl,
    packageConfig.manifest,
    `${packageConfig.id} manifest`,
  );
  const manifest = await manifestResponse.json();
  assertPackageManifest(manifest, packageConfig, packageType);

  await mkdir(cacheRoot, { recursive: true });
  await mkdir(packageRoot, { recursive: true });

  const archivePath = path.join(
    cacheRoot,
    `${packageConfig.id}-${packageConfig.version}.zip`,
  );
  const archiveResponse = await fetchRequired(
    fetchImpl,
    manifest.download,
    `${packageConfig.id} archive`,
  );
  await writeFile(archivePath, Buffer.from(await archiveResponse.arrayBuffer()));

  const extractionRoot = await mkdtemp(
    path.join(packageRoot, `.install-${packageConfig.id}-`),
  );

  try {
    await execFileAsync(
      'unzip',
      ['-q', '-o', archivePath, '-d', extractionRoot],
    );

    const extractedPackage = await findExtractedPackage(
      extractionRoot,
      packageConfig.id,
      layout.manifest,
    );
    const extractedManifest = JSON.parse(
      await readFile(path.join(extractedPackage, layout.manifest), 'utf8'),
    );
    assertPackageManifest(extractedManifest, packageConfig, packageType);

    await rm(targetDirectory, { recursive: true, force: true });
    await rename(extractedPackage, targetDirectory);
  } finally {
    await rm(extractionRoot, { recursive: true, force: true });
  }
}

export async function installLocalModule({
  moduleConfig,
  dataRoot,
}) {
  const localManifestPath = path.join(moduleConfig.localPath, 'module.json');
  const localManifest = JSON.parse(await readFile(localManifestPath, 'utf8'));

  if (localManifest.id !== moduleConfig.id) {
    throw new Error(
      `local module: expected package ID ${moduleConfig.id}, received ${localManifest.id}`,
    );
  }

  const modulesRoot = path.join(dataRoot, 'modules');
  const targetDirectory = path.join(modulesRoot, moduleConfig.id);

  await mkdir(modulesRoot, { recursive: true });
  await rm(targetDirectory, { recursive: true, force: true });
  await cp(moduleConfig.localPath, targetDirectory, { recursive: true });
}

export async function waitForLocalModuleBuild(
  moduleConfig,
  {
    timeoutMs = 120_000,
    pollIntervalMs = 1_000,
  } = {},
) {
  const manifestPath = path.join(moduleConfig.localPath, 'module.json');
  const deadline = Date.now() + timeoutMs;

  while (true) {
    try {
      await access(manifestPath);
      return;
    } catch {
      if (Date.now() >= deadline) {
        throw new Error(
          `Timed out waiting for local module ${moduleConfig.id}: ${manifestPath}`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }
  }
}
