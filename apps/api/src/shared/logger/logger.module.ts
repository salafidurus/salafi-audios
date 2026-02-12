import { Global, Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import crypto from 'node:crypto';
import { ConfigService } from '@/shared/config/config.service';

function genId() {
  return crypto.randomUUID();
}

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
              const existing = req.headers['x-request-id'];
              const id =
                typeof existing === 'string' && existing.trim().length > 0
                  ? existing
                  : genId();

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
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.headers.set-cookie',
              ],
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
export class AppLoggerModule {}
