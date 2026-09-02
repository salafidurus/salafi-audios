import { z } from "zod";

import { StatusValueSchema } from "./common.types";
import { ContentOriginalFieldsSchema, LocaleSchema } from "./localization.types";
import { ScholarTitleSchema } from "./scholar.types";
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
 * See `docs/content/nomenclature.md` for the full two-axis model.
 */
/** Defines the runtime contract value for listing format schema. */
export const ListingFormatSchema = z.enum(["collection", "series", "single"]);
/** Defines the contract type for listing format. */
export type ListingFormat = z.infer<typeof ListingFormatSchema>;

/** Defines the runtime contract value for audio asset view dto schema. */
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
/** Defines the contract type for audio asset view dto. */
export type AudioAssetViewDto = z.infer<typeof AudioAssetViewDtoSchema>;

/** Defines the runtime contract value for listing view dto schema. */
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
/** Defines the contract type for listing view dto. */
export type ListingViewDto = z.infer<typeof ListingViewDtoSchema>;

/** Defines the runtime contract value for scholar ref dto schema. */
export const ScholarRefDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  imageUrl: z.string().optional(),
  title: ScholarTitleSchema.optional(),
});
/** Defines the contract type for scholar ref dto. */
export type ScholarRefDto = z.infer<typeof ScholarRefDtoSchema>;

/** Defines the runtime contract value for topic ref dto schema. */
export const TopicRefDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
});
/** Defines the contract type for topic ref dto. */
export type TopicRefDto = z.infer<typeof TopicRefDtoSchema>;

/** Defines the runtime contract value for audio asset dto schema. */
export const AudioAssetDtoSchema = z.object({
  id: z.string(),
  url: z.string(),
  format: z.string().optional(),
  bitrateKbps: z.number().optional(),
  durationSeconds: z.number().optional(),
});
/** Defines the contract type for audio asset dto. */
export type AudioAssetDto = z.infer<typeof AudioAssetDtoSchema>;

/** Defines the runtime contract value for listing ref dto schema. */
export const ListingRefDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
});
/** Defines the contract type for listing ref dto. */
export type ListingRefDto = z.infer<typeof ListingRefDtoSchema>;

/** Defines the runtime contract value for series context dto schema. */
export const SeriesContextDtoSchema = z.object({
  seriesId: z.string(),
  seriesTitle: z.string(),
  seriesSlug: z.string(),
});
/** Defines the contract type for series context dto. */
export type SeriesContextDto = z.infer<typeof SeriesContextDtoSchema>;

/** The top-level Listing a nested Lesson/Module belongs to — null when the listing is already top-level. */
export const RootListingDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
});
/** Defines the contract type for root listing dto. */
export type RootListingDto = z.infer<typeof RootListingDtoSchema>;

/** Defines the runtime contract value for listing detail dto schema. */
export const ListingDetailDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  format: ListingFormatSchema,
  coverImageUrl: z.string().optional(),
  language: LocaleSchema.optional(),
  /** Language the original (untranslated) fields are written in. */
  originalLanguage: LocaleSchema.optional(),
  /** Original-language fields, set only when `title`/`description` are translated. */
  original: ContentOriginalFieldsSchema.optional(),
  durationSeconds: z.number().optional(),
  publishedLectureCount: z.number().optional(),
  publishedDurationSeconds: z.number().optional(),
  publishedAt: z.string().optional(),
  scholar: ScholarRefDtoSchema,
  topics: z.array(TopicRefDtoSchema),
  primaryAudioAsset: AudioAssetDtoSchema.nullable(),
  seriesContext: SeriesContextDtoSchema.nullable(),
  rootListing: RootListingDtoSchema.nullable(),
});
/** Defines the contract type for listing detail dto. */
export type ListingDetailDto = z.infer<typeof ListingDetailDtoSchema>;

/** Defines the runtime contract value for related listing dto schema. */
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
/** Defines the contract type for related listing dto. */
export type RelatedListingDto = z.infer<typeof RelatedListingDtoSchema>;

/** Defines the runtime contract value for admin listing action dto schema. */
export const AdminListingActionDtoSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
/** Defines the contract type for admin listing action dto. */
export type AdminListingActionDto = z.infer<typeof AdminListingActionDtoSchema>;

/** Defines the runtime contract value for admin listing list item dto schema. */
export const AdminListingListItemDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  coverImageUrl: z.string().optional(),
  scholarName: z.string(),
  scholarSlug: z.string(),
  format: ListingFormatSchema,
  status: StatusValueSchema,
  durationSeconds: z.number().optional(),
  orderIndex: z.number().optional(),
  createdAt: z.string(),
});
/** Defines the contract type for admin listing list item dto. */
export type AdminListingListItemDto = z.infer<typeof AdminListingListItemDtoSchema>;

/** Defines the runtime contract value for admin listing list dto schema. */
export const AdminListingListDtoSchema = z.object({
  items: z.array(AdminListingListItemDtoSchema),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});
/** Defines the contract type for admin listing list dto. */
export type AdminListingListDto = z.infer<typeof AdminListingListDtoSchema>;

/** Defines the runtime contract value for admin listing detail dto schema. */
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
  scholarSlug: z.string(),
  scholarName: z.string(),
  parentId: z.string().optional(),
  topics: z.array(z.string()),
  audioKey: z.string().optional(),
  audioUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
/** Defines the contract type for admin listing detail dto. */
export type AdminListingDetailDto = z.infer<typeof AdminListingDetailDtoSchema>;

/** Defines the runtime contract value for bulk action dto schema. */
export const BulkActionDtoSchema = z.object({
  action: z.enum(["publish", "archive"]),
  ids: z.array(z.string()),
});
/** Defines the contract type for bulk action dto. */
export type BulkActionDto = z.infer<typeof BulkActionDtoSchema>;

/** Defines the runtime contract value for bulk action result dto schema. */
export const BulkActionResultDtoSchema = z.object({
  succeeded: z.array(z.string()),
  failed: z.array(z.string()),
});
/** Defines the contract type for bulk action result dto. */
export type BulkActionResultDto = z.infer<typeof BulkActionResultDtoSchema>;

/** Defines the runtime contract value for create listing dto schema. */
export const CreateListingDtoSchema = z.object({
  title: z.string().min(1, "Title must not be empty"),
  slug: z.string().optional(),
  format: ListingFormatSchema,
  scholarId: z.string().min(1, "Scholar ID must not be empty"),
  parentId: z.string().optional(),
  language: LocaleSchema.optional(),
  status: StatusValueSchema.optional(),
  topics: z.array(z.string()).optional(),
  audioKey: z.string().optional(),
  durationSeconds: z.number().optional(),
  sizeBytes: z.number().optional(),
  coverImageUrl: z.string().optional(),
  coverImageKey: z.string().optional(),
});
/** Defines the contract type for create listing dto. */
export type CreateListingDto = z.infer<typeof CreateListingDtoSchema>;

/** Defines the runtime contract value for listing form data dto schema. */
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
    coverImageUrl: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
  }),
  translations: z.array(TranslationViewDtoSchema),
});
/** Defines the contract type for listing form data dto. */
export type ListingFormDataDto = z.infer<typeof ListingFormDataDtoSchema>;

/** Defines the runtime contract value for save listing translation dto schema. */
export const SaveListingTranslationDtoSchema = z.object({
  locale: LocaleSchema,
  title: z.string().min(1, "Title must not be empty"),
  description: z.string().nullable().optional(),
});
/** Defines the contract type for save listing translation dto. */
export type SaveListingTranslationDto = z.infer<typeof SaveListingTranslationDtoSchema>;

/** Defines the runtime contract value for update listing translation dto schema. */
export const UpdateListingTranslationDtoSchema = z.object({
  title: z.string().optional(),
  description: z.string().nullable().optional(),
});
/** Defines the contract type for update listing translation dto. */
export type UpdateListingTranslationDto = z.infer<typeof UpdateListingTranslationDtoSchema>;

/** Defines the runtime contract value for listing content item dto schema. */
export const ListingContentItemDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  durationSeconds: z.number().optional(),
  orderIndex: z.number().optional(),
  primaryAudioAsset: AudioAssetDtoSchema.nullable(),
});
/** Defines the contract type for listing content item dto. */
export type ListingContentItemDto = z.infer<typeof ListingContentItemDtoSchema>;

/** Defines the runtime contract value for listing module dto schema. */
export const ListingModuleDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  lessons: z.array(ListingContentItemDtoSchema),
});
/** Defines the contract type for listing module dto. */
export type ListingModuleDto = z.infer<typeof ListingModuleDtoSchema>;

/** Defines the runtime contract value for listing contents dto schema. */
export const ListingContentsDtoSchema = z.discriminatedUnion("format", [
  z.object({ format: z.literal("single"), items: z.array(ListingContentItemDtoSchema) }),
  z.object({ format: z.literal("series"), items: z.array(ListingContentItemDtoSchema) }),
  z.object({ format: z.literal("collection"), modules: z.array(ListingModuleDtoSchema) }),
]);
/** Defines the contract type for listing contents dto. */
export type ListingContentsDto = z.infer<typeof ListingContentsDtoSchema>;

/** Defines the runtime contract value for last played lesson dto schema. */
export const LastPlayedLessonDtoSchema = z.object({
  listingId: z.string(),
  listingSlug: z.string().optional(),
  positionSeconds: z.number(),
  isCompleted: z.boolean(),
  updatedAt: z.string(),
});
/** Defines the contract type for last played lesson dto. */
export type LastPlayedLessonDto = z.infer<typeof LastPlayedLessonDtoSchema>;

/**
 * Read-time aggregate of a user's progress across a Listing's playable leaves
 * (itself for a Single, its Lessons for a Series, or all Lessons across all
 * Modules for a Collection). Computed on demand from `UserListingProgress` —
 * not separately stored.
 */
export const ListingProgressSummaryDtoSchema = z.object({
  listingId: z.string(),
  listingSlug: z.string().optional(),
  format: ListingFormatSchema,
  totalCount: z.number(),
  completedCount: z.number(),
  percentComplete: z.number(),
  isCompleted: z.boolean(),
});
/** Defines the contract type for listing progress summary dto. */
export type ListingProgressSummaryDto = z.infer<typeof ListingProgressSummaryDtoSchema>;

/** Defines the runtime contract value for update listing details dto schema. */
export const UpdateListingDetailsDtoSchema = z.object({
  title: z.string().min(1, "Title must not be empty").optional(),
  description: z.string().optional(),
  language: LocaleSchema.optional(),
  orderIndex: z.number().optional(),
  status: StatusValueSchema.optional(),
  parentId: z.string().nullable().optional(),
  topics: z.array(z.string()).optional(),
  coverImageUrl: z.string().optional(),
  coverImageKey: z.string().optional(),
});

/** Defines the contract type for update listing details dto. */
export type UpdateListingDetailsDto = z.infer<typeof UpdateListingDetailsDtoSchema>;

/** Defines the runtime contract value for admin listing media detail dto schema. */
export const AdminListingMediaDetailDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  audioKey: z.string().optional(),
  audioUrl: z.string().optional(),
  durationSeconds: z.number().optional(),
  sizeBytes: z.number().optional(),
  format: ListingFormatSchema,
  orderIndex: z.number().optional(),
  audioAssets: z.array(AudioAssetDtoSchema).optional(),
});
/** Defines the contract type for admin listing media detail dto. */
export type AdminListingMediaDetailDto = z.infer<typeof AdminListingMediaDetailDtoSchema>;

/** Defines the runtime contract value for update listing media dto schema. */
export const UpdateListingMediaDtoSchema = z.object({
  audioKey: z.string().min(1, "Audio key is required").optional(),
  durationSeconds: z.number().optional(),
  sizeBytes: z.number().optional(),
  orderIndex: z.number().optional(),
});
/** Defines the contract type for update listing media dto. */
export type UpdateListingMediaDto = z.infer<typeof UpdateListingMediaDtoSchema>;

/** Defines the runtime contract value for admin arrange lesson dto schema. */
export const AdminArrangeLessonDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  status: StatusValueSchema,
  orderIndex: z.number().optional(),
  durationSeconds: z.number().optional(),
  hasAudio: z.boolean(),
});
/** Defines the contract type for admin arrange lesson dto. */
export type AdminArrangeLessonDto = z.infer<typeof AdminArrangeLessonDtoSchema>;

/** Defines the runtime contract value for admin arrange module dto schema. */
export const AdminArrangeModuleDtoSchema = AdminArrangeLessonDtoSchema.extend({
  lessons: z.array(AdminArrangeLessonDtoSchema),
});
/** Defines the contract type for admin arrange module dto. */
export type AdminArrangeModuleDto = z.infer<typeof AdminArrangeModuleDtoSchema>;

/** Defines the runtime contract value for admin arrange data dto schema. */
export const AdminArrangeDataDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  format: ListingFormatSchema,
  scholarId: z.string(),
  status: StatusValueSchema,
  audioUrl: z.string().optional(),
  modules: z.array(AdminArrangeModuleDtoSchema),
  lessons: z.array(AdminArrangeLessonDtoSchema),
});
/** Defines the contract type for admin arrange data dto. */
export type AdminArrangeDataDto = z.infer<typeof AdminArrangeDataDtoSchema>;

/** Defines the runtime contract value for arrange audio ref schema. */
export const ArrangeAudioRefSchema = z.object({
  objectKey: z.string().min(1, "Object key must not be empty"),
  durationSeconds: z.number().int().nonnegative(),
  sizeBytes: z.number().int().nonnegative().optional(),
  format: z.string().optional(),
});
/** Defines the contract type for arrange audio ref. */
export type ArrangeAudioRef = z.infer<typeof ArrangeAudioRefSchema>;

/** Defines the runtime contract value for arrange lesson op schema. */
export const ArrangeLessonOpSchema = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("create"),
    slug: z.string().min(1, "Slug must not be empty"),
    title: z.string().min(1, "Title must not be empty"),
    description: z.string().optional(),
    status: StatusValueSchema.optional(),
    orderIndex: z.number().int().optional(),
    audio: ArrangeAudioRefSchema,
  }),
  z.object({
    op: z.literal("update"),
    id: z.string().min(1),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: StatusValueSchema.optional(),
    orderIndex: z.number().int().optional(),
    audio: ArrangeAudioRefSchema.optional(),
  }),
]);
/** Defines the contract type for arrange lesson op. */
export type ArrangeLessonOp = z.infer<typeof ArrangeLessonOpSchema>;

/** Defines the runtime contract value for arrange module op schema. */
export const ArrangeModuleOpSchema = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("create"),
    slug: z.string().min(1, "Slug must not be empty"),
    title: z.string().min(1, "Title must not be empty"),
    description: z.string().optional(),
    status: StatusValueSchema.optional(),
    orderIndex: z.number().int().optional(),
    lessons: z.array(ArrangeLessonOpSchema),
  }),
  z.object({
    op: z.literal("update"),
    id: z.string().min(1),
    orderIndex: z.number().int().optional(),
    lessons: z.array(ArrangeLessonOpSchema),
  }),
]);
/** Defines the contract type for arrange module op. */
export type ArrangeModuleOp = z.infer<typeof ArrangeModuleOpSchema>;

/** Defines the runtime contract value for arrange commit dto schema. */
export const ArrangeCommitDtoSchema = z
  .object({
    lessons: z.array(ArrangeLessonOpSchema).optional(),
    modules: z.array(ArrangeModuleOpSchema).optional(),
  })
  .refine((dto) => (dto.lessons === undefined) !== (dto.modules === undefined), {
    message: "Provide exactly one of lessons or modules",
  });
/** Defines the contract type for arrange commit dto. */
export type ArrangeCommitDto = z.infer<typeof ArrangeCommitDtoSchema>;

/** Defines the runtime contract value for arrange commit result dto schema. */
export const ArrangeCommitResultDtoSchema = z.object({
  createdModules: z.number(),
  createdLessons: z.number(),
  updatedModules: z.number(),
  updatedLessons: z.number(),
});
/** Defines the contract type for arrange commit result dto. */
export type ArrangeCommitResultDto = z.infer<typeof ArrangeCommitResultDtoSchema>;
