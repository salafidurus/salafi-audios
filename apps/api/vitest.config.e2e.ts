import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  oxc: false,
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
    include: ['test/**/*.e2e-spec.ts'],
  },
});
