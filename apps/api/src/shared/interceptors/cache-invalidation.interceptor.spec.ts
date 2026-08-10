import { describe, expect, it, vi } from 'bun:test';
import { of, firstValueFrom, throwError } from 'rxjs';
import { CacheInvalidationInterceptor } from './cache-invalidation.interceptor';

function context(method: string) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ method }) }),
  } as any;
}

describe('CacheInvalidationInterceptor', () => {
  it('clears cached values after a successful mutation', async () => {
    const cache = { clear: vi.fn().mockResolvedValue(undefined) };
    const logger = { setContext: vi.fn(), warn: vi.fn() };
    const interceptor = new CacheInvalidationInterceptor(cache as any, logger as any);

    await firstValueFrom(
      interceptor.intercept(context('POST'), { handle: () => of('updated') } as any),
    );

    expect(cache.clear).toHaveBeenCalledTimes(1);
  });

  it('does not clear cache for reads', async () => {
    const cache = { clear: vi.fn() };
    const interceptor = new CacheInvalidationInterceptor(
      cache as any,
      { setContext: vi.fn() } as any,
    );

    await firstValueFrom(
      interceptor.intercept(context('GET'), { handle: () => of('cached') } as any),
    );

    expect(cache.clear).not.toHaveBeenCalled();
  });

  it('does not turn a successful mutation into an error when invalidation fails', async () => {
    const cache = { clear: vi.fn().mockRejectedValue(new Error('Redis unavailable')) };
    const logger = { setContext: vi.fn(), warn: vi.fn() };
    const interceptor = new CacheInvalidationInterceptor(cache as any, logger as any);

    const result = await firstValueFrom(
      interceptor.intercept(context('PUT'), { handle: () => of('updated') } as any),
    );

    expect(result).toBe('updated');
    expect(logger.warn).toHaveBeenCalled();
  });

  it('does not invalidate when the mutation itself fails', async () => {
    const cache = { clear: vi.fn() };
    const interceptor = new CacheInvalidationInterceptor(
      cache as any,
      { setContext: vi.fn() } as any,
    );

    await expect(
      firstValueFrom(
        interceptor.intercept(context('DELETE'), {
          handle: () => throwError(() => new Error('failed')),
        } as any),
      ),
    ).rejects.toThrow('failed');
    expect(cache.clear).not.toHaveBeenCalled();
  });
});
