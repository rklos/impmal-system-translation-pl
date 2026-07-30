import { loadPatches } from '../../../.vite/load-patches';

export type PatchInventory = {
  scriptIds: string[];
  templatePaths: string[];
};

export function buildPatchInventory(
  patches: Record<string, unknown>,
): PatchInventory {
  const paths = Object.keys(patches);
  return {
    scriptIds: paths
      .filter((patchPath) => patchPath.startsWith('scripts/'))
      .map((patchPath) => patchPath
        .replace('scripts/', '')
        .replace(/\.js$/, ''))
      .sort(),
    templatePaths: paths
      .filter((patchPath) => patchPath.startsWith('templates/'))
      .map((patchPath) => `systems/impmal/${patchPath}`)
      .sort(),
  };
}

export function loadImpmalPatchInventory(): PatchInventory {
  return buildPatchInventory(loadPatches().impmal ?? {});
}
