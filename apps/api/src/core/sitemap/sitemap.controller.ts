import { Controller, Get, Res, VERSION_NEUTRAL } from '@nestjs/common';
import { RateLimitPolicy } from '../security/rate-limit.decorator';
import { Public } from '../auth/decorators';
import { ConfigService } from '../config/config.service';
import { SitemapService } from './sitemap.service';
import type { FastifyReply } from 'fastify';

/** NestJS sitemap controller service or controller coordinating the API boundary for this responsibility. */
@RateLimitPolicy('public-read')
@Public()
@Controller({ path: '', version: VERSION_NEUTRAL })
/** Core API sitemap.controller module providing shared backend infrastructure and authority-boundary services. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class SitemapController {
  constructor(
    private readonly configService: ConfigService,
    private readonly sitemapService: SitemapService,
  ) {}

  @Get('sitemap.xml')
  async getSitemap(@Res() res: FastifyReply): Promise<void> {
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
    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.send(sitemap);
  }

  @Get('robots.txt')
  getRobots(@Res() res: FastifyReply): void {
    res.header('Content-Type', 'text/plain');
    res.send('User-agent: *\nDisallow: /\n');
  }
}
