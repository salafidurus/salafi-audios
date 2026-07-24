import { Controller, Get, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../auth/decorators';
import { ConfigService } from '../config/config.service';
import { SitemapService } from './sitemap.service';
import type { Response } from 'express';

@SkipThrottle()
@Public()
@Controller()
export class SitemapController {
  constructor(
    private readonly configService: ConfigService,
    private readonly sitemapService: SitemapService,
  ) {}

  @Get('sitemap.xml')
  async getSitemap(@Res() res: Response): Promise<void> {
    if (this.configService.NODE_ENV !== 'production') {
      res.status(404).send('Not found');
      return;
    }
    const baseUrl = this.configService.SITEMAP_BASE_URL;
    if (!baseUrl) {
      res.status(503).send('Sitemap unavailable');
      return;
    }
    const sitemap = await this.sitemapService.generate(baseUrl);
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.send(sitemap);
  }

  @Get('robots.txt')
  getRobots(@Res() res: Response): void {
    res.setHeader('Content-Type', 'text/plain');
    res.send('User-agent: *\nDisallow: /\n');
  }
}
