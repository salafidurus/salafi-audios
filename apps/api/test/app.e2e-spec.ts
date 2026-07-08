import '../src/shared/utils/env.bootstrap';
import { Test } from '@nestjs/testing';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { createTestApp } from '../src/test/create-test-app';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      imports: [AppModule],
    });

    app = await createTestApp(moduleBuilder);
  });

  afterEach(() => app.close());

  it('/health/healthz (GET)', () => {
    return request(app.getHttpServer())
      .get('/health/healthz')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
      });
  });
});
