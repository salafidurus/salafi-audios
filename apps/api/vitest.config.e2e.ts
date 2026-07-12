import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  oxc: false,
  resolve: {
    alias: {
      bun: `${__dirname}/src/test/mocks/bun.mock.ts`,
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  test: {
    globals: true,
    root: './',
    pool: 'forks',
    clearMocks: true,
    retry: 2,
    passWithNoTests: true,
    include: ['test/**/*.e2e-spec.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ['./test/helpers/setup.ts'],
    globalSetup: ['./test/helpers/global-setup.ts'],
  },
});
