/** DI registration for the shared API application logger. */
import { Global, Module } from '@nestjs/common';
import { AppLoggerService } from './app-logger.service';
import { API_LOGGER, getSharedApiLogger } from './logger.factory';
import { ConfigService } from '../config/config.service';

@Global()
@Module({
  providers: [
    {
      provide: API_LOGGER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => getSharedApiLogger(config.NODE_ENV),
    },
    AppLoggerService,
  ],
  exports: [AppLoggerService],
})
/**
 * Registers one Pino-backed logger instance for Nest system logs and API
 * services, preserving one configured transport, request-log destination, and
 * redaction boundary for the lifetime of the API process.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- Nest module decorators separate the declaration from its TSDoc.
export class AppLoggerModule {}
