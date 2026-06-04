import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Prisma } from "@sd/core-db";
import type { Request, Response } from "express";
import { LiveConfigService } from "../config/config.service";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly config: LiveConfigService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const timestamp = new Date().toISOString();
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal Server Error";
    let details: unknown = undefined;

    if (this.isPrismaConnectionRefused(exception)) {
      message = "Database connection refused. Ensure PostgreSQL is running and reachable.";
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === "string") {
        message = response;
      } else if (response && typeof response === "object" && "message" in response) {
        const body = response as { message: unknown };
        if (Array.isArray(body.message)) {
          message = "Validation failed";
          details = body.message;
        } else {
          message = exception.message || message;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message || message;
    }

    const isProd = this.config.NODE_ENV === "production";

    res.status(statusCode).json({
      statusCode,
      message,
      ...(isProd ? {} : { details: details ?? this.buildDevDetails(exception) }),
      timestamp,
      path: req.url,
    });
  }

  private isPrismaConnectionRefused(exception: unknown): boolean {
    return (
      exception instanceof Prisma.PrismaClientInitializationError &&
      exception.message.includes("connect ECONNREFUSED")
    );
  }

  private buildDevDetails(exception: unknown): unknown {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        kind: "prisma-known-request-error",
        code: exception.code,
        message: exception.message,
      };
    }
    if (exception instanceof Error) {
      return { stack: exception.stack };
    }
    return undefined;
  }
}
