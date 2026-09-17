import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import path from 'node:path';

export function loadFoundryEnvironment(
  environmentPath = path.resolve(process.cwd(), '.env'),
): void {
  if (process.env.FOUNDRY_LICENSE_KEY || !existsSync(environmentPath)) {
    return;
  }

  delete process.env.FOUNDRY_LICENSE_KEY;
  loadEnvFile(environmentPath);
}
