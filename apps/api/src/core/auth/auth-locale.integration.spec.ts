import { vi, describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AuthGuard } from './auth.guard';
import { AuthLocaleController } from './auth-locale.controller';
import { PrismaService } from '../db/prisma.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { AllExceptionsFilter } from '../../shared/errors/http-exception.filter';

const mockAuth = { api: { getSession: vi.fn<any>() } };
vi.mock('./auth.instance', () => ({ getAuth: () => mockAuth }));

const mockPrismaService = {
  user: {
    update: vi.fn<any>().mockResolvedValue({ preferredLanguage: 'ar' }),
  },
  userRoleAssignment: {
    findMany: vi.fn<any>().mockResolvedValue([{ role: 'user' }]),
  },
};

const mockConfigService = {
  get: vi.fn<any>().mockReturnValue(false),
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
    }).compile();

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
        .send({ preferredLanguage: 'ar' });
      expect(res.status).toBe(200);
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
    it('PATCH /auth/me/locale returns 401 without a session', async () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      const response = await request(app.getHttpServer())
        .patch('/auth/me/locale')
        .send({ preferredLanguage: 'ar' });
      expect(response.status).toBe(401);
    });
  });
});
