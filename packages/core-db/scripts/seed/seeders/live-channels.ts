/**
 * Seed live channels
 */

import type { PrismaClient } from "../../../src/generated/prisma/client.js";
import { LIVE_CHANNELS, SCHOLARS } from "../data/index.js";

export async function seedLiveChannels(prisma: PrismaClient): Promise<void> {
  for (const ch of LIVE_CHANNELS) {
    await prisma.livestreamChannel.upsert({
      where: { id: ch.id },
      update: {
        telegramId: ch.telegramId,
        telegramSlug: ch.telegramSlug,
        displayName: ch.displayName,
      },
      create: {
        id: ch.id,
        scholarId: SCHOLARS[ch.scholarIdx].id,
        telegramId: ch.telegramId,
        telegramSlug: ch.telegramSlug,
        displayName: ch.displayName,
        isActive: true,
      },
    });
  }

  console.log(`✓ Seeded ${LIVE_CHANNELS.length} live channels`);
}
