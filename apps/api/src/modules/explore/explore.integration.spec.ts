import { vi, describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { ExploreController } from './explore.controller';
import { ExploreService } from './explore.service';
import { PrismaService } from '../../shared/db/prisma.service';

const mockAuth = { api: { getSession: vi.fn<any>() } };
vi.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockPrisma = {
  userRoleAssignment: {
    findMany: vi.fn<any>().mockResolvedValue([{ role: 'user' }]),
  },
};

const mockExploreService = {
  getExplore: vi.fn<any>().mockResolvedValue({ items: [], nextCursor: null, hasMore: false }),
  getExploreRecent: vi.fn<any>().mockResolvedValue({ items: [], nextCursor: null, hasMore: false }),
  getFollowingExplore: vi
    .fn<any>()
    .mockResolvedValue({ items: [], nextCursor: null, hasMore: false }),
  getScholars: vi.fn<any>().mockResolvedValue({ scholars: [] }),
};

describe('ExploreController — auth boundaries', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();

    const module = await Test.createTestingModule({
      imports: [CacheModule.register({ isGlobal: true, ttl: 0 })],
      controllers: [ExploreController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: ExploreService, useValue: mockExploreService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(() => app.close());

  it('GET /explore returns 200 without auth (public route)', async () => {
    const response = await request(app.getHttpServer()).get('/explore');
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it('GET /explore/recent returns 200 without auth (public route)', async () => {
    const response = await request(app.getHttpServer()).get('/explore/recent');
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it('GET /explore/scholars returns 200 without auth (public route)', async () => {
    const response = await request(app.getHttpServer()).get('/explore/scholars');
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it('GET /explore/following returns 401 without auth session', async () => {
    mockAuth.api.getSession.mockResolvedValue(null);
    const response = await request(app.getHttpServer()).get('/explore/following');
    expect(response.status).toBe(401);
  });

  it('GET /explore/personalized returns 404 (old route removed)', async () => {
    const response = await request(app.getHttpServer()).get('/explore/personalized');
    expect(response.status).toBe(404);
  });
});
