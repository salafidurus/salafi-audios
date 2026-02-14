import { publicApi } from "@/features/home/api/public-api";
import type {
  RecommendationHeroItem,
  RecommendationItem as ApiRecommendationItem,
  RecommendationPage,
} from "@/features/home/api/public-api";
import type { RecommendationItem, Stats, Tab } from "@/features/home/types/home.types";
import type { TopicDetail, TopicLecture } from "@/features/library/types/library.types";
import {
  buildHomeContent,
  buildHomeStats,
  selectPreferredTopic,
  type ScholarBundle,
} from "@/features/home/utils/content";

export type HomeViewModel = {
  heroItems: RecommendationHeroItem[];
  tabs: Tab[];
  stats: Stats;
  leadLecture: { title: string; scholarName: string } | null;
};

function buildRecommendationHref(item: ApiRecommendationItem): string {
  if (!item.scholarSlug) return "/";

  if (item.kind === "lecture") {
    return `/lectures/${item.scholarSlug}/${item.entitySlug}`;
  }

  if (item.kind === "series") {
    return `/series/${item.scholarSlug}/${item.entitySlug}`;
  }

  return `/collections/${item.scholarSlug}/${item.entitySlug}`;
}

function mapRecommendationItem(item: ApiRecommendationItem): RecommendationItem {
  return {
    id: item.entityId,
    kind: item.kind,
    title: item.title,
    subtitle: item.scholarName,
    href: buildRecommendationHref(item),
    coverImageUrl: item.coverImageUrl ?? undefined,
    lessonCount: item.lessonCount ?? undefined,
    totalDurationSeconds: item.totalDurationSeconds ?? undefined,
  };
}

function mapRecommendationPage(page: RecommendationPage): {
  items: RecommendationItem[];
  nextCursor?: string;
} {
  return {
    items: page.items.map(mapRecommendationItem),
    nextCursor: page.nextCursor ?? undefined,
  };
}

export async function loadHomeViewModel(): Promise<HomeViewModel> {
  // Intentionally tolerate missing NEXT_PUBLIC_API_URL in CI build environments.
  const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await fn();
    } catch {
      return fallback;
    }
  };

  const noStore = { cache: "no-store" as const };

  const heroItems = await safe(() => publicApi.listRecommendationHero(), []);
  const scholars = await safe(() => publicApi.listScholars(noStore), []);

  const featuredScholars = scholars.slice(0, 8);
  const scholarBundles: ScholarBundle[] = await Promise.all(
    featuredScholars.map(async (scholar) => ({
      scholar,
      series: await safe(() => publicApi.listScholarSeries(scholar.slug, noStore), []),
      collections: await safe(() => publicApi.listScholarCollections(scholar.slug, noStore), []),
      lectures: await safe(() => publicApi.listScholarLectures(scholar.slug, noStore), []),
    })),
  );

  const lectureBuckets = await Promise.all(
    scholars.map((scholar) => safe(() => publicApi.listScholarLectures(scholar.slug, noStore), [])),
  );

  const topics = await safe(() => publicApi.listTopics(), []);
  const preferredTopic: TopicDetail | null = selectPreferredTopic(topics);
  const topicLectures: TopicLecture[] = preferredTopic
    ? await safe(() => publicApi.listTopicLectures(preferredTopic.slug, 8), [])
    : [];

  const kibarPage = await safe<RecommendationPage>(() => publicApi.listRecommendationKibar(8), {
    items: [],
  });
  const topicPage = preferredTopic
    ? await safe<RecommendationPage>(
        () => publicApi.listRecommendationTopic(preferredTopic.slug, 8),
        { items: [] },
      )
    : { items: [] };
  const mappedKibar = mapRecommendationPage(kibarPage);
  const mappedTopic = mapRecommendationPage(topicPage);

  const stats = buildHomeStats(scholars, lectureBuckets);
  const { tabs, leadLecture } = buildHomeContent({
    scholars,
    scholarBundles,
    lectureBuckets,
    preferredTopic,
    topicLectures,
    kibarItems: mappedKibar.items,
    topicItems: mappedTopic.items,
    kibarCursor: mappedKibar.nextCursor,
    topicCursor: mappedTopic.nextCursor,
  });

  return {
    heroItems,
    tabs,
    stats,
    leadLecture,
  };
}
