import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { TestingModuleBuilder } from '@nestjs/testing';

/**
 * Creates a Fastify-based NestJS test application
 */
export async function createTestApp(
  moduleBuilder: TestingModuleBuilder,
): Promise<NestFastifyApplication> {
  const module = await moduleBuilder.compile();

  const app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  return app;
}
