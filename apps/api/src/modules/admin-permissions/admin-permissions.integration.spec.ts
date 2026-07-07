import { vi } from 'vitest';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { AdminPermissionsController } from './admin-permissions.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminPermissionsService } from './admin-permissions.service';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { PrismaService } from '../../shared/db/prisma.service';

const mockAuth = { api: { getSession: vi.fn() } };
vi.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockAdminPermissionsService = {
  getMyPermissions: vi.fn().mockResolvedValue([]),
  getPermissions: vi.fn().mockResolvedValue([]),
  grant: vi.fn().mockResolvedValue({}),
  revoke: vi.fn().mockResolvedValue({}),
};

const mockPrisma = {
  adminPermission: {
    findUnique: vi.fn(),
  },
};

describe('AdminPermissionsController — auth boundaries', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();
    mockPrisma.adminPermission.findUnique.mockReset();
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      controllers: [AdminPermissionsController, AdminUsersController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        AdminPermissionGuard,
        {
          provide: AdminPermissionsService,
          useValue: mockAdminPermissionsService,
        },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(() => app.close());

  describe('401 — no session', () => {
    beforeEach(() => {
      mockAuth.api.getSession.mockResolvedValue(null);
    });

    it('GET /admin/permissions/me returns 401 without a session', () => {
      return request(app.getHttpServer()).get('/admin/permissions/me').expect(401);
    });

    it('GET /admin/users/:userId/permissions returns 401 without a session', () => {
      return request(app.getHttpServer()).get('/admin/users/u2/permissions').expect(401);
    });

    it('POST /admin/users/:userId/permissions returns 401 without a session', () => {
      return request(app.getHttpServer())
        .post('/admin/users/u2/permissions')
        .send({ permission: 'manage:admin' })
        .expect(401);
    });

    it('DELETE /admin/users/:userId/permissions/:permission returns 401 without a session', () => {
      return request(app.getHttpServer())
        .delete('/admin/users/u2/permissions/manage:admin')
        .expect(401);
    });
  });

  describe('403 — authenticated but missing manage:admin permission', () => {
    beforeEach(() => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'u1', role: 'user', email: 'user@example.com' },
        session: {},
      });
      // User has no manage:admin permission
      mockPrisma.adminPermission.findUnique.mockResolvedValue(null);
    });

    it('GET /admin/users/:userId/permissions returns 403 without manage:admin', () => {
      return request(app.getHttpServer()).get('/admin/users/u2/permissions').expect(403);
    });

    it('POST /admin/users/:userId/permissions returns 403 without manage:admin', () => {
      return request(app.getHttpServer())
        .post('/admin/users/u2/permissions')
        .send({ permission: 'manage:admin' })
        .expect(403);
    });

    it('DELETE /admin/users/:userId/permissions/:permission returns 403 without manage:admin', () => {
      return request(app.getHttpServer())
        .delete('/admin/users/u2/permissions/manage:admin')
        .expect(403);
    });
  });

  describe('200 — authenticated, GET /me (no permission required)', () => {
    it('GET /admin/permissions/me returns 200 with a valid session', () => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'u1', role: 'user', email: 'user@example.com' },
        session: {},
      });
      mockAdminPermissionsService.getMyPermissions.mockResolvedValue([]);

      return request(app.getHttpServer()).get('/admin/permissions/me').expect(200);
    });
  });
});
