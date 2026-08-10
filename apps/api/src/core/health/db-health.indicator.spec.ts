import { afterEach, beforeEach, describe, expect, it, vi } from 'bun:test';
import { ConfigService } from '../config/config.service';
import { DbHealthIndicator } from './db-health.indicator';

describe('DbHealthIndicator', () => {
  const fetchMock = vi.fn();
  const originalFetch = globalThis.fetch;
  let indicator: DbHealthIndicator;

  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    indicator = new DbHealthIndicator({
      NEON_API_KEY: 'neon-test-key',
      NEON_PROJECT_ID: 'test-project',
      NEON_ENDPOINT_ID: 'ep-test-endpoint',
    } as ConfigService);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns up with Neon endpoint state information', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ endpoint: { current_state: 'idle' } }), { status: 200 }),
    );

    await expect(indicator.pingCheck('database')).resolves.toEqual({
      database: { status: 'up', currentState: 'idle' },
    });
  });

  it('fails when Neon is unavailable or returns an invalid response', async () => {
    fetchMock.mockResolvedValue(new Response('not found', { status: 404 }));
    await expect(indicator.pingCheck('database')).rejects.toThrow('Database check failed');

    fetchMock.mockResolvedValue(new Response(JSON.stringify({ endpoint: {} }), { status: 200 }));
    await expect(indicator.pingCheck('database')).rejects.toThrow('Database check failed');
  });

  it('fails when Neon does not respond before the timeout', async () => {
    fetchMock.mockImplementation((_url: string, options: { signal: AbortSignal }) => {
      return new Promise((_resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(new Error('aborted')));
      });
    });

    await expect(indicator.pingCheck('database', { timeout: 10 })).rejects.toThrow(
      'Database check failed',
    );
  });
});
