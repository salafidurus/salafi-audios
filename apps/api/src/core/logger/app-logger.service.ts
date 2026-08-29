import { Injectable } from '@nestjs/common';
import type { LoggerService as NestLoggerService } from '@nestjs/common';

/** API-owned bridge between Nest logging and structured application logging. */
type LogFieldValue = string | number | boolean | Error | null | undefined;

/**
 * Structured fields added to an application log entry. Values are limited to
 * the scalar and error shapes supported by the API's Pino transport.
 */
export type LogFields = Record<string, LogFieldValue>;

type LogArgument = string | number | boolean | Error | LogFields | null | undefined;
type LogMethod = (...arguments_: LogArgument[]) => void;

/**
 * The transport-facing portion of the logger needed by the API application.
 * Keeping this contract structural prevents application services from depending
 * on Pino's full public API or on a Nest-specific logging integration.
 */
export type ApplicationLogger = {
  child(bindings: LogFields): ApplicationLogger;
  info: LogMethod;
  warn: LogMethod;
  /** Emits an error entry, optionally with structured fields. */
  error: LogMethod;
  debug: LogMethod;
  fatal: LogMethod;
};

/**
 * Provides the API's application logging boundary and Nest system logger.
 * Structured fields and errors are forwarded to the configured transport while
 * `setContext` binds the caller name to subsequent entries.
 */
@Injectable()
/**
 * Bridges Nest's system logger contract to the API's structured application
 * logging contract without exposing the underlying transport to callers.
 */
export class AppLoggerService implements NestLoggerService {
  private activeLogger: ApplicationLogger;

  constructor(private readonly rootLogger: ApplicationLogger) {
    this.activeLogger = rootLogger;
  }

  /** Binds an application service name to all subsequent entries from this logger. */
  setContext(context: string): void {
    this.activeLogger = this.rootLogger.child({ context });
  }

  /** Emits an informational message with optional structured fields. */
  info(fieldsOrMessage: LogFields | string, message?: string, ...extra: LogArgument[]): void {
    this.write(this.activeLogger.info, fieldsOrMessage, message, extra);
  }

  /** Emits a warning with optional structured fields. */
  warn(fieldsOrMessage: LogFields | string, message?: string, ...extra: LogArgument[]): void {
    this.write(this.activeLogger.warn, fieldsOrMessage, message, extra);
  }

  /** Emits an error while preserving either an Error value or structured fields. */
  error(
    errorOrFields: Error | LogFields | string,
    message?: string,
    ...extra: LogArgument[]
  ): void {
    if (errorOrFields instanceof Error) {
      this.activeLogger.error({ err: errorOrFields }, errorOrFields.message, message, ...extra);
      return;
    }

    this.activeLogger.error(errorOrFields, message, ...extra);
  }

  /** Adapts Nest's standard log method to the structured application logger. */
  log(message: LogArgument, ...optionalParams: LogArgument[]): void {
    this.activeLogger.info(message, ...optionalParams);
  }

  /** Adapts Nest's debug method to the application logger. */
  debug(message: LogArgument, ...optionalParams: LogArgument[]): void {
    this.activeLogger.debug(message, ...optionalParams);
  }

  /** Adapts Nest's verbose method to the application logger's debug level. */
  verbose(message: LogArgument, ...optionalParams: LogArgument[]): void {
    this.activeLogger.debug(message, ...optionalParams);
  }

  /** Adapts Nest's fatal method to the transport's fatal level. */
  fatal(message: LogArgument, ...optionalParams: LogArgument[]): void {
    this.activeLogger.fatal(message, ...optionalParams);
  }

  private write(
    method: LogMethod,
    fieldsOrMessage: LogFields | string,
    message: string | undefined,
    extra: LogArgument[],
  ): void {
    // This is an internal typed union from trusted application callers, not an
    // external payload. The overloads keep the public call forms explicit.
    // oxlint-disable-next-line anti-slop/no-runtime-typeof -- distinguishes the two typed log overloads.
    if (typeof fieldsOrMessage === 'string') {
      method(fieldsOrMessage, ...(message === undefined ? extra : [message, ...extra]));
      return;
    }

    method(fieldsOrMessage, message, ...extra);
  }
}
