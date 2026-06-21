import { vi } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { ScholarsController } from './scholars.controller';
import { AdminScholarsController } from './admin-scholars.controller';
import { ScholarsService } from './scholars.service';

const mockAuth = { api: { getSession: vi.fn() } };
vi.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockScholarsService = {
  list: vi.fn().mockResolvedValue({ scholars: [] }),
  getBySlug: vi.fn().mockResolvedValue(null),
  getContent: vi.fn().mockResolvedValue({ lectures: [], series: [] }),
  create: vi.fn().mockResolvedValue({}),
  update: vi.fn().mockResolvedValue({}),
};

describe('ScholarsController — auth boundaries', () => {
  let app: INestApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();

    const module = await Test.createTestingModule({
      controllers: [ScholarsController, AdminScholarsController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: ScholarsService, useValue: mockScholarsService },
      ],
    })
      .overrideGuard(AdminPermissionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(() => app.close());

  describe('public endpoints', () => {
    it('GET /scholars returns 200 without auth', () => {
      return request(app.getHttpServer()).get('/scholars').expect(200);
    });

    it('GET /scholars/:slug returns 200 without auth', () => {
      mockScholarsService.getBySlug.mockResolvedValue({
        id: 's1',
        slug: 'ibn-taymiyyah',
        name: 'Ibn Taymiyyah',
        lectureCount: 0,
        seriesCount: 0,
        totalDurationSeconds: 0,
      });
      return request(app.getHttpServer())
        .get('/scholars/ibn-taymiyyah')
        .expect(200);
    });
  });

  describe('admin endpoints', () => {
    it('POST /admin/scholars returns 401 without a session', () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      return request(app.getHttpServer())
        .post('/admin/scholars')
        .send({ name: 'Test Scholar', slug: 'test-scholar' })
        .expect(401);
    });

    it('PATCH /admin/scholars/:id returns 401 without a session', () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      return request(app.getHttpServer())
        .patch('/admin/scholars/s1')
        .send({ name: 'Updated Scholar' })
        .expect(401);
    });
  });
});
