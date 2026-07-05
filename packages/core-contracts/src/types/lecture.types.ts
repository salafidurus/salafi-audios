import { z } from "zod";
import { StatusValueSchema } from "./common.types";
import { ContentOriginalFieldsSchema, LocaleSchema } from "./localization.types";

export const AudioAssetViewDtoSchema = z.object({
  id: z.string(),
  lectureId: z.string(),
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

export const LectureViewDtoSchema = z.object({
  id: z.string(),
  scholarId: z.string(),
  seriesId: z.string().optional(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  language: LocaleSchema.optional(),
  status: StatusValueSchema,
  publishedAt: z.string().optional(),
  orderIndex: z.number().optional(),
  durationSeconds: z.number().optional(),
  primaryAudioAsset: AudioAssetViewDtoSchema.optional(),
  deletedAt: z.string().optional(),
  deleteAfterAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type LectureViewDto = z.infer<typeof LectureViewDtoSchema>;

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

export const LectureRefDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
});
export type LectureRefDto = z.infer<typeof LectureRefDtoSchema>;

export const SeriesContextDtoSchema = z.object({
  seriesId: z.string(),
  seriesTitle: z.string(),
  seriesSlug: z.string(),
  prevLecture: LectureRefDtoSchema.nullable(),
  nextLecture: LectureRefDtoSchema.nullable(),
});
export type SeriesContextDto = z.infer<typeof SeriesContextDtoSchema>;

export const LectureDetailDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
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
export type LectureDetailDto = z.infer<typeof LectureDetailDtoSchema>;

export const RelatedLectureDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  originalLanguage: LocaleSchema.optional(),
  original: ContentOriginalFieldsSchema.optional(),
  durationSeconds: z.number().optional(),
  scholar: ScholarRefDtoSchema,
  primaryAudioAsset: AudioAssetDtoSchema.nullable(),
});
export type RelatedLectureDto = z.infer<typeof RelatedLectureDtoSchema>;

export const AdminLectureUpdateDtoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  language: LocaleSchema.optional(),
  orderIndex: z.number().optional(),
  status: StatusValueSchema.optional(),
});
export type AdminLectureUpdateDto = z.infer<typeof AdminLectureUpdateDtoSchema>;

export const AdminLectureActionDtoSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type AdminLectureActionDto = z.infer<typeof AdminLectureActionDtoSchema>;

export const AdminLectureListItemDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  scholarName: z.string(),
  status: StatusValueSchema,
  durationSeconds: z.number().optional(),
  orderIndex: z.number().optional(),
  createdAt: z.string(),
});
export type AdminLectureListItemDto = z.infer<typeof AdminLectureListItemDtoSchema>;

export const AdminLectureListDtoSchema = z.object({
  items: z.array(AdminLectureListItemDtoSchema),
  total: z.number(),
  page: z.number(),
});
export type AdminLectureListDto = z.infer<typeof AdminLectureListDtoSchema>;

export const AdminLectureDetailDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  language: z.string().optional(),
  status: StatusValueSchema,
  orderIndex: z.number().optional(),
  durationSeconds: z.number().optional(),
  scholarId: z.string(),
  scholarName: z.string(),
  seriesId: z.string().optional(),
  topics: z.array(z.string()),
  audioKey: z.string().optional(),
  audioUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type AdminLectureDetailDto = z.infer<typeof AdminLectureDetailDtoSchema>;

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

export const CreateLectureDtoSchema = z.object({
  title: z.string().min(1, "Title must not be empty"),
  slug: z.string().optional(),
  scholarId: z.string().min(1, "Scholar ID must not be empty"),
  seriesId: z.string().optional(),
  topics: z.array(z.string()).optional(),
  audioKey: z.string().min(1, "Audio key must not be empty"),
  format: z.string().optional(),
  durationSeconds: z.number().optional(),
  sizeBytes: z.number().optional(),
});
export type CreateLectureDto = z.infer<typeof CreateLectureDtoSchema>;

export const SaveLectureTranslationDtoSchema = z.object({
  locale: LocaleSchema,
  title: z.string().min(1, "Title must not be empty"),
  description: z.string().nullable().optional(),
});
export type SaveLectureTranslationDto = z.infer<typeof SaveLectureTranslationDtoSchema>;

export const UpdateLectureTranslationDtoSchema = z.object({
  title: z.string().optional(),
  description: z.string().nullable().optional(),
});
export type UpdateLectureTranslationDto = z.infer<typeof UpdateLectureTranslationDtoSchema>;
