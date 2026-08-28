import { beforeEach } from 'bun:test';

/** Establishes shared environment defaults and mock lifecycle hooks for API tests. */
process.env.NEON_API_KEY ??= 'test-neon-api-key';
process.env.NEON_PROJECT_ID ??= 'test-project';
process.env.NEON_ENDPOINT_ID ??= 'ep-test-endpoint';

// Shared mock shape used by API unit tests.
/** Adds Bun mock helpers to each member of a test double while preserving its original shape. */
export type Mocked<T> = T & {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? T[K] & {
        mock: any;
        mockClear: () => void;
        mockReset: () => void;
        mockResolvedValue: (value: any) => Mocked<T>[K];
        mockReturnValue: (value: any) => Mocked<T>[K];
      }
    : T[K];
};

// Clear all mocks before each test
beforeEach(() => {
  // The preload establishes a consistent mock lifecycle for API tests.
});
