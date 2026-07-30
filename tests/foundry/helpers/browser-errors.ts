import type { ConsoleMessage, Page } from '@playwright/test';

export type BrowserDiagnostic = {
  kind: 'console' | 'pageerror';
  level?: string;
  message: string;
  source: string;
  stack: string;
};

export class BrowserErrorMonitor {
  private readonly diagnostics: BrowserDiagnostic[] = [];

  private readonly pending: Promise<void>[] = [];

  public constructor(page: Page) {
    page.on('pageerror', (error) => {
      this.diagnostics.push({
        kind: 'pageerror',
        message: error.message,
        source: '',
        stack: error.stack ?? '',
      });
    });
    page.on('console', (message) => {
      if (
        message.type() !== 'error'
        && !message.text().includes('IMPMAL-PL Failed')
      ) {
        return;
      }
      this.pending.push(this.captureConsoleMessage(message));
    });
  }

  public async complete(): Promise<BrowserDiagnostic[]> {
    await Promise.all(this.pending);
    return [...this.diagnostics];
  }

  private async captureConsoleMessage(message: ConsoleMessage): Promise<void> {
    const location = message.location();
    const source = location.url
      ? `${location.url}:${location.lineNumber}:${location.columnNumber}`
      : '';
    const stacks = await Promise.all(message.args().map(async (argument) => {
      try {
        return await argument.evaluate((value) => {
          if (value instanceof Error) {
            return value.stack ?? value.message;
          }
          if (
            value
            && typeof value === 'object'
            && 'stack' in value
            && typeof value.stack === 'string'
          ) {
            return value.stack;
          }
          return '';
        });
      } catch {
        return '';
      }
    }));

    this.diagnostics.push({
      kind: 'console',
      level: message.type(),
      message: message.text(),
      source,
      stack: stacks.filter(Boolean).join('\n'),
    });
  }
}

const MODULE_MARKERS = [
  '/modules/impmal-system-translation-pl/',
  'impmal-pl.js',
];

export function isModuleBrowserFailure(
  diagnostic: BrowserDiagnostic,
): boolean {
  if (diagnostic.message.includes('IMPMAL-PL Failed')) {
    return true;
  }
  if (diagnostic.kind === 'console' && diagnostic.level !== 'error') {
    return false;
  }

  const evidence = [
    diagnostic.message,
    diagnostic.source,
    diagnostic.stack,
  ].join('\n');
  return MODULE_MARKERS.some((marker) => evidence.includes(marker));
}
