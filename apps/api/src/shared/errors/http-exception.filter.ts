import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '@sd/core-db';
import { ConfigService } from '../../core/config/config.service';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

/** Shared API http exception.filter utilities and boundary definitions used by backend modules. */
const httpExceptionBodySchema = z
  .object({
    message: z.union([z.string(), z.array(z.string())]).optional(),
    statusCode: z.number().optional(),
    error: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
  })
  .catchall(z.unknown());

const bodyMessageArraySchema = z.array(z.string());
const bodyMessageStringSchema = z.string();
const healthIndicatorValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
const healthIndicatorResultSchema = z.record(
  z.string(),
  z.record(z.string(), healthIndicatorValueSchema),
);
const healthCheckResponseSchema = z.object({
  status: z.literal('error'),
  info: healthIndicatorResultSchema.optional(),
  error: healthIndicatorResultSchema,
  details: healthIndicatorResultSchema,
});
const errorExtraSourceSchema = z.record(z.string(), z.unknown());
const errorExtraValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.null(),
  z.undefined(),
]);

type ErrorExtras = Record<
  string,
  string | number | boolean | string[] | HealthIndicatorResult | null | undefined
>;

type HealthIndicatorResult = Record<string, Record<string, string | number | boolean | null>>;

type DevDetails =
  | string[]
  | HealthIndicatorResult
  | {
      /** Documents the kind field's API projection semantics and lifecycle meaning. */
      kind: string;
      message?: string;
      /** Documents the clientVersion field's API projection semantics and lifecycle meaning. */
      clientVersion?: string;
      code?: string;
      /** Documents the errorCode field's API projection semantics and lifecycle meaning. */
      errorCode?: string;
      stack?: string;
      meta?: unknown;
    };

type ErrorExtraSource = z.infer<typeof errorExtraSourceSchema>;

type ExceptionResolution = {
  /** Documents the statusCode field's API projection semantics and lifecycle meaning. */
  statusCode: number;
  message: string;
  details?: DevDetails;
  extras: ErrorExtras;
};

@Catch()
/** NestJS all exceptions filter service or controller coordinating the API boundary for this responsibility. */
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly config: ConfigService) {}

  catch(exception: Error | HttpException | unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<FastifyRequest>();
    const res = ctx.getResponse<FastifyReply>();

    const requestId = req.id ?? res.getHeader('x-request-id') ?? '';
    const timestamp = new Date().toISOString();

    const { statusCode, message, details, extras } = this.resolveException(
      exception instanceof Error ? exception : undefined,
    );

    const isProd = this.config.NODE_ENV === 'production';
    const devDetails = isProd ? undefined : this.buildDevDetails(exception, details);

    res.status(statusCode).send({
      statusCode,
      message,
      ...extras,
      details: devDetails,
      requestId,
      timestamp,
      path: req.url,
    });
  }

  private resolveException(exception: Error | undefined): ExceptionResolution {
    const fallback = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
      details: undefined,
      extras: {},
    } satisfies ExceptionResolution;
    if (exception === undefined) return fallback;
    if (this.isPrismaConnectionRefused(exception)) {
      return {
        ...fallback,
        message: 'Database connection refused. Ensure PostgreSQL is running and reachable.',
      };
    }
    if (exception instanceof HttpException) return this.resolveHttpException(exception, fallback);
    return exception instanceof Error
      ? { ...fallback, message: exception.message || fallback.message }
      : fallback;
  }

  private resolveHttpException(
    exception: HttpException,
    fallback: ExceptionResolution,
  ): ExceptionResolution {
    const parsedResponse = httpExceptionBodySchema.safeParse(exception.getResponse());
    if (!parsedResponse.success)
      return {
        ...fallback,
        statusCode: exception.getStatus(),
        message: exception.message || fallback.message,
      };
    return this.resolveParsedHttpException(exception, fallback, parsedResponse.data);
  }

  private resolveParsedHttpException(
    exception: HttpException,
    fallback: ExceptionResolution,
    body: z.infer<typeof httpExceptionBodySchema>,
  ): ExceptionResolution {
    const healthResponse = healthCheckResponseSchema.safeParse(body);
    if (healthResponse.success)
      return this.resolveHealthException(exception, fallback, healthResponse.data);
    const messageList = bodyMessageArraySchema.safeParse(body.message);
    if (messageList.success)
      return {
        ...fallback,
        statusCode: exception.getStatus(),
        message: 'Validation failed',
        details: messageList.data,
      };
    const messageText = bodyMessageStringSchema.safeParse(body.message);
    if (!messageText.success) return { ...fallback, statusCode: exception.getStatus() };
    const { message: _msg, statusCode: _status, error: _error, ...rest } = body;
    const parsedExtraSource = errorExtraSourceSchema.safeParse(rest);
    return {
      ...fallback,
      statusCode: exception.getStatus(),
      message: exception.message || fallback.message,
      extras: parsedExtraSource.success ? toErrorExtras(parsedExtraSource.data) : {},
    };
  }

  private resolveHealthException(
    exception: HttpException,
    fallback: ExceptionResolution,
    healthResponse: z.infer<typeof healthCheckResponseSchema>,
  ): ExceptionResolution {
    return {
      ...fallback,
      statusCode: exception.getStatus(),
      message: 'Health check failed',
      details: healthResponse.details,
      extras: {
        info: healthResponse.info ?? {},
        error: healthResponse.error,
      },
    };
  }

  private buildDevDetails(
    exception: Error | HttpException | unknown,
    existingDetails: DevDetails | undefined,
  ): DevDetails | undefined {
    if (existingDetails !== undefined) {
      return existingDetails;
    }

    if (!(exception instanceof Error)) return undefined;
    const prismaDetails = getPrismaDevDetails(exception);
    return prismaDetails ?? getGenericDevDetails(exception);
  }

  private isPrismaConnectionRefused(exception: Error | HttpException): boolean {
    if (!(exception instanceof Prisma.PrismaClientKnownRequestError)) return false;
    // SAFETY: Prisma's known-request instance carries its documented error code.
    return (exception as { code?: string }).code === 'ECONNREFUSED';
  }
}

function getPrismaDevDetails(exception: Error): DevDetails | undefined {
  if (exception instanceof Prisma.PrismaClientKnownRequestError) {
    // SAFETY: Prisma's known-request instance carries these documented fields.
    const prismaError = exception as Error & {
      code: string;
      /** Preserves the Prisma client version in development diagnostics. */
      clientVersion: string;
      meta: unknown;
    };
    return {
      kind: 'prisma-known-request-error',
      code: prismaError.code,
      clientVersion: prismaError.clientVersion,
      message: exception.message,
      meta: prismaError.meta,
    };
  }

  if (exception instanceof Prisma.PrismaClientValidationError) {
    // SAFETY: Prisma's validation-error instance carries its documented client version.
    const prismaError = exception as Error & {
      /** Preserves the Prisma client version in development diagnostics. */
      clientVersion: string;
    };
    return {
      kind: 'prisma-validation-error',
      clientVersion: prismaError.clientVersion,
      message: exception.message,
    };
  }

  if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
    // SAFETY: Prisma's unknown-request instance carries its documented client version.
    const prismaError = exception as Error & {
      /** Preserves the Prisma client version in development diagnostics. */
      clientVersion: string;
    };
    return {
      kind: 'prisma-unknown-request-error',
      clientVersion: prismaError.clientVersion,
      message: exception.message,
    };
  }

  if (exception instanceof Prisma.PrismaClientInitializationError) {
    // SAFETY: Prisma's initialization-error instance carries these documented fields.
    const prismaError = exception as Error & {
      /** Preserves Prisma's provider error code in development diagnostics. */
      errorCode: string;
      /** Preserves the Prisma client version in development diagnostics. */
      clientVersion: string;
    };
    return {
      kind: 'prisma-initialization-error',
      errorCode: prismaError.errorCode,
      clientVersion: prismaError.clientVersion,
      message: exception.message,
    };
  }

  return undefined;
}

function getGenericDevDetails(exception: Error): DevDetails {
  return {
    kind: exception.name || 'error',
    message: exception.message,
    stack: exception.stack,
  };
}

function toErrorExtras(input: ErrorExtraSource): ErrorExtras {
  const entries = Object.entries(input).flatMap(([key, value]) => {
    const parsed = errorExtraValueSchema.safeParse(value);
    return parsed.success ? [[key, parsed.data] as const] : [];
  });

  return Object.fromEntries(entries);
}
