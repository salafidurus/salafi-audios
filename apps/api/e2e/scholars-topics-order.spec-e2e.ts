import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { createE2eApp } from './helpers/create-e2e-app';
import { seedTestData, cleanupE2ETestData } from './helpers/seed-test-data';
import { PrismaService } from '../src/core/db/prisma.service';

describe('Scholar/Topic order-by (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    ({ app } = await createE2eApp({ disableThrottler: true }));
    prisma = app.get(PrismaService);
    await seedTestData(prisma);
  });

  afterAll(async () => {
    await cleanupE2ETestData(prisma);
    await app.close();
  });

  describe('GET /scholars/directory', () => {
    it('includes seeded scholars (sanity check)', async () => {
      const res = await request(app.getHttpServer()).get('/v1/scholars/directory').expect(200);
      expect(res.body).toHaveProperty('scholars');
      expect(Array.isArray(res.body.scholars)).toBe(true);
      const slugs = res.body.scholars.map((s: any) => s.slug);
      expect(slugs).toContain('fawzan');
      expect(slugs).toContain('uthaymin');
    });

    it('returns scholars in title→orderIndex order: allamah, sheikh, untitled', async () => {
      const res = await request(app.getHttpServer()).get('/v1/scholars/directory').expect(200);
      const slugs = res.body.scholars.map((s: any) => s.slug);
      const relevant = slugs.filter((s: string) =>
        [
          'uthaymin',
          'fawzan',
          'bukhari',
          'mabram',
          'arafat',
          'khalid',
          'e2e-scholar-slug',
        ].includes(s),
      );

      expect(relevant).toEqual([
        'uthaymin', // allamah, orderIndex 21
        'fawzan', // allamah, orderIndex 60
        'bukhari', // allamah, orderIndex 90
        'mabram', // sheikh, orderIndex 30
        'arafat', // sheikh, orderIndex 60
        'khalid', // sheikh, orderIndex 999
        'e2e-scholar-slug', // no title (null), orderIndex 999 (default)
      ]);
    });
  });

  describe('GET /topics', () => {
    it('returns topics in orderIndex order', async () => {
      const res = await request(app.getHttpServer()).get('/v1/topics').expect(200);
      expect(Array.isArray(res.body)).toBe(true);

      const slugs = res.body.map((t: any) => t.slug);
      const relevant = slugs.filter((s: string) =>
        ['aqeedah', 'tafsir', 'hadith', 'fiqh', 'nahw'].includes(s),
      );

      // Deliberately non-alphabetical: aqeedah:0, tafsir:1, hadith:2, fiqh:3, nahw:4
      expect(relevant).toEqual(['aqeedah', 'tafsir', 'hadith', 'fiqh', 'nahw']);
    });
  });
});
