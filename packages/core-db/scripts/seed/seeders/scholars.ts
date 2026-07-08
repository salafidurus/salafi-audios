/**
 * Seed scholars
 */

import type { PrismaClient } from "../../../src/generated/prisma/client.js";
import { SCHOLARS } from "../data/index.js";

export async function seedScholars(prisma: PrismaClient): Promise<void> {
  for (const scholar of SCHOLARS) {
    await prisma.scholar.create({
      data: {
        ...scholar,
        mainLanguage: "ar",
        isActive: true,
        isFeatured: false,
      },
    });
  }

  console.log(`✓ Created ${SCHOLARS.length} scholars`);
}
