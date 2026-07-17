import { vi, describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { PrismaService } from '../../shared/db/prisma.service';

const mockAuth = { api: { getSession: vi.fn<any>() } };
vi.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockPrisma = {
  userRoleAssignment: {
    findMany: vi.fn<any>().mockResolvedValue([{ role: 'user' }]),
  },
};

const mockHomeService = {
  getQuickBrowse: vi.fn<any>().mockResolvedValue({
    recentLectures: [],
    topScholars: [],
    featuredCollections: [],
    liveNow: [],
  }),
};

describe('HomeController — auth boundaries', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();

    const module = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: HomeService, useValue: mockHomeService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(() => app.close());

  it('GET /home/quickbrowse returns 200 without auth (public route)', async () => {
    const response = await request(app.getHttpServer()).get('/home/quickbrowse');
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
});
