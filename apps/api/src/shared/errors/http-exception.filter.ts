import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@sd/core-db';
import { ConfigService } from '../../shared/config/config.service';
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

    if (this.isPrismaConnectionRefused(exception)) {
      message = 'Database connection refused. Ensure PostgreSQL is running and reachable.';
    } else if (exception instanceof HttpException) {
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
    const devDetails = isProd ? undefined : this.buildDevDetails(exception, details);

    res.status(statusCode).json({
      statusCode,
      message,
      details: devDetails,
      requestId,
      timestamp,
      path: req.url,
    });
  }

  private buildDevDetails(
    exception: unknown,
    existingDetails: unknown,
  ): unknown {
    if (existingDetails !== undefined) {
      return existingDetails;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        kind: 'prisma-known-request-error',
        code: exception.code,
        clientVersion: exception.clientVersion,
        message: exception.message,
        meta: exception.meta,
      };
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        kind: 'prisma-validation-error',
        clientVersion: exception.clientVersion,
        message: exception.message,
      };
    }

    if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      return {
        kind: 'prisma-unknown-request-error',
        clientVersion: exception.clientVersion,
        message: exception.message,
      };
    }

    if (exception instanceof Prisma.PrismaClientInitializationError) {
      return {
        kind: 'prisma-initialization-error',
        errorCode: exception.errorCode,
        clientVersion: exception.clientVersion,
        message: exception.message,
      };
    }

    if (exception instanceof Error) {
      return {
        kind: exception.name || 'error',
        message: exception.message,
        stack: exception.stack,
      };
    }

    return existingDetails;
  }

  private isPrismaConnectionRefused(exception: unknown): boolean {
    return (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.code === 'ECONNREFUSED'
    );
  }
}
