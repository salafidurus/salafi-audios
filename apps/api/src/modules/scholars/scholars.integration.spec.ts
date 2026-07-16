import { vi } from 'vitest';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';
import request from 'supertest';
import { createTestApp } from '../../test/create-test-app';
import { AuthGuard } from '../auth/auth.guard';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { ScholarsController } from './scholars.controller';
import { AdminScholarsController } from './admin-scholars.controller';
import { ScholarsService } from './scholars.service';
import { PrismaService } from '../../shared/db/prisma.service';

const mockAuth = { api: { getSession: vi.fn<any>() } };
vi.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockPrisma = {
  userRoleAssignment: {
    findMany: vi.fn<any>().mockResolvedValue([{ role: 'user' }]),
  },
};

const mockScholarsService = {
  list: vi.fn<any>().mockResolvedValue({ scholars: [] }),
  getBySlug: vi.fn<any>().mockResolvedValue(null),
  getContent: vi.fn<any>().mockResolvedValue({ lectures: [], series: [] }),
  create: vi.fn<any>().mockResolvedValue({}),
  update: vi.fn<any>().mockResolvedValue({}),
};

describe('ScholarsController — auth boundaries', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();

    const moduleBuilder = Test.createTestingModule({
      imports: [CacheModule.register({ isGlobal: true, ttl: 0 })],
      controllers: [ScholarsController, AdminScholarsController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: ScholarsService, useValue: mockScholarsService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    })
      .overrideGuard(AdminPermissionGuard)
      .useValue({ canActivate: () => true });

    app = await createTestApp(moduleBuilder);
  });

  afterEach(() => app?.close());

  describe('public endpoints', () => {
    it('GET /scholars returns 200 without auth', async () => {
      const response = await request(app.getHttpServer()).get('/scholars');
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('GET /scholars/:slug returns 200 without auth', async () => {
      mockScholarsService.getBySlug.mockResolvedValue({
        id: 's1',
        slug: 'ibn-taymiyyah',
        name: 'Ibn Taymiyyah',
        lectureCount: 0,
        seriesCount: 0,
        totalDurationSeconds: 0,
      });
      const response = await request(app.getHttpServer()).get('/scholars/ibn-taymiyyah');
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });

  describe('admin endpoints', () => {
    it('POST /admin/scholars returns 401 without a session', async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      const response = await request(app.getHttpServer())
        .post('/admin/scholars')
        .send({ name: 'Test Scholar', slug: 'test-scholar' });
      expect(response.status).toBe(401);
    });

    it('PATCH /admin/scholars/:id returns 401 without a session', async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      const response = await request(app.getHttpServer())
        .patch('/admin/scholars/s1')
        .send({ name: 'Updated Scholar' });
      expect(response.status).toBe(401);
    });
  });
});
