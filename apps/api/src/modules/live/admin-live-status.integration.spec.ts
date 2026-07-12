import { vi } from 'vitest';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { AdminLiveController } from './admin-live.controller';
import { LiveService } from './live.service';
import { PrismaService } from '../../shared/db/prisma.service';

const mockAuth = { api: { getSession: vi.fn() } };
vi.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockPrisma = {
  userRoleAssignment: {
    findMany: vi.fn().mockResolvedValue([{ role: 'admin' }]),
  },
  userPermission: { findUnique: vi.fn() },
};

const mockLiveService = {
  updateSessionStatus: vi.fn().mockResolvedValue({}),
};

const sessionUser = { id: 'user-1', email: 'admin@example.com' };

describe('AdminLiveController — granular LIVE_START/LIVE_STOP enforcement', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AdminLiveController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: APP_GUARD, useClass: AdminPermissionGuard },
        { provide: LiveService, useValue: mockLiveService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  beforeEach(() => {
    mockAuth.api.getSession.mockReset();
    mockPrisma.userPermission.findUnique.mockReset();
    mockLiveService.updateSessionStatus.mockClear();
  });

  afterAll(() => app.close());

  it('PATCH /go-live returns 403 when user has LIVE_EDIT but not LIVE_START', async () => {
    mockAuth.api.getSession.mockResolvedValue({ user: sessionUser });
    mockPrisma.userPermission.findUnique.mockImplementation(
      ({ where }: { where: { userId_permission: { permission: string } } }) =>
        where.userId_permission.permission === 'LIVE_EDIT' ? { permission: 'LIVE_EDIT' } : null,
    );

    await request(app.getHttpServer()).patch('/admin/live/sessions/session-1/go-live').expect(403);
  });

  it('PATCH /go-live returns 200 and calls updateSessionStatus(id, "live")', async () => {
    mockAuth.api.getSession.mockResolvedValue({ user: sessionUser });
    mockPrisma.userPermission.findUnique.mockResolvedValue({ permission: 'LIVE_START' });

    await request(app.getHttpServer()).patch('/admin/live/sessions/session-1/go-live').expect(200);

    expect(mockLiveService.updateSessionStatus).toHaveBeenCalledWith('session-1', 'live');
  });

  it('PATCH /end returns 403 when user has LIVE_EDIT but not LIVE_STOP', async () => {
    mockAuth.api.getSession.mockResolvedValue({ user: sessionUser });
    mockPrisma.userPermission.findUnique.mockImplementation(
      ({ where }: { where: { userId_permission: { permission: string } } }) =>
        where.userId_permission.permission === 'LIVE_EDIT' ? { permission: 'LIVE_EDIT' } : null,
    );

    await request(app.getHttpServer()).patch('/admin/live/sessions/session-1/end').expect(403);
  });

  it('PATCH /end returns 200 and calls updateSessionStatus(id, "ended")', async () => {
    mockAuth.api.getSession.mockResolvedValue({ user: sessionUser });
    mockPrisma.userPermission.findUnique.mockResolvedValue({ permission: 'LIVE_STOP' });

    await request(app.getHttpServer()).patch('/admin/live/sessions/session-1/end').expect(200);

    expect(mockLiveService.updateSessionStatus).toHaveBeenCalledWith('session-1', 'ended');
  });

  it('PATCH /reschedule returns 200 and calls updateSessionStatus(id, "scheduled")', async () => {
    mockAuth.api.getSession.mockResolvedValue({ user: sessionUser });
    mockPrisma.userPermission.findUnique.mockResolvedValue({ permission: 'LIVE_EDIT' });

    await request(app.getHttpServer())
      .patch('/admin/live/sessions/session-1/reschedule')
      .expect(200);

    expect(mockLiveService.updateSessionStatus).toHaveBeenCalledWith('session-1', 'scheduled');
  });
});
