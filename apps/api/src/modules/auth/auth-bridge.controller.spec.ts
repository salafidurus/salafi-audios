import { vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AuthBridgeController } from './auth-bridge.controller';
import { ConfigService } from '../../shared/config/config.service';

const mockAuth = { api: { generateOneTimeToken: vi.fn() } };
vi.mock('./auth.instance', () => ({ getAuth: () => mockAuth }));

describe('AuthBridgeController — OAuth handoff', () => {
  let app: NestFastifyApplication;
  const WEB = 'http://localhost:3000';

  beforeEach(async () => {
    mockAuth.api.generateOneTimeToken.mockReset();

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthBridgeController],
      providers: [{ provide: ConfigService, useValue: { CORS_ORIGINS: [WEB] } }],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(() => app.close());

  it('redirects to the web target with a one-time token on success', async () => {
    mockAuth.api.generateOneTimeToken.mockResolvedValue({ token: 'tok_123' });

    const redirect = `${WEB}/auth/callback?redirect=%2Flibrary`;
    const res = await request(app.getHttpServer())
      .get('/auth-bridge/oauth-complete')
      .query({ redirect })
      .expect(302);

    expect(res.headers.location).toContain(`${WEB}/auth/callback`);
    expect(res.headers.location).toContain('ott=tok_123');
  });

  it('redirects to sign-in when no session/token is available', async () => {
    mockAuth.api.generateOneTimeToken.mockRejectedValue(new Error('no session'));

    const res = await request(app.getHttpServer())
      .get('/auth-bridge/oauth-complete')
      .query({ redirect: `${WEB}/auth/callback` })
      .expect(302);

    expect(res.headers.location).toBe(`${WEB}/sign-in`);
    expect(res.headers.location).not.toContain('ott=');
  });

  it('rejects a redirect to a non-allowlisted origin without minting a token', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth-bridge/oauth-complete')
      .query({ redirect: 'https://evil.example.com/steal' })
      .expect(302);

    expect(res.headers.location).toBe(`${WEB}/sign-in`);
    expect(mockAuth.api.generateOneTimeToken).not.toHaveBeenCalled();
  });

  it('redirects to sign-in when the redirect param is missing', async () => {
    const res = await request(app.getHttpServer()).get('/auth-bridge/oauth-complete').expect(302);

    expect(res.headers.location).toBe(`${WEB}/sign-in`);
    expect(mockAuth.api.generateOneTimeToken).not.toHaveBeenCalled();
  });
});
