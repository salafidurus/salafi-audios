import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Observable } from 'rxjs';
import { resolveLocale } from '@sd/core-i18n';
import type { Locale } from '@sd/core-contracts';

@Injectable()
export class LocaleInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { locale: Locale }>();
    req.locale = this.resolve(req);
    return next.handle();
  }

  private resolve(
    req: Request & { user?: { preferredLanguage?: string } },
  ): Locale {
    const fromQuery = req.query['locale'];
    if (typeof fromQuery === 'string') return resolveLocale(fromQuery);

    const fromUser = req.user?.preferredLanguage;
    if (fromUser) return resolveLocale(fromUser);

    const fromHeader = req.headers['accept-language'];
    return resolveLocale(fromHeader);
  }
}
