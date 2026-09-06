import { vi, describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AuthGuard } from '../../core/auth/auth.guard';
import { MyLibraryController } from './my-library.controller';
import { MyLibraryService } from './my-library.service';
import { PrimaryDbService } from '../../core/db/primary-db.service';

const mockAuth = { api: { getSession: vi.fn<any>() } };
vi.mock('../../core/auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockPrisma = {
  userAccessGrant: {
    findMany: vi.fn<any>().mockResolvedValue([]),
  },
  userRoleAssignment: {
    findMany: vi.fn<any>().mockResolvedValue([{ role: 'user' }]),
  },
};

const mockMyLibraryService = {
  getRecentProgress: vi.fn<any>().mockResolvedValue(null),
  getInProgress: vi.fn<any>().mockResolvedValue({ items: [], hasMore: false }),
  getCompleted: vi.fn<any>().mockResolvedValue({ items: [], hasMore: false }),
  getSaved: vi.fn<any>().mockResolvedValue({ items: [], hasMore: false }),
  getSavedDelta: vi.fn<any>().mockResolvedValue([]),
  saveLecture: vi.fn<any>().mockResolvedValue(undefined),
  unsaveLecture: vi.fn<any>().mockResolvedValue(undefined),
  bulkSyncSaved: vi.fn<any>().mockResolvedValue(undefined),
};

describe('MyLibraryController — auth boundaries', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();
    mockAuth.api.getSession.mockResolvedValue(null);

    const module = await Test.createTestingModule({
      controllers: [MyLibraryController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: MyLibraryService, useValue: mockMyLibraryService },
        { provide: PrimaryDbService, useValue: mockPrisma },
      ],
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(() => app.close());

  it('GET /me/my-library/progress returns 401 without a session', async () => {
    const response = await request(app.getHttpServer()).get('/me/my-library/progress');
    expect(response.status).toBe(401);
  });

  it('GET /me/my-library/recent-progress returns 401 without a session', async () => {
    const response = await request(app.getHttpServer()).get('/me/my-library/recent-progress');
    expect(response.status).toBe(401);
  });

  it('GET /me/my-library/completed returns 401 without a session', async () => {
    const response = await request(app.getHttpServer()).get('/me/my-library/completed');
    expect(response.status).toBe(401);
  });

  it('GET /me/my-library/saved returns 401 without a session', async () => {
    const response = await request(app.getHttpServer()).get('/me/my-library/saved');
    expect(response.status).toBe(401);
  });

  it('POST /me/my-library/save/:lectureId returns 401 without a session', async () => {
    const response = await request(app.getHttpServer()).post('/me/my-library/save/l1');
    expect(response.status).toBe(401);
  });

  it('DELETE /me/my-library/save/:lectureId returns 401 without a session', async () => {
    const response = await request(app.getHttpServer()).delete('/me/my-library/save/l1');
    expect(response.status).toBe(401);
  });

  it('GET /me/my-library/saved/delta returns 401 without a session', async () => {
    const response = await request(app.getHttpServer()).get('/me/my-library/saved/delta');
    expect(response.status).toBe(401);
  });

  it('POST /me/my-library/saved/sync returns 401 without a session', async () => {
    const response = await request(app.getHttpServer())
      .post('/me/my-library/saved/sync')
      .send({ items: [] });
    expect(response.status).toBe(401);
  });

  it('GET /me/my-library/progress returns 200 with a valid session', async () => {
    mockAuth.api.getSession.mockResolvedValue({
      user: { id: 'u1', role: 'user', email: 'a@b.com' },
      session: {},
    });

    const response = await request(app.getHttpServer()).get('/me/my-library/progress');
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it('GET /me/my-library/recent-progress returns the personal projection with a valid session', async () => {
    mockAuth.api.getSession.mockResolvedValue({
      user: { id: 'u1', role: 'user', email: 'a@b.com' },
      session: {},
    });

    const response = await request(app.getHttpServer()).get('/me/my-library/recent-progress');
    expect(response.status).toBe(200);
    expect(mockMyLibraryService.getRecentProgress).toHaveBeenCalledWith('u1');
  });
});
