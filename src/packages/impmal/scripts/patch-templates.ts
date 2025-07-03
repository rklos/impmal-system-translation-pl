import { log } from '~/utils/log';

export const TEMPLATES_PATCHES: Record<string, Record<string, string>> = {};

export function patchTemplates() {
  Object.keys(TEMPLATES_PATCHES).forEach(async (path) => {
    const originalPath = `systems/impmal/templates/${path}.hbs`;

    let htmlString: string = await new Promise((resolve, reject) => {
      game.socket?.emit('template', originalPath, (resp: { error?: string; html: string }) => {
        if (resp.error) return reject(new Error(resp.error));
        return resolve(resp.html);
      });
    });

    if (path in TEMPLATES_PATCHES) {
      const patches = TEMPLATES_PATCHES[path];
      Object.entries(patches).forEach(([ english, polish ]) => {
        htmlString = htmlString.replaceAll(english, polish);
      });
    }

    const compiled = Handlebars.compile(htmlString);
    Handlebars.registerPartial(originalPath, compiled);

    log(`Overridden template: ${originalPath}`);
  });
}
