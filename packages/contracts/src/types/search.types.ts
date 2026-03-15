import type { CollectionViewDto } from "@/types/collection.types";
import type { LectureViewDto } from "@/types/lecture.types";
import type { SeriesViewDto } from "@/types/series.types";

export type CatalogSearchParams = {
  q: string;
  limit?: number;
  language?: string;
  topicSlug?: string;
  scholarSlug?: string;
};

export type CatalogSearchResultsDto = {
  collections: CollectionViewDto[];
  series: SeriesViewDto[];
  lectures: LectureViewDto[];
};
