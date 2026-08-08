import { config as dotenvConfig } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

/** Walk up from cwd to find monorepo root .env */
export function loadRootEnv(): void {
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    const envPath = resolve(dir, '.env');
    if (existsSync(envPath)) {
      dotenvConfig({ path: envPath });
      return;
    }
    dir = resolve(dir, '..');
  }
  dotenvConfig();
}
