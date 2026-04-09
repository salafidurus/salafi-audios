import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { AdminPermissionsController } from './admin-permissions.controller';
import { AdminPermissionsService } from './admin-permissions.service';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { PrismaService } from '../../shared/db/prisma.service';

const mockAuth = { api: { getSession: jest.fn() } };
jest.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockAdminPermissionsService = {
  getMyPermissions: jest.fn().mockResolvedValue([]),
  getPermissions: jest.fn().mockResolvedValue([]),
  grant: jest.fn().mockResolvedValue({}),
  revoke: jest.fn().mockResolvedValue({}),
};

const mockPrisma = {
  adminPermission: {
    findUnique: jest.fn(),
  },
};

describe('AdminPermissionsController — auth boundaries', () => {
  let app: INestApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();
    mockPrisma.adminPermission.findUnique.mockReset();
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      controllers: [AdminPermissionsController],
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

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(() => app.close());

  describe('401 — no session', () => {
    beforeEach(() => {
      mockAuth.api.getSession.mockResolvedValue(null);
    });

    it('GET /admin/permissions/me returns 401 without a session', () => {
      return request(app.getHttpServer())
        .get('/admin/permissions/me')
        .expect(401);
    });

    it('GET /admin/permissions/:userId returns 401 without a session', () => {
      return request(app.getHttpServer())
        .get('/admin/permissions/u2')
        .expect(401);
    });

    it('POST /admin/permissions/:userId returns 401 without a session', () => {
      return request(app.getHttpServer())
        .post('/admin/permissions/u2')
        .send({ permission: 'manage:admin' })
        .expect(401);
    });

    it('DELETE /admin/permissions/:userId/:permission returns 401 without a session', () => {
      return request(app.getHttpServer())
        .delete('/admin/permissions/u2/manage:admin')
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

    it('GET /admin/permissions/:userId returns 403 without manage:admin', () => {
      return request(app.getHttpServer())
        .get('/admin/permissions/u2')
        .expect(403);
    });

    it('POST /admin/permissions/:userId returns 403 without manage:admin', () => {
      return request(app.getHttpServer())
        .post('/admin/permissions/u2')
        .send({ permission: 'manage:admin' })
        .expect(403);
    });

    it('DELETE /admin/permissions/:userId/:permission returns 403 without manage:admin', () => {
      return request(app.getHttpServer())
        .delete('/admin/permissions/u2/manage:admin')
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

      return request(app.getHttpServer())
        .get('/admin/permissions/me')
        .expect(200);
    });
  });
});
