import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { createE2eApp } from './helpers/create-e2e-app';
import { seedTestData } from './helpers/seed-test-data';
import { PrismaService } from '../src/core/db/prisma.service';

describe('Scholar/Topic order-by (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    ({ app } = await createE2eApp());
    prisma = app.get(PrismaService);
    await seedTestData(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /scholars', () => {
    it('includes seeded scholars (sanity check)', async () => {
      const res = await request(app.getHttpServer()).get('/scholars').expect(200);
      expect(res.body).toHaveProperty('scholars');
      expect(Array.isArray(res.body.scholars)).toBe(true);
      const slugs = res.body.scholars.map((s: any) => s.slug);
      expect(slugs).toContain('fawzan');
      expect(slugs).toContain('uthaymin');
    });

    it('returns scholars in title→orderIndex order: allamah(0,1), sheikh, ustadh, akh, untitled', async () => {
      const res = await request(app.getHttpServer()).get('/scholars').expect(200);
      const slugs = res.body.scholars.map((s: any) => s.slug);
      const relevant = slugs.filter((s: string) =>
        [
          'fawzan',
          'uthaymin',
          'arafat',
          'mustafa-bn-mabram',
          'abdullah-al-bukhari',
          'e2e-scholar-slug',
        ].includes(s),
      );

      expect(relevant).toEqual([
        'fawzan', // allamah, orderIndex 0
        'uthaymin', // allamah, orderIndex 1
        'arafat', // sheikh, orderIndex 0
        'mustafa-bn-mabram', // ustadh, orderIndex 0
        'abdullah-al-bukhari', // akh, orderIndex 0
        'e2e-scholar-slug', // no title (null), orderIndex 0
      ]);
    });
  });

  describe('GET /topics', () => {
    it('returns topics in orderIndex order', async () => {
      const res = await request(app.getHttpServer()).get('/topics').expect(200);
      expect(Array.isArray(res.body)).toBe(true);

      const slugs = res.body.map((t: any) => t.slug);
      const relevant = slugs.filter((s: string) =>
        ['fiqh', 'aqeedah', 'hadith', 'tafsir', 'nahw'].includes(s),
      );

      // Deliberately non-alphabetical: fiqh:0, aqeedah:1, hadith:2, tafsir:3, nahw:4
      expect(relevant).toEqual(['fiqh', 'aqeedah', 'hadith', 'tafsir', 'nahw']);
    });
  });
});
