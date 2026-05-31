/* eslint-disable @typescript-eslint/no-explicit-any */
import { LocaleInterceptor } from './locale.interceptor';
import { of } from 'rxjs';

describe('LocaleInterceptor', () => {
  const interceptor = new LocaleInterceptor();
  const callHandler = { handle: () => of(null) };

  it('uses ?locale= query param first', (done) => {
    const req: any = { query: { locale: 'ar' }, headers: {} };
    const ctx = { switchToHttp: () => ({ getRequest: () => req }) } as any;
    interceptor.intercept(ctx, callHandler).subscribe(() => {
      expect(req.locale).toBe('ar');
      done();
    });
  });

  it('falls back to user preferredLanguage', (done) => {
    const req: any = {
      query: {},
      user: { preferredLanguage: 'ar' },
      headers: {},
    };
    const ctx = { switchToHttp: () => ({ getRequest: () => req }) } as any;
    interceptor.intercept(ctx, callHandler).subscribe(() => {
      expect(req.locale).toBe('ar');
      done();
    });
  });

  it('falls back to Accept-Language header', (done) => {
    const req: any = {
      query: {},
      headers: { 'accept-language': 'ar-SA,ar;q=0.9' },
    };
    const ctx = { switchToHttp: () => ({ getRequest: () => req }) } as any;
    interceptor.intercept(ctx, callHandler).subscribe(() => {
      expect(req.locale).toBe('ar');
      done();
    });
  });

  it('defaults to en when nothing is provided', (done) => {
    const req: any = { query: {}, headers: {} };
    const ctx = { switchToHttp: () => ({ getRequest: () => req }) } as any;
    interceptor.intercept(ctx, callHandler).subscribe(() => {
      expect(req.locale).toBe('en');
      done();
    });
  });
});
