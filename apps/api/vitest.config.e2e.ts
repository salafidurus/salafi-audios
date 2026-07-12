import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import path from 'node:path';

const isBun = typeof process.versions.bun !== 'undefined';

export default defineConfig({
  oxc: false,
  resolve: {
    tsconfigPaths: true,
    alias: isBun
      ? []
      : [
          {
            find: /^bun$/,
            replacement: path.resolve(__dirname, './src/test/mocks/bun.mock.ts'),
          },
        ],
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  test: {
    globals: true,
    environment: 'node',
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
