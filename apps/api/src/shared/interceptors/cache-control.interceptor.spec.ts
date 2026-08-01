/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'bun:test';
import { of, firstValueFrom } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { CacheControlInterceptor } from './cache-control.interceptor';

describe('CacheControlInterceptor', () => {
  function makeContextAndResponse(method = 'GET') {
    const headers: Record<string, string> = {};
    const response = {
      statusCode: 200,
      header: (name: string, value: string) => {
        headers[name] = value;
      },
    };
    const request = { method };
    const ctx: any = {
      switchToHttp: () => ({ getRequest: () => request, getResponse: () => response }),
      getHandler: () => function handler() {},
      getClass: () => class TestController {},
    };
    return { ctx, headers };
  }

  it('sets Vary: Accept-Language alongside Cache-Control, so locale-varying responses are never served stale from a shared/browser cache after a language switch', async () => {
    const interceptor = new CacheControlInterceptor(new Reflector());
    const { ctx, headers } = makeContextAndResponse();
    const callHandler = { handle: () => of({}) };

    await firstValueFrom(interceptor.intercept(ctx, callHandler as any));

    expect(headers['Cache-Control']).toBe('public, max-age=300');
    expect(headers['Vary']).toBe('Accept-Language');
  });

  it('does not set any headers for non-GET requests', async () => {
    const interceptor = new CacheControlInterceptor(new Reflector());
    const { ctx, headers } = makeContextAndResponse('POST');
    const callHandler = { handle: () => of({}) };

    await firstValueFrom(interceptor.intercept(ctx, callHandler as any));

    expect(headers['Cache-Control']).toBeUndefined();
    expect(headers['Vary']).toBeUndefined();
  });
});
