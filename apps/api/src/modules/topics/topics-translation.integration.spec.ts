import { vi, describe, it, expect, beforeEach, afterEach } from 'bun:test';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';
import request from 'supertest';
import { createTestApp } from '../../test/create-test-app';
import { AuthGuard } from '../auth/auth.guard';
import { PermissionGuard } from '../../shared/guards/permission.guard';
import { TopicsController } from './topics.controller';
import { TopicsTranslationsController } from './topics-translations.controller';
import { TopicsService } from './topics.service';
import { PrismaService } from '../../shared/db/prisma.service';

const mockAuth = { api: { getSession: vi.fn<any>() } };
vi.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockPrisma = {
  userPermission: {
    findMany: vi.fn<any>().mockResolvedValue([]),
    findUnique: vi.fn<any>().mockResolvedValue(null),
  },
  userRoleAssignment: {
    findMany: vi.fn<any>().mockResolvedValue([{ role: 'user' }]),
    findUnique: vi.fn<any>().mockResolvedValue(null),
  },
};

const mockTranslation = {
  locale: 'ar',
  fields: { name: 'موضوع عربي' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockTopicsService = {
  list: vi.fn<any>().mockResolvedValue([]),
  getBySlug: vi.fn<any>(),
  upsert: vi.fn<any>(),
  listChildren: vi.fn<any>().mockResolvedValue([]),
  listLectures: vi.fn<any>().mockResolvedValue([]),
  remove: vi.fn<any>(),
  listTranslations: vi.fn<any>().mockResolvedValue([]),
  upsertTranslation: vi.fn<any>().mockResolvedValue(mockTranslation),
  updateTranslation: vi.fn<any>().mockResolvedValue(mockTranslation),
};

async function buildApp(overrideGuard?: () => boolean | never): Promise<NestFastifyApplication> {
  const builder = Test.createTestingModule({
    imports: [CacheModule.register({ isGlobal: true, ttl: 0 })],
    controllers: [TopicsController, TopicsTranslationsController],
    providers: [
      { provide: APP_GUARD, useClass: AuthGuard },
      { provide: APP_GUARD, useClass: PermissionGuard },
      { provide: TopicsService, useValue: mockTopicsService },
      { provide: PrismaService, useValue: mockPrisma },
    ],
  });

  return createTestApp(builder);
}

describe('TopicsTranslationsController — auth boundaries', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();
    vi.clearAllMocks();
    mockTopicsService.upsertTranslation.mockResolvedValue(mockTranslation);
    app = await buildApp();
  });

  afterEach(() => app.close());

  describe('authenticated admin with manage:content permission', () => {
    beforeEach(() => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'u1', role: 'admin' },
        session: {},
      });
      // Mock userPermission.findUnique to return permissions for admin
      mockPrisma.userPermission.findUnique.mockImplementation(async (args: any) => {
        const { where } = args;
        const { userId, permission } = where.userId_permission;
        if (
          userId === 'u1' &&
          ['TRANSLATIONS_VIEW', 'TRANSLATIONS_CREATE', 'TRANSLATIONS_EDIT'].includes(permission)
        ) {
          return { userId, permission, grantedAt: new Date() };
        }
        return null;
      });
    });

    it('POST /topics/:id/translations creates a translation', async () => {
      const res = await request(app.getHttpServer())
        .post('/topics/t1/translations')
        .send({ locale: 'ar', name: 'موضوع عربي' })
        .expect(201);
      expect(res.body.locale).toBe('ar');
    });

    it('GET /topics/:id/translations lists translations', async () => {
      mockTopicsService.listTranslations.mockResolvedValue([mockTranslation]);
      const res = await request(app.getHttpServer()).get('/topics/t1/translations').expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('unauthenticated requests', () => {
    it('POST /topics/:id/translations returns 401 without a session', async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      const response = await request(app.getHttpServer())
        .post('/topics/t1/translations')
        .send({ locale: 'ar', name: 'موضوع عربي' });
      expect(response.status).toBe(401);
    });
  });

  describe('missing manage:content permission', () => {
    let forbiddenApp: NestFastifyApplication;

    beforeEach(async () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'u1', role: 'user' },
        session: {},
      });
      // Reset userPermission.findUnique to return null for all queries
      // This ensures PermissionGuard will throw ForbiddenException
      mockPrisma.userPermission.findUnique.mockResolvedValue(null);
      forbiddenApp = await buildApp();
    });

    afterEach(() => forbiddenApp.close());

    it('POST /topics/:id/translations returns 403', async () => {
      const response = await request(forbiddenApp.getHttpServer())
        .post('/topics/t1/translations')
        .send({ locale: 'ar', name: 'موضوع عربي' });
      expect(response.status).toBe(403);
    });
  });
});
