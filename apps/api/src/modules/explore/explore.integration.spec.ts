import { vi } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { ExploreController } from './explore.controller';
import { ExploreService } from './explore.service';

const mockAuth = { api: { getSession: vi.fn() } };
vi.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockExploreService = {
  getExplore: vi.fn().mockResolvedValue({ items: [], nextCursor: null, hasMore: false }),
  getExploreRecent: vi.fn().mockResolvedValue({ items: [], nextCursor: null, hasMore: false }),
  getFollowingExplore: vi.fn().mockResolvedValue({ items: [], nextCursor: null, hasMore: false }),
  getScholars: vi.fn().mockResolvedValue({ scholars: [] }),
};

describe('ExploreController — auth boundaries', () => {
  let app: INestApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();

    const module = await Test.createTestingModule({
      controllers: [ExploreController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: ExploreService, useValue: mockExploreService },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(() => app.close());

  it('GET /explore returns 200 without auth (public route)', () => {
    return request(app.getHttpServer()).get('/explore').expect(200);
  });

  it('GET /explore/recent returns 200 without auth (public route)', () => {
    return request(app.getHttpServer()).get('/explore/recent').expect(200);
  });

  it('GET /explore/scholars returns 200 without auth (public route)', () => {
    return request(app.getHttpServer()).get('/explore/scholars').expect(200);
  });

  it('GET /explore/following returns 401 without auth session', () => {
    mockAuth.api.getSession.mockResolvedValue(null);
    return request(app.getHttpServer()).get('/explore/following').expect(401);
  });

  it('GET /explore/personalized returns 404 (old route removed)', () => {
    return request(app.getHttpServer()).get('/explore/personalized').expect(404);
  });
});
