import { INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AuthGuard } from '../auth/auth.guard';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

const mockAuth = { api: { getSession: jest.fn() } };
jest.mock('../auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockHomeService = {
  getQuickBrowse: jest.fn().mockResolvedValue({
    recentLectures: [],
    topScholars: [],
    featuredCollections: [],
    liveNow: [],
  }),
};

describe('HomeController — auth boundaries', () => {
  let app: INestApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();

    const module = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: HomeService, useValue: mockHomeService },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(() => app.close());

  it('GET /home/quickbrowse returns 200 without auth (public route)', () => {
    return request(app.getHttpServer()).get('/home/quickbrowse').expect(200);
  });
});
