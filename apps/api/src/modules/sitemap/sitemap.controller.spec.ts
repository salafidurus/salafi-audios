import { vi, describe, it, expect, beforeEach } from 'bun:test';
import { Test, TestingModule } from '@nestjs/testing';
import { SitemapController } from './sitemap.controller';
import { SitemapService } from './sitemap.service';
import { ConfigService } from '../../shared/config/config.service';

describe('SitemapController', () => {
  let controller: SitemapController;
  let sitemapService: { generate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    sitemapService = {
      generate: vi
        .fn<any>()
        .mockResolvedValue('<?xml version="1.0"?><urlset xmlns="..."></urlset>'),
    };
  });

  describe('in development environment', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [SitemapController],
        providers: [
          { provide: SitemapService, useValue: sitemapService },
          {
            provide: ConfigService,
            useValue: { NODE_ENV: 'development', SITEMAP_BASE_URL: 'https://www.salafidurus.com' },
          },
        ],
      }).compile();
      controller = module.get<SitemapController>(SitemapController);
    });

    it('returns 404 and does not call generate', async () => {
      const res = { status: vi.fn<any>().mockReturnThis(), send: vi.fn<any>() } as any;
      await controller.getSitemap(res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Not found');
      expect(sitemapService.generate).not.toHaveBeenCalled();
    });
  });

  describe('in test environment', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [SitemapController],
        providers: [
          { provide: SitemapService, useValue: sitemapService },
          {
            provide: ConfigService,
            useValue: { NODE_ENV: 'test', SITEMAP_BASE_URL: 'https://www.salafidurus.com' },
          },
        ],
      }).compile();
      controller = module.get<SitemapController>(SitemapController);
    });

    it('returns 404', async () => {
      const res = { status: vi.fn<any>().mockReturnThis(), send: vi.fn<any>() } as any;
      await controller.getSitemap(res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('in production environment', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [SitemapController],
        providers: [
          { provide: SitemapService, useValue: sitemapService },
          {
            provide: ConfigService,
            useValue: { NODE_ENV: 'production', SITEMAP_BASE_URL: 'https://www.salafidurus.com' },
          },
        ],
      }).compile();
      controller = module.get<SitemapController>(SitemapController);
    });

    it('calls generate with base URL and returns XML with correct headers', async () => {
      const res = { setHeader: vi.fn<any>().mockReturnThis(), send: vi.fn<any>() } as any;
      await controller.getSitemap(res);
      expect(sitemapService.generate).toHaveBeenCalledWith('https://www.salafidurus.com');
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/xml');
      expect(res.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'public, max-age=3600, s-maxage=3600',
      );
      expect(res.send).toHaveBeenCalledWith('<?xml version="1.0"?><urlset xmlns="..."></urlset>');
    });

    it('returns 503 when SITEMAP_BASE_URL is missing', async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [SitemapController],
        providers: [
          { provide: SitemapService, useValue: sitemapService },
          {
            provide: ConfigService,
            useValue: { NODE_ENV: 'production', SITEMAP_BASE_URL: undefined },
          },
        ],
      }).compile();
      const ctrl = module.get<SitemapController>(SitemapController);
      const res = { status: vi.fn<any>().mockReturnThis(), send: vi.fn<any>() } as any;
      await ctrl.getSitemap(res);
      expect(res.status).toHaveBeenCalledWith(503);
      expect(sitemapService.generate).not.toHaveBeenCalled();
    });
  });

  describe('robots.txt', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [SitemapController],
        providers: [
          { provide: SitemapService, useValue: sitemapService },
          { provide: ConfigService, useValue: { NODE_ENV: 'development' } },
        ],
      }).compile();
      controller = module.get<SitemapController>(SitemapController);
    });

    it('always returns Disallow for all, regardless of environment', async () => {
      const res = { setHeader: vi.fn<any>().mockReturnThis(), send: vi.fn<any>() } as any;
      controller.getRobots(res);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/plain');
      expect(res.send).toHaveBeenCalledWith('User-agent: *\nDisallow: /\n');
    });
  });
});
