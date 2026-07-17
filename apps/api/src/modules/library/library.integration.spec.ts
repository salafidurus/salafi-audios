import { vi, describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { PrismaService } from '../../shared/db/prisma.service';

const mockAuth = { api: { getSession: vi.fn<any>() } };
vi.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockPrisma = {
  userRoleAssignment: {
    findMany: vi.fn<any>().mockResolvedValue([{ role: 'user' }]),
  },
};

const mockLibraryService = {
  getInProgress: vi.fn<any>().mockResolvedValue({ items: [], hasMore: false }),
  getCompleted: vi.fn<any>().mockResolvedValue({ items: [], hasMore: false }),
  getSaved: vi.fn<any>().mockResolvedValue({ items: [], hasMore: false }),
  saveLecture: vi.fn<any>().mockResolvedValue(undefined),
  unsaveLecture: vi.fn<any>().mockResolvedValue(undefined),
  bulkSave: vi.fn<any>().mockResolvedValue(undefined),
};

describe('LibraryController — auth boundaries', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();
    mockAuth.api.getSession.mockResolvedValue(null);

    const module = await Test.createTestingModule({
      controllers: [LibraryController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: LibraryService, useValue: mockLibraryService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(() => app.close());

  it('GET /me/library/progress returns 401 without a session', async () => {
    const response = await request(app.getHttpServer()).get('/me/library/progress');
    expect(response.status).toBe(401);
  });

  it('GET /me/library/completed returns 401 without a session', async () => {
    const response = await request(app.getHttpServer()).get('/me/library/completed');
    expect(response.status).toBe(401);
  });

  it('GET /me/library/saved returns 401 without a session', async () => {
    const response = await request(app.getHttpServer()).get('/me/library/saved');
    expect(response.status).toBe(401);
  });

  it('POST /me/library/save/:lectureId returns 401 without a session', async () => {
    const response = await request(app.getHttpServer()).post('/me/library/save/l1');
    expect(response.status).toBe(401);
  });

  it('DELETE /me/library/save/:lectureId returns 401 without a session', async () => {
    const response = await request(app.getHttpServer()).delete('/me/library/save/l1');
    expect(response.status).toBe(401);
  });

  it('POST /me/library/saved/sync returns 401 without a session', async () => {
    const response = await request(app.getHttpServer())
      .post('/me/library/saved/sync')
      .send({ lectureIds: [] });
    expect(response.status).toBe(401);
  });

  it('GET /me/library/progress returns 200 with a valid session', async () => {
    mockAuth.api.getSession.mockResolvedValue({
      user: { id: 'u1', role: 'user', email: 'a@b.com' },
      session: {},
    });

    const response = await request(app.getHttpServer()).get('/me/library/progress');
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
});
