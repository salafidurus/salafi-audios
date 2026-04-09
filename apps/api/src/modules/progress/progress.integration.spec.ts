import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

const mockAuth = { api: { getSession: jest.fn() } };
jest.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockProgressService = {
  getUserProgress: jest.fn().mockResolvedValue([]),
  bulkSync: jest.fn().mockResolvedValue(undefined),
  upsertProgress: jest.fn().mockResolvedValue(undefined),
};

describe('ProgressController — auth boundaries', () => {
  let app: INestApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();
    mockAuth.api.getSession.mockResolvedValue(null);

    const module = await Test.createTestingModule({
      controllers: [ProgressController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: ProgressService, useValue: mockProgressService },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(() => app.close());

  it('GET /me/progress returns 401 without a session', () => {
    return request(app.getHttpServer()).get('/me/progress').expect(401);
  });

  it('POST /me/progress/sync returns 401 without a session', () => {
    return request(app.getHttpServer())
      .post('/me/progress/sync')
      .send({ items: [] })
      .expect(401);
  });

  it('PUT /me/progress/:lectureId returns 401 without a session', () => {
    return request(app.getHttpServer())
      .put('/me/progress/l1')
      .send({ positionSeconds: 30 })
      .expect(401);
  });

  it('GET /me/progress returns 200 with a valid session', async () => {
    mockAuth.api.getSession.mockResolvedValue({
      user: { id: 'u1', role: 'user', email: 'a@b.com' },
      session: {},
    });

    return request(app.getHttpServer()).get('/me/progress').expect(200);
  });
});
