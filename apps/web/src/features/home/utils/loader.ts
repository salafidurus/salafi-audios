import { publicApi } from "@/features/home/api/public-api";
import type {
  RecommendationHeroItem,
  RecommendationItem as ApiRecommendationItem,
  RecommendationPage,
} from "@/features/home/api/public-api";
import type { RecommendationItem, Stats, Tab } from "@/features/home/types/home.types";
import type { Lecture, Scholar, TopicDetail } from "@/features/library/types/library.types";
import { buildHomeStats } from "@/features/home/utils/content";

const noStore = { cache: "no-store" as const };

// Intentionally tolerate missing NEXT_PUBLIC_API_URL in CI build environments.
const safe = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await fn();
  } catch {
    return fallback;
  }
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

export async function loadHomeHeroItems(): Promise<RecommendationHeroItem[]> {
  return safe(() => publicApi.listRecommendationHero(), []);
}

export async function loadHomeSeniorScholars(): Promise<Scholar[]> {
  const scholars = await safe(() => publicApi.listScholars(), []);
  return scholars
    .filter((scholar) => {
      const isKibar = (scholar as { isKibar?: boolean }).isKibar;
      return scholar.isActive && Boolean(isKibar);
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function loadHomeTabs(): Promise<Tab[]> {
  const topics = await safe(() => publicApi.listTopics(), []);
  const kibarPage = await safe<RecommendationPage>(() => publicApi.listRecommendedKibar(8), {
    items: [],
  });
  const recentPlayPage = await safe<RecommendationPage>(
    () => publicApi.listRecommendedRecentPlay(8),
    { items: [] },
  );
  const topicCandidates = [...topics];

  for (let i = topicCandidates.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [topicCandidates[i], topicCandidates[j]] = [topicCandidates[j], topicCandidates[i]];
  }

  const selectedTopics = topicCandidates.slice(0, 2);
  const topicPages = await Promise.all(
    selectedTopics.map((topic) =>
      safe<RecommendationPage>(() => publicApi.listRecommendedTopics(topic.slug, 8), { items: [] }),
    ),
  );
  const latestPage = await safe<RecommendationPage>(() => publicApi.listLatest(8), { items: [] });
  const popularPage = await safe<RecommendationPage>(() => publicApi.listPopular(8), { items: [] });
  const latestTopicSelection = pickTopicSelections(topics, ["fiqh", "tawhid", "hadith"], 3);
  const popularTopicSelection = pickTopicSelections(topics, ["fiqh", "tawhid", "hadith"], 3);
  const latestTopicPages = await Promise.all(
    latestTopicSelection.map((topic) =>
      safe<RecommendationPage>(() => publicApi.listLatestTopics(topic.slug, 8), { items: [] }),
    ),
  );
  const popularTopicPages = await Promise.all(
    popularTopicSelection.map((topic) =>
      safe<RecommendationPage>(() => publicApi.listPopularTopics(topic.slug, 8), { items: [] }),
    ),
  );

  const mappedKibar = mapRecommendationPage(kibarPage);
  const mappedTopics = topicPages.map(mapRecommendationPage);
  const mappedRecentPlay = mapRecommendationPage(recentPlayPage);
  const mappedLatest = mapRecommendationPage(latestPage);
  const mappedPopular = mapRecommendationPage(popularPage);
  const mappedLatestTopics = latestTopicPages.map(mapRecommendationPage);
  const mappedPopularTopics = popularTopicPages.map(mapRecommendationPage);

  const topicRows: Tab["rows"] = selectedTopics.map((topic, index) => {
    const mapped = mappedTopics[index] ?? { items: [], nextCursor: undefined };
    return {
      id: `topic-${topic.slug}`,
      title: buildTopicRowTitle(topic),
      items: mapped.items,
      cursor: mapped.nextCursor,
      source: { kind: "recommended-topics", topicsCsv: topic.slug },
      density: "tight",
    };
  });

  if (topicRows.length === 0) {
    topicRows.push({
      id: "topic-generic",
      title: "Recommended topics",
      items: [],
      source: { kind: "recommended-topics" },
      density: "tight",
    });
  }

  return [
    {
      id: "recommended",
      label: "Recommended",
      rows: [
        {
          id: "kibar",
          title: "Lessons by Senior Scholars",
          items: mappedKibar.items,
          variant: "featured",
          cursor: mappedKibar.nextCursor,
          source: { kind: "recommended-kibar" },
        },
        ...topicRows,
        {
          id: "recent-play",
          title: "Related to Recently Played Lectures",
          items: mappedRecentPlay.items,
          cursor: mappedRecentPlay.nextCursor,
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
          items: mappedLatest.items,
          variant: "featured",
          cursor: mappedLatest.nextCursor,
          source: { kind: "latest" },
        },
        ...latestTopicSelection.map((topic: TopicDetail, index: number) => ({
          id: `latest-${topic.slug}`,
          title: buildLatestTopicRowTitle(topic),
          items: mappedLatestTopics[index]?.items?.length
            ? mappedLatestTopics[index].items
            : mappedLatest.items,
          cursor: mappedLatestTopics[index]?.nextCursor ?? mappedLatest.nextCursor,
          source: { kind: "latest-topics", topicsCsv: topic.slug } as const,
          density: "tight" as const,
        })),
      ],
    },
    {
      id: "popular",
      label: "Popular",
      rows: [
        {
          id: "popular-all",
          title: "Popular right now",
          items: mappedPopular.items,
          variant: "featured",
          cursor: mappedPopular.nextCursor,
          source: { kind: "popular" },
        },
        ...popularTopicSelection.map((topic: TopicDetail, index: number) => ({
          id: `popular-${topic.slug}`,
          title: buildPopularTopicRowTitle(topic),
          items: mappedPopularTopics[index]?.items?.length
            ? mappedPopularTopics[index].items
            : mappedPopular.items,
          cursor: mappedPopularTopics[index]?.nextCursor ?? mappedPopular.nextCursor,
          source: { kind: "popular-topics", topicsCsv: topic.slug } as const,
          density: "tight" as const,
        })),
      ],
    },
  ];
}

export async function loadHomeStatsAndLeadLecture(): Promise<{
  stats: Stats;
  leadLecture: { title: string; scholarName: string } | null;
}> {
  const scholars = await safe(() => publicApi.listScholars(noStore), []);
  const lectureBuckets = await Promise.all(
    scholars.map((scholar) => safe(() => publicApi.listScholarLectures(scholar.slug, noStore), [])),
  );
  const stats = buildHomeStats(scholars, lectureBuckets);
  const leadLecture = buildLeadLecture(scholars, lectureBuckets);

  return {
    stats,
    leadLecture,
  };
}

function buildLeadLecture(
  scholars: Scholar[],
  lectureBuckets: Lecture[][],
): { title: string; scholarName: string } | null {
  const scholarById = new Map<string, Scholar>(scholars.map((scholar) => [scholar.id, scholar]));
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
    .slice(0, 1);

  return recentLectureEntries[0]
    ? {
        title: recentLectureEntries[0].lecture.title,
        scholarName: recentLectureEntries[0].scholar.name,
      }
    : null;
}

function buildTopicRowTitle(topic: TopicDetail): string {
  const slug = topic.slug.toLowerCase();
  const name = topic.name;
  const normalizedName = name.toLowerCase();

  if (slug.includes("hadith")) return "Books of Hadith";
  if (slug.includes("fiqh")) return "Classes on Fiqh";
  if (slug.includes("nahw") || normalizedName.includes("nahw")) {
    return "Lessons on Arabic Grammar (Nahw)";
  }
  if (slug.includes("tawheed") || slug.includes("tawhid") || normalizedName.includes("tawheed")) {
    return "Learning Tawheed";
  }

  return `Lessons on ${name}`;
}

function buildLatestTopicRowTitle(topic: TopicDetail): string {
  const slug = topic.slug.toLowerCase();
  const name = topic.name;
  if (slug.includes("fiqh")) return "Latest Lessons in Fiqh";
  if (slug.includes("tawheed") || slug.includes("tawhid")) {
    return "Recently Added Lessons in Tawhid";
  }
  return `Latest Lessons on ${name}`;
}

function buildPopularTopicRowTitle(topic: TopicDetail): string {
  const slug = topic.slug.toLowerCase();
  const name = topic.name;
  if (slug.includes("fiqh")) return "Popular Lessons in Fiqh";
  if (slug.includes("tawheed") || slug.includes("tawhid")) return "Popular Lessons in Tawhid";
  return `Popular Lessons on ${name}`;
}

function pickTopicSelections(
  topics: TopicDetail[],
  preferredSlugs: string[],
  limit: number,
): TopicDetail[] {
  const normalized = preferredSlugs.map((slug) => slug.toLowerCase());
  const preferred = topics.filter((topic) => normalized.includes(topic.slug.toLowerCase()));
  const pool = preferred.length > 0 ? preferred : topics;
  const shuffled = [...pool];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, limit);
}
