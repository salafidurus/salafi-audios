import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { LecturesController } from './lectures.controller';
import { AdminLecturesController } from './admin-lectures.controller';
import { LecturesService } from './lectures.service';

const mockAuth = { api: { getSession: jest.fn() } };
jest.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockLecturesService = {
  getById: jest.fn().mockResolvedValue({ id: 'l1', title: 'Test Lecture' }),
  getRelated: jest.fn().mockResolvedValue([]),
  updateLecture: jest.fn().mockResolvedValue({}),
  publishLecture: jest.fn().mockResolvedValue({}),
  archiveLecture: jest.fn().mockResolvedValue({}),
};

describe('LecturesController — auth boundaries', () => {
  let app: INestApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();

    const module = await Test.createTestingModule({
      controllers: [LecturesController, AdminLecturesController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: LecturesService, useValue: mockLecturesService },
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
    it('GET /lectures/:id returns 200 without auth', () => {
      return request(app.getHttpServer()).get('/lectures/l1').expect(200);
    });

    it('GET /lectures/:id/related returns 200 without auth', () => {
      return request(app.getHttpServer())
        .get('/lectures/l1/related')
        .expect(200);
    });
  });

  describe('admin endpoints', () => {
    it('PUT /admin/lectures/:id returns 401 without a session', () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      return request(app.getHttpServer())
        .put('/admin/lectures/l1')
        .send({ title: 'Updated' })
        .expect(401);
    });

    it('POST /admin/lectures/:id/publish returns 401 without a session', () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      return request(app.getHttpServer())
        .post('/admin/lectures/l1/publish')
        .expect(401);
    });

    it('POST /admin/lectures/:id/archive returns 401 without a session', () => {
      mockAuth.api.getSession.mockResolvedValue(null);
      return request(app.getHttpServer())
        .post('/admin/lectures/l1/archive')
        .expect(401);
    });
  });
});
