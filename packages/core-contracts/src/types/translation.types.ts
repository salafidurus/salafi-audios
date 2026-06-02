import type { Locale } from "./localization.types";

export type TranslationStatus = "draft" | "published";

export type TranslationViewDto = {
  locale: Locale;
  status: TranslationStatus;
  fields: Record<string, string | null>;
  createdAt: string;
  updatedAt: string;
};

export type SaveTranslationDto = {
  locale: Locale;
  fields: Record<string, string | null>;
};

export type TranslationTarget =
  | { entity: "scholar"; scholarId: string }
  | { entity: "lecture"; lectureId: string }
  | { entity: "topic"; topicId: string }
  | { entity: "series"; scholarId: string; seriesId: string }
  | { entity: "collection"; scholarId: string; collectionId: string };

export type UpdateLocaleDto = { preferredLanguage: Locale };
