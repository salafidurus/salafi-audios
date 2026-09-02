import { Injectable } from '@nestjs/common';
import type { NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { resolveLocale } from '@sd/core-i18n';
import { type Locale, LocaleSchema } from '@sd/core-contracts';
import { z } from 'zod';
import { runWithLocale } from './locale-context';

/** Shared API locale.middleware utilities and boundary definitions used by backend modules. */
const localeQuerySchema = z.looseObject({ locale: LocaleSchema.optional() });

/**
 * Opens an async-local locale scope for every request so repositories can read
 * the request locale via `getRequestLocale()` without it being threaded through
 * call signatures. The locale is resolved from the `locale` query param or the
 * `Accept-Language` header here; the `LocaleInterceptor` refines it with the
 * authenticated user's preference once the auth guard has run.
 */
@Injectable()
/** NestJS locale middleware service or controller coordinating the API boundary for this responsibility. */
export class LocaleMiddleware implements NestMiddleware {
  use(req: Request & { locale?: Locale }, _res: Response, next: NextFunction): void {
    const parsedQuery = localeQuerySchema.safeParse(req.query);
    const candidate = parsedQuery.success
      ? parsedQuery.data.locale
      : req.headers['accept-language'];
    const locale = resolveLocale(candidate);
    req.locale = locale;
    runWithLocale(locale, () => next());
  }
}
