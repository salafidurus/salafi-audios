import { Module } from '@nestjs/common';
import { SitemapController } from './sitemap.controller';
import { SitemapRepo } from './sitemap.repo';
import { SitemapService } from './sitemap.service';

/** Core API sitemap.module module providing shared backend infrastructure and authority-boundary services. */
@Module({
  controllers: [SitemapController],
  providers: [SitemapRepo, SitemapService],
})
/** NestJS sitemap module service or controller coordinating the API boundary for this responsibility. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class SitemapModule {}
