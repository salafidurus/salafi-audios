import { z } from "zod";
import { StatusValueSchema } from "./common.types";
import { ContentOriginalFieldsSchema, LocaleSchema } from "./localization.types";
import { TranslationViewDtoSchema } from "./translation.types";

/**
 * A **Listing** is any top-level, browsable content unit — the thing users
 * discover via search/feed and the scholar Catalog. Every Listing has one of
 * three formats:
 *
 *   - `collection` — a curated group of Series.
 *   - `series`     - a standalone Series (a course of Lessons).
 *   - `single`     - a standalone Lecture (a one-off talk).
 *
 * Nested content is never a Listing: a Series inside a Collection is a
 * **Module**, and a Lecture inside a Series/Module is a **Lesson**. Those are
 * surfaced only for grouping and progress, not as discovery entry points.
 *
 * See `docs/nomenclature.md` for the full two-axis model.
 */
export const ListingFormatSchema = z.enum(["collection", "series", "single"]);
export type ListingFormat = z.infer<typeof ListingFormatSchema>;

export const AudioAssetViewDtoSchema = z.object({
  id: z.string(),
  listingId: z.string(),
  url: z.string(),
  format: z.string().optional(),
  sizeBytes: z.number().optional(),
  durationSeconds: z.number().optional(),
  bitrateKbps: z.number().optional(),
  source: z.string().optional(),
  isPrimary: z.boolean().optional(),
  createdAt: z.string(),
});
export type AudioAssetViewDto = z.infer<typeof AudioAssetViewDtoSchema>;

export const ListingViewDtoSchema = z.object({
  id: z.string(),
  scholarId: z.string(),
  parentId: z.string().nullable().optional(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  format: ListingFormatSchema,
  coverImageUrl: z.string().optional(),
  publishedLectureCount: z.number().optional(),
  publishedDurationSeconds: z.number().optional(),
  language: LocaleSchema.optional(),
  status: StatusValueSchema,
  orderIndex: z.number().optional(),
  durationSeconds: z.number().optional(),
  primaryAudioAsset: AudioAssetViewDtoSchema.optional(),
  deletedAt: z.string().optional(),
  deleteAfterAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type ListingViewDto = z.infer<typeof ListingViewDtoSchema>;

export const ScholarRefDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  imageUrl: z.string().optional(),
});
export type ScholarRefDto = z.infer<typeof ScholarRefDtoSchema>;

export const TopicRefDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
});
export type TopicRefDto = z.infer<typeof TopicRefDtoSchema>;

export const AudioAssetDtoSchema = z.object({
  id: z.string(),
  url: z.string(),
  format: z.string().optional(),
  bitrateKbps: z.number().optional(),
  durationSeconds: z.number().optional(),
});
export type AudioAssetDto = z.infer<typeof AudioAssetDtoSchema>;

export const ListingRefDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
});
export type ListingRefDto = z.infer<typeof ListingRefDtoSchema>;

export const SeriesContextDtoSchema = z.object({
  seriesId: z.string(),
  seriesTitle: z.string(),
  seriesSlug: z.string(),
  prevLecture: ListingRefDtoSchema.nullable(),
  nextLecture: ListingRefDtoSchema.nullable(),
});
export type SeriesContextDto = z.infer<typeof SeriesContextDtoSchema>;

export const ListingDetailDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  format: ListingFormatSchema,
  language: LocaleSchema.optional(),
  /** Language the original (untranslated) fields are written in. */
  originalLanguage: LocaleSchema.optional(),
  /** Original-language fields, set only when `title`/`description` are translated. */
  original: ContentOriginalFieldsSchema.optional(),
  durationSeconds: z.number().optional(),
  publishedAt: z.string().optional(),
  scholar: ScholarRefDtoSchema,
  topics: z.array(TopicRefDtoSchema),
  primaryAudioAsset: AudioAssetDtoSchema.nullable(),
  seriesContext: SeriesContextDtoSchema.nullable(),
});
export type ListingDetailDto = z.infer<typeof ListingDetailDtoSchema>;

export const RelatedListingDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  originalLanguage: LocaleSchema.optional(),
  original: ContentOriginalFieldsSchema.optional(),
  durationSeconds: z.number().optional(),
  scholar: ScholarRefDtoSchema,
  primaryAudioAsset: AudioAssetDtoSchema.nullable(),
});
export type RelatedListingDto = z.infer<typeof RelatedListingDtoSchema>;

export const AdminListingUpdateDtoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  language: LocaleSchema.optional(),
  orderIndex: z.number().optional(),
  status: StatusValueSchema.optional(),
  translations: z
    .array(
      z.object({
        locale: LocaleSchema,
        title: z.string(),
        description: z.string().nullable().optional(),
      }),
    )
    .optional(),
});
export type AdminListingUpdateDto = z.infer<typeof AdminListingUpdateDtoSchema>;

export const AdminListingActionDtoSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type AdminListingActionDto = z.infer<typeof AdminListingActionDtoSchema>;

export const AdminListingListItemDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  scholarName: z.string(),
  format: ListingFormatSchema,
  status: StatusValueSchema,
  durationSeconds: z.number().optional(),
  orderIndex: z.number().optional(),
  createdAt: z.string(),
});
export type AdminListingListItemDto = z.infer<typeof AdminListingListItemDtoSchema>;

export const AdminListingListDtoSchema = z.object({
  items: z.array(AdminListingListItemDtoSchema),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});
export type AdminListingListDto = z.infer<typeof AdminListingListDtoSchema>;

export const AdminListingDetailDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  format: ListingFormatSchema,
  language: LocaleSchema.optional(),
  status: StatusValueSchema,
  orderIndex: z.number().optional(),
  durationSeconds: z.number().optional(),
  scholarId: z.string(),
  scholarName: z.string(),
  parentId: z.string().optional(),
  topics: z.array(z.string()),
  audioKey: z.string().optional(),
  audioUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type AdminListingDetailDto = z.infer<typeof AdminListingDetailDtoSchema>;

export const AdminListingFormatTransitionDtoSchema = z.object({
  format: ListingFormatSchema,
  childCount: z.number(),
  onlyChildLessonCount: z.number().optional(),
  canPromote: z.boolean(),
  demoteOptions: z.array(
    z.object({
      target: z.enum(["series", "single"]),
      allowed: z.boolean(),
      reason: z.string().optional(),
    }),
  ),
});
export type AdminListingFormatTransitionDto = z.infer<typeof AdminListingFormatTransitionDtoSchema>;

export const DemoteListingDtoSchema = z.object({
  target: z.enum(["series", "single"]),
});
export type DemoteListingDto = z.infer<typeof DemoteListingDtoSchema>;

export const BulkActionDtoSchema = z.object({
  action: z.enum(["publish", "archive"]),
  ids: z.array(z.string()),
});
export type BulkActionDto = z.infer<typeof BulkActionDtoSchema>;

export const BulkActionResultDtoSchema = z.object({
  succeeded: z.array(z.string()),
  failed: z.array(z.string()),
});
export type BulkActionResultDto = z.infer<typeof BulkActionResultDtoSchema>;

export const CreateListingDtoSchema = z.object({
  title: z.string().min(1, "Title must not be empty"),
  slug: z.string().optional(),
  format: ListingFormatSchema,
  scholarId: z.string().min(1, "Scholar ID must not be empty"),
  parentId: z.string().optional(),
  language: LocaleSchema.optional(),
  topics: z.array(z.string()).optional(),
  audioKey: z.string().optional(),
  durationSeconds: z.number().optional(),
  sizeBytes: z.number().optional(),
  translations: z
    .array(
      z.object({
        locale: LocaleSchema,
        title: z.string(),
        description: z.string().nullable().optional(),
      }),
    )
    .optional(),
});
export type CreateListingDto = z.infer<typeof CreateListingDtoSchema>;

export const ListingFormDataDtoSchema = z.object({
  listing: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string().optional(),
    format: ListingFormatSchema,
    language: LocaleSchema.optional(),
    status: StatusValueSchema,
    orderIndex: z.number().optional(),
    durationSeconds: z.number().optional(),
    scholarId: z.string(),
    scholarName: z.string(),
    parentId: z.string().optional(),
    topics: z.array(z.string()),
    audioUrl: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
  }),
  translations: z.array(TranslationViewDtoSchema),
});
export type ListingFormDataDto = z.infer<typeof ListingFormDataDtoSchema>;

export const SaveListingTranslationDtoSchema = z.object({
  locale: LocaleSchema,
  title: z.string().min(1, "Title must not be empty"),
  description: z.string().nullable().optional(),
});
export type SaveListingTranslationDto = z.infer<typeof SaveListingTranslationDtoSchema>;

export const UpdateListingTranslationDtoSchema = z.object({
  title: z.string().optional(),
  description: z.string().nullable().optional(),
});
export type UpdateListingTranslationDto = z.infer<typeof UpdateListingTranslationDtoSchema>;

export const ListingContentItemDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  durationSeconds: z.number().optional(),
  orderIndex: z.number().optional(),
  primaryAudioAsset: AudioAssetDtoSchema.nullable(),
});
export type ListingContentItemDto = z.infer<typeof ListingContentItemDtoSchema>;

export const ListingModuleDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  lessons: z.array(ListingContentItemDtoSchema),
});
export type ListingModuleDto = z.infer<typeof ListingModuleDtoSchema>;

export const ListingContentsDtoSchema = z.discriminatedUnion("format", [
  z.object({ format: z.literal("single"), items: z.array(ListingContentItemDtoSchema) }),
  z.object({ format: z.literal("series"), items: z.array(ListingContentItemDtoSchema) }),
  z.object({ format: z.literal("collection"), modules: z.array(ListingModuleDtoSchema) }),
]);
export type ListingContentsDto = z.infer<typeof ListingContentsDtoSchema>;

export const LastPlayedLessonDtoSchema = z.object({
  listingId: z.string(),
  positionSeconds: z.number(),
  isCompleted: z.boolean(),
  updatedAt: z.string(),
});
export type LastPlayedLessonDto = z.infer<typeof LastPlayedLessonDtoSchema>;
