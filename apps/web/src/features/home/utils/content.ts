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
  const { scholars, scholarBundles, lectureBuckets, preferredTopic, topicLectures } = context;
  const scholarById = new Map<string, Scholar>(scholars.map((scholar) => [scholar.id, scholar]));
  const seriesIndex = new Map<string, Series>();

  scholarBundles.forEach((bundle) => {
    bundle.series.forEach((series) => seriesIndex.set(series.id, series));
  });

  const allLectures = lectureBuckets.flat();
  const allSeries = scholarBundles.flatMap((bundle) =>
    bundle.series.map((series) => ({ series, scholar: bundle.scholar })),
  );
  const allCollections = scholarBundles.flatMap((bundle) =>
    bundle.collections.map((collection) => ({ collection, scholar: bundle.scholar })),
  );

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

  const kibarItems: RecommendationItem[] = [];

  if (featuredBundle?.lectures[0]) {
    kibarItems.push(buildLectureItem(featuredBundle.lectures[0], featuredBundle.scholar));
  }
  if (featuredBundle?.series[0]) {
    kibarItems.push(buildSeriesItem(featuredBundle.series[0], featuredBundle.scholar));
  }
  if (featuredBundle?.collections[0]) {
    kibarItems.push(buildCollectionItem(featuredBundle.collections[0], featuredBundle.scholar));
  }

  const topicItems = topicLectures
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
        meta,
      } satisfies RecommendationItem;
    })
    .filter((item) => item !== null) as RecommendationItem[];

  const recentLectureItems = recentLectureEntries
    .map(({ lecture, scholar }) => buildLectureItem(lecture, scholar))
    .slice(0, 8);

  const popularLectureItems = recentLectureEntries
    .map(({ lecture, scholar }) => buildLectureItem(lecture, scholar))
    .slice(0, 6);

  const latestSeriesItems = [...allSeries]
    .sort((a, b) => b.series.createdAt.localeCompare(a.series.createdAt))
    .slice(0, 8)
    .map(({ series, scholar }) => buildSeriesItem(series, scholar));

  const latestCollectionItems = [...allCollections]
    .sort((a, b) => b.collection.createdAt.localeCompare(a.collection.createdAt))
    .slice(0, 8)
    .map(({ collection, scholar }) => buildCollectionItem(collection, scholar));

  const seriesHighlights = allSeries
    .slice(0, 8)
    .map(({ series, scholar }) => buildSeriesItem(series, scholar));

  const collectionHighlights = allCollections
    .slice(0, 8)
    .map(({ collection, scholar }) => buildCollectionItem(collection, scholar));

  const tabs: Tab[] = [
    {
      id: "home",
      label: "Home",
      rows: [
        {
          id: "kibar",
          title: "Recommended from Kibar ul-Ulama",
          items: kibarItems,
        },
        {
          id: "topic",
          title: preferredTopic ? `Recommended in ${preferredTopic.name}` : "Topic focus",
          items: topicItems,
        },
        {
          id: "popular",
          title: "Recommended by Popular Listening",
          items: popularLectureItems,
        },
      ],
    },
    {
      id: "latest",
      label: "Latest",
      rows: [
        {
          id: "latest-lectures",
          title: "Newly published lectures",
          items: recentLectureItems,
        },
        {
          id: "latest-series",
          title: "New series releases",
          items: latestSeriesItems,
        },
        {
          id: "latest-collections",
          title: "New collections",
          items: latestCollectionItems,
        },
      ],
    },
    {
      id: "trending",
      label: "Trending",
      rows: [
        {
          id: "trending-lectures",
          title: "Popular listening",
          items: popularLectureItems,
        },
        {
          id: "trending-series",
          title: "Series gaining momentum",
          items: seriesHighlights,
        },
        {
          id: "trending-collections",
          title: "Collections in focus",
          items: collectionHighlights,
        },
      ],
    },
    {
      id: "series",
      label: "Series",
      rows: [
        {
          id: "series-featured",
          title: "Featured series",
          items: seriesHighlights,
        },
        {
          id: "series-from-collections",
          title: "From curated collections",
          items: collectionHighlights,
        },
        {
          id: "series-lectures",
          title: "Lecture sequences",
          items: recentLectureItems,
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
