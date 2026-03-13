import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicApi, PublicApiError } from "@/features/home/api/public-api";
import type { ScholarStats, RecommendationItem } from "@/features/home/api/public-api";
import { tryGetWebEnv } from "@/shared/utils/env";
import { ScholarDetailContent } from "@/features/library/components/scholar-detail-content/scholar-detail-content";
import { Shell } from "@/features/library/components/layout/shell/shell";
import { canonical } from "@/features/library/utils/seo";

type SeriesItem = Awaited<ReturnType<typeof publicApi.listScholarSeries>>[number];
type ScholarPageData = {
  scholar: Awaited<ReturnType<typeof publicApi.getScholar>>;
  stats: ScholarStats | null;
  collections: Awaited<ReturnType<typeof publicApi.listScholarCollections>>;
  seriesInCollections: SeriesItem[];
  standaloneSeries: SeriesItem[];
  popularLectures: RecommendationItem[];
};

type ScholarRouteProps = {
  params: Promise<{ scholarSlug: string }>;
};

async function loadScholarPage(scholarSlug: string): Promise<ScholarPageData> {
  if (!tryGetWebEnv()) {
    notFound();
  }

  try {
    const [scholar, statsResult, collections, series, popularResult] = await Promise.all([
      publicApi.getScholar(scholarSlug),
      publicApi.getScholarStats(scholarSlug).catch(() => null),
      publicApi.listScholarCollections(scholarSlug),
      publicApi.listScholarSeries(scholarSlug),
      publicApi.listScholarPopular(scholarSlug, 5).catch(() => ({ items: [] })),
    ]);

    const seriesInCollections = series.filter((item: SeriesItem) => Boolean(item.collectionId));
    const standaloneSeries = series.filter((item: SeriesItem) => !item.collectionId);

    return {
      scholar,
      stats: statsResult,
      collections,
      seriesInCollections,
      standaloneSeries,
      popularLectures: popularResult.items,
    };
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      notFound();
    }

    notFound();
  }
}

export async function getScholarMetadata({ params }: ScholarRouteProps): Promise<Metadata> {
  const { scholarSlug } = await params;

  if (!tryGetWebEnv()) {
    return {
      title: "Scholar",
      alternates: { canonical: canonical(`/scholars/${scholarSlug}`) },
    };
  }

  try {
    const scholar = await publicApi.getScholar(scholarSlug);
    return {
      title: scholar.name,
      description: scholar.bio ?? `Published library for ${scholar.name}.`,
      alternates: { canonical: canonical(`/scholars/${scholarSlug}`) },
    };
  } catch {
    return {
      title: "Scholar",
      alternates: { canonical: canonical(`/scholars/${scholarSlug}`) },
    };
  }
}

export async function ScholarDetailScreen({ params }: ScholarRouteProps) {
  const { scholarSlug } = await params;
  const { scholar, stats, collections, seriesInCollections, standaloneSeries, popularLectures } =
    await loadScholarPage(scholarSlug);

  return (
    <Shell title={scholar.name} hideHeader>
      <ScholarDetailContent
        scholar={scholar}
        stats={stats}
        collections={collections}
        seriesInCollections={seriesInCollections}
        standaloneSeries={standaloneSeries}
        popularLectures={popularLectures}
      />
    </Shell>
  );
}
