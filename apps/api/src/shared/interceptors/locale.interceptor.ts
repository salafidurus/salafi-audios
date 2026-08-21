import { Injectable } from '@nestjs/common';
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import type { Request } from 'express';
import type { Observable } from 'rxjs';
import { resolveLocale } from '@sd/core-i18n';
import { type Locale, LocaleSchema } from '@sd/core-contracts';
import { z } from 'zod';
import { setRequestLocale } from '../i18n/locale-context';

const localeQuerySchema = z.object({ locale: LocaleSchema.optional() }).passthrough();

@Injectable()
export class LocaleInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request & { locale: Locale }>();
    const locale = this.resolve(req);
    req.locale = locale;
    // Refine the async-local scope opened by LocaleMiddleware now that the
    // authenticated user (and their preferredLanguage) is available.
    setRequestLocale(locale);
    return next.handle();
  }

  private resolve(req: Request & { user?: { preferredLanguage?: string } }): Locale {
    const parsedQuery = localeQuerySchema.safeParse(req.query);
    if (parsedQuery.success && parsedQuery.data.locale) return parsedQuery.data.locale;

    const fromUser = req.user?.preferredLanguage;
    if (fromUser) return resolveLocale(fromUser);

    const fromHeader = req.headers['accept-language'];
    return resolveLocale(fromHeader);
  }
}
