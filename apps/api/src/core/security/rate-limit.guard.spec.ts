import { describe, expect, it, mock } from 'bun:test';

import { RateLimitGuard } from './rate-limit.guard';

describe('RateLimitGuard', () => {
  it('allows disabled mode without touching Fastify enforcement', async () => {
    const createRateLimit = mock(() => {
      throw new Error('must not create a limiter');
    });
    const guard = new RateLimitGuard(
      { getAllAndOverride: () => undefined } as never,
      { httpAdapter: { getInstance: () => ({ createRateLimit }) } } as never,
      { DISABLE_THROTTLER: true, NODE_ENV: 'production' } as never,
    );

    await expect(guard.canActivate({} as never)).resolves.toBe(true);
    expect(createRateLimit).not.toHaveBeenCalled();
  });
});
