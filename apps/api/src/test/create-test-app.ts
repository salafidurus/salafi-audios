import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { TestingModuleBuilder } from '@nestjs/testing';

/** Provides the shared Fastify application factory used by API integration tests. */
/**
 * Compiles a Nest testing module and starts its Fastify application instance.
 *
 * The returned app has completed Nest initialization and Fastify readiness,
 * so callers can issue requests immediately. Module compilation or startup
 * errors are allowed to reject the returned promise for the test to report.
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
