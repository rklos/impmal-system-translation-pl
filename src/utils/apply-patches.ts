import { log } from '~/utils/log';
import type { StructuredPatch } from 'diff';
import { applyPatch } from 'diff';

declare const INJECTED_PATCHES: Record<string, Record<string, StructuredPatch[]>>;

function patchTemplates(pkgName: string) {
  const TEMPLATES_PATCHES = Object.fromEntries(
    Object.entries(INJECTED_PATCHES[pkgName])
      .filter(([ p ]) => p.startsWith('templates/')),
  );

  Object.entries(TEMPLATES_PATCHES).forEach(async ([ p, diffs ]) => {
    const path = p.replace('templates/', '');
    const originalPath = `systems/${pkgName}/templates/${path}`;

    let htmlString: string = await new Promise((resolve, reject) => {
      game.socket?.emit('template', originalPath, (resp: { error?: string; html: string }) => {
        if (resp.error) return reject(new Error(resp.error));
        return resolve(resp.html);
      });
    });

    Object.values(diffs).forEach((diff) => {
      const patchedHtml = applyPatch(htmlString, diff);
      if (!patchedHtml) {
        log(`Failed to apply patch to ${originalPath}`);
        return;
      }
      htmlString = patchedHtml;
    });

    const compiled = Handlebars.compile(htmlString);
    Handlebars.registerPartial(originalPath, compiled);

    log(`Overridden template: ${originalPath}`);
  });
}

export function applyPatches(pkgName: string) {
  patchTemplates(pkgName);
}
