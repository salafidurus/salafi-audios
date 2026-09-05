// ESM Module Resolution Gating under Bun:
// NestJS 12 packages are pure ESM modules. To prevent runtime `TypeError: require() async module ... is unsupported`
// errors when CommonJS companion dependencies synchronously call `require('@nestjs/common')`
// synchronously call `require('@nestjs/common')` during execution, we must explicitly import the core ES modules first.
// This forces Bun to evaluate the NestJS core ESM graph synchronously at startup so subsequent CJS requires succeed.
import { StandardSchemaValidationPipe, VersioningType } from '@nestjs/common';
import '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { CDNHealthIndicator } from '../../src/core/health/cdn-health.indicator';
import { AppModule } from '../../src/app.module';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { MockCDNHealthIndicator } from './mock-cdn.health';
import { MockDbHealthIndicator } from './mock-db.health';
import { DbHealthIndicator } from '../../src/core/health/db-health.indicator';
import { HealthCheckError } from '../../src/core/health/health.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from '../../src/shared/errors/http-exception.filter';
import { ConfigService } from '../../src/core/config/config.service';
import { initAuth } from '../../src/core/auth/auth.instance';
import { RedisService } from '../../src/core/redis/redis.service';
import rateLimit from '@fastify/rate-limit';
import { RateLimitGuard } from '../../src/core/security/rate-limit.guard';

export async function createE2eApp(options?: {
  disableThrottler?: boolean;
  healthFailure?: 'database' | 'cdn';
}): Promise<{
  app: NestFastifyApplication;
  moduleRef: TestingModule;
}> {
  let moduleBuilder = Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(CDNHealthIndicator)
    .useClass(MockCDNHealthIndicator)
    .overrideProvider(DbHealthIndicator)
    .useClass(MockDbHealthIndicator);

  if (options?.healthFailure) {
    const key = options.healthFailure;
    const provider = key === 'database' ? DbHealthIndicator : CDNHealthIndicator;
    moduleBuilder = moduleBuilder.overrideProvider(provider).useValue({
      pingCheck: async () => {
        throw new HealthCheckError(`${key} check failed`, {
          [key]: { status: 'down', message: 'test dependency failure' },
        });
      },
    });
  }

  if (options?.disableThrottler) {
    moduleBuilder = moduleBuilder.overrideProvider(RateLimitGuard).useValue({
      canActivate: () => true,
    });
  }

  const module = await moduleBuilder.compile();
  const app = module.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter({ trustProxy: false }),
  );
  app.enableVersioning({ type: VersioningType.URI });

  const config = app.get(ConfigService);
  const redis = app.get(RedisService);
  await app.register(rateLimit, {
    global: false,
    redis: redis.rawClient,
    nameSpace: `${redis.namespace}rate-limit:`,
  });
  initAuth(config);

  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter(config));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Salafi Durus API')
    .setDescription('Backend API for Salafi Durus')
    .setVersion('1.0.0')
    .addCookieAuth('better-auth.session_token')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return { app, moduleRef: module };
}
