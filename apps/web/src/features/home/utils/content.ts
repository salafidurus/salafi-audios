import { formatDuration } from "@/features/library/utils/format";
import type { RecommendationItem, Stats, Tab } from "@/features/home/types/home.types";
import type {
  Collection,
  Lecture,
  Scholar,
  Series,
  TopicDetail,
  TopicLecture,
} from "@/features/library/types/library.types";

export type ScholarBundle = {
  scholar: Scholar;
  series: Series[];
  collections: Collection[];
  lectures: Lecture[];
};

export type HomeContentContext = {
  scholars: Scholar[];
  scholarBundles: ScholarBundle[];
  lectureBuckets: Lecture[][];
  preferredTopic: TopicDetail | null;
  topicLectures: TopicLecture[];
  kibarItems?: RecommendationItem[];
  topicItems?: RecommendationItem[];
  kibarCursor?: string;
  topicCursor?: string;
  tabOverrides?: Tab[];
};

const DEFAULT_TOPIC_SLUGS = ["hadith", "fiqh", "mustalah"];

export function selectPreferredTopic(
  topics: TopicDetail[],
  preferredSlugs: string[] = DEFAULT_TOPIC_SLUGS,
): TopicDetail | null {
  return topics.find((topic) => preferredSlugs.includes(topic.slug)) ?? topics[0] ?? null;
}

export function buildHomeStats(scholars: Scholar[], lectureBuckets: Lecture[][]): Stats {
  const allLectures = lectureBuckets.flat();
  const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 30;

  return {
    totalScholars: scholars.length,
    totalLectures: allLectures.length,
    lecturesPublishedLast30Days: allLectures.filter((lecture) => {
      const dateString = lecture.publishedAt ?? lecture.createdAt;
      return dateString ? new Date(dateString).getTime() >= cutoff : false;
    }).length,
  };
}

export function buildHomeContent(context: HomeContentContext): {
  tabs: Tab[];
  leadLecture: { title: string; scholarName: string } | null;
} {
  const {
    scholars,
    scholarBundles,
    lectureBuckets,
    topicLectures,
    kibarItems: kibarOverride,
    topicItems: topicOverride,
    kibarCursor,
    topicCursor,
    tabOverrides,
  } = context;
  const scholarById = new Map<string, Scholar>(scholars.map((scholar) => [scholar.id, scholar]));
  const seriesIndex = new Map<string, Series>();

  scholarBundles.forEach((bundle) => {
    bundle.series.forEach((series) => seriesIndex.set(series.id, series));
  });

  const allLectures = lectureBuckets.flat();
  const lecturesWithScholars = allLectures
    .map((lecture) => ({
      lecture,
      scholar: scholarById.get(lecture.scholarId),
    }))
    .filter((entry): entry is { lecture: Lecture; scholar: Scholar } => Boolean(entry.scholar));

  const recentLectureEntries = [...lecturesWithScholars]
    .sort((a, b) =>
      (b.lecture.publishedAt ?? b.lecture.createdAt).localeCompare(
        a.lecture.publishedAt ?? a.lecture.createdAt,
      ),
    )
    .slice(0, 12);

  const buildLectureItem = (lecture: Lecture, scholar: Scholar): RecommendationItem => {
    const series = lecture.seriesId ? seriesIndex.get(lecture.seriesId) : undefined;
    const meta = lecture.durationSeconds
      ? formatDuration(lecture.durationSeconds)
      : (lecture.language ?? undefined);

    return {
      id: lecture.id,
      kind: "lecture",
      title: lecture.title,
      subtitle: scholar.name,
      href: `/lectures/${scholar.slug}/${lecture.slug}`,
      coverImageUrl: series?.coverImageUrl,
      lessonCount: 1,
      totalDurationSeconds: lecture.durationSeconds ?? undefined,
      meta,
    };
  };

  const buildSeriesItem = (series: Series, scholar: Scholar): RecommendationItem => ({
    id: series.id,
    kind: "series",
    title: series.title,
    subtitle: scholar.name,
    href: `/series/${scholar.slug}/${series.slug}`,
    coverImageUrl: series.coverImageUrl,
    meta: series.language ?? undefined,
  });

  const buildCollectionItem = (collection: Collection, scholar: Scholar): RecommendationItem => ({
    id: collection.id,
    kind: "collection",
    title: collection.title,
    subtitle: scholar.name,
    href: `/collections/${scholar.slug}/${collection.slug}`,
    coverImageUrl: collection.coverImageUrl,
    meta: collection.language ?? undefined,
  });

  const featuredBundle =
    scholarBundles.find(
      (bundle) =>
        bundle.lectures.length > 0 || bundle.series.length > 0 || bundle.collections.length > 0,
    ) ?? null;

  const kibarItems: RecommendationItem[] = kibarOverride?.length ? kibarOverride : [];

  if (kibarItems.length === 0) {
    if (featuredBundle?.lectures[0]) {
      kibarItems.push(buildLectureItem(featuredBundle.lectures[0], featuredBundle.scholar));
    }
    if (featuredBundle?.series[0]) {
      kibarItems.push(buildSeriesItem(featuredBundle.series[0], featuredBundle.scholar));
    }
    if (featuredBundle?.collections[0]) {
      kibarItems.push(buildCollectionItem(featuredBundle.collections[0], featuredBundle.scholar));
    }
  }

  const topicItems = topicOverride?.length
    ? topicOverride
    : (topicLectures
        .map((lecture) => {
          const scholar = scholarById.get(lecture.scholarId);
          if (!scholar) return null;

          const series = lecture.seriesId ? seriesIndex.get(lecture.seriesId) : undefined;
          const meta = lecture.durationSeconds
            ? formatDuration(lecture.durationSeconds)
            : (lecture.language ?? undefined);

          return {
            id: lecture.id,
            kind: "lecture",
            title: lecture.title,
            subtitle: scholar.name,
            href: `/lectures/${scholar.slug}/${lecture.slug}`,
            coverImageUrl: series?.coverImageUrl,
            lessonCount: 1,
            totalDurationSeconds: lecture.durationSeconds ?? undefined,
            meta,
          } satisfies RecommendationItem;
        })
        .filter((item) => item !== null) as RecommendationItem[]);

  const recentLectureItems = recentLectureEntries
    .map(({ lecture, scholar }) => buildLectureItem(lecture, scholar))
    .slice(0, 8);

  const popularLectureItems = recentLectureEntries
    .map(({ lecture, scholar }) => buildLectureItem(lecture, scholar))
    .slice(0, 6);

  const tabs: Tab[] =
    tabOverrides && tabOverrides.length > 0
      ? tabOverrides
      : [
          {
            id: "recommended",
            label: "Recommended",
            rows: [
              {
                id: "kibar",
                title: "Lessons by Senior Scholars",
                items: kibarItems,
                variant: "featured",
                cursor: kibarCursor,
                source: { kind: "recommended-kibar" },
              },
              {
                id: "topic",
                title: "Recommended topics",
                items: topicItems,
                cursor: topicCursor,
                source: { kind: "recommended-topics" },
                density: "tight",
              },
              {
                id: "recent-play",
                title: "Related to Recently Played Lectures",
                items: popularLectureItems,
                source: { kind: "recommended-recent-play" },
              },
            ],
          },
          {
            id: "following",
            label: "Following",
            rows: [
              {
                id: "following-scholars",
                title: "From your scholars",
                items: [],
                source: { kind: "following-scholars" },
              },
              {
                id: "following-topics",
                title: "Lessons on topics you follow",
                items: [],
                source: { kind: "following-topics" },
              },
            ],
          },
          {
            id: "latest",
            label: "Latest",
            rows: [
              {
                id: "latest-all",
                title: "Latest lessons",
                items: recentLectureItems,
                source: { kind: "latest" },
              },
            ],
          },
          {
            id: "popular",
            label: "Popular",
            rows: [
              {
                id: "popular-all",
                title: "Popular right now",
                items: popularLectureItems,
                source: { kind: "popular" },
              },
            ],
          },
        ];

  return {
    tabs,
    leadLecture:
      recentLectureEntries[0] != null
        ? {
            title: recentLectureEntries[0].lecture.title,
            scholarName: recentLectureEntries[0].scholar.name,
          }
        : null,
  };
}
