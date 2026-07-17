/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'bun:test';
import { LocaleInterceptor } from './locale.interceptor';
import { of, firstValueFrom } from 'rxjs';

describe('LocaleInterceptor', () => {
  const interceptor = new LocaleInterceptor();
  const callHandler = { handle: () => of(null) };

  it('uses ?locale= query param first', async () => {
    const req: any = { query: { locale: 'ar' }, headers: {} };
    const ctx = { switchToHttp: () => ({ getRequest: () => req }) } as any;
    await firstValueFrom(interceptor.intercept(ctx, callHandler));
    expect(req.locale).toBe('ar');
  });

  it('falls back to user preferredLanguage', async () => {
    const req: any = {
      query: {},
      user: { preferredLanguage: 'ar' },
      headers: {},
    };
    const ctx = { switchToHttp: () => ({ getRequest: () => req }) } as any;
    await firstValueFrom(interceptor.intercept(ctx, callHandler));
    expect(req.locale).toBe('ar');
  });

  it('falls back to Accept-Language header', async () => {
    const req: any = {
      query: {},
      headers: { 'accept-language': 'ar-SA,ar;q=0.9' },
    };
    const ctx = { switchToHttp: () => ({ getRequest: () => req }) } as any;
    await firstValueFrom(interceptor.intercept(ctx, callHandler));
    expect(req.locale).toBe('ar');
  });

  it('defaults to en when nothing is provided', async () => {
    const req: any = { query: {}, headers: {} };
    const ctx = { switchToHttp: () => ({ getRequest: () => req }) } as any;
    await firstValueFrom(interceptor.intercept(ctx, callHandler));
    expect(req.locale).toBe('en');
  });
});
