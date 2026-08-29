/** Shared API cache invalidation interceptor applies cache invalidation after successful mutations. */
import { CACHE_MANAGER, type Cache } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { AppLoggerService } from '../../core/logger/app-logger.service';
import { from, of, type Observable } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';

@Injectable()
/** NestJS cache invalidation interceptor service or controller coordinating the API boundary for this responsibility. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class CacheInvalidationInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly logger: AppLoggerService,
  ) {
    this.logger.setContext(CacheInvalidationInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const method = context.switchToHttp().getRequest().method;
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return next.handle();
    }

    return next.handle().pipe(
      concatMap((value) =>
        from(this.cache.clear()).pipe(
          catchError((error) => {
            this.logger.warn(
              { err: error, method },
              'Cache invalidation failed after successful mutation',
            );
            return of(undefined);
          }),
          map(() => value),
        ),
      ),
    );
  }
}
