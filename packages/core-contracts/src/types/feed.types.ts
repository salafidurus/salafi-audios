import type { ScholarChipDto, ContentSuggestionDto } from "./home.types";
import type { ContentOriginalFields, Locale } from "./localization.types";

export type FeedContentItemDto = {
  kind: "lecture" | "series" | "collection";
  id: string;
  title: string;
  slug: string;
  scholarName: string;
  scholarSlug: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  publishedAt: string;
  originalLanguage?: Locale;
  original?: ContentOriginalFields;
};

export type FeedScholarRowDto = {
  kind: "scholar_row";
  scholars: ScholarChipDto[];
};

export type FeedTopicRowDto = {
  kind: "topic_row";
  topicName: string;
  items: ContentSuggestionDto[];
};

export type FeedItemDto = FeedContentItemDto | FeedScholarRowDto | FeedTopicRowDto;

export type FeedPageDto = {
  items: FeedItemDto[];
  nextCursor?: string;
};
