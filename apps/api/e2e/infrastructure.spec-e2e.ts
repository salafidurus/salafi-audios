import { createE2eApp } from './helpers/create-e2e-app';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { PrismaService } from '../src/core/db/prisma.service';
import { TestAuthFactory } from './helpers/test-auth.factory';

describe('Infrastructure & Basic API Features (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let authFactory: TestAuthFactory;

  beforeAll(async () => {
    ({ app } = await createE2eApp());
    prisma = app.get(PrismaService);
    authFactory = new TestAuthFactory(prisma);
  });

  afterAll(async () => {
    await authFactory.cleanup();
    await app.close();
  });

  it('GET /health - returns 200 with correct shape', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);

    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('info');
    expect(res.body.status).toBe('ok');
    expect(res.body.info).toHaveProperty('database');
    expect(res.body.info).toHaveProperty('cdn');
    expect(res.body.info.database.status).toBe('up');
    expect(res.body.info.cdn.status).toBe('up');
  });

  it('GET /health/healthz - returns 200', async () => {
    const res = await request(app.getHttpServer()).get('/health/healthz').expect(200);

    expect(res.body.status).toBe('ok');
  });

  it('GET /docs - returns 200 HTML (Swagger)', async () => {
    const res = await request(app.getHttpServer()).get('/docs/').expect(200);

    expect(res.text).toContain('html');
    expect(res.text).toContain('swagger');
  });

  it('OpenAPI preserves the native schema for locale updates', async () => {
    const res = await request(app.getHttpServer()).get('/docs-json').expect(200);
    const schema =
      res.body.paths['/auth/me/locale'].patch.requestBody.content['application/json'].schema;

    expect(schema.type).toBe('object');
    expect(schema.properties.preferredLanguage).toBeDefined();
    expect(schema.required).toContain('preferredLanguage');
  });

  it('GET /nonexistent - returns 404 with error body', async () => {
    const res = await request(app.getHttpServer()).get('/nonexistent').expect(404);

    expect(res.body).toHaveProperty('statusCode', 404);
    expect(res.body).toHaveProperty('message');
  });

  it('Throttler - sequential requests return 429 after the limit', async () => {
    const auth = await authFactory.createUser();
    const responses = [];
    for (let index = 0; index < 3; index += 1) {
      responses.push(await request(app.getHttpServer()).get('/account/profile').set(auth.headers));
    }
    const has429 = responses.some((res) => res.status === 429);
    expect(has429).toBe(true);
  });
});
