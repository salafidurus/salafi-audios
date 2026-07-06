import { Injectable } from '@nestjs/common';
import { SitemapRepo } from './sitemap.repo';

@Injectable()
export class SitemapService {
  constructor(private readonly repo: SitemapRepo) {}

  async generate(baseUrl: string): Promise<string> {
    const [scholars, listings] = await Promise.all([
      this.repo.findActiveScholars(),
      this.repo.findPublishedTopLevelListings(),
    ]);

    const urls: string[] = [];

    for (const scholar of scholars) {
      urls.push(
        this.buildUrlEntry({
          loc: `${baseUrl}/scholars/${scholar.slug}`,
          lastmod: this.formatDate(scholar.updatedAt),
          changefreq: 'monthly',
          priority: '0.8',
        }),
      );
    }

    for (const listing of listings) {
      urls.push(
        this.buildUrlEntry({
          loc: `${baseUrl}/listing/${listing.slug}`,
          lastmod: this.formatDate(listing.updatedAt),
          changefreq: 'weekly',
          priority: '0.6',
        }),
      );
    }

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls,
      '</urlset>',
    ].join('\n');
  }

  private formatDate(date: Date | null | undefined): string {
    if (!date) return new Date().toISOString().split('T')[0];
    return date.toISOString().split('T')[0];
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private buildUrlEntry(fields: {
    loc: string;
    lastmod: string;
    changefreq: string;
    priority: string;
  }): string {
    const loc = this.escapeXml(fields.loc);
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${fields.lastmod}</lastmod>`,
      `    <changefreq>${fields.changefreq}</changefreq>`,
      `    <priority>${fields.priority}</priority>`,
      '  </url>',
    ].join('\n');
  }
}
