/**
 * Seed scholars
 */

import type { PrismaClient } from "../../../src/generated/prisma/client.js";
import { SCHOLARS } from "../data/index.js";

export async function seedScholars(prisma: PrismaClient): Promise<void> {
  for (const scholar of SCHOLARS) {
    await prisma.scholar.upsert({
      where: { id: scholar.id },
      update: {
        slug: scholar.slug,
        name: scholar.name,
        bio: scholar.bio,
        country: scholar.country,
        mainLanguage: scholar.mainLanguage,
      },
      create: {
        ...scholar,
        isActive: true,
      },
    });
  }

  console.log(`✓ Seeded ${SCHOLARS.length} scholars`);
}
