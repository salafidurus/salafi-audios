/**
 * Seed scholars
 */

import type { PrismaClient } from "../../../src/generated/primary/client.js";

import { SCHOLARS } from "../data/index.js";

export async function seedScholars(prisma: PrismaClient): Promise<void> {
  for (const scholar of SCHOLARS) {
    await prisma.scholar.upsert({
      where: { id: scholar.id },
      update: {
        slug: scholar.slug,
        name: scholar.name,
        bio: scholar.bio,
        ...(scholar.imageUrl !== undefined && { imageUrl: scholar.imageUrl }),
        ...(scholar.imageKey !== undefined && { imageKey: scholar.imageKey }),
        country: scholar.country,
        mainLanguage: scholar.mainLanguage,
        title: scholar.title,
        orderIndex: scholar.orderIndex,
      },
      create: {
        id: scholar.id,
        slug: scholar.slug,
        name: scholar.name,
        bio: scholar.bio,
        imageUrl: scholar.imageUrl,
        imageKey: scholar.imageKey,
        country: scholar.country,
        mainLanguage: scholar.mainLanguage,
        title: scholar.title,
        orderIndex: scholar.orderIndex,
        isActive: true,
      },
    });

    // Arabic is the main language (scholar.name/bio above) — mirror the
    // English name/bio into a ScholarTranslation, matching the sync
    // behavior admin edits get via syncMainLanguageTranslation.
    if (scholar.nameEn) {
      await prisma.scholarTranslation.upsert({
        where: { scholarId_locale: { scholarId: scholar.id, locale: "en" } },
        update: { name: scholar.nameEn, bio: scholar.bioEn ?? null, status: "published" },
        create: {
          scholarId: scholar.id,
          locale: "en",
          name: scholar.nameEn,
          bio: scholar.bioEn ?? null,
          status: "published",
        },
      });
    }
  }

  console.log(`✓ Seeded ${SCHOLARS.length} scholars`);
}
