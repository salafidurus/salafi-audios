import { getWebEnv } from "@/shared/utils/env";
import type {
  Collection,
  Lecture,
  Scholar,
  Series,
  TopicDetail,
  TopicLecture,
} from "@/features/library/types/library.types";

export type RecommendationHeroItem = {
  kind: "series" | "collection" | "lecture";
  entityId: string;
  entitySlug: string;
  headline: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  lessonCount?: number;
  totalDurationSeconds?: number;
  presentedBy: string;
  presentedBySlug?: string;
  workAuthor?: string;
};

export type RecommendationItem = {
  kind: "series" | "collection" | "lecture";
  entityId: string;
  entitySlug: string;
  title: string;
  coverImageUrl?: string;
  lessonCount?: number;
  totalDurationSeconds?: number;
  scholarName: string;
  scholarSlug?: string;
};

export type RecommendationPage = {
  items: RecommendationItem[];
  nextCursor?: string;
};

const PUBLIC_REVALIDATE_SECONDS = 120;

type RequestOptions = {
  cache?: RequestCache;
  revalidateSeconds?: number;
};

export class PublicApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function requestPublic<T>(path: string, options?: RequestOptions): Promise<T> {
  const base = getWebEnv().NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  const revalidateSeconds = options?.revalidateSeconds ?? PUBLIC_REVALIDATE_SECONDS;

  const response = await fetch(`${base}${path}`, {
    ...(options?.cache ? { cache: options.cache } : { next: { revalidate: revalidateSeconds } }),
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new PublicApiError(response.status, message);
  }

  return (await response.json()) as T;
}

export const publicApi = {
  listRecommendationHero: (limit?: number, options?: RequestOptions) =>
    requestPublic<RecommendationHeroItem[]>(
      `/recommendations/hero${typeof limit === "number" ? `?limit=${limit}` : ""}`,
      options,
    ),
  listRecommendationKibar: (limit?: number, cursor?: string, options?: RequestOptions) =>
    requestPublic<RecommendationPage>(
      `/recommendations/kibar${buildPageQuery(limit, cursor)}`,
      options,
    ),
  listRecommendationTopic: (
    topicSlug: string,
    limit?: number,
    cursor?: string,
    options?: RequestOptions,
  ) =>
    requestPublic<RecommendationPage>(
      `/recommendations/topics/${topicSlug}${buildPageQuery(limit, cursor)}`,
      options,
    ),
  listScholars: (options?: RequestOptions) => requestPublic<Scholar[]>("/scholars", options),
  getScholar: (scholarSlug: string, options?: RequestOptions) =>
    requestPublic<Scholar>(`/scholars/${scholarSlug}`, options),
  listScholarCollections: (scholarSlug: string, options?: RequestOptions) =>
    requestPublic<Collection[]>(`/scholars/${scholarSlug}/collections`, options),
  getScholarCollection: (scholarSlug: string, collectionSlug: string, options?: RequestOptions) =>
    requestPublic<Collection>(`/scholars/${scholarSlug}/collections/${collectionSlug}`, options),
  listScholarSeries: (scholarSlug: string, options?: RequestOptions) =>
    requestPublic<Series[]>(`/scholars/${scholarSlug}/series`, options),
  getScholarSeries: (scholarSlug: string, seriesSlug: string, options?: RequestOptions) =>
    requestPublic<Series>(`/scholars/${scholarSlug}/series/${seriesSlug}`, options),
  listScholarLectures: (scholarSlug: string, options?: RequestOptions) =>
    requestPublic<Lecture[]>(`/scholars/${scholarSlug}/lectures`, options),
  listCollectionSeries: (scholarSlug: string, collectionSlug: string, options?: RequestOptions) =>
    requestPublic<Series[]>(
      `/scholars/${scholarSlug}/collections/${collectionSlug}/series`,
      options,
    ),
  listSeriesLectures: (scholarSlug: string, seriesSlug: string, options?: RequestOptions) =>
    requestPublic<Lecture[]>(`/scholars/${scholarSlug}/series/${seriesSlug}/lectures`, options),
  getScholarLecture: (scholarSlug: string, lectureSlug: string, options?: RequestOptions) =>
    requestPublic<Lecture>(`/scholars/${scholarSlug}/lectures/${lectureSlug}`, options),
  listTopics: (options?: RequestOptions) => requestPublic<TopicDetail[]>("/topics", options),
  listTopicLectures: (topicSlug: string, limit?: number, options?: RequestOptions) =>
    requestPublic<TopicLecture[]>(
      `/topics/${topicSlug}/lectures${typeof limit === "number" ? `?limit=${limit}` : ""}`,
      options,
    ),
};

function buildPageQuery(limit?: number, cursor?: string) {
  const params = new URLSearchParams();
  if (typeof limit === "number") params.set("limit", String(limit));
  if (cursor) params.set("cursor", cursor);
  const query = params.toString();
  return query ? `?${query}` : "";
}
