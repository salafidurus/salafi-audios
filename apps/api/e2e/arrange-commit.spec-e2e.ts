process.env.DISABLE_THROTTLER = 'true';

import { createE2eApp } from './helpers/create-e2e-app';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { PrismaService } from '../src/core/db/prisma.service';
import { TestAuthFactory } from './helpers/test-auth.factory';
import { Permission } from '@sd/core-db';
import { TEST_SCHOLAR_ID, seedTestData } from './helpers/seed-test-data';

const SERIES_ID = 'b0000000-0000-0000-0000-000000000201';
const SERIES_SLUG = 'e2e-arrange-series';
const COLLECTION_ID = 'b0000000-0000-0000-0000-000000000202';
const COLLECTION_SLUG = 'e2e-arrange-collection';
const TAKEN_ID = 'b0000000-0000-0000-0000-000000000203';
const TAKEN_SLUG = `${SERIES_SLUG}-taken`;

const audio = (slug: string) => ({
  objectKey: `audio/${SERIES_SLUG}/${slug}.mp3`,
  durationSeconds: 600,
  sizeBytes: 1024,
  format: 'mp3',
});

describe('Arrange commit (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let authFactory: TestAuthFactory;
  let creatorHeaders: Record<string, string>;

  beforeAll(async () => {
    ({ app } = await createE2eApp({ disableThrottler: true }));
    prisma = app.get(PrismaService);
    authFactory = new TestAuthFactory(prisma);
    await seedTestData(prisma);

    for (const [id, slug, format] of [
      [SERIES_ID, SERIES_SLUG, 'series'],
      [COLLECTION_ID, COLLECTION_SLUG, 'collection'],
      [TAKEN_ID, TAKEN_SLUG, 'single'],
    ] as const) {
      await prisma.listing.upsert({
        where: { id },
        update: {},
        create: {
          id,
          slug,
          title: slug,
          format,
          status: 'published',
          language: 'ar',
          scholarId: TEST_SCHOLAR_ID,
        },
      });
    }

    const auth = await authFactory.createAdminUser([
      Permission.LISTINGS_CREATE,
      Permission.LISTINGS_EDIT,
    ]);
    creatorHeaders = auth.headers;
  });

  afterAll(async () => {
    // Delete everything this suite created under the two arrange roots.
    const roots = [SERIES_ID, COLLECTION_ID];
    const children = await prisma.listing.findMany({
      where: { parentId: { in: roots } },
      select: { id: true },
    });
    const childIds = children.map((c) => c.id);
    await prisma.listing.deleteMany({ where: { parentId: { in: childIds } } });
    await prisma.listing.deleteMany({ where: { id: { in: childIds } } });
    await prisma.listing.deleteMany({ where: { id: { in: [...roots, TAKEN_ID] } } });
    await authFactory.cleanup();
    await app.close();
  });

  it('creates lessons with audio assets under a series and syncs counters', async () => {
    const res = await request(app.getHttpServer())
      .post(`/admin/listings/${SERIES_ID}/arrange-commit`)
      .set(creatorHeaders)
      .send({
        lessons: [
          {
            op: 'create',
            slug: `${SERIES_SLUG}-kalam`,
            title: 'Al-Kalam',
            status: 'published',
            orderIndex: 1,
            audio: audio(`${SERIES_SLUG}-kalam`),
          },
          {
            op: 'create',
            slug: `${SERIES_SLUG}-asmaa`,
            title: 'Al-Asmaa',
            status: 'published',
            orderIndex: 2,
            audio: audio(`${SERIES_SLUG}-asmaa`),
          },
        ],
      })
      .expect(201);

    expect(res.body).toEqual({
      createdModules: 0,
      createdLessons: 2,
      updatedModules: 0,
      updatedLessons: 0,
    });

    const lesson = await prisma.listing.findUnique({
      where: { slug: `${SERIES_SLUG}-kalam` },
      include: { audioAssets: true },
    });
    expect(lesson?.parentId).toBe(SERIES_ID);
    expect(lesson?.scholarId).toBe(TEST_SCHOLAR_ID);
    expect(lesson?.format).toBe('single');
    expect(lesson?.publishedAt).not.toBeNull();
    expect(lesson?.audioAssets).toHaveLength(1);
    expect(lesson?.audioAssets[0]?.isPrimary).toBe(true);
    expect(lesson?.audioAssets[0]?.objectKey).toBe(`audio/${SERIES_SLUG}/${SERIES_SLUG}-kalam.mp3`);
    expect(lesson?.audioAssets[0]?.url).toContain(`${SERIES_SLUG}-kalam.mp3`);

    const root = await prisma.listing.findUnique({ where: { id: SERIES_ID } });
    expect(root?.publishedLectureCount).toBe(2);
    expect(root?.publishedDurationSeconds).toBe(1200);
  });

  it('updates an existing lesson (metadata + replacement audio)', async () => {
    const existing = await prisma.listing.findUnique({
      where: { slug: `${SERIES_SLUG}-asmaa` },
      select: { id: true },
    });

    await request(app.getHttpServer())
      .post(`/admin/listings/${SERIES_ID}/arrange-commit`)
      .set(creatorHeaders)
      .send({
        lessons: [
          {
            op: 'update',
            id: existing!.id,
            title: 'Al-Asmaa (revised)',
            audio: { ...audio(`${SERIES_SLUG}-asmaa`), durationSeconds: 900 },
          },
        ],
      })
      .expect(201);

    const updated = await prisma.listing.findUnique({
      where: { id: existing!.id },
      include: { audioAssets: true },
    });
    expect(updated?.title).toBe('Al-Asmaa (revised)');
    expect(updated?.durationSeconds).toBe(900);
    expect(updated?.audioAssets).toHaveLength(1);
    expect(updated?.audioAssets[0]?.durationSeconds).toBe(900);
  });

  it('creates a module with nested lessons under a collection', async () => {
    await request(app.getHttpServer())
      .post(`/admin/listings/${COLLECTION_ID}/arrange-commit`)
      .set(creatorHeaders)
      .send({
        modules: [
          {
            op: 'create',
            slug: `${COLLECTION_SLUG}-ilm`,
            title: 'Book of Knowledge',
            status: 'published',
            orderIndex: 1,
            lessons: [
              {
                op: 'create',
                slug: `${COLLECTION_SLUG}-ilm-hadith1`,
                title: 'Hadith 1',
                status: 'published',
                audio: audio(`${COLLECTION_SLUG}-ilm-hadith1`),
              },
            ],
          },
        ],
      })
      .expect(201);

    const moduleRow = await prisma.listing.findUnique({
      where: { slug: `${COLLECTION_SLUG}-ilm` },
    });
    expect(moduleRow?.format).toBe('series');
    expect(moduleRow?.parentId).toBe(COLLECTION_ID);
    expect(moduleRow?.publishedLectureCount).toBe(1);

    const lessonRow = await prisma.listing.findUnique({
      where: { slug: `${COLLECTION_SLUG}-ilm-hadith1` },
    });
    expect(lessonRow?.parentId).toBe(moduleRow?.id);

    const collection = await prisma.listing.findUnique({ where: { id: COLLECTION_ID } });
    expect(collection?.publishedLectureCount).toBe(1);
  });

  it("rejects a lesson nested under a new module when it only satisfies the root prefix, not the module's own slug", async () => {
    const res = await request(app.getHttpServer())
      .post(`/admin/listings/${COLLECTION_ID}/arrange-commit`)
      .set(creatorHeaders)
      .send({
        modules: [
          {
            op: 'create',
            slug: `${COLLECTION_SLUG}-fiqh`,
            title: 'Book of Fiqh',
            lessons: [
              {
                // Starts with the root's prefix, but not with the new module's
                // own slug (`${COLLECTION_SLUG}-fiqh-`) — must be rejected.
                op: 'create',
                slug: `${COLLECTION_SLUG}-wrong-parent`,
                title: 'Wrong Parent',
                audio: audio(`${COLLECTION_SLUG}-wrong-parent`),
              },
            ],
          },
        ],
      })
      .expect(400);

    expect(res.body.message).toContain(`${COLLECTION_SLUG}-fiqh-`);

    const moduleRow = await prisma.listing.findUnique({
      where: { slug: `${COLLECTION_SLUG}-fiqh` },
    });
    expect(moduleRow).toBeNull();
  });

  it("rejects a lesson nested under an existing module when it only satisfies the root prefix, not the module's actual DB slug", async () => {
    const moduleRow = await prisma.listing.findUnique({
      where: { slug: `${COLLECTION_SLUG}-ilm` },
      select: { id: true },
    });

    await request(app.getHttpServer())
      .post(`/admin/listings/${COLLECTION_ID}/arrange-commit`)
      .set(creatorHeaders)
      .send({
        modules: [
          {
            op: 'update',
            id: moduleRow!.id,
            lessons: [
              {
                op: 'create',
                slug: `${COLLECTION_SLUG}-not-under-ilm`,
                title: 'Not Under Ilm',
                audio: audio(`${COLLECTION_SLUG}-not-under-ilm`),
              },
            ],
          },
        ],
      })
      .expect(400);

    const lessonRow = await prisma.listing.findUnique({
      where: { slug: `${COLLECTION_SLUG}-not-under-ilm` },
    });
    expect(lessonRow).toBeNull();
  });

  it("accepts a lesson correctly prefixed by an existing module's actual slug", async () => {
    const moduleRow = await prisma.listing.findUnique({
      where: { slug: `${COLLECTION_SLUG}-ilm` },
      select: { id: true },
    });

    await request(app.getHttpServer())
      .post(`/admin/listings/${COLLECTION_ID}/arrange-commit`)
      .set(creatorHeaders)
      .send({
        modules: [
          {
            op: 'update',
            id: moduleRow!.id,
            lessons: [
              {
                op: 'create',
                slug: `${COLLECTION_SLUG}-ilm-hadith2`,
                title: 'Hadith 2',
                audio: audio(`${COLLECTION_SLUG}-ilm-hadith2`),
              },
            ],
          },
        ],
      })
      .expect(201);

    const lessonRow = await prisma.listing.findUnique({
      where: { slug: `${COLLECTION_SLUG}-ilm-hadith2` },
    });
    expect(lessonRow?.parentId).toBe(moduleRow!.id);
  });

  it('returns 409 with conflictingSlugs and rolls the whole commit back', async () => {
    const res = await request(app.getHttpServer())
      .post(`/admin/listings/${SERIES_ID}/arrange-commit`)
      .set(creatorHeaders)
      .send({
        lessons: [
          {
            op: 'create',
            slug: `${SERIES_SLUG}-fresh`,
            title: 'Fresh',
            audio: audio(`${SERIES_SLUG}-fresh`),
          },
          {
            op: 'create',
            slug: TAKEN_SLUG,
            title: 'Taken',
            audio: audio(TAKEN_SLUG),
          },
        ],
      })
      .expect(409);

    expect(res.body.conflictingSlugs).toEqual([TAKEN_SLUG]);

    const fresh = await prisma.listing.findUnique({ where: { slug: `${SERIES_SLUG}-fresh` } });
    expect(fresh).toBeNull();
  });

  it('rejects update targets that are not under the root', async () => {
    await request(app.getHttpServer())
      .post(`/admin/listings/${COLLECTION_ID}/arrange-commit`)
      .set(creatorHeaders)
      .send({
        modules: [{ op: 'update', id: TAKEN_ID, lessons: [] }],
      })
      .expect(400);
  });

  it('rejects commits without LISTINGS_CREATE permission', async () => {
    const viewer = await authFactory.createAdminUser([Permission.LISTINGS_EDIT]);
    await request(app.getHttpServer())
      .post(`/admin/listings/${SERIES_ID}/arrange-commit`)
      .set(viewer.headers)
      .send({ lessons: [] })
      .expect(403);
  });

  it('GET arrange-data returns the children tree including drafts', async () => {
    const res = await request(app.getHttpServer())
      .get(`/admin/listings/${SERIES_ID}/arrange-data`)
      .set(creatorHeaders)
      .expect(200);

    expect(res.body.format).toBe('series');
    expect(res.body.slug).toBe(SERIES_SLUG);
    expect(res.body.lessons.length).toBeGreaterThanOrEqual(2);
    expect(res.body.lessons[0]).toMatchObject({
      slug: `${SERIES_SLUG}-kalam`,
      hasAudio: true,
    });
    expect(res.body.modules).toEqual([]);
  });
});
