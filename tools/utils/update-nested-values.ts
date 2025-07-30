export interface Change {
  path: string;
  old: unknown;
  new: unknown;
}

export function updateNestedValues(
  localObj: Record<string, unknown>,
  remoteObj: Record<string, unknown>,
  path = '',
  changedTranslations: Change[] = [],
): Change[] {
  for (const key in localObj) {
    const currentPath = path ? `${path}.${key}` : key;

    if (typeof localObj[key] === 'object' && localObj[key] !== null) {
      if (remoteObj[key]) {
        updateNestedValues(
          localObj[key] as Record<string, unknown>,
          remoteObj[key] as Record<string, unknown>,
          currentPath,
          changedTranslations,
        );
      }
    } else if (typeof localObj[key] === 'string' && remoteObj[key]) {
      if (localObj[key] !== remoteObj[key]) {
        changedTranslations.push({
          path: currentPath,
          old: localObj[key],
          new: remoteObj[key],
        });
        // eslint-disable-next-line no-param-reassign
        localObj[key] = remoteObj[key];
      }
    }
  }

  return changedTranslations;
}
