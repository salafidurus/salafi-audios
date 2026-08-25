import { vi, describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { AuthGuard } from '../../core/auth/auth.guard';
import { PrismaService } from '../../core/db/prisma.service';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';

const mockAuth = { api: { getSession: vi.fn<any>() } };
vi.mock('../../core/auth/auth.instance', () => ({ getAuth: () => mockAuth }));

const mockPrisma = {
  userAccessGrant: { findMany: vi.fn<any>().mockResolvedValue([]) },
  userRoleAssignment: { findMany: vi.fn<any>().mockResolvedValue([{ role: 'user' }]) },
};

const mockListingService = {
  getPromotions: vi.fn<any>().mockResolvedValue({ hero: null, editorsPicks: [] }),
};

describe('ListingController — public Home access', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    mockAuth.api.getSession.mockReset();

    const module = await Test.createTestingModule({
      imports: [CacheModule.register({ isGlobal: true, ttl: 0 })],
      controllers: [ListingController],
      providers: [
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: ListingService, useValue: mockListingService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(() => app.close());

  it('GET /listings/promotions returns public Home data without a session', async () => {
    const response = await request(app.getHttpServer()).get('/listings/promotions');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ hero: null, editorsPicks: [] });
    expect(mockAuth.api.getSession).not.toHaveBeenCalled();
  });
});
