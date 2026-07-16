import { vi } from 'vitest';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { AdminUsersController } from './admin-users.controller';
import { PermissionsService } from '../permissions/permissions.service';
import { PermissionGuard } from '../../shared/guards/permission.guard';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { PrismaService } from '../../shared/db/prisma.service';
import { Permissions } from '@sd/core-contracts';

const mockAuth = { api: { getSession: vi.fn<any>() } };
vi.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockPermissionsService = {
  listUsers: vi.fn<any>().mockResolvedValue({ users: [] }),
  getPermissions: vi.fn<any>().mockResolvedValue({ permissions: [] }),
};

const mockPrisma = {
  userPermission: {
    findMany: vi.fn<any>().mockResolvedValue([]),
    findUnique: vi.fn<any>().mockResolvedValue(null),
  },
  userRoleAssignment: {
    findMany: vi.fn<any>().mockResolvedValue([]),
    findUnique: vi.fn<any>().mockResolvedValue(null),
  },
};

describe('AdminUsersController — auth boundaries', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();
    mockPrisma.userPermission.findMany.mockReset();
    mockPrisma.userRoleAssignment.findMany.mockReset();
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      controllers: [AdminUsersController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: APP_GUARD, useClass: PermissionGuard },
        AdminPermissionGuard,
        {
          provide: PermissionsService,
          useValue: mockPermissionsService,
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

    it('GET /admin/users returns 401 without a session', async () => {
      const response = await request(app.getHttpServer()).get('/admin/users');
      expect(response.status).toBe(401);
    });

    it('GET /admin/users/:userId/permissions returns 401 without a session', async () => {
      const response = await request(app.getHttpServer()).get('/admin/users/u2/permissions');
      expect(response.status).toBe(401);
    });
  });

  describe('403 — authenticated but missing USERS_VIEW permission', () => {
    beforeEach(() => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'u1', email: 'user@example.com' },
        session: {},
      });
      // User has at least one role (so AuthGuard passes)
      mockPrisma.userRoleAssignment.findMany.mockResolvedValue([{ role: 'listener' }]);
      // For PermissionGuard: user is not superadmin
      mockPrisma.userRoleAssignment.findUnique.mockResolvedValue(null);
      // User has no USERS_VIEW permission
      mockPrisma.userPermission.findMany.mockResolvedValue([]);
      mockPrisma.userPermission.findUnique.mockResolvedValue(null);
    });

    it('GET /admin/users returns 403 without USERS_VIEW permission', async () => {
      const response = await request(app.getHttpServer()).get('/admin/users');
      expect(response.status).toBe(403);
    });

    it('GET /admin/users/:userId/permissions returns 403 without USERS_VIEW permission', async () => {
      const response = await request(app.getHttpServer()).get('/admin/users/u2/permissions');
      expect(response.status).toBe(403);
    });
  });

  describe('200 — authenticated with USERS_VIEW permission', () => {
    beforeEach(() => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'u1', email: 'user@example.com' },
        session: {},
      });
      // User has at least one role (so AuthGuard passes)
      mockPrisma.userRoleAssignment.findMany.mockResolvedValue([{ role: 'admin' }]);
      // For PermissionGuard: user is not superadmin
      mockPrisma.userRoleAssignment.findUnique.mockResolvedValue(null);
      // User has USERS_VIEW permission
      mockPrisma.userPermission.findMany.mockResolvedValue([
        { permission: Permissions.USERS_VIEW },
      ]);
      mockPrisma.userPermission.findUnique.mockResolvedValue({
        userId: 'u1',
        permission: Permissions.USERS_VIEW,
        grantedAt: new Date(),
      });
    });

    it('GET /admin/users returns 200 with USERS_VIEW permission', async () => {
      mockPermissionsService.listUsers.mockResolvedValue({ users: [] });
      const response = await request(app.getHttpServer()).get('/admin/users');
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('GET /admin/users/:userId/permissions returns 200 with USERS_VIEW permission', async () => {
      mockPermissionsService.getPermissions.mockResolvedValue({ permissions: [] });
      const response = await request(app.getHttpServer()).get('/admin/users/u2/permissions');
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });
  });
});
