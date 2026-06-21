import { vi } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';

const mockAuth = { api: { getSession: vi.fn() } };
vi.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockFeedService = {
  getFeed: vi
    .fn()
    .mockResolvedValue({ items: [], nextCursor: null, hasMore: false }),
  getScholars: vi.fn().mockResolvedValue({ scholars: [] }),
};

describe('FeedController — auth boundaries', () => {
  let app: INestApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();

    const module = await Test.createTestingModule({
      controllers: [FeedController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: FeedService, useValue: mockFeedService },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(() => app.close());

  it('GET /feed returns 200 without auth (public route)', () => {
    return request(app.getHttpServer()).get('/feed').expect(200);
  });

  it('GET /feed/personalized returns 200 without auth (public route)', () => {
    return request(app.getHttpServer()).get('/feed/personalized').expect(200);
  });

  it('GET /feed/scholars returns 200 without auth (public route)', () => {
    return request(app.getHttpServer()).get('/feed/scholars').expect(200);
  });
});
