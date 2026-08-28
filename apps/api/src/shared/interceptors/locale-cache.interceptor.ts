import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';

/** NestJS locale cache interceptor service or controller coordinating the API boundary for this responsibility. */
@Injectable()
/** Shared API locale cache.interceptor utilities and boundary definitions used by backend modules. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class LocaleCacheInterceptor extends CacheInterceptor {
  override trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const isHttp = context.getType() === 'http';
    if (!isHttp) {
      return undefined;
    }
    const method = request.method;
    if (method !== 'GET') {
      return undefined;
    }
    const url = request.url;
    const locale = request.locale || 'en';
    const userId = request.user?.id;
    return userId ? `${url}:${locale}:${userId}` : `${url}:${locale}`;
  }
}
