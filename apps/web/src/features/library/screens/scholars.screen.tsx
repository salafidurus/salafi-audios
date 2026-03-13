import { publicApi } from "@/features/home/api/public-api";
import { ScholarsScreenClient } from "./scholars.screen.client";

export async function ScholarsScreen() {
  const [scholars, topics] = await Promise.all([
    (async () => {
      try {
        return await publicApi.listScholars();
      } catch {
        return [];
      }
    })(),
    (async () => {
      try {
        return await publicApi.listTopics();
      } catch {
        return [];
      }
    })(),
  ]);

  const featuredScholars = scholars.filter((s) => s.isKibar).slice(0, 10);

  const featuredWithStats = await Promise.all(
    featuredScholars.map(async (scholar) => {
      try {
        const stats = await publicApi.getScholarStats(scholar.slug);
        return {
          id: scholar.id,
          slug: scholar.slug,
          name: scholar.name,
          subtitle: "Ash-Shaykh Al-Allamah",
          bio: scholar.bio ?? undefined,
          imageUrl: scholar.imageUrl ?? undefined,
          collectionsCount: stats.collectionsCount,
          standaloneSeriesCount: stats.standaloneSeriesCount,
          standaloneLecturesCount: stats.standaloneLecturesCount,
        };
      } catch {
        return {
          id: scholar.id,
          slug: scholar.slug,
          name: scholar.name,
          subtitle: "Ash-Shaykh Al-Allamah",
          bio: scholar.bio ?? undefined,
          imageUrl: scholar.imageUrl ?? undefined,
          collectionsCount: 0,
          standaloneSeriesCount: 0,
          standaloneLecturesCount: 0,
        };
      }
    }),
  );

  return (
    <ScholarsScreenClient
      scholars={scholars}
      topics={topics}
      featuredScholars={featuredWithStats}
    />
  );
}
