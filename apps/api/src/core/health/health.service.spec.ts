import { describe, expect, it, vi } from 'bun:test';
import { HealthCheckError, HealthService } from './health.service';

describe('HealthService', () => {
  it('aggregates healthy probe results into the existing response shape', async () => {
    const service = new HealthService();

    await expect(
      service.check([
        async () => ({ database: { status: 'up', currentState: 'idle' } }),
        async () => ({ cdn: { status: 'up' } }),
      ]),
    ).resolves.toEqual({
      status: 'ok',
      info: {
        database: { status: 'up', currentState: 'idle' },
        cdn: { status: 'up' },
      },
      error: {},
      details: {
        database: { status: 'up', currentState: 'idle' },
        cdn: { status: 'up' },
      },
    });
  });

  it('maps expected probe failures to an unavailable health exception', async () => {
    const service = new HealthService();
    const failure = new HealthCheckError('CDN check failed', {
      cdn: { status: 'down', message: 'Request timeout' },
    });

    await expect(
      service.check([
        async () => ({ database: { status: 'up' } }),
        async () => Promise.reject(failure),
      ]),
    ).rejects.toMatchObject({
      status: 503,
      response: {
        status: 'error',
        error: { cdn: { status: 'down', message: 'Request timeout' } },
        details: {
          database: { status: 'up' },
          cdn: { status: 'down', message: 'Request timeout' },
        },
      },
    });
  });

  it('does not call dependencies for liveness', async () => {
    const service = new HealthService();
    const probe = vi.fn();

    await expect(service.check([])).resolves.toMatchObject({
      status: 'ok',
      info: {},
      error: {},
      details: {},
    });
    expect(probe).not.toHaveBeenCalled();
  });

  it('propagates unexpected probe errors instead of reporting them as dependency failures', async () => {
    const service = new HealthService();
    const error = new Error('programming failure');

    await expect(service.check([async () => Promise.reject(error)])).rejects.toBe(error);
  });
});
