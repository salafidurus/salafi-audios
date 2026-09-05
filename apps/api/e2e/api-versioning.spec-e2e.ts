import { createE2eApp } from './helpers/create-e2e-app';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';

describe('Application API versioning (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    ({ app } = await createE2eApp({ disableThrottler: true }));
  });

  afterAll(async () => {
    await app.close();
  });

  it('resolves business routes only under /v1', async () => {
    await request(app.getHttpServer()).get('/v1/listings/promotions').expect(200);
    await request(app.getHttpServer()).get('/listings/promotions').expect(404);
  });

  it('keeps health probes outside the application API version', async () => {
    await request(app.getHttpServer()).get('/health/healthz').expect(200);
    await request(app.getHttpServer()).get('/v1/health/healthz').expect(404);
  });

  it('keeps crawler routes outside the application API version', async () => {
    await request(app.getHttpServer()).get('/robots.txt').expect(200);
    await request(app.getHttpServer()).get('/v1/robots.txt').expect(404);
    await request(app.getHttpServer()).get('/sitemap.xml').expect(404);
    await request(app.getHttpServer()).get('/v1/sitemap.xml').expect(404);
  });

  it('documents versioned business routes in OpenAPI', async () => {
    const response = await request(app.getHttpServer()).get('/docs-json').expect(200);

    expect(response.body.paths['/v1/auth/me/locale']).toBeDefined();
    expect(response.body.paths['/auth/me/locale']).toBeUndefined();
  });
});
