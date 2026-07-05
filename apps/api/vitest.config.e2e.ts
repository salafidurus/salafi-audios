import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  resolve: { tsconfigPaths: true },
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
    include: ['test/**/*.e2e-spec.ts'],
  },
});
