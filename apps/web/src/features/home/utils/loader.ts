import { publicApi } from "@/features/home/api/public-api";
import type { FeaturedItem } from "@/features/home/api/public-api";
import type { Stats, Tab } from "@/features/home/types/home.types";
import type { TopicDetail, TopicLecture } from "@/features/library/types/library.types";
import {
  buildHomeContent,
  buildHomeStats,
  selectPreferredTopic,
  type ScholarBundle,
} from "@/features/home/utils/content";

export type HomeViewModel = {
  heroItems: FeaturedItem[];
  tabs: Tab[];
  stats: Stats;
  leadLecture: { title: string; scholarName: string } | null;
};

export async function loadHomeViewModel(): Promise<HomeViewModel> {
  // Intentionally tolerate missing NEXT_PUBLIC_API_URL in CI build environments.
  const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await fn();
    } catch {
      return fallback;
    }
  };

  const heroItems = await safe(() => publicApi.listFeatured(), []);
  const scholars = await safe(() => publicApi.listScholars(), []);

  const featuredScholars = scholars.slice(0, 8);
  const scholarBundles: ScholarBundle[] = await Promise.all(
    featuredScholars.map(async (scholar) => ({
      scholar,
      series: await safe(() => publicApi.listScholarSeries(scholar.slug), []),
      collections: await safe(() => publicApi.listScholarCollections(scholar.slug), []),
      lectures: await safe(() => publicApi.listScholarLectures(scholar.slug), []),
    })),
  );

  const lectureBuckets = await Promise.all(
    scholars.map((scholar) => safe(() => publicApi.listScholarLectures(scholar.slug), [])),
  );

  const topics = await safe(() => publicApi.listTopics(), []);
  const preferredTopic: TopicDetail | null = selectPreferredTopic(topics);
  const topicLectures: TopicLecture[] = preferredTopic
    ? await safe(() => publicApi.listTopicLectures(preferredTopic.slug, 8), [])
    : [];

  const stats = buildHomeStats(scholars, lectureBuckets);
  const { tabs, leadLecture } = buildHomeContent({
    scholars,
    scholarBundles,
    lectureBuckets,
    preferredTopic,
    topicLectures,
  });

  return {
    heroItems,
    tabs,
    stats,
    leadLecture,
  };
}
