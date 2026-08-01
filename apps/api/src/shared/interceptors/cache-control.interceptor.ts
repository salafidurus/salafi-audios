import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    if (request.method !== 'GET') {
      return next.handle();
    }

    // Retrieve TTL metadata from the handler or controller class
    const ttlMs =
      this.reflector.get<number>('cache_module:ttl', context.getHandler()) ||
      this.reflector.get<number>('cache_module:ttl', context.getClass());

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();

        // Only set Cache-Control on successful 2xx responses
        if (response.statusCode >= 200 && response.statusCode < 300) {
          if (ttlMs) {
            const ttlSeconds = Math.floor(ttlMs / 1000);
            response.header('Cache-Control', `public, max-age=${ttlSeconds}`);
          } else {
            // Global default fallback: 5 minutes in seconds
            response.header('Cache-Control', 'public, max-age=300');
          }
          // Every route behind this interceptor resolves content to the
          // request's Accept-Language (see LocaleCacheInterceptor, whose
          // server-side cache key already includes locale). Without Vary,
          // a shared/browser HTTP cache keys purely on the URL and will
          // happily serve a response fetched under one language to a
          // request made under another after a language switch, until the
          // entry's max-age expires — Vary makes those distinct entries.
          response.header('Vary', 'Accept-Language');
        }
      }),
    );
  }
}
