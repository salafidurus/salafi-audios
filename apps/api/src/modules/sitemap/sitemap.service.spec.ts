import { vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { SitemapService } from './sitemap.service';
import { SitemapRepo } from './sitemap.repo';

describe('SitemapService', () => {
  let service: SitemapService;
  let repo: {
    findActiveScholars: ReturnType<typeof vi.fn>;
    findPublishedTopLevelListings: ReturnType<typeof vi.fn>;
  };

  const baseUrl = 'https://www.salafidurus.com';

  const mockScholars = [
    { slug: 'al-albani', updatedAt: new Date('2024-01-15') },
    { slug: 'ibn-baz', updatedAt: new Date('2024-02-20') },
  ];

  const mockListings = [
    { slug: 'tawheed-explained', updatedAt: new Date('2024-03-10') },
    { slug: 'sunnah-collection', updatedAt: new Date('2024-01-05') },
  ];

  beforeEach(async () => {
    repo = {
      findActiveScholars: vi.fn<any>().mockResolvedValue(mockScholars),
      findPublishedTopLevelListings: vi.fn<any>().mockResolvedValue(mockListings),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SitemapService, { provide: SitemapRepo, useValue: repo }],
    }).compile();

    service = module.get<SitemapService>(SitemapService);
  });

  it('generates XML with correct scholar URLs', async () => {
    const xml = await service.generate(baseUrl);
    expect(xml).toContain('<loc>https://www.salafidurus.com/scholars/al-albani</loc>');
    expect(xml).toContain('<loc>https://www.salafidurus.com/scholars/ibn-baz</loc>');
  });

  it('generates XML with correct listing URLs', async () => {
    const xml = await service.generate(baseUrl);
    expect(xml).toContain('<loc>https://www.salafidurus.com/listing/tawheed-explained</loc>');
    expect(xml).toContain('<loc>https://www.salafidurus.com/listing/sunnah-collection</loc>');
  });

  it('includes lastmod dates as YYYY-MM-DD', async () => {
    const xml = await service.generate(baseUrl);
    expect(xml).toContain('<lastmod>2024-01-15</lastmod>');
    expect(xml).toContain('<lastmod>2024-02-20</lastmod>');
    expect(xml).toContain('<lastmod>2024-03-10</lastmod>');
  });

  it('uses correct priority and changefreq for scholars vs listings', async () => {
    const xml = await service.generate(baseUrl);
    const scholarEntry = xml.match(/<url>[\s\S]*?scholars\/al-albani[\s\S]*?<\/url>/);
    expect(scholarEntry?.[0]).toContain('<changefreq>monthly</changefreq>');
    expect(scholarEntry?.[0]).toContain('<priority>0.8</priority>');
    const listingEntry = xml.match(/<url>[\s\S]*?listing\/tawheed-explained[\s\S]*?<\/url>/);
    expect(listingEntry?.[0]).toContain('<changefreq>weekly</changefreq>');
    expect(listingEntry?.[0]).toContain('<priority>0.6</priority>');
  });

  it('produces valid XML with xml declaration and urlset wrapper', async () => {
    const xml = await service.generate(baseUrl);
    expect(xml).toMatch(/^<\?xml version="1.0" encoding="UTF-8"\?>/);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain('</urlset>');
  });

  it('delegates to repo for active scholars and published top-level listings', async () => {
    await service.generate(baseUrl);
    expect(repo.findActiveScholars).toHaveBeenCalledOnce();
    expect(repo.findPublishedTopLevelListings).toHaveBeenCalledOnce();
  });

  it('returns sitemap with homepage entry when there are no scholars or listings', async () => {
    repo.findActiveScholars.mockResolvedValue([]);
    repo.findPublishedTopLevelListings.mockResolvedValue([]);
    const xml = await service.generate(baseUrl);
    expect(xml).toContain('<urlset');
    expect(xml).toContain('</urlset>');
    expect(xml.match(/<url>/g)).toHaveLength(1);
    expect(xml).toContain(`<loc>${baseUrl}</loc>`);
  });

  it('XML-escapes special characters in slugs', async () => {
    repo.findActiveScholars.mockResolvedValue([
      { slug: 'foo&bar', updatedAt: new Date('2024-01-01') },
    ]);
    repo.findPublishedTopLevelListings.mockResolvedValue([]);
    const xml = await service.generate(baseUrl);
    expect(xml).toContain('<loc>https://www.salafidurus.com/scholars/foo&amp;bar</loc>');
    expect(xml).not.toContain('foo&bar</loc>');
  });
});
