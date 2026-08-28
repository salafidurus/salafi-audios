import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Prisma } from '@sd/core-db';
import { ConfigService } from '../../core/config/config.service';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { ZodValidationException } from 'nestjs-zod';
import { z } from 'zod';

const httpExceptionBodySchema = z
  .object({
    message: z.union([z.string(), z.array(z.string())]).optional(),
    statusCode: z.number().optional(),
    error: z.string().optional(),
  })
  .catchall(z.unknown());

const bodyMessageArraySchema = z.array(z.string());
const bodyMessageStringSchema = z.string();
const zodIssueMessagesSchema = z.array(z.object({ message: z.string() }));
const zodValidationErrorSchema = z.object({ issues: zodIssueMessagesSchema });
const errorExtraSourceSchema = z.record(z.string(), z.unknown());
const errorExtraValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.null(),
  z.undefined(),
]);

type ErrorExtras = Record<string, string | number | boolean | string[] | null | undefined>;

type DevDetails =
  | string[]
  | {
      kind: string;
      message?: string;
      clientVersion?: string;
      code?: string;
      errorCode?: string;
      stack?: string;
      meta?: unknown;
    };

type ErrorExtraSource = z.infer<typeof errorExtraSourceSchema>;

type ExceptionResolution = {
  statusCode: number;
  message: string;
  details?: DevDetails;
  extras: ErrorExtras;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly config: ConfigService) {}

  catch(exception: Error | HttpException | ZodValidationException | unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<FastifyRequest>();
    const res = ctx.getResponse<FastifyReply>();

    const requestId = req.id ?? res.getHeader('x-request-id') ?? '';
    const timestamp = new Date().toISOString();

    const { statusCode, message, details, extras } = this.resolveException(exception);

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

  private resolveException(
    exception: Error | HttpException | ZodValidationException | unknown,
  ): ExceptionResolution {
    const fallback = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
      details: undefined,
      extras: {},
    } satisfies ExceptionResolution;
    if (this.isPrismaConnectionRefused(exception)) {
      return {
        ...fallback,
        message: 'Database connection refused. Ensure PostgreSQL is running and reachable.',
      };
    }
    if (exception instanceof ZodValidationException) {
      const parsed = zodValidationErrorSchema.safeParse(exception.getZodError());
      return {
        ...fallback,
        statusCode: exception.getStatus(),
        message: 'Validation failed',
        details: parsed.success
          ? parsed.data.issues.map((issue) => issue.message)
          : ['Validation failed'],
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
    const body = parsedResponse.data;
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

  private buildDevDetails(
    exception: Error | HttpException | ZodValidationException | unknown,
    existingDetails: DevDetails | undefined,
  ): DevDetails | undefined {
    if (existingDetails !== undefined) {
      return existingDetails;
    }

    if (!(exception instanceof Error)) return undefined;
    const prismaDetails = getPrismaDevDetails(exception);
    return prismaDetails ?? getGenericDevDetails(exception);
  }

  private isPrismaConnectionRefused(
    exception: Error | HttpException | ZodValidationException | unknown,
  ): boolean {
    return (
      exception instanceof Prisma.PrismaClientKnownRequestError && exception.code === 'ECONNREFUSED'
    );
  }
}

function getPrismaDevDetails(exception: Error): DevDetails | undefined {
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
