import { Test, TestingModule } from '@nestjs/testing';
import { TelegramModule } from '../../src/modules/telegram/telegram.module';
import { CDNHealthIndicator } from '../../src/core/health/cdn-health.indicator';
import { AppModule } from '../../src/app.module';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { MockTelegramModule } from './mock-telegram.module';
import { MockCDNHealthIndicator } from './mock-cdn.health';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { AllExceptionsFilter } from '../../src/shared/errors/http-exception.filter';
import { ConfigService } from '../../src/shared/config/config.service';
import { initAuth } from '../../src/modules/auth/auth.instance';

export async function createE2eApp(): Promise<{
  app: NestFastifyApplication;
  moduleRef: TestingModule;
}> {
  const moduleBuilder = Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideModule(TelegramModule)
    .useModule(MockTelegramModule)
    .overrideProvider(CDNHealthIndicator)
    .useClass(MockCDNHealthIndicator);

  const module = await moduleBuilder.compile();
  const app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

  const config = app.get(ConfigService);
  initAuth(config);

  app.useGlobalPipes(new ZodValidationPipe());
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
