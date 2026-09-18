import { readFile } from 'node:fs/promises';
import path from 'node:path';

function assertSafeIdentifier(value, fieldName) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(value)) {
    throw new Error(
      `${fieldName} must contain only letters, numbers, underscores, and hyphens`,
    );
  }
}

function resolveInsideRepository(repositoryRoot, relativePath, fieldName) {
  const resolvedPath = path.resolve(repositoryRoot, relativePath);
  const relative = path.relative(repositoryRoot, resolvedPath);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${fieldName} must stay inside the repository`);
  }

  return resolvedPath;
}

export async function loadFoundryTestConfig(configUrl, repositoryRoot) {
  const config = JSON.parse(await readFile(configUrl, 'utf8'));

  assertSafeIdentifier(config.system.id, 'system.id');
  assertSafeIdentifier(config.world.id, 'world.id');
  if (!config.world.id.endsWith('-test')) {
    throw new Error('world.id must end with -test');
  }
  const packageIds = new Set([config.system.id]);
  config.modules.forEach((module) => {
    assertSafeIdentifier(module.id, `modules.${module.id}.id`);
    if (packageIds.has(module.id)) {
      throw new Error(`duplicate package ID: ${module.id}`);
    }
    packageIds.add(module.id);
  });

  return {
    ...config,
    modules: config.modules.map((module) => ({
      ...module,
      ...(module.source === 'local'
        ? {
            localPath: resolveInsideRepository(
              repositoryRoot,
              module.path,
              `modules.${module.id}.path`,
            ),
          }
        : {}),
    })),
  };
}
