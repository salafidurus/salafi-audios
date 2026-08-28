import { Global, Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import crypto from 'node:crypto';
import { z } from 'zod';
import { ConfigService } from '../config/config.service';

/** Core API logger.module module providing shared backend infrastructure and authority-boundary services. */
function genId() {
  return crypto.randomUUID();
}

const requestIdHeaderSchema = z.string().trim().min(1);

@Global()
@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.NODE_ENV === 'production';

        return {
          pinoHttp: {
            // Respect inbound request id if present, else generate one.
            genReqId: (req, res) => {
              const parsedExisting = requestIdHeaderSchema.safeParse(req.headers['x-request-id']);
              const id = parsedExisting.success ? parsedExisting.data : genId();

              res.setHeader('x-request-id', id);
              return id;
            },

            // Make logs more readable in local/dev
            transport: isProd
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                    singleLine: false,
                  },
                },

            // Redact sensitive headers
            redact: {
              paths: ['req.headers.authorization', 'req.headers.cookie', 'req.headers.set-cookie'],
              remove: true,
            },

            // Optional: reduce noise (health can be noisy in prod)
            autoLogging: {
              ignore: (req) => req.url === '/health',
            },
          },
        };
      },
    }),
  ],
  exports: [LoggerModule],
})
/** NestJS app logger module service or controller coordinating the API boundary for this responsibility. */
export class AppLoggerModule {}
