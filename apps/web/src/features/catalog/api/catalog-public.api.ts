import { webEnv } from "@/shared/utils/env";
import type { Collection, Lecture, Scholar, Series } from "@/features/catalog/types/catalog.types";

const CATALOG_REVALIDATE_SECONDS = 120;

export class CatalogApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function requestCatalog<T>(path: string): Promise<T> {
  const base = webEnv.NEXT_PUBLIC_API_URL.replace(/\/$/, "");

  const response = await fetch(`${base}${path}`, {
    next: { revalidate: CATALOG_REVALIDATE_SECONDS },
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new CatalogApiError(response.status, message);
  }

  return (await response.json()) as T;
}

export const catalogApi = {
  listScholars: () => requestCatalog<Scholar[]>("/scholars"),
  getScholar: (scholarSlug: string) => requestCatalog<Scholar>(`/scholars/${scholarSlug}`),
  listScholarCollections: (scholarSlug: string) =>
    requestCatalog<Collection[]>(`/scholars/${scholarSlug}/collections`),
  getScholarCollection: (scholarSlug: string, collectionSlug: string) =>
    requestCatalog<Collection>(`/scholars/${scholarSlug}/collections/${collectionSlug}`),
  listScholarSeries: (scholarSlug: string) =>
    requestCatalog<Series[]>(`/scholars/${scholarSlug}/series`),
  getScholarSeries: (scholarSlug: string, seriesSlug: string) =>
    requestCatalog<Series>(`/scholars/${scholarSlug}/series/${seriesSlug}`),
  listCollectionSeries: (scholarSlug: string, collectionSlug: string) =>
    requestCatalog<Series[]>(`/scholars/${scholarSlug}/collections/${collectionSlug}/series`),
  listSeriesLectures: (scholarSlug: string, seriesSlug: string) =>
    requestCatalog<Lecture[]>(`/scholars/${scholarSlug}/series/${seriesSlug}/lectures`),
  getScholarLecture: (scholarSlug: string, lectureSlug: string) =>
    requestCatalog<Lecture>(`/scholars/${scholarSlug}/lectures/${lectureSlug}`),
};
