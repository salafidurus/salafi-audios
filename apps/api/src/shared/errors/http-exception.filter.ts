import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@/shared/config/config.service';
import type { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly config: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const requestId = req.id ?? res.getHeader('x-request-id') ?? '';
    const timestamp = new Date().toISOString();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        message = response;
      } else if (
        response &&
        typeof response === 'object' &&
        'message' in response
      ) {
        const body = response;

        if (Array.isArray(body.message)) {
          message = 'Validation failed';
          details = body.message;
        } else {
          message = exception.message || message;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message || message;
    }

    const isProd = this.config.NODE_ENV === 'production';

    res.status(statusCode).json({
      statusCode,
      message,
      details: isProd ? undefined : details,
      requestId,
      timestamp,
      path: req.url,
    });
  }
}
