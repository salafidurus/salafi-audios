import './set-env';
import '../../src/shared/utils/env.bootstrap';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

function spawnSeed(script: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn('bun', ['run', script], { stdio: 'inherit' });
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Seed process exited with code ${code}`));
    });
    proc.on('error', reject);
  });
}

export async function setup() {
  const seedScript = fileURLToPath(new URL('./run-seed.ts', import.meta.url));
  await spawnSeed(seedScript);
}
