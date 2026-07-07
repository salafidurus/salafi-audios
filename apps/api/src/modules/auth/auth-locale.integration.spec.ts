import { vi } from 'vitest';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AuthGuard } from './auth.guard';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { AuthLocaleController } from './auth-locale.controller';
import { PrismaService } from '../../shared/db/prisma.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { AllExceptionsFilter } from '../../shared/errors/http-exception.filter';

const mockAuth = { api: { getSession: vi.fn() } };
vi.mock('./auth.instance', () => ({ getAuth: () => mockAuth }));

const mockPrismaService = {
  user: {
    update: vi.fn().mockResolvedValue({ preferredLanguage: 'ar' }),
  },
};

const mockConfigService = {
  get: vi.fn().mockReturnValue(false),
};

describe('AuthLocaleController — auth boundaries', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();
    vi.clearAllMocks();
    mockPrismaService.user.update.mockResolvedValue({
      preferredLanguage: 'ar',
    });

    const module = await Test.createTestingModule({
      controllers: [AuthLocaleController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    })
      .overrideGuard(AdminPermissionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    app.useGlobalPipes(new ZodValidationPipe());
    app.useGlobalFilters(new AllExceptionsFilter(mockConfigService as any));
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(() => app.close());

  describe('authenticated user', () => {
    beforeEach(() => {
      mockAuth.api.getSession.mockResolvedValue({
        user: { id: 'u1', role: 'user' },
        session: {},
      });
    });

    it('PATCH /auth/me/locale updates the preferred language and returns 200', async () => {
      const res = await request(app.getHttpServer())
        .patch('/auth/me/locale')
        .send({ preferredLanguage: 'ar' })
        .expect(200);
      expect(res.body.preferredLanguage).toBe('ar');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { preferredLanguage: 'ar' },
      });
    });

    it('PATCH /auth/me/locale with invalid locale returns 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .patch('/auth/me/locale')
        .send({ preferredLanguage: 'fr' });
      expect(res.status).toBe(400);
      expect(res.body.details).toBeDefined();
      expect(res.body.details[0].message).toContain('expected one of');
    });
  });

  describe('unauthenticated requests', () => {
    it('PATCH /auth/me/locale returns 401 without a session', () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      return request(app.getHttpServer())
        .patch('/auth/me/locale')
        .send({ preferredLanguage: 'ar' })
        .expect(401);
    });
  });
});
