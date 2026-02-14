import { getWebEnv } from "@/shared/utils/env";
import type {
  Collection,
  Lecture,
  Scholar,
  Series,
  TopicDetail,
  TopicLecture,
} from "@/features/library/types/library.types";

export type FeaturedItem = {
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
};

const PUBLIC_REVALIDATE_SECONDS = 120;

export class PublicApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function requestPublic<T>(path: string): Promise<T> {
  const base = getWebEnv().NEXT_PUBLIC_API_URL.replace(/\/$/, "");

  const response = await fetch(`${base}${path}`, {
    next: { revalidate: PUBLIC_REVALIDATE_SECONDS },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new PublicApiError(response.status, message);
  }

  return (await response.json()) as T;
}

export const publicApi = {
  listFeatured: () => requestPublic<FeaturedItem[]>("/catalog/featured"),
  listScholars: () => requestPublic<Scholar[]>("/scholars"),
  getScholar: (scholarSlug: string) => requestPublic<Scholar>(`/scholars/${scholarSlug}`),
  listScholarCollections: (scholarSlug: string) =>
    requestPublic<Collection[]>(`/scholars/${scholarSlug}/collections`),
  getScholarCollection: (scholarSlug: string, collectionSlug: string) =>
    requestPublic<Collection>(`/scholars/${scholarSlug}/collections/${collectionSlug}`),
  listScholarSeries: (scholarSlug: string) =>
    requestPublic<Series[]>(`/scholars/${scholarSlug}/series`),
  getScholarSeries: (scholarSlug: string, seriesSlug: string) =>
    requestPublic<Series>(`/scholars/${scholarSlug}/series/${seriesSlug}`),
  listScholarLectures: (scholarSlug: string) =>
    requestPublic<Lecture[]>(`/scholars/${scholarSlug}/lectures`),
  listCollectionSeries: (scholarSlug: string, collectionSlug: string) =>
    requestPublic<Series[]>(`/scholars/${scholarSlug}/collections/${collectionSlug}/series`),
  listSeriesLectures: (scholarSlug: string, seriesSlug: string) =>
    requestPublic<Lecture[]>(`/scholars/${scholarSlug}/series/${seriesSlug}/lectures`),
  getScholarLecture: (scholarSlug: string, lectureSlug: string) =>
    requestPublic<Lecture>(`/scholars/${scholarSlug}/lectures/${lectureSlug}`),
  listTopics: () => requestPublic<TopicDetail[]>("/topics"),
  listTopicLectures: (topicSlug: string, limit?: number) =>
    requestPublic<TopicLecture[]>(
      `/topics/${topicSlug}/lectures${typeof limit === "number" ? `?limit=${limit}` : ""}`,
    ),
};
