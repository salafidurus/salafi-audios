import { Module } from '@nestjs/common';
import { SitemapController } from './sitemap.controller';
import { SitemapRepo } from './sitemap.repo';
import { SitemapService } from './sitemap.service';

@Module({
  controllers: [SitemapController],
  providers: [SitemapRepo, SitemapService],
})
export class SitemapModule {}
