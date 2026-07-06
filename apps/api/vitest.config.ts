import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';
import path from 'node:path';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      bun: path.resolve(__dirname, './src/test/mocks/bun.mock.ts'),
    },
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
    oxc: false,
    include: ['src/**/*.spec.ts'],
  },
});
