import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { resolveLocale } from '@sd/core-i18n';
import type { Locale } from '@sd/core-contracts';
import { runWithLocale } from './locale-context';

/**
 * Opens an async-local locale scope for every request so repositories can read
 * the request locale via `getRequestLocale()` without it being threaded through
 * call signatures. The locale is resolved from the `locale` query param or the
 * `Accept-Language` header here; the `LocaleInterceptor` refines it with the
 * authenticated user's preference once the auth guard has run.
 */
@Injectable()
export class LocaleMiddleware implements NestMiddleware {
  use(req: Request & { locale?: Locale }, _res: Response, next: NextFunction): void {
    const fromQuery = req.query['locale'];
    const candidate = typeof fromQuery === 'string' ? fromQuery : req.headers['accept-language'];
    const locale = resolveLocale(candidate);
    req.locale = locale;
    runWithLocale(locale, () => next());
  }
}
