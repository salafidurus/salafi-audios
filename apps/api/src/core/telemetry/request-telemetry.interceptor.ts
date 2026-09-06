/* oxlint-disable anti-slop/require-tsdoc -- The exported interceptor documents its runtime contract below. */
import { Injectable } from '@nestjs/common';
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { finalize } from 'rxjs';
import { TelemetryService } from './telemetry.service';

/** Records bounded API request latency and status metrics after controller execution. */
@Injectable()
export class RequestTelemetryInterceptor implements NestInterceptor {
  public constructor(private readonly telemetry: TelemetryService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    if (context.getType() !== 'http') return next.handle();
    const request = context.switchToHttp().getRequest<{ method: string }>();
    const reply = context.switchToHttp().getResponse<{ statusCode: number }>();
    const startedAt = performance.now();
    return next.handle().pipe(
      finalize(() => {
        this.telemetry.recordHttpRequest(
          request.method,
          reply.statusCode,
          performance.now() - startedAt,
        );
      }),
    );
  }
}
